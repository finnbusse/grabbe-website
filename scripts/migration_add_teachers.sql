-- ============================================================================
-- Migration: Add Teachers & Organisation System
-- ============================================================================
-- Creates the teachers table, teacher_subjects junction table, and
-- content-author junction tables for posts, parent_letters, and
-- presentations.  Teachers can later be linked to user accounts.
-- ============================================================================

-- 1. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gender TEXT NOT NULL DEFAULT '' CHECK (gender IN ('', 'male', 'female', 'diverse')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  abbreviation TEXT NOT NULL UNIQUE,  -- e.g. "hig" (Kürzel, usually 3 letters)
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- optional link to user account
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teachers_abbreviation ON public.teachers(abbreviation);
CREATE INDEX IF NOT EXISTS idx_teachers_last_name ON public.teachers(last_name);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_select_all" ON public.teachers
  FOR SELECT USING (true);

CREATE POLICY "teachers_insert_auth" ON public.teachers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "teachers_update_auth" ON public.teachers
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "teachers_delete_auth" ON public.teachers
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2. TEACHER_SUBJECTS JUNCTION TABLE
-- Stores which subjects a teacher teaches; references subject IDs from
-- the canonical SUBJECTS list in lib/constants/subjects.ts (string IDs).
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  PRIMARY KEY (teacher_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_id ON public.teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject_id ON public.teacher_subjects(subject_id);

ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_subjects_select_all" ON public.teacher_subjects
  FOR SELECT USING (true);

CREATE POLICY "teacher_subjects_insert_auth" ON public.teacher_subjects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "teacher_subjects_delete_auth" ON public.teacher_subjects
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3. POST_AUTHORS JUNCTION TABLE
-- Links posts to teacher(s) as author(s).
CREATE TABLE IF NOT EXISTS public.post_authors (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_post_authors_post_id ON public.post_authors(post_id);
CREATE INDEX IF NOT EXISTS idx_post_authors_teacher_id ON public.post_authors(teacher_id);

ALTER TABLE public.post_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_authors_select_all" ON public.post_authors
  FOR SELECT USING (true);

CREATE POLICY "post_authors_insert_auth" ON public.post_authors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_authors_delete_auth" ON public.post_authors
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 4. PARENT_LETTER_AUTHORS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.parent_letter_authors (
  parent_letter_id UUID NOT NULL REFERENCES public.parent_letters(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_letter_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_letter_authors_letter_id ON public.parent_letter_authors(parent_letter_id);
CREATE INDEX IF NOT EXISTS idx_parent_letter_authors_teacher_id ON public.parent_letter_authors(teacher_id);

ALTER TABLE public.parent_letter_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_letter_authors_select_all" ON public.parent_letter_authors
  FOR SELECT USING (true);

CREATE POLICY "parent_letter_authors_insert_auth" ON public.parent_letter_authors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "parent_letter_authors_delete_auth" ON public.parent_letter_authors
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 5. PRESENTATION_AUTHORS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.presentation_authors (
  presentation_id UUID NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  PRIMARY KEY (presentation_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_presentation_authors_pres_id ON public.presentation_authors(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_authors_teacher_id ON public.presentation_authors(teacher_id);

ALTER TABLE public.presentation_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presentation_authors_select_all" ON public.presentation_authors
  FOR SELECT USING (true);

CREATE POLICY "presentation_authors_insert_auth" ON public.presentation_authors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "presentation_authors_delete_auth" ON public.presentation_authors
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 6. TRIGGER FOR TEACHERS UPDATED_AT
DROP TRIGGER IF EXISTS update_teachers_updated_at ON public.teachers;
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. COMMENTS
COMMENT ON TABLE public.teachers IS 'Teachers / staff members of the school';
COMMENT ON TABLE public.teacher_subjects IS 'Junction: teacher <-> subject (references subject ID from app constants)';
COMMENT ON TABLE public.post_authors IS 'Junction: post <-> teacher author(s)';
COMMENT ON TABLE public.parent_letter_authors IS 'Junction: parent_letter <-> teacher author(s)';
COMMENT ON TABLE public.presentation_authors IS 'Junction: presentation <-> teacher author(s)';
