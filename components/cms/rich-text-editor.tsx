"use client"

import { useCallback, useRef, useState } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { Markdown } from "tiptap-markdown"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Undo2,
  Redo2,
  Pilcrow,
  Eye,
  Edit3,
} from "lucide-react"
import { ImagePicker } from "./image-picker"

// ============================================================================
// Types
// ============================================================================

interface RichTextEditorProps {
  /** Current markdown content */
  content: string
  /** Called whenever the content changes */
  onChange: (markdown: string) => void
  /** Placeholder text */
  placeholder?: string
}

// ============================================================================
// Rich Text Editor Component
// ============================================================================

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit")
  const [showImagePicker, setShowImagePicker] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "rich-text-image",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Beginnen Sie hier zu schreiben…",
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
      },
    },
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown()
      onChangeRef.current(md)
    },
  })

  const handleImageSelected = useCallback(
    (url: string | null) => {
      if (url && editor) {
        editor.chain().focus().setImage({ src: url, alt: "Bild" }).run()
      }
      setShowImagePicker(false)
    },
    [editor],
  )

  if (!editor) {
    return (
      <div className="flex items-center justify-center rounded-2xl border bg-card p-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* View Toggle */}
      <div className="flex items-center justify-end mb-3">
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveView("edit")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeView === "edit"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Bearbeiten
          </button>
          <button
            type="button"
            onClick={() => setActiveView("preview")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeView === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Vorschau
          </button>
        </div>
      </div>

      {activeView === "preview" ? (
        <RichTextPreview editor={editor} />
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          {/* Toolbar */}
          <EditorToolbar editor={editor} onImageClick={() => setShowImagePicker(true)} />

          {/* Editor Area */}
          <div className="rich-text-editor-wrapper">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {/* Image Picker Dialog */}
      {showImagePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bild einfügen</h3>
              <button
                type="button"
                onClick={() => setShowImagePicker(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <ImagePicker
              value={null}
              onChange={handleImageSelected}
              label="Bild auswählen"
              hint="Wählen Sie ein Bild aus oder laden Sie eines hoch."
            />
          </div>
        </div>
      )}

      {/* Editor Styles */}
      <style jsx global>{`
        .rich-text-editor-wrapper {
          min-height: 500px;
        }

        .rich-text-editor-wrapper .tiptap {
          min-height: 500px;
          padding: 1.5rem 2rem;
          outline: none;
          font-size: 1rem;
          line-height: 1.75;
          color: hsl(var(--foreground));
        }

        .rich-text-editor-wrapper .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
          opacity: 0.5;
        }

        .rich-text-editor-wrapper .tiptap > * + * {
          margin-top: 0.75em;
        }

        .rich-text-editor-wrapper .tiptap h1 {
          font-family: var(--font-display), serif;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--foreground));
        }

        .rich-text-editor-wrapper .tiptap h2 {
          font-family: var(--font-display), serif;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .rich-text-editor-wrapper .tiptap h3 {
          font-family: var(--font-display), serif;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .rich-text-editor-wrapper .tiptap p {
          color: hsl(var(--muted-foreground));
          line-height: 1.75;
        }

        .rich-text-editor-wrapper .tiptap strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .rich-text-editor-wrapper .tiptap em {
          font-style: italic;
        }

        .rich-text-editor-wrapper .tiptap blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }

        .rich-text-editor-wrapper .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }

        .rich-text-editor-wrapper .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }

        .rich-text-editor-wrapper .tiptap li {
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.25rem;
        }

        .rich-text-editor-wrapper .tiptap li p {
          margin: 0;
        }

        .rich-text-editor-wrapper .tiptap hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 2rem 0;
        }

        .rich-text-editor-wrapper .tiptap img.rich-text-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }

        .rich-text-editor-wrapper .tiptap code {
          background: hsl(var(--muted));
          border-radius: 0.25rem;
          padding: 0.15rem 0.4rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
        }

        .rich-text-editor-wrapper .tiptap pre {
          background: hsl(var(--muted));
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          overflow-x: auto;
        }

        .rich-text-editor-wrapper .tiptap pre code {
          background: transparent;
          padding: 0;
        }

        /* Preview styles */
        .rich-text-preview h1 {
          font-family: var(--font-display), serif;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--foreground));
        }

        .rich-text-preview h2 {
          font-family: var(--font-display), serif;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .rich-text-preview h3 {
          font-family: var(--font-display), serif;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .rich-text-preview p {
          color: hsl(var(--muted-foreground));
          line-height: 1.75;
          margin-top: 0.75em;
        }

        .rich-text-preview strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .rich-text-preview em {
          font-style: italic;
        }

        .rich-text-preview blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin-left: 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }

        .rich-text-preview ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }

        .rich-text-preview ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }

        .rich-text-preview li {
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.25rem;
        }

        .rich-text-preview hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 2rem 0;
        }

        .rich-text-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }

        .rich-text-preview code {
          background: hsl(var(--muted));
          border-radius: 0.25rem;
          padding: 0.15rem 0.4rem;
          font-size: 0.875em;
        }

        .rich-text-preview pre {
          background: hsl(var(--muted));
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          overflow-x: auto;
        }

        .rich-text-preview pre code {
          background: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// Toolbar Component
// ============================================================================

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`flex items-center justify-center rounded-lg p-2 text-sm transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />
}

function EditorToolbar({
  editor,
  onImageClick,
}: {
  editor: Editor
  onImageClick: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-3 py-2">
      {/* Text Type Selector */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
        title="Normaler Text"
      >
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Überschrift"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Unterüberschrift"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Kleine Überschrift"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Inline Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Fett (Strg+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Kursiv (Strg+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block Elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Aufzählungsliste"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Nummerierte Liste"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Zitat"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Trennlinie"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Media */}
      <ToolbarButton onClick={onImageClick} title="Bild einfügen">
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Rückgängig (Strg+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Wiederholen (Strg+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

// ============================================================================
// Preview Component
// ============================================================================

function RichTextPreview({ editor }: { editor: Editor }) {
  const html = editor.getHTML()

  return (
    <div className="rounded-2xl border bg-card overflow-hidden animate-fade-in">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
        <Eye className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Vorschau</span>
      </div>
      <div className="p-8 rich-text-preview min-h-[500px]">
        {html && html !== "<p></p>" ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-muted-foreground italic text-sm">
            Die Vorschau erscheint hier, sobald Sie Text eingeben.
          </p>
        )}
      </div>
    </div>
  )
}
