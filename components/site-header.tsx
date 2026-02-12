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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const headerClasses = scrolled
    ? "glass-strong shadow-lg shadow-primary/[0.04]"
    : "bg-background/80 backdrop-blur-md border-b border-border/30"

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerClasses}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-[68px] lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={schoolName}
              className="h-9 w-auto"
            />
          ) : (
            <span className="font-display text-xl text-foreground">{schoolName}</span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Hauptnavigation">
          {navItems.map((item) =>
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
                    className={`h-3 w-3 transition-transform duration-200 ${
                      openDropdown === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdown === item.id && (
                  <div className="absolute left-0 top-full z-50 min-w-[240px] glass-strong rounded-2xl p-2 shadow-xl shadow-primary/[0.06] animate-blur-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`block rounded-xl px-4 py-2.5 text-[13px] transition-all hover:bg-primary/[0.06] ${
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
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/[0.06] hover:text-foreground transition-all lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Navigation schliessen" : "Navigation oeffnen"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="glass-strong border-t border-border/30 px-4 py-6 lg:hidden animate-blur-in">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
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
                    className={`block rounded-xl py-2.5 pl-8 pr-4 text-sm transition-colors ${
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
