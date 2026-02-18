-- ============================================================================
-- Migration: Add Tags System
-- ============================================================================
-- Creates a tags table and junction tables for events, documents, and posts.
-- Tags have a name and color, and can be assigned to multiple content items.
-- This allows filtering content by tag on public pages via block types.
-- ============================================================================

-- 1. TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select_all" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "tags_insert_auth" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tags_update_auth" ON public.tags
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "tags_delete_auth" ON public.tags
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2. EVENT_TAGS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.event_tags (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON public.event_tags(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag_id ON public.event_tags(tag_id);

ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_tags_select_all" ON public.event_tags
  FOR SELECT USING (true);

CREATE POLICY "event_tags_insert_auth" ON public.event_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "event_tags_delete_auth" ON public.event_tags
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3. DOCUMENT_TAGS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.document_tags (
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON public.document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id ON public.document_tags(tag_id);

ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_tags_select_all" ON public.document_tags
  FOR SELECT USING (true);

CREATE POLICY "document_tags_insert_auth" ON public.document_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "document_tags_delete_auth" ON public.document_tags
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 4. POST_TAGS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON public.post_tags(tag_id);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_tags_select_all" ON public.post_tags
  FOR SELECT USING (true);

CREATE POLICY "post_tags_insert_auth" ON public.post_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_tags_delete_auth" ON public.post_tags
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 5. TRIGGER FOR TAGS UPDATED_AT
DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. COMMENTS
COMMENT ON TABLE public.tags IS 'Tags for categorizing events, documents, and posts';
COMMENT ON TABLE public.event_tags IS 'Junction table linking events to tags';
COMMENT ON TABLE public.document_tags IS 'Junction table linking documents to tags';
COMMENT ON TABLE public.post_tags IS 'Junction table linking posts to tags';
