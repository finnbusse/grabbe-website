import { SiteLayout } from "@/components/site-layout"
import { Clock, Utensils, BookOpen, Users, CheckCircle2 } from "lucide-react"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Nachmittags am Grabbe - Grabbe-Gymnasium Detmold",
  description: "Nachmittagsbetreuung und Arbeitsgemeinschaften am Grabbe-Gymnasium Detmold.",
}

export default async function NachmittagPage() {
  const content = await getPageContent('nachmittag', PAGE_DEFAULTS['nachmittag'])

  const combinedItems = (content.combined_items as string).split(',')

  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              {content.page_label}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {content.page_title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {content.page_subtitle}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {content.text_p1}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {content.text_p2}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {content.text_p3}
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Clock,
                  title: content.card1_title,
                  text: content.card1_text,
                },
                {
                  icon: Users,
                  title: content.card2_title,
                  text: content.card2_text,
                },
                {
                  icon: BookOpen,
                  title: content.card3_title,
                  text: content.card3_text,
                },
                {
                  icon: Utensils,
                  title: content.card4_title,
                  text: content.card4_text,
                },
              ].map((item) => (
                <div key={item.title as string} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-card-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-primary/5 p-5">
                <h3 className="text-sm font-semibold text-foreground">{content.combined_title}</h3>
                <ul className="mt-2 space-y-1.5">
                  {combinedItems.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
