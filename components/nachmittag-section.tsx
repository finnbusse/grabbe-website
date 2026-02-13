"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

export function NachmittagSection({ content }: { content?: Record<string, unknown> }) {
  const c = content || {}
  const sLabel = (c.label as string) || 'Nachmittags am Grabbe'
  const sHeadline = (c.headline as string) || 'Verlaesslich und flexibel'
  const sAttribution = (c.attribution as string) || 'Beate Bossmanns'
  const sText = (c.text as string) || 'Nach Unterrichtsschluss bietet das Grabbe-Gymnasium mit einem breiten Spektrum an Nachmittagsaktivitaeten eine verlaessliche und flexibel gestaltbare Betreuungszeit bis 15:30 Uhr an. Neben unserer verlaesslichen Nachmittagsbetreuung mit offenen Betreuungszeiten kann Ihr Kind aus zahlreichen AG-Angeboten waehlen oder in der Hausaufgabenbetreuung unter Anleitung unserer Schuelertutorinnen und -tutoren Hausaufgaben erledigen.'
  const featuresTitle = (c.features_title as string) || 'Betreuungsangebote'
  const features = [
    (c.feature1 as string) || 'Offene Betreuungszeiten in modernen Raeumen',
    (c.feature2 as string) || 'Zahlreiche AG-Angebote am Nachmittag',
    (c.feature3 as string) || 'Hausaufgabenbetreuung durch Schuelertutoren',
    (c.feature4 as string) || 'Module fuer ein halbes Jahr waehlbar',
    (c.feature5 as string) || 'Mensa mit Kioskangebot und Mittagessen (LKS)',
  ]
  const linkText = (c.link_text as string) || 'Weitere Informationen'
  return (
    <section className="relative py-28 lg:py-36 bg-muted/40 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <AnimateOnScroll animation="slide-in-left">
            <div>
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                {sLabel}
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                <span className="italic">{'"'}{sHeadline}{'"'}</span>
              </h2>
              <p className="mt-2 font-sub text-xs uppercase tracking-[0.15em] text-muted-foreground">{sAttribution}</p>
              <p className="mt-8 text-base leading-relaxed text-muted-foreground">
                {sText}
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="slide-in-right" delay={0.2}>
            <div className="space-y-5">
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all hover:shadow-lg hover:shadow-primary/[0.06]">
                <h3 className="font-display text-xl text-card-foreground">{featuresTitle}</h3>
                <ul className="mt-5 space-y-3">
                  {features.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/schulleben/nachmittag"
                className="group flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-8 py-4 font-sub text-xs uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-white"
              >
                {linkText}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
