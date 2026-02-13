import { SiteLayout } from "@/components/site-layout"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Datenschutz - Grabbe-Gymnasium Detmold",
  description: "Datenschutzerklaerung des Grabbe-Gymnasium Detmold.",
}

export default async function DatenschutzPage() {
  const content = await getPageContent('datenschutz', PAGE_DEFAULTS['datenschutz'])

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
              <h2 className="font-display text-xl font-semibold text-foreground">Datenschutzerklaerung</h2>
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
