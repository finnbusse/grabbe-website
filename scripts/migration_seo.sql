-- ============================================================================
-- SEO Migration: Add SEO fields to posts and pages, add SEO settings
-- ============================================================================

-- 1. Add SEO columns to posts table
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS seo_og_image TEXT DEFAULT NULL;

-- 2. Add SEO columns to pages table
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS seo_og_image TEXT DEFAULT NULL;

-- 3. Insert default SEO settings (only if they don't exist)

-- Site URL (critical for canonical URLs, sitemap, etc.)
INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_site_url', '', 'text', 'Website-URL', 'seo')
ON CONFLICT (key) DO NOTHING;

-- Title separator (e.g. " | ", " / ", " - ")
INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_title_separator', ' / ', 'text', 'Titel-Trennzeichen', 'seo')
ON CONFLICT (key) DO NOTHING;

-- Title suffix (appears after separator on all pages)
INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_title_suffix', 'Grabbe-Gymnasium', 'text', 'Titel-Suffix', 'seo')
ON CONFLICT (key) DO NOTHING;

-- robots.txt content
INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_robots_txt', 'User-agent: *
Allow: /
Disallow: /cms/
Disallow: /auth/
Disallow: /api/', 'textarea', 'robots.txt Inhalt', 'seo')
ON CONFLICT (key) DO NOTHING;

-- Default meta description for pages without custom one
INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_default_description', 'Das Christian-Dietrich-Grabbe-Gymnasium in Detmold - Wir foerdern Deine Talente und staerken Deine Persoenlichkeit.', 'textarea', 'Standard Meta-Beschreibung', 'seo')
ON CONFLICT (key) DO NOTHING;

-- Organization schema fields
INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_name', 'Grabbe-Gymnasium Detmold', 'text', 'Organisationsname (Schema)', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_logo', '', 'image', 'Organisations-Logo (Schema)', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_email', '', 'text', 'Organisations-E-Mail (Schema)', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_phone', '', 'text', 'Organisations-Telefon (Schema)', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_address_street', '', 'text', 'Strasse (Schema)', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_address_city', 'Detmold', 'text', 'Stadt (Schema)', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_address_zip', '', 'text', 'PLZ (Schema)', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_org_address_country', 'DE', 'text', 'Land (ISO-Code, Schema)', 'seo')
ON CONFLICT (key) DO NOTHING;

-- Social media URLs for Organization schema
INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_social_instagram', '', 'text', 'Instagram-URL', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_social_facebook', '', 'text', 'Facebook-URL', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_social_youtube', '', 'text', 'YouTube-URL', 'seo')
ON CONFLICT (key) DO NOTHING;

-- Homepage-specific SEO settings
INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_homepage_title_prefix', 'Start', 'text', 'Startseiten-Praefix', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (id, key, value, type, label, category)
VALUES (gen_random_uuid(), 'seo_homepage_description', '', 'textarea', 'Startseiten-Beschreibung', 'seo')
ON CONFLICT (key) DO NOTHING;
