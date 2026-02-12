import Link from "next/link"
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { getSettings } from "@/lib/settings"

export async function ContactSection() {
  const s = await getSettings()

  const address = s.school_address || "Kuester-Meyer-Platz 2, 32756 Detmold"
  const phone = s.school_phone || "05231 - 99260"
  const fax = s.school_fax || "05231 - 992616"
  const email = s.school_email || "sekretariat@grabbe.nrw.schule"
  const schulleiter = s.schulleitung_1 || "Dr. Claus Hilbing"
  const stellvertreter = s.schulleitung_2 || "Oliver Sprenger"

  return (
    <section className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-accent">
              Kontakt
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
              So finden <span className="italic text-accent">Sie uns</span>
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              Du bist in hoechstens 30 Minuten bei uns - mit Bahn, Bus, Fahrrad oder zu Fuss.
            </p>

            <div className="mt-10 space-y-6">
              {[
                {
                  icon: MapPin,
                  title: "Adresse",
                  content: (
                    <>
                      {s.school_name_full || "Christian-Dietrich-Grabbe-Gymnasium"}<br />
                      {address}
                    </>
                  ),
                },
                {
                  icon: Phone,
                  title: "Telefon",
                  content: (
                    <>
                      <a href={`tel:${phone.replace(/[\s-]/g, "")}`} className="hover:text-accent transition-colors">{phone}</a>
                      <br />
                      <span className="text-xs">{"Fax: "}{fax}</span>
                    </>
                  ),
                },
                {
                  icon: Mail,
                  title: "E-Mail",
                  content: (
                    <a href={`mailto:${email}`} className="text-accent hover:underline">{email}</a>
                  ),
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-5 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-3">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-sub text-xs uppercase tracking-[0.15em] text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/kontakt"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-lg hover:shadow-accent/20 group"
            >
              Alle Ansprechpartner:innen
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-10 transition-all hover:shadow-lg hover:shadow-accent/5">
            <h3 className="font-display text-2xl text-card-foreground">Schulleitung</h3>
            <div className="mt-2 divider-line bg-accent/40 mx-0" />
            <div className="mt-8 space-y-8">
              {[
                { name: schulleiter, role: "Schulleiter" },
                { name: stellvertreter, role: "Stellvertretende Schulleitung" },
              ].map((person) => (
                <div key={person.name} className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted font-display text-lg text-muted-foreground">
                    {person.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-display text-lg text-card-foreground">{person.name}</p>
                    <p className="mt-0.5 font-sub text-xs uppercase tracking-[0.1em] text-muted-foreground">{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
