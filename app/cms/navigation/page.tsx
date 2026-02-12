"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical, Eye, EyeOff, Save, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

function SortableNavItem({
  item,
  children,
  updateItem,
  deleteItem,
  addItem,
  activeLocation,
  isExpanded,
  toggleExpand,
}: {
  item: NavItem
  children: NavItem[]
  updateItem: (id: string, field: keyof NavItem, value: string | number | boolean) => void
  deleteItem: (id: string) => void
  addItem: (parentId?: string) => void
  activeLocation: string
  isExpanded: boolean
  toggleExpand: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasChildren = children.length > 0

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 p-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />
        </div>
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <Input 
            value={item.label} 
            onChange={(e) => updateItem(item.id, "label", e.target.value)} 
            className="max-w-[200px] rounded-xl" 
            placeholder="Label" 
          />
          <Input 
            value={item.href} 
            onChange={(e) => updateItem(item.id, "href", e.target.value)} 
            className="max-w-[250px] rounded-xl" 
            placeholder="/pfad" 
          />
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Reihenfolge:</Label>
            <Input 
              type="number" 
              value={item.sort_order} 
              onChange={(e) => updateItem(item.id, "sort_order", parseInt(e.target.value) || 0)} 
              className="w-20 rounded-xl" 
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => updateItem(item.id, "visible", !item.visible)} 
            className={`rounded-xl p-2 transition-colors ${item.visible ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
            title={item.visible ? "Sichtbar" : "Versteckt"}
          >
            {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          {activeLocation === "header" && hasChildren && (
            <button 
              onClick={toggleExpand}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted transition-colors"
              title={isExpanded ? "Einklappen" : "Ausklappen"}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          <button 
            onClick={() => deleteItem(item.id)} 
            className="rounded-xl p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Löschen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {activeLocation === "header" && isExpanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 rounded-b-2xl">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Unterlinks ({children.length})</Label>
            <Button variant="ghost" size="sm" onClick={() => addItem(item.id)} className="h-8 text-xs rounded-xl hover:bg-primary/10">
              <Plus className="mr-1 h-3 w-3" /> Unterlink hinzufügen
            </Button>
          </div>
          <div className="space-y-2">
            {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
              <div key={child.id} className="flex items-center gap-3 rounded-xl bg-background p-3 shadow-sm border border-border/50">
                <div className="ml-4 w-1 h-4 bg-primary/30 rounded-full" />
                <Input 
                  value={child.label} 
                  onChange={(e) => updateItem(child.id, "label", e.target.value)} 
                  className="max-w-[180px] rounded-lg text-sm" 
                  placeholder="Label" 
                />
                <Input 
                  value={child.href} 
                  onChange={(e) => updateItem(child.id, "href", e.target.value)} 
                  className="max-w-[220px] rounded-lg text-sm" 
                  placeholder="/pfad" 
                />
                <Input 
                  type="number" 
                  value={child.sort_order} 
                  onChange={(e) => updateItem(child.id, "sort_order", parseInt(e.target.value) || 0)} 
                  className="w-16 rounded-lg text-sm" 
                />
                <button 
                  onClick={() => updateItem(child.id, "visible", !child.visible)} 
                  className={`rounded-lg p-1.5 transition-colors ${child.visible ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {child.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button 
                  onClick={() => deleteItem(child.id)} 
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function NavigationPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeLocation, setActiveLocation] = useState("header")
  const [msg, setMsg] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("navigation_items").select("*").order("sort_order")
      if (data) {
        setItems(data)
        // Expand all items by default
        setExpandedItems(new Set(data.filter(i => !i.parent_id).map(i => i.id)))
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = items.filter((i) => i.location === activeLocation)
  const topLevel = filtered.filter((i) => !i.parent_id).sort((a, b) => a.sort_order - b.sort_order)
  const getChildren = (parentId: string) => filtered.filter((i) => i.parent_id === parentId)

  function updateItem(id: string, field: keyof NavItem, value: string | number | boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = topLevel.findIndex((item) => item.id === active.id)
      const newIndex = topLevel.findIndex((item) => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(topLevel, oldIndex, newIndex)
        
        // Update sort orders
        const updatedItems = items.map((item) => {
          if (item.location === activeLocation && !item.parent_id) {
            const newPosition = newOrder.findIndex((i) => i.id === item.id)
            if (newPosition !== -1) {
              return { ...item, sort_order: newPosition }
            }
          }
          return item
        })
        
        setItems(updatedItems)
      }
    }
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    try {
      // Batch update all items using upsert for better performance
      const updates = items.map(item => ({
        id: item.id,
        label: item.label,
        href: item.href,
        parent_id: item.parent_id,
        sort_order: item.sort_order,
        visible: item.visible,
        location: item.location,
        updated_at: new Date().toISOString(),
      }))
      
      const { error } = await supabase
        .from("navigation_items")
        .upsert(updates, { onConflict: 'id' })
      
      if (error) throw error
      
      setMsg("✓ Navigation erfolgreich gespeichert!")
      setTimeout(() => setMsg(""), 3000)
    } catch (error) {
      setMsg("✗ Fehler beim Speichern")
      setTimeout(() => setMsg(""), 3000)
    } finally {
      setSaving(false)
    }
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
    if (data) {
      setItems((prev) => [...prev, data])
      if (!parentId) {
        setExpandedItems(prev => new Set([...prev, data.id]))
      }
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Link und alle Unterlinks wirklich löschen?")) return
    const supabase = createClient()
    await supabase.from("navigation_items").delete().eq("id", id)
    setItems((prev) => prev.filter((i) => i.id !== id && i.parent_id !== id))
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  function toggleExpand(id: string) {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Navigation verwalten</h1>
          <p className="text-sm text-muted-foreground mt-1">Drag & Drop zum Sortieren • Klick zum Bearbeiten</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${msg.startsWith("✓") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
              {msg}
            </span>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichert...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Location tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.key}
            onClick={() => setActiveLocation(loc.key)}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeLocation === loc.key 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      {/* Drag and drop list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={topLevel.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {topLevel.map((item) => (
              <SortableNavItem
                key={item.id}
                item={item}
                children={getChildren(item.id)}
                updateItem={updateItem}
                deleteItem={deleteItem}
                addItem={addItem}
                activeLocation={activeLocation}
                isExpanded={expandedItems.has(item.id)}
                toggleExpand={() => toggleExpand(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add new item button */}
      <Button 
        variant="outline" 
        onClick={() => addItem()}
        className="rounded-xl border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
      >
        <Plus className="mr-2 h-4 w-4" /> 
        Neuen Link hinzufügen
      </Button>

      {/* Help text */}
      <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
        <h3 className="font-medium text-sm mb-2">💡 Tipps:</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Ziehe die Links mit dem Griff-Symbol, um die Reihenfolge zu ändern</li>
          <li>Klicke auf das Auge-Symbol, um Links sichtbar/unsichtbar zu schalten</li>
          <li>Unterlinks sind nur in der Hauptnavigation verfügbar</li>
          <li>Vergiss nicht zu speichern!</li>
        </ul>
      </div>
    </div>
  )
}
