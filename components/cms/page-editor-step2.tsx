"use client"

import { usePageWizard } from "./page-wizard-context"
import { Button } from "@/components/ui/button"
import { BlockEditor, renderBlocks, type ContentBlock } from "./block-editor"
import { MarkdownContent } from "@/components/markdown-content"
import { RichTextEditor } from "./rich-text-editor"
import { ArrowLeft, ArrowRight, Blocks, FileText, Eye } from "lucide-react"

// ============================================================================
// Step 2 — Content Editor
// ============================================================================

export function PageEditorStep2() {
  const { state, dispatch } = usePageWizard()

  const hasContent =
    state.contentMode === "blocks"
      ? state.blocks.length > 0
      : state.markdownContent.trim().length > 0

  const handleBack = () => {
    dispatch({ type: "SET_STEP", payload: 1 })
  }

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 3 })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 w-fit">
        <span className="text-sm text-muted-foreground mr-1">Modus:</span>
        <Button
          variant={state.contentMode === "blocks" ? "default" : "outline"}
          size="sm"
          onClick={() => dispatch({ type: "SET_CONTENT_MODE", payload: "blocks" })}
          className="gap-1.5"
        >
          <Blocks className="h-3.5 w-3.5" />
          Bausteine
        </Button>
        <Button
          variant={state.contentMode === "markdown" ? "default" : "outline"}
          size="sm"
          onClick={() => dispatch({ type: "SET_CONTENT_MODE", payload: "markdown" })}
          className="gap-1.5"
        >
          <FileText className="h-3.5 w-3.5" />
          Texteditor
        </Button>
      </div>

      {/* Content Area */}
      {state.contentMode === "blocks" ? (
        <BlocksEditor />
      ) : (
        <RichTextEditor
          content={state.markdownContent}
          onChange={(md) => dispatch({ type: "SET_MARKDOWN", payload: md })}
          placeholder="Beginnen Sie hier den Seiteninhalt zu schreiben…"
        />
      )}

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
// Blocks Editor Sub-Component
// ============================================================================

function BlocksEditor() {
  const { state, dispatch } = usePageWizard()

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <div>
        <h3 className="font-display font-semibold">Seiteninhalt</h3>
        <p className="text-xs text-muted-foreground">
          Fügen Sie Bausteine hinzu und bearbeiten Sie den Inhalt der Seite.
        </p>
      </div>
      <BlockEditor
        blocks={state.blocks}
        onChange={(blocks: ContentBlock[]) => dispatch({ type: "SET_BLOCKS", payload: blocks })}
      />
    </div>
  )
}
