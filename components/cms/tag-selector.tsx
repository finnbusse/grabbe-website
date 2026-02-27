"use client"

import { useState, useEffect, useRef } from "react"
import { X, Plus, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export const TAG_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    label: "Blau" },
  green:   { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", label: "Grün" },
  red:     { bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200",    label: "Rot" },
  yellow:  { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   label: "Gelb" },
  purple:  { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200",  label: "Lila" },
  pink:    { bg: "bg-pink-100",    text: "text-pink-700",    border: "border-pink-200",    label: "Rosa" },
  orange:  { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200",  label: "Orange" },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700",    border: "border-teal-200",    label: "Türkis" },
  gray:    { bg: "bg-gray-100",    text: "text-gray-700",    border: "border-gray-200",    label: "Grau" },
}

const TAG_COLOR_KEYS = Object.keys(TAG_COLORS)

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
    <Badge className={`${colors.bg} ${colors.text} ${colors.border} ${
      size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
    } font-medium hover:opacity-90`}>
      <TagIcon className={size === "xs" ? "mr-0.5 h-2 w-2" : "mr-1 h-2.5 w-2.5"} />
      {tag.name}
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 hover:opacity-70">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </Badge>
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
  const [search, setSearch] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(() => TAG_COLOR_KEYS[Math.floor(Math.random() * TAG_COLOR_KEYS.length)])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTags(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setShowCreateForm(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto-focus name input when create form opens
  useEffect(() => {
    if (showCreateForm && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [showCreateForm])

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id))
  const availableTags = allTags.filter((t) => !selectedTagIds.includes(t.id))
  const filteredTags = search
    ? availableTags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : availableTags

  const addTag = (tagId: string) => {
    onChange([...selectedTagIds, tagId])
    setSearch("")
  }

  const removeTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId))
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Tag konnte nicht erstellt werden")

      // Optimistically add and select
      const newTag: TagData = { id: data.id, name: data.name, color: data.color }
      setAllTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)))
      onChange([...selectedTagIds, newTag.id])

      // Reset form
      setNewTagName("")
      setNewTagColor(TAG_COLOR_KEYS[Math.floor(Math.random() * TAG_COLOR_KEYS.length)])
      setShowCreateForm(false)
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Fehler beim Erstellen")
    } finally {
      setCreating(false)
    }
  }

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCreateTag()
    } else if (e.key === "Escape") {
      setShowCreateForm(false)
      setNewTagName("")
      setCreateError(null)
    }
  }

  if (loading) {
    return <p className="text-xs text-muted-foreground">Tags laden...</p>
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
      <div className="relative" ref={dropdownRef}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => {
            setShowDropdown(!showDropdown)
            if (showDropdown) {
              setShowCreateForm(false)
              setSearch("")
            }
          }}
        >
          <Plus className="h-3 w-3" />
          Tag hinzufügen
        </Button>
        {showDropdown && (
          <div className="absolute top-full left-0 z-20 mt-1 min-w-[260px] rounded-lg border bg-popover shadow-md">
            {/* Search input */}
            <div className="border-b p-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tags suchen..."
                className="h-8 text-xs"
              />
            </div>

            {/* Tag list */}
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredTags.length === 0 && !showCreateForm && (
                <p className="px-2.5 py-2 text-xs text-muted-foreground">
                  {search ? "Keine Tags gefunden" : "Alle Tags zugewiesen"}
                </p>
              )}
              {filteredTags.map((tag) => {
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

            {/* Create new tag section */}
            <div className="border-t p-2">
              {!showCreateForm ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Neuen Tag erstellen
                </button>
              ) : (
                <div className="space-y-2 px-1">
                  <Input
                    ref={nameInputRef}
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={handleCreateKeyDown}
                    placeholder="Tag-Name..."
                    className="h-8 text-xs"
                  />
                  {/* Color swatches */}
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_COLOR_KEYS.map((colorKey) => {
                      const colors = TAG_COLORS[colorKey]
                      const isSelected = newTagColor === colorKey
                      return (
                        <button
                          key={colorKey}
                          type="button"
                          onClick={() => setNewTagColor(colorKey)}
                          className={`h-6 w-6 rounded-full border-2 transition-all ${colors.bg} ${
                            isSelected ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                          }`}
                          title={colors.label}
                        />
                      )
                    })}
                  </div>
                  {createError && (
                    <p className="text-xs text-destructive">{createError}</p>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 w-full text-xs"
                    onClick={handleCreateTag}
                    disabled={creating || !newTagName.trim()}
                  >
                    {creating ? "Erstellen..." : "Erstellen"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
