import { SiteLayout } from "@/components/site-layout"
import { createClient } from "@/lib/supabase/server"
import { Download, FileText, ImageIcon, ExternalLink } from "lucide-react"
import { DownloadCategories } from "@/components/download-categories"

export const metadata = {
  title: "Downloads - Grabbe-Gymnasium Detmold",
  description: "Dokumente, Formulare und Materialien zum Herunterladen.",
}

export default async function DownloadsPage() {
  const supabase = await createClient()
  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("published", true)
    .order("category", { ascending: true })
    .order("created_at", { ascending: false })

  const items = docs || []

  // Group by category
  const grouped: Record<string, typeof items> = {}
  items.forEach((doc) => {
    const cat = doc.category || "allgemein"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(doc)
  })

  return (
    <SiteLayout>
      <main>
        <section className="border-b bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-primary">Materialien</p>
                <h1 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">Downloads</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Hier finden Sie alle Dokumente, Formulare und Materialien zum Herunterladen.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Aktuell sind keine Dokumente verfuegbar.</p>
            </div>
          ) : (
            <DownloadCategories grouped={grouped} />
          )}
        </section>
      </main>
    </SiteLayout>
  )
}
