import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { ContactForm } from "@/components/contact-form"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { getSettings } from "@/lib/settings"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Kontakt",
    description: "Kontaktinformationen und Ansprechpartner:innen am Grabbe-Gymnasium Detmold.",
    path: "/kontakt",
  })
}

export default async function KontaktPage() {
  const [content, settings] = await Promise.all([
    getPageContent('kontakt', PAGE_DEFAULTS['kontakt']),
    getSettings(),
  ])

  const schoolAddress = (settings.school_address || "").trim()
  const addressStreet = schoolAddress || (content.address_street as string)
  const addressCity = settings.school_city || (content.address_city as string)
  const phone = settings.school_phone || (content.phone as string)
  const fax = settings.school_fax || (content.fax as string)
  const email = settings.school_email || (content.email as string)
  const addressName =
    settings.school_name_full ||
    settings.school_name ||
    (content.address_name as string)

  const contacts = (content.contacts as string).split(',').map((entry) => {
    const [role, name, desc] = entry.split('|')
    return { role: role?.trim() ?? '', name: name?.trim() ?? '', desc: desc?.trim() ?? '' }
  })

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />

        {/* --- Contact info + Steuergruppe --- */}
        <section className="bg-mesh-blue py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              {/* Left column */}
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                  Kontakt
                </p>
                <h2 className="mt-4 font-display text-4xl tracking-tight text-foreground md:text-5xl">
                  So erreichen Sie uns
                </h2>

                <div className="mt-10 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{addressName}</p>
                        <p className="mt-1">{addressStreet}</p>
                        <p>{addressCity}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          Telefon:{" "}
                          <a href={`tel:${phone.replace(/[\s()-]/g, "")}`} className="text-foreground hover:text-primary transition-colors">
                            {phone}
                          </a>
                        </p>
                        <p className="mt-1 text-muted-foreground">Fax: {fax}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <a href={`mailto:${email}`} className="text-sm text-primary hover:underline">
                        {email}
                      </a>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {content.travel_info}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column – Steuergruppe */}
              <div className="lg:mt-20">
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
                  <h3 className="font-display text-2xl tracking-tight text-foreground">
                    {content.steuergruppe_title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {content.steuergruppe_text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Ansprechpartner:innen --- */}
        <section className="bg-background py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                Team
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight text-foreground md:text-5xl">
                Ansprechpartner:innen
              </h2>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2">
              {contacts.map((c) => (
                <div
                  key={c.name}
                  className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1"
                >
                  <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                    {c.role}
                  </p>
                  <p className="mt-3 font-display text-lg tracking-tight text-foreground">
                    {c.name}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Contact form --- */}
        <section className="bg-muted/40 py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">
                Nachricht
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight text-foreground md:text-5xl">
                Schreiben Sie uns
              </h2>
            </div>

            <div className="mx-auto mt-16 max-w-2xl">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
