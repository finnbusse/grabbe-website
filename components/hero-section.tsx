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
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const imageScale = 1 + scrollY * 0.0002
  const contentOpacity = Math.max(0, 1 - scrollY * 0.002)

  return (
    <section className="relative flex flex-col bg-background overflow-hidden">
      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Hero image with rounded corners, padding, NO darkening overlay */}
      <div className="relative z-10 px-4 pt-2 md:px-6 lg:px-10">
        <div
          className="relative w-full overflow-hidden rounded-3xl shadow-2xl shadow-primary/[0.08]"
          style={{ aspectRatio: "21/9" }}
        >
          {/* The image -- no dark overlays */}
          <div
            style={{
              transform: `scale(${imageScale})`,
              transition: "transform 0.1s linear",
            }}
            className="absolute inset-0"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1770907263880.png-LbbwTH3bV3iIeTlN24uWwemZuKXx6y.jpeg"
              alt="Grabbe-Gymnasium Schulgebaeude"
              fill
              className="object-cover"
              priority
              quality={90}
            />
          </div>

          {/* Minimal localised gradient only at the very bottom-left corner for text readability */}
          <div className="absolute bottom-0 left-0 right-1/2 h-2/3 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none rounded-bl-3xl" />
          <div className="absolute bottom-0 left-0 top-1/3 w-1/2 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none rounded-bl-3xl" />

          {/* Content overlay - bottom left aligned */}
          <div
            className="absolute inset-0 z-10 flex flex-col justify-end p-5 md:p-8 lg:p-12"
            style={{ opacity: contentOpacity }}
          >
            {/* School logo */}
            <div className={`mb-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grabbe-axyrHnKg5v3J1TKdQffEYr4F54zwpn.jpg"
                alt="Grabbe-Gymnasium Logo"
                className="h-8 w-auto md:h-12"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>

            {/* Headline */}
            <h1
              className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-white leading-[1.1] tracking-tight transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
            >
              <span className="block">Deine Talente.</span>
              <span className="block italic text-[hsl(200,85%,80%)]">Deine Buehne.</span>
              <span className="block">Dein Grabbe.</span>
            </h1>

            {/* Subtitle with typing animation */}
            <p
              className={`mt-3 max-w-md text-white/80 text-xs md:text-sm leading-relaxed font-sans transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
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
                className="group flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-white hover:shadow-lg hover:shadow-white/20"
              >
                Anmeldung Klasse 5
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/unsere-schule/profilprojekte"
                className="group flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/25"
              >
                Profilprojekte entdecken
              </Link>
            </div>
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
