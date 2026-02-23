import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { getSettings } from "@/lib/settings"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Impressum",
    description: "Impressum des Grabbe-Gymnasium Detmold.",
    path: "/impressum",
  })
}

export default async function ImpressumPage() {
  const [content, settings] = await Promise.all([
    getPageContent('impressum', PAGE_DEFAULTS['impressum']),
    getSettings(),
  ])
  const schoolName = settings.school_name_full || settings.school_name
  const schoolAddress = settings.school_address
  let anschrift = content.anschrift as string
  if (schoolAddress) {
    anschrift = schoolName ? `${schoolName}, ${schoolAddress}` : schoolAddress
  }
  const kontaktParts = [
    settings.school_phone ? `Telefon: ${settings.school_phone}` : "",
    settings.school_fax ? `Telefax: ${settings.school_fax}` : "",
    settings.school_email ? `E-Mail: ${settings.school_email}` : "",
  ].filter(Boolean)
  const kontaktInfo = kontaktParts.length > 0 ? kontaktParts.join(", ") : (content.kontakt_info as string)

  return (
    <SiteLayout>
      <main>
        <PageHero title={content.page_title as string} imageUrl={(content.hero_image_url as string) || undefined} />

        <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Verantwortlich</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.verantwortlich}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Anschrift</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {anschrift}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Kontakt</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {kontaktInfo}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Schulträger</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.schultraeger}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Aufsichtsbehörde</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.aufsichtsbehoerde}
              </p>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
