"use client"

import { BookOpen, Users, Sparkles, Heart } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

const values = [
  {
    icon: Sparkles,
    title: "Talente foerdern",
    text: "Wir foerdern Deine Talente und staerken Deine Persoenlichkeit. Am Grabbe kannst Du Dich in den Profilprojekten Kunst, Musik, Sport und NaWi frei entfalten.",
  },
  {
    icon: Users,
    title: "Gemeinschaft leben",
    text: "Wir wuenschen uns glueckliche Schueler:innen in einer guten Gemeinschaft - mit Deinen Freund:innen. Durch gemeinsame Projekte und Klassenfahrten staerken wir den Zusammenhalt.",
  },
  {
    icon: BookOpen,
    title: "Zukunft gestalten",
    text: "Wir gestalten Deine Zukunft mit Dir. Mit modernen Lernmethoden, digitaler Ausstattung und individueller Foerderung bereiten wir Dich optimal auf Studium und Beruf vor.",
  },
  {
    icon: Heart,
    title: "Verantwortung uebernehmen",
    text: "Als UNESCO-Projektschule in Nordrhein-Westfalen setzen wir uns fuer Nachhaltigkeit, Toleranz und interkulturelles Lernen ein. Engagement ist bei uns gelebter Alltag.",
  },
]

export function WelcomeSection() {
  return (
    <section id="welcome" className="relative py-28 lg:py-36">
      {/* Subtle top gradient transition from hero */}
      <div className="absolute inset-x-0 -top-1 h-32 bg-gradient-to-b from-[hsl(220,20%,8%)] to-transparent pointer-events-none z-10" />

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-accent">
              Herzlich willkommen
            </p>
            <div className="mt-2 divider-line bg-accent/40" />
            <h2 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground">
              Entdecke das <span className="italic text-accent">Grabbe</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl mx-auto">
              Liebe Freund:innen des Grabbe-Gymnasiums, die es sind und werden wollen.
              Mit neuem Schwung in innovativer Kraft entwickeln wir unsere Schule fuer Dich weiter.
              Das Grabbe-Gymnasium ist ein Ort des Lernens, der Begegnung und der persoenlichen Entfaltung
              im Herzen von Detmold.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item, i) => (
            <AnimateOnScroll key={item.title} animation="fade-in-up" delay={i * 0.12}>
              <div className="group relative h-full rounded-2xl border border-border/60 bg-card p-8 transition-all duration-500 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-3 group-hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
