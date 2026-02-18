-- Migration: add hero_image_url column to pages table
-- Run this once against your Supabase database.
-- The PageEditor and custom page routes are resilient to the column being absent
-- (they try the full payload first, then fall back without hero_image_url).

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
