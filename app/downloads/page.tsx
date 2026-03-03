import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { createStaticClient as createClient } from "@/lib/supabase/static"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { Download, FileText, ImageIcon, ExternalLink } from "lucide-react"
import { DownloadCategories } from "@/components/download-categories"
import { generatePageMetadata } from "@/lib/seo"
import type { DocumentListItem } from "@/lib/types/database.types"
import type { Metadata } from "next"

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Downloads",
    description: "Dokumente, Formulare und Materialien zum Herunterladen.",
    path: "/downloads",
  })
}

export default async function DownloadsPage() {
  const [heroContent] = await Promise.all([
    getPageContent('downloads', PAGE_DEFAULTS['downloads']),
  ])
  const supabase = createClient()
  const heroImageUrl = (heroContent.hero_image_url as string) || undefined
  // Fetch folders and documents concurrently
  const [{ data: folders }, { data: docs }] = await Promise.all([
    supabase
      .from("document_folders")
      .select("id, name, parent_id")
      .eq("is_public", true)
      .order("name", { ascending: true }),
    supabase
      .from("documents")
      .select("id, title, file_url, file_name, file_size, file_type, category, folder_id")
      .eq("status", "published")
      .order("category", { ascending: true })
      .order("created_at", { ascending: false })
      .returns<DocumentListItem[]>()
  ])

  const validFolderIds = new Set((folders || []).map(f => f.id))
  const items = docs || []

  // Split into documents inside a valid public folder vs. documents without a folder
  const folderDocs = items.filter(doc => doc.folder_id && validFolderIds.has(doc.folder_id))

  // Loose documents get grouped by category exactly as before to preserve functionality
  const looseDocs = items.filter(doc => !doc.folder_id || !validFolderIds.has(doc.folder_id))

  const groupedLoose: Record<string, typeof looseDocs> = {}
  looseDocs.forEach((doc) => {
    const cat = doc.category || "allgemein"
    if (!groupedLoose[cat]) groupedLoose[cat] = []
    groupedLoose[cat].push(doc)
  })

  return (
    <SiteLayout>
      <main>
        <PageHero
          title="Downloads"
          label="Materialien"
          subtitle="Hier finden Sie alle Dokumente, Formulare und Materialien zum Herunterladen."
          imageUrl={heroImageUrl}
        />

        <section className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Materialien</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Downloads
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Alle Dokumente, Formulare und Materialien zum Herunterladen.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base text-muted-foreground">Aktuell sind keine Dokumente verfuegbar.</p>
              </div>
            ) : (
              <div className="mt-16 space-y-8">
                <DownloadCategories
                  groupedLoose={groupedLoose}
                  folderDocs={folderDocs}
                  folders={folders || []}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
