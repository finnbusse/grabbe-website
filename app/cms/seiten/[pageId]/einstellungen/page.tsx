import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EDITABLE_PAGES } from "@/lib/page-content"
import { PageSettingsForm } from "@/components/cms/page-settings-form"

export default async function PageSettingsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params

  // Check if it's a static editable page
  const staticPage = EDITABLE_PAGES.find((p) => p.id === pageId)
  // Special case: "homepage" groups all homepage-* pages
  const isHomepage = pageId === "homepage"

  if (staticPage || isHomepage) {
    const def = isHomepage ? EDITABLE_PAGES.find((p) => p.route === "/") : staticPage
    if (!def) notFound()

    // Load saved hero image from site_settings for static pages
    const supabase = await createClient()
    let heroImageUrl = ""
    try {
      const contentKey = isHomepage ? "homepage-hero" : pageId
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", `page_content:${contentKey}`)
        .single()
      if (data?.value) {
        const stored = JSON.parse(data.value)
        heroImageUrl = (stored.hero_image as string) || ""
      }
    } catch { /* default empty */ }

    return (
      <PageSettingsForm
        page={{
          id: pageId,
          title: isHomepage ? "Startseite" : def.title,
          slug: "",
          route: def.route,
          heroImageUrl,
          heroSubtitle: "",
          metaDescription: "",
          seoTitle: "",
          seoOgImage: "",
          status: 'published',
          createdAt: null,
          updatedAt: null,
          tagIds: [],
        }}
        isStatic
      />
    )
  }

  // Otherwise, look up in the pages table
  const supabase = await createClient()
  const { data: page } = await supabase.from("pages").select("*").eq("id", pageId).single()

  if (!page) notFound()

  const p = page as unknown as {
    id: string
    title: string
    slug: string
    route_path: string | null
    hero_image_url: string | null
    hero_subtitle: string | null
    meta_description: string | null
    seo_og_image: string | null
    status: string
    created_at: string | null
    updated_at: string | null
  }

  return (
    <PageSettingsForm
      page={{
        id: p.id,
        title: p.title,
        slug: p.slug,
        route: p.route_path ? `${p.route_path}/${p.slug}` : `/seiten/${p.slug}`,
        heroImageUrl: p.hero_image_url || "",
        heroSubtitle: p.hero_subtitle || "",
        metaDescription: p.meta_description || "",
        seoTitle: "",
        seoOgImage: p.seo_og_image || "",
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        tagIds: [],
      }}
      isStatic={false}
    />
  )
}
