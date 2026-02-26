import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserPermissions, requirePermission } from "@/lib/permissions"

export default async function NachrichtenLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const permissions = await getUserPermissions(user.id)
  // Allow access if user has either messages or anmeldungen permission
  const hasAccess = permissions.messages || permissions.anmeldungen
  if (!hasAccess) {
    redirect("/cms?error=no_access")
  }
  return <>{children}</>
}
