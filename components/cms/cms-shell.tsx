"use client"

import { useState, useEffect } from "react"
import { Menu, Search } from "lucide-react"
import { CmsSidebar } from "@/components/cms/cms-sidebar"
import { Button } from "@/components/ui/button"
import { PermissionsProvider } from "@/components/cms/permissions-context"
import { CommandPalette } from "@/components/cms/command-palette"
import type { CmsPermissions, UserPagePermission } from "@/lib/permissions-shared"

const SIDEBAR_COLLAPSED_KEY = "cms_sidebar_collapsed"

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
  const [collapsed, setCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (stored === "true") setCollapsed(true)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      return next
    })
  }

  return (
    <PermissionsProvider value={{ permissions, roleSlugs, pagePermissions }}>
      <div className="flex h-svh overflow-hidden">
        <CmsSidebar
          userEmail={userEmail}
          userProfile={userProfile}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <CommandPalette open={commandOpen} setOpen={setCommandOpen} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                aria-label="Menü öffnen"
                className="-ml-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img src="/images/grabbe-logo.svg" alt="Grabbe Logo" className="h-6 w-6" />
                <span className="font-display text-sm font-semibold text-card-foreground">Grabbe Gymnasium</span>
              </div>
            </div>

            {/* Desktop spacer when no search bar is needed on left */}
            <div className="hidden lg:block flex-1"></div>

            <div className="flex flex-1 items-center justify-end lg:flex-none">
              <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-full bg-muted/50 text-sm text-muted-foreground sm:w-64 lg:w-64"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline-flex">Suchen...</span>
                <span className="sm:hidden">Suchen...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-auto bg-muted">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PermissionsProvider>
  )
}
