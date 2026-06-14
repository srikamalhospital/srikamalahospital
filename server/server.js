const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = (() => {
    // Inline lightweight rate limiter — no external package needed
    return ({ windowMs, max, message }) => {
        const hits = new Map();
        return (req, res, next) => {
            const ip = req.ip || req.connection?.remoteAddress || 'unknown';
            const now = Date.now();
            const entry = hits.get(ip) || { count: 0, start: now };
            if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
            entry.count++;
            hits.set(ip, entry);
            if (entry.count > max) return res.status(429).json(message);
            next();
        };
    };
})();
require("dotenv").config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 10000;

const SITE_DOMAIN = (process.env.SITE_DOMAIN || 'srikamalahospital.online').replace(/^https?:\/\//, '').replace(/\/$/, '');
const SITE_URL = (process.env.SITE_URL || process.env.VERCEL_FRONTEND_URL || `https://${SITE_DOMAIN}`).replace(/\/$/, '');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
try {
    if (supabaseUrl && supabaseKey && typeof supabaseUrl === 'string' && !supabaseUrl.includes('YOUR_')) {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase initialized');
    } else {
        console.warn('⚠️ Supabase credentials missing');
    }
} catch (e) {
    console.error('❌ Supabase initialization failed:', e.message);
}

// Rate Limiters
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 40,
    message: { success: false, message: "AI limit reached. Call +91 99480 76665." },
});

// CORS — official frontend domains + local dev
const allowedOrigins = [
    SITE_URL,
    `https://www.${SITE_DOMAIN}`,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.VERCEL_FRONTEND_URL
].filter(Boolean).map((o) => String(o).replace(/\/$/, ''));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
        return callback(null, true); // keep permissive for preview deploys; tighten in production if needed
    },
    credentials: true
}));

// Security & Utility Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.supabase.co"],
            connectSrc: ["'self'", "https://*.supabase.co", "https://integrate.api.nvidia.com", (process.env.SKIN_AI_URL || "https://*")],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(limiter);

// Health Checks
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/', (req, res) => res.status(200).send('Sri Kamala Hospital Backend Live'));

// Legacy endpoint redirect middleware
app.use((req, res, next) => {
    const legacyToApi = {
        '/config': '/api/config',
        '/ai/symptom': '/api/ai/symptom',
        '/ai/vision': '/api/ai/vision',
        '/ai/chat': '/api/ai/chat',
        '/create-appointment': '/api/create-appointment',
        '/create-upi-order': '/api/create-upi-order',
        '/lab/tests': '/api/lab/tests',
        '/pharmacy/products': '/api/pharmacy/products',
        '/admin/login': '/api/admin/login',
        '/admin/appointments': '/api/admin/appointments',
        '/admin/update-appointment': '/api/admin/update-appointment',
        '/appointments': '/api/appointments',
        '/ai/medicine-discovery': '/api/ai/medicine-discovery',
        '/medicines/catalog': '/api/medicines/catalog',
        '/admin/patient-clinical-note': '/api/admin/patient-clinical-note',
        '/admin/patient-clinical-history': '/api/admin/patient-clinical-history',
        '/admin/pharmacy-orders': '/api/admin/pharmacy-orders',
        '/admin/dashboard-stats': '/api/admin/dashboard-stats',
        '/pharmacy/orders': '/api/pharmacy/orders',
        '/ocr': '/api/ai/ocr',
        '/predict': '/predict',
        '/api/ai/skin-predict': '/api/ai/skin-predict'
    };
    if (!req.path.startsWith('/api')) {
        const direct = legacyToApi[req.path];
        if (direct) req.url = direct + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
        if (!direct && req.path.startsWith('/appointments/')) req.url = `/api${req.url}`;
    }
    next();
});

app.use('/api/ai/', aiLimiter);

// Global Config Store
let siteConfig = {
    showCoreServices: true,
    showHealthAwareness: true,
    allowOnlinePayment: true,
    hospitalPhone: '99480 76665',
    diagnosticsPhone: '9866895634',
    opTimings: 'Open 24 Hours',
    hospitalAddress: 'SRI KAMALA HOSPITAL, Manasa Nagar, Suryapet, Telangana 508213, India',
    websiteUrl: SITE_URL,
    websiteDomain: SITE_DOMAIN,
    contactEmail: `info@${SITE_DOMAIN}`,
    doctorSchedule: {
        dr_kiran: {
            id: 'dr_kiran',
            name: 'Dr. D. Kiran',
            available: true,
            leaveMessage: '',
            opHours: '08:00–13:00, 16:00–20:00',
        },
    },
};

const patientClinicalRecords = {};
const pharmacyOrdersMemory = [];

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || 'sk-admin-change-in-env';
const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts. Wait 15 minutes.' },
});

const verifyAdminToken = (req) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    try {
        return jwt.verify(auth.slice(7), ADMIN_JWT_SECRET);
    } catch {
        return null;
    }
};

/** Hospital control panel — role admin only */
const requireAdmin = (req, res, next) => {
    const payload = verifyAdminToken(req);
    if (!payload || payload.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Hospital admin login required' });
    }
    req.admin = payload;
    return next();
};

/** Diagnostics lab panel — role diagnostics or hospital admin */
const requireDiagnostics = (req, res, next) => {
    const payload = verifyAdminToken(req);
    if (!payload || !['diagnostics', 'admin'].includes(payload.role)) {
        return res.status(401).json({ success: false, message: 'Diagnostics admin login required' });
    }
    req.admin = payload;
    return next();
};

const { filterAppointments, filterPharmacyOrders, distinctValues } = require('./adminSearch');
const { deductPharmacyStock } = require('./stockDeduction');
const { registerFeatureRoutes } = require('./featureRoutes');
const { validateAppointmentBooking } = require('./appointmentSchedule');

const normalizePharmacyOrder = (row) => ({
    id: row.id,
    token: row.token,
    patientName: row.patient_name || row.patientName,
    phone: row.phone,
    age: row.age ?? null,
    gender: row.gender ?? null,
    notes: row.notes,
    items: row.items || [],
    subtotal: Number(row.subtotal) || 0,
    rxCount: row.rx_count ?? row.rxCount ?? 0,
    status: row.status || 'pending_verification',
    createdAt: row.created_at || row.createdAt,
    verifiedAt: row.verified_at || row.verifiedAt,
    dispensedAt: row.dispensed_at || row.dispensedAt,
    appointmentToken: row.appointment_token || row.appointmentToken || null,
});

const {
    getMedicineNames,
    getCategories: getPharmacyCategories,
    mergeWithDatabase,
    normalizePharmacyRow,
} = require('./hospitalPharmacyCatalog');
const medicineCatalog = getMedicineNames();

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || 'dummy_key_to_prevent_crash_if_missing',
    baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
});

const normalizeApiKey = (key) => {
    if (!key || typeof key !== 'string') return '';
    return key.trim().replace(/^Bearer\s+/i, '');
};

const AI_REQUEST_TIMEOUT_MS = 12000;
const FAST_CHAT_MODELS = ['meta/llama-3.2-3b-instruct', 'meta/llama-3.1-70b-instruct', 'meta/llama3-70b-instruct'];
const ACCURATE_CHAT_MODELS = ['meta/llama-3.1-70b-instruct', 'meta/llama3-70b-instruct', 'meta/llama-3.2-3b-instruct'];

const HOSPITAL_AI_CTX = 'Sri Kamala Hospital, Suryapet. Phone: 99480 76665. Diagnostics lab: 9866895634. Open 24/7. OP: General Medicine daily; Cardiology Thursdays only.';

const withTimeout = (promise, ms = AI_REQUEST_TIMEOUT_MS) =>
    Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), ms)),
    ]);

const extractJson = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.replace(/```json|```/g, '').trim();
    try { return JSON.parse(trimmed); } catch (_) { /* continue */ }
    const block = trimmed.match(/\{[\s\S]*\}/);
    if (block) {
        try { return JSON.parse(block[0]); } catch (_) { /* continue */ }
    }
    const arr = trimmed.match(/\[[\s\S]*\]/);
    if (arr) {
        try { return JSON.parse(arr[0]); } catch (_) { /* continue */ }
    }
    return null;
};

const getChatAI = async (messages, modelCandidates = ACCURATE_CHAT_MODELS, tokens = 512, timeoutMs = AI_REQUEST_TIMEOUT_MS) => {
    const keyCandidates = [
        normalizeApiKey(process.env.NVIDIA_API_KEY),
        normalizeApiKey(process.env.NVIDIA_VISION_API_KEY),
        normalizeApiKey(process.env.NVIDIA_VISION_FALLBACK_API_KEY)
    ].filter(Boolean);

    for (const key of keyCandidates) {
        const openai = new OpenAI({ apiKey: key, baseURL: 'https://integrate.api.nvidia.com/v1' });
        for (const model of modelCandidates) {
            try {
                const completion = await withTimeout(
                    openai.chat.completions.create({ model, messages, temperature: 0.15, max_tokens: tokens }),
                    timeoutMs
                );
                if (completion?.choices?.[0]?.message?.content) return completion.choices[0].message.content;
            } catch (e) {
                if (e?.status === 404) continue;
            }
        }
    }
    throw new Error('All AI chat failovers exhausted');
};

const SYMPTOM_SYSTEM = `You are triage AI for ${HOSPITAL_AI_CTX} Respond ONLY with JSON: { "advice": { "en": "...", "te": "..." }, "department": { "en": "General Medicine|Cardiology|Emergency|Dermatology", "te": "..." } }. Max 2 short sentences per language. Chest pain, breathlessness, stroke signs, severe bleeding, very high fever → department Emergency and urge immediate visit or call 99480 76665.`;

const analyzeSymptomText = async (symptoms, { hasImage = false } = {}) => {
    const text = String(symptoms || '').trim();
    if (!text) return null;
    const imageNote = hasImage ? ' Patient also uploaded a clinical photo for context.' : '';
    const msg = [
        { role: 'system', content: SYMPTOM_SYSTEM },
        { role: 'user', content: text + imageNote }
    ];
    const modelText = await getChatAI(msg, FAST_CHAT_MODELS, 420, 10000);
    const json = extractJson(modelText);
    if (json?.advice) return json;
    return {
        advice: { en: 'Please visit the hospital for evaluation.', te: 'దయచేసి ఆసుపత్రిని సందర్శించండి.' },
        department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' }
    };
};

// ─── AI ROUTES ─────────────────────────────────────────────────────────────

app.post('/api/ai/symptom', async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms || !String(symptoms).trim()) {
            return res.status(400).json({ success: false, message: 'Symptoms required' });
        }
        const jsonResponse = await analyzeSymptomText(symptoms);
        res.json({ success: true, analysis: jsonResponse });
    } catch (err) {
        res.status(503).json({ success: false, message: "AI services busy." });
    }
});

const HAM10000_CLASSES = {
    'akiec': { name_en: "Actinic Keratosis", name_te: "యాక్టినిక్ కెరటోసిస్", risk: "Medium", desc_en: "Pre-cancerous sun damage.", desc_te: "ఎండ దెబ్బతినడం వల్ల వచ్చే క్యాన్సర్ ముందు దశ." },
    'bcc': { name_en: "Basal Cell Carcinoma", name_te: "బేసల్ సెల్ కార్సినోమా", risk: "High", desc_en: "Common slow-growing skin cancer.", desc_te: "నెమ్మదిగా పెరిగే చర్మ క్యాన్సర్." },
    'bkl': { name_en: "Benign Keratosis", name_te: "బెనైన్ కెరటోసిస్", risk: "Low", desc_en: "Harmless growths like seborrheic keratosis.", desc_te: "హాని కలిగించని చర్మ పెరుగుదలలు." },
    'df': { name_en: "Dermatofibroma", name_te: "డెర్మటోఫైబ్రోమా", risk: "Low", desc_en: "Firm non-cancerous bumps on legs.", desc_te: "సాధారణంగా కాళ్లపై వచ్చే గడ్డలు." },
    'mel': { name_en: "Melanoma", name_te: "మెలనోమా", risk: "Critically High", desc_en: "Serious skin cancer. Requires immediate review.", desc_te: "తీవ్రమైన చర్మ క్యాన్సర్." },
    'nv': { name_en: "Melanocytic Nevi (Moles)", name_te: "మెలనోసైటిక్ నెవి", risk: "Low", desc_en: "Common moles. Usually benign.", desc_te: "సాధారణ పుట్టుమచ్చలు." },
    'vasc': { name_en: "Vascular Lesions", name_te: "వాస్కులర్ గాయాలు", risk: "Low", desc_en: "Vascular growths like cherry angiomas.", desc_te: "రక్తనాళాల పెరుగుదల." }
};

const CONDITION_TO_DX = {
    'actinic keratosis': 'akiec',
    'basal cell carcinoma': 'bcc',
    'benign keratosis': 'bkl',
    'dermatofibroma': 'df',
    'melanocytic nevi': 'nv',
    'melanoma': 'mel',
    'vascular lesions': 'vasc'
};

const mapSkinPrediction = (pred) => {
    const dx = pred.dx || CONDITION_TO_DX[(pred.condition || '').toLowerCase().trim()] || 'nv';
    const cls = HAM10000_CLASSES[dx] || HAM10000_CLASSES.nv;
    const confRaw = pred.confidence;
    const confidence = typeof confRaw === 'number' && confRaw <= 1 ? Math.round(confRaw * 1000) / 10 : Number(confRaw) || 0;
    return {
        success: true,
        dx,
        condition: pred.condition || cls.name_en,
        condition_te: cls.name_te,
        risk: pred.risk || cls.risk,
        confidence,
        uncertain: Boolean(pred.uncertain),
        description_en: cls.desc_en,
        description_te: cls.desc_te,
        model: pred.model || 'HAM10000-CNN'
    };
};

const SKIN_AI_URL = process.env.SKIN_AI_URL || `http://localhost:${process.env.SKIN_AI_PORT || 5005}`;

const runSkinCNNFromBase64 = async (image) => {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
    const flaskResponse = await axios.post(`${SKIN_AI_URL}/predict`, form, {
        headers: { ...form.getHeaders() },
        timeout: 10000
    });
    if (flaskResponse.data?.success) return mapSkinPrediction(flaskResponse.data);
    return null;
};

const forwardSkinImage = async (req) => {
    const FormData = require('form-data');
    const form = new FormData();
    if (req.file) {
        form.append('image', req.file.buffer, { filename: req.file.originalname || 'image.jpg', contentType: req.file.mimetype || 'image/jpeg' });
    } else if (req.files?.image) {
        const f = req.files.image;
        form.append('image', f.data || f, { filename: f.name || 'image.jpg', contentType: f.mimetype || 'image/jpeg' });
    } else {
        throw new Error('No image provided');
    }
    const response = await axios.post(`${SKIN_AI_URL}/predict`, form, {
        headers: form.getHeaders(),
        timeout: 12000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    return response.data;
};

// Skin classification (HAM10000) — multipart via express (built-in for small uploads)
const multer = require('multer');
const skinUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

app.post('/api/ai/skin-predict', skinUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Image file required' });
        const pred = await forwardSkinImage(req);
        if (!pred?.success) return res.status(503).json({ success: false, message: pred?.error || 'Skin AI unavailable' });
        return res.json(mapSkinPrediction(pred));
    } catch (err) {
        console.error('Skin predict error:', err.message);
        return res.status(503).json({ success: false, message: 'Skin classification service unavailable. Ensure SKIN_AI_URL is running.' });
    }
});

app.post('/predict', express.raw({ type: '*/*', limit: '20mb' }), async (req, res) => {
    try {
        const response = await axios.post(`${SKIN_AI_URL}/predict`, req.body, {
            headers: { 'Content-Type': req.headers['content-type'] },
            maxContentLength: Infinity, maxBodyLength: Infinity, timeout: 30000
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ success: false, message: `AI prediction failed: ${err.message}` });
    }
});

app.post('/api/ai/vision', async (req, res) => {
    try {
        const { image, symptoms } = req.body;
        if (!image) return res.status(400).json({ success: false, message: 'No image provided' });

        const symptomText = String(symptoms || '').trim();
        const hasSymptoms = symptomText.length > 0;

        const [skinSettled, symptomSettled] = await Promise.allSettled([
            runSkinCNNFromBase64(image),
            hasSymptoms ? analyzeSymptomText(symptomText, { hasImage: true }) : Promise.resolve(null),
        ]);

        const skinMapped = skinSettled.status === 'fulfilled' ? skinSettled.value : null;
        const symptomAnalysis = symptomSettled.status === 'fulfilled' ? symptomSettled.value : null;

        if (hasSymptoms && symptomAnalysis?.advice) {
            const analysis = { ...symptomAnalysis };
            if (skinMapped) {
                analysis.note = `Skin scan (preliminary): ${skinMapped.condition} (${skinMapped.risk} risk). Visit dermatology for confirmation.`;
                analysis.skin_scan = {
                    condition: { en: skinMapped.condition, te: skinMapped.condition_te },
                    risk_level: skinMapped.risk,
                    confidence: skinMapped.confidence,
                };
            }
            return res.json({ success: true, analysis });
        }

        if (skinMapped) {
            return res.json({
                success: true,
                analysis: {
                    condition: { en: skinMapped.condition, te: skinMapped.condition_te },
                    risk_level: skinMapped.risk,
                    confidence: skinMapped.confidence,
                    uncertain: skinMapped.uncertain,
                    precautions: [{ en: skinMapped.description_en, te: skinMapped.description_te }],
                    metadata: { source: skinMapped.model, dx: skinMapped.dx },
                },
            });
        }

        if (hasSymptoms) {
            const fallback = await analyzeSymptomText(symptomText).catch(() => null);
            if (fallback?.advice) return res.json({ success: true, analysis: fallback });
        }

        return res.json({
            success: false,
            message: 'Could not analyze image. Please describe symptoms in text or visit the hospital.',
            analysis: {
                advice: { en: 'Upload a clear photo with symptom description, or call 99480 76665.', te: 'లక్షణాలను వ్రాసండి లేదా 99480 76665 కి కాల్ చేయండి.' },
                department: { en: 'General Medicine', te: 'జనరల్ మెడిసిన్' },
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Vision AI engine failed.' });
    }
});

app.post('/api/ai/ocr', async (req, res) => {
    try {
        const { image } = req.body;
        const keyCandidates = [
            normalizeApiKey(process.env.NVIDIA_VISION_API_KEY),
            normalizeApiKey(process.env.NVIDIA_VISION_FALLBACK_API_KEY),
            normalizeApiKey(process.env.NVIDIA_API_KEY)
        ].filter(Boolean);
        const modelCandidates = ['meta/llama-3.2-11b-vision-instruct', 'microsoft/phi-3.5-vision-instruct', 'meta/llama-3.2-90b-vision-instruct'];
        let response;
        outer: for (const currentKey of keyCandidates) {
            for (const currentModel of modelCandidates) {
                try {
                    const attempt = await axios.post("https://integrate.api.nvidia.com/v1/chat/completions", {
                        model: currentModel,
                        messages: [{ role: "user", content: [{ type: "text", text: `### CLINICAL OCR PROTOCOL V2.0\nDigitize this medical document with 100% precision.\nExtract as JSON: { "patient": "Patient Name", "date": "Date", "medicines": ["..."], "test_results": [{ "item_en": "...", "item_te": "...", "value": "...", "range": "...", "status": "..." }], "diagnosis_en": "...", "explanation_te": "...", "explanation_en": "..." }\nIMPORTANT: ONLY output VALID JSON.` }, { type: "image_url", image_url: { url: image } }] }],
                        max_tokens: 2048, temperature: 0.1
                    }, { headers: { "Authorization": `Bearer ${currentKey}`, "Content-Type": "application/json" }, timeout: 60000 });
                    if (attempt.status === 200) { response = attempt; break outer; }
                } catch (e) { continue; }
            }
        }
        const content = response?.data?.choices?.[0]?.message?.content || "";
        let json;
        try { json = JSON.parse(content.replace(/```json|```/g, '').trim()); }
        catch { json = { raw_extraction: content }; }
        res.json({ success: true, data: json });
    } catch (err) {
        res.status(500).json({ success: false, message: "OCR engine failed." });
    }
});

app.post('/api/ai/quality-check', async (req, res) => {
    try {
        const { image } = req.body;
        const keyCandidates = [normalizeApiKey(process.env.NVIDIA_VISION_API_KEY), normalizeApiKey(process.env.NVIDIA_API_KEY)].filter(Boolean);
        const modelCandidates = ["microsoft/phi-3.5-vision-instruct", "meta/llama-3.2-11b-vision-instruct"];
        let response;
        outer: for (const currentKey of keyCandidates) {
            for (const currentModel of modelCandidates) {
                try {
                    const attempt = await axios.post("https://integrate.api.nvidia.com/v1/chat/completions", {
                        model: currentModel,
                        messages: [{ role: "user", content: [{ type: "text", text: "Evaluate clinical photo quality. Output ONLY JSON: { \"pass\": true/false, \"score\": 0-10, \"tips\": \"...\" }." }, { type: "image_url", image_url: { url: image } }] }],
                        max_tokens: 512, temperature: 0.1
                    }, { headers: { "Authorization": `Bearer ${currentKey}` }, timeout: 45000 });
                    if (attempt.status === 200) { response = attempt; break outer; }
                } catch (e) { continue; }
            }
        }
        const content = response?.data?.choices?.[0]?.message?.content || "";
        let json;
        try { json = JSON.parse(content.replace(/```json|```/g, '').trim()); }
        catch { json = { pass: true, score: 7, tips: "Proceed with caution." }; }
        res.json({ success: true, quality: json });
    } catch (err) {
        res.status(500).json({ success: false, message: "Quality check failed." });
    }
});

const parseDoctorAIJson = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    const block = trimmed.match(/\{[\s\S]*\}/);
    if (!block) return null;
    try {
        const parsed = JSON.parse(block[0]);
        if (parsed.reply) return parsed;
    } catch (_) { /* ignore */ }
    return null;
};

const defaultDoctorSuggestions = () => ([
    { te: 'మూడు రోజుల నుండి లక్షణం', en: 'Symptoms for 3 days' },
    { te: 'అపాయింట్‌మెంట్ బుక్ చేయండి', en: 'Book OP appointment' },
    { te: 'ఆసుపత్రికి ఎప్పుడు రావాలి?', en: 'When should I visit?' },
]);

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { query, mode, doctorName, specialty, history, language, opHours, doctorAvailable, testsSummary } = req.body;
        if (!query || !String(query).trim()) {
            return res.status(400).json({ success: false, message: 'Message required' });
        }

        let systemContent = `You are the helpful AI assistant for ${HOSPITAL_AI_CTX} Website: ${SITE_URL}. Be concise, empathetic, professional. Max 2 sentences. Always format: [Telugu] ||| [English].`;
        let tokens = 380;
        let models = FAST_CHAT_MODELS;
        let useHistory = false;

        if (mode === 'doctor') {
            const doc = doctorName || 'Dr. D. Kiran';
            const spec = specialty || 'General Medicine (MD)';
            const lang = language === 'en' ? 'English' : 'Telugu';
            const avail = doctorAvailable !== false;
            const hours = opHours || 'Open 24 hours';
            systemContent = `You ARE ${doc}, ${spec}, consulting a patient online for Sri Kamala Hospital, Suryapet — behave like a real OP doctor (warm, attentive, one clarifying question when needed).

Clinical rules:
- Preliminary triage only; never give a final diagnosis.
- 2 short sentences in reply (both languages).
- Chest pain, breathlessness, stroke signs, severe bleeding, very high fever → tell them to come immediately or call 99480 76665.
- ${avail ? `You are available for OP today. OP hours: ${hours}.` : 'You are on leave today — urgent cases must go to hospital emergency.'}
- ${HOSPITAL_AI_CTX} Website: ${SITE_URL}
- Prefer ${lang} tone in "reply" but always include both Telugu and English separated by |||

OUTPUT ONLY valid JSON (no markdown):
{
  "reply": "Telugu sentences ||| English sentences",
  "suggestions": [
    { "te": "short natural reply patient might tap next in Telugu", "en": "same in English" },
    ...exactly 3 or 4 items, synced to YOUR last reply
  ]
}`;
            tokens = 580;
            models = ACCURATE_CHAT_MODELS;
            useHistory = true;
        } else if (mode === 'pharmacy') {
            systemContent = `You are the hospital pharmacy desk for ${HOSPITAL_AI_CTX}. Answer ONLY about medicine availability, dosage questions, and Rx requirements. No diagnosis. 2 sentences max. OUTPUT ONLY JSON: { "reply": "Telugu ||| English" }`;
            tokens = 260;
        } else if (mode === 'diagnostics') {
            const tests = String(testsSummary || '').trim() || 'CBC, Lipid Profile, Thyroid, HbA1c, LFT, KFT, ECG';
            systemContent = `You are diagnostics advisor for ${HOSPITAL_AI_CTX}. Available tests (pick ONLY from this list): ${tests}. For patient symptoms, recommend 1-3 most relevant tests with brief reason. No diagnosis. OUTPUT ONLY JSON: { "reply": "Telugu reason ||| English reason", "tests": ["exact test name from list"] }`;
            tokens = 340;
        }

        const msg = [{ role: 'system', content: systemContent }];
        if (useHistory && Array.isArray(history)) {
            history.slice(-8).forEach((h) => {
                const role = h.role === 'assistant' ? 'assistant' : 'user';
                const content = String(h.content || '').trim();
                if (content) msg.push({ role, content });
            });
        }
        msg.push({ role: 'user', content: String(query).trim() });

        const responseText = await getChatAI(msg, models, tokens);

        if (mode === 'doctor') {
            const parsed = parseDoctorAIJson(responseText);
            if (parsed?.reply) {
                const suggestions = Array.isArray(parsed.suggestions) && parsed.suggestions.length
                    ? parsed.suggestions.slice(0, 4)
                    : defaultDoctorSuggestions();
                return res.json({
                    success: true,
                    response: String(parsed.reply).trim(),
                    suggestions,
                });
            }
            const fallbackReply = responseText && String(responseText).includes('|||')
                ? String(responseText).trim()
                : 'మీ వివరాలు స్వీకరించాను. దయచేసి ఆసుపత్రికి రండి లేదా 99480 76665 కి కాల్ చేయండి. ||| I have noted your concern. Please visit the hospital or call 99480 76665.';
            return res.json({
                success: true,
                response: fallbackReply,
                suggestions: defaultDoctorSuggestions(),
            });
        }

        if (mode === 'pharmacy' || mode === 'diagnostics') {
            const parsed = extractJson(responseText);
            if (parsed?.reply) {
                return res.json({
                    success: true,
                    response: String(parsed.reply).trim(),
                    tests: Array.isArray(parsed.tests) ? parsed.tests.slice(0, 4) : [],
                });
            }
            if (responseText && String(responseText).includes('|||')) {
                return res.json({ success: true, response: String(responseText).trim(), tests: [] });
            }
        }

        const fallback = 'క్షమించండి, ఇప్పుడు అందుబాటులో లేదు. 99480 76665 కి కాల్ చేయండి. ||| AI unavailable. Call +91 99480 76665.';
        res.json({ success: true, response: responseText || fallback });
    } catch (err) {
        console.error('AI chat error:', err.message);
        const isDoctor = req.body?.mode === 'doctor';
        const doctorFallback = {
            success: false,
            message: 'Clinical AI is temporarily unavailable. Call +91 99480 76665.',
            response: 'క్షమించండి, ఇప్పుడు కనెక్ట్ కాలేదు. 99480 76665 కి కాల్ చేయండి. ||| Sorry, connection failed. Please call 99480 76665.',
            suggestions: defaultDoctorSuggestions(),
        };
        res.status(500).json(isDoctor ? doctorFallback : {
            success: false,
            message: doctorFallback.message,
            response: doctorFallback.response,
        });
    }
});

app.post('/api/ai/discover', async (req, res) => {
    try {
        const { keyword } = req.body;
        if (!keyword) return res.json({ success: true, results: [] });
        const msg = [
            { role: "system", content: "You are a clinical AI. Suggest 2-3 standard medical equivalents. Output strictly a JSON array of strings." },
            { role: "user", content: keyword }
        ];
        const responseText = await getChatAI(msg, FAST_CHAT_MODELS, 200, 8000);
        let results = [];
        try { results = JSON.parse(responseText.replace(/```json|```/g, '').trim()); if (!Array.isArray(results)) results = []; }
        catch (e) { }
        res.json({ success: true, results, ai_note: "Clinical suggestions gathered." });
    } catch (err) {
        res.json({ success: true, results: [], ai_note: "Could not fetch alternatives." });
    }
});

// ─── ADMIN & CONFIG ROUTES ─────────────────────────────────────────────────

const normalizeEnvSecret = (value) => {
    let v = String(value || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1).trim();
    }
    return v;
};

app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
    const { password, panel } = req.body || {};
    const expected = normalizeEnvSecret(process.env.ADMIN_PASSWORD);
    const supplied = normalizeEnvSecret(password);
    if (!expected) {
        return res.status(503).json({ success: false, message: 'Admin password not configured on server (set ADMIN_PASSWORD in Render)' });
    }
    if (!supplied) {
        return res.status(400).json({ success: false, message: 'Password required' });
    }
    if (supplied === expected) {
        const role = panel === 'diagnostics' ? 'diagnostics' : 'admin';
        const token = jwt.sign({ role, sub: role === 'diagnostics' ? 'diagnostics-admin' : 'hospital-admin' }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
        return res.json({ success: true, token, role, expiresIn: 28800 });
    }
    return res.status(401).json({ success: false, message: 'Invalid password. Must match ADMIN_PASSWORD on Render (not your local .env).' });
});

const { registerDiagnosticsAdminRoutes } = require('./diagnosticsAdminRoutes');
const { LAB_TESTS_CATALOG, normalizeLabTestRow } = require('./labTestsCatalog');

registerFeatureRoutes(app, {
    supabase,
    getSiteConfig: () => siteConfig,
    setSiteConfig: (patch) => { siteConfig = { ...siteConfig, ...patch }; },
    requireAdmin,
    requireDiagnostics,
    normalizePharmacyOrder,
    pharmacyOrdersMemory,
});

registerDiagnosticsAdminRoutes(app, {
    supabase,
    requireDiagnostics,
    getSiteConfig: () => siteConfig,
    setSiteConfig: (patch) => { siteConfig = { ...siteConfig, ...patch }; },
});

app.post('/api/create-appointment', (req, res) => {
    // Ultra-defensive: synchronous wrapper prevents any async crash from leaking
    const generateToken = (prefix) => {
        const sfx = Math.random().toString(36).substring(2, 6).toUpperCase();
        const ts = Date.now().toString().slice(-4);
        return `${prefix}-${ts}-${sfx}`;
    };

    const respond = async () => {
        try {
            const { name, phone, age, gender, department, appointmentDate, reason, image } = req.body || {};
            if (!name || !phone) {
                return res.status(400).json({ success: false, message: "Missing required fields: name and phone" });
            }

            const scheduleCheck = validateAppointmentBooking(department, appointmentDate);
            if (!scheduleCheck.ok) {
                return res.status(400).json({ success: false, message: scheduleCheck.message });
            }

            const safeDept = (department || '').toLowerCase();
            const isDia = safeDept.includes('lab') || safeDept.includes('diagnosis');
            const prefix = isDia ? 'KAMALADIA' : 'KAMALA-OP';
            let finalToken = generateToken(prefix);

            // Try to get sequential count from DB
            if (supabase) {
                try {
                    const { count } = await supabase
                        .from('appointments')
                        .select('*', { count: 'exact', head: true })
                        .ilike('token', `${prefix}%`);
                    if (count !== null) {
                        finalToken = `${prefix}-${String((count || 0) + 1).padStart(4, '0')}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
                    }
                } catch (e) {
                    console.warn('Token count failed:', e.message);
                }
            }

            const bookingData = {
                token: finalToken,
                name, phone,
                age: age || null,
                gender: gender || null,
                department: department || null,
                appointment_date: appointmentDate || null,
                reason: reason || (isDia ? 'Diagnostic Test' : 'General Checkup'),
                payment_status: 'Pay at Hospital',
                order_id: `OFFLINE_${Date.now()}`,
            };

            // Try DB insert (with and without image)
            if (supabase) {
                // First attempt: with image field
                try {
                    const { data, error } = await supabase
                        .from('appointments')
                        .insert({ ...bookingData, image: image || null })
                        .select();
                    if (!error && data?.[0]) {
                        return res.json({ success: true, appointment: data[0], token: finalToken });
                    }
                    if (error) console.warn('Insert attempt 1 failed:', error.message);
                } catch (e1) {
                    console.warn('Insert attempt 1 exception:', e1.message);
                }

                // Second attempt: without image
                try {
                    const { data, error } = await supabase
                        .from('appointments')
                        .insert(bookingData)
                        .select();
                    if (!error && data?.[0]) {
                        return res.json({ success: true, appointment: data[0], token: finalToken });
                    }
                    if (error) console.warn('Insert attempt 2 failed:', error.message);
                } catch (e2) {
                    console.warn('Insert attempt 2 exception:', e2.message);
                }
            }

            // Offline fallback — always succeeds
            return res.json({
                success: true,
                appointment: { ...bookingData, image: null, id: `offline_${Date.now()}` },
                token: finalToken,
                offline_mode: true,
                note: 'Show this token at hospital reception.'
            });

        } catch (criticalErr) {
            console.error('CRITICAL booking handler error:', criticalErr.message);
            return res.json({
                success: true,
                token: `KAMALA-OP-${Date.now().toString().slice(-6)}`,
                offline_mode: true,
                message: 'Emergency offline booking. Show this token at reception.'
            });
        }
    };

    respond().catch(err => {
        console.error('Unhandled promise rejection in booking:', err.message);
        if (!res.headersSent) {
            res.json({
                success: true,
                token: `KAMALA-OP-${Date.now().toString().slice(-6)}`,
                offline_mode: true,
                message: 'Emergency offline booking. Show this token at reception.'
            });
        }
    });
});

app.get('/api/admin/dashboard-stats', requireAdmin, async (req, res) => {
    try {
        let appointmentsCount = 0;
        let pharmacyPending = 0;
        let pharmacyDispensed = 0;
        if (supabase) {
            const { count: aptCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
            appointmentsCount = aptCount || 0;
            const { count: pend } = await supabase.from('pharmacy_orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_verification');
            const { count: ver } = await supabase.from('pharmacy_orders').select('*', { count: 'exact', head: true }).eq('status', 'verified');
            const { count: disp } = await supabase.from('pharmacy_orders').select('*', { count: 'exact', head: true }).eq('status', 'dispensed');
            pharmacyPending = (pend || 0) + (ver || 0);
            pharmacyDispensed = disp || 0;
        } else {
            appointmentsCount = 0;
            pharmacyPending = pharmacyOrdersMemory.filter((o) => o.status === 'pending_verification' || o.status === 'verified').length;
            pharmacyDispensed = pharmacyOrdersMemory.filter((o) => o.status === 'dispensed').length;
        }
        return res.json({
            success: true,
            stats: {
                appointments: appointmentsCount,
                pharmacyPending,
                pharmacyDispensed,
                medicines: medicineCatalog.length,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/appointments', requireAdmin, async (req, res) => {
    try {
        let transformed = [];
        if (!supabase) {
            transformed = [{ _id: '1', name: 'Mock Patient', token: 'TKN-DEMO', department: 'General', phone: '0000', age: 30, gender: 'Male', paymentStatus: 'Paid', appointmentDate: '2026-03-22' }];
        } else {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);
            if (error) throw error;
            transformed = (data || []).map((item) => ({
                _id: item.id,
                name: item.name,
                token: item.token,
                department: item.department,
                phone: item.phone,
                age: item.age,
                gender: item.gender,
                reason: item.reason,
                paymentStatus: item.payment_status,
                appointmentDate: item.appointment_date,
                orderId: item.order_id,
                image: item.image,
            }));
        }
        const { results, filters, total } = filterAppointments(transformed, req.query);
        return res.json({
            success: true,
            appointments: results,
            total,
            totalUnfiltered: transformed.length,
            filters,
            filterOptions: {
                names: distinctValues(transformed, 'name'),
                ages: distinctValues(transformed, 'age'),
                genders: distinctValues(transformed, 'gender'),
                departments: distinctValues(transformed, 'department'),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/appointments/:token', async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) return res.status(400).json({ success: false, message: 'Token required' });
        if (!supabase) return res.json({ success: true, appointment: { token, name: 'Demo Patient', phone: '0000000000', age: 30, gender: 'Male', department: 'General OP', paymentStatus: 'Pay at Hospital', appointmentDate: '2026-03-22', reason: 'Demo booking' } });
        const { data, error } = await supabase.from('appointments').select('*').eq('token', token).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, message: 'Appointment not found' });
        return res.json({ success: true, appointment: { _id: data.id, name: data.name, token: data.token, department: data.department, phone: data.phone, age: data.age, gender: data.gender, reason: data.reason, paymentStatus: data.payment_status, appointmentDate: data.appointment_date, orderId: data.order_id, image: data.image } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/update-appointment', requireAdmin, async (req, res) => {
    try {
        const { id, paymentStatus } = req.body;
        if (!supabase) return res.status(503).json({ success: false, message: 'Database not connected' });
        const { data, error } = await supabase.from('appointments').update({ payment_status: paymentStatus, updated_at: new Date() }).eq('id', id).select();
        if (error) throw error;
        res.json({ success: true, appointment: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── PAYMENT & LAB ROUTES ──────────────────────────────────────────────────

app.post('/api/create-upi-order', async (req, res) => {
    try {
        const { name, phone, age, gender, department, appointmentDate, reason, token } = req.body;
        const orderId = `ORD_${Date.now()}`;
        if (supabase) {
            const { data, error } = await supabase.from('appointments').insert({ order_id: orderId, token, name, phone, age, gender, department, appointment_date: appointmentDate, reason, payment_status: 'Pending' }).select();
            if (error) throw error;
        }
        res.json({ success: true, orderId, paymentUrl: `https://test.cashfree.com/pg/v1/checkout/${orderId}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/lab/tests', async (req, res) => {
    try {
        let tests = [];
        if (supabase) {
            const { data } = await supabase
                .from('labtests')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
            if (data?.length > 0) tests = data.map(normalizeLabTestRow);
        }
        if (tests.length === 0) {
            tests = LAB_TESTS_CATALOG.map((t, i) => ({ ...normalizeLabTestRow(t), id: t.id || `cat_${i}` }));
        }
        res.json({ success: true, tests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/pharmacy/orders', async (req, res) => {
    try {
        const { token, name, phone, age, gender, notes, items, subtotal, rxCount, status, createdAt, appointmentToken } = req.body || {};
        if (!token || !name || !phone || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'token, name, phone and items are required' });
        }
        const row = {
            token: String(token).trim(),
            patient_name: String(name).trim(),
            phone: String(phone).trim(),
            age: age != null && String(age).trim() ? String(age).trim() : null,
            gender: gender != null && String(gender).trim() ? String(gender).trim() : null,
            notes: (notes || '').trim(),
            items,
            subtotal: Number(subtotal) || 0,
            rx_count: Number(rxCount) || 0,
            status: status || 'pending_verification',
            created_at: createdAt || new Date().toISOString(),
            appointment_token: appointmentToken ? String(appointmentToken).trim() : null,
        };
        if (supabase) {
            const { data, error } = await supabase.from('pharmacy_orders').insert(row).select().maybeSingle();
            if (error) {
                if (error.code === '42P01') {
                    pharmacyOrdersMemory.unshift({ ...row, id: `mem_${Date.now()}` });
                    return res.json({ success: true, order: normalizePharmacyOrder(pharmacyOrdersMemory[0]), offline: true });
                }
                throw error;
            }
            return res.json({ success: true, order: normalizePharmacyOrder(data) });
        }
        pharmacyOrdersMemory.unshift({ ...row, id: `mem_${Date.now()}` });
        return res.json({ success: true, order: normalizePharmacyOrder(pharmacyOrdersMemory[0]), offline: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/pharmacy-orders', requireAdmin, async (req, res) => {
    try {
        let rows = [];
        if (supabase) {
            const { data, error } = await supabase
                .from('pharmacy_orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);
            if (error) {
                if (error.code === '42P01') {
                    rows = pharmacyOrdersMemory.map(normalizePharmacyOrder);
                } else {
                    throw error;
                }
            } else {
                rows = (data || []).map(normalizePharmacyOrder);
            }
        } else {
            rows = pharmacyOrdersMemory.map(normalizePharmacyOrder);
        }
        const { results, filters, total } = filterPharmacyOrders(rows, req.query);
        return res.json({
            success: true,
            orders: results,
            total,
            totalUnfiltered: rows.length,
            filters,
            filterOptions: {
                names: distinctValues(rows, 'patientName'),
                ages: distinctValues(rows, 'age'),
                genders: distinctValues(rows, 'gender'),
                statuses: ['pending_verification', 'verified', 'dispensed', 'cancelled'],
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.patch('/api/admin/pharmacy-orders', requireAdmin, async (req, res) => {
    try {
        const { id, token, status, verifiedBy } = req.body || {};
        if (!status || (!id && !token)) {
            return res.status(400).json({ success: false, message: 'status and id or token required' });
        }
        const patch = { status, updated_at: new Date().toISOString() };
        if (status === 'verified') {
            patch.verified_by = verifiedBy || 'admin';
            patch.verified_at = new Date().toISOString();
        }
        if (status === 'dispensed') patch.dispensed_at = new Date().toISOString();

        if (supabase) {
            let q = supabase.from('pharmacy_orders').update(patch);
            q = id ? q.eq('id', id) : q.eq('token', token);
            const { data, error } = await q.select().maybeSingle();
            if (error) {
                if (error.code === '42P01') {
                    const idx = pharmacyOrdersMemory.findIndex((o) => (id && o.id === id) || o.token === token);
                    if (idx >= 0) {
                        pharmacyOrdersMemory[idx] = { ...pharmacyOrdersMemory[idx], ...patch, status };
                        return res.json({ success: true, order: normalizePharmacyOrder(pharmacyOrdersMemory[idx]) });
                    }
                    return res.status(404).json({ success: false, message: 'Order not found' });
                }
                throw error;
            }
            if (!data) return res.status(404).json({ success: false, message: 'Order not found' });
            let stockDeduction = { deducted: [] };
            if (status === 'dispensed') stockDeduction = await deductPharmacyStock(supabase, data.items || []);
            return res.json({ success: true, order: normalizePharmacyOrder(data), stockDeduction });
        }
        const idx = pharmacyOrdersMemory.findIndex((o) => (id && o.id === id) || o.token === token);
        if (idx < 0) return res.status(404).json({ success: false, message: 'Order not found' });
        pharmacyOrdersMemory[idx] = { ...pharmacyOrdersMemory[idx], ...patch, status };
        return res.json({ success: true, order: normalizePharmacyOrder(pharmacyOrdersMemory[idx]) });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/pharmacy/categories', (req, res) => {
    res.json({ success: true, categories: getPharmacyCategories() });
});

app.get('/api/pharmacy/products', async (req, res) => {
    try {
        const { category } = req.query;
        let dbRows = [];
        if (supabase) {
            const { data } = await supabase.from('products').select('*');
            if (data?.length) dbRows = data.map(normalizePharmacyRow);
        }
        let products = mergeWithDatabase(dbRows);
        if (category && category !== 'All') {
            products = products.filter((p) => p.category === category);
        }
        res.json({
            success: true,
            products,
            total: products.length,
            categories: ['All', ...getPharmacyCategories()],
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/ai/medicine-discovery', async (req, res) => {
    const { keyword } = req.body;
    if (!keyword) return res.json({ success: true, results: [] });
    const q = keyword.toLowerCase();
    const results = medicineCatalog.filter((m) => m.toLowerCase().includes(q));
    res.json({
        success: true,
        results: results.slice(0, 12),
        totalMatches: results.length,
        ai_note: results.length ? `Found ${results.length} matching items in hospital pharmacy.` : 'Not in catalog — ask reception.',
    });
});

app.get('/api/medicines/catalog', (req, res) => {
    res.json({ success: true, medicines: medicineCatalog, total: medicineCatalog.length });
});

// ─── PATIENT CLINICAL NOTES ────────────────────────────────────────────────

app.post('/api/admin/patient-clinical-note', requireAdmin, async (req, res) => {
    try {
        const { token, patientName, phone, diagnosisType, notes, prescription } = req.body;
        if (!token || !patientName || !phone) return res.status(400).json({ success: false, message: 'token, patientName and phone are required' });
        const entry = {
            token,
            diagnosisType: diagnosisType || 'General',
            notes: notes || '',
            prescription: prescription || [],
            createdAt: new Date().toISOString(),
        };
        if (supabase) {
            const { error } = await supabase.from('patient_clinical_notes').insert({
                token,
                patient_name: patientName.trim(),
                phone: phone.trim(),
                diagnosis_type: entry.diagnosisType,
                notes: entry.notes,
                prescription: entry.prescription,
            });
            if (error && error.code !== '42P01') console.warn('Clinical note DB:', error.message);
        }
        const key = `${patientName.trim().toLowerCase()}_${phone.trim()}`;
        if (!patientClinicalRecords[key]) patientClinicalRecords[key] = [];
        patientClinicalRecords[key].push(entry);
        return res.json({ success: true, records: patientClinicalRecords[key] });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/patient-clinical-history', requireAdmin, async (req, res) => {
    const { patientName, phone } = req.body;
    if (!patientName || !phone) return res.status(400).json({ success: false, message: 'patientName and phone are required' });
    const key = `${patientName.trim().toLowerCase()}_${phone.trim()}`;
    let records = patientClinicalRecords[key] || [];
    if (supabase) {
        const { data, error } = await supabase
            .from('patient_clinical_notes')
            .select('*')
            .ilike('patient_name', patientName.trim())
            .eq('phone', phone.trim())
            .order('created_at', { ascending: false });
        if (!error && data?.length) {
            records = data.map((r) => ({
                token: r.token,
                diagnosisType: r.diagnosis_type,
                notes: r.notes,
                prescription: r.prescription,
                createdAt: r.created_at,
            }));
        }
    }
    return res.json({ success: true, records });
});

// ─── GLOBAL ERROR HANDLER (catches any unhandled Express errors) ────────────
app.use((err, req, res, next) => {
    console.error('Global Express Error:', err.message);
    // For booking route, always return success so patients get their token
    if (req.path === '/api/create-appointment' || req.path === '/create-appointment') {
        return res.json({
            success: true,
            token: `KAMALA-OP-${Date.now().toString().slice(-6)}`,
            offline_mode: true,
            message: 'Emergency offline booking. Show this token at reception.'
        });
    }
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── START SERVER ──────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sri Kamala Hospital Backend Live on Port ${PORT}`);
    console.log(`🏥 Booking: KAMALA-OP-XXXX | Diagnostics: KAMALADIA-XXXX`);
});
