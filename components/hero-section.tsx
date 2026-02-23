"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowDown } from "lucide-react"
import { useEffect, useState } from "react"

function TypingText({ text, delay = 0, speed = 40 }: { text: string; delay?: number; speed?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [started, text, speed])

  // Reserve space using min-height to prevent layout shift
  return (
    <span className="inline-block" style={{ minWidth: started ? 'auto' : `${text.length * 0.5}em` }}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-white align-middle ml-0.5 animate-pulse" />
      )}
    </span>
  )
}

export function HeroSection({ content }: { content?: Record<string, unknown> }) {
  const c = content || {}
  const headline1 = (c.headline1 as string) || 'Deine Talente.'
  const headline2 = (c.headline2 as string) || 'Deine Bühne.'
  const headline3 = (c.headline3 as string) || 'Dein Grabbe.'
  const subtitle = (c.subtitle as string) || 'Wir fördern Deine Talente und stärken Deine Persönlichkeit.'
  const cta1Text = (c.cta1_text as string) || 'Anmeldung Klasse 5'
  const cta1Link = (c.cta1_link as string) || '/unsere-schule/anmeldung'
  const cta2Text = (c.cta2_text as string) || 'Profilprojekte entdecken'
  const cta2Link = (c.cta2_link as string) || '/unsere-schule/profilprojekte'
  const scrollText = (c.scroll_text as string) || 'Entdecken'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative flex flex-col bg-background overflow-hidden">
      {/* Hero image -- full width, flush to top, only rounded at bottom */}
      {/* On mobile the explicit height fills almost the full viewport, leaving ~5.5rem (≈88 px)
          for the scroll indicator below so both the rounded corners and "Entdecken" arrow
          are visible without scrolling.  sm+ screens revert to the original aspect-ratio layout. */}
      <div className="relative w-full overflow-hidden rounded-b-[1.5rem] sm:rounded-b-[2rem] md:rounded-b-[3rem] h-[calc(100svh-5.5rem)] sm:h-auto sm:aspect-[16/9] lg:aspect-[21/9]">
        {/* The image -- NO dark overlays whatsoever */}
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1770907263880.png-LbbwTH3bV3iIeTlN24uWwemZuKXx6y.jpeg"
          alt="Grabbe-Gymnasium Schulgebäude"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Content overlay -- bottom left, text has its own shadow for readability, NO image darkening */}
        <div
          className="absolute inset-0 z-10 flex flex-col justify-end p-4 pb-8 sm:p-6 md:p-10 lg:p-14"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}
        >
          {/* Headline */}
          <h1
            className={`font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl text-white leading-[1.1] tracking-tight transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)" }}
          >
            <span className="block">{headline1}</span>
            <span className="block">{headline2}</span>
            <span className="block italic text-[hsl(200,85%,80%)]" style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)" }}>{headline3}</span>
          </h1>

          {/* Subtitle with typing animation */}
          <p
            className={`mt-2 sm:mt-3 max-w-md text-white/90 text-xs sm:text-sm leading-relaxed font-sans transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            <TypingText
              text={subtitle}
              delay={1200}
              speed={30}
            />
          </p>

          {/* CTA buttons */}
          <div className={`mt-4 sm:mt-5 flex flex-col sm:flex-row items-start gap-2 sm:gap-3 transition-all duration-700 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link
              href={cta1Link}
              className="group flex items-center gap-2 rounded-full bg-white/95 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary shadow-lg transition-all hover:bg-white hover:shadow-xl w-full sm:w-auto justify-center sm:justify-start"
            >
              {cta1Text}
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={cta2Link}
              className="group flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-lg transition-all hover:bg-white/25 w-full sm:w-auto justify-center sm:justify-start"
            >
              {cta2Text}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center py-6 sm:py-8">
        <button
          onClick={() => {
            document.getElementById("welcome")?.scrollIntoView({ behavior: "smooth" })
          }}
          className="flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-primary transition-colors"
          aria-label="Weiter scrollen"
        >
          <span className="text-[10px] font-sub uppercase tracking-[0.25em]">{scrollText}</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
