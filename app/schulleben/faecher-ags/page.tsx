import { SiteLayout } from "@/components/site-layout"
import { Languages, Palette, FlaskConical, Globe, BookOpen, Calendar, Monitor } from "lucide-react"
import Link from "next/link"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Faecher & Arbeitsgemeinschaften - Grabbe-Gymnasium Detmold",
  description: "Faecher und Arbeitsgemeinschaften am Grabbe-Gymnasium Detmold.",
}

export default async function FaecherAGsPage() {
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
          <div className="max-w-3xl">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content.intro_text}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <div key={cat.title as string} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color} text-background`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-card-foreground">{cat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cat.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: BookOpen, label: "Lehrplaene", href: "#" },
              { icon: Calendar, label: "Stundentafel", href: "#" },
              { icon: Monitor, label: "Unterrichtsportal", href: "#" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <link.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-card-foreground">{link.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
