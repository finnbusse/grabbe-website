-- ============================================================
-- Table: campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,                          -- Internal CMS label only
  headline    text        NOT NULL,                          -- Large heading shown in popup
  message     text        NOT NULL,                          -- Body text (supports line breaks)
  is_active   boolean     NOT NULL DEFAULT false,
  starts_at   timestamptz,                                   -- NULL = show immediately
  ends_at     timestamptz,                                   -- NULL = run indefinitely
  show_once   boolean     NOT NULL DEFAULT true,             -- Track via localStorage
  overlay_style text      NOT NULL DEFAULT 'blur',           -- 'blur' | 'dark' | 'light'
  accent_color  text      NOT NULL DEFAULT '#2563eb',        -- Hex color
  buttons     jsonb       NOT NULL DEFAULT '[]'::jsonb,      -- Array of CampaignButton objects
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Button JSONB schema (per element):
-- {
--   "id":     "uuid-string",
--   "label":  "Register Now",
--   "url":    "/anmeldung",
--   "style":  "primary" | "secondary" | "outline" | "ghost",
--   "target": "_self" | "_blank"
-- }

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active   ON public.campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_time_range  ON public.campaigns(starts_at, ends_at);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Public can read currently active campaigns
CREATE POLICY "Public reads active campaigns"
  ON public.campaigns FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at   IS NULL OR ends_at   >= now())
  );

-- Authenticated users can read all campaigns (for CMS)
CREATE POLICY "Authenticated reads all campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create campaigns
CREATE POLICY "Authenticated inserts campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own campaigns
CREATE POLICY "Authenticated updates own campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can delete their own campaigns
CREATE POLICY "Authenticated deletes own campaigns"
  ON public.campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
