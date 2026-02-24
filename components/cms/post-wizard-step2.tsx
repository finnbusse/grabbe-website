"use client"

import { useState } from "react"
import { usePostWizard } from "./post-wizard-context"
import { Button } from "@/components/ui/button"
import { BlockEditor, type ContentBlock } from "./block-editor"
import { MarkdownContent } from "@/components/markdown-content"
import { ArrowLeft, ArrowRight, Blocks, FileText, Eye, Edit3, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"

// ============================================================================
// Step 2 — Content Editor
// ============================================================================

export function PostWizardStep2() {
  const { state, dispatch } = usePostWizard()
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [showCheatsheet, setShowCheatsheet] = useState(false)

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
      {/* Mode Toggle + Tab Switch */}
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
            <FileText className="h-3.5 w-3.5" />
            Markdown
          </Button>
        </div>

        {/* Edit/Preview Tab */}
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "edit"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Bearbeiten
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Vorschau
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "preview" ? (
        <PreviewPanel />
      ) : state.contentMode === "blocks" ? (
        <BlocksEditor />
      ) : (
        <MarkdownEditor
          showCheatsheet={showCheatsheet}
          onToggleCheatsheet={() => setShowCheatsheet(!showCheatsheet)}
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
// Markdown Editor Sub-Component
// ============================================================================

function MarkdownEditor({
  showCheatsheet,
  onToggleCheatsheet,
}: {
  showCheatsheet: boolean
  onToggleCheatsheet: () => void
}) {
  const { state, dispatch } = usePostWizard()
  const [viewMode, setViewMode] = useState<"split" | "editor">("split")

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "split" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("split")}
          >
            Split-Ansicht
          </Button>
          <Button
            variant={viewMode === "editor" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("editor")}
          >
            Nur Editor
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCheatsheet}
          className="gap-1.5 text-muted-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Hilfe
          {showCheatsheet ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* Cheatsheet */}
      {showCheatsheet && (
        <div className="rounded-xl border bg-muted/50 p-4 animate-fade-in">
          <h4 className="text-sm font-semibold mb-2">Markdown Kurzreferenz</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-mono">
            <span># Überschrift</span><span>→ Große Überschrift</span>
            <span>## Unterüberschrift</span><span>→ Mittlere Überschrift</span>
            <span>**fett**</span><span>→ <strong>fett</strong></span>
            <span>*kursiv*</span><span>→ <em>kursiv</em></span>
            <span>[Link](url)</span><span>→ Anklickbarer Link</span>
            <span>![Bild](url)</span><span>→ Eingebettetes Bild</span>
            <span>- Punkt</span><span>→ Aufzählungsliste</span>
            <span>---</span><span>→ Horizontale Linie</span>
          </div>
        </div>
      )}

      {/* Editor + Preview */}
      <div className={`rounded-2xl border bg-card overflow-hidden ${viewMode === "split" ? "grid grid-cols-2 divide-x" : ""}`}>
        {/* Editor Pane */}
        <div>
          <div className="border-b bg-muted/30 px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">Editor</span>
          </div>
          <textarea
            value={state.markdownContent}
            onChange={(e) => dispatch({ type: "SET_MARKDOWN", payload: e.target.value })}
            placeholder="Beitragsinhalt hier eingeben..."
            className="min-h-[500px] w-full resize-y bg-background px-4 py-3 text-sm leading-relaxed font-mono placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Preview Pane (split mode only) */}
        {viewMode === "split" && (
          <div>
            <div className="border-b bg-muted/30 px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground">Vorschau</span>
            </div>
            <div className="p-4 prose prose-sm max-w-none min-h-[500px]">
              {state.markdownContent ? (
                <MarkdownContent content={state.markdownContent} />
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  Die Vorschau erscheint hier, sobald Sie Text eingeben.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Preview Panel
// ============================================================================

function PreviewPanel() {
  const { state } = usePostWizard()

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Eye className="h-4 w-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Beitragsvorschau</h3>
      </div>

      <div className="prose prose-sm max-w-none">
        {/* Cover Image */}
        {state.coverImageUrl && (
          <div className="mb-6 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.coverImageUrl} alt="Cover" className="h-48 w-full object-cover" />
          </div>
        )}

        {/* Title */}
        {state.title && (
          <h1 className="font-display text-2xl font-bold mb-4">{state.title}</h1>
        )}

        {/* Content */}
        {state.contentMode === "blocks" && state.blocks.length > 0 ? (
          <p className="text-muted-foreground italic">
            {state.blocks.length} {state.blocks.length === 1 ? "Baustein" : "Bausteine"} — Vorschau im Block-Editor verfügbar.
          </p>
        ) : state.markdownContent ? (
          <MarkdownContent content={state.markdownContent} />
        ) : (
          <p className="text-muted-foreground italic">Noch kein Inhalt vorhanden.</p>
        )}
      </div>
    </div>
  )
}
