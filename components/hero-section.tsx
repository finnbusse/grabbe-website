"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowDown } from "lucide-react"
import { useEffect, useState, useRef } from "react"

function TypingText({ text, delay = 0, speed = 60 }: { text: string; delay?: number; speed?: number }) {
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
        <span className="inline-block w-[2px] h-[1em] bg-accent align-middle ml-0.5 animate-pulse" />
      )}
    </span>
  )
}

function CountUpNumber({ target, suffix = "", delay = 0 }: { target: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setTimeout(() => setStarted(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay, started])

  useEffect(() => {
    if (!started) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const parallaxOffset = scrollY * 0.3
  const overlayOpacity = Math.min(0.7 + scrollY * 0.001, 0.95)

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Full background image with parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1770907263880.png-LbbwTH3bV3iIeTlN24uWwemZuKXx6y.jpeg"
          alt="Grabbe-Gymnasium Schulgebaeude"
          fill
          className="object-cover scale-110"
          priority
          quality={90}
        />
      </div>

      {/* Dark overlay that intensifies on scroll */}
      <div
        className="absolute inset-0 z-[1] transition-opacity duration-300"
        style={{ opacity: overlayOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,20%,8%)] via-[hsl(220,20%,8%)]/80 to-[hsl(220,20%,8%)]" />
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 z-[2] noise-overlay pointer-events-none" />

      {/* Decorative ambient glows */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[128px] animate-gentle-pulse" />
        <div className="absolute bottom-1/4 -right-32 h-[400px] w-[400px] rounded-full bg-primary-foreground/3 blur-[96px] animate-gentle-pulse delay-1000" />
      </div>

      {/* Top small label */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Small label */}
        <p className="text-[11px] font-sub uppercase tracking-[0.3em] text-[hsl(40,20%,97%)]/50 animate-blur-in mb-6">
          Christian-Dietrich-Grabbe-Gymnasium Detmold
        </p>

        {/* Logo mark */}
        <div className="mb-8 animate-blur-in delay-200">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grabbe-axyrHnKg5v3J1TKdQffEYr4F54zwpn.jpg"
            alt="Grabbe-Gymnasium Logo"
            className="h-16 w-auto brightness-0 invert opacity-80 md:h-20"
          />
        </div>

        {/* Main headline with serif */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-[hsl(40,20%,97%)] leading-[1.05] tracking-tight animate-blur-in delay-300 max-w-4xl">
          <span className="block">Deine Talente.</span>
          <span className="block italic text-[hsl(38,70%,55%)]">Deine Buehne.</span>
          <span className="block">Dein Grabbe.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 max-w-lg text-[hsl(40,20%,97%)]/60 text-base md:text-lg leading-relaxed font-sans animate-blur-in delay-500">
          <TypingText
            text="Wir foerdern Deine Talente und staerken Deine Persoenlichkeit. Wir gestalten Deine Zukunft mit Dir."
            delay={1500}
            speed={30}
          />
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-blur-in delay-700">
          <Link
            href="/unsere-schule/anmeldung"
            className="group flex items-center gap-2 rounded-full bg-[hsl(40,20%,97%)] px-7 py-3.5 text-sm font-medium text-[hsl(220,20%,10%)] transition-all hover:bg-[hsl(38,70%,55%)] hover:text-[hsl(220,20%,10%)] hover:shadow-lg hover:shadow-accent/20"
          >
            Anmeldung Klasse 5
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/unsere-schule/profilprojekte"
            className="group flex items-center gap-2 rounded-full border border-[hsl(40,20%,97%)]/20 px-7 py-3.5 text-sm font-medium text-[hsl(40,20%,97%)]/80 transition-all hover:border-[hsl(40,20%,97%)]/50 hover:text-[hsl(40,20%,97%)] backdrop-blur-sm"
          >
            Profilprojekte entdecken
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 animate-blur-in delay-900">
          {[
            { value: 900, suffix: "+", label: "Schueler:innen" },
            { value: 80, suffix: "+", label: "Lehrkraefte" },
            { value: 4, suffix: "", label: "Profilprojekte" },
            { value: 25, suffix: "+", label: "AGs & Projekte" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-normal text-[hsl(40,20%,97%)]">
                <CountUpNumber target={stat.value} suffix={stat.suffix} delay={1800 + i * 200} />
              </p>
              <p className="mt-1 text-[11px] font-sub uppercase tracking-[0.15em] text-[hsl(40,20%,97%)]/40">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll down indicator */}
      <div className="relative z-10 flex justify-center pb-10 animate-blur-in delay-1000">
        <button
          onClick={() => {
            document.getElementById("welcome")?.scrollIntoView({ behavior: "smooth" })
          }}
          className="flex flex-col items-center gap-2 text-[hsl(40,20%,97%)]/30 hover:text-[hsl(40,20%,97%)]/60 transition-colors"
          aria-label="Weiter scrollen"
        >
          <span className="text-[10px] font-sub uppercase tracking-[0.25em]">Entdecken</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
