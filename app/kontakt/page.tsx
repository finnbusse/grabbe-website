import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactForm } from "@/components/contact-form"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export const metadata = {
  title: "Kontakt - Grabbe-Gymnasium Detmold",
  description: "Kontaktinformationen und Ansprechpartner:innen am Grabbe-Gymnasium Detmold.",
}

const contacts = [
  { role: "Schulleitung", name: "Dr. Claus Hilbing", desc: "Personal- und Organisationsentwicklung, Unterrichtsverteilung" },
  { role: "Staendige Vertretung (komm.)", name: "Tanja Brentrup-Lappe", desc: "Haushaltsmittel, Schulgebaeude und Schulanlagen" },
  { role: "Erprobungsstufe (Kl. 5-6)", name: "Herr Hecker", desc: "Koordination der Erprobungsstufe" },
  { role: "Mittelstufe (Kl. 7-10)", name: "Dr. Chee", desc: "Koordination der Mittelstufe" },
  { role: "Oberstufe", name: "Frau Mannebach", desc: "Koordination der gymnasialen Oberstufe" },
  { role: "Verwaltung", name: "Herr Schilling", desc: "Koordination der Verwaltung" },
]

export default function KontaktPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Wer, Was, Wo?
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Kontakt
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Kommunikation miteinander macht den Grabbe-Spirit aus.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact info */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-card-foreground">Adresse</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-card-foreground">Christian-Dietrich-Grabbe-Gymnasium</p>
                      <p>Kuester-Meyer-Platz 2</p>
                      <p>32756 Detmold</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Telefon: <a href="tel:0523199260" className="text-foreground hover:text-primary">05231 - 99260</a></p>
                      <p className="text-muted-foreground">Fax: 05231 - 992616</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <a href="mailto:sekretariat@grabbe.nrw.schule" className="text-sm text-primary hover:underline">
                      sekretariat@grabbe.nrw.schule
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Du bist in hoechstens 30 min bei uns
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-card-foreground">
                  Steuergruppe Schulentwicklung
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Herr Beckmann, Frau Bossmanns, Frau Knueppel, Herr Wessel mit Herrn Dr. Hilbing
                </p>
              </div>
            </div>

            {/* Contacts grid + Form */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Ansprechpartner:innen</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {contacts.map((c) => (
                    <div key={c.name} className="rounded-xl border border-border bg-card p-5">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary">{c.role}</p>
                      <p className="mt-2 font-display text-base font-semibold text-card-foreground">{c.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
