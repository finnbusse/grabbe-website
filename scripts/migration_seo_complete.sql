-- ============================================================================
-- SEO Complete Migration: Extended SEO fields for pages, posts, and settings
-- All statements are idempotent (safe to run multiple times)
-- ============================================================================

-- 1. Add extended SEO columns to pages table
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS seo_no_index BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seo_canonical_override TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'website';

-- 2. Add extended SEO columns to posts table
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS seo_no_index BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seo_canonical_override TEXT DEFAULT NULL;

-- 3. Insert new SEO settings (category: 'seo')
-- Uses ON CONFLICT (key) DO NOTHING to avoid duplicates

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_twitter_handle', '', 'text', 'Twitter/X Handle', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_google_verification', '', 'text', 'Google Site Verification', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_bing_verification', '', 'text', 'Bing Site Verification', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_locale', 'de_DE', 'text', 'Locale', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_geo_region', 'DE-NW', 'text', 'Geo Region', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_geo_placename', 'Detmold', 'text', 'Geo Placename', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_geo_lat', '51.9318', 'text', 'Geo Latitude', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_geo_lng', '8.8800', 'text', 'Geo Longitude', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_schema_type', 'HighSchool', 'text', 'Schema.org Organisationstyp', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_founding_year', '', 'text', 'Gründungsjahr', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_legal_name', '', 'text', 'Offizieller Name', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_wikidata', '', 'text', 'Wikidata-URL', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_opening_hours', 'Mo-Fr 07:30-16:00', 'text', 'Öffnungszeiten', 'seo')
ON CONFLICT (key) DO NOTHING;
