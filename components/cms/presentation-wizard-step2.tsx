"use client"

import { useState } from "react"
import { usePresentationWizard } from "./presentation-wizard-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PRESENTATION_BLOCK_META,
  type PresentationBlock,
  type PresentationBlockType,
} from "@/lib/types/presentation-blocks"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowLeft, ArrowRight, GripVertical, Plus, Trash2, X } from "lucide-react"
import { ImagePicker } from "./image-picker"

// ============================================================================
// Step 2 — Block Editor
// ============================================================================

export function PresentationWizardStep2() {
  const { state, dispatch } = usePresentationWizard()

  const handleBack = () => {
    dispatch({ type: "SET_STEP", payload: 1 })
  }

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 3 })
  }

  const hasContent = state.blocks.length > 0

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <PresentationBlockEditor
        blocks={state.blocks}
        onChange={(blocks) => dispatch({ type: "SET_BLOCKS", payload: blocks })}
      />

      {/* Auto-save indicator */}
      {state.lastAutoSaved && (
        <p className="text-center text-xs text-muted-foreground">
          Automatisch gespeichert um {state.lastAutoSaved}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <Button onClick={handleNext} disabled={!hasContent} size="lg" className="gap-2">
          Weiter
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// Block Editor Component
// ============================================================================

interface PresentationBlockEditorProps {
  blocks: PresentationBlock[]
  onChange: (blocks: PresentationBlock[]) => void
}

function PresentationBlockEditor({ blocks, onChange }: PresentationBlockEditorProps) {
  const [showAddPanel, setShowAddPanel] = useState(false)

  const addBlock = (type: PresentationBlockType) => {
    const id = crypto.randomUUID()
    const newBlock = createDefaultBlock(type, id)
    onChange([...blocks, newBlock])
    setShowAddPanel(false)
  }

  const updateBlock = (index: number, updated: PresentationBlock) => {
    const next = [...blocks]
    next[index] = updated
    onChange(next)
  }

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      onChange(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold">Präsentationsinhalt</h3>
          <p className="text-xs text-muted-foreground">
            Fügen Sie Blöcke hinzu und ordnen Sie den Inhalt der Präsentation.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddPanel(!showAddPanel)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Block hinzufügen
        </Button>
      </div>

      {/* Add Block Panel */}
      {showAddPanel && (
        <div className="rounded-xl border bg-muted/50 p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Blocktyp wählen</h4>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAddPanel(false)} title="Schließen" aria-label="Schließen">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESENTATION_BLOCK_META.map((meta) => (
              <button
                key={meta.type}
                type="button"
                onClick={() => addBlock(meta.type)}
                className="flex flex-col items-start gap-1 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="text-sm font-medium">{meta.label}</span>
                <span className="text-xs text-muted-foreground">{meta.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Block List */}
      {blocks.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Noch keine Blöcke vorhanden. Klicken Sie auf &quot;Block hinzufügen&quot;, um zu beginnen.
          </p>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {blocks.map((block, index) => (
                <SortableBlockCard
                  key={block.id}
                  block={block}
                  onUpdate={(updated) => updateBlock(index, updated)}
                  onRemove={() => removeBlock(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

// ============================================================================
// Sortable Block Card
// ============================================================================

interface SortableBlockCardProps {
  block: PresentationBlock
  onUpdate: (block: PresentationBlock) => void
  onRemove: () => void
}

function SortableBlockCard({ block, onUpdate, onRemove }: SortableBlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const meta = PRESENTATION_BLOCK_META.find((m) => m.type === block.type)

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <button type="button" className="cursor-grab text-muted-foreground hover:text-foreground" {...attributes} {...listeners} title="Block verschieben" aria-label="Block verschieben">
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium flex-1">{meta?.label ?? block.type}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onRemove} title="Block löschen" aria-label="Block löschen">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="p-4 bg-muted/50">
        <BlockEditForm block={block} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

// ============================================================================
// Block Edit Forms
// ============================================================================

interface BlockEditFormProps {
  block: PresentationBlock
  onUpdate: (block: PresentationBlock) => void
}

function BlockEditForm({ block, onUpdate }: BlockEditFormProps) {
  switch (block.type) {
    case "hero":
      return <HeroForm block={block} onUpdate={onUpdate} />
    case "text":
      return <TextForm block={block} onUpdate={onUpdate} />
    case "image_full":
      return <ImageFullForm block={block} onUpdate={onUpdate} />
    case "gallery":
      return <GalleryForm block={block} onUpdate={onUpdate} />
    case "quote":
      return <QuoteForm block={block} onUpdate={onUpdate} />
    case "video":
      return <VideoForm block={block} onUpdate={onUpdate} />
    case "feature_cards":
      return <FeatureCardsForm block={block} onUpdate={onUpdate} />
    case "divider":
      return <DividerForm block={block} onUpdate={onUpdate} />
    case "stats":
      return <StatsForm block={block} onUpdate={onUpdate} />
    case "two_column":
      return <TwoColumnForm block={block} onUpdate={onUpdate} />
    default:
      return null
  }
}

// ---- Hero ----

function HeroForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "hero" }>; onUpdate: (b: PresentationBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <ImagePicker
          value={block.backgroundImageUrl || null}
          onChange={(url) => onUpdate({ ...block, backgroundImageUrl: url || "" })}
          label="Hintergrundbild"
          aspectRatio="16/9"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Überschrift</Label>
        <Input value={block.heading} onChange={(e) => onUpdate({ ...block, heading: e.target.value })} placeholder="Hauptüberschrift" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Untertitel</Label>
        <Input value={block.subtitle} onChange={(e) => onUpdate({ ...block, subtitle: e.target.value })} placeholder="Untertitel" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">CTA-Text</Label>
          <Input value={block.ctaLabel} onChange={(e) => onUpdate({ ...block, ctaLabel: e.target.value })} placeholder="Mehr erfahren" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">CTA-URL</Label>
          <Input value={block.ctaUrl} onChange={(e) => onUpdate({ ...block, ctaUrl: e.target.value })} placeholder="/seite" />
        </div>
      </div>
    </div>
  )
}

// ---- Text ----

function TextForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "text" }>; onUpdate: (b: PresentationBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Inhalt</Label>
        <textarea
          value={block.content}
          onChange={(e) => onUpdate({ ...block, content: e.target.value })}
          placeholder="Textinhalt…"
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Größe</Label>
          <select
            value={block.size}
            onChange={(e) => onUpdate({ ...block, size: e.target.value as "h1" | "h2" | "h3" | "body" })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="body">Body</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Ausrichtung</Label>
          <select
            value={block.alignment}
            onChange={(e) => onUpdate({ ...block, alignment: e.target.value as "left" | "center" })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="left">Links</option>
            <option value="center">Zentriert</option>
          </select>
        </div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={block.isLead}
              onChange={(e) => onUpdate({ ...block, isLead: e.target.checked })}
              className="rounded border-input"
            />
            Lead-Text
          </label>
        </div>
      </div>
    </div>
  )
}

// ---- Image Full ----

function ImageFullForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "image_full" }>; onUpdate: (b: PresentationBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <ImagePicker
          value={block.imageUrl || null}
          onChange={(url) => onUpdate({ ...block, imageUrl: url || "" })}
          label="Bild"
          aspectRatio="free"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Alt-Text</Label>
        <Input value={block.alt} onChange={(e) => onUpdate({ ...block, alt: e.target.value })} placeholder="Bildbeschreibung" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Bildunterschrift</Label>
        <Input value={block.caption} onChange={(e) => onUpdate({ ...block, caption: e.target.value })} placeholder="Optionale Beschriftung" />
      </div>
    </div>
  )
}

// ---- Gallery ----

function GalleryForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "gallery" }>; onUpdate: (b: PresentationBlock) => void }) {
  const addImage = () => {
    onUpdate({ ...block, images: [...block.images, { imageUrl: "", alt: "", caption: "" }] })
  }

  const updateImage = (index: number, field: string, value: string) => {
    const images = [...block.images]
    images[index] = { ...images[index], [field]: value }
    onUpdate({ ...block, images })
  }

  const removeImage = (index: number) => {
    onUpdate({ ...block, images: block.images.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Spalten</Label>
        <select
          value={block.columns}
          onChange={(e) => onUpdate({ ...block, columns: Number(e.target.value) as 2 | 3 | 4 })}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value={2}>2 Spalten</option>
          <option value={3}>3 Spalten</option>
          <option value={4}>4 Spalten</option>
        </select>
      </div>
      {block.images.map((img, i) => (
        <div key={i} className="rounded-lg border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Bild {i + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeImage(i)} title="Bild löschen" aria-label="Bild löschen">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <ImagePicker
            value={img.imageUrl || null}
            onChange={(url) => updateImage(i, "imageUrl", url || "")}
            aspectRatio="free"
          />
          <Input value={img.alt} onChange={(e) => updateImage(i, "alt", e.target.value)} placeholder="Alt-Text" className="text-xs" />
          <Input value={img.caption} onChange={(e) => updateImage(i, "caption", e.target.value)} placeholder="Bildunterschrift" className="text-xs" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addImage} className="gap-1.5">
        <Plus className="h-3 w-3" />
        Bild hinzufügen
      </Button>
    </div>
  )
}

// ---- Quote ----

function QuoteForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "quote" }>; onUpdate: (b: PresentationBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Zitattext</Label>
        <textarea
          value={block.text}
          onChange={(e) => onUpdate({ ...block, text: e.target.value })}
          placeholder="Zitattext…"
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Quellenangabe</Label>
          <Input value={block.attribution} onChange={(e) => onUpdate({ ...block, attribution: e.target.value })} placeholder="Name / Quelle" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Akzentfarbe</Label>
          <Input value={block.accentColor} onChange={(e) => onUpdate({ ...block, accentColor: e.target.value })} placeholder="#3b82f6" />
        </div>
      </div>
    </div>
  )
}

// ---- Video ----

function VideoForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "video" }>; onUpdate: (b: PresentationBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Video-URL</Label>
        <Input value={block.url} onChange={(e) => onUpdate({ ...block, url: e.target.value })} placeholder="https://youtube.com/watch?v=…" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Beschriftung</Label>
        <Input value={block.caption} onChange={(e) => onUpdate({ ...block, caption: e.target.value })} placeholder="Optionale Beschriftung" />
      </div>
    </div>
  )
}

// ---- Feature Cards ----

function FeatureCardsForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "feature_cards" }>; onUpdate: (b: PresentationBlock) => void }) {
  const addCard = () => {
    onUpdate({ ...block, cards: [...block.cards, { iconName: "", heading: "", text: "" }] })
  }

  const updateCard = (index: number, field: string, value: string) => {
    const cards = [...block.cards]
    cards[index] = { ...cards[index], [field]: value }
    onUpdate({ ...block, cards })
  }

  const removeCard = (index: number) => {
    onUpdate({ ...block, cards: block.cards.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      {block.cards.map((card, i) => (
        <div key={i} className="rounded-lg border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Karte {i + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeCard(i)} title="Karte löschen" aria-label="Karte löschen">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <Input value={card.iconName} onChange={(e) => updateCard(i, "iconName", e.target.value)} placeholder="Icon-Name (z.B. Star)" className="text-xs" />
          <Input value={card.heading} onChange={(e) => updateCard(i, "heading", e.target.value)} placeholder="Überschrift" className="text-xs" />
          <Input value={card.text} onChange={(e) => updateCard(i, "text", e.target.value)} placeholder="Beschreibungstext" className="text-xs" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addCard} className="gap-1.5">
        <Plus className="h-3 w-3" />
        Karte hinzufügen
      </Button>
    </div>
  )
}

// ---- Divider ----

function DividerForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "divider" }>; onUpdate: (b: PresentationBlock) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Stil</Label>
      <select
        value={block.style}
        onChange={(e) => onUpdate({ ...block, style: e.target.value as "line" | "dots" | "wave" })}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="line">Linie</option>
        <option value="dots">Punkte</option>
        <option value="wave">Welle</option>
      </select>
    </div>
  )
}

// ---- Stats ----

function StatsForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "stats" }>; onUpdate: (b: PresentationBlock) => void }) {
  const addItem = () => {
    onUpdate({ ...block, items: [...block.items, { value: "", label: "" }] })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const items = [...block.items]
    items[index] = { ...items[index], [field]: value }
    onUpdate({ ...block, items })
  }

  const removeItem = (index: number) => {
    onUpdate({ ...block, items: block.items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      {block.items.map((item, i) => (
        <div key={i} className="rounded-lg border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Kennzahl {i + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItem(i)} title="Kennzahl löschen" aria-label="Kennzahl löschen">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <Input value={item.value} onChange={(e) => updateItem(i, "value", e.target.value)} placeholder="Wert (z.B. 1.200+)" className="text-xs" />
          <Input value={item.label} onChange={(e) => updateItem(i, "label", e.target.value)} placeholder="Beschriftung" className="text-xs" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5">
        <Plus className="h-3 w-3" />
        Kennzahl hinzufügen
      </Button>
    </div>
  )
}

// ---- Two Column ----

function TwoColumnForm({ block, onUpdate }: { block: Extract<PresentationBlock, { type: "two_column" }>; onUpdate: (b: PresentationBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Textinhalt</Label>
        <textarea
          value={block.textContent}
          onChange={(e) => onUpdate({ ...block, textContent: e.target.value })}
          placeholder="Textinhalt…"
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <ImagePicker
            value={block.imageUrl || null}
            onChange={(url) => onUpdate({ ...block, imageUrl: url || "" })}
            label="Bild"
            aspectRatio="free"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Bild Alt-Text</Label>
          <Input value={block.imageAlt} onChange={(e) => onUpdate({ ...block, imageAlt: e.target.value })} placeholder="Bildbeschreibung" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Bildposition</Label>
          <select
            value={block.imagePosition}
            onChange={(e) => onUpdate({ ...block, imagePosition: e.target.value as "left" | "right" })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="left">Links</option>
            <option value="right">Rechts</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Aufteilung</Label>
          <select
            value={block.split}
            onChange={(e) => onUpdate({ ...block, split: e.target.value as "50/50" | "60/40" | "40/60" })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="50/50">50/50</option>
            <option value="60/40">60/40</option>
            <option value="40/60">40/60</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Default Block Factory
// ============================================================================

function createDefaultBlock(type: PresentationBlockType, id: string): PresentationBlock {
  switch (type) {
    case "hero":
      return { type, id, backgroundImageUrl: "", heading: "", subtitle: "", ctaLabel: "", ctaUrl: "" }
    case "text":
      return { type, id, content: "", size: "body", alignment: "left", isLead: false }
    case "image_full":
      return { type, id, imageUrl: "", alt: "", caption: "" }
    case "gallery":
      return { type, id, columns: 3, images: [] }
    case "quote":
      return { type, id, text: "", attribution: "", accentColor: "#3b82f6" }
    case "video":
      return { type, id, url: "", caption: "" }
    case "feature_cards":
      return { type, id, cards: [] }
    case "divider":
      return { type, id, style: "line" }
    case "stats":
      return { type, id, items: [] }
    case "two_column":
      return { type, id, textContent: "", imageUrl: "", imageAlt: "", imagePosition: "right", split: "50/50" }
  }
}
