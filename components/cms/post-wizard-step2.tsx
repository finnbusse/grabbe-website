"use client"

import { useState } from "react"
import { usePostWizard } from "./post-wizard-context"
import { Button } from "@/components/ui/button"
import { BlockEditor, type ContentBlock } from "./block-editor"
import { RichTextEditor } from "./rich-text-editor"
import { MarkdownContent } from "@/components/markdown-content"
import { ArrowLeft, ArrowRight, Blocks, Type } from "lucide-react"

// ============================================================================
// Step 2 — Content Editor
// ============================================================================

export function PostWizardStep2() {
  const { state, dispatch } = usePostWizard()

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
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      {/* Mode Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Content Mode Toggle */}
        <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
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
            <Type className="h-3.5 w-3.5" />
            Fließtext
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {state.contentMode === "blocks" ? (
        <BlocksEditor />
      ) : (
        <RichTextEditorWrapper />
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
  const { state, dispatch } = usePostWizard()

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <div>
        <h3 className="font-display font-semibold">Beitragsinhalt</h3>
        <p className="text-xs text-muted-foreground">
          Fügen Sie Bausteine hinzu und bearbeiten Sie den Inhalt des Beitrags.
        </p>
      </div>
      <BlockEditor
        blocks={state.blocks}
        onChange={(blocks: ContentBlock[]) => dispatch({ type: "SET_BLOCKS", payload: blocks })}
      />
    </div>
  )
}

// ============================================================================
// Rich Text Editor Sub-Component
// ============================================================================

function RichTextEditorWrapper() {
  const { state, dispatch } = usePostWizard()

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h3 className="font-display font-semibold">Beitragsinhalt</h3>
        <p className="text-xs text-muted-foreground">
          Verfassen Sie Ihren Beitrag. Sie können Text formatieren, Bilder einfügen und Links setzen.
        </p>
      </div>
      <RichTextEditor
        markdown={state.markdownContent}
        onChange={(markdown) => dispatch({ type: "SET_MARKDOWN", payload: markdown })}
      />
    </div>
  )
}
