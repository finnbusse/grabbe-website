/**
 * DocumentSlotButton — Shared component for rendering document download buttons.
 *
 * Used on public-facing static pages (Oberstufe, etc.) to render download
 * buttons for CMS-managed document slots.  Matches the existing design of
 * download buttons already present on those pages.
 *
 * Also exports a helper to parse the JSON document_slots arrays stored in
 * page_content settings.
 */

import { Download, FileText } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DocumentSlot {
  id: string
  label: string
  fileUrl: string
  fileTitle: string
  fileType: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a JSON-encoded document slots string from page content.
 * Returns an empty array on invalid input.
 */
export function parseDocumentSlots(raw: unknown): DocumentSlot[] {
  if (!raw || typeof raw !== "string") return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s: Record<string, unknown>) => s && typeof s.id === "string" && typeof s.label === "string"
    ) as DocumentSlot[]
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DocumentSlotButtonProps {
  slot: DocumentSlot
}

/**
 * Renders a single document download button.
 *
 * If the slot has a `fileUrl`, it renders as an `<a>` tag opening the file.
 * If no file is attached, it renders nothing on the public site.
 */
export function DocumentSlotButton({ slot }: DocumentSlotButtonProps) {
  if (!slot.fileUrl) return null

  return (
    <a
      href={slot.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06] group"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
        <FileText className="h-4 w-4" />
      </div>
      <span className="font-medium text-card-foreground text-left flex-1">
        {slot.label}
      </span>
      <Download className="h-4 w-4 text-muted-foreground shrink-0" />
    </a>
  )
}

/**
 * Renders a list of document slot buttons for a section.
 * Only renders slots that have files attached.
 */
export function DocumentSlotList({
  slots,
  heading,
}: {
  slots: DocumentSlot[]
  heading?: string
}) {
  const withFiles = slots.filter((s) => s.fileUrl)
  if (withFiles.length === 0) return null

  return (
    <div className="mt-6 space-y-2">
      {heading && (
        <h3 className="font-display text-sm font-semibold text-foreground">
          {heading}
        </h3>
      )}
      {withFiles.map((slot) => (
        <DocumentSlotButton key={slot.id} slot={slot} />
      ))}
    </div>
  )
}
