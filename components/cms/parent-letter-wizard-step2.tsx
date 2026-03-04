"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParentLetterWizard, clearParentLetterWizardStorage, generateParentLetterSlug } from "./parent-letter-wizard-context"
import { createClient } from "@/lib/supabase/client"
import { BlockEditor, type ContentBlock } from "./block-editor"
import { TeacherAuthorSelector } from "./teacher-author-selector"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save, Rocket, Check } from "lucide-react"
import { toast } from "sonner"

// ============================================================================
// Step 2 — Inhalt & Veröffentlichen
// ============================================================================

export function ParentLetterWizardStep2() {
  const { state, dispatch } = useParentLetterWizard()
  const router = useRouter()
  const [publishState, setPublishState] = useState<"idle" | "saving" | "success">("idle")
  const [error, setError] = useState<string | null>(null)
  const [authorTeacherIds, setAuthorTeacherIds] = useState<string[]>([])

  // Load existing author teachers when editing
  useEffect(() => {
    if (!state.letterId) return
    const supabase = createClient()
    supabase
      .from("parent_letter_authors")
      .select("teacher_id")
      .eq("parent_letter_id", state.letterId)
      .then(({ data }) => {
        if (data) setAuthorTeacherIds(data.map((a: { teacher_id: string }) => a.teacher_id))
      })
      .catch(() => {})
  }, [state.letterId])

  const handleBack = () => {
    dispatch({ type: "SET_STEP", payload: 1 })
  }

  const handleSave = async (publish: boolean) => {
    setPublishState("saving")
    dispatch({ type: "SET_SAVING", payload: true })
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const isUpdate = !!state.letterId
      let letterNumber = state.letterNumber
      let slug = ""

      // For new letters, determine the next number
      if (!isUpdate) {
        const { data: maxRow } = await supabase
          .from("parent_letters")
          .select("number")
          .order("number", { ascending: false })
          .limit(1)

        const rows = maxRow as Array<{ number: number }> | null
        letterNumber = rows && rows.length > 0 ? rows[0].number + 1 : 1
        slug = generateParentLetterSlug(letterNumber, state.title)
        dispatch({ type: "SET_LETTER_NUMBER", payload: letterNumber })
      }

      const payload: Record<string, unknown> = {
        title: state.title,
        content: state.blocks,
        status: publish ? "published" : "draft",
        date_from: state.dateFrom || null,
        date_to: state.dateTo || null,
        author_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (isUpdate) {
        const { error: saveError } = await supabase
          .from("parent_letters")
          .update(payload as never)
          .eq("id", state.letterId!)
        if (saveError) throw saveError

        // Save author teachers
        await supabase.from("parent_letter_authors").delete().eq("parent_letter_id", state.letterId!)
        if (authorTeacherIds.length > 0) {
          await supabase.from("parent_letter_authors").insert(
            authorTeacherIds.map((teacher_id) => ({ parent_letter_id: state.letterId!, teacher_id })) as never
          )
        }
      } else {
        const insertPayload = {
          ...payload,
          number: letterNumber,
          slug,
        }
        const { error: saveError } = await supabase
          .from("parent_letters")
          .insert(insertPayload as never)
        if (saveError) throw saveError

        // Get the created ID
        const { data: newLetters } = await supabase
          .from("parent_letters")
          .select("id")
          .eq("slug", slug)
          .order("created_at", { ascending: false })
          .limit(1)

        const letters = newLetters as Array<{ id: string }> | null
        if (letters && letters.length > 0) {
          dispatch({ type: "SET_LETTER_ID", payload: letters[0].id })

          // Save author teachers for new letter
          if (authorTeacherIds.length > 0) {
            await supabase.from("parent_letter_authors").insert(
              authorTeacherIds.map((teacher_id) => ({ parent_letter_id: letters[0].id, teacher_id })) as never
            )
          }
        }
      }

      // Revalidate (non-critical)
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "parent_letters" }),
        })
      } catch {
        // non-critical
      }

      clearParentLetterWizardStorage()

      if (publish) {
        setPublishState("success")
        dispatch({ type: "SET_IS_PUBLISHED", payload: true })
        setTimeout(() => {
          router.push("/cms/posts?tab=elterninfobriefe")
          router.refresh()
        }, 1500)
      } else {
        toast.success("Entwurf gespeichert!")
        router.push("/cms/posts?tab=elterninfobriefe")
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
      setPublishState("idle")
    } finally {
      dispatch({ type: "SET_SAVING", payload: false })
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Left Column — Block Editor */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div>
              <h3 className="font-display font-semibold">Inhalt des Elterninfobriefs</h3>
              <p className="text-xs text-muted-foreground">
                Fügen Sie Bausteine hinzu und bearbeiten Sie den Inhalt.
              </p>
            </div>
            <BlockEditor
              blocks={state.blocks}
              onChange={(blocks: ContentBlock[]) => dispatch({ type: "SET_BLOCKS", payload: blocks })}
            />
          </div>
        </div>

        {/* Right Column — Settings Panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            {/* Status */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              {state.isPublished ? (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  Veröffentlicht
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Entwurf
                </span>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Author Teachers */}
            <div className="grid gap-2 pt-2 border-t">
              <Label>Autor/innen (Lehrkräfte)</Label>
              <TeacherAuthorSelector
                selectedTeacherIds={authorTeacherIds}
                onChange={setAuthorTeacherIds}
              />
              <p className="text-[10px] text-muted-foreground">
                Tippen Sie @Kürzel ein, um Lehrkräfte als Autoren zuzuweisen.
              </p>
            </div>

            {/* Save as Draft */}
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={publishState !== "idle"}
              className="w-full gap-2"
            >
              <Save className="h-4 w-4" />
              Als Entwurf speichern
            </Button>

            {/* Publish */}
            {publishState === "success" ? (
              <Button size="lg" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-600 pointer-events-none">
                <Check className="h-5 w-5" />
                Veröffentlicht!
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => handleSave(true)}
                disabled={publishState === "saving"}
                className="w-full gap-2"
              >
                {publishState === "saving" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {publishState === "saving" ? "Wird veröffentlicht…" : "Jetzt veröffentlichen"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      {state.lastAutoSaved && (
        <p className="text-center text-xs text-muted-foreground">
          Automatisch gespeichert um {state.lastAutoSaved}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
      </div>
    </div>
  )
}
