"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimateOnScroll } from "./animate-on-scroll"

interface ErprobungsstufeSectionsProps {
  heckerImageUrl: string
}

export function ErprobungsstufeSections({ heckerImageUrl }: ErprobungsstufeSectionsProps) {
  return (
    <>
      {/* ═══ Stats Strip ═══ */}
      <section className="relative border-y border-border/60 bg-card/60 backdrop-blur-sm py-8">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: '2', label: 'Jahrgänge', sub: 'Klasse 5 & 6' },
              { value: '4', label: 'Profilprojekte', sub: 'Kunst · Musik · Sport · NaWi' },
              { value: '2026', label: 'Schuljahr', sub: 'Neues Konzept ab 2026/27' },
              { value: '14', label: 'Tage Rhythmus', sub: 'Doppelstunde je Profil' },
            ].map((stat, i) => (
              <AnimateOnScroll key={stat.label} animation="fade-in-up" delay={i * 0.1}>
                <div className="text-center">
                  <p className="font-display text-4xl tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-1 font-sub text-[10px] uppercase tracking-[0.25em] text-primary">{stat.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.sub}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Intro + Highlight Cards (blue mesh bg) ═══ */}
      <section className="relative py-28 lg:py-36 bg-mesh-blue">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Left: Intro text */}
            <AnimateOnScroll animation="slide-in-left">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Jahrgangsstufe 5 &amp; 6</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  Eine besondere <span className="italic text-primary">pädagogische</span> Einheit
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  Die Jahrgänge 5 und 6 bilden eine besondere pädagogische Einheit – die Erprobungsstufe. In dieser Zeit, die für Kinder den Übergang von der Grundschule zum Gymnasium bedeutet, begleiten wir sie intensiv und individuell.
                </p>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Anknüpfend an die Erfahrungen der Grundschule führen wir die Schülerinnen und Schüler behutsam an die Lern- und Arbeitsformen des Gymnasiums heran. Wir fördern ihre Kenntnisse, Fähigkeiten und Fertigkeiten mit dem Ziel, gemeinsam mit den Eltern eine sichere Grundlage für den weiteren Bildungsweg zu schaffen.
                </p>
                <blockquote className="mt-8 border-l-2 border-primary/40 pl-6">
                  <p className="font-display text-lg italic text-foreground/80">
                    &bdquo;Wir fördern Kenntnisse, Fähigkeiten und Fertigkeiten – gemeinsam mit den Eltern.&ldquo;
                  </p>
                </blockquote>
              </div>
            </AnimateOnScroll>

            {/* Right: Highlight cards */}
            <div className="space-y-4">
              {[
                {
                  title: 'Klassenbildung & Profile',
                  text: 'Sozial ausgewogene Klassen, vier wählbare Profilprojekte – Kunst, Musik, Sport und Naturwissenschaften – klassenübergreifend organisiert.',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  ),
                },
                {
                  title: 'Soziales Lernen',
                  text: 'Begrüßungsnachmittag, pädagogisches Programm, Wandertag und Klassenfahrt – Gemeinschaft von Anfang an.',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  ),
                },
                {
                  title: 'Lernen lernen',
                  text: 'Grundlegende Lern- und Arbeitstechniken sowie digitale Kompetenzen – Schritt für Schritt erworben und vertieft.',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                  ),
                },
                {
                  title: 'Begabungsförderung',
                  text: 'Wettbewerbe, Lernpatenprogramme und Arbeitsgemeinschaften – individuelle Förderung und Unterstützung für alle.',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ),
                },
              ].map((item, i) => (
                <AnimateOnScroll key={item.title} animation="slide-in-right" delay={i * 0.1}>
                  <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Profile (white bg) ═══ */}
      <section className="relative py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <AnimateOnScroll animation="fade-in-up">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Ab Schuljahr 2026/27</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Klassenbildung und <span className="italic text-primary">Profile</span>
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Die vier Profile bleiben inhaltlich erhalten – nun klassenübergreifend als wählbare Profilprojekte organisiert. Jedes Kind wählt sein Profil bei der Anmeldung.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Profile Cards with color accents */}
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Kunst',
                color: 'from-rose-500/10 to-orange-500/10 border-rose-200/60 dark:border-rose-900/40',
                iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
                hoverIconColor: 'group-hover:bg-rose-500 group-hover:text-white',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                ),
                desc: 'Kreativität & künstlerischer Ausdruck',
              },
              {
                label: 'Musik',
                color: 'from-violet-500/10 to-blue-500/10 border-violet-200/60 dark:border-violet-900/40',
                iconColor: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
                hoverIconColor: 'group-hover:bg-violet-500 group-hover:text-white',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                ),
                desc: 'Instrument, Ensemble & Klang',
              },
              {
                label: 'Sport',
                color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/60 dark:border-emerald-900/40',
                iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
                hoverIconColor: 'group-hover:bg-emerald-500 group-hover:text-white',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                ),
                desc: 'Bewegung, Teamgeist & Wettkampf',
              },
              {
                label: 'Naturwissenschaften',
                color: 'from-amber-500/10 to-yellow-500/10 border-amber-200/60 dark:border-amber-900/40',
                iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
                hoverIconColor: 'group-hover:bg-amber-500 group-hover:text-white',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>
                ),
                desc: 'Forschen, Experimentieren & Entdecken',
              },
            ].map((profile, i) => (
              <AnimateOnScroll key={profile.label} animation="scale-in" delay={i * 0.1}>
                <div className={`group relative rounded-2xl border bg-gradient-to-br ${profile.color} p-6 text-center transition-all duration-500 hover:shadow-xl hover:-translate-y-2`}>
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${profile.iconColor} transition-all duration-500 ${profile.hoverIconColor} group-hover:rotate-6 group-hover:scale-110`}>
                    {profile.icon}
                  </div>
                  <h3 className="font-display text-lg text-foreground">{profile.label}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{profile.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Info bullet list */}
          <AnimateOnScroll animation="fade-in-up" delay={0.3}>
            <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border/60 bg-muted/30 p-8">
              <p className="font-display text-base text-foreground">So funktionieren die Profilprojekte</p>
              <div className="mt-4 space-y-3">
                {[
                  'Jede Schülerin und jeder Schüler wählt bei der Anmeldung ein Profilprojekt für ein Schuljahr.',
                  'In Klasse 6 kann ein neues Profil gewählt werden.',
                  'Die Profilprojekte finden alle 14 Tage in einer Doppelstunde statt.',
                  'Kreatives, fächerverbindendes Arbeiten ohne Notendruck – mit Feedback und Präsentationen.',
                  'Gemeinsame Interessen über Klassengrenzen hinweg stärken das Miteinander.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══ Soziales Lernen – Timeline (muted bg) ═══ */}
      <section className="relative py-28 lg:py-36 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <AnimateOnScroll animation="fade-in-up">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Gemeinschaft</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Soziales Lernen
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Von Anfang an steht das soziale Lernen im Mittelpunkt.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Timeline */}
          <div className="mt-16 relative">
            {/* Vertical line (desktop) */}
            <div className="absolute left-1/2 hidden lg:block top-0 bottom-0 w-px bg-border/60 -translate-x-1/2" aria-hidden="true" />

            <div className="space-y-10 lg:space-y-0">
              {[
                {
                  step: '1',
                  when: 'Vor den Sommerferien',
                  title: 'Begrüßungsnachmittag',
                  text: 'Alle neuen Fünftklässler:innen lernen ihre Mitschüler:innen, ihr Klassenleitungsteam und ihren Klassenraum kennen.',
                  side: 'left',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                  ),
                },
                {
                  step: '2',
                  when: 'Erste Unterrichtstage',
                  title: 'Kennenlerntage & Wandertag',
                  text: 'Das Klassenleitungsteam gestaltet mit einem pädagogischen Programm, das Orientierung gibt und das Ankommen erleichtert.',
                  side: 'right',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                  ),
                },
                {
                  step: '3',
                  when: 'Wöchentlich',
                  title: 'Klassenleitungsstunde',
                  text: 'Schwerpunkt auf Gemeinschaft, Verantwortung und Mitbestimmung. Klassenvorhaben, Konfliktlösungen und Projekte.',
                  side: 'left',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  ),
                },
                {
                  step: '4',
                  when: 'Zu Beginn Klasse 6',
                  title: 'Klassenfahrt',
                  text: 'Eine Klassenfahrt stärkt die Klassengemeinschaft zusätzlich und gibt dem gemeinsamen Lernen einen besonderen Rahmen.',
                  side: 'right',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  ),
                },
              ].map((item, i) => (
                <AnimateOnScroll
                  key={item.step}
                  animation={item.side === 'left' ? 'slide-in-left' : 'slide-in-right'}
                  delay={0}
                >
                  <div className={`relative lg:flex lg:w-1/2 lg:py-8 ${item.side === 'left' ? 'lg:pr-16 lg:ml-0' : 'lg:pl-16 lg:ml-auto'}`}>
                    {/* Step dot on timeline (desktop) */}
                    <div
                      className={`absolute hidden lg:flex top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-sub text-[10px] font-bold z-10 ${item.side === 'left' ? '-right-4' : '-left-4'}`}
                      aria-hidden="true"
                    >
                      {item.step}
                    </div>

                    <div className="group w-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                      <div className="flex items-start gap-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-sub text-[10px] uppercase tracking-[0.25em] text-primary">{item.when}</p>
                          <h3 className="mt-1 font-display text-xl text-foreground">{item.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Lernen lernen & Begabungsförderung (white bg) ═══ */}
      <section className="relative py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">

            {/* Lernen lernen */}
            <AnimateOnScroll animation="slide-in-left">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Kompetenzen</p>
                <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight text-foreground">
                  Lernen lernen &amp; Digitalisierung
                </h2>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  Im Bereich „Lernen lernen" werden grundlegende Lern- und Arbeitstechniken vermittelt und in Projekten sowie im Fachunterricht vertieft.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Schrittweise erwerben die Kinder dabei auch digitale Kompetenzen, um ihr persönliches Repertoire an Lern- und Arbeitsstrategien zu erweitern und verantwortungsvoll anzuwenden.
                </p>
                <div className="mt-8 space-y-3">
                  {[
                    'Grundlegende Lern- und Arbeitstechniken',
                    'Vertiefung in Projekten und Fachunterricht',
                    'Digitale Kompetenzen schrittweise aufbauen',
                    'Verantwortungsvoller Umgang mit digitalen Medien',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Begabungsförderung */}
            <AnimateOnScroll animation="slide-in-right">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Förderung</p>
                <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight text-foreground">
                  Begabungsförderung &amp; Unterstützung
                </h2>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  Interessierte Schülerinnen und Schüler können ab Klasse 5 an schulischen und regionalen Wettbewerben teilnehmen.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Für die gezielte Unterstützung bietet das Grabbe-Gymnasium Lernpatenprogramme an: Ältere Schüler:innen helfen Jüngeren beim Aufarbeiten von Grundlagen.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: 'Wettbewerbe',
                      sub: 'Schulische und regionale Wettbewerbe ab Klasse 5',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      ),
                    },
                    {
                      title: 'Lernpaten',
                      sub: 'Ältere Schüler:innen helfen Jüngeren bei den Grundlagen',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      ),
                    },
                    {
                      title: 'Arbeitsgemeinschaften',
                      sub: 'Zahlreiche AGs aus allen Profilbereichen',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      ),
                    },
                  ].map((card) => (
                    <div key={card.title} className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] hover:-translate-y-0.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="font-display text-base text-foreground">{card.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{card.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ Anmeldung – Urgency Banner + Cards (muted bg) ═══ */}
      <section className="relative py-28 lg:py-36 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">

          {/* Urgency banner */}
          <AnimateOnScroll animation="scale-in">
            <div className="mb-14 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                  </div>
                  <div>
                    <p className="font-display text-xl text-foreground">Anmeldung: 23. – 27. Februar 2026</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">Bitte vereinbaren Sie vorab einen Termin für das Anmeldegespräch.</p>
                  </div>
                </div>
                <Link
                  href="/unsere-schule/anmeldung"
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-sub text-xs uppercase tracking-[0.15em] text-primary-foreground transition-all hover:opacity-90 group/cta"
                >
                  Jetzt anmelden
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/cta:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-in-up">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Ihr Weg ans Grabbe</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Anmeldung am Grabbe-Gymnasium
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Eltern vereinbaren vorab einen Termin für das Anmeldegespräch, zu dem sie möglichst gemeinsam mit ihrem Kind kommen.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Unterlagen */}
            <AnimateOnScroll animation="slide-in-left" delay={0.1}>
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1 h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">Erforderliche Unterlagen</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Die Anmeldeunterlagen stehen im Dateimanager unserer Homepage und werden auch beim Tag der offenen Tür ausgegeben.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    'Ausgefüllte Anmeldeformulare',
                    'Zeugnis und Empfehlung der Grundschule',
                    'Geburtsurkunde',
                    'Nachweis über den Masernimpfschutz',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Profilwahl */}
            <AnimateOnScroll animation="slide-in-right" delay={0.1}>
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1 h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">Profilwahl bei der Anmeldung</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Im Rahmen der Anmeldung wählen Sie gemeinsam mit Ihrem Kind ein Profilprojekt. Dabei geben Sie eine Erstwahl und eine Zweitwahl an.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  So können wir die Klassen optimal zusammenstellen und sicherstellen, dass jedes Kind an einem passenden Profilprojekt teilnimmt.
                </p>
                <Link
                  href="/unsere-schule/profilprojekte"
                  className="mt-6 inline-flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-primary hover:text-foreground transition-colors group/link"
                >
                  Profilprojekte entdecken
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ Betreuung & Kontakt (white bg) ═══ */}
      <section className="relative py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            {/* Betreuung */}
            <AnimateOnScroll animation="slide-in-left">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Nachmittag</p>
                <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight text-foreground">
                  Betreuung und Angebote
                </h2>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  Eine Hausaufgabenbetreuung sowie eine Übermittagsbetreuung mit offenen Angeboten stehen zur Verfügung. Zahlreiche Arbeitsgemeinschaften ergänzen das Angebot.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: 'Hausaufgabenbetreuung',
                      sub: '13.30 – 14.30 Uhr',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      ),
                    },
                    {
                      title: 'Übermittagsbetreuung',
                      sub: 'Mo – Do bis 15.30 Uhr · offene Angebote',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                      ),
                    },
                    {
                      title: 'Arbeitsgemeinschaften',
                      sub: 'Aus allen Profilbereichen – Talente entfalten',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/30 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-display text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Kontakt Stefan Hecker */}
            <AnimateOnScroll animation="slide-in-right">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Ansprechpartner</p>
                <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight text-foreground">
                  Sprechen Sie mich an
                </h2>

                <div className="mt-8 group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06]">
                  <div className="flex items-start gap-6">
                    {heckerImageUrl ? (
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                        <Image
                          src={heckerImageUrl}
                          alt="Stefan Hecker"
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-2xl text-foreground">Stefan Hecker</h3>
                      <p className="mt-1 font-sub text-xs uppercase tracking-[0.15em] text-muted-foreground">Koordinator Erprobungsstufe</p>
                      <a
                        href="mailto:s.hecker@grabbe.nrw.schule"
                        className="mt-5 flex items-center gap-2 text-sm text-primary hover:text-foreground transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        s.hecker@grabbe.nrw.schule
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border/60 bg-muted/30 p-6">
                  <p className="font-display text-sm text-foreground">Sekretariat</p>
                  <a
                    href="mailto:sekretariat@grabbe.nrw.schule"
                    className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    sekretariat@grabbe.nrw.schule
                  </a>
                </div>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>
    </>
  )
}
