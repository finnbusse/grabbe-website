"use client"

import { usePostWizard } from "./post-wizard-context"
import { PostWizardStep1 } from "./post-wizard-step1"
import { PostWizardStep2 } from "./post-wizard-step2"
import { PostWizardStep3 } from "./post-wizard-step3"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// ============================================================================
// Progress Steps Data
// ============================================================================

const STEPS = [
  { number: 1, label: "Grunddaten" },
  { number: 2, label: "Inhalt" },
  { number: 3, label: "Veröffentlichen" },
] as const

// ============================================================================
// Main Wizard Component
// ============================================================================

interface PostWizardProps {
  editMode?: boolean
}

export function PostWizard({ editMode }: PostWizardProps) {
  const { state } = usePostWizard()

  return (
    <div className="-mx-4 -mt-6 -mb-6 sm:-mx-6 lg:-mx-6 lg:-mt-8 lg:-mb-8 flex flex-col h-[calc(100svh-65px)] lg:h-svh overflow-hidden bg-muted">
      {/* Fixed Header */}
      <div className="shrink-0 border-b border-border bg-muted px-4 sm:px-6 lg:px-6 pt-4 lg:pt-6 pb-4">
        <div className="mx-auto max-w-5xl flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cms/posts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-bold">
            {editMode ? "Beitrag bearbeiten" : "Neuen Beitrag erstellen"}
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="mx-auto max-w-5xl flex items-center justify-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex items-center">
              {i > 0 && (
                <div
                  className={`mx-2 h-px w-8 sm:w-12 ${
                    state.currentStep > step.number - 1
                      ? "bg-primary"
                      : "bg-border"
                  }`}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    state.currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : state.currentStep > step.number
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`hidden text-sm sm:inline ${
                    state.currentStep === step.number
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-6 py-6">
          {state.currentStep === 1 && <PostWizardStep1 />}
          {state.currentStep === 2 && <PostWizardStep2 />}
          {state.currentStep === 3 && <PostWizardStep3 />}
        </div>
      </div>
    </div>
  )
}
