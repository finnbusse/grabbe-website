import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EDITABLE_PAGES } from "@/lib/page-content"
import { PageContentEditor } from "@/components/cms/page-content-editor"
import { HomepageEditor } from "@/components/cms/homepage-editor"
import { PageWizardProvider } from "@/components/cms/page-wizard-context"
import { PageWizard } from "@/components/cms/page-wizard"
import { isBlockContent } from "@/lib/format-helpers"

export default async function PageEditPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params

  // Check if it's the special "homepage" aggregate — show all homepage sections
  if (pageId === "homepage") {
    const homepageSections = EDITABLE_PAGES.filter((p) => p.route === "/")
    if (homepageSections.length === 0) notFound()
    return <HomepageEditor sections={homepageSections} />
  }

  // Check if it's a static editable page
  const staticPage = EDITABLE_PAGES.find((p) => p.id === pageId)
  if (staticPage) {
    return <PageContentEditor page={staticPage} />
  }

  // Otherwise, load from the pages table (custom page) — use the three-step wizard
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
    status: string
    route_path: string | null
    hero_image_url: string | null
    hero_subtitle: string | null
    meta_description: string | null
    seo_og_image: string | null
    created_at: string
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
      currentStep: 2,
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
