"use client"

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react"
import type { ContentBlock } from "./block-editor"

// ============================================================================
// Types
// ============================================================================

export interface PageWizardState {
  // Step 1
  title: string
  slug: string
  heroImageUrl: string | null
  heroSubtitle: string
  tagIds: string[]
  routePath: string

  // Step 2
  contentMode: "blocks" | "markdown"
  blocks: ContentBlock[]
  markdownContent: string

  // Step 3
  metaDescription: string
  seoTitle: string
  ogImageUrl: string | null

  // Meta
  currentStep: 1 | 2 | 3
  isSaving: boolean
  savedPageId: string | null
  lastAutoSaved: string | null
  pageId: string | null
  isPublished: boolean
  section: string
  sortOrder: number
}

export type WizardAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_SLUG"; payload: string }
  | { type: "SET_HERO_IMAGE"; payload: string | null }
  | { type: "SET_HERO_SUBTITLE"; payload: string }
  | { type: "SET_TAG_IDS"; payload: string[] }
  | { type: "SET_ROUTE_PATH"; payload: string }
  | { type: "SET_CONTENT_MODE"; payload: "blocks" | "markdown" }
  | { type: "SET_BLOCKS"; payload: ContentBlock[] }
  | { type: "SET_MARKDOWN"; payload: string }
  | { type: "SET_META_DESCRIPTION"; payload: string }
  | { type: "SET_SEO_TITLE"; payload: string }
  | { type: "SET_OG_IMAGE"; payload: string | null }
  | { type: "SET_STEP"; payload: 1 | 2 | 3 }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_SAVED_PAGE_ID"; payload: string | null }
  | { type: "SET_LAST_AUTO_SAVED"; payload: string | null }
  | { type: "SET_PAGE_ID"; payload: string | null }
  | { type: "SET_IS_PUBLISHED"; payload: boolean }
  | { type: "SET_SECTION"; payload: string }
  | { type: "SET_SORT_ORDER"; payload: number }
  | { type: "RESTORE_STATE"; payload: Partial<PageWizardState> }

// ============================================================================
// Initial state
// ============================================================================

const initialState: PageWizardState = {
  title: "",
  slug: "",
  heroImageUrl: null,
  heroSubtitle: "",
  tagIds: [],
  routePath: "",
  contentMode: "blocks",
  blocks: [],
  markdownContent: "",
  metaDescription: "",
  seoTitle: "",
  ogImageUrl: null,
  currentStep: 1,
  isSaving: false,
  savedPageId: null,
  lastAutoSaved: null,
  pageId: null,
  isPublished: false,
  section: "allgemein",
  sortOrder: 0,
}

// ============================================================================
// Reducer
// ============================================================================

function wizardReducer(state: PageWizardState, action: WizardAction): PageWizardState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload }
    case "SET_SLUG":
      return { ...state, slug: action.payload }
    case "SET_HERO_IMAGE":
      return { ...state, heroImageUrl: action.payload }
    case "SET_HERO_SUBTITLE":
      return { ...state, heroSubtitle: action.payload }
    case "SET_TAG_IDS":
      return { ...state, tagIds: action.payload }
    case "SET_ROUTE_PATH":
      return { ...state, routePath: action.payload }
    case "SET_CONTENT_MODE":
      return { ...state, contentMode: action.payload }
    case "SET_BLOCKS":
      return { ...state, blocks: action.payload }
    case "SET_MARKDOWN":
      return { ...state, markdownContent: action.payload }
    case "SET_META_DESCRIPTION":
      return { ...state, metaDescription: action.payload }
    case "SET_SEO_TITLE":
      return { ...state, seoTitle: action.payload }
    case "SET_OG_IMAGE":
      return { ...state, ogImageUrl: action.payload }
    case "SET_STEP":
      return { ...state, currentStep: action.payload }
    case "SET_SAVING":
      return { ...state, isSaving: action.payload }
    case "SET_SAVED_PAGE_ID":
      return { ...state, savedPageId: action.payload }
    case "SET_LAST_AUTO_SAVED":
      return { ...state, lastAutoSaved: action.payload }
    case "SET_PAGE_ID":
      return { ...state, pageId: action.payload }
    case "SET_IS_PUBLISHED":
      return { ...state, isPublished: action.payload }
    case "SET_SECTION":
      return { ...state, section: action.payload }
    case "SET_SORT_ORDER":
      return { ...state, sortOrder: action.payload }
    case "RESTORE_STATE":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

// ============================================================================
// Context
// ============================================================================

interface PageWizardContextValue {
  state: PageWizardState
  dispatch: React.Dispatch<WizardAction>
}

const PageWizardContext = createContext<PageWizardContextValue | null>(null)

const STORAGE_KEY = "page-wizard-draft"

interface PageWizardProviderProps {
  children: ReactNode
  initialState?: Partial<PageWizardState>
}

export function PageWizardProvider({ children, initialState: initialOverrides }: PageWizardProviderProps) {
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
        dispatch({ type: "RESTORE_STATE", payload: { ...parsed, isSaving: false, currentStep: parsed.currentStep || 1 } })
      }
    } catch {
      // ignore parse errors
    }
  }, [initialOverrides])

  // Auto-save to localStorage every 30s (only for new, unpublished pages)
  useEffect(() => {
    if (initialOverrides) return // skip auto-save in edit mode
    const interval = setInterval(() => {
      if (!state.isPublished && (state.title || state.markdownContent || state.blocks.length > 0)) {
        try {
          const toSave = { ...state, isSaving: false, savedPageId: null }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
          dispatch({ type: "SET_LAST_AUTO_SAVED", payload: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) })
        } catch {
          // storage full or unavailable
        }
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [state, initialOverrides])

  return (
    <PageWizardContext.Provider value={{ state, dispatch }}>
      {children}
    </PageWizardContext.Provider>
  )
}

export function usePageWizard() {
  const ctx = useContext(PageWizardContext)
  if (!ctx) throw new Error("usePageWizard must be used within PageWizardProvider")
  return ctx
}

export function clearWizardStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function buildFullUrl(routePath: string, slug: string): string {
  if (routePath) return `grabbe.site${routePath}/${slug || "..."}`
  if (slug) return `grabbe.site/seiten/${slug}`
  return "grabbe.site/..."
}
