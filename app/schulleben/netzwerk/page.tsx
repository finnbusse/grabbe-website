import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { Handshake } from "lucide-react"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Netzwerk & Partner",
  description: "Unsere Kooperationspartner und Vernetzung in Detmold.",
  alternates: { canonical: "/schulleben/netzwerk" },
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
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />

        <section className="bg-mesh-blue py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <span className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                Kooperationen
              </span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Unser Netzwerk
              </h2>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                    <Handshake className="h-6 w-6" />
                  </div>
                  <p className="mt-5 font-display text-base font-semibold text-card-foreground">
                    {partner.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {partner.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
