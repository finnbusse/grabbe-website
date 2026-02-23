import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { TaggedSection } from "@/components/tagged-section"
import { OberstufeSections } from "@/components/oberstufe-sections"
import Link from "next/link"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Oberstufe",
    description: "Informationen zur gymnasialen Oberstufe am Grabbe-Gymnasium Detmold.",
    path: "/unsere-schule/oberstufe",
  })
}

export default async function OberstufePage() {
  const content = await getPageContent('oberstufe', PAGE_DEFAULTS['oberstufe'])

  // Parse external links helper
  const parseLinkList = (raw: string) =>
    raw
      .split(',')
      .map((entry) => {
        const [name, url] = entry.split('|')
        return { name: name?.trim(), url: url?.trim() }
      })
      .filter((l) => l.name && l.url)

  const laufbahnLinks = parseLinkList(content.laufbahn_links as string)
  const stipendienLinks = parseLinkList(content.stipendien_links as string)

  // Parse quicklinks for the right-side quick access
  const quicklinks = (content.quicklinks as string)
    .split(',')
    .map((link) => {
      const idx = link.indexOf(':')
      if (idx === -1) return { label: '', anchor: '' }
      return { label: link.slice(0, idx).trim(), anchor: link.slice(idx + 1).trim() }
    })
    .filter((l) => l.label && l.anchor)

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />

        <OberstufeSections
          content={content}
          quicklinks={quicklinks}
        />

        {/* ═══ Beratung Section (blue mesh bg) ═══ */}
        <section id="beratung" className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Oberstufenteam</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {content.beratung_title}
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {content.beratung_text}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {content.beratung_additional}
                </p>
                <div className="mt-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-card-foreground">Agentur für Arbeit</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{content.beratung_arbeit}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
                <h3 className="font-display text-xl text-card-foreground">Oberstufenteam 2025/26</h3>
                <div className="mt-5 space-y-3">
                  {(content.beratung_team as string).split('\n').filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Unterrichtsausfall & Vertretung (white bg) ═══ */}
        <section id="ausfall" className="relative py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Regelungen</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                {content.ausfall_title}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl mx-auto">
                {content.ausfall_text}
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">Vorhersehbar</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.ausfall_vorhersehbar}</p>
              </div>
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">Unvorhersehbar</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.ausfall_unvorhersehbar}</p>
              </div>
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">{content.vertretung_title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.vertretung_text}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Klausuren & Fehlzeiten (muted bg) ═══ */}
        <section id="klausuren" className="relative py-28 lg:py-36 bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-20 lg:grid-cols-2">
              {/* Klausuren */}
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Prüfungen</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {content.klausuren_title}
                </h2>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{content.klausuren_text}</p>

                <div className="mt-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    </span>
                    <p className="text-xs leading-relaxed text-muted-foreground">{content.klausuren_nachschreiben}</p>
                  </div>
                </div>

                {/* Dummy download buttons for Klausurpläne */}
                <div className="mt-6 space-y-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">Klausurpläne</h3>
                  {['Klausurplan EF_2', 'Klausurplan Q1_2', 'Klausurregelungen ab dem 2. Halbjahr 2025/26', 'Übersicht Anzahl und Länge der Klausuren'].map((label) => (
                    <button
                      key={label}
                      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                      </div>
                      <span className="font-medium text-card-foreground text-left flex-1">{label}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </button>
                  ))}
                </div>

                {/* Tagged downloads for exam schedules */}
                {(content.klausuren_downloads_tag_id as string) && (
                  <div className="mt-4">
                    <TaggedSection type="downloads" tagId={content.klausuren_downloads_tag_id as string} heading="Weitere Downloads" />
                  </div>
                )}
              </div>

              {/* Fehlzeiten */}
              <div id="fehlzeiten">
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Entschuldigungen</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {content.fehlzeiten_title}
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>{content.fehlzeiten_text}</p>
                  <p>{content.fehlzeiten_entschuldigung}</p>
                  <p>{content.fehlzeiten_beurlaubung}</p>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-200/60 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20 p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    </span>
                    <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">{content.fehlzeiten_hinweis}</p>
                  </div>
                </div>

                {/* Dummy download buttons for Fehlzeiten forms */}
                <div className="mt-6 space-y-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">Formulare</h3>
                  {['Entschuldigungsformular', 'Beurlaubungsantrag', 'Hinweise zu Beurlaubungen'].map((label) => (
                    <button
                      key={label}
                      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                      </div>
                      <span className="font-medium text-card-foreground text-left flex-1">{label}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </button>
                  ))}
                </div>

                {/* Tagged downloads for absence forms */}
                {(content.fehlzeiten_downloads_tag_id as string) && (
                  <div className="mt-4">
                    <TaggedSection type="downloads" tagId={content.fehlzeiten_downloads_tag_id as string} heading="Weitere Downloads" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Laufbahn & Facharbeit (white bg) ═══ */}
        <section id="laufbahn" className="relative py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-20 lg:grid-cols-2">
              {/* Laufbahnplanung */}
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Planung</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {content.laufbahn_title}
                </h2>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{content.laufbahn_text}</p>

                {/* Dummy download buttons for Laufbahn docs */}
                <div className="mt-6 space-y-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">Dokumente</h3>
                  {['Anleitung zur Schülerversion von LuPO', 'Broschüre: Die gymnasiale Oberstufe', 'Merkblätter des Bildungsministeriums'].map((label) => (
                    <button
                      key={label}
                      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                      </div>
                      <span className="font-medium text-card-foreground text-left flex-1">{label}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </button>
                  ))}
                </div>

                {/* Tagged downloads for career planning docs */}
                {(content.laufbahn_downloads_tag_id as string) && (
                  <div className="mt-4">
                    <TaggedSection type="downloads" tagId={content.laufbahn_downloads_tag_id as string} heading="Weitere Downloads" />
                  </div>
                )}

                {laufbahnLinks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-3">Externe Links</h3>
                    <div className="space-y-2">
                      {laufbahnLinks.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                          </div>
                          <span className="font-medium text-card-foreground flex-1">{link.name}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Facharbeit */}
              <div id="facharbeit">
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Wissenschaftliches Arbeiten</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {content.facharbeit_title}
                </h2>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{content.facharbeit_text}</p>

                {/* Dummy download buttons for Facharbeit */}
                <div className="mt-6 space-y-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">Dokumente</h3>
                  {['Terminplan Facharbeit', 'Handreichung zur Facharbeit (2025)'].map((label) => (
                    <button
                      key={label}
                      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                      </div>
                      <span className="font-medium text-card-foreground text-left flex-1">{label}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </button>
                  ))}
                </div>

                {/* Tagged downloads for research paper docs */}
                {(content.facharbeit_downloads_tag_id as string) && (
                  <div className="mt-4">
                    <TaggedSection type="downloads" tagId={content.facharbeit_downloads_tag_id as string} heading="Weitere Downloads" />
                  </div>
                )}

                {/* Abitur */}
                <div id="abitur" className="mt-16">
                  <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Abschluss</p>
                  <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight text-foreground">
                    {content.abitur_title}
                  </h2>
                  <div className="mt-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">{content.abitur_text}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Berufsorientierung & Stipendien (blue mesh bg) ═══ */}
        <section id="berufsorientierung" className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Nach der Schule</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Zukunft planen
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {/* Berufsorientierung card */}
              <div className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">{content.berufsorientierung_title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.berufsorientierung_text}</p>
                {(content.berufsorientierung_link as string) && (
                  <Link
                    href={content.berufsorientierung_link as string}
                    className="mt-6 inline-flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-primary hover:text-foreground transition-colors group/link"
                  >
                    Zum Berufsorientierungsportal
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                )}
              </div>

              {/* Stipendien card */}
              <div id="stipendien" className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>
                </div>
                <h3 className="font-display text-xl text-foreground">{content.stipendien_title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.stipendien_text}</p>
              </div>
            </div>

            {stipendienLinks.length > 0 && (
              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stipendienLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                    </div>
                    <span className="font-medium text-card-foreground text-xs">{link.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══ Tagged Events & News (muted bg) ═══ */}
        {((content.events_tag_id as string) || (content.news_tag_id as string)) && (
          <section className="relative py-28 lg:py-36 bg-muted/40">
            <div className="mx-auto max-w-6xl px-4 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Aktuelles</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  Termine & News
                </h2>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                {(content.events_tag_id as string) && (
                  <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
                    <TaggedSection type="events" tagId={content.events_tag_id as string} heading="Nächste Termine" limit={5} />
                  </div>
                )}
                {(content.news_tag_id as string) && (
                  <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
                    <TaggedSection type="posts" tagId={content.news_tag_id as string} heading="Aktuelle News" limit={5} />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </SiteLayout>
  )
}
