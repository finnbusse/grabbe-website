import Link from "next/link"
import { EDITABLE_PAGES } from "@/lib/page-content"
import { FileEdit, ArrowRight, Home, BookOpen, GraduationCap, School, FileText } from "lucide-react"

export default function SeitenEditorPage() {
  // Group pages by route category
  const homepagePages = EDITABLE_PAGES.filter((p) => p.route === "/")
  const unsereSchulePages = EDITABLE_PAGES.filter((p) => p.route.startsWith("/unsere-schule"))
  const schullebenPages = EDITABLE_PAGES.filter((p) => p.route.startsWith("/schulleben"))
  const otherPages = EDITABLE_PAGES.filter((p) =>
    p.route !== "/" &&
    !p.route.startsWith("/unsere-schule") &&
    !p.route.startsWith("/schulleben")
  )

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Seiten-Editor</h1>
          <p className="mt-2 text-muted-foreground">
            Bearbeiten Sie die Texte und Inhalte aller Seiten der Website. Design und Layout bleiben dabei erhalten.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex gap-3">
          <FileEdit className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">So funktioniert der Seiten-Editor</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Jede Seite hat vordefinierte Textfelder, die Sie frei bearbeiten können. Das Design und Layout der Seite
              bleibt dabei immer gleich - Sie können also nichts kaputt machen! Änderungen werden beim nächsten
              Seitenaufruf sichtbar.
            </p>
          </div>
        </div>
      </div>

      {/* Homepage sections */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Home className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-display text-xl font-semibold">Startseite</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {homepagePages.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      </div>

      {/* Unsere Schule */}
      {unsereSchulePages.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="font-display text-xl font-semibold">Unsere Schule</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unsereSchulePages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        </div>
      )}

      {/* Schulleben */}
      {schullebenPages.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
              <School className="h-4 w-4 text-sky-600" />
            </div>
            <h2 className="font-display text-xl font-semibold">Schulleben</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {schullebenPages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        </div>
      )}

      {/* Other pages (Kontakt, Impressum, Datenschutz etc.) */}
      {otherPages.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="font-display text-xl font-semibold">Weitere Seiten</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherPages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        </div>
      )}

      {/* Eigene Seiten hint */}
      <div className="mt-10 rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <BookOpen className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Eigene Seiten</h2>
            <p className="text-sm text-muted-foreground">
              Für komplett neue Seiten mit eigenem Inhalt nutzen Sie den{" "}
              <Link href="/cms/pages" className="text-primary hover:underline">Seiten-Bereich</Link> im CMS.
              Dort können Sie mit Bausteinen wie Karten, Galerien und FAQ-Bereichen eigene Seiten erstellen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PageCard({ page }: { page: { id: string; title: string; description: string; route: string } }) {
  return (
    <Link
      href={`/cms/seiten-editor/${page.id}`}
      className="group rounded-2xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {page.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {page.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60 font-mono">{page.route}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
      </div>
    </Link>
  )
}
