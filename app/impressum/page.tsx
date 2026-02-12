import { SiteLayout } from "@/components/site-layout"

export const metadata = {
  title: "Impressum - Grabbe-Gymnasium Detmold",
  description: "Impressum des Grabbe-Gymnasium Detmold.",
}

export default function ImpressumPage() {
  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
              Impressum
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Verantwortlich</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Dr. Claus Hilbing und Oliver Sprenger
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Anschrift</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Christian-Dietrich-Grabbe-Gymnasium<br />
                Kuester-Meyer-Platz 2<br />
                32756 Detmold
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Kontakt</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Telefon: 05231 - 99260<br />
                Telefax: 05231 - 992616<br />
                E-Mail: <a href="mailto:sekretariat@grabbe.nrw.schule" className="text-primary hover:underline">sekretariat@grabbe.nrw.schule</a>
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Schultraeger</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Stadt Detmold
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Aufsichtsbehoerde</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Bezirksregierung Detmold
              </p>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
