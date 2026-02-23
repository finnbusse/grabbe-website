"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Check, X, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TAG_COLORS, getTagColorClasses } from "@/components/cms/tag-selector"
import type { TagData } from "@/components/cms/tag-selector"

export default function TagsPage() {
  const [tags, setTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("blue")
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")
  const [error, setError] = useState<string | null>(null)

  const loadTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags")
      const data = await res.json()
      if (Array.isArray(data)) setTags(data)
    } catch {
      setError("Tags konnten nicht geladen werden")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTags() }, [loadTags])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Fehler")
      }
      setNewName("")
      setNewColor("blue")
      await loadTags()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Erstellen")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setError(null)
    try {
      const res = await fetch("/api/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName.trim(), color: editColor }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Fehler")
      }
      setEditId(null)
      await loadTags()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tag wirklich löschen? Er wird von allen zugeordneten Inhalten entfernt.")) return
    setError(null)
    try {
      await fetch(`/api/tags?id=${id}`, { method: "DELETE" })
      await loadTags()
    } catch {
      setError("Fehler beim Löschen")
    }
  }

  const startEdit = (tag: TagData) => {
    setEditId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Erstellen Sie Tags, um Beiträge, Termine und Dokumente thematisch zu organisieren.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Create new tag */}
      <div className="mt-6 rounded-2xl border bg-card p-6 space-y-4">
        <h3 className="font-display font-semibold">Neuen Tag erstellen</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label htmlFor="tagName">Name</Label>
            <Input
              id="tagName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="z.B. Oberstufe, Erprobungsstufe, MINT"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="space-y-2">
            <Label>Farbe</Label>
            <div className="flex gap-1.5">
              {Object.entries(TAG_COLORS).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  title={c.label}
                  onClick={() => setNewColor(key)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${c.bg} ${
                    newColor === key ? `${c.border} ring-2 ring-offset-1 ring-primary scale-110` : "border-transparent hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={saving || !newName.trim()}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {saving ? "Erstellen..." : "Erstellen"}
          </Button>
        </div>
        {/* Preview */}
        {newName.trim() && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Vorschau:</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getTagColorClasses(newColor).bg} ${getTagColorClasses(newColor).text} ${getTagColorClasses(newColor).border}`}>
              <TagIcon className="h-2.5 w-2.5" />
              {newName.trim()}
            </span>
          </div>
        )}
      </div>

      {/* Tags list */}
      <div className="mt-8">
        <h3 className="font-display font-semibold mb-4">Alle Tags ({tags.length})</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Tags werden geladen...</p>
        ) : tags.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <TagIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Noch keine Tags vorhanden.</p>
            <p className="mt-1 text-sm text-muted-foreground">Erstellen Sie Ihren ersten Tag, um Inhalte zu organisieren.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => {
              const colors = getTagColorClasses(tag.color)
              const isEditing = editId === tag.id
              return (
                <div key={tag.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
                  {isEditing ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 max-w-[200px] text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(tag.id)}
                      />
                      <div className="flex gap-1">
                        {Object.entries(TAG_COLORS).map(([key, c]) => (
                          <button
                            key={key}
                            type="button"
                            title={c.label}
                            onClick={() => setEditColor(key)}
                            className={`h-6 w-6 rounded-full border-2 transition-all ${c.bg} ${
                              editColor === key ? `${c.border} ring-2 ring-offset-1 ring-primary scale-110` : "border-transparent hover:scale-105"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleUpdate(tag.id)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}>
                        <TagIcon className="h-2.5 w-2.5" />
                        {tag.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{TAG_COLORS[tag.color]?.label || tag.color}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(tag)} title="Bearbeiten">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(tag.id)} title="Löschen">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
