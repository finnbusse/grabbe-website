import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CmsPagesPage() {
  const supabase = await createClient()
  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .order("sort_order", { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Seiten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Statische Seiten der Website verwalten.
          </p>
        </div>
        <Button asChild>
          <Link href="/cms/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue Seite
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {pages && pages.length > 0 ? (
          pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/cms/pages/${page.id}`}
                    className="font-display text-sm font-semibold text-card-foreground hover:text-primary"
                  >
                    {page.title}
                  </Link>
                  {page.published ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">
                      <Eye className="h-3 w-3" />
                      Aktiv
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <EyeOff className="h-3 w-3" />
                      Entwurf
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {page.route_path ? `${page.route_path}/${page.slug}` : `/seiten/${page.slug}`} &middot; Bereich: {page.section}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/cms/pages/${page.id}`}>Bearbeiten</Link>
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">Noch keine Seiten vorhanden.</p>
            <Button asChild className="mt-4">
              <Link href="/cms/pages/new">
                <Plus className="mr-2 h-4 w-4" />
                Erste Seite erstellen
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
