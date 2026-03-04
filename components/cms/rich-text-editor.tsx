"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon, ImageIcon, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useState, useCallback, useEffect } from 'react'
import TurndownService from 'turndown'
import { marked } from 'marked'
import { ImagePicker } from './image-picker'

// Initialize markdown parsers
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
})

// Configure marked to not sanitize, we want raw HTML for the editor
marked.setOptions({
  gfm: true,
  breaks: true,
})

interface RichTextEditorProps {
  markdown: string
  onChange: (markdown: string) => void
  placeholder?: string
}

export function RichTextEditor({ markdown, onChange, placeholder = "Inhalt hier eingeben..." }: RichTextEditorProps) {
  const [isReady, setIsReady] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'my-4 rounded-lg max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline font-medium',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: '', // Will be set after mount to prevent hydration mismatch
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[500px] w-full focus:outline-none p-4 font-mono sm:font-sans bg-background',
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      // Convert HTML back to Markdown
      const html = editor.getHTML()
      let md = turndownService.turndown(html)
      // Fix TipTap image wrapping if needed or just let turndown handle it
      onChange(md)
    },
  })

  // Convert incoming markdown to HTML and set it ONCE on mount
  useEffect(() => {
    if (editor && !isReady) {
      const html = marked.parse(markdown)
      editor.commands.setContent(html as string)
      setIsReady(true)
    }
  }, [editor, markdown, isReady])

  if (!editor) {
    return null
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden flex flex-col">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor!} />
      </div>
    </div>
  )
}

function MenuBar({ editor }: { editor: Editor | null }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  const toggleLink = useCallback(() => {
    if (editor?.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else if (editor) {
      const previousUrl = editor.getAttributes('link').href
      setLinkUrl(previousUrl || '')
      setIsLinkPopoverOpen(true)
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setIsLinkPopoverOpen(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const addImage = useCallback((url: string | null) => {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
      <div className="flex gap-1 border-r pr-2 mr-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Überschrift 1"
          title="Überschrift 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Überschrift 2"
          title="Überschrift 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Überschrift 3"
          title="Überschrift 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="flex gap-1 border-r pr-2 mr-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Fett"
          title="Fett"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Kursiv"
          title="Kursiv"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Durchgestrichen"
          title="Durchgestrichen"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="flex gap-1 border-r pr-2 mr-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Aufzählung"
          title="Aufzählung"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Nummerierte Liste"
          title="Nummerierte Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Zitat"
          title="Zitat"
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          aria-label="Trennlinie"
          title="Trennlinie"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('link')}
              onPressedChange={toggleLink}
              aria-label="Link einfügen"
              title="Link einfügen"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setLink()
                  }
                }}
                className="text-sm h-9"
                autoFocus
              />
              <Button size="icon" className="h-9 w-9 shrink-0" onClick={setLink}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Hidden trigger for ImagePicker */}
        <div className="hidden">
           <ImagePicker
            value={null}
            onChange={(url) => {
              addImage(url);
            }}
           />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={(e) => {
            const btn = e.currentTarget.previousElementSibling?.querySelector('button') as HTMLButtonElement | null;
            if (btn) btn.click();
          }}
          aria-label="Bild einfügen"
          title="Bild einfügen"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
