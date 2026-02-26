"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { CmsSidebar } from "@/components/cms/cms-sidebar"
import { Button } from "@/components/ui/button"
import { PermissionsProvider } from "@/components/cms/permissions-context"
import type { CmsPermissions, UserPagePermission } from "@/lib/permissions-shared"

interface UserProfileData {
  first_name?: string
  last_name?: string
  title?: string
  avatar_url?: string | null
}

interface CmsShellProps {
  children: React.ReactNode
  userEmail: string
  userProfile?: UserProfileData | null
  permissions: CmsPermissions
  roleSlugs: string[]
  pagePermissions: UserPagePermission[]
}

export function CmsShell({ children, userEmail, userProfile, permissions, roleSlugs, pagePermissions }: CmsShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <PermissionsProvider value={{ permissions, roleSlugs, pagePermissions }}>
      <div className="flex min-h-svh">
        <CmsSidebar
          userEmail={userEmail}
          userProfile={userProfile}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menü öffnen"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src="/images/grabbe-logo.svg" alt="Grabbe Logo" className="h-7 w-7" />
              <span className="font-display text-sm font-semibold text-card-foreground">Grabbe Gymnasium</span>
            </div>
          </div>

          <main className="flex-1 overflow-auto bg-muted">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PermissionsProvider>
  )
}
