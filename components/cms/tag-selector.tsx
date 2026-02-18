"use client"

import { useState, useEffect } from "react"
import { X, Plus, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export const TAG_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    label: "Blau" },
  green:   { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", label: "Gruen" },
  red:     { bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200",    label: "Rot" },
  yellow:  { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   label: "Gelb" },
  purple:  { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200",  label: "Lila" },
  pink:    { bg: "bg-pink-100",    text: "text-pink-700",    border: "border-pink-200",    label: "Rosa" },
  orange:  { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200",  label: "Orange" },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700",    border: "border-teal-200",    label: "Tuerkis" },
  gray:    { bg: "bg-gray-100",    text: "text-gray-700",    border: "border-gray-200",    label: "Grau" },
}

export interface TagData {
  id: string
  name: string
  color: string
}

export function getTagColorClasses(color: string) {
  return TAG_COLORS[color] || TAG_COLORS.blue
}

export function TagBadge({ tag, onRemove, size = "sm" }: { tag: TagData; onRemove?: () => void; size?: "sm" | "xs" }) {
  const colors = getTagColorClasses(tag.color)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${
      size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
    } font-medium`}>
      <TagIcon className={size === "xs" ? "h-2 w-2" : "h-2.5 w-2.5"} />
      {tag.name}
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 hover:opacity-70">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  )
}

interface TagSelectorProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTags(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id))
  const availableTags = allTags.filter((t) => !selectedTagIds.includes(t.id))

  const addTag = (tagId: string) => {
    onChange([...selectedTagIds, tagId])
    setShowDropdown(false)
  }

  const removeTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId))
  }

  if (loading) {
    return <p className="text-xs text-muted-foreground">Tags laden...</p>
  }

  if (allTags.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Noch keine Tags vorhanden.{" "}
        <a href="/cms/tags" className="text-primary underline">Tags erstellen</a>
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} onRemove={() => removeTag(tag.id)} />
          ))}
        </div>
      )}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={availableTags.length === 0}
        >
          <Plus className="h-3 w-3" />
          Tag hinzufuegen
        </Button>
        {showDropdown && availableTags.length > 0 && (
          <div className="absolute top-full left-0 z-20 mt-1 max-h-48 min-w-[200px] overflow-y-auto rounded-lg border bg-popover p-1 shadow-md">
            {availableTags.map((tag) => {
              const colors = getTagColorClasses(tag.color)
              return (
                <button
                  key={tag.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => addTag(tag.id)}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${colors.bg} ${colors.border} border`} />
                  {tag.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
