"use client"

import { useParentLetterWizard } from "./parent-letter-wizard-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePicker } from "./image-picker"
import { ArrowRight } from "lucide-react"

// ============================================================================
// Step 1 — Grunddaten
// ============================================================================

export function ParentLetterWizardStep1() {
  const { state, dispatch } = useParentLetterWizard()

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 2 })
  }

  const canProceed = state.title.trim().length > 0

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      {/* Bezeichnung */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="letter-title" className="text-base font-semibold">
            Bezeichnung *
          </Label>
          <Input
            id="letter-title"
            value={state.title}
            onChange={(e) => dispatch({ type: "SET_TITLE", payload: e.target.value })}
            placeholder="z.B. Januar 2026, Winter 26"
            className="font-display text-xl h-14 px-4"
            autoFocus
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Vorschau: {state.letterNumber ?? "X"}. Elterninfobrief – {state.title || "…"}
        </p>
      </div>

      {/* Date Range */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label className="text-base font-semibold">Zeitraum (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Termine und News in diesem Zeitraum werden automatisch am Ende des veröffentlichten Briefs angezeigt.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="letter-date-from" className="text-sm text-muted-foreground">
              von
            </Label>
            <Input
              id="letter-date-from"
              type="date"
              value={state.dateFrom}
              onChange={(e) => dispatch({ type: "SET_DATE_FROM", payload: e.target.value })}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="letter-date-to" className="text-sm text-muted-foreground">
              bis
            </Label>
            <Input
              id="letter-date-to"
              type="date"
              value={state.dateTo}
              onChange={(e) => dispatch({ type: "SET_DATE_TO", payload: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label className="text-base font-semibold">Titelbild (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Wird als Bild im Elterninfobrief angezeigt.
        </p>
        <ImagePicker
          value={state.coverImageUrl}
          onChange={(url) => dispatch({ type: "SET_COVER_IMAGE", payload: url })}
          aspectRatio="16/9"
        />
      </div>

      {/* Auto-save indicator */}
      {state.lastAutoSaved && (
        <p className="text-center text-xs text-muted-foreground">
          Automatisch gespeichert um {state.lastAutoSaved}
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed} size="lg" className="gap-2">
          Weiter
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
