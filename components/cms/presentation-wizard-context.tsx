"use client"

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react"
import type { PresentationBlock } from "@/lib/types/presentation-blocks"
import { generateSlug } from "./post-wizard-context"

// ============================================================================
// Types
// ============================================================================

export interface PresentationWizardState {
  // Step 1
  title: string
  slug: string
  subtitle: string
  coverImageUrl: string | null
  tagIds: string[]
  authorTeacherIds: string[]

  // Step 2
  blocks: PresentationBlock[]

  // Step 3
  showOnAktuelles: boolean
  metaDescription: string
  seoOgImage: string | null

  // Meta
  currentStep: 1 | 2 | 3
  isSaving: boolean
  isPublished: boolean
  presentationId: string | null
  lastAutoSaved: string | null
}

export type PresentationWizardAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_SLUG"; payload: string }
  | { type: "SET_SUBTITLE"; payload: string }
  | { type: "SET_COVER_IMAGE"; payload: string | null }
  | { type: "SET_TAG_IDS"; payload: string[] }
  | { type: "SET_AUTHOR_TEACHER_IDS"; payload: string[] }
  | { type: "SET_BLOCKS"; payload: PresentationBlock[] }
  | { type: "SET_SHOW_ON_AKTUELLES"; payload: boolean }
  | { type: "SET_META_DESCRIPTION"; payload: string }
  | { type: "SET_SEO_OG_IMAGE"; payload: string | null }
  | { type: "SET_STEP"; payload: 1 | 2 | 3 }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_IS_PUBLISHED"; payload: boolean }
  | { type: "SET_PRESENTATION_ID"; payload: string | null }
  | { type: "SET_LAST_AUTO_SAVED"; payload: string | null }
  | { type: "RESTORE_STATE"; payload: Partial<PresentationWizardState> }

// ============================================================================
// Initial state
// ============================================================================

const initialState: PresentationWizardState = {
  title: "",
  slug: "",
  subtitle: "",
  coverImageUrl: null,
  tagIds: [],
  authorTeacherIds: [],
  blocks: [],
  showOnAktuelles: true,
  metaDescription: "",
  seoOgImage: null,
  currentStep: 1,
  isSaving: false,
  isPublished: false,
  presentationId: null,
  lastAutoSaved: null,
}

// ============================================================================
// Reducer
// ============================================================================

function wizardReducer(state: PresentationWizardState, action: PresentationWizardAction): PresentationWizardState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload }
    case "SET_SLUG":
      return { ...state, slug: action.payload }
    case "SET_SUBTITLE":
      return { ...state, subtitle: action.payload }
    case "SET_COVER_IMAGE":
      return { ...state, coverImageUrl: action.payload }
    case "SET_TAG_IDS":
      return { ...state, tagIds: action.payload }
    case "SET_AUTHOR_TEACHER_IDS":
      return { ...state, authorTeacherIds: action.payload }
    case "SET_BLOCKS":
      return { ...state, blocks: action.payload }
    case "SET_SHOW_ON_AKTUELLES":
      return { ...state, showOnAktuelles: action.payload }
    case "SET_META_DESCRIPTION":
      return { ...state, metaDescription: action.payload }
    case "SET_SEO_OG_IMAGE":
      return { ...state, seoOgImage: action.payload }
    case "SET_STEP":
      return { ...state, currentStep: action.payload }
    case "SET_SAVING":
      return { ...state, isSaving: action.payload }
    case "SET_IS_PUBLISHED":
      return { ...state, isPublished: action.payload }
    case "SET_PRESENTATION_ID":
      return { ...state, presentationId: action.payload }
    case "SET_LAST_AUTO_SAVED":
      return { ...state, lastAutoSaved: action.payload }
    case "RESTORE_STATE":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

// ============================================================================
// Context
// ============================================================================

interface PresentationWizardContextValue {
  state: PresentationWizardState
  dispatch: React.Dispatch<PresentationWizardAction>
}

const PresentationWizardContext = createContext<PresentationWizardContextValue | null>(null)

const STORAGE_KEY = "cms-presentation-wizard-draft"

interface PresentationWizardProviderProps {
  children: ReactNode
  initialState?: Partial<PresentationWizardState>
}

export function PresentationWizardProvider({ children, initialState: initialOverrides }: PresentationWizardProviderProps) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const initialized = useRef(false)

  // Restore from props (edit mode) or localStorage on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (initialOverrides) {
      dispatch({ type: "RESTORE_STATE", payload: { ...initialOverrides, isSaving: false } })
      return
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({
          type: "RESTORE_STATE",
          payload: { ...parsed, isSaving: false, currentStep: parsed.currentStep || 1 },
        })
      }
    } catch {
      // ignore parse errors
    }
  }, [initialOverrides])

  // Auto-save to localStorage every 30s (only for new, unpublished presentations)
  useEffect(() => {
    if (initialOverrides) return
    const interval = setInterval(() => {
      if (!state.isPublished && (state.title || state.blocks.length > 0)) {
        try {
          const toSave = { ...state, isSaving: false, presentationId: null }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
          dispatch({
            type: "SET_LAST_AUTO_SAVED",
            payload: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
          })
        } catch {
          // storage full or unavailable
        }
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [state, initialOverrides])

  return (
    <PresentationWizardContext.Provider value={{ state, dispatch }}>
      {children}
    </PresentationWizardContext.Provider>
  )
}

export function usePresentationWizard() {
  const ctx = useContext(PresentationWizardContext)
  if (!ctx) throw new Error("usePresentationWizard must be used within PresentationWizardProvider")
  return ctx
}

export function clearPresentationWizardStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export { generateSlug }
