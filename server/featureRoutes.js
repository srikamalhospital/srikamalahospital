const { deductPharmacyStock } = require('./stockDeduction');

const LAB_STATUSES = ['submitted', 'sample_received', 'processing', 'report_ready'];

function registerFeatureRoutes(app, ctx) {
    const { supabase, getSiteConfig, setSiteConfig, requireAdmin, normalizePharmacyOrder, pharmacyOrdersMemory } = ctx;
    const cfg = () => (typeof getSiteConfig === 'function' ? getSiteConfig() : {});
    const reviewsMemory = [];
    const labReportsMemory = [];

    const persistConfig = async (config) => {
        setSiteConfig(config);
        if (!supabase) return;
        const row = {
            show_core_services: config.showCoreServices,
            show_health_awareness: config.showHealthAwareness,
            allow_online_payment: config.allowOnlinePayment,
            hospital_phone: config.hospitalPhone,
            diagnostics_phone: config.diagnosticsPhone,
            op_timings: config.opTimings,
            hospital_address: config.hospitalAddress,
            website_url: config.websiteUrl,
            website_domain: config.websiteDomain,
            contact_email: config.contactEmail,
            doctor_schedule: config.doctorSchedule || {},
        };
        const { error } = await supabase.from('site_config').upsert({ id: 1, ...row });
        if (error && error.code !== '42P01') console.warn('site_config save:', error.message);
    };

    app.get('/api/config', async (req, res) => {
        if (supabase) {
            const { data } = await supabase.from('site_config').select('*').eq('id', 1).maybeSingle();
            if (data) {
                const loaded = {
                    showCoreServices: data.show_core_services,
                    showHealthAwareness: data.show_health_awareness,
                    allowOnlinePayment: data.allow_online_payment,
                    hospitalPhone: data.hospital_phone,
                    diagnosticsPhone: data.diagnostics_phone,
                    opTimings: data.op_timings,
                    hospitalAddress: data.hospital_address,
                    websiteUrl: data.website_url,
                    websiteDomain: data.website_domain,
                    contactEmail: data.contact_email,
                    doctorSchedule: data.doctor_schedule || cfg().doctorSchedule,
                };
                setSiteConfig({ ...cfg(), ...loaded });
            }
        }
        return res.json({ success: true, config: cfg() });
    });

    app.post('/api/config', requireAdmin, async (req, res) => {
        const next = { ...cfg(), ...req.body };
        await persistConfig(next);
        return res.json({ success: true, config: cfg() });
    });

    // ─── Reviews ───────────────────────────────────────────────────────────
    app.get('/api/reviews', async (req, res) => {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('patient_reviews')
                    .select('*')
                    .eq('approved', true)
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (!error && data) {
                    return res.json({
                        success: true,
                        reviews: data.map((r) => ({
                            id: r.id,
                            name: r.patient_name,
                            role: r.visit_type || 'Patient',
                            text: r.review_text,
                            rating: r.rating || 5,
                        })),
                    });
                }
            }
            return res.json({ success: true, reviews: reviewsMemory.filter((r) => r.approved) });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    app.post('/api/reviews', async (req, res) => {
        try {
            const { name, phone, visitType, text, rating } = req.body || {};
            if (!name?.trim() || !text?.trim()) {
                return res.status(400).json({ success: false, message: 'Name and review text required' });
            }
            const row = {
                patient_name: name.trim(),
                phone: (phone || '').trim(),
                visit_type: (visitType || 'General').trim(),
                review_text: text.trim(),
                rating: Math.min(5, Math.max(1, Number(rating) || 5)),
                approved: false,
            };
            if (supabase) {
                const { data, error } = await supabase.from('patient_reviews').insert(row).select().maybeSingle();
                if (error && error.code !== '42P01') throw error;
                if (data) {
                    return res.json({
                        success: true,
                        message: 'Thank you. Your review will appear after hospital approval.',
                    });
                }
            }
            reviewsMemory.unshift({ ...row, id: `mem_${Date.now()}`, patient_name: row.patient_name });
            return res.json({
                success: true,
                message: 'Thank you. Your review will appear after hospital approval.',
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
        try {
            if (supabase) {
                const { data, error } = await supabase.from('patient_reviews').select('*').order('created_at', { ascending: false }).limit(200);
                if (!error) return res.json({ success: true, reviews: data || [] });
            }
            return res.json({ success: true, reviews: reviewsMemory });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    app.patch('/api/admin/reviews', requireAdmin, async (req, res) => {
        try {
            const { id, approved } = req.body || {};
            if (!id) return res.status(400).json({ success: false, message: 'id required' });
            if (supabase) {
                const { data, error } = await supabase.from('patient_reviews').update({ approved: !!approved }).eq('id', id).select().maybeSingle();
                if (!error) return res.json({ success: true, review: data });
            }
            const idx = reviewsMemory.findIndex((r) => r.id === id);
            if (idx >= 0) {
                reviewsMemory[idx].approved = !!approved;
                return res.json({ success: true, review: reviewsMemory[idx] });
            }
            return res.status(404).json({ success: false, message: 'Not found' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    // ─── Lab report tracking ─────────────────────────────────────────────────
    app.post('/api/lab-reports', async (req, res) => {
        try {
            const { patientName, phone, testName, appointmentToken, notes } = req.body || {};
            if (!patientName?.trim() || !phone?.trim()) {
                return res.status(400).json({ success: false, message: 'Patient name and phone required' });
            }
            const token = `LAB-${Date.now().toString().slice(-8)}`;
            const row = {
                token,
                patient_name: patientName.trim(),
                phone: phone.trim(),
                test_name: (testName || 'Lab test').trim(),
                appointment_token: appointmentToken || null,
                notes: (notes || '').trim(),
                status: 'submitted',
            };
            if (supabase) {
                const { data, error } = await supabase.from('lab_report_requests').insert(row).select().maybeSingle();
                if (error && error.code !== '42P01') throw error;
                if (data) return res.json({ success: true, request: data });
            }
            const mem = { ...row, id: `mem_${Date.now()}`, created_at: new Date().toISOString() };
            labReportsMemory.unshift(mem);
            return res.json({ success: true, request: mem });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    app.get('/api/lab-reports/track', async (req, res) => {
        try {
            const { phone, token } = req.query;
            if (!phone && !token) return res.status(400).json({ success: false, message: 'phone or token required' });
            if (supabase) {
                let q = supabase.from('lab_report_requests').select('*').order('created_at', { ascending: false }).limit(20);
                if (token) q = q.eq('token', token);
                else q = q.eq('phone', String(phone).trim());
                const { data, error } = await q;
                if (!error) return res.json({ success: true, requests: data || [] });
            }
            const filtered = labReportsMemory.filter(
                (r) => (token && r.token === token) || (phone && r.phone === String(phone).trim())
            );
            return res.json({ success: true, requests: filtered });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    app.get('/api/admin/lab-reports', requireAdmin, async (req, res) => {
        try {
            if (supabase) {
                const { data, error } = await supabase.from('lab_report_requests').select('*').order('created_at', { ascending: false }).limit(200);
                if (!error) return res.json({ success: true, requests: data || [], statuses: LAB_STATUSES });
            }
            return res.json({ success: true, requests: labReportsMemory, statuses: LAB_STATUSES });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    app.patch('/api/admin/lab-reports', requireAdmin, async (req, res) => {
        try {
            const { id, token, status, adminNotes } = req.body || {};
            if (!status || (!id && !token)) return res.status(400).json({ success: false, message: 'status and id or token required' });
            const patch = { status, admin_notes: adminNotes || null, updated_at: new Date().toISOString() };
            if (status === 'report_ready') patch.ready_at = new Date().toISOString();
            if (supabase) {
                let q = supabase.from('lab_report_requests').update(patch);
                q = id ? q.eq('id', id) : q.eq('token', token);
                const { data, error } = await q.select().maybeSingle();
                if (!error) return res.json({ success: true, request: data });
            }
            const idx = labReportsMemory.findIndex((r) => (id && r.id === id) || r.token === token);
            if (idx >= 0) {
                labReportsMemory[idx] = { ...labReportsMemory[idx], ...patch };
                return res.json({ success: true, request: labReportsMemory[idx] });
            }
            return res.status(404).json({ success: false, message: 'Not found' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    // ─── Patient journey (admin) ─────────────────────────────────────────────
    app.get('/api/admin/patient-journey', requireAdmin, async (req, res) => {
        try {
            const phone = String(req.query.phone || '').trim();
            const name = String(req.query.name || '').trim();
            if (!phone) return res.status(400).json({ success: false, message: 'phone required' });

            const journey = { phone, name, appointments: [], pharmacyOrders: [], labReports: [], clinicalNotes: [] };

            if (supabase) {
                const [apt, pharma, lab, notes] = await Promise.all([
                    supabase.from('appointments').select('*').eq('phone', phone).order('created_at', { ascending: false }).limit(20),
                    supabase.from('pharmacy_orders').select('*').eq('phone', phone).order('created_at', { ascending: false }).limit(20),
                    supabase.from('lab_report_requests').select('*').eq('phone', phone).order('created_at', { ascending: false }).limit(20),
                    name
                        ? supabase.from('patient_clinical_notes').select('*').eq('phone', phone).ilike('patient_name', `%${name}%`).order('created_at', { ascending: false }).limit(20)
                        : supabase.from('patient_clinical_notes').select('*').eq('phone', phone).order('created_at', { ascending: false }).limit(20),
                ]);
                journey.appointments = (apt.data || []).map((a) => ({
                    token: a.token,
                    department: a.department,
                    date: a.appointment_date,
                    paymentStatus: a.payment_status,
                    createdAt: a.created_at,
                }));
                journey.pharmacyOrders = (pharma.data || []).map(normalizePharmacyOrder);
                journey.labReports = lab.data || [];
                journey.clinicalNotes = (notes.data || []).map((n) => ({
                    token: n.token,
                    diagnosisType: n.diagnosis_type,
                    notes: n.notes,
                    prescription: n.prescription,
                    createdAt: n.created_at,
                }));
            } else {
                journey.pharmacyOrders = pharmacyOrdersMemory.filter((o) => o.phone === phone).map(normalizePharmacyOrder);
                journey.labReports = labReportsMemory.filter((r) => r.phone === phone);
            }

            return res.json({ success: true, journey });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    // ─── OCR → medicine names (for cart) ─────────────────────────────────────
    app.post('/api/pharmacy/match-medicines', async (req, res) => {
        try {
            const { names } = req.body || {};
            const list = Array.isArray(names) ? names : [];
            const { getMedicineNames, mergeWithDatabase, normalizePharmacyRow } = require('./hospitalPharmacyCatalog');
            const catalogNames = getMedicineNames();
            const matched = [];
            for (const raw of list) {
                const q = String(raw).trim().toLowerCase();
                if (!q) continue;
                const hit = catalogNames.find((n) => n.toLowerCase().includes(q) || q.includes(n.toLowerCase()));
                if (hit) matched.push(hit);
            }
            const unique = [...new Set(matched)].slice(0, 20);
            let products = unique.map((name) => ({ name, price: 0, category: 'Matched' }));
            if (supabase) {
                const { data } = await supabase.from('products').select('*');
                if (data?.length) {
                    products = unique.map((name) => {
                        const row = data.find((p) => p.name?.toLowerCase() === name.toLowerCase());
                        return row ? normalizePharmacyRow(row) : { name, price: 0, category: 'General' };
                    });
                }
            }
            return res.json({ success: true, products, matchedCount: unique.length });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    return { persistConfig, deductOnDispense: async (orderRow) => {
        if (orderRow?.status === 'dispensed' && orderRow?.items?.length) {
            return deductPharmacyStock(supabase, orderRow.items);
        }
        return { deducted: [] };
    } };
}

module.exports = { registerFeatureRoutes };
