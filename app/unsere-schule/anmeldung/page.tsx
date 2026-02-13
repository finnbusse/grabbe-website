import { SiteLayout } from "@/components/site-layout"
import { AnmeldungForm } from "@/components/anmeldung-form"
import { FileText, Download, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Anmeldung - Grabbe-Gymnasium Detmold",
  description: "Informationen zur Anmeldung am Grabbe-Gymnasium Detmold fuer Klasse 5 und die Oberstufe.",
}

export default async function AnmeldungPage() {
  const content = await getPageContent('anmeldung', PAGE_DEFAULTS['anmeldung'])

  const klasse5Checklist = (content.klasse5_checklist as string).split(',')
  const oberstufeChecklist = (content.oberstufe_checklist as string).split(',')

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
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Klasse 5 */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="font-display text-lg font-bold">5</span>
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-card-foreground">
                {content.klasse5_title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{content.klasse5_subtitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {content.klasse5_text}
              </p>

              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-card-foreground">Zur Anmeldung vorzulegen:</h3>
                <ul className="space-y-2">
                  {klasse5Checklist.map((item) => (
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
                {content.oberstufe_title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{content.oberstufe_subtitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {content.oberstufe_text1}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.oberstufe_text2}
              </p>

              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-card-foreground">Anmeldeunterlagen:</h3>
                <ul className="space-y-2">
                  {oberstufeChecklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Download className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-xl bg-muted p-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Hinweis:</strong> {content.oberstufe_hinweis}
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
    </SiteLayout>
  )
}
