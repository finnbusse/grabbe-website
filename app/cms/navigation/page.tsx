"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical, Eye, EyeOff, Save, Loader2 } from "lucide-react"

type NavItem = {
  id: string
  label: string
  href: string
  parent_id: string | null
  sort_order: number
  visible: boolean
  location: string
}

const LOCATIONS = [
  { key: "header", label: "Hauptnavigation" },
  { key: "footer", label: "Footer-Links" },
  { key: "footer-legal", label: "Footer-Rechtslinks" },
]

export default function NavigationPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeLocation, setActiveLocation] = useState("header")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("navigation_items").select("*").order("sort_order")
      if (data) setItems(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = items.filter((i) => i.location === activeLocation)
  const topLevel = filtered.filter((i) => !i.parent_id)
  const getChildren = (parentId: string) => filtered.filter((i) => i.parent_id === parentId)

  function updateItem(id: string, field: keyof NavItem, value: string | number | boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    for (const item of items) {
      await supabase.from("navigation_items").update({
        label: item.label, href: item.href, sort_order: item.sort_order,
        visible: item.visible, updated_at: new Date().toISOString(),
      }).eq("id", item.id)
    }
    setMsg("Navigation gespeichert!")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  async function addItem(parentId?: string) {
    const supabase = createClient()
    const maxSort = Math.max(0, ...filtered.map((i) => i.sort_order)) + 1
    const { data } = await supabase.from("navigation_items").insert({
      label: "Neuer Link",
      href: "/",
      parent_id: parentId || null,
      sort_order: maxSort,
      visible: true,
      location: activeLocation,
    }).select().single()
    if (data) setItems((prev) => [...prev, data])
  }

  async function deleteItem(id: string) {
    if (!confirm("Link und alle Unterlinks loeschen?")) return
    const supabase = createClient()
    await supabase.from("navigation_items").delete().eq("id", id)
    setItems((prev) => prev.filter((i) => i.id !== id && i.parent_id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Navigation</h1>
          <p className="text-sm text-muted-foreground">Header, Footer und Rechts-Links bearbeiten</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Speichern
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.key}
            onClick={() => setActiveLocation(loc.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeLocation === loc.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {topLevel.sort((a, b) => a.sort_order - b.sort_order).map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 p-4">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 items-center gap-3">
                <Input value={item.label} onChange={(e) => updateItem(item.id, "label", e.target.value)} className="max-w-[200px]" placeholder="Label" />
                <Input value={item.href} onChange={(e) => updateItem(item.id, "href", e.target.value)} className="max-w-[250px]" placeholder="/pfad" />
                <Input type="number" value={item.sort_order} onChange={(e) => updateItem(item.id, "sort_order", parseInt(e.target.value) || 0)} className="w-20" />
              </div>
              <button onClick={() => updateItem(item.id, "visible", !item.visible)} className={`rounded-lg p-2 ${item.visible ? "text-primary" : "text-muted-foreground"}`}>
                {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => deleteItem(item.id)} className="rounded-lg p-2 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {activeLocation === "header" && (
              <div className="border-t border-border bg-muted/30 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Unterlinks</Label>
                  <Button variant="ghost" size="sm" onClick={() => addItem(item.id)} className="h-7 text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Unterlink
                  </Button>
                </div>
                <div className="space-y-2">
                  {getChildren(item.id).sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                    <div key={child.id} className="flex items-center gap-3 rounded-lg bg-background p-2">
                      <div className="ml-6 w-1 h-4 bg-border rounded-full" />
                      <Input value={child.label} onChange={(e) => updateItem(child.id, "label", e.target.value)} className="max-w-[180px]" placeholder="Label" />
                      <Input value={child.href} onChange={(e) => updateItem(child.id, "href", e.target.value)} className="max-w-[220px]" placeholder="/pfad" />
                      <Input type="number" value={child.sort_order} onChange={(e) => updateItem(child.id, "sort_order", parseInt(e.target.value) || 0)} className="w-16" />
                      <button onClick={() => updateItem(child.id, "visible", !child.visible)} className={`rounded-lg p-1.5 ${child.visible ? "text-primary" : "text-muted-foreground"}`}>
                        {child.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => deleteItem(child.id)} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={() => addItem()}>
        <Plus className="mr-2 h-4 w-4" /> Neuen Link hinzufuegen
      </Button>
    </div>
  )
}
