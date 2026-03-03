import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ParentLetterWizardProvider } from "@/components/cms/parent-letter-wizard-context"
import { ParentLetterWizard } from "@/components/cms/parent-letter-wizard"

export default async function EditParentLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: letter } = await supabase.from("parent_letters").select("*").eq("id", id).single()

  if (!letter) notFound()

  const l = letter as unknown as {
    id: string
    title: string
    slug: string
    content: string
    number: number
    status: string
    image_url: string | null
    date_from: string | null
    date_to: string | null
  }

  let blocks = []
  try {
    const parsed = JSON.parse(l.content)
    if (Array.isArray(parsed)) blocks = parsed
  } catch {
    // not block content
  }

  return (
    <ParentLetterWizardProvider initialState={{
      title: l.title,
      dateFrom: l.date_from || "",
      dateTo: l.date_to || "",
      coverImageUrl: l.image_url,
      blocks,
      currentStep: 2,
      isSaving: false,
      isPublished: l.status === "published",
      letterId: l.id,
      letterNumber: l.number,
      lastAutoSaved: null,
    }}>
      <ParentLetterWizard editMode />
    </ParentLetterWizardProvider>
  )
}
