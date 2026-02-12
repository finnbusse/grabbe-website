import Link from "next/link"
import { ArrowRight, MapPin, Clock } from "lucide-react"

interface Event {
  id: string
  title: string
  event_date: string
  event_time: string | null
  location: string | null
  category?: string | null
}

export function CalendarPreview({ events }: { events: Event[] }) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Termine</p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
              Naechste Veranstaltungen
            </h2>
          </div>
          <Link href="/termine" className="hidden items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:flex">
            Alle Termine <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10">
          {events.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Aktuell sind keine Termine eingetragen.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 6).map((event) => {
                const date = new Date(event.event_date)
                const isFerien = event.category === "ferien"
                return (
                  <div
                    key={event.id}
                    className={`group flex gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${isFerien ? "bg-primary/5 border-primary/20" : "bg-card"}`}
                  >
                    <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${isFerien ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      <span className="text-[10px] font-medium uppercase">{monthNames[date.getMonth()]}</span>
                      <span className="text-xl font-bold leading-none">{date.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold line-clamp-2">{event.title}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {event.event_time && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.event_time}</span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/termine" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              Alle Termine ansehen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
