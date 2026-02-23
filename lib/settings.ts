import { createStaticClient } from "@/lib/supabase/static"
import { createClient } from "@/lib/supabase/server"
import { unstable_cache } from "next/cache"

export type SiteSetting = {
  id: string
  key: string
  value: string
  type: string
  label: string | null
  category: string
  updated_at: string
}

export type NavItem = {
  id: string
  label: string
  href: string
  parent_id: string | null
  sort_order: number
  visible: boolean
  location: string
  children?: NavItem[]
}

/** Fetch all site settings as a key-value map (cached) */
export const getSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const supabase = createStaticClient()
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .order("key")
    const map: Record<string, string> = {}
    data?.forEach((s) => {
      map[s.key] = s.value
    })
    return map
  },
  ["site-settings"],
  { revalidate: 3600, tags: ["settings"] }
)

/** Fetch all settings rows (for CMS editing — NOT cached) */
export async function getSettingsRows(): Promise<SiteSetting[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .order("category, key")
  return (data as SiteSetting[]) ?? []
}

/** Fetch navigation items for a given location, nested (cached) */
export async function getNavigation(location: string): Promise<NavItem[]> {
  return unstable_cache(
    async (): Promise<NavItem[]> => {
      const supabase = createStaticClient()
      const { data } = await supabase
        .from("navigation_items")
        .select("id, label, href, parent_id, sort_order, visible, location")
        .eq("location", location)
        .eq("visible", true)
        .order("sort_order")

      if (!data) return []

      const items = data as NavItem[]
      const parents = items.filter((i) => !i.parent_id)
      const children = items.filter((i) => i.parent_id)

      return parents.map((p) => ({
        ...p,
        children: children
          .filter((c) => c.parent_id === p.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      }))
    },
    ["navigation", location],
    { revalidate: 3600, tags: ["navigation"] }
  )()
}

/** Fetch all nav items flat (for CMS editing — NOT cached) */
export async function getAllNavItems(location?: string): Promise<NavItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from("navigation_items")
    .select("*")
    .order("location, sort_order")
  if (location) {
    query = query.eq("location", location)
  }
  const { data } = await query
  return (data as NavItem[]) ?? []
}

/** Helper: get a single setting by key (uses cached batch query) */
export async function getSetting(key: string): Promise<string> {
  const settings = await getSettings()
  return settings[key] ?? ""
}
