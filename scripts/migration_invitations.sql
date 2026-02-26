-- Migration: Create invitations table for CMS member invite flow
-- Idempotent: safe to run multiple times

CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role_id UUID REFERENCES public.cms_roles(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  personal_message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast token lookups during onboarding
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);

-- Index for listing pending invitations
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- RLS policies
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read invitations (admin check is done in API routes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'invitations_select_authenticated'
  ) THEN
    CREATE POLICY invitations_select_authenticated ON public.invitations
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Allow authenticated users to insert invitations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'invitations_insert_authenticated'
  ) THEN
    CREATE POLICY invitations_insert_authenticated ON public.invitations
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to update invitations (for marking as accepted)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'invitations_update_authenticated'
  ) THEN
    CREATE POLICY invitations_update_authenticated ON public.invitations
      FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- Allow authenticated users to delete invitations (for revoking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'invitations_delete_authenticated'
  ) THEN
    CREATE POLICY invitations_delete_authenticated ON public.invitations
      FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- Allow anonymous/public read for token validation during onboarding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'invitations_select_anon'
  ) THEN
    CREATE POLICY invitations_select_anon ON public.invitations
      FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- Allow service role to update (for marking accepted during onboarding)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'invitations_update_service'
  ) THEN
    CREATE POLICY invitations_update_service ON public.invitations
      FOR UPDATE TO service_role USING (true);
  END IF;
END $$;
