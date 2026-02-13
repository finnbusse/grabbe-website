import { SiteLayout } from "@/components/site-layout"
import { Handshake } from "lucide-react"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Netzwerk & Partner - Grabbe-Gymnasium Detmold",
  description: "Unsere Kooperationspartner und Vernetzung in Detmold.",
}

export default async function NetzwerkPage() {
  const content = await getPageContent('netzwerk', PAGE_DEFAULTS['netzwerk'])

  const partners = (content.partners as string).split(',').map((entry) => {
    const [name, category] = entry.split('|')
    return { name: name.trim(), category: category?.trim() ?? '' }
  })

  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">{content.page_label}</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {content.page_title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {content.page_subtitle}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div key={partner.name} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Handshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-card-foreground">{partner.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{partner.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
