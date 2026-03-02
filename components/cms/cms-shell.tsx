"use client"

import { useState, useEffect } from "react"
import { Menu, Search } from "lucide-react"
import { CmsSidebar } from "@/components/cms/cms-sidebar"
import { Button } from "@/components/ui/button"
import { PermissionsProvider } from "@/components/cms/permissions-context"
import { CommandPalette } from "@/components/cms/command-palette"
import { CommandPaletteProvider, useCommandPalette } from "@/components/cms/command-palette-context"
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

function CmsShellContent({ children, userEmail, userProfile, sidebarOpen, setSidebarOpen, collapsed, toggleCollapsed }: any) {
  const { setOpen: setCommandOpen } = useCommandPalette()

  return (
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

      <CommandPalette />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
        {/* Mobile Header (minimal original style) */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
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
              <img src="/images/grabbe-logo.svg" alt="Grabbe Logo" className="h-7 w-7" />
              <span className="font-display text-sm font-semibold text-card-foreground">Grabbe</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            aria-label="Suchen"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Floating Command Trigger (Desktop only) */}
        <div className="hidden lg:flex absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm pointer-events-none">
          <Button
            variant="outline"
            className="relative h-10 w-full justify-start rounded-full bg-background/80 backdrop-blur-md border-border/50 text-sm text-muted-foreground shadow-sm hover:bg-background/90 pointer-events-auto transition-all"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Suchen...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <main className="min-h-0 flex-1 overflow-auto bg-muted pt-4 lg:pt-16">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export function CmsShell({ children, userEmail, userProfile, permissions, roleSlugs, pagePermissions }: CmsShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

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
      <CommandPaletteProvider>
        <CmsShellContent
          userEmail={userEmail}
          userProfile={userProfile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        >
          {children}
        </CmsShellContent>
      </CommandPaletteProvider>
    </PermissionsProvider>
  )
}
