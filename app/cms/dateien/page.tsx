import { createClient } from "@/lib/supabase/server"
import { DocumentsManager } from "@/components/cms/documents-manager"

export default async function DateienPage() {
  const supabase = await createClient()

  const [{ data: documents }, { data: folders }] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("document_folders")
      .select("*")
      .order("name", { ascending: true })
  ])

  return <DocumentsManager initialDocuments={documents || []} initialFolders={folders || []} />
}
