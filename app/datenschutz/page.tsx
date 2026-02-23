import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Datenschutz",
    description: "Datenschutzerklärung des Grabbe-Gymnasium Detmold.",
    path: "/datenschutz",
  })
}

export default async function DatenschutzPage() {
  const content = await getPageContent('datenschutz', PAGE_DEFAULTS['datenschutz'])

  return (
    <SiteLayout>
      <main>
        <PageHero title={content.page_title as string} imageUrl={(content.hero_image_url as string) || undefined} />

        <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Datenschutzerklärung</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.intro_text}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Verantwortlicher</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.verantwortlicher}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Hosting</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.hosting_text}
              </p>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
