-- Migration: Media Library enhancements
-- Adds alt_text column and file_type index for faster filtering

-- Add alt_text to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Index for faster image filtering
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON public.documents(file_type);
