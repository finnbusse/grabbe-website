"use client"

import Link from "next/link"
import { ArrowRight, FileText, Clock, GraduationCap, BookOpen, CalendarDays, Utensils } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

const quickLinks = [
  { icon: FileText, label: "Downloads", href: "/downloads" },
  { icon: CalendarDays, label: "Termine & Kalender", href: "/termine" },
  { icon: Clock, label: "Nachmittagsprogramm", href: "/schulleben/nachmittag" },
  { icon: Utensils, label: "Übermittag", href: "/schulleben/nachmittag" },
  { icon: GraduationCap, label: "Oberstufen-Portal", href: "/unsere-schule/oberstufe" },
  { icon: BookOpen, label: "Fächer & AGs", href: "/schulleben/faecher-ags" },
]

export function InfoSection({ content }: { content?: Record<string, unknown> }) {
  const c = content || {}
  const leftLabel = (c.left_label as string) || 'Erprobungsstufe'
  const leftHeadline = (c.left_headline as string) || 'Dein Start am Grabbe'
  const leftText1 = (c.left_text1 as string) || 'Die Jahrgänge 5 und 6 bilden eine besondere pädagogische Einheit, die Erprobungsstufe. Während dieser Zeit begleiten wir Ihre Kinder intensiv. Anknüpfend an die Lernerfahrungen in der Grundschule führen wir die Schüler:innen an die Unterrichtsmethoden und Lernangebote des Gymnasiums heran.'
  const leftText2 = (c.left_text2 as string) || 'Die Klassenbildung erfolgt nach sozialen Kriterien und berücksichtigt neben der Grundschulzugehörigkeit auch die Wunschpartner:innen. Eine einwöchige Klassenfahrt zu Beginn der sechsten Klasse festigt die Klassengemeinschaft.'
  const leftQuote = (c.left_quote as string) || 'Ein Ort, an dem jedes Kind seinen Platz findet.'
  const leftLinkText = (c.left_link_text as string) || 'Mehr zur Erprobungsstufe'
  const rightLabel = (c.right_label as string) || 'Beliebte Themen'
  const rightHeadline = (c.right_headline as string) || 'Schnellzugriff'
  return (
    <section className="relative py-28 lg:py-36 bg-mesh-blue">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-20 lg:grid-cols-2">
          {/* Left: Erprobungsstufe */}
          <AnimateOnScroll animation="slide-in-left">
            <div>
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                {leftLabel}
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                {leftHeadline.includes('Grabbe') ? (
                  <>{leftHeadline.split('Grabbe')[0]}<span className="italic text-primary">Grabbe</span>{leftHeadline.split('Grabbe')[1]}</>
                ) : leftHeadline}
              </h2>
              <div className="mt-8 space-y-5 text-muted-foreground">
                <p className="text-sm leading-relaxed">
                  {leftText1}
                </p>
                <p className="text-sm leading-relaxed">
                  {leftText2}
                </p>
              </div>

              {/* Decorative quote */}
              <blockquote className="mt-8 border-l-2 border-primary/40 pl-6">
                <p className="font-display text-xl italic text-foreground/80">
                  {'"'}{leftQuote}{'"'}
                </p>
              </blockquote>

              <Link
                href="/unsere-schule/erprobungsstufe"
                className="mt-8 inline-flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-primary hover:text-foreground transition-colors group"
              >
                {leftLinkText}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimateOnScroll>

          {/* Right: Quick Links */}
          <AnimateOnScroll animation="slide-in-right" delay={0.2}>
            <div>
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                {rightLabel}
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                {rightHeadline}
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {quickLinks.map((link, i) => (
                  <AnimateOnScroll key={link.label} animation="fade-in-up" delay={0.3 + i * 0.06}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] hover:-translate-y-0.5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3">
                        <link.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{link.label}</span>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
