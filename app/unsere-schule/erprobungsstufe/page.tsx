import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import Link from "next/link"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Erprobungsstufe",
    description: "Informationen zur Erprobungsstufe (Klassen 5 und 6) am Grabbe-Gymnasium Detmold.",
    path: "/unsere-schule/erprobungsstufe",
  })
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

        {/* ═══ Intro + Value Cards (blue mesh bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Jahrgangsstufe 5 &amp; 6</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {content.page_title}
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {content.content_p1}
                </p>
                <blockquote className="mt-8 border-l-2 border-primary/40 pl-6">
                  <p className="font-display text-xl italic text-foreground/80">
                    {content.page_subtitle}
                  </p>
                </blockquote>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: content.card1_title,
                    text: content.card1_text,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                    ),
                  },
                  {
                    title: content.card2_title,
                    text: content.card2_text,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    ),
                  },
                  {
                    title: content.card3_title,
                    text: content.card3_text,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    ),
                  },
                ].map((item) => (
                  <div key={item.title as string} className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                        {item.icon}
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

        {/* ═══ Im Detail (white bg) ═══ */}
        <section className="relative py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Im Detail</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                So begleiten wir den Übergang
              </h2>
            </div>

            <div className="mx-auto mt-16 max-w-3xl space-y-6">
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
          </div>
        </section>

        {/* ═══ CTAs (muted bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">Profilprojekte</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Entdecke die vielfältigen Profilprojekte, die unsere Erprobungsstufe besonders machen.
                </p>
                <Link
                  href="/unsere-schule/profilprojekte"
                  className="mt-6 inline-flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-primary hover:text-foreground transition-colors group/link"
                >
                  {content.cta1_text}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>

              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">Anmeldung</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Alle Informationen zur Anmeldung an unserer Schule finden Sie hier.
                </p>
                <Link
                  href="/unsere-schule/anmeldung"
                  className="mt-6 inline-flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-primary hover:text-foreground transition-colors group/link"
                >
                  {content.cta2_text}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
