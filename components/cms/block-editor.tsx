"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, CreditCard, ImageIcon, HelpCircle, Type, List } from "lucide-react"

// ============================================================================
// Block Types
// ============================================================================

export type BlockType = 'text' | 'cards' | 'faq' | 'gallery' | 'list'

export interface ContentBlock {
  id: string
  type: BlockType
  data: Record<string, unknown>
}

interface BlockOption {
  type: BlockType
  icon: React.ElementType
  label: string
  description: string
}

const BLOCK_OPTIONS: BlockOption[] = [
  { type: 'text', icon: Type, label: 'Textabschnitt', description: 'Ueberschrift und Absatz' },
  { type: 'cards', icon: CreditCard, label: 'Karten', description: '2-4 Karten mit Titel und Text' },
  { type: 'faq', icon: HelpCircle, label: 'FAQ / Aufklappbar', description: 'Aufklappbare Fragen und Antworten' },
  { type: 'gallery', icon: ImageIcon, label: 'Bildergalerie', description: 'Mehrere Bilder in einem Raster' },
  { type: 'list', icon: List, label: 'Aufzaehlung', description: 'Liste mit Aufzaehlungspunkten' },
]

// ============================================================================
// Default data for each block type
// ============================================================================

function createDefaultBlock(type: BlockType): ContentBlock {
  const id = `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  
  switch (type) {
    case 'text':
      return { id, type, data: { heading: '', text: '' } }
    case 'cards':
      return {
        id, type,
        data: {
          cards: [
            { title: '', text: '' },
            { title: '', text: '' },
          ],
        },
      }
    case 'faq':
      return {
        id, type,
        data: {
          items: [
            { question: '', answer: '' },
          ],
        },
      }
    case 'gallery':
      return { id, type, data: { images: [{ url: '', alt: '' }] } }
    case 'list':
      return { id, type, data: { heading: '', items: [''] } }
  }
}

// ============================================================================
// Main Block Editor Component
// ============================================================================

interface BlockEditorProps {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const addBlock = (type: BlockType) => {
    onChange([...blocks, createDefaultBlock(type)])
    setShowAddMenu(false)
  }

  const updateBlock = (index: number, data: Record<string, unknown>) => {
    const updated = [...blocks]
    updated[index] = { ...updated[index], data }
    onChange(updated)
  }

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blocks.length) return
    const updated = [...blocks]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <div key={block.id} className="rounded-2xl border bg-card">
          {/* Block Header */}
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/40" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {BLOCK_OPTIONS.find(o => o.type === block.type)?.label || block.type}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => moveBlock(index, 'down')}
                disabled={index === blocks.length - 1}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => removeBlock(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Block Content */}
          <div className="p-4">
            <BlockContent block={block} onChange={(data) => updateBlock(index, data)} />
          </div>
        </div>
      ))}

      {/* Add Block Button */}
      <div className="relative">
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Baustein hinzufuegen
        </Button>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border bg-card p-2 shadow-lg z-10">
            {BLOCK_OPTIONS.map((option) => (
              <button
                key={option.type}
                onClick={() => addBlock(option.type)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <option.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Individual Block Content Editors
// ============================================================================

function BlockContent({ block, onChange }: { block: ContentBlock; onChange: (data: Record<string, unknown>) => void }) {
  switch (block.type) {
    case 'text':
      return <TextBlockEditor data={block.data} onChange={onChange} />
    case 'cards':
      return <CardsBlockEditor data={block.data} onChange={onChange} />
    case 'faq':
      return <FaqBlockEditor data={block.data} onChange={onChange} />
    case 'gallery':
      return <GalleryBlockEditor data={block.data} onChange={onChange} />
    case 'list':
      return <ListBlockEditor data={block.data} onChange={onChange} />
    default:
      return <p className="text-sm text-muted-foreground">Unbekannter Block-Typ</p>
  }
}

function TextBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Ueberschrift (optional)</Label>
        <Input
          value={(data.heading as string) || ''}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          placeholder="Ueberschrift..."
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Text</Label>
        <textarea
          value={(data.text as string) || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Text eingeben... (Markdown wird unterstuetzt: **fett**, *kursiv*, [Link](url))"
          className="mt-1 min-h-[100px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  )
}

function CardsBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const cards = (data.cards as Array<{ title: string; text: string }>) || []

  const updateCard = (index: number, field: string, value: string) => {
    const updated = [...cards]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...data, cards: updated })
  }

  const addCard = () => {
    if (cards.length >= 4) return
    onChange({ ...data, cards: [...cards, { title: '', text: '' }] })
  }

  const removeCard = (index: number) => {
    onChange({ ...data, cards: cards.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {cards.map((card, i) => (
        <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Karte {i + 1}</Label>
            {cards.length > 1 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCard(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
          </div>
          <Input
            value={card.title}
            onChange={(e) => updateCard(i, 'title', e.target.value)}
            placeholder="Titel der Karte"
            className="text-sm"
          />
          <textarea
            value={card.text}
            onChange={(e) => updateCard(i, 'text', e.target.value)}
            placeholder="Beschreibung..."
            className="min-h-[60px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      ))}
      {cards.length < 4 && (
        <Button variant="outline" size="sm" onClick={addCard}>
          <Plus className="mr-1 h-3 w-3" /> Karte hinzufuegen
        </Button>
      )}
    </div>
  )
}

function FaqBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const items = (data.items as Array<{ question: string; answer: string }>) || []

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...data, items: updated })
  }

  const addItem = () => {
    onChange({ ...data, items: [...items, { question: '', answer: '' }] })
  }

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Frage {i + 1}</Label>
            {items.length > 1 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
          </div>
          <Input
            value={item.question}
            onChange={(e) => updateItem(i, 'question', e.target.value)}
            placeholder="Frage eingeben..."
            className="text-sm"
          />
          <textarea
            value={item.answer}
            onChange={(e) => updateItem(i, 'answer', e.target.value)}
            placeholder="Antwort eingeben..."
            className="min-h-[60px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1 h-3 w-3" /> Frage hinzufuegen
      </Button>
    </div>
  )
}

function GalleryBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const images = (data.images as Array<{ url: string; alt: string }>) || []

  const updateImage = (index: number, field: string, value: string) => {
    const updated = [...images]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...data, images: updated })
  }

  const addImage = () => {
    onChange({ ...data, images: [...images, { url: '', alt: '' }] })
  }

  const removeImage = (index: number) => {
    onChange({ ...data, images: images.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Laden Sie Bilder unter &quot;Dokumente&quot; hoch und fuegen Sie die URL hier ein.</p>
      {images.map((img, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <Input
              value={img.url}
              onChange={(e) => updateImage(i, 'url', e.target.value)}
              placeholder="Bild-URL (https://...)"
              className="text-xs font-mono"
            />
            <Input
              value={img.alt}
              onChange={(e) => updateImage(i, 'alt', e.target.value)}
              placeholder="Bildbeschreibung"
              className="text-xs"
            />
          </div>
          {images.length > 1 && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeImage(i)}>
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addImage}>
        <Plus className="mr-1 h-3 w-3" /> Bild hinzufuegen
      </Button>
    </div>
  )
}

function ListBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const heading = (data.heading as string) || ''
  const items = (data.items as string[]) || []

  const updateItem = (index: number, value: string) => {
    const updated = [...items]
    updated[index] = value
    onChange({ ...data, items: updated })
  }

  const addItem = () => {
    onChange({ ...data, items: [...items, ''] })
  }

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Ueberschrift (optional)</Label>
        <Input
          value={heading}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          placeholder="Ueberschrift der Liste..."
          className="mt-1"
        />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <Input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder="Listenpunkt..."
              className="flex-1 text-sm"
            />
            {items.length > 1 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1 h-3 w-3" /> Punkt hinzufuegen
      </Button>
    </div>
  )
}

// ============================================================================
// Block Content Renderer (for the public-facing pages)
// ============================================================================

export function renderBlocks(blocks: ContentBlock[]): React.ReactNode {
  return blocks.map((block) => <BlockRenderer key={block.id} block={block} />)
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text': {
      const heading = block.data.heading as string
      const text = block.data.text as string
      return (
        <div className="mb-8">
          {heading && <h2 className="font-display text-xl font-bold mb-3">{heading}</h2>}
          {text && <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>}
        </div>
      )
    }
    case 'cards': {
      const cards = (block.data.cards as Array<{ title: string; text: string }>) || []
      return (
        <div className={`mb-8 grid gap-4 ${cards.length <= 2 ? 'sm:grid-cols-2' : cards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {cards.map((card, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold text-card-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      )
    }
    case 'faq': {
      const items = (block.data.items as Array<{ question: string; answer: string }>) || []
      return (
        <div className="mb-8 space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group rounded-2xl border border-border bg-card">
              <summary className="cursor-pointer px-6 py-4 font-display text-sm font-semibold text-card-foreground list-none flex items-center justify-between">
                {item.question}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      )
    }
    case 'gallery': {
      const images = (block.data.images as Array<{ url: string; alt: string }>) || []
      const validImages = images.filter(img => img.url)
      return (
        <div className={`mb-8 grid gap-4 ${validImages.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {validImages.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border">
              <img src={img.url} alt={img.alt || ''} className="w-full h-auto object-cover" />
            </div>
          ))}
        </div>
      )
    }
    case 'list': {
      const heading = block.data.heading as string
      const items = (block.data.items as string[]) || []
      return (
        <div className="mb-8">
          {heading && <h3 className="font-display text-lg font-semibold mb-3">{heading}</h3>}
          <ul className="space-y-2">
            {items.filter(Boolean).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )
    }
    default:
      return null
  }
}
