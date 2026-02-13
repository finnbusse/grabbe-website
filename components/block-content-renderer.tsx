/**
 * Server-side block content renderer for user-created pages.
 * Renders block-based content that was created in the CMS block editor.
 */

import { ChevronDown } from "lucide-react"

interface ContentBlock {
  id: string
  type: string
  data: Record<string, unknown>
}

export function BlockContentRenderer({ content }: { content: string }) {
  let blocks: ContentBlock[] = []
  try {
    blocks = JSON.parse(content)
  } catch {
    return <p className="text-muted-foreground">Inhalt konnte nicht geladen werden.</p>
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null
  }

  return (
    <div>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  )
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
