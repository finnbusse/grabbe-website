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

  return (
    <span>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-white align-middle ml-0.5 animate-pulse" />
      )}
    </span>
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative flex flex-col bg-background overflow-hidden">
      {/* Hero image -- full width, flush to top, only rounded at bottom */}
      <div className="relative w-full overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem]" style={{ aspectRatio: "21/9" }}>
        {/* The image -- NO dark overlays whatsoever */}
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1770907263880.png-LbbwTH3bV3iIeTlN24uWwemZuKXx6y.jpeg"
          alt="Grabbe-Gymnasium Schulgebaeude"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Content overlay -- bottom left, text has its own shadow for readability, NO image darkening */}
        <div
          className="absolute inset-0 z-10 flex flex-col justify-end p-5 md:p-10 lg:p-14"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}
        >
          {/* School SVG logo */}
          <div className={`mb-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <img
              src="/images/grabbe-logo.svg"
              alt="Grabbe-Gymnasium Logo"
              className="h-8 w-auto md:h-12"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          {/* Headline */}
          <h1
            className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-white leading-[1.1] tracking-tight transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)" }}
          >
            <span className="block">Deine Talente.</span>
            <span className="block italic text-[hsl(200,85%,80%)]" style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)" }}>Deine Buehne.</span>
            <span className="block">Dein Grabbe.</span>
          </h1>

          {/* Subtitle with typing animation */}
          <p
            className={`mt-3 max-w-md text-white/90 text-xs md:text-sm leading-relaxed font-sans transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            <TypingText
              text="Wir foerdern Deine Talente und staerken Deine Persoenlichkeit."
              delay={1200}
              speed={30}
            />
          </p>

          {/* CTA buttons */}
          <div className={`mt-5 flex flex-col sm:flex-row items-start gap-3 transition-all duration-700 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link
              href="/unsere-schule/anmeldung"
              className="group flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition-all hover:bg-white hover:shadow-xl"
            >
              Anmeldung Klasse 5
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/unsere-schule/profilprojekte"
              className="group flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-white/25"
            >
              Profilprojekte entdecken
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center py-8">
        <button
          onClick={() => {
            document.getElementById("welcome")?.scrollIntoView({ behavior: "smooth" })
          }}
          className="flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-primary transition-colors"
          aria-label="Weiter scrollen"
        >
          <span className="text-[10px] font-sub uppercase tracking-[0.25em]">Entdecken</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
