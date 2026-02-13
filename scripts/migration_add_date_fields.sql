-- Add event_end_date column for date range support
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_end_date DATE;

-- Add event_date to posts for custom publication dates
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_date DATE;
