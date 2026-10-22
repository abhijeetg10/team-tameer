-- ==========================================================
-- Migration: 20261022_add_payment_fields.sql
-- Adds payment columns (amount, transaction ID, screenshot path, status, method)
-- to public.schools and ensures storage buckets allow payment receipts.
-- ==========================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/dfmsrevoyldpwkhsypud/sql/new
-- 2. Paste this entire script into the SQL Editor and click "Run".
-- ==========================================================

-- 1. Add payment columns to public.schools table if not already present
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS payment_amount NUMERIC DEFAULT 1000;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS payment_screenshot_path TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'GPay / PhonePe (8793224533 - Amin Karmalkar)';

-- 2. Ensure public read/write policies on schools table remain active
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;

-- 3. Storage buckets and policies for payment receipts & documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-documents', 'school-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('school-photos', 'school-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Permissive storage policies for receipts & documents
DROP POLICY IF EXISTS "Public school documents access" ON storage.objects;
DROP POLICY IF EXISTS "Public school photos access" ON storage.objects;

CREATE POLICY "Public school documents access"
ON storage.objects FOR ALL
USING (bucket_id = 'school-documents')
WITH CHECK (bucket_id = 'school-documents');

CREATE POLICY "Public school photos access"
ON storage.objects FOR ALL
USING (bucket_id = 'school-photos')
WITH CHECK (bucket_id = 'school-photos');
