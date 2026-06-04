-- SRI KAMALA HOSPITAL: SUPABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor

-- 1. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    order_id TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    department TEXT,
    reason TEXT,
    appointment_date TEXT,
    payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Not Paid', 'Pending', 'Pay at Hospital')),
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. LAB TESTS TABLE (DIAGNOSIS)
CREATE TABLE IF NOT EXISTS public.labtests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT DEFAULT '₹0',
    time TEXT DEFAULT 'Same Day',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCTS TABLE (PHARMACY)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT DEFAULT '₹0',
    category TEXT,
    description TEXT,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) - Simplified for public and admin access
-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert appointments
DROP POLICY IF EXISTS "Public Insert Appointments" ON public.appointments;
CREATE POLICY "Public Insert Appointments" ON public.appointments FOR INSERT WITH CHECK (true);

-- Allow public read for tests and products
DROP POLICY IF EXISTS "Public Read Tests" ON public.labtests;
CREATE POLICY "Public Read Tests" ON public.labtests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
