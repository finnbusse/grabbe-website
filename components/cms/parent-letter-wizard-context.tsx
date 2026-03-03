"use client"

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react"
import type { ContentBlock } from "./block-editor"
import { generateSlug } from "./post-wizard-context"

// ============================================================================
// Types
// ============================================================================

export interface ParentLetterWizardState {
  // Step 1
  title: string
  dateFrom: string
  dateTo: string
  coverImageUrl: string | null

  // Step 2
  blocks: ContentBlock[]

  // Meta
  currentStep: 1 | 2
  isSaving: boolean
  isPublished: boolean
  letterId: string | null
  letterNumber: number | null
  lastAutoSaved: string | null
}

export type ParentLetterWizardAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_DATE_FROM"; payload: string }
  | { type: "SET_DATE_TO"; payload: string }
  | { type: "SET_COVER_IMAGE"; payload: string | null }
  | { type: "SET_BLOCKS"; payload: ContentBlock[] }
  | { type: "SET_STEP"; payload: 1 | 2 }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_IS_PUBLISHED"; payload: boolean }
  | { type: "SET_LETTER_ID"; payload: string | null }
  | { type: "SET_LETTER_NUMBER"; payload: number | null }
  | { type: "SET_LAST_AUTO_SAVED"; payload: string | null }
  | { type: "RESTORE_STATE"; payload: Partial<ParentLetterWizardState> }

// ============================================================================
// Initial state
// ============================================================================

const initialState: ParentLetterWizardState = {
  title: "",
  dateFrom: "",
  dateTo: "",
  coverImageUrl: null,
  blocks: [],
  currentStep: 1,
  isSaving: false,
  isPublished: false,
  letterId: null,
  letterNumber: null,
  lastAutoSaved: null,
}

// ============================================================================
// Reducer
// ============================================================================

function wizardReducer(state: ParentLetterWizardState, action: ParentLetterWizardAction): ParentLetterWizardState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload }
    case "SET_DATE_FROM":
      return { ...state, dateFrom: action.payload }
    case "SET_DATE_TO":
      return { ...state, dateTo: action.payload }
    case "SET_COVER_IMAGE":
      return { ...state, coverImageUrl: action.payload }
    case "SET_BLOCKS":
      return { ...state, blocks: action.payload }
    case "SET_STEP":
      return { ...state, currentStep: action.payload }
    case "SET_SAVING":
      return { ...state, isSaving: action.payload }
    case "SET_IS_PUBLISHED":
      return { ...state, isPublished: action.payload }
    case "SET_LETTER_ID":
      return { ...state, letterId: action.payload }
    case "SET_LETTER_NUMBER":
      return { ...state, letterNumber: action.payload }
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

interface ParentLetterWizardContextValue {
  state: ParentLetterWizardState
  dispatch: React.Dispatch<ParentLetterWizardAction>
}

const ParentLetterWizardContext = createContext<ParentLetterWizardContextValue | null>(null)

const STORAGE_KEY = "cms-parent-letter-wizard-draft"

interface ParentLetterWizardProviderProps {
  children: ReactNode
  initialState?: Partial<ParentLetterWizardState>
}

export function ParentLetterWizardProvider({ children, initialState: initialOverrides }: ParentLetterWizardProviderProps) {
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

  // Auto-save to localStorage every 30s (only for new letters)
  useEffect(() => {
    if (initialOverrides) return // skip auto-save in edit mode
    const interval = setInterval(() => {
      if (state.title || state.blocks.length > 0) {
        try {
          const toSave = { ...state, isSaving: false, letterId: null }
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
    <ParentLetterWizardContext.Provider value={{ state, dispatch }}>
      {children}
    </ParentLetterWizardContext.Provider>
  )
}

export function useParentLetterWizard() {
  const ctx = useContext(ParentLetterWizardContext)
  if (!ctx) throw new Error("useParentLetterWizard must be used within ParentLetterWizardProvider")
  return ctx
}

export function clearParentLetterWizardStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function generateParentLetterSlug(number: number, title: string): string {
  const slugifiedTitle = generateSlug(title)
  return `elterninfobrief-${number}-${slugifiedTitle}`
}
