-- ============================================================================
-- Migration: Add Brute Force Protection (Rate Limiting)
-- Idempotent: Safe to run multiple times
-- ============================================================================

-- 1. IP-based rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limit_login_ip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Index for fast lookups by ip_hash and time window
CREATE INDEX IF NOT EXISTS idx_rate_limit_login_ip_hash_time
  ON public.rate_limit_login_ip (ip_hash, attempted_at DESC);

-- 2. Account-based rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limit_login_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Index for fast lookups by email_hash and time window
CREATE INDEX IF NOT EXISTS idx_rate_limit_login_account_hash_time
  ON public.rate_limit_login_account (email_hash, attempted_at DESC);

-- ============================================================================
-- RLS: Enable with NO public access (service role only)
-- ============================================================================

ALTER TABLE public.rate_limit_login_ip ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_login_account ENABLE ROW LEVEL SECURITY;

-- rate_limit_login_ip: service role only
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rate_limit_login_ip_service_select' AND tablename = 'rate_limit_login_ip') THEN
    CREATE POLICY rate_limit_login_ip_service_select ON public.rate_limit_login_ip FOR SELECT TO service_role USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rate_limit_login_ip_service_insert' AND tablename = 'rate_limit_login_ip') THEN
    CREATE POLICY rate_limit_login_ip_service_insert ON public.rate_limit_login_ip FOR INSERT TO service_role WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rate_limit_login_ip_service_delete' AND tablename = 'rate_limit_login_ip') THEN
    CREATE POLICY rate_limit_login_ip_service_delete ON public.rate_limit_login_ip FOR DELETE TO service_role USING (true);
  END IF;
END $$;

-- rate_limit_login_account: service role only
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rate_limit_login_account_service_select' AND tablename = 'rate_limit_login_account') THEN
    CREATE POLICY rate_limit_login_account_service_select ON public.rate_limit_login_account FOR SELECT TO service_role USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rate_limit_login_account_service_insert' AND tablename = 'rate_limit_login_account') THEN
    CREATE POLICY rate_limit_login_account_service_insert ON public.rate_limit_login_account FOR INSERT TO service_role WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rate_limit_login_account_service_delete' AND tablename = 'rate_limit_login_account') THEN
    CREATE POLICY rate_limit_login_account_service_delete ON public.rate_limit_login_account FOR DELETE TO service_role USING (true);
  END IF;
END $$;

-- ============================================================================
-- Cleanup function: Remove entries older than 24 hours (optional cron job)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limit_login_ip WHERE attempted_at < NOW() - INTERVAL '24 hours';
  DELETE FROM public.rate_limit_login_account WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$;
