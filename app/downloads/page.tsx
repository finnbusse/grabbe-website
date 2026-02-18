import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { createClient } from "@/lib/supabase/server"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { Download, FileText, ImageIcon, ExternalLink } from "lucide-react"
import { DownloadCategories } from "@/components/download-categories"

export const metadata = {
  title: "Downloads - Grabbe-Gymnasium Detmold",
  description: "Dokumente, Formulare und Materialien zum Herunterladen.",
}

export default async function DownloadsPage() {
  const [heroContent, supabase] = await Promise.all([
    getPageContent('downloads', PAGE_DEFAULTS['downloads']),
    createClient(),
  ])
  const heroImageUrl = (heroContent.hero_image_url as string) || undefined
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
        <PageHero
          title="Downloads"
          label="Materialien"
          subtitle="Hier finden Sie alle Dokumente, Formulare und Materialien zum Herunterladen."
          imageUrl={heroImageUrl}
        />

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
