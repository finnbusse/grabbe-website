import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { Heart, Users, Lightbulb, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Erprobungsstufe - Grabbe-Gymnasium Detmold",
  description: "Informationen zur Erprobungsstufe (Klassen 5 und 6) am Grabbe-Gymnasium Detmold.",
}

export default async function ErprobungsstufePage() {
  const content = await getPageContent('erprobungsstufe', PAGE_DEFAULTS['erprobungsstufe'])

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          {/* Values */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                title: content.card1_title,
                text: content.card1_text,
              },
              {
                icon: Users,
                title: content.card2_title,
                text: content.card2_text,
              },
              {
                icon: Heart,
                title: content.card3_title,
                text: content.card3_text,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="mt-16 max-w-3xl space-y-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content.content_p1}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content.content_p2}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content.content_p3}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content.content_p4}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/unsere-schule/profilprojekte">
                {content.cta1_text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/unsere-schule/anmeldung">{content.cta2_text}</Link>
            </Button>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
