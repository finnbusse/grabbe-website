"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

export function NachmittagSection() {
  return (
    <section className="relative py-28 lg:py-36 bg-muted/40 overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent/3 blur-[128px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <AnimateOnScroll animation="slide-in-left">
            <div>
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-accent">
                Nachmittags am Grabbe
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                <span className="italic">{'"'}Verlaesslich und flexibel{'"'}</span>
              </h2>
              <p className="mt-2 font-sub text-xs uppercase tracking-[0.15em] text-muted-foreground">Beate Bossmanns</p>
              <p className="mt-8 text-base leading-relaxed text-muted-foreground">
                Nach Unterrichtsschluss bietet das Grabbe-Gymnasium mit einem breiten Spektrum an
                Nachmittagsaktivitaeten eine verlaessliche und flexibel gestaltbare Betreuungszeit
                bis 15:30 Uhr an. Neben unserer verlaesslichen Nachmittagsbetreuung mit offenen
                Betreuungszeiten kann Ihr Kind aus zahlreichen AG-Angeboten waehlen oder in der
                Hausaufgabenbetreuung unter Anleitung unserer Schuelertutorinnen und -tutoren
                Hausaufgaben erledigen.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="slide-in-right" delay={0.2}>
            <div className="space-y-5">
              <div className="rounded-2xl border border-border/60 bg-card p-8 transition-all hover:shadow-lg hover:shadow-accent/5">
                <h3 className="font-display text-xl text-card-foreground">Betreuungsangebote</h3>
                <ul className="mt-5 space-y-3">
                  {[
                    "Offene Betreuungszeiten in modernen Raeumen",
                    "Zahlreiche AG-Angebote am Nachmittag",
                    "Hausaufgabenbetreuung durch Schuelertutoren",
                    "Module fuer ein halbes Jahr waehlbar",
                    "Mensa mit Kioskangebot und Mittagessen (LKS)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/schulleben/nachmittag"
                className="group flex items-center justify-center gap-2 rounded-2xl border border-accent/30 bg-accent/5 px-8 py-4 font-sub text-xs uppercase tracking-[0.15em] text-accent transition-all hover:bg-accent hover:text-foreground"
              >
                Weitere Informationen
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
