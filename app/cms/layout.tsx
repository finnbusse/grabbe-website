import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CmsShell } from "@/components/cms/cms-shell"
import { getUserPermissions, getUserRoleSlugs, getUserPagePermissions, EMPTY_PERMISSIONS } from "@/lib/permissions"
import type { UserPagePermission } from "@/lib/permissions"

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile (gracefully handle missing table or columns)
  let userProfile = null
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("first_name, last_name, title, avatar_url")
      .eq("user_id", user.id)
      .single()
    if (!error) {
      userProfile = data
    } else if (error.message?.includes("avatar_url")) {
      // avatar_url column doesn't exist yet - query without it
      const { data: fallbackData } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, title")
        .eq("user_id", user.id)
        .single()
      if (fallbackData) {
        userProfile = { ...fallbackData, avatar_url: null }
      }
    }
  } catch {
    // Table may not exist yet
  }

  // Fetch RBAC data (gracefully handle missing tables)
  let permissions = EMPTY_PERMISSIONS
  let roleSlugs: string[] = []
  let pagePermissions: UserPagePermission[] = []
  try {
    const [p, rs, pp] = await Promise.all([
      getUserPermissions(user.id),
      getUserRoleSlugs(user.id),
      getUserPagePermissions(user.id),
    ])
    permissions = p
    roleSlugs = rs
    pagePermissions = pp
  } catch {
    // RBAC tables may not exist yet — grant full access (backward compatibility)
    permissions = {
      posts: { create: true, edit: "all", delete: "all", publish: true },
      events: { create: true, edit: "all", delete: "all", publish: true },
      parent_letters: { create: true, edit: "all", delete: "all", publish: true },
      presentations: { create: true, edit: "all", delete: "all", publish: true },
      pages: { edit: true },
      documents: { upload: true, delete: "all" },
      settings: { basic: true, advanced: true, seo: true },
      navigation: true,
      seitenstruktur: true,
      seitenEditor: true,
      organisation: true,
      users: { view: true, create: true, delete: true, assignRoles: true },
      tags: true,
      messages: true,
      anmeldungen: true,
      diagnostic: true,
      roles: { view: true, create: true, edit: true, delete: true },
    }
    roleSlugs = ["administrator"]
  }

  return (
    <CmsShell
      userEmail={user.email ?? ""}
      userProfile={userProfile}
      permissions={permissions}
      roleSlugs={roleSlugs}
      pagePermissions={pagePermissions}
    >
      {children}
    </CmsShell>
  )
}
