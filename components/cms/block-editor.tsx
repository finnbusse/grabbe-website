"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, CreditCard, ImageIcon, HelpCircle, Type, List, Quote, Minus, Video, MousePointerClick, Columns, MoveVertical, ListCollapse, Table2, CalendarDays, Download, Newspaper } from "lucide-react"

// ============================================================================
// Block Types
// ============================================================================

export type BlockType = 'text' | 'cards' | 'faq' | 'gallery' | 'list' | 'hero' | 'quote' | 'divider' | 'video' | 'cta' | 'columns' | 'spacer' | 'accordion' | 'table' | 'tagged-events' | 'tagged-downloads' | 'tagged-posts'

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
  { type: 'text', icon: Type, label: 'Textabschnitt', description: 'Überschrift und Absatz' },
  { type: 'cards', icon: CreditCard, label: 'Karten', description: '2-4 Karten mit Titel und Text' },
  { type: 'faq', icon: HelpCircle, label: 'FAQ / Aufklappbar', description: 'Aufklappbare Fragen und Antworten' },
  { type: 'gallery', icon: ImageIcon, label: 'Bildergalerie', description: 'Mehrere Bilder in einem Raster' },
  { type: 'list', icon: List, label: 'Aufzählung', description: 'Liste mit Aufzählungspunkten' },
  { type: 'hero', icon: ImageIcon, label: 'Hero / Banner', description: 'Großer Banner mit Überschrift und Bild' },
  { type: 'quote', icon: Quote, label: 'Zitat', description: 'Zitat mit optionalem Autor' },
  { type: 'divider', icon: Minus, label: 'Trennlinie', description: 'Visueller Trenner zwischen Abschnitten' },
  { type: 'video', icon: Video, label: 'Video', description: 'YouTube/Vimeo Video einbetten' },
  { type: 'cta', icon: MousePointerClick, label: 'Call-to-Action', description: 'Auffälliger Handlungsaufruf mit Button' },
  { type: 'columns', icon: Columns, label: 'Zwei Spalten', description: 'Zwei-Spalten-Layout mit Überschrift und Text' },
  { type: 'spacer', icon: MoveVertical, label: 'Abstand', description: 'Vertikaler Abstand zwischen Abschnitten' },
  { type: 'accordion', icon: ListCollapse, label: 'Akkordeon', description: 'Aufklappbare Abschnitte mit Titel und Inhalt' },
  { type: 'table', icon: Table2, label: 'Tabelle', description: 'Einfache Tabelle mit Zeilen und Spalten' },
  { type: 'tagged-events', icon: CalendarDays, label: 'Termine (Tag)', description: 'Termine mit bestimmtem Tag anzeigen' },
  { type: 'tagged-downloads', icon: Download, label: 'Downloads (Tag)', description: 'Downloads mit bestimmtem Tag anzeigen' },
  { type: 'tagged-posts', icon: Newspaper, label: 'Beiträge (Tag)', description: 'Beiträge mit bestimmtem Tag anzeigen' },
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
    case 'hero':
      return { id, type, data: { heading: '', subheading: '', backgroundImage: '', ctaText: '', ctaUrl: '' } }
    case 'quote':
      return { id, type, data: { quote: '', author: '' } }
    case 'divider':
      return { id, type, data: {} }
    case 'video':
      return { id, type, data: { url: '', caption: '' } }
    case 'cta':
      return { id, type, data: { heading: '', text: '', buttonText: '', buttonUrl: '', style: 'light' } }
    case 'columns':
      return { id, type, data: { left: { heading: '', text: '' }, right: { heading: '', text: '' } } }
    case 'spacer':
      return { id, type, data: { size: 'medium' } }
    case 'accordion':
      return { id, type, data: { items: [{ title: '', content: '' }] } }
    case 'table':
      return { id, type, data: { rows: [['', ''], ['', '']] } }
    case 'tagged-events':
      return { id, type, data: { tagId: '', heading: 'Termine', limit: 5 } }
    case 'tagged-downloads':
      return { id, type, data: { tagId: '', heading: 'Downloads' } }
    case 'tagged-posts':
      return { id, type, data: { tagId: '', heading: 'Beiträge', limit: 5 } }
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
          Baustein hinzufügen
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
    case 'hero':
      return <HeroBlockEditor data={block.data} onChange={onChange} />
    case 'quote':
      return <QuoteBlockEditor data={block.data} onChange={onChange} />
    case 'divider':
      return <DividerBlockEditor />
    case 'video':
      return <VideoBlockEditor data={block.data} onChange={onChange} />
    case 'cta':
      return <CtaBlockEditor data={block.data} onChange={onChange} />
    case 'columns':
      return <ColumnsBlockEditor data={block.data} onChange={onChange} />
    case 'spacer':
      return <SpacerBlockEditor data={block.data} onChange={onChange} />
    case 'accordion':
      return <AccordionBlockEditor data={block.data} onChange={onChange} />
    case 'table':
      return <TableBlockEditor data={block.data} onChange={onChange} />
    case 'tagged-events':
    case 'tagged-downloads':
    case 'tagged-posts':
      return <TaggedContentBlockEditor type={block.type} data={block.data} onChange={onChange} />
    default:
      return <p className="text-sm text-muted-foreground">Unbekannter Block-Typ</p>
  }
}

function TextBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Überschrift (optional)</Label>
        <Input
          value={(data.heading as string) || ''}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          placeholder="Überschrift..."
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Text</Label>
        <textarea
          value={(data.text as string) || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Text eingeben... (Markdown wird unterstützt: **fett**, *kursiv*, [Link](url))"
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
          <Plus className="mr-1 h-3 w-3" /> Karte hinzufügen
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
        <Plus className="mr-1 h-3 w-3" /> Frage hinzufügen
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
        <Plus className="mr-1 h-3 w-3" /> Bild hinzufügen
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
        <Label className="text-xs">Überschrift (optional)</Label>
        <Input
          value={heading}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          placeholder="Überschrift der Liste..."
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
        <Plus className="mr-1 h-3 w-3" /> Punkt hinzufügen
      </Button>
    </div>
  )
}

function HeroBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Überschrift</Label>
        <Input
          value={(data.heading as string) || ''}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          placeholder="Hero-Überschrift..."
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Unterüberschrift</Label>
        <Input
          value={(data.subheading as string) || ''}
          onChange={(e) => onChange({ ...data, subheading: e.target.value })}
          placeholder="Unterüberschrift..."
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Hintergrundbild-URL</Label>
        <Input
          value={(data.backgroundImage as string) || ''}
          onChange={(e) => onChange({ ...data, backgroundImage: e.target.value })}
          placeholder="https://..."
          className="mt-1 text-xs font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Button-Text (optional)</Label>
          <Input
            value={(data.ctaText as string) || ''}
            onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
            placeholder="Mehr erfahren"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Button-URL (optional)</Label>
          <Input
            value={(data.ctaUrl as string) || ''}
            onChange={(e) => onChange({ ...data, ctaUrl: e.target.value })}
            placeholder="https://..."
            className="mt-1 text-xs font-mono"
          />
        </div>
      </div>
    </div>
  )
}

function QuoteBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Zitat</Label>
        <textarea
          value={(data.quote as string) || ''}
          onChange={(e) => onChange({ ...data, quote: e.target.value })}
          placeholder="Zitat eingeben..."
          className="mt-1 min-h-[80px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <Label className="text-xs">Autor (optional)</Label>
        <Input
          value={(data.author as string) || ''}
          onChange={(e) => onChange({ ...data, author: e.target.value })}
          placeholder="Name des Autors..."
          className="mt-1"
        />
      </div>
    </div>
  )
}

function DividerBlockEditor() {
  return (
    <div className="py-2">
      <hr className="border-t border-border" />
      <p className="mt-2 text-xs text-muted-foreground">Dieser Block zeigt eine horizontale Trennlinie an.</p>
    </div>
  )
}

function VideoBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Video-URL (YouTube oder Vimeo)</Label>
        <Input
          value={(data.url as string) || ''}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=... oder https://vimeo.com/..."
          className="mt-1 text-xs font-mono"
        />
      </div>
      <div>
        <Label className="text-xs">Bildunterschrift (optional)</Label>
        <Input
          value={(data.caption as string) || ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          placeholder="Video-Beschreibung..."
          className="mt-1"
        />
      </div>
    </div>
  )
}

function CtaBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Überschrift</Label>
        <Input
          value={(data.heading as string) || ''}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          placeholder="Handlungsaufruf-Überschrift..."
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Text</Label>
        <textarea
          value={(data.text as string) || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Beschreibungstext..."
          className="mt-1 min-h-[60px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Button-Text</Label>
          <Input
            value={(data.buttonText as string) || ''}
            onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
            placeholder="Jetzt starten"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Button-URL</Label>
          <Input
            value={(data.buttonUrl as string) || ''}
            onChange={(e) => onChange({ ...data, buttonUrl: e.target.value })}
            placeholder="https://..."
            className="mt-1 text-xs font-mono"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Hintergrund-Stil</Label>
        <Select
          value={(data.style as string) || 'light'}
          onValueChange={(value) => onChange({ ...data, style: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Hell</SelectItem>
            <SelectItem value="dark">Dunkel</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function ColumnsBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const left = (data.left as { heading: string; text: string }) || { heading: '', text: '' }
  const right = (data.right as { heading: string; text: string }) || { heading: '', text: '' }

  const updateColumn = (side: 'left' | 'right', field: string, value: string) => {
    const col = side === 'left' ? left : right
    onChange({ ...data, [side]: { ...col, [field]: value } })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label className="text-xs font-medium">Linke Spalte</Label>
        <Input
          value={left.heading}
          onChange={(e) => updateColumn('left', 'heading', e.target.value)}
          placeholder="Überschrift..."
          className="text-sm"
        />
        <textarea
          value={left.text}
          onChange={(e) => updateColumn('left', 'text', e.target.value)}
          placeholder="Text..."
          className="min-h-[60px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label className="text-xs font-medium">Rechte Spalte</Label>
        <Input
          value={right.heading}
          onChange={(e) => updateColumn('right', 'heading', e.target.value)}
          placeholder="Überschrift..."
          className="text-sm"
        />
        <textarea
          value={right.text}
          onChange={(e) => updateColumn('right', 'text', e.target.value)}
          placeholder="Text..."
          className="min-h-[60px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  )
}

function SpacerBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div>
      <Label className="text-xs">Abstandsgröße</Label>
      <Select
        value={(data.size as string) || 'medium'}
        onValueChange={(value) => onChange({ ...data, size: value })}
      >
        <SelectTrigger className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="small">Klein</SelectItem>
          <SelectItem value="medium">Mittel</SelectItem>
          <SelectItem value="large">Gross</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function AccordionBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const items = (data.items as Array<{ title: string; content: string }>) || []

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...data, items: updated })
  }

  const addItem = () => {
    onChange({ ...data, items: [...items, { title: '', content: '' }] })
  }

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Abschnitt {i + 1}</Label>
            {items.length > 1 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
          </div>
          <Input
            value={item.title}
            onChange={(e) => updateItem(i, 'title', e.target.value)}
            placeholder="Titel..."
            className="text-sm"
          />
          <textarea
            value={item.content}
            onChange={(e) => updateItem(i, 'content', e.target.value)}
            placeholder="Inhalt..."
            className="min-h-[60px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1 h-3 w-3" /> Abschnitt hinzufügen
      </Button>
    </div>
  )
}

function TableBlockEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const rows = (data.rows as string[][]) || [['', ''], ['', '']]

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const updated = rows.map((row) => [...row])
    updated[rowIndex][colIndex] = value
    onChange({ ...data, rows: updated })
  }

  const addRow = () => {
    const cols = rows[0]?.length || 2
    onChange({ ...data, rows: [...rows, Array(cols).fill('')] })
  }

  const removeRow = (index: number) => {
    if (rows.length <= 1) return
    onChange({ ...data, rows: rows.filter((_, i) => i !== index) })
  }

  const addColumn = () => {
    onChange({ ...data, rows: rows.map((row) => [...row, '']) })
  }

  const removeColumn = (colIndex: number) => {
    if ((rows[0]?.length || 0) <= 1) return
    onChange({ ...data, rows: rows.map((row) => row.filter((_, i) => i !== colIndex)) })
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder={ri === 0 ? `Spalte ${ci + 1}` : ''}
                      className={`text-xs ${ri === 0 ? 'font-medium' : ''}`}
                    />
                  </td>
                ))}
                <td className="p-1 w-8">
                  {rows.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(ri)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 h-3 w-3" /> Zeile
        </Button>
        <Button variant="outline" size="sm" onClick={addColumn}>
          <Plus className="mr-1 h-3 w-3" /> Spalte
        </Button>
        {(rows[0]?.length || 0) > 1 && (
          <Button variant="outline" size="sm" onClick={() => removeColumn((rows[0]?.length || 1) - 1)}>
            <Trash2 className="mr-1 h-3 w-3" /> Spalte entfernen
          </Button>
        )}
      </div>
    </div>
  )
}

function TaggedContentBlockEditor({ type, data, onChange }: { type: string; data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string }>>([])

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setTags(d) })
      .catch(() => {})
  }, [])

  const typeLabels: Record<string, string> = {
    'tagged-events': 'Termine',
    'tagged-downloads': 'Downloads',
    'tagged-posts': 'Beiträge',
  }

  const selectedTag = tags.find((t) => t.id === data.tagId)

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Zeigt {typeLabels[type] || 'Inhalte'} an, die mit einem bestimmten Tag versehen sind.
      </p>
      <div>
        <Label className="text-xs">Überschrift</Label>
        <Input
          value={(data.heading as string) || ''}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          placeholder={`z.B. ${typeLabels[type] || 'Inhalte'}`}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Tag auswählen</Label>
        {tags.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Noch keine Tags vorhanden. <a href="/cms/tags" className="text-primary underline">Tags erstellen</a>
          </p>
        ) : (
          <select
            value={(data.tagId as string) || ''}
            onChange={(e) => onChange({ ...data, tagId: e.target.value })}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Tag wählen —</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        )}
      </div>
      {type !== 'tagged-downloads' && (
        <div>
          <Label className="text-xs">Max. Anzahl</Label>
          <Input
            type="number"
            value={(data.limit as number) || 5}
            onChange={(e) => onChange({ ...data, limit: parseInt(e.target.value) || 5 })}
            min={1}
            max={20}
            className="mt-1 w-24"
          />
        </div>
      )}
      {selectedTag && (
        <p className="text-xs text-muted-foreground">
          Gewählter Tag: <strong>{selectedTag.name}</strong>
        </p>
      )}
    </div>
  )
}

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
        <div className="mb-12">
          {heading && <h2 className="font-display text-2xl md:text-3xl tracking-tight text-foreground mb-4">{heading}</h2>}
          {text && <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{text}</p>}
        </div>
      )
    }
    case 'cards': {
      const cards = (block.data.cards as Array<{ title: string; text: string }>) || []
      return (
        <div className={`mb-12 grid gap-6 ${cards.length <= 2 ? 'sm:grid-cols-2' : cards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {cards.map((card, i) => (
            <div key={i} className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
              <h3 className="font-display text-xl text-foreground">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      )
    }
    case 'faq': {
      const items = (block.data.items as Array<{ question: string; answer: string }>) || []
      return (
        <div className="mb-12 space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm">
              <summary className="cursor-pointer px-6 py-5 font-display text-sm font-semibold text-card-foreground list-none flex items-center justify-between">
                {item.question}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
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
        <div className={`mb-12 grid gap-4 ${validImages.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {validImages.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border/60">
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
        <div className="mb-12">
          {heading && <h3 className="font-display text-xl font-semibold mb-4">{heading}</h3>}
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
            <ul className="space-y-3">
              {items.filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
    case 'hero': {
      const heading = block.data.heading as string
      const subheading = block.data.subheading as string
      const backgroundImage = block.data.backgroundImage as string
      const ctaText = block.data.ctaText as string
      const ctaUrl = block.data.ctaUrl as string
      return (
        <div
          className="mb-12 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm relative overflow-hidden"
          style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {backgroundImage && <div className="absolute inset-0 bg-black/50" />}
          <div className={`relative px-8 py-20 text-center ${backgroundImage ? 'text-white' : ''}`}>
            {heading && <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-4">{heading}</h2>}
            {subheading && <p className={`text-base leading-relaxed max-w-xl mx-auto ${backgroundImage ? 'text-white/80' : 'text-muted-foreground'}`}>{subheading}</p>}
            {ctaText && ctaUrl && (
              <a href={ctaUrl} className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-8 py-4 text-xs font-medium uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-white">
                {ctaText}
              </a>
            )}
          </div>
        </div>
      )
    }
    case 'quote': {
      const quote = block.data.quote as string
      const author = block.data.author as string
      return (
        <div className="mb-12">
          <blockquote className="border-l-2 border-primary/40 pl-6 py-2">
            <p className="font-display text-xl italic text-foreground/80 leading-relaxed">&ldquo;{quote}&rdquo;</p>
            {author && <footer className="mt-3 font-sub text-xs uppercase tracking-[0.15em] text-muted-foreground">&mdash; {author}</footer>}
          </blockquote>
        </div>
      )
    }
    case 'divider': {
      return (
        <div className="mb-12 flex items-center justify-center py-4">
          <div className="divider-line w-full" />
        </div>
      )
    }
    case 'video': {
      const url = block.data.url as string
      const caption = block.data.caption as string
      let embedUrl = url
      if (url) {
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
        if (ytMatch) {
          embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`
        } else {
          const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
          if (vimeoMatch) {
            embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`
          }
        }
      }
      return (
        <div className="mb-12">
          {embedUrl && (
            <div className="overflow-hidden rounded-2xl border border-border/60">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={caption || 'Video'}
                />
              </div>
            </div>
          )}
          {caption && <p className="mt-3 text-center text-sm text-muted-foreground">{caption}</p>}
        </div>
      )
    }
    case 'cta': {
      const heading = block.data.heading as string
      const text = block.data.text as string
      const buttonText = block.data.buttonText as string
      const buttonUrl = block.data.buttonUrl as string
      const style = (block.data.style as string) || 'light'
      return (
        <div className={`mb-12 rounded-2xl border px-8 py-16 text-center ${style === 'dark' ? 'border-border/60 bg-foreground text-background' : 'border-border/60 bg-card/80 backdrop-blur-sm text-card-foreground'}`}>
          {heading && <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-4">{heading}</h2>}
          {text && <p className={`text-sm leading-relaxed mb-8 max-w-xl mx-auto ${style === 'dark' ? 'text-background/70' : 'text-muted-foreground'}`}>{text}</p>}
          {buttonText && buttonUrl && (
            <a href={buttonUrl} className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-8 py-4 text-xs font-medium uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary hover:text-white">
              {buttonText}
            </a>
          )}
        </div>
      )
    }
    case 'columns': {
      const left = (block.data.left as { heading: string; text: string }) || { heading: '', text: '' }
      const right = (block.data.right as { heading: string; text: string }) || { heading: '', text: '' }
      return (
        <div className="mb-12 grid gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
            {left.heading && <h3 className="font-display text-xl text-foreground mb-3">{left.heading}</h3>}
            {left.text && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{left.text}</p>}
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8">
            {right.heading && <h3 className="font-display text-xl text-foreground mb-3">{right.heading}</h3>}
            {right.text && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{right.text}</p>}
          </div>
        </div>
      )
    }
    case 'spacer': {
      const size = (block.data.size as string) || 'medium'
      const paddingClass = size === 'small' ? 'py-6' : size === 'large' ? 'py-20' : 'py-12'
      return <div className={paddingClass} />
    }
    case 'accordion': {
      const items = (block.data.items as Array<{ title: string; content: string }>) || []
      return (
        <div className="mb-12 space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm">
              <summary className="cursor-pointer px-6 py-5 font-display text-sm font-semibold text-card-foreground list-none flex items-center justify-between">
                {item.title}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {item.content}
              </div>
            </details>
          ))}
        </div>
      )
    }
    case 'table': {
      const rows = (block.data.rows as string[][]) || []
      if (rows.length === 0) return null
      return (
        <div className="mb-12 overflow-x-auto">
          <table className="w-full rounded-2xl border border-border/60 text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-primary/5">
                {rows[0]?.map((cell, ci) => (
                  <th key={ci} className="px-5 py-4 text-left font-display font-semibold text-foreground">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b border-border/60 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-5 py-4 text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    default:
      return null
  }
}
