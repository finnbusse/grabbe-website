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
              <div className="mt-16">
                <DownloadCategories grouped={grouped} />
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
