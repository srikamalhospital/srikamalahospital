-- =============================================================================
-- SRI KAMALA HOSPITAL — Supabase schema (updated)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Backend uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS for admin APIs)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. APPOINTMENTS (OP + diagnostics bookings, receipts, admin)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    order_id TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    department TEXT,
    reason TEXT,
    appointment_date TEXT,
    payment_status TEXT NOT NULL DEFAULT 'Pay at Hospital'
        CHECK (payment_status IN ('Paid', 'Not Paid', 'Pending', 'Pay at Hospital')),
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upgrade existing installs (safe if columns already exist)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS appointments_token_key ON public.appointments (token);
CREATE INDEX IF NOT EXISTS appointments_phone_idx ON public.appointments (phone);
CREATE INDEX IF NOT EXISTS appointments_created_at_idx ON public.appointments (created_at DESC);
CREATE INDEX IF NOT EXISTS appointments_payment_status_idx ON public.appointments (payment_status);

-- -----------------------------------------------------------------------------
-- 2. LAB TESTS (Diagnosis page — /api/lab/tests)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.labtests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    price NUMERIC(10,2) DEFAULT 0,
    report_time INTEGER DEFAULT 24,
    description TEXT,
    img TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migrate legacy columns (old schema used price TEXT + time TEXT)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'labtests' AND column_name = 'time'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'labtests' AND column_name = 'report_time'
    ) THEN
        ALTER TABLE public.labtests ADD COLUMN report_time INTEGER;
        UPDATE public.labtests SET report_time = NULLIF(regexp_replace(COALESCE(time, '24'), '[^0-9]', '', 'g'), '')::INTEGER;
    END IF;
END $$;

ALTER TABLE public.labtests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.labtests ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.labtests ADD COLUMN IF NOT EXISTS report_time INTEGER DEFAULT 24;
ALTER TABLE public.labtests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.labtests ADD COLUMN IF NOT EXISTS img TEXT;
ALTER TABLE public.labtests ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.labtests ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Remove broken generated column if a previous run failed partway
ALTER TABLE public.labtests DROP COLUMN IF EXISTS price_display;

-- -----------------------------------------------------------------------------
-- 3. PHARMACY PRODUCTS (Medical shop — /api/pharmacy/products)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    price NUMERIC(10,2) DEFAULT 0,
    description TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE public.products DROP COLUMN IF EXISTS price_display;

-- -----------------------------------------------------------------------------
-- 4. MEDICINES CATALOG (Admin inventory search — future /api/medicines/catalog)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'General',
    unit TEXT DEFAULT 'tablet',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS medicines_name_idx ON public.medicines (name);

-- -----------------------------------------------------------------------------
-- 4b. PHARMACY ORDERS (Medical shop cart → verification receipt)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pharmacy_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) DEFAULT 0,
    rx_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending_verification',
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    dispensed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pharmacy_orders_token_idx ON public.pharmacy_orders (token);
CREATE INDEX IF NOT EXISTS pharmacy_orders_status_idx ON public.pharmacy_orders (status);
CREATE INDEX IF NOT EXISTS pharmacy_orders_created_at_idx ON public.pharmacy_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS pharmacy_orders_patient_name_idx ON public.pharmacy_orders (lower(patient_name));
CREATE INDEX IF NOT EXISTS pharmacy_orders_phone_idx ON public.pharmacy_orders (phone);

ALTER TABLE public.pharmacy_orders ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE public.pharmacy_orders ADD COLUMN IF NOT EXISTS gender TEXT;

DROP TRIGGER IF EXISTS pharmacy_orders_updated_at ON public.pharmacy_orders;
CREATE TRIGGER pharmacy_orders_updated_at
    BEFORE UPDATE ON public.pharmacy_orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. PATIENT CLINICAL NOTES (Admin prescriptions & history)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    diagnosis_type TEXT DEFAULT 'General',
    notes TEXT,
    prescription JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinical_notes_patient_phone_idx
    ON public.patient_clinical_notes (lower(trim(patient_name)), trim(phone));
CREATE INDEX IF NOT EXISTS clinical_notes_created_at_idx
    ON public.patient_clinical_notes (created_at DESC);

-- -----------------------------------------------------------------------------
-- 6. SITE CONFIG (singleton — hospital phones, timings, feature flags)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_config (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    show_core_services BOOLEAN NOT NULL DEFAULT true,
    show_health_awareness BOOLEAN NOT NULL DEFAULT true,
    allow_online_payment BOOLEAN NOT NULL DEFAULT true,
    hospital_phone TEXT NOT NULL DEFAULT '99480 76665',
    diagnostics_phone TEXT NOT NULL DEFAULT '9866895634',
    op_timings TEXT NOT NULL DEFAULT 'Open 24 Hours',
    hospital_address TEXT NOT NULL DEFAULT 'Opp. Tirumala Grand Restaurant, M.G. Road, Suryapet',
    website_url TEXT NOT NULL DEFAULT 'https://srikamalahospital.online',
    website_domain TEXT NOT NULL DEFAULT 'srikamalahospital.online',
    contact_email TEXT NOT NULL DEFAULT 'info@srikamalahospital.online',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.site_config (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS site_config_updated_at ON public.site_config;
CREATE TRIGGER site_config_updated_at
    BEFORE UPDATE ON public.site_config
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert pharmacy_orders" ON public.pharmacy_orders;
CREATE POLICY "Public insert pharmacy_orders"
    ON public.pharmacy_orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manage pharmacy_orders" ON public.pharmacy_orders;
CREATE POLICY "Service role manage pharmacy_orders"
    ON public.pharmacy_orders FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Appointments: public can book only; reads/updates via service role (backend)
DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
CREATE POLICY "Public insert appointments"
    ON public.appointments FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all appointments" ON public.appointments;
CREATE POLICY "Service role all appointments"
    ON public.appointments FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- Lab tests & products: public read
DROP POLICY IF EXISTS "Public read labtests" ON public.labtests;
CREATE POLICY "Public read labtests"
    ON public.labtests FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role manage labtests" ON public.labtests;
CREATE POLICY "Service role manage labtests"
    ON public.labtests FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role manage products" ON public.products;
CREATE POLICY "Service role manage products"
    ON public.products FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- Medicines: read for catalog; write service role
DROP POLICY IF EXISTS "Public read medicines" ON public.medicines;
CREATE POLICY "Public read medicines"
    ON public.medicines FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role manage medicines" ON public.medicines;
CREATE POLICY "Service role manage medicines"
    ON public.medicines FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- Clinical notes: backend / admin only
DROP POLICY IF EXISTS "Service role clinical notes" ON public.patient_clinical_notes;
CREATE POLICY "Service role clinical notes"
    ON public.patient_clinical_notes FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- Site config: public read, service role update
DROP POLICY IF EXISTS "Public read site config" ON public.site_config;
CREATE POLICY "Public read site config"
    ON public.site_config FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role manage site config" ON public.site_config;
CREATE POLICY "Service role manage site config"
    ON public.site_config FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- SEED: Lab tests (only when table is empty)
-- -----------------------------------------------------------------------------
INSERT INTO public.labtests (name, category, price, report_time, description, sort_order)
SELECT v.name, v.category, v.price, v.report_time, v.description, v.sort_order
FROM (VALUES
    ('Complete Blood Picture (CBP)', 'Hematology', 250::numeric, 12, 'Red cells, white cells, platelets.', 1),
    ('Blood Glucose (Sugar)', 'Biochemistry', 150, 6, 'Diabetes screening. Fasting preferred.', 2),
    ('Differential Count (DC)', 'Hematology', 200, 12, 'White cell differential.', 3),
    ('ESR (1st & 2nd Hour)', 'Hematology', 100, 12, 'Inflammation marker.', 4),
    ('Hemoglobin (Hb)', 'Hematology', 120, 8, 'Anemia check.', 5),
    ('Thyroid Profile (T3, T4, TSH)', 'Hormonal', 450, 24, 'Thyroid function.', 6),
    ('Lipid Profile (Cholesterol)', 'Cardiology', 500, 24, 'Cholesterol panel. Fasting 12h.', 7),
    ('Liver Function Test (LFT)', 'Biochemistry', 650, 24, 'Liver enzymes and proteins.', 8),
    ('Kidney Function Test (KFT)', 'Biochemistry', 750, 24, 'Creatinine, urea.', 9),
    ('HbA1c', 'Diabetes', 450, 24, '3-month average sugar. No fasting.', 10),
    ('Widal Test', 'Serology', 300, 24, 'Typhoid screening.', 11),
    ('Dengue NS1 Antigen', 'Serology', 600, 24, 'Early dengue detection.', 12),
    ('Malaria Parasite Test', 'Serology', 320, 18, 'Malaria screening.', 13),
    ('CRP (C-Reactive Protein)', 'Immunology', 420, 24, 'Inflammation marker.', 14)
) AS v(name, category, price, report_time, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.labtests LIMIT 1);

-- -----------------------------------------------------------------------------
-- SEED: Pharmacy products
-- -----------------------------------------------------------------------------
INSERT INTO public.products (name, category, price, description, stock, image, sort_order)
SELECT v.name, v.category, v.price, v.description, v.stock, v.image, v.sort_order
FROM (VALUES
    ('Paracetamol 650mg', 'Analgesics', 25::numeric, 'Fever and mild pain.', 100, 'pill', 1),
    ('Amoxicillin 500mg', 'Antibiotics', 120, 'Antibiotic — prescription required.', 50, 'capsule', 2),
    ('Cetirizine 10mg', 'Allergy', 45, 'Antihistamine.', 80, 'pill', 3),
    ('Pantoprazole 40mg', 'Gastritis', 90, 'Acidity and GERD.', 60, 'capsule', 4),
    ('D-Rise 60k Capsule', 'Vitamins', 25, 'Vitamin D supplement.', 40, 'capsule', 5),
    ('Azithromycin 500mg', 'Antibiotics', 80, 'Antibiotic — prescription required.', 35, 'capsule', 6),
    ('Surgical Gloves (Pair)', 'General Hospital', 20, 'Examination gloves.', 200, 'kit', 7),
    ('Disposable Syringe 5ml', 'Injections', 15, 'Single-use syringe.', 150, 'kit', 8)
) AS v(name, category, price, description, stock, image, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.products LIMIT 1);

-- -----------------------------------------------------------------------------
-- SEED: Medicines catalog (admin search)
-- -----------------------------------------------------------------------------
INSERT INTO public.medicines (name, category)
SELECT m.name, m.category
FROM (VALUES
    ('Paracetamol 650mg', 'Analgesics'),
    ('Dolo 650', 'Analgesics'),
    ('Amoxicillin 500mg', 'Antibiotics'),
    ('Azithromycin 500mg', 'Antibiotics'),
    ('Cefixime 200mg', 'Antibiotics'),
    ('Cetirizine 10mg', 'Allergy'),
    ('Levocetirizine', 'Allergy'),
    ('Pantoprazole 40mg', 'Gastritis'),
    ('Rabeprazole', 'Gastritis'),
    ('Ondansetron', 'Antiemetic'),
    ('Metformin 500mg', 'Diabetes'),
    ('Glimepiride', 'Diabetes'),
    ('Insulin Human Mixtard', 'Diabetes'),
    ('Amlodipine 5mg', 'Cardiology'),
    ('Telmisartan 40mg', 'Cardiology'),
    ('Losartan 50mg', 'Cardiology'),
    ('Atorvastatin 10mg', 'Cardiology'),
    ('Calcium + Vitamin D3', 'Supplements'),
    ('Iron Folic Acid', 'Supplements'),
    ('Multivitamin Syrup', 'Supplements'),
    ('ORS Sachet', 'General'),
    ('NS Saline Bottle', 'IV Fluids'),
    ('RL Bottle', 'IV Fluids'),
    ('Disposable Syringe 2ml', 'Injections'),
    ('Disposable Syringe 5ml', 'Injections'),
    ('IV Cannula 20G', 'General Hospital'),
    ('Surgical Gloves', 'General Hospital'),
    ('Examination Gloves', 'General Hospital'),
    ('Sterile Cotton Roll', 'General Hospital'),
    ('Bandage Roll', 'General Hospital'),
    ('Betadine Ointment', 'Topical'),
    ('Diclofenac Gel', 'Topical'),
    ('Amoxiclav 625mg', 'Antibiotics'),
    ('Doxycycline 100mg', 'Antibiotics'),
    ('Nebulizer Solution', 'Respiratory'),
    ('Inhaler (Salbutamol)', 'Respiratory'),
    ('Hydrocortisone Injection', 'Emergency'),
    ('Vitamin B12 Injection', 'Injections'),
    ('TT Injection', 'Vaccines'),
    ('Pain Relief Spray', 'Topical')
) AS m(name, category)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Views for API-friendly JSON (optional; backend reads tables directly)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.labtests_api AS
SELECT
    id,
    name,
    category,
    price,
    report_time,
    description,
    img,
    ('₹' || price::text) AS price_label
FROM public.labtests
WHERE is_active = true;

CREATE OR REPLACE VIEW public.products_api AS
SELECT
    id,
    name,
    category,
    price,
    description,
    stock,
    image,
    ('₹' || price::text) AS price_label
FROM public.products
WHERE is_active = true;

-- =============================================================================
-- Render env reminder (backend):
--   SUPABASE_URL=https://xxxx.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=<service_role secret — NOT anon/publishable key>
-- =============================================================================
