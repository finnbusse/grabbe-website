"use client"

// ---------------------------------------------------------------------------
// SEO Google Preview — shows how a page will appear in Google search results
// ---------------------------------------------------------------------------

interface SeoPreviewProps {
  title: string
  description: string
  url: string
  titleSeparator?: string
  titleSuffix?: string
}

export function SeoPreview({
  title,
  description,
  url,
  titleSeparator = " / ",
  titleSuffix = "Grabbe-Gymnasium",
}: SeoPreviewProps) {
  const fullTitle = title
    ? `${title}${titleSeparator}${titleSuffix}`
    : titleSuffix
  const displayUrl = url.startsWith("http") ? url : `https://grabbe.site${url}`
  const truncatedDesc = description.length > 160 ? `${description.slice(0, 157)}...` : description

  return (
    <div className="rounded-xl border bg-white p-4 space-y-1 dark:bg-card">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Google-Vorschau</p>
      {/* URL breadcrumb */}
      <p className="text-sm text-[#202124] dark:text-muted-foreground truncate font-sans">
        {displayUrl}
      </p>
      {/* Title */}
      <p className="text-lg leading-snug text-[#1a0dab] hover:underline cursor-default truncate font-sans dark:text-primary">
        {fullTitle || "Seitentitel"}
      </p>
      {/* Description */}
      <p className="text-sm text-[#4d5156] leading-relaxed font-sans dark:text-muted-foreground">
        {truncatedDesc || "Beschreibung der Seite, die in Suchergebnissen angezeigt wird."}
      </p>
    </div>
  )
}
