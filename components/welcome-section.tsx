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

export function WelcomeSection({ content }: { content?: Record<string, unknown> }) {
  const c = content || {}
  const label = (c.label as string) || 'Herzlich willkommen'
  const headline = (c.headline as string) || 'Entdecke das Grabbe'
  const text = (c.text as string) || 'Liebe Freund:innen des Grabbe-Gymnasiums, die es sind und werden wollen. Mit neuem Schwung in innovativer Kraft entwickeln wir unsere Schule fuer Dich weiter. Das Grabbe-Gymnasium ist ein Ort des Lernens, der Begegnung und der persoenlichen Entfaltung im Herzen von Detmold.'

  const dynamicValues = [
    {
      icon: Sparkles,
      title: (c.card1_title as string) || values[0].title,
      text: (c.card1_text as string) || values[0].text,
    },
    {
      icon: Users,
      title: (c.card2_title as string) || values[1].title,
      text: (c.card2_text as string) || values[1].text,
    },
    {
      icon: BookOpen,
      title: (c.card3_title as string) || values[2].title,
      text: (c.card3_text as string) || values[2].text,
    },
    {
      icon: Heart,
      title: (c.card4_title as string) || values[3].title,
      text: (c.card4_text as string) || values[3].text,
    },
  ]
  return (
    <section id="welcome" className="relative py-28 lg:py-36 bg-mesh-blue">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
              {label}
            </p>
            <div className="mt-2 divider-line" />
            <h2 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground">
              {headline.includes('Grabbe') ? (
                <>{headline.split('Grabbe')[0]}<span className="italic text-primary">Grabbe</span>{headline.split('Grabbe')[1]}</>
              ) : headline}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl mx-auto">
              {text}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dynamicValues.map((item, i) => (
            <AnimateOnScroll key={item.title} animation="fade-in-up" delay={i * 0.12}>
              <div className="group relative h-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
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
