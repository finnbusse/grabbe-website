import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { createClient } from "@/lib/supabase/server"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { CalendarDays, MapPin, Clock, Tag } from "lucide-react"

export const metadata = {
  title: "Termine - Grabbe-Gymnasium Detmold",
  description: "Alle Termine und Veranstaltungen des Grabbe-Gymnasiums Detmold im Ueberblick.",
}

const monthNames = ["Januar", "Februar", "Maerz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

const categoryColors: Record<string, string> = {
  ferien: "bg-amber-100 text-amber-700 border-amber-200",
  pruefungen: "bg-rose-100 text-rose-700 border-rose-200",
  veranstaltung: "bg-sky-100 text-sky-700 border-sky-200",
  elternabend: "bg-violet-100 text-violet-700 border-violet-200",
  default: "bg-muted text-muted-foreground border-border",
}

export default async function TerminePage() {
  const [heroContent, supabase] = await Promise.all([
    getPageContent('termine', PAGE_DEFAULTS['termine']),
    createClient(),
  ])
  const heroImageUrl = (heroContent.hero_image_url as string) || undefined
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })

  const items = events || []

  // Group by month
  const grouped: Record<string, typeof items> = {}
  items.forEach((ev) => {
    const d = new Date(ev.event_date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(ev)
  })

  return (
    <SiteLayout>
      <main>
        <PageHero
          title="Termine"
          label="Schulkalender"
          subtitle="Alle kommenden Termine, Veranstaltungen und wichtigen Daten im Ueberblick."
          imageUrl={heroImageUrl}
        />

        {/* ═══ Termine Section (blue mesh bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Schulkalender</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Termine
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl mx-auto">
                Alle kommenden Veranstaltungen, Pruefungen und wichtigen Daten auf einen Blick.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="mt-16 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-16 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarDays className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl text-foreground">Keine Termine</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
                  Aktuell sind keine kommenden Termine eingetragen. Schauen Sie spaeter wieder vorbei.
                </p>
              </div>
            ) : (
              <div className="mt-16 space-y-16">
                {Object.entries(grouped).map(([key, evts]) => {
                  const [year, month] = key.split("-").map(Number)
                  return (
                    <div key={key}>
                      <h3 className="font-display text-2xl font-bold text-foreground pb-4 border-b border-border/60">
                        {monthNames[month]} {year}
                      </h3>
                      <div className="mt-6 space-y-4">
                        {evts.map((ev) => {
                          const d = new Date(ev.event_date)
                          const cat = ev.category || "default"
                          const colorClass = categoryColors[cat] || categoryColors.default
                          return (
                            <div
                              key={ev.id}
                              className="group flex gap-5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1"
                            >
                              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <span className="text-[10px] font-medium uppercase leading-none">{monthNamesShort[d.getMonth()]}</span>
                                <span className="text-xl font-bold leading-none mt-0.5">{d.getDate()}</span>
                              </div>
                              {ev.event_end_date && ev.event_end_date !== ev.event_date && (() => {
                                const endD = new Date(ev.event_end_date)
                                return (
                                  <>
                                    <div className="flex items-center text-muted-foreground shrink-0">&ndash;</div>
                                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                                      <span className="text-[10px] font-medium uppercase leading-none">{monthNamesShort[endD.getMonth()]}</span>
                                      <span className="text-xl font-bold leading-none mt-0.5">{endD.getDate()}</span>
                                    </div>
                                  </>
                                )
                              })()}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 flex-wrap">
                                  <h4 className="font-display font-semibold text-foreground">{ev.title}</h4>
                                  {ev.category && (
                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorClass}`}>
                                      <Tag className="h-2.5 w-2.5" />{ev.category}
                                    </span>
                                  )}
                                </div>
                                {ev.description && (
                                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">{ev.description}</p>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                  {ev.event_time && (
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3" />{ev.event_time} Uhr
                                    </span>
                                  )}
                                  {ev.location && (
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="h-3 w-3" />{ev.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
