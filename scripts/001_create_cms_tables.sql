-- DO NOT APPLY IN PRODUCTION.
-- Legacy migration kept for historical reference only.
-- Use scripts/complete_schema.sql for real deployments.

-- CMS Tables for Grabbe-Gymnasium Website

-- News/Aktuelles posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT DEFAULT 'aktuelles',
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  image_url TEXT,
  author_name TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "posts_select_published" ON public.posts
  FOR SELECT USING (published = true);

-- Authenticated users can read all posts
CREATE POLICY "posts_select_auth" ON public.posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authors can insert their own posts
CREATE POLICY "posts_insert_own" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authors can update their own posts
CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Authors can delete their own posts
CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Pages table for static content management
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  section TEXT DEFAULT 'allgemein',
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_select_published" ON public.pages
  FOR SELECT USING (published = true);

CREATE POLICY "pages_select_auth" ON public.pages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "pages_insert_own" ON public.pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pages_update_own" ON public.pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pages_delete_own" ON public.pages
  FOR DELETE USING (auth.uid() = user_id);

-- Events/Calendar table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_end_date DATE,
  location TEXT,
  category TEXT DEFAULT 'allgemein',
  published BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_published" ON public.events
  FOR SELECT USING (published = true);

CREATE POLICY "events_select_auth" ON public.events
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "events_insert_own" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_update_own" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "events_delete_own" ON public.events
  FOR DELETE USING (auth.uid() = user_id);
