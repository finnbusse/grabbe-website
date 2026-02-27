import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PostWizardProvider } from "@/components/cms/post-wizard-context"
import { PostWizard } from "@/components/cms/post-wizard"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).single()

  if (!post) notFound()

  // Load tags
  const { data: postTags } = await supabase.from("post_tags").select("tag_id").eq("post_id", id)
  const tagIds = (postTags || []).map((t: { tag_id: string }) => t.tag_id)

  const p = post as unknown as {
    id: string; title: string; slug: string; content: string; excerpt: string | null;
    category: string | null; status: string; featured: boolean; image_url: string | null;
    author_name: string | null; event_date: string | null; meta_description: string | null;
    seo_og_image: string | null; created_at: string
  }

  return (
    <PostWizardProvider initialState={{
      title: p.title,
      slug: p.slug,
      category: p.category || "",
      excerpt: p.excerpt || "",
      coverImageUrl: p.image_url,
      publishDate: p.event_date || p.created_at.split("T")[0],
      tagIds,
      contentMode: isBlockContent(p.content) ? "blocks" : "markdown",
      blocks: isBlockContent(p.content) ? JSON.parse(p.content) : [],
      markdownContent: isBlockContent(p.content) ? "" : p.content,
      metaDescription: p.meta_description || "",
      seoTitle: "",
      ogImageUrl: p.seo_og_image,
      currentStep: 2,
      isSaving: false,
      isPublished: p.status === 'published',
      postId: p.id,
      lastAutoSaved: null,
    }}>
      <PostWizard editMode />
    </PostWizardProvider>
  )
}

function isBlockContent(content: string): boolean {
  try {
    if (content.startsWith("[{")) {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) && parsed.length > 0 && parsed[0].type && parsed[0].id
    }
  } catch {
    // not block content
  }
  return false
}
