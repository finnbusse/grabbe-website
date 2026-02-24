-- ============================================================================
-- Migration: Page Enhancements
-- Adds: is_index flag, hero_subtitle, alt_text, description for documents
-- ============================================================================

-- Category index pages
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS is_index BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_pages_is_index ON public.pages(is_index);

-- Hero subtitle for custom pages
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;

-- Alt text for documents (check before adding — may already exist from previous migration)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Description field for documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS description TEXT;

-- Index for faster image filtering
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON public.documents(file_type);
