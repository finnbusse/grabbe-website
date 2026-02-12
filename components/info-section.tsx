import Link from "next/link"
import { ArrowRight, FileText, Clock, GraduationCap, BookOpen, CalendarDays, Utensils } from "lucide-react"

const quickLinks = [
  { icon: FileText, label: "Downloads", href: "/downloads" },
  { icon: CalendarDays, label: "Termine & Kalender", href: "/termine" },
  { icon: Clock, label: "Nachmittagsprogramm", href: "/schulleben/nachmittag" },
  { icon: Utensils, label: "Uebermittag", href: "/schulleben/nachmittag" },
  { icon: GraduationCap, label: "Oberstufen-Portal", href: "/unsere-schule/oberstufe" },
  { icon: BookOpen, label: "Faecher & AGs", href: "/schulleben/faecher-ags" },
]

export function InfoSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-16 lg:grid-cols-2">
        {/* Left: Erprobungsstufe */}
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Erprobungsstufe
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-foreground">
            Dein Start am Grabbe
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p className="text-sm leading-relaxed">
              Die Jahrgaenge 5 und 6 bilden eine besondere paedagogische Einheit, die Erprobungsstufe.
              Waehrend dieser Zeit begleiten wir Ihre Kinder intensiv. Anknuepfend an die Lernerfahrungen
              in der Grundschule fuehren wir die Schueler:innen an die Unterrichtsmethoden und
              Lernangebote des Gymnasiums heran.
            </p>
            <p className="text-sm leading-relaxed">
              Die Klassenbildung erfolgt nach sozialen Kriterien und beruecksichtigt neben der
              Grundschulzugehoerigkeit auch die Wunschpartner:innen. Eine einwoechige Klassenfahrt
              zu Beginn der sechsten Klasse festigt die Klassengemeinschaft.
            </p>
          </div>
          <Link
            href="/unsere-schule/erprobungsstufe"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Mehr zur Erprobungsstufe
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Right: Quick Links */}
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Beliebte Themen
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-foreground">
            Schnellzugriff
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-card-foreground">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
