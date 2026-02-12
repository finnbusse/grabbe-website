import { SiteLayout } from "@/components/site-layout"

export const metadata = {
  title: "Datenschutz - Grabbe-Gymnasium Detmold",
  description: "Datenschutzerklaerung des Grabbe-Gymnasium Detmold.",
}

export default function DatenschutzPage() {
  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
              Datenschutz
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Datenschutzerklaerung</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Der Schutz Ihrer persoenlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten
                Ihre Daten daher ausschliesslich auf Grundlage der gesetzlichen Bestimmungen (DSGVO,
                DSG-NRW, SchulG NRW). In diesen Datenschutzinformationen informieren wir Sie ueber
                die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Verantwortlicher</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Christian-Dietrich-Grabbe-Gymnasium<br />
                Kuester-Meyer-Platz 2<br />
                32756 Detmold<br />
                Telefon: 05231 - 99260<br />
                E-Mail: <a href="mailto:sekretariat@grabbe.nrw.schule" className="text-primary hover:underline">sekretariat@grabbe.nrw.schule</a>
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Hosting</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Diese Website wird bei Vercel Inc. gehostet. Die Server befinden sich in der EU.
                Beim Besuch unserer Website werden automatisch technisch notwendige Daten erhoben
                (IP-Adresse, Zeitpunkt des Zugriffs, abgerufene Seite). Diese Daten werden
                ausschliesslich zum Betrieb der Website und zur Sicherstellung der
                Systemsicherheit verarbeitet.
              </p>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
