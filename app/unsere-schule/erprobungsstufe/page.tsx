import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { ErprobungsstufeSections } from "@/components/erprobungsstufe-sections"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Erprobungsstufe",
    description: "Informationen zur Erprobungsstufe (Klassen 5 und 6) am Grabbe-Gymnasium Detmold.",
    path: "/unsere-schule/erprobungsstufe",
  })
}

export default async function ErprobungsstufePage() {
  const content = await getPageContent('erprobungsstufe', PAGE_DEFAULTS['erprobungsstufe'])

  const heckerImageUrl = (content.hecker_image_url as string) || ''

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />
        <ErprobungsstufeSections heckerImageUrl={heckerImageUrl} />
      </main>
    </SiteLayout>
  )
}
