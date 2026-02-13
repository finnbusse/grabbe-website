import { EDITABLE_PAGES } from "@/lib/page-content"
import { PageContentEditor } from "@/components/cms/page-content-editor"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ pageId: string }>
}

export default async function EditPageContentPage({ params }: PageProps) {
  const { pageId } = await params
  const page = EDITABLE_PAGES.find((p) => p.id === pageId)

  if (!page) {
    notFound()
  }

  return <PageContentEditor page={page} />
}
