"use client"

import Link from "next/link"
import { ArrowRight, FileText, Clock, GraduationCap, BookOpen, CalendarDays, Utensils } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

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
    <section className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-20 lg:grid-cols-2">
          {/* Left: Erprobungsstufe */}
          <AnimateOnScroll animation="slide-in-left">
            <div>
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-accent">
                Erprobungsstufe
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Dein Start am <span className="italic text-accent">Grabbe</span>
              </h2>
              <div className="mt-8 space-y-5 text-muted-foreground">
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

              {/* Decorative quote */}
              <blockquote className="mt-8 border-l-2 border-accent/40 pl-6">
                <p className="font-display text-xl italic text-foreground/80">
                  {'"'}Ein Ort, an dem jedes Kind seinen Platz findet.{'"'}
                </p>
              </blockquote>

              <Link
                href="/unsere-schule/erprobungsstufe"
                className="mt-8 inline-flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-accent hover:text-foreground transition-colors group"
              >
                Mehr zur Erprobungsstufe
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimateOnScroll>

          {/* Right: Quick Links */}
          <AnimateOnScroll animation="slide-in-right" delay={0.2}>
            <div>
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-accent">
                Beliebte Themen
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Schnellzugriff
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {quickLinks.map((link, i) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-500 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-3">
                      <link.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-card-foreground group-hover:text-accent transition-colors">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
