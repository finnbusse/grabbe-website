import { SiteLayout } from "@/components/site-layout"
import { Phone, Mail, GraduationCap, FileText, ClipboardCheck, Bus } from "lucide-react"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Oberstufe - Grabbe-Gymnasium Detmold",
  description: "Informationen zur gymnasialen Oberstufe am Grabbe-Gymnasium Detmold.",
}

export default async function OberstufePage() {
  const content = await getPageContent('oberstufe', PAGE_DEFAULTS['oberstufe'])

  const documents = (content.documents as string).split(',')

  return (
    <SiteLayout>
      <main>
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              {content.page_label}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {content.page_title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {content.page_subtitle}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">{content.portal_title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {content.portal_text}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-8">
                <h3 className="font-display text-xl font-semibold text-card-foreground">
                  {content.anmeldewoche_title}
                </h3>
                <p className="mt-2 text-lg font-medium text-primary">{content.anmeldewoche_date}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {content.anmeldewoche_text}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{content.anmeldewoche_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{content.anmeldewoche_email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Anmeldeunterlagen</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: FileText, label: documents[0] },
                    { icon: ClipboardCheck, label: documents[1] },
                    { icon: Bus, label: documents[2] },
                  ].map((doc) => (
                    <div
                      key={doc.label}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      <doc.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-card-foreground">{doc.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-muted p-6">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {content.voraussetzung_title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {content.voraussetzung_text}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold text-card-foreground">
                  Oberstufen-Koordination
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {content.koordination_text}
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-card-foreground">{content.koordination_name}</p>
                  <p>Tel: {content.koordination_phone}</p>
                  <p>{content.koordination_email}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-lg font-semibold text-card-foreground">
                  {content.hospitationstage_title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {content.hospitationstage_text}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
