ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Ensure RLS allows reading if public or authenticated
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Enable read access for all users if document is public'
    ) THEN
        CREATE POLICY "Enable read access for all users if document is public"
            ON public.documents FOR SELECT
            USING (is_public = true OR auth.role() = 'authenticated');
    END IF;

    -- Drop the default "Enable read access for all users" if it exists so our public flag matters
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Enable read access for all users'
    ) THEN
        DROP POLICY "Enable read access for all users" ON public.documents;
    END IF;
END $$;
