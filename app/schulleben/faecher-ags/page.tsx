import { SiteLayout } from "@/components/site-layout"
import { Languages, Palette, FlaskConical, Globe, BookOpen, Calendar, Monitor } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Faecher & Arbeitsgemeinschaften - Grabbe-Gymnasium Detmold",
  description: "Faecher und Arbeitsgemeinschaften am Grabbe-Gymnasium Detmold.",
}

const categories = [
  {
    icon: Languages,
    title: "Sprachen, Kunst, Musik",
    desc: "Nach Englisch waehlen Sie Franzoesisch oder Latein, spaeter Spanisch. Besonders betonen wir Kunst, Musik und Sport.",
    color: "bg-rose-500",
  },
  {
    icon: FlaskConical,
    title: "MINT",
    desc: "Alle Naturwissenschaften und Informatik werden einzeln und verbunden angeboten. MINT-freundliche Schule!",
    color: "bg-sky-500",
  },
  {
    icon: Globe,
    title: "Gesellschaft",
    desc: "Nachhaltigkeit, Demokratiebildung und geschichtliche Verantwortung runden das Angebot ab.",
    color: "bg-emerald-500",
  },
  {
    icon: BookOpen,
    title: "Weitere Faecher",
    desc: "Ein breites Spektrum an weiteren Faechern mit engagierten Kolleg:innen erwartet dich.",
    color: "bg-amber-500",
  },
]

export default function FaecherAGsPage() {
  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Schulleben
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Faecher & Arbeitsgemeinschaften
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Viele Faecher warten auf dich! Am Nachmittag hast du bei uns die freie Wahl!
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Das Grabbe-Gymnasium wird zum Lebensort Ihrer Kinder. Ihre Kinder koennen sich in
              vielen verschiedenen Faechern mit engagierten Kolleg:innen bilden. Sie haben nach
              Englisch die Moeglichkeit, Franzoesisch oder Latein und spaeter Spanisch zu waehlen.
              Alle Naturwissenschaften und Informatik werden einzeln und auch verbunden, wie in der
              Natur, angeboten. Die Gesellschaftswissenschaften runden das immer wichtigere Thema
              rund um Nachhaltigkeit, Demokratiebildung und geschichtliche Verantwortung und mehr ab.
              Ganz besonders betonen wir die Bildung im Bereich Kunst, Musik und Sport und NaWi.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <div key={cat.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
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
