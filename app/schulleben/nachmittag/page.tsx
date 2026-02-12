import { SiteLayout } from "@/components/site-layout"
import { Clock, Utensils, BookOpen, Users, CheckCircle2 } from "lucide-react"

export const metadata = {
  title: "Nachmittags am Grabbe - Grabbe-Gymnasium Detmold",
  description: "Nachmittagsbetreuung und Arbeitsgemeinschaften am Grabbe-Gymnasium Detmold.",
}

export default function NachmittagPage() {
  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Schulleben
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Nachmittags am Grabbe
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {"\"Verlaesslich und flexibel\" - Beate Bossmanns"}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Nach Unterrichtsschluss bietet das Grabbe-Gymnasium mit einem breiten Spektrum an
                Nachmittagsaktivitaeten eine verlaessliche und flexibel gestaltbare Betreuungszeit
                bis 15:30 Uhr an. Neben unserer verlaesslichen Nachmittagsbetreuung mit offenen
                Betreuungszeiten in unseren modernen Betreuungsraeumen, die von engagierten
                Betreuungskraeften geleitet wird, kann Ihr Kind aus zahlreichen AG-Angeboten waehlen
                oder in der Hausaufgabenbetreuung unter der Anleitung unserer Schuelertutorinnen
                und -tutoren Hausaufgaben erledigen.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Alle Angebote sind miteinander kombinierbar, sodass Sie die Nachmittagsgestaltung
                Ihres Kindes auf Ihre individuellen Betreuungswuensche anpassen koennen.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Module der Hausaufgabenbetreuung und Arbeitsgemeinschaften werden fuer ein halbes
                Jahr gewaehlt. In der Mensa stehen zudem jeden Tag durch unseren Schulcaterer
                LKS - Pop & Corn sowohl ein ansprechendes Kioskangebot als auch ein reichhaltiges
                Mittagsessenangebot in Buffetform zur Verfuegung.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Clock,
                  title: "Betreuungszeiten",
                  text: "Verlaessliche Betreuung bis 15:30 Uhr mit offenen Zeiten in modernen Raeumen.",
                },
                {
                  icon: Users,
                  title: "Arbeitsgemeinschaften",
                  text: "Zahlreiche AG-Angebote fuer ein halbes Jahr waehlbar.",
                },
                {
                  icon: BookOpen,
                  title: "Hausaufgabenbetreuung",
                  text: "Unter Anleitung von Schuelertutorinnen und -tutoren.",
                },
                {
                  icon: Utensils,
                  title: "Mensa & Kiosk",
                  text: "Taeglich Mittagessen in Buffetform und Kioskangebot durch LKS.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-card-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-primary/5 p-5">
                <h3 className="text-sm font-semibold text-foreground">Alle Angebote kombinierbar</h3>
                <ul className="mt-2 space-y-1.5">
                  {[
                    "Offene Betreuungszeiten",
                    "AG-Angebote",
                    "Hausaufgabenbetreuung",
                    "Mittagessen",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
