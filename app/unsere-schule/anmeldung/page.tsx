import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { AnmeldungForm } from "@/components/anmeldung-form"
import Link from "next/link"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Anmeldung",
    description: "Informationen zur Anmeldung am Grabbe-Gymnasium Detmold für Klasse 5 und die Oberstufe.",
    path: "/unsere-schule/anmeldung",
  })
}

export default async function AnmeldungPage() {
  const content = await getPageContent('anmeldung', PAGE_DEFAULTS['anmeldung'])

  const klasse5Checklist = (content.klasse5_checklist as string).split(',')
  const oberstufeChecklist = (content.oberstufe_checklist as string).split(',')

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />

        {/* ═══ Anmeldung Cards (blue mesh bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Anmeldung</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Ihr Weg ans Grabbe
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {/* Klasse 5 */}
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <span className="font-display text-lg font-bold">5</span>
                </div>
                <h3 className="font-display text-xl text-foreground">
                  {content.klasse5_title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{content.klasse5_subtitle}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {content.klasse5_text}
                </p>

                <div className="mt-6 space-y-3">
                  <h4 className="font-display text-sm font-semibold text-foreground">Zur Anmeldung vorzulegen:</h4>
                  <div className="space-y-2">
                    {klasse5Checklist.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {item.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/unsere-schule/erprobungsstufe"
                  className="group/cta mt-8 flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-8 py-4 font-sub text-xs uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-white"
                >
                  Zur Erprobungsstufe
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/cta:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>

              {/* Oberstufe EF */}
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <span className="font-display text-lg font-bold">EF</span>
                </div>
                <h3 className="font-display text-xl text-foreground">
                  {content.oberstufe_title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{content.oberstufe_subtitle}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {content.oberstufe_text1}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {content.oberstufe_text2}
                </p>

                <div className="mt-6 space-y-3">
                  <h4 className="font-display text-sm font-semibold text-foreground">Anmeldeunterlagen:</h4>
                  <div className="space-y-2">
                    {oberstufeChecklist.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {item.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-200/60 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20 p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    </span>
                    <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">{content.oberstufe_hinweis}</p>
                  </div>
                </div>

                <Link
                  href="/unsere-schule/oberstufe"
                  className="group/cta mt-8 flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-8 py-4 font-sub text-xs uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-white"
                >
                  Zum Oberstufen-Portal
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/cta:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Kontaktformular (muted bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Kontakt</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Anmeldeformular
              </h2>
            </div>
            <div className="mx-auto mt-16 max-w-2xl">
              <AnmeldungForm />
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
