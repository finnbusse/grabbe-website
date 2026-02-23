/**
 * Role-Based Access Control (RBAC) — Server-only permission helpers.
 *
 * Re-exports all shared types/constants from permissions-shared.ts,
 * and adds server-side functions that depend on Supabase / next/headers.
 *
 * Client components should import from "@/lib/permissions-shared" instead.
 */

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

// Re-export everything from the shared (client-safe) module so that
// server components can import from either module.
export {
  type ContentPermission,
  type DocumentPermission,
  type SettingsPermission,
  type UserPermission,
  type RolePermission,
  type CmsPermissions,
  type UserPagePermission,
  type CmsRole,
  type UserRole,
  type PermissionCheck,
  EMPTY_PERMISSIONS,
  mergePermissions,
  coercePermissions,
  checkPermission,
  isAdmin,
  isSchulleitung,
  isAdminOrSchulleitung,
} from "@/lib/permissions-shared"

// Local imports for use in functions below
import type { CmsPermissions, CmsRole, UserPagePermission, PermissionCheck } from "@/lib/permissions-shared"
import { EMPTY_PERMISSIONS, mergePermissions, coercePermissions, checkPermission } from "@/lib/permissions-shared"

// ============================================================================
// Fetch user permissions (merges all assigned roles)
// ============================================================================

export async function getUserPermissions(userId: string): Promise<CmsPermissions> {
  const supabase = await createClient()

  // Fetch user role assignments
  const { data: userRoles, error: urError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId)

  if (urError || !userRoles || userRoles.length === 0) {
    return { ...EMPTY_PERMISSIONS }
  }

  const roleIds = (userRoles as Array<{ role_id: string }>).map((ur) => ur.role_id)

  // Fetch role permissions
  const { data: roles, error: rError } = await supabase
    .from("cms_roles")
    .select("permissions")
    .in("id", roleIds)

  if (rError || !roles || roles.length === 0) {
    return { ...EMPTY_PERMISSIONS }
  }

  let merged = { ...EMPTY_PERMISSIONS }
  for (const role of roles as Array<{ permissions: unknown }>) {
    merged = mergePermissions(merged, coercePermissions(role.permissions))
  }

  return merged
}

// ============================================================================
// Fetch user's role slugs (for display purposes)
// ============================================================================

export async function getUserRoleSlugs(userId: string): Promise<string[]> {
  const supabase = await createClient()

  // Fetch role IDs for user
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId)

  if (!userRoles || userRoles.length === 0) return []

  const roleIds = (userRoles as Array<{ role_id: string }>).map((ur) => ur.role_id)

  // Fetch role slugs
  const { data: roles } = await supabase
    .from("cms_roles")
    .select("slug")
    .in("id", roleIds)

  if (!roles) return []
  return (roles as Array<{ slug: string }>).map((r) => r.slug)
}

// ============================================================================
// Fetch user page permissions
// ============================================================================

export async function getUserPagePermissions(userId: string): Promise<UserPagePermission[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_page_permissions")
    .select("*")
    .eq("user_id", userId)

  if (error || !data) return []
  return data as UserPagePermission[]
}

// ============================================================================
// Route protection helper (server-side redirect)
// ============================================================================

/**
 * Server-side permission guard. Redirects to /cms with error if denied.
 */
export async function requirePermission(permissions: CmsPermissions, check: PermissionCheck): Promise<void> {
  if (!checkPermission(permissions, check)) {
    redirect("/cms?error=no_access")
  }
}

// ============================================================================
// Fetch all roles (for admin UI)
// ============================================================================

export async function getAllRoles(): Promise<CmsRole[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cms_roles")
    .select("*")
    .order("is_system", { ascending: false })
    .order("name")

  if (error || !data) return []
  return data.map((r) => {
    const row = r as { id: string; name: string; slug: string; is_system: boolean; permissions: unknown; created_at: string }
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      is_system: row.is_system,
      permissions: coercePermissions(row.permissions),
      created_at: row.created_at,
    }
  })
}

// ============================================================================
// Admin operations (use service role client)
// ============================================================================

export async function assignUserRole(userId: string, roleId: string): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { error } = await admin.from("user_roles").insert({ user_id: userId, role_id: roleId })
  if (error) return { error: error.message }
  return {}
}

export async function removeUserRole(userId: string, roleId: string): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { error } = await admin.from("user_roles").delete().eq("user_id", userId).eq("role_id", roleId)
  if (error) return { error: error.message }
  return {}
}

export async function setUserRoles(userId: string, roleIds: string[]): Promise<{ error?: string }> {
  const admin = createAdminClient()
  // Delete existing roles
  const { error: delError } = await admin.from("user_roles").delete().eq("user_id", userId)
  if (delError) return { error: delError.message }
  // Insert new roles
  if (roleIds.length > 0) {
    const rows = roleIds.map((role_id) => ({ user_id: userId, role_id }))
    const { error: insError } = await admin.from("user_roles").insert(rows)
    if (insError) return { error: insError.message }
  }
  return {}
}

export async function setUserPagePermissions(
  userId: string,
  pages: Array<{ page_type: "editable" | "cms"; page_id: string }>
): Promise<{ error?: string }> {
  const admin = createAdminClient()
  // Delete existing
  const { error: delError } = await admin.from("user_page_permissions").delete().eq("user_id", userId)
  if (delError) return { error: delError.message }
  // Insert new
  if (pages.length > 0) {
    const rows = pages.map((p) => ({ user_id: userId, ...p }))
    const { error: insError } = await admin.from("user_page_permissions").insert(rows)
    if (insError) return { error: insError.message }
  }
  return {}
}

// ============================================================================
// Custom role CRUD (admin only)
// ============================================================================

export async function createCustomRole(
  name: string,
  slug: string,
  permissions: CmsPermissions
): Promise<{ id?: string; error?: string }> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("cms_roles")
    .insert({ name, slug, is_system: false, permissions: permissions as unknown as Record<string, unknown> })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data?.id }
}

export async function updateCustomRole(
  id: string,
  name: string,
  permissions: CmsPermissions
): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { error } = await admin
    .from("cms_roles")
    .update({ name, permissions: permissions as unknown as Record<string, unknown> })
    .eq("id", id)
    .eq("is_system", false) // prevent editing system roles
  if (error) return { error: error.message }
  return {}
}

export async function deleteCustomRole(id: string): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { error } = await admin
    .from("cms_roles")
    .delete()
    .eq("id", id)
    .eq("is_system", false)
  if (error) return { error: error.message }
  return {}
}

