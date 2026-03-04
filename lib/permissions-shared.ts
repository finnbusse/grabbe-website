/**
 * Role-Based Access Control (RBAC) — Shared types, constants, and pure functions.
 *
 * This module is safe for both client and server components.
 * Server-only functions (DB queries, redirects) live in lib/permissions.ts.
 */

// ============================================================================
// Permission Types
// ============================================================================

export interface ContentPermission {
  create: boolean
  edit: "own" | "all" | false
  delete: "own" | "all" | false
  publish: boolean
}

export interface DocumentPermission {
  upload: boolean
  delete: "own" | "all" | false
}

export interface SettingsPermission {
  basic: boolean
  advanced: boolean
  seo: boolean
}

export interface UserPermission {
  view: boolean
  create: boolean
  delete: boolean
  assignRoles: boolean
}

export interface RolePermission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

export interface CmsPermissions {
  posts: ContentPermission
  events: ContentPermission
  parent_letters: ContentPermission
  presentations: ContentPermission
  pages: { edit: boolean }
  documents: DocumentPermission
  settings: SettingsPermission
  navigation: boolean
  seitenstruktur: boolean
  seitenEditor: boolean
  organisation: boolean
  users: UserPermission
  tags: boolean
  messages: boolean
  anmeldungen: boolean
  diagnostic: boolean
  roles: RolePermission
}

export interface UserPagePermission {
  id: string
  user_id: string
  page_type: "editable" | "cms"
  page_id: string
}

export interface CmsRole {
  id: string
  name: string
  slug: string
  is_system: boolean
  permissions: CmsPermissions
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
}

// ============================================================================
// Default (empty) permissions — zero access
// ============================================================================

export const EMPTY_PERMISSIONS: CmsPermissions = {
  posts: { create: false, edit: false, delete: false, publish: false },
  events: { create: false, edit: false, delete: false, publish: false },
  parent_letters: { create: false, edit: false, delete: false, publish: false },
  presentations: { create: false, edit: false, delete: false, publish: false },
  pages: { edit: false },
  documents: { upload: false, delete: false },
  settings: { basic: false, advanced: false, seo: false },
  navigation: false,
  seitenstruktur: false,
  seitenEditor: false,
  organisation: false,
  users: { view: false, create: false, delete: false, assignRoles: false },
  tags: false,
  messages: false,
  anmeldungen: false,
  diagnostic: false,
  roles: { view: false, create: false, edit: false, delete: false },
}

// ============================================================================
// Merge two permission objects (OR logic: truest value wins)
// ============================================================================

function mergeEditDelete(a: "own" | "all" | false, b: "own" | "all" | false): "own" | "all" | false {
  if (a === "all" || b === "all") return "all"
  if (a === "own" || b === "own") return "own"
  return false
}

function mergeContentPermission(a: ContentPermission, b: ContentPermission): ContentPermission {
  return {
    create: a.create || b.create,
    edit: mergeEditDelete(a.edit, b.edit),
    delete: mergeEditDelete(a.delete, b.delete),
    publish: a.publish || b.publish,
  }
}

export function mergePermissions(a: CmsPermissions, b: CmsPermissions): CmsPermissions {
  return {
    posts: mergeContentPermission(a.posts, b.posts),
    events: mergeContentPermission(a.events, b.events),
    parent_letters: mergeContentPermission(a.parent_letters, b.parent_letters),
    presentations: mergeContentPermission(a.presentations, b.presentations),
    pages: { edit: a.pages.edit || b.pages.edit },
    documents: {
      upload: a.documents.upload || b.documents.upload,
      delete: mergeEditDelete(a.documents.delete, b.documents.delete),
    },
    settings: {
      basic: a.settings.basic || b.settings.basic,
      advanced: a.settings.advanced || b.settings.advanced,
      seo: a.settings.seo || b.settings.seo,
    },
    navigation: a.navigation || b.navigation,
    seitenstruktur: a.seitenstruktur || b.seitenstruktur,
    seitenEditor: a.seitenEditor || b.seitenEditor,
    organisation: a.organisation || b.organisation,
    users: {
      view: a.users.view || b.users.view,
      create: a.users.create || b.users.create,
      delete: a.users.delete || b.users.delete,
      assignRoles: a.users.assignRoles || b.users.assignRoles,
    },
    tags: a.tags || b.tags,
    messages: a.messages || b.messages,
    anmeldungen: a.anmeldungen || b.anmeldungen,
    diagnostic: a.diagnostic || b.diagnostic,
    roles: {
      view: a.roles.view || b.roles.view,
      create: a.roles.create || b.roles.create,
      edit: a.roles.edit || b.roles.edit,
      delete: a.roles.delete || b.roles.delete,
    },
  }
}

// ============================================================================
// Safely coerce a raw JSONB object into CmsPermissions
// ============================================================================

export function coercePermissions(raw: unknown): CmsPermissions {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PERMISSIONS }
  const p = raw as Record<string, unknown>

  function bool(v: unknown): boolean {
    return v === true
  }
  function editDel(v: unknown): "own" | "all" | false {
    if (v === "all") return "all"
    if (v === "own") return "own"
    return false
  }
  function obj(v: unknown): Record<string, unknown> {
    return (v && typeof v === "object" ? v : {}) as Record<string, unknown>
  }

  const posts = obj(p.posts)
  const events = obj(p.events)
  const parent_letters = obj(p.parent_letters)
  const presentations = obj(p.presentations)
  const pages = obj(p.pages)
  const documents = obj(p.documents)
  const settings = obj(p.settings)
  const users = obj(p.users)
  const roles = obj(p.roles)

  return {
    posts: { create: bool(posts.create), edit: editDel(posts.edit), delete: editDel(posts.delete), publish: bool(posts.publish) },
    events: { create: bool(events.create), edit: editDel(events.edit), delete: editDel(events.delete), publish: bool(events.publish) },
    parent_letters: { create: bool(parent_letters.create), edit: editDel(parent_letters.edit), delete: editDel(parent_letters.delete), publish: bool(parent_letters.publish) },
    presentations: { create: bool(presentations.create), edit: editDel(presentations.edit), delete: editDel(presentations.delete), publish: bool(presentations.publish) },
    pages: { edit: bool(pages.edit) },
    documents: { upload: bool(documents.upload), delete: editDel(documents.delete) },
    settings: { basic: bool(settings.basic), advanced: bool(settings.advanced), seo: bool(settings.seo) },
    navigation: bool(p.navigation),
    seitenstruktur: bool(p.seitenstruktur),
    seitenEditor: bool(p.seitenEditor),
    organisation: bool(p.organisation),
    users: { view: bool(users.view), create: bool(users.create), delete: bool(users.delete), assignRoles: bool(users.assignRoles) },
    tags: bool(p.tags),
    messages: bool(p.messages),
    anmeldungen: bool(p.anmeldungen),
    diagnostic: bool(p.diagnostic),
    roles: { view: bool(roles.view), create: bool(roles.create), edit: bool(roles.edit), delete: bool(roles.delete) },
  }
}

// ============================================================================
// Permission checking (pure function, no server deps)
// ============================================================================

export type PermissionCheck =
  | "settings"
  | "settings.basic"
  | "settings.advanced"
  | "navigation"
  | "seitenstruktur"
  | "seitenEditor"
  | "organisation"
  | "users"
  | "users.view"
  | "tags"
  | "messages"
  | "anmeldungen"
  | "diagnostic"
  | "roles"
  | "roles.view"
  | "posts"
  | "posts.create"
  | "events"
  | "events.create"
  | "parent_letters"
  | "parent_letters.create"
  | "presentations"
  | "presentations.create"
  | "documents"
  | "documents.upload"

export function checkPermission(permissions: CmsPermissions, check: PermissionCheck): boolean {
  switch (check) {
    case "settings":
      return permissions.settings.basic || permissions.settings.advanced || permissions.settings.seo
    case "settings.basic":
      return permissions.settings.basic
    case "settings.advanced":
      return permissions.settings.advanced
    case "navigation":
      return permissions.navigation
    case "seitenstruktur":
      return permissions.seitenstruktur
    case "seitenEditor":
      return permissions.seitenEditor
    case "organisation":
      return permissions.organisation
    case "users":
    case "users.view":
      return permissions.users.view
    case "tags":
      return permissions.tags
    case "messages":
      return permissions.messages
    case "anmeldungen":
      return permissions.anmeldungen
    case "diagnostic":
      return permissions.diagnostic
    case "roles":
    case "roles.view":
      return permissions.roles.view
    case "posts":
      return permissions.posts.create || permissions.posts.edit !== false
    case "posts.create":
      return permissions.posts.create
    case "events":
      return permissions.events.create || permissions.events.edit !== false
    case "events.create":
      return permissions.events.create
    case "parent_letters":
      return permissions.parent_letters.create || permissions.parent_letters.edit !== false
    case "parent_letters.create":
      return permissions.parent_letters.create
    case "presentations":
      return permissions.presentations.create || permissions.presentations.edit !== false
    case "presentations.create":
      return permissions.presentations.create
    case "documents":
      return permissions.documents.upload || permissions.documents.delete !== false
    case "documents.upload":
      return permissions.documents.upload
    default:
      return false
  }
}

// ============================================================================
// Role slug helpers (pure functions)
// ============================================================================

export function isAdmin(roleSlugs: string[]): boolean {
  return roleSlugs.includes("administrator")
}

export function isSchulleitung(roleSlugs: string[]): boolean {
  return roleSlugs.includes("schulleitung")
}

export function isAdminOrSchulleitung(roleSlugs: string[]): boolean {
  return isAdmin(roleSlugs) || isSchulleitung(roleSlugs)
}
