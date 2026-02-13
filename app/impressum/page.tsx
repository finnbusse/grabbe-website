import { SiteLayout } from "@/components/site-layout"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Impressum - Grabbe-Gymnasium Detmold",
  description: "Impressum des Grabbe-Gymnasium Detmold.",
}

export default async function ImpressumPage() {
  const content = await getPageContent('impressum', PAGE_DEFAULTS['impressum'])

  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
              {content.page_title}
            </h1>
          </div>
        </section>

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
                {content.anschrift}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Kontakt</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.kontakt_info}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Schultraeger</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.schultraeger}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Aufsichtsbehoerde</h2>
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
