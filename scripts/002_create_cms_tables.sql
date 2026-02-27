-- DO NOT APPLY IN PRODUCTION.
-- Legacy migration kept for historical reference only.
-- Use scripts/complete_schema.sql for real deployments.

-- CMS Tables for Grabbe-Gymnasium Website

-- News/Aktuelles posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
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

CREATE POLICY "posts_select" ON public.posts
  FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "posts_insert_own" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);
