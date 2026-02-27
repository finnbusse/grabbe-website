import { createClient } from "@/lib/supabase/server"
import { EDITABLE_PAGES } from "@/lib/page-content"
import { PageTree, type PageTreeItem, type CategoryDef } from "@/components/cms/page-tree"

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: "unsere-schule", slug: "unsere-schule", label: "Unsere Schule", sort_order: 0, children: [] },
  { id: "schulleben", slug: "schulleben", label: "Schulleben", sort_order: 1, children: [] },
]

export default async function SeitenPage() {
  const supabase = await createClient()

  // Fetch pages and site structure in parallel
  const [pagesResult, structResult] = await Promise.all([
    supabase
      .from("pages")
      .select("id, title, slug, status, route_path, section, is_index")
      .order("sort_order", { ascending: true }),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_structure")
      .single(),
  ])

  // Parse site structure categories
  let categories: CategoryDef[] = DEFAULT_CATEGORIES
  try {
    const raw = (structResult.data as unknown as { value?: string })?.value
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.categories?.length > 0) {
        categories = parsed.categories
      }
    }
  } catch { /* use defaults */ }

  // Build static page items from EDITABLE_PAGES (deduplicate by route)
  const seenRoutes = new Set<string>()
  const staticItems: PageTreeItem[] = []

  for (const ep of EDITABLE_PAGES) {
    // Group homepage sections under one "Startseite" entry
    if (ep.route === "/") {
      if (!seenRoutes.has("/")) {
        seenRoutes.add("/")
        staticItems.push({
          id: "homepage",
          title: "Startseite",
          route: "/",
          type: "static",
          status: 'published',
        })
      }
      continue
    }

    if (seenRoutes.has(ep.route)) continue
    seenRoutes.add(ep.route)

    staticItems.push({
      id: ep.id,
      title: ep.title,
      route: ep.route,
      type: "static",
      status: 'published',
    })
  }

  // Build custom page items from DB
  const customItems: PageTreeItem[] = ((pagesResult.data as Array<{
    id: string
    title: string
    slug: string
    status: string
    route_path: string | null
    section: string | null
    is_index: boolean | null
  }>) || []).map((p) => ({
    id: p.id,
    title: p.title,
    route: p.route_path ? `${p.route_path}/${p.slug}` : `/seiten/${p.slug}`,
    type: "custom" as const,
    status: p.status,
    routePath: p.route_path,
    isIndex: p.is_index === true,
  }))

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Seiten</h1>
          <p className="mt-2 text-muted-foreground">
            Alle Seiten der Website verwalten – Inhalte bearbeiten, Einstellungen ändern und neue Seiten erstellen.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <PageTree staticPages={staticItems} customPages={customItems} categories={categories} />
      </div>
    </div>
  )
}
