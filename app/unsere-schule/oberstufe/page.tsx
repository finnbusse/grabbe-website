import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { TaggedSection } from "@/components/tagged-section"
import {
  GraduationCap, BookOpen, FileText, ClipboardList,
  Users, AlertCircle, CalendarClock, ArrowRight,
  BookMarked, Briefcase, Award, ExternalLink,
  ChevronRight, Info
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Oberstufe - Grabbe-Gymnasium Detmold",
  description: "Informationen zur gymnasialen Oberstufe am Grabbe-Gymnasium Detmold.",
}

export default async function OberstufePage() {
  const content = await getPageContent('oberstufe', PAGE_DEFAULTS['oberstufe'])

  // Parse quick access links
  const quicklinks = (content.quicklinks as string)
    .split(',')
    .map((link) => {
      const idx = link.indexOf(':')
      if (idx === -1) return { label: '', anchor: '' }
      return { label: link.slice(0, idx).trim(), anchor: link.slice(idx + 1).trim() }
    })
    .filter((l) => l.label && l.anchor)

  // Parse external links
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

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />

        {/* ── Quick Access Bar ── */}
        {quicklinks.length > 0 && (
          <div className="border-b border-border bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <nav className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none" aria-label="Schnellzugriff">
                <span className="mr-2 text-xs font-medium text-muted-foreground shrink-0">Schnellzugriff:</span>
                {quicklinks.map((link) => (
                  <a
                    key={link.anchor}
                    href={link.anchor}
                    className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">

            {/* ══════════════ Main Content ══════════════ */}
            <div className="lg:col-span-2 space-y-16">

              {/* ── Overview ── */}
              <section id="ueberblick">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.overview_title}
                  </h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>{content.overview_text}</p>
                  <p>{content.overview_quali}</p>
                  <p>{content.overview_stunden}</p>
                  <p>{content.overview_stammgruppen}</p>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-display text-sm font-semibold text-card-foreground">Realschuluebergang & Vertiefungskurse</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.overview_realschule}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-display text-sm font-semibold text-card-foreground">Kooperation & Leistungskurse</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.overview_kooperation}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-muted p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{content.overview_abschluesse}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.overview_extras}</p>
                </div>
              </section>

              {/* ── Antraege & Formulare ── */}
              <section id="antraege">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.antraege_title}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-display text-sm font-semibold text-card-foreground">Buecher, Ausweise & Tablets</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.antraege_buecher}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-5">
                      <h3 className="font-display text-sm font-semibold text-card-foreground">WLAN-Zugang</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.antraege_wlan}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                      <h3 className="font-display text-sm font-semibold text-card-foreground">Tablet im Unterricht</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.antraege_tablet}</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted p-5">
                    <h3 className="font-display text-sm font-semibold text-foreground">Office 365</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.antraege_office}</p>
                  </div>
                </div>
                {/* Tagged downloads for forms */}
                {(content.antraege_downloads_tag_id as string) && (
                  <div className="mt-6">
                    <TaggedSection type="downloads" tagId={content.antraege_downloads_tag_id as string} heading="Formulare zum Download" />
                  </div>
                )}
              </section>

              {/* ── Beratung ── */}
              <section id="beratung">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.beratung_title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{content.beratung_text}</p>
                <div className="mt-6 rounded-xl border border-border bg-card p-6">
                  <h3 className="font-display text-sm font-semibold text-card-foreground mb-3">Oberstufenteam im Schuljahr 2025/26</h3>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    {(content.beratung_team as string).split('\n').filter(Boolean).map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{content.beratung_additional}</p>
                  <div className="rounded-xl bg-muted p-5">
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed text-muted-foreground">{content.beratung_arbeit}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Unterrichtsausfall ── */}
              <section id="ausfall">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.ausfall_title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{content.ausfall_text}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-display text-sm font-semibold text-card-foreground">Vorhersehbare Abwesenheit</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.ausfall_vorhersehbar}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-display text-sm font-semibold text-card-foreground">Unvorhersehbare Abwesenheit</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.ausfall_unvorhersehbar}</p>
                  </div>
                </div>
              </section>

              {/* ── Vertretungsplan ── */}
              <section id="vertretung">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <CalendarClock className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.vertretung_title}
                  </h2>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">{content.vertretung_text}</p>
                </div>
              </section>

              {/* ── Laufbahnplanung ── */}
              <section id="laufbahn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.laufbahn_title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{content.laufbahn_text}</p>
                {/* Tagged downloads for career planning docs */}
                {(content.laufbahn_downloads_tag_id as string) && (
                  <div className="mt-6">
                    <TaggedSection type="downloads" tagId={content.laufbahn_downloads_tag_id as string} heading="Dokumente zur Laufbahnplanung" />
                  </div>
                )}
                {laufbahnLinks.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-3">Externe Links</h3>
                    <div className="space-y-2">
                      {laufbahnLinks.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                        >
                          <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium text-card-foreground">{link.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* ── Klausuren ── */}
              <section id="klausuren">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.klausuren_title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{content.klausuren_text}</p>
                <div className="mt-4 rounded-xl bg-muted p-5">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-muted-foreground">{content.klausuren_nachschreiben}</p>
                  </div>
                </div>
                {/* Tagged downloads for exam schedules */}
                {(content.klausuren_downloads_tag_id as string) && (
                  <div className="mt-6">
                    <TaggedSection type="downloads" tagId={content.klausuren_downloads_tag_id as string} heading="Klausurplaene" />
                  </div>
                )}
              </section>

              {/* ── Fehlzeiten ── */}
              <section id="fehlzeiten">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <BookMarked className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.fehlzeiten_title}
                  </h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>{content.fehlzeiten_text}</p>
                  <p>{content.fehlzeiten_entschuldigung}</p>
                  <p>{content.fehlzeiten_beurlaubung}</p>
                </div>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">{content.fehlzeiten_hinweis}</p>
                  </div>
                </div>
                {/* Tagged downloads for absence forms */}
                {(content.fehlzeiten_downloads_tag_id as string) && (
                  <div className="mt-6">
                    <TaggedSection type="downloads" tagId={content.fehlzeiten_downloads_tag_id as string} heading="Formulare" />
                  </div>
                )}
              </section>

              {/* ── Facharbeit ── */}
              <section id="facharbeit">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.facharbeit_title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{content.facharbeit_text}</p>
                {/* Tagged downloads for research paper docs */}
                {(content.facharbeit_downloads_tag_id as string) && (
                  <div className="mt-6">
                    <TaggedSection type="downloads" tagId={content.facharbeit_downloads_tag_id as string} heading="Dokumente zur Facharbeit" />
                  </div>
                )}
              </section>

              {/* ── Berufsorientierung ── */}
              <section id="berufsorientierung">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.berufsorientierung_title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{content.berufsorientierung_text}</p>
                {(content.berufsorientierung_link as string) && (
                  <Link
                    href={content.berufsorientierung_link as string}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Zum Berufsorientierungsportal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </section>

              {/* ── Studium & Stipendien ── */}
              <section id="stipendien">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.stipendien_title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">{content.stipendien_text}</p>
                {stipendienLinks.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {stipendienLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                      >
                        <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-card-foreground text-xs">{link.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Abitur ── */}
              <section id="abitur">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {content.abitur_title}
                  </h2>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">{content.abitur_text}</p>
                </div>
              </section>
            </div>

            {/* ══════════════ Sidebar ══════════════ */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Tagged Oberstufen-Termine */}
              {(content.events_tag_id as string) && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <TaggedSection type="events" tagId={content.events_tag_id as string} heading="Naechste Termine" limit={5} />
                </div>
              )}

              {/* Tagged Oberstufen-News */}
              {(content.news_tag_id as string) && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <TaggedSection type="posts" tagId={content.news_tag_id as string} heading="Aktuelle News" limit={3} />
                </div>
              )}

              {/* Beratung sidebar card */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold text-card-foreground">
                  Oberstufen-Koordination
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Das Oberstufenteam steht in den Sprechstunden oder nach Vereinbarung fuer Beratungsgespraeche zur Verfuegung.
                </p>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {(content.beratung_team as string).split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className="text-xs">{line}</p>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </SiteLayout>
  )
}
