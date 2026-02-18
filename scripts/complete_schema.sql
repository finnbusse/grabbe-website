-- ============================================================================
-- Complete Database Schema for School CMS (PostgreSQL/Supabase)
-- ============================================================================
-- This script creates all tables for the school CMS system
-- Schema: public
-- Primary Keys: UUID (default gen_random_uuid())
-- Timestamps: timestamptz (default now())
-- ============================================================================

-- ============================================================================
-- 1. PAGES TABLE
-- Purpose: Static pages (Impressum, Oberstufe, Anmeldung, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  section TEXT DEFAULT 'allgemein',
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_system BOOLEAN DEFAULT false,
  route_path TEXT,
  hero_image_url TEXT
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_section ON public.pages(section);
CREATE INDEX IF NOT EXISTS idx_pages_published ON public.pages(published);
CREATE INDEX IF NOT EXISTS idx_pages_sort_order ON public.pages(sort_order);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages
CREATE POLICY "pages_select_published" ON public.pages
  FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "pages_insert_auth" ON public.pages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "pages_update_auth" ON public.pages
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "pages_delete_auth" ON public.pages
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- 2. POSTS TABLE
-- Purpose: Blog posts / News
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  excerpt TEXT,
  category TEXT DEFAULT 'aktuelles',
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  image_url TEXT,
  author_name TEXT,
  event_date DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "posts_select_published" ON public.posts
  FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "posts_insert_own" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 3. EVENTS TABLE
-- Purpose: School events / Calendar entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_end_date DATE,
  event_time TEXT,
  location TEXT,
  category TEXT DEFAULT 'termin',
  published BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_published ON public.events(published);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "events_select_published" ON public.events
  FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "events_insert_own" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_update_own" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "events_delete_own" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 4. DOCUMENTS TABLE
-- Purpose: Downloads (PDFs, files)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT,
  category TEXT DEFAULT 'allgemein',
  published BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_published ON public.documents(published);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "documents_select_published" ON public.documents
  FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "documents_insert_auth" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_auth" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "documents_delete_auth" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 5. NAVIGATION_ITEMS TABLE
-- Purpose: Header/Footer navigation (hierarchical)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  location TEXT DEFAULT 'header',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_navigation_items_parent_id ON public.navigation_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_items_location ON public.navigation_items(location);
CREATE INDEX IF NOT EXISTS idx_navigation_items_visible ON public.navigation_items(visible);
CREATE INDEX IF NOT EXISTS idx_navigation_items_sort_order ON public.navigation_items(sort_order);

-- Enable RLS
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for navigation_items
CREATE POLICY "navigation_items_select_visible" ON public.navigation_items
  FOR SELECT USING (visible = true OR auth.uid() IS NOT NULL);

CREATE POLICY "navigation_items_insert_auth" ON public.navigation_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "navigation_items_update_auth" ON public.navigation_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "navigation_items_delete_auth" ON public.navigation_items
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- 6. SITE_SETTINGS TABLE
-- Purpose: Key-value configuration store
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  type TEXT DEFAULT 'text',
  label TEXT,
  category TEXT DEFAULT 'allgemein',
  updated_at TIMESTAMPTZ DEFAULT now(),
  protected BOOLEAN DEFAULT false
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON public.site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_protected ON public.site_settings(protected);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "site_settings_select_all" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings_insert_auth" ON public.site_settings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "site_settings_update_auth" ON public.site_settings
  FOR UPDATE USING (auth.uid() IS NOT NULL AND protected = false);

CREATE POLICY "site_settings_delete_auth" ON public.site_settings
  FOR DELETE USING (auth.uid() IS NOT NULL AND protected = false);

-- ============================================================================
-- 7. CONTACT_SUBMISSIONS TABLE
-- Purpose: Contact form entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read ON public.contact_submissions(read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_submissions
CREATE POLICY "contact_submissions_insert_all" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_submissions_select_auth" ON public.contact_submissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "contact_submissions_update_auth" ON public.contact_submissions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "contact_submissions_delete_auth" ON public.contact_submissions
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- 8. ANMELDUNG_SUBMISSIONS TABLE
-- Purpose: School registration form entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.anmeldung_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name TEXT NOT NULL,
  child_birthday DATE,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT,
  grundschule TEXT,
  anmeldung_type TEXT DEFAULT 'klasse5',
  wunschpartner TEXT,
  profilprojekt TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_anmeldung_submissions_created_at ON public.anmeldung_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anmeldung_submissions_parent_email ON public.anmeldung_submissions(parent_email);
CREATE INDEX IF NOT EXISTS idx_anmeldung_submissions_anmeldung_type ON public.anmeldung_submissions(anmeldung_type);

-- Enable RLS
ALTER TABLE public.anmeldung_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anmeldung_submissions
CREATE POLICY "anmeldung_submissions_insert_all" ON public.anmeldung_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anmeldung_submissions_select_auth" ON public.anmeldung_submissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "anmeldung_submissions_update_auth" ON public.anmeldung_submissions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "anmeldung_submissions_delete_auth" ON public.anmeldung_submissions
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- 9. USER_PROFILES TABLE
-- Purpose: Extended user profiles for CMS users (teachers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  title TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: anyone can read profiles (for public news pages), authenticated can modify
CREATE POLICY "user_profiles_select_all" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "user_profiles_insert_auth" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "user_profiles_update_auth" ON public.user_profiles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "user_profiles_delete_auth" ON public.user_profiles
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at column
DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_navigation_items_updated_at ON public.navigation_items;
CREATE TRIGGER update_navigation_items_updated_at
  BEFORE UPDATE ON public.navigation_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.pages IS 'Static pages (Impressum, Oberstufe, Anmeldung, etc.)';
COMMENT ON TABLE public.posts IS 'Blog posts / News';
COMMENT ON TABLE public.events IS 'School events / Calendar entries';
COMMENT ON TABLE public.documents IS 'Downloads (PDFs, files)';
COMMENT ON TABLE public.navigation_items IS 'Header/Footer navigation (hierarchical)';
COMMENT ON TABLE public.site_settings IS 'Key-value configuration store';
COMMENT ON TABLE public.contact_submissions IS 'Contact form entries';
COMMENT ON TABLE public.anmeldung_submissions IS 'School registration form entries';
COMMENT ON TABLE public.user_profiles IS 'Extended user profiles for CMS users (teachers)';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
