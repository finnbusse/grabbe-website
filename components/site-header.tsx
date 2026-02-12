"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, ChevronDown } from "lucide-react"

export type NavItemData = {
  id: string
  label: string
  href: string
  children?: NavItemData[]
}

export function SiteHeader({
  navItems,
  schoolName,
  logoUrl,
}: {
  navItems: NavItemData[]
  schoolName: string
  logoUrl?: string
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Centered frosty glass navbar with fully rounded corners */}
      <div className="mx-auto mt-3 flex max-w-4xl items-center justify-between rounded-full px-4 py-2 glass-strong shadow-lg shadow-black/[0.04] lg:mt-4 lg:px-5 lg:py-2.5 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.06]">
        {/* Start button on far left */}
        <Link 
          href="/" 
          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 hover:bg-primary/[0.06] ${
            pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Start
        </Link>

        {/* Desktop nav - centered */}
        <nav className="hidden items-center gap-0.5 lg:flex flex-1 justify-center" aria-label="Hauptnavigation">
          {navItems
            .filter(item => item.href !== "/") // Home/Start is handled by dedicated Start button
            .map((item) =>
            item.children && item.children.length > 0 ? (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 hover:bg-primary/[0.06] ${
                    pathname.startsWith(item.href) && item.href !== "/"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-300 ${
                      openDropdown === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdown === item.id && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-1 min-w-[240px] glass-strong rounded-3xl p-2 shadow-xl shadow-primary/[0.06] animate-blur-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`block rounded-full px-4 py-2.5 text-[13px] transition-all duration-200 hover:bg-primary/[0.06] ${
                          pathname === child.href
                            ? "font-medium text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 hover:bg-primary/[0.06] ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/[0.06] hover:text-foreground transition-all duration-200 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Navigation schliessen" : "Navigation oeffnen"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="mx-4 mt-2 rounded-3xl glass-strong p-4 shadow-xl lg:hidden animate-blur-in">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className={`block rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-primary/[0.06]"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    className={`block rounded-full py-2.5 pl-8 pr-4 text-sm transition-all duration-200 ${
                      pathname === child.href
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
