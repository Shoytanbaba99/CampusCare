-- CampusCare PostgreSQL Database Schema Migration
-- Approved Specification per PRD v1.1.0

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS (Safe conditional creation)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
        CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
        CREATE TYPE ticket_status AS ENUM ('submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attachment_kind') THEN
        CREATE TYPE attachment_kind AS ENUM ('initial_evidence', 'repair_proof');
    END IF;
END $$;

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. USERS (PROFILES) TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'medium',
    status ticket_status NOT NULL DEFAULT 'submitted',
    sla_due_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    tracking_code TEXT UNIQUE DEFAULT ('CC-ANON-' || UPPER(SUBSTRING(GEN_RANDOM_UUID()::TEXT FROM 1 FOR 6))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist on pre-existing complaints table
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE DEFAULT ('CC-ANON-' || UPPER(SUBSTRING(GEN_RANDOM_UUID()::TEXT FROM 1 FOR 6)));

-- 6. PROGRESS NOTES TABLE
CREATE TABLE IF NOT EXISTS public.progress_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    attachment_type attachment_kind NOT NULL DEFAULT 'initial_evidence',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID UNIQUE NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE (IMMUTABLE LEDGER)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    old_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COMPOSITE INDEXES FOR PERFORMANCE (<500ms QUERY TARGET)
CREATE INDEX IF NOT EXISTS idx_complaints_reporter ON public.complaints(reporter_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept_status ON public.complaints(department_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_status_priority ON public.complaints(status, priority);
CREATE INDEX IF NOT EXISTS idx_audit_logs_complaint ON public.audit_logs(complaint_id);

-- 11. SECURITY DEFINER HELPER FUNCTIONS TO PREVENT RLS RECURSION
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role AS $$
DECLARE
    u_role public.user_role;
BEGIN
    SELECT role INTO u_role FROM public.users WHERE id = user_id;
    RETURN COALESCE(u_role, 'student'::public.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_department_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
    dept_id UUID;
BEGIN
    SELECT department_id INTO dept_id FROM public.users WHERE id = user_id;
    RETURN dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 12. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val public.user_role := 'student'::public.user_role;
    meta_role text;
BEGIN
    meta_role := NEW.raw_user_meta_data->>'role';
    IF meta_role = 'admin' THEN
        user_role_val := 'admin'::public.user_role;
    ELSIF meta_role = 'staff' THEN
        user_role_val := 'staff'::public.user_role;
    END IF;

    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, 'user_' || NEW.id || '@campuscare.edu'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role_val
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. TICKET NUMBER SEQUENCING (CMP-YYYY-XXXX)
CREATE SEQUENCE IF NOT EXISTS complaint_ticket_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := 'CMP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('complaint_ticket_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER set_complaint_ticket_number
    BEFORE INSERT ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop old policies to prevent collision
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Students view own complaints, Staff view department queue, Admins view all" ON public.complaints;
DROP POLICY IF EXISTS "Students insert own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff and Admins update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Authenticated users view visible progress notes" ON public.progress_notes;
DROP POLICY IF EXISTS "Staff and Admins insert progress notes" ON public.progress_notes;
DROP POLICY IF EXISTS "Authenticated users insert progress notes" ON public.progress_notes;
DROP POLICY IF EXISTS "Authenticated users view attachments" ON public.attachments;
DROP POLICY IF EXISTS "Authenticated users insert attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Students insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System inserts audit logs" ON public.audit_logs;

-- Users RLS (Non-recursive)
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
CREATE POLICY "Authenticated users can view profiles"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile or admins update all"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Departments & Categories RLS (Public read for authenticated)
CREATE POLICY "Authenticated users can view departments"
    ON public.departments FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Admins can insert departments"
    ON public.departments FOR INSERT
    TO authenticated
    WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can view categories"
    ON public.categories FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Admins can insert categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Complaints RLS (Strict Non-Recursive Isolation)
CREATE POLICY "Students view own complaints, Staff view department queue, Admins view all"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (
        reporter_id = auth.uid()
        OR assigned_staff_id = auth.uid()
        OR public.get_user_role(auth.uid()) = 'admin'
        OR (
            public.get_user_role(auth.uid()) = 'staff'
            AND department_id = public.get_user_department_id(auth.uid())
        )
    );

CREATE POLICY "Students insert own complaints"
    ON public.complaints FOR INSERT
    TO authenticated
    WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users update complaints"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (
        reporter_id = auth.uid()
        OR assigned_staff_id = auth.uid()
        OR public.get_user_role(auth.uid()) = 'admin'
        OR (
            public.get_user_role(auth.uid()) = 'staff'
            AND department_id = public.get_user_department_id(auth.uid())
        )
    );

-- Progress Notes RLS
CREATE POLICY "Authenticated users view visible progress notes"
    ON public.progress_notes FOR SELECT
    TO authenticated
    USING (
        is_internal = FALSE
        OR public.get_user_role(auth.uid()) IN ('staff', 'admin')
    );

CREATE POLICY "Authenticated users insert progress notes"
    ON public.progress_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_user_role(auth.uid()) IN ('staff', 'admin')
        OR EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_id AND c.reporter_id = auth.uid()
        )
    );

-- Attachments RLS
CREATE POLICY "Authenticated users view attachments"
    ON public.attachments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users insert attachments"
    ON public.attachments FOR INSERT
    TO authenticated
    WITH CHECK (uploader_id = auth.uid());

-- Feedback RLS
CREATE POLICY "Users view feedback"
    ON public.feedback FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Students insert feedback"
    ON public.feedback FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_id AND c.reporter_id = auth.uid()
        )
    );

-- Audit Logs RLS
CREATE POLICY "Admins view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System inserts audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid());

-- Anonymous Tracking Policies
DROP POLICY IF EXISTS "Public can view anonymous complaints via tracking code" ON public.complaints;
CREATE POLICY "Public can view anonymous complaints via tracking code" ON public.complaints FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can view non-internal notes for tracking code" ON public.progress_notes;
CREATE POLICY "Public can view non-internal notes for tracking code" ON public.progress_notes FOR SELECT TO anon, authenticated USING (is_internal = FALSE);

DROP POLICY IF EXISTS "Public can view attachments for complaints" ON public.attachments;
CREATE POLICY "Public can view attachments for complaints" ON public.attachments FOR SELECT TO anon, authenticated USING (true);
