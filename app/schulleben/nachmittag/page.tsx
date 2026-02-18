import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { Clock, Users, BookOpen, Utensils } from "lucide-react"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Nachmittags am Grabbe - Grabbe-Gymnasium Detmold",
  description: "Nachmittagsbetreuung und Arbeitsgemeinschaften am Grabbe-Gymnasium Detmold.",
}

export default async function NachmittagPage() {
  const content = await getPageContent('nachmittag', PAGE_DEFAULTS['nachmittag'])

  const combinedItems = (content.combined_items as string).split(',').map((s) => s.trim()).filter(Boolean)

  const cards = [
    { icon: Clock, title: content.card1_title, text: content.card1_text },
    { icon: Users, title: content.card2_title, text: content.card2_text },
    { icon: BookOpen, title: content.card3_title, text: content.card3_text },
    { icon: Utensils, title: content.card4_title, text: content.card4_text },
  ]

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />

        {/* ═══ Nachmittagsprogramm (blue mesh bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Nachmittagsprogramm</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  Mehr als nur <em className="not-italic text-primary">Unterricht</em>
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {content.text_p1}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {content.text_p2}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {content.text_p3}
                </p>
              </div>

              <div className="space-y-4">
                {cards.map((item) => (
                  <div
                    key={item.title as string}
                    className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Angebot (muted bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Angebot</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                {content.combined_title}
              </h2>
            </div>

            <div className="mx-auto mt-16 max-w-2xl">
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
                <div className="space-y-3">
                  {combinedItems.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
