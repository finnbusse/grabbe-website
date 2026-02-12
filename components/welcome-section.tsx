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
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
      <AnimateOnScroll>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Herzlich willkommen</p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
            Entdecke das Grabbe
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Liebe Freund:innen des Grabbe-Gymnasiums, die es sind und werden wollen.
            Mit neuem Schwung in innovativer Kraft entwickeln wir unsere Schule fuer Dich weiter.
            Das Grabbe-Gymnasium ist ein Ort des Lernens, der Begegnung und der persoenlichen Entfaltung
            im Herzen von Detmold.
          </p>
        </div>
      </AnimateOnScroll>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((item, i) => (
          <AnimateOnScroll key={item.title} animation="fade-in-up" delay={i * 0.1}>
            <div className="group relative rounded-2xl border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg h-full">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}
