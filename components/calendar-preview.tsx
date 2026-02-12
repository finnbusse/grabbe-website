"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Clock } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

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
    <section className="relative py-28 lg:py-36 bg-primary text-primary-foreground overflow-hidden noise-overlay">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[96px]" />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-primary-foreground/5 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-8">
        <AnimateOnScroll>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary-foreground/50">Termine</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-primary-foreground">
                Naechste <span className="italic text-accent">Veranstaltungen</span>
              </h2>
            </div>
            <Link href="/termine" className="hidden items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-accent hover:text-primary-foreground transition-colors sm:flex group">
              Alle Termine
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimateOnScroll>

        <div className="mt-12">
          {events.length === 0 ? (
            <p className="py-16 text-center text-sm text-primary-foreground/50">Aktuell sind keine Termine eingetragen.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 6).map((event, i) => {
                const date = new Date(event.event_date)
                const isFerien = event.category === "ferien"
                return (
                  <AnimateOnScroll key={event.id} animation="fade-in-up" delay={i * 0.08}>
                    <div
                      className={`group flex gap-4 rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-1 ${
                        isFerien
                          ? "bg-accent/15 border-accent/30 hover:bg-accent/20"
                          : "bg-primary-foreground/5 border-primary-foreground/10 hover:bg-primary-foreground/10 hover:border-primary-foreground/20"
                      }`}
                    >
                      <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 ${
                        isFerien ? "bg-accent text-foreground" : "bg-primary-foreground/10 text-primary-foreground"
                      }`}>
                        <span className="text-[9px] font-sub uppercase tracking-wider opacity-70">{monthNames[date.getMonth()]}</span>
                        <span className="font-display text-2xl leading-none">{date.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg text-primary-foreground line-clamp-2">{event.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-primary-foreground/50">
                          {event.event_time && (
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.event_time}</span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimateOnScroll>
                )
              })}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link href="/termine" className="inline-flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-accent hover:text-primary-foreground transition-colors">
              Alle Termine ansehen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
