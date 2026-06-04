const { LAB_TESTS_CATALOG, normalizeLabTestRow } = require('./labTestsCatalog');

function registerDiagnosticsAdminRoutes(app, ctx) {
  const { supabase, requireDiagnostics, getSiteConfig, setSiteConfig } = ctx;

  app.patch('/api/diagnostics/admin/settings', requireDiagnostics, async (req, res) => {
    try {
      const { diagnosticsPhone, opTimings } = req.body || {};
      const config = typeof getSiteConfig === 'function' ? getSiteConfig() : {};
      if (diagnosticsPhone != null) config.diagnosticsPhone = String(diagnosticsPhone).trim();
      if (opTimings != null) config.opTimings = String(opTimings).trim();
      if (typeof setSiteConfig === 'function') setSiteConfig(config);
      if (supabase) {
        await supabase.from('site_config').upsert({
          id: 1,
          diagnostics_phone: config.diagnosticsPhone,
          op_timings: config.opTimings,
        });
      }
      return res.json({ success: true, config });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/diagnostics/admin/stats', requireDiagnostics, async (req, res) => {
    try {
      const stats = { testsActive: 0, reportRequestsPending: 0, labBookingsToday: 0, reportRequestsTotal: 0 };
      if (supabase) {
        const [tests, reports, apts] = await Promise.all([
          supabase.from('labtests').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('lab_report_requests').select('id', { count: 'exact', head: true }),
          supabase.from('appointments').select('id', { count: 'exact', head: true }).ilike('department', '%Lab%'),
        ]);
        stats.testsActive = tests.count ?? LAB_TESTS_CATALOG.length;
        stats.reportRequestsTotal = reports.count ?? 0;
        const { data: pending } = await supabase
          .from('lab_report_requests')
          .select('id')
          .neq('status', 'report_ready');
        stats.reportRequestsPending = pending?.length ?? 0;
        stats.labBookingsToday = apts.count ?? 0;
      } else {
        stats.testsActive = LAB_TESTS_CATALOG.length;
      }
      return res.json({ success: true, stats });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/diagnostics/admin/tests', requireDiagnostics, async (req, res) => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('labtests').select('*').order('sort_order', { ascending: true });
        if (!error && data?.length) {
          return res.json({ success: true, tests: data.map(normalizeLabTestRow) });
        }
      }
      return res.json({ success: true, tests: LAB_TESTS_CATALOG.map((t, i) => ({ ...t, id: `cat_${i}` })) });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/diagnostics/admin/tests', requireDiagnostics, async (req, res) => {
    try {
      const body = req.body || {};
      if (!body.name?.trim()) return res.status(400).json({ success: false, message: 'Test name required' });
      const row = {
        name: body.name.trim(),
        category: (body.category || 'General').trim(),
        price: Number(body.price) || 0,
        report_time: Number(body.report_time) || 24,
        description: (body.description || '').trim(),
        img: (body.img || '').trim() || null,
        is_active: body.is_active !== false,
        sort_order: Number(body.sort_order) || 0,
      };
      if (!supabase) return res.status(503).json({ success: false, message: 'Database not configured' });
      const { data, error } = await supabase.from('labtests').insert(row).select().maybeSingle();
      if (error) throw error;
      return res.json({ success: true, test: normalizeLabTestRow(data) });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.patch('/api/diagnostics/admin/tests/:id', requireDiagnostics, async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body || {};
      const patch = {};
      if (body.name != null) patch.name = String(body.name).trim();
      if (body.category != null) patch.category = String(body.category).trim();
      if (body.price != null) patch.price = Number(body.price);
      if (body.report_time != null) patch.report_time = Number(body.report_time);
      if (body.description != null) patch.description = String(body.description).trim();
      if (body.img != null) patch.img = String(body.img).trim();
      if (body.is_active != null) patch.is_active = !!body.is_active;
      if (body.sort_order != null) patch.sort_order = Number(body.sort_order);
      if (!supabase) return res.status(503).json({ success: false, message: 'Database not configured' });
      const { data, error } = await supabase.from('labtests').update(patch).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return res.json({ success: true, test: normalizeLabTestRow(data) });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/diagnostics/admin/tests/:id', requireDiagnostics, async (req, res) => {
    try {
      if (!supabase) return res.status(503).json({ success: false, message: 'Database not configured' });
      const { error } = await supabase.from('labtests').update({ is_active: false }).eq('id', req.params.id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/diagnostics/admin/bookings', requireDiagnostics, async (req, res) => {
    try {
      if (!supabase) return res.json({ success: true, bookings: [] });
      let q = supabase
        .from('appointments')
        .select('*')
        .ilike('department', '%Lab%')
        .order('created_at', { ascending: false })
        .limit(200);
      const { phone, q: search } = req.query;
      if (phone) q = q.eq('phone', String(phone).trim());
      const { data, error } = await q;
      if (error) throw error;
      let rows = data || [];
      if (search) {
        const s = String(search).toLowerCase();
        rows = rows.filter(
          (a) =>
            a.name?.toLowerCase().includes(s) ||
            a.phone?.includes(s) ||
            a.token?.toLowerCase().includes(s) ||
            a.department?.toLowerCase().includes(s)
        );
      }
      return res.json({ success: true, bookings: rows });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });
}

module.exports = { registerDiagnosticsAdminRoutes };
