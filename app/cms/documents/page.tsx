import { createClient } from "@/lib/supabase/server"
import { DocumentsManager } from "@/components/cms/documents-manager"

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })

  return <DocumentsManager initialDocuments={documents || []} />
}
