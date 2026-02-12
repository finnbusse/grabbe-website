import { SiteLayout } from "@/components/site-layout"
import { Handshake } from "lucide-react"

export const metadata = {
  title: "Netzwerk & Partner - Grabbe-Gymnasium Detmold",
  description: "Unsere Kooperationspartner und Vernetzung in Detmold.",
}

const partners = [
  { name: "Hochschule fuer Musik", category: "Kultur" },
  { name: "Landestheater Detmold", category: "Kultur" },
  { name: "Johanniter", category: "Soziales" },
  { name: "Stadtbibliothek Detmold", category: "Bildung" },
  { name: "Lippische Landesbibliothek", category: "Bildung" },
  { name: "Landesarchiv NRW", category: "Bildung" },
  { name: "Holocaust-Gedenkstaette Yad Vashem", category: "Gedenken" },
  { name: "McLean Highschool Washington", category: "International" },
  { name: "Wortmann KG", category: "Wirtschaft" },
  { name: "Weidmueller GmbH & Co KG", category: "Wirtschaft" },
  { name: "Peter-Glaesel-Schule Detmold", category: "Bildung" },
]

export default function NetzwerkPage() {
  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Schulleben</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Vernetzt in Detmold
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Wir bieten Ihren Kindern nicht nur in der Schule lebensnahe Erfahrungen,
              sondern auch mit unseren vertrauensvollen Partnern.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div key={partner.name} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Handshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-card-foreground">{partner.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{partner.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
