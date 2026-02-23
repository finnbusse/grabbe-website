import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { Languages, FlaskConical, Globe, BookOpen, Calendar, Monitor } from "lucide-react"
import Link from "next/link"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Fächer & Arbeitsgemeinschaften",
    description: "Fächer und Arbeitsgemeinschaften am Grabbe-Gymnasium Detmold.",
    path: "/schulleben/faecher-ags",
  })
}

export default async function FächerAGsPage() {
  const content = await getPageContent('faecher-ags', PAGE_DEFAULTS['faecher-ags'])

  const categories = [
    {
      icon: Languages,
      title: content.cat1_title,
      desc: content.cat1_desc,
      color: "bg-rose-500",
    },
    {
      icon: FlaskConical,
      title: content.cat2_title,
      desc: content.cat2_desc,
      color: "bg-sky-500",
    },
    {
      icon: Globe,
      title: content.cat3_title,
      desc: content.cat3_desc,
      color: "bg-emerald-500",
    },
    {
      icon: BookOpen,
      title: content.cat4_title,
      desc: content.cat4_desc,
      color: "bg-amber-500",
    },
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

        {/* ═══ Fächer & AGs Overview (blue mesh bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Unterricht &amp; AGs</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {content.page_title}
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {content.intro_text}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {categories.map((cat) => (
                  <div key={cat.title as string} className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl text-foreground">{cat.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Ressourcen (white bg) ═══ */}
        <section className="relative py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Ressourcen</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Materialien &amp; Links
              </h2>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-3">
              {[
                { icon: BookOpen, label: "Lehrpläne", href: "#" },
                { icon: Calendar, label: "Stundentafel", href: "#" },
                { icon: Monitor, label: "Unterrichtsportal", href: "#" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    <link.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-card-foreground text-left flex-1">{link.label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
