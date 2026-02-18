-- ============================================================================
-- Migration: Add user_profiles table
-- Purpose: Store extended user profile information (name, title, avatar)
-- ============================================================================

-- Create user_profiles table
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

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.user_profiles IS 'Extended user profiles for CMS users (teachers)';
