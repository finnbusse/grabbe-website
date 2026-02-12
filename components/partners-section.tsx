"use client"

import { AnimateOnScroll } from "./animate-on-scroll"
import { useEffect, useRef, useState } from "react"

const partners = [
  "Hochschule fuer Musik",
  "Landestheater Detmold",
  "Johanniter",
  "Stadtbibliothek Detmold",
  "Lippische Landesbibliothek",
  "Landesarchiv NRW",
  "Holocaust-Gedenkstaette Yad Vashem",
  "McLean Highschool Washington",
  "Wortmann KG",
  "Weidmueller GmbH & Co KG",
  "Peter-Glaesel-Schule Detmold",
]

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden py-2">
      <div
        className={`flex gap-4 ${reverse ? "animate-marquee" : "animate-marquee"}`}
        style={{
          animationDirection: reverse ? "reverse" : "normal",
          animationDuration: "40s",
        }}
      >
        {doubled.map((partner, i) => (
          <span
            key={`${partner}-${i}`}
            className="shrink-0 rounded-full border border-border/60 bg-card px-6 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-accent/40 hover:text-foreground hover:bg-accent/5 whitespace-nowrap cursor-default"
          >
            {partner}
          </span>
        ))}
      </div>
    </div>
  )
}

export function PartnersSection() {
  const firstRow = partners.slice(0, 6)
  const secondRow = partners.slice(6)

  return (
    <section className="relative py-24 lg:py-28 border-t border-border/40 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center">
            <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-accent">
              Vernetzt in Detmold
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight text-foreground">
              Unsere <span className="italic text-accent">Partner</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
              Wir bieten Ihren Kindern nicht nur in der Schule lebensnahe Erfahrungen, sondern auch
              mit unseren vertrauensvollen Partnern.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-12">
          <MarqueeRow items={firstRow} />
          <MarqueeRow items={secondRow} reverse />
        </div>
      </div>
    </section>
  )
}
