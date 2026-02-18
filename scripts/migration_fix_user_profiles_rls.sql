-- ============================================================================
-- Migration: Fix user_profiles SELECT policy for public access
-- Purpose: Allow public pages (news) to display author avatars
-- ============================================================================

-- Drop the old auth-only SELECT policy
DROP POLICY IF EXISTS "user_profiles_select_auth" ON public.user_profiles;

-- Create new public SELECT policy (profiles are not sensitive data)
CREATE POLICY "user_profiles_select_all" ON public.user_profiles
  FOR SELECT USING (true);
