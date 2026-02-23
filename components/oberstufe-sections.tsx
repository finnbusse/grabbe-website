"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

interface QuickLink {
  label: string
  anchor: string
}

interface OberstufeSectionsProps {
  content: Record<string, unknown>
  quicklinks: QuickLink[]
}

const quickLinkIcons: Record<string, ReactNode> = {
  Formulare: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>,
  Klausurpläne: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>,
  Beratung: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Fehlzeiten: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Laufbahn: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Facharbeit: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
}

const defaultIcon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>

export function OberstufeSections({ content, quicklinks }: OberstufeSectionsProps) {
  return (
    <>
      {/* ═══ Overview + Schnellzugriff (like InfoSection) ═══ */}
      <section className="relative py-28 lg:py-36 bg-mesh-blue">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-20 lg:grid-cols-2">
            {/* Left: Overview */}
            <AnimateOnScroll animation="slide-in-left">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                  Die gymnasiale Oberstufe
                </p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  Dein Weg zum <span className="italic text-primary">Abitur</span>
                </h2>
                <div className="mt-8 space-y-5 text-muted-foreground">
                  <p className="text-sm leading-relaxed">{content.overview_text as string}</p>
                  <p className="text-sm leading-relaxed">{content.overview_quali as string}</p>
                </div>
                <blockquote className="mt-8 border-l-2 border-primary/40 pl-6">
                  <p className="font-display text-xl italic text-foreground/80">
                    {'"'}102 Wochenstunden, drei Jahre, ein Ziel.{'"'}
                  </p>
                </blockquote>
              </div>
            </AnimateOnScroll>

            {/* Right: Schnellzugriff */}
            <AnimateOnScroll animation="slide-in-right" delay={0.2}>
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                  Beliebte Themen
                </p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  Schnellzugriff
                </h2>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {quicklinks.map((link, i) => (
                    <AnimateOnScroll key={link.anchor} animation="fade-in-up" delay={0.3 + i * 0.06}>
                      <a
                        href={link.anchor}
                        className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] hover:-translate-y-0.5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3">
                          {quickLinkIcons[link.label] || defaultIcon}
                        </div>
                        <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{link.label}</span>
                      </a>
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ Details Cards (like WelcomeSection) ═══ */}
      <section className="relative py-28 lg:py-36 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <AnimateOnScroll>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                Struktur
              </p>
              <div className="mt-2 divider-line" />
              <h2 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground">
                Aufbau der <span className="italic text-primary">Oberstufe</span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl mx-auto">
                {content.overview_stunden as string}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Stammgruppen",
                text: content.overview_stammgruppen as string,
              },
              {
                title: "Realschulübergang",
                text: content.overview_realschule as string,
              },
              {
                title: "Leistungskurse",
                text: content.overview_kooperation as string,
              },
              {
                title: "Abschlüsse",
                text: content.overview_abschlüsse as string,
              },
            ].map((item, i) => (
              <AnimateOnScroll key={item.title} animation="fade-in-up" delay={i * 0.12}>
                <div className="group relative h-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                  <h3 className="font-display text-xl text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-6">{item.text}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Additional overview text */}
          <AnimateOnScroll animation="fade-in-up" delay={0.5}>
            <div className="mt-12 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
              <p className="text-sm leading-relaxed text-muted-foreground">{content.overview_extras as string}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══ Anträge Section (white bg, 2-col like NachmittagSection) ═══ */}
      <section id="antraege" className="relative py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            <AnimateOnScroll animation="slide-in-left">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                  Service
                </p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {content.antraege_title as string}
                </h2>
                <div className="mt-8 space-y-5 text-muted-foreground">
                  <p className="text-sm leading-relaxed">{content.antraege_buecher as string}</p>
                  <p className="text-sm leading-relaxed">{content.antraege_wlan as string}</p>
                  <p className="text-sm leading-relaxed">{content.antraege_tablet as string}</p>
                </div>
                <div className="mt-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
                  <h3 className="font-display text-base text-card-foreground">Office 365</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.antraege_office as string}</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="slide-in-right" delay={0.2}>
              <div className="space-y-5">
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
                  <h3 className="font-display text-xl text-card-foreground">Downloads</h3>
                  <div className="mt-5 space-y-3">
                    {['Antrag WLAN', 'Tablet-Knigge', 'Antrag WebUntis'].map((label) => (
                      <button
                        key={label}
                        className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                        </div>
                        <span className="font-medium text-card-foreground text-left flex-1">{label}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  href="/downloads"
                  className="group flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-8 py-4 font-sub text-xs uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-white"
                >
                  Alle Downloads
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  )
}
