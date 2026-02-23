"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useCallback, useEffect } from "react"
import { Menu, X, ChevronDown } from "lucide-react"

const DESKTOP_BREAKPOINT = 1024
const SCROLL_TOP_OFFSET = 80
const SCROLL_DELTA_THRESHOLD = 4

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
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollYRef = useRef(0)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLElement>(null)

  const handleDropdownEnter = useCallback((itemId: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setOpenDropdown(itemId)
  }, [])

  const handleDropdownLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  // Close dropdown when touching outside the desktop nav (tablet touch support)
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("touchstart", handleOutside, { passive: true })
    document.addEventListener("mousedown", handleOutside)
    return () => {
      document.removeEventListener("touchstart", handleOutside)
      document.removeEventListener("mousedown", handleOutside)
    }
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        setHeaderHidden(false)
        lastScrollYRef.current = window.scrollY
        return
      }

      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollYRef.current

      if (currentScrollY < SCROLL_TOP_OFFSET) {
        setHeaderHidden(false)
      } else if (scrollDelta > SCROLL_DELTA_THRESHOLD) {
        setHeaderHidden(true)
      } else if (scrollDelta < -SCROLL_DELTA_THRESHOLD) {
        setHeaderHidden(false)
      }

      lastScrollYRef.current = currentScrollY
    }

    const handleResize = () => {
      if (window.innerWidth < DESKTOP_BREAKPOINT) setHeaderHidden(false)
    }

    lastScrollYRef.current = window.scrollY
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <>
      {/* School logo - absolute positioned, scrolls with page */}
      <div className="absolute top-[4.5rem] lg:top-4 left-5 md:left-8 lg:left-12 z-40">
        <Link href="/">
          <img
            src="/images/grabbe-logo.svg"
            alt={schoolName}
            className="h-16 w-auto md:h-20 lg:h-24 drop-shadow-lg"
          />
        </Link>
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          headerHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Centered glass navbar */}
        <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between rounded-full px-3 py-1.5 bg-white/15 backdrop-blur-md border border-white/25 shadow-lg lg:mt-4 lg:px-1 lg:py-1">
        {/* Start button */}
        <Link
          href="/"
          className={`shrink-0 rounded-full px-5 py-2 text-[13px] font-medium transition-colors duration-200 ${
            pathname === "/"
              ? "text-foreground bg-white/30"
              : "text-foreground/80 hover:text-foreground hover:bg-white/25"
          }`}
        >
          Start
        </Link>

        {/* Desktop nav */}
        <nav ref={navRef} className="hidden items-center gap-0.5 lg:flex flex-1 justify-center" aria-label="Hauptnavigation">
          {navItems
            .filter(item => item.href !== "/")
            .map((item) =>
            item.children && item.children.length > 0 ? (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(item.id)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-foreground bg-white/30"
                      : "text-foreground/80 hover:text-foreground hover:bg-white/25"
                  }`}
                  onTouchEnd={(e) => {
                    // preventDefault() cancels all subsequent synthetic mouse events
                    // (mouseenter, mouseleave, mousedown, click) so hover state is not disturbed.
                    e.preventDefault()
                    if (openDropdown !== item.id) {
                      handleDropdownEnter(item.id)
                    } else {
                      router.push(item.href)
                    }
                  }}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      openDropdown === item.id ? "rotate-180" : ""
                    }`}
                  />
                </Link>
                {openDropdown === item.id && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full z-50 pt-2"
                    onMouseEnter={() => handleDropdownEnter(item.id)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="min-w-[220px] bg-white/85 backdrop-blur-xl border border-white/25 rounded-2xl p-1.5 shadow-xl animate-blur-in">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={`block rounded-xl px-4 py-2.5 text-[13px] transition-colors duration-200 ${
                            pathname === child.href
                              ? "font-medium text-foreground bg-white/20"
                              : "text-foreground/80 hover:text-foreground hover:bg-white/20"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-foreground bg-white/30"
                    : "text-foreground/80 hover:text-foreground hover:bg-white/25"
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
          aria-label={mobileOpen ? "Navigation schließen" : "Navigation öffnen"}
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
    </>
  )
}
