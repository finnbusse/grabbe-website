"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
      {/* School logo - absolute positioned, same size/position on ALL pages */}
      <Link href="/" className="absolute top-3 left-5 md:left-8 lg:top-4 lg:left-12 z-20">
        <img
          src="/images/grabbe-logo.svg"
          alt={schoolName}
          className="h-16 w-auto md:h-20 lg:h-24 drop-shadow-lg"
        />
      </Link>

      {/* Centered glass navbar */}
      <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between rounded-full px-3 py-1.5 bg-white/15 backdrop-blur-md border border-white/25 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl lg:mt-4 lg:px-4 lg:py-2">
        {/* Start button */}
        <Link
          href="/"
          className={`shrink-0 rounded-full px-5 py-1.5 text-[13px] font-medium transition-all duration-300 hover:bg-white/50 hover:scale-105 hover:shadow-lg ${
            pathname === "/"
              ? "text-foreground bg-white/30"
              : "text-foreground/80 hover:text-foreground"
          }`}
        >
          Start
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0 lg:flex flex-1 justify-center" aria-label="Hauptnavigation">
          {navItems
            .filter(item => item.href !== "/")
            .map((item, index, array) =>
            item.children && item.children.length > 0 ? (
              <div
                key={item.id}
                className="relative h-full flex items-center"
                onMouseEnter={() => setOpenDropdown(item.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={`flex items-center gap-1 px-6 h-full text-[13px] font-medium transition-all duration-300 hover:bg-white/50 hover:scale-105 hover:shadow-lg ${
                    index === 0 ? "rounded-l-full" : ""
                  } ${
                    index === array.length - 1 ? "rounded-r-full" : ""
                  } ${
                    pathname.startsWith(item.href) && item.href !== "/"
                      ? "text-foreground bg-white/30"
                      : "text-foreground/80 hover:text-foreground"
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
                  <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-1 min-w-[220px] bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-1.5 shadow-xl animate-blur-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`block rounded-full px-3 py-2 text-[13px] transition-all duration-200 hover:bg-white/20 ${
                          pathname === child.href
                            ? "font-medium text-foreground"
                            : "text-foreground/80 hover:text-foreground"
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
                className={`px-6 h-full flex items-center text-[13px] font-medium transition-all duration-300 hover:bg-white/50 hover:scale-105 hover:shadow-lg ${
                  index === 0 ? "rounded-l-full" : ""
                } ${
                  index === array.length - 1 ? "rounded-r-full" : ""
                } ${
                  pathname === item.href
                    ? "text-foreground bg-white/30"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-white/20 hover:text-foreground transition-all duration-200 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Navigation schliessen" : "Navigation oeffnen"}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="mx-4 mt-2 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/25 p-3 shadow-xl lg:hidden animate-blur-in">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className={`block rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-white/20 text-foreground"
                      : "text-foreground/80 hover:bg-white/20 hover:text-foreground"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    className={`block rounded-full py-2 pl-7 pr-3 text-sm transition-all duration-200 ${
                      pathname === child.href
                        ? "font-medium text-foreground"
                        : "text-foreground/80 hover:text-foreground"
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
