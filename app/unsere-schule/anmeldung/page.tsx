import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AnmeldungForm } from "@/components/anmeldung-form"
import { FileText, Download, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Anmeldung - Grabbe-Gymnasium Detmold",
  description: "Informationen zur Anmeldung am Grabbe-Gymnasium Detmold fuer Klasse 5 und die Oberstufe.",
}

export default function AnmeldungPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Herzlich willkommen
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Anmeldung
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Wir freuen uns, dass Sie Ihr Kind bei uns am Grabbe anmelden wollen.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Klasse 5 */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="font-display text-lg font-bold">5</span>
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-card-foreground">
                Anmeldung Klasse 5
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">Schuljahr 2026/27</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Liebe Eltern und Erziehungsberechtigte, wir freuen uns, dass Sie Ihr Kind bei uns am
                Grabbe anmelden wollen. Alle weiteren Infos zur Erprobungsstufe (Konzept etc.) finden
                sich auf der Seite zur Erprobungsstufe.
              </p>

              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-card-foreground">Zur Anmeldung vorzulegen:</h3>
                <ul className="space-y-2">
                  {[
                    "Anmeldeformular (Unterschrift BEIDER Erziehungsberechtigten)",
                    "Einwilligung Datenverarbeitung",
                    "Kopie der Geburtsurkunde",
                    "Das letzte Zeugnis",
                    "Nachweis ueber erfolgte Masernimpfung",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="mt-6" asChild>
                <Link href="/unsere-schule/erprobungsstufe">
                  Zur Erprobungsstufe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Oberstufe */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <span className="font-display text-lg font-bold">EF</span>
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-card-foreground">
                Anmeldung Oberstufe
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">Einfuehrungsphase</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Wir freuen uns ueber Ihr/euer Interesse an unserer Schule! Die Anmeldewoche fuer
                die Oberstufe findet vom 23. bis 27.02.2026 statt. Die Terminvergabe erfolgt
                unter Tel. 05231 992617 oder per Mail an b.mannebach@grabbe.nrw.schule.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Gerne koennen Interessent:innen sich auch im Vorfeld der Anmeldewoche persoenlich
                oder telefonisch beraten lassen oder ein bis zwei Tage bei uns hospitieren.
              </p>

              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-card-foreground">Anmeldeunterlagen:</h3>
                <ul className="space-y-2">
                  {[
                    "Anmeldeformular (Unterschrift BEIDER Erziehungsberechtigten)",
                    "Einwilligung Datenverarbeitung",
                    "Antrag auf Busfahrkarte",
                    "Kopie der Geburtsurkunde",
                    "Letztes Zeugnis",
                    "Nachweis Masernimpfung",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Download className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-xl bg-muted p-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Hinweis:</strong> Voraussetzung fuer die Aufnahme in die
                  Sekundarstufe II ist die Berechtigung zum Besuch der gymnasialen Oberstufe,
                  die am Gymnasium durch die Versetzung am Ende der Jahrgangsstufe 10 oder
                  an anderen Schulformen durch den Erwerb des Mittleren Schulabschlusses mit
                  Q-Vermerk erworben wird.
                </p>
              </div>

              <Button className="mt-6" variant="outline" asChild>
                <Link href="/unsere-schule/oberstufe">
                  Zum Oberstufen-Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <AnmeldungForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
