"use client"

import { AnimateOnScroll } from "./animate-on-scroll"

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
        className="flex gap-4 animate-marquee"
        style={{
          animationDirection: reverse ? "reverse" : "normal",
          animationDuration: "40s",
        }}
      >
        {doubled.map((partner, i) => (
          <span
            key={`${partner}-${i}`}
            className="shrink-0 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-6 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:text-primary hover:bg-primary/5 whitespace-nowrap cursor-default"
          >
            {partner}
          </span>
        ))}
      </div>
    </div>
  )
}

export function PartnersSection({ content }: { content?: Record<string, unknown> }) {
  const c = content || {}
  const sLabel = (c.label as string) || 'Vernetzt in Detmold'
  const sHeadline = (c.headline as string) || 'Unsere Partner'
  const sDescription = (c.description as string) || 'Wir bieten Ihren Kindern nicht nur in der Schule lebensnahe Erfahrungen, sondern auch mit unseren vertrauensvollen Partnern.'
  
  // Parse partners from comma-separated string or use defaults
  const partnersStr = (c.partners as string) || partners.join(', ')
  const dynamicPartners = partnersStr.split(',').map(p => p.trim()).filter(Boolean)
  
  const firstRow = dynamicPartners.slice(0, Math.ceil(dynamicPartners.length / 2))
  const secondRow = dynamicPartners.slice(Math.ceil(dynamicPartners.length / 2))

  return (
    <section className="relative py-24 lg:py-28 border-t border-border/40 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center">
            <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
              {sLabel}
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight text-foreground">
              {sHeadline.includes('Partner') ? (
                <>{sHeadline.split('Partner')[0]}<span className="italic text-primary">Partner</span>{sHeadline.split('Partner')[1]}</>
              ) : sHeadline}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
              {sDescription}
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
