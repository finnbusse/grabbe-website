import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EDITABLE_PAGES } from "@/lib/page-content"
import { PageSettingsForm } from "@/components/cms/page-settings-form"
import { PageWizardProvider } from "@/components/cms/page-wizard-context"
import { PageWizard } from "@/components/cms/page-wizard"
import { isBlockContent } from "@/lib/format-helpers"

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

  // Otherwise, look up in the pages table — use the three-step wizard at step 1
  const supabase = await createClient()
  const { data: page } = await supabase.from("pages").select("*").eq("id", pageId).single()

  if (!page) notFound()

  const p = page as unknown as {
    id: string
    title: string
    slug: string
    content: string
    section: string | null
    sort_order: number
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
    <PageWizardProvider initialState={{
      title: p.title,
      slug: p.slug,
      routePath: p.route_path || "",
      heroImageUrl: p.hero_image_url,
      heroSubtitle: p.hero_subtitle || "",
      tagIds: [],
      contentMode: isBlockContent(p.content) ? "blocks" : "markdown",
      blocks: isBlockContent(p.content) ? JSON.parse(p.content) : [],
      markdownContent: isBlockContent(p.content) ? "" : p.content,
      metaDescription: p.meta_description || "",
      seoTitle: "",
      ogImageUrl: p.seo_og_image,
      currentStep: 1,
      isSaving: false,
      isPublished: p.status === "published",
      pageId: p.id,
      savedPageId: null,
      lastAutoSaved: null,
      section: p.section || "allgemein",
      sortOrder: p.sort_order || 0,
    }}>
      <PageWizard editMode />
    </PageWizardProvider>
  )
}
