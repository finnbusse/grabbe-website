"use client"

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react"
import type { ContentBlock } from "./block-editor"

// ============================================================================
// Types
// ============================================================================

export interface PostWizardState {
  // Step 1
  title: string
  slug: string
  category: string
  excerpt: string
  coverImageUrl: string | null
  publishDate: string
  tagIds: string[]

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
  isPublished: boolean
  postId: string | null
  lastAutoSaved: string | null
}

export type PostWizardAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_SLUG"; payload: string }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_EXCERPT"; payload: string }
  | { type: "SET_COVER_IMAGE"; payload: string | null }
  | { type: "SET_PUBLISH_DATE"; payload: string }
  | { type: "SET_TAG_IDS"; payload: string[] }
  | { type: "SET_CONTENT_MODE"; payload: "blocks" | "markdown" }
  | { type: "SET_BLOCKS"; payload: ContentBlock[] }
  | { type: "SET_MARKDOWN"; payload: string }
  | { type: "SET_META_DESCRIPTION"; payload: string }
  | { type: "SET_SEO_TITLE"; payload: string }
  | { type: "SET_OG_IMAGE"; payload: string | null }
  | { type: "SET_STEP"; payload: 1 | 2 | 3 }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_IS_PUBLISHED"; payload: boolean }
  | { type: "SET_POST_ID"; payload: string | null }
  | { type: "SET_LAST_AUTO_SAVED"; payload: string | null }
  | { type: "RESTORE_STATE"; payload: Partial<PostWizardState> }

// ============================================================================
// Initial state
// ============================================================================

const initialState: PostWizardState = {
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  coverImageUrl: null,
  publishDate: new Date().toISOString().split("T")[0],
  tagIds: [],
  contentMode: "blocks",
  blocks: [],
  markdownContent: "",
  metaDescription: "",
  seoTitle: "",
  ogImageUrl: null,
  currentStep: 1,
  isSaving: false,
  isPublished: false,
  postId: null,
  lastAutoSaved: null,
}

// ============================================================================
// Reducer
// ============================================================================

function wizardReducer(state: PostWizardState, action: PostWizardAction): PostWizardState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload }
    case "SET_SLUG":
      return { ...state, slug: action.payload }
    case "SET_CATEGORY":
      return { ...state, category: action.payload }
    case "SET_EXCERPT":
      return { ...state, excerpt: action.payload }
    case "SET_COVER_IMAGE":
      return { ...state, coverImageUrl: action.payload }
    case "SET_PUBLISH_DATE":
      return { ...state, publishDate: action.payload }
    case "SET_TAG_IDS":
      return { ...state, tagIds: action.payload }
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
    case "SET_IS_PUBLISHED":
      return { ...state, isPublished: action.payload }
    case "SET_POST_ID":
      return { ...state, postId: action.payload }
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

interface PostWizardContextValue {
  state: PostWizardState
  dispatch: React.Dispatch<PostWizardAction>
}

const PostWizardContext = createContext<PostWizardContextValue | null>(null)

const STORAGE_KEY = "cms-post-wizard-draft"

interface PostWizardProviderProps {
  children: ReactNode
  initialState?: Partial<PostWizardState>
}

export function PostWizardProvider({ children, initialState: initialOverrides }: PostWizardProviderProps) {
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

  // Auto-save to localStorage every 30s (only for new posts)
  useEffect(() => {
    if (initialOverrides) return // skip auto-save in edit mode
    const interval = setInterval(() => {
      if (state.title || state.markdownContent || state.blocks.length > 0) {
        try {
          const toSave = { ...state, isSaving: false, postId: null }
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
    <PostWizardContext.Provider value={{ state, dispatch }}>
      {children}
    </PostWizardContext.Provider>
  )
}

export function usePostWizard() {
  const ctx = useContext(PostWizardContext)
  if (!ctx) throw new Error("usePostWizard must be used within PostWizardProvider")
  return ctx
}

export function clearPostWizardStorage() {
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
