-- Migration: 20261016_clear_all_data.sql
-- Run this in your Supabase Dashboard > SQL Editor to wipe each and every record
-- and attachment completely clean from the database and storage buckets.

-- 1. Wipe all registration and school tables
TRUNCATE TABLE public.registration_reviews CASCADE;
TRUNCATE TABLE public.students CASCADE;
TRUNCATE TABLE public.mentors CASCADE;
TRUNCATE TABLE public.school_members CASCADE;
TRUNCATE TABLE public.schools CASCADE;
TRUNCATE TABLE public.audit_logs CASCADE;

-- 2. Delete all uploaded files from storage buckets
DELETE FROM storage.objects WHERE bucket_id IN ('school-photos', 'school-documents');

-- 3. Reset participating schools active status (if modified)
UPDATE public.participating_schools SET is_active = true;
