import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { Download, FileText, ImageIcon, ExternalLink } from "lucide-react"

export const metadata = {
  title: "Downloads - Grabbe-Gymnasium Detmold",
  description: "Dokumente, Formulare und Materialien zum Herunterladen.",
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
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

  const catLabels: Record<string, string> = {
    allgemein: "Allgemein",
    elternbriefe: "Elternbriefe",
    formulare: "Formulare",
    lehrplaene: "Lehrplaene",
    bilder: "Bilder & Medien",
    praesentation: "Praesentationen",
  }

  return (
    <>
      <SiteHeader />
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
            <div className="space-y-10">
              {Object.entries(grouped).map(([cat, docItems]) => (
                <div key={cat}>
                  <h2 className="font-display text-xl font-bold border-b pb-3">{catLabels[cat] || cat}</h2>
                  <div className="mt-4 space-y-2">
                    {docItems.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
                      >
                        {doc.file_type?.startsWith("image/") ? (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.file_name} &middot; {formatSize(doc.file_size)}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
