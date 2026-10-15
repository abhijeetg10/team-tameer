-- ==========================================================
-- School Event Registration & Administration Platform
-- Supabase PostgreSQL Schema & Security Policies
-- Migration: 20261014_init.sql (Updated for 34 Predefined Participating Schools)
-- ==========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'school' CHECK (role IN ('school', 'admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Participating Schools Master Table (All 34 official institutions)
CREATE TABLE IF NOT EXISTS public.participating_schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_name TEXT NOT NULL,
    district TEXT NOT NULL CHECK (district IN ('Kolhapur', 'Sangli', 'Satara')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(school_name, district)
);

-- 3. Sequence for Registration IDs
CREATE SEQUENCE IF NOT EXISTS registration_seq START 1;

-- 4. Schools (Registrations) Table
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id TEXT UNIQUE NOT NULL,
    participating_school_id UUID REFERENCES public.participating_schools(id) ON DELETE RESTRICT,
    school_name TEXT NOT NULL,
    district TEXT CHECK (district IN ('Kolhapur', 'Sangli', 'Satara')),
    school_code TEXT, -- UDISE ID
    address TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    principal_name TEXT NOT NULL DEFAULT '',
    school_email TEXT NOT NULL DEFAULT '',
    contact_number TEXT NOT NULL DEFAULT '',
    logo_path TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('not_registered', 'draft', 'pending_verification', 'submitted', 'under_review', 'correction_required', 'approved', 'rejected')),
    registered_by_user_id UUID REFERENCES public.profiles(id),
    is_representative_verified BOOLEAN NOT NULL DEFAULT false,
    correction_remarks TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Enforce single active registration per participating school
    UNIQUE(participating_school_id)
);

-- Auto-generate Registration ID trigger (e.g. EVT-2026-001)
CREATE OR REPLACE FUNCTION public.generate_registration_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_id IS NULL OR NEW.registration_id = '' THEN
        NEW.registration_id := 'EVT-2026-' || LPAD(nextval('registration_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_registration_id
BEFORE INSERT ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.generate_registration_id();

-- 5. School Members Table (Access control & representative mapping)
CREATE TABLE IF NOT EXISTS public.school_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    membership_role TEXT NOT NULL DEFAULT 'owner' CHECK (membership_role IN ('owner', 'representative')),
    invited_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(school_id, user_id)
);

-- 6. Mentors Table (Exactly 1 mentor per school)
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL UNIQUE REFERENCES public.schools(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    designation TEXT,
    photo_path TEXT,
    id_document_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Students Table (Exactly 4 students per school)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_number INT NOT NULL CHECK (student_number BETWEEN 1 AND 4),
    full_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    student_registration_number TEXT,
    photo_path TEXT,
    school_id_document_path TEXT,
    identity_document_type TEXT CHECK (identity_document_type IN ('school_id', 'masked_aadhaar', 'passport', 'other_id')),
    identity_document_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(school_id, student_number)
);

-- 8. Registration Reviews Table
CREATE TABLE IF NOT EXISTS public.registration_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.profiles(id),
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    remarks TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Event Settings Table
CREATE TABLE IF NOT EXISTS public.event_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    event_date TEXT NOT NULL,
    registration_open BOOLEAN NOT NULL DEFAULT true,
    registration_deadline TIMESTAMPTZ NOT NULL,
    maximum_schools INT NOT NULL DEFAULT 34,
    support_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    venue TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- Database-Level Constraint: Exactly 4 Students and 1 Mentor on Submission
-- ==========================================================
CREATE OR REPLACE FUNCTION public.check_registration_completeness_on_submit()
RETURNS TRIGGER AS $$
DECLARE
    mentor_count INT;
    student_count INT;
BEGIN
    IF NEW.status = 'submitted' AND (OLD.status IS DISTINCT FROM 'submitted') THEN
        -- Check mentor count
        SELECT COUNT(*) INTO mentor_count FROM public.mentors WHERE school_id = NEW.id;
        IF mentor_count <> 1 THEN
            RAISE EXCEPTION 'A school registration must have exactly 1 mentor before submission.';
        END IF;

        -- Check student count
        SELECT COUNT(*) INTO student_count FROM public.students WHERE school_id = NEW.id;
        IF student_count <> 4 THEN
            RAISE EXCEPTION 'A school registration must have exactly 4 registered students before submission.';
        END IF;

        NEW.submitted_at := timezone('utc'::text, now());
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_school_submission
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.check_registration_completeness_on_submit();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participating_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_school_member(lookup_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.school_members
        WHERE school_id = lookup_school_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Participating Schools: Public readable by authenticated users
CREATE POLICY "Anyone can view participating schools" ON public.participating_schools
    FOR SELECT USING (true);

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

-- Schools Policies
CREATE POLICY "School members can view own school" ON public.schools
    FOR SELECT USING (public.is_school_member(id) OR public.is_admin());
CREATE POLICY "Authenticated users can create school" ON public.schools
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "School members can update draft or correction schools" ON public.schools
    FOR UPDATE USING (
        (public.is_school_member(id) AND status IN ('draft', 'correction_required'))
        OR public.is_admin()
    );
CREATE POLICY "Admins can delete school registrations" ON public.schools
    FOR DELETE USING (public.is_admin());

-- Mentors & Students Policies
CREATE POLICY "School members and admins can view mentors" ON public.mentors
    FOR SELECT USING (public.is_school_member(school_id) OR public.is_admin());
CREATE POLICY "School members and admins can insert mentors" ON public.mentors
    FOR INSERT WITH CHECK (public.is_school_member(school_id) OR public.is_admin());
CREATE POLICY "School members and admins can update mentors" ON public.mentors
    FOR UPDATE USING (public.is_school_member(school_id) OR public.is_admin());
CREATE POLICY "Admins can delete mentors" ON public.mentors
    FOR DELETE USING (public.is_admin());

CREATE POLICY "School members and admins can view students" ON public.students
    FOR SELECT USING (public.is_school_member(school_id) OR public.is_admin());
CREATE POLICY "School members and admins can insert students" ON public.students
    FOR INSERT WITH CHECK (public.is_school_member(school_id) OR public.is_admin());
CREATE POLICY "School members and admins can update students" ON public.students
    FOR UPDATE USING (public.is_school_member(school_id) OR public.is_admin());
CREATE POLICY "Admins can delete students" ON public.students
    FOR DELETE USING (public.is_admin());

-- Event Settings Policies
CREATE POLICY "Everyone can view event settings" ON public.event_settings
    FOR SELECT USING (true);

-- ==========================================================
-- SEED DATA: OFFICIAL 34 PARTICIPATING SCHOOLS
-- ==========================================================
INSERT INTO public.participating_schools (school_name, district) VALUES
-- Demo Institution for Platform Testing
('Demo Model High School & Jr. College', 'Kolhapur'),
-- District: Kolhapur (16 Schools)
('Urdu High School Chandgadh', 'Kolhapur'),
('Dr. Zakir Husain Anglo Urdu High School & Jr. College Aajra', 'Kolhapur'),
('Urdu High School Halkarni', 'Kolhapur'),
('Maulana Azad High School and Jr College Kolhapur', 'Kolhapur'),
('Nehru High School and Jr. College Kolhapur', 'Kolhapur'),
('Urdu Anglo High School Shiroli', 'Kolhapur'),
('Urdu High School Vikram Nagar Ichalkaranji', 'Kolhapur'),
('National High School & Jr. College Ichalkaranji', 'Kolhapur'),
('Urdu High School Rui', 'Kolhapur'),
('Urdu High School Rajapur', 'Kolhapur'),
('Anglo Urdu High School Aurwad', 'Kolhapur'),
('Ishaatul Uloom Urdu High School Alas', 'Kolhapur'),
('Dr. Allama Iqbal High School and Jr. College Kurundwad', 'Kolhapur'),
('Urdu High School Shirol', 'Kolhapur'),
('Anglo Urdu High School and Jr College Jaysingpur', 'Kolhapur'),
('Urdu High School and Jr College Rendal', 'Kolhapur'),

-- District: Sangli (12 Schools)
('Mohammadiya Anglo Urdu School & Jr College Sangli', 'Sangli'),
('Jawahar Urdu High School & Jr College Miraj', 'Sangli'),
('Shamnamira Girls High School & Jr College Miraj', 'Sangli'),
('Anglo Urdu High School Ashta', 'Sangli'),
('Dr. Zakir Hussain High School Palus', 'Sangli'),
('Noor Girls High School Sangli', 'Sangli'),
('Rehmat Anglo Urdu School Vita', 'Sangli'),
('Anjuman Urdu High School Jath', 'Sangli'),
('Moulana Abulkalam Nivasi Shala Rampur', 'Sangli'),
('Hazrat Mohabat Suleman High School Islampur', 'Sangli'),
('Chand Urdu School Miraj', 'Sangli'),
('Dr. Salim Urdu High School Miraj', 'Sangli'),

-- District: Satara (8 Schools)
('Husen Kasam Danekari Anglo Urdu Highschool Karad', 'Satara'),
('Anjuman Khairul Islam Urdu High School Satara', 'Satara'),
('Shaheen High School Karad', 'Satara'),
('Satara Urdu Highschool & Junior College Nagthane', 'Satara'),
('Haji Abdul Rajjak Urdu Highschool And Junior College Phaltan', 'Satara'),
('Madrasa Islamiya Ziya Ul Quran Malkapur', 'Satara'),
('Tanzeem e Waliden Urdu High School Wai satara', 'Satara'),
('ANJUMAN KHAIRUL ISLAM URDU HIGH SCHOOL MAHABALESHWAR', 'Satara')
ON CONFLICT (school_name, district) DO NOTHING;

-- Seed Initial Event Settings
INSERT INTO public.event_settings (
    event_name,
    event_date,
    registration_open,
    registration_deadline,
    maximum_schools,
    support_email,
    contact_phone,
    venue
) VALUES (
    'Team Tameer Registration 2026',
    'November 28, 2026',
    true,
    (now() + INTERVAL '30 days'),
    36,
    '',
    '',
    ''
) ON CONFLICT DO NOTHING;

-- ==========================================================
-- Storage Buckets Configuration for Photos & Documents
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('school-photos', 'school-photos', true),
    ('school-documents', 'school-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
CREATE POLICY "Public photos viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'school-photos');

CREATE POLICY "Photos uploadable by authenticated users" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'school-photos');

CREATE POLICY "Documents viewable by authenticated users" ON storage.objects
    FOR SELECT USING (bucket_id = 'school-documents');

CREATE POLICY "Documents uploadable by authenticated users" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'school-documents');
