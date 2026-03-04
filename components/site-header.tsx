"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useCallback, useEffect } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

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
      {/* School logo */}
      <div className="fixed left-4 top-3 z-[55] md:left-6 lg:absolute lg:left-12 lg:top-4 lg:z-40">
        <Link href="/">
          <img
            src={logoUrl || "/images/grabbe-logo.svg"}
            alt={schoolName}
            className="school-logo-dark h-12 w-auto md:h-16 lg:h-24 drop-shadow-lg transition-all duration-300"
          />
        </Link>
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          headerHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Centered glass navbar */}
        <div className="ml-auto mr-4 mt-3 flex w-fit items-center justify-end rounded-full px-2 py-1.5 backdrop-blur-md shadow-lg lg:mx-auto lg:mt-4 lg:w-full lg:max-w-3xl lg:justify-between lg:px-1 lg:py-1"
          style={{
            backgroundColor: "rgb(var(--nav-glass-bg) / 0.2)",
            border: "1px solid rgb(var(--nav-glass-border) / 0.26)",
          }}
        >
        {/* Start button */}
        <Link
          href="/"
          className={`hidden shrink-0 rounded-full px-5 py-2 text-[13px] font-medium transition-colors duration-200 nav-glass-interactive lg:inline-flex ${
            pathname === "/"
              ? "text-foreground"
              : "text-foreground/85 hover:text-foreground"
          }`}
          style={pathname === "/"
            ? { backgroundColor: "rgb(var(--nav-glass-item-active) / 0.32)" }
            : undefined
          }
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
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 nav-glass-interactive ${
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-foreground/85 hover:text-foreground"
                  }`}
                  style={isActive(item.href)
                    ? { backgroundColor: "rgb(var(--nav-glass-item-active) / 0.32)" }
                    : undefined
                  }
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
                    <div
                      className="min-w-[220px] backdrop-blur-3xl rounded-2xl p-1.5 shadow-xl animate-blur-in"
                      style={{
                        backgroundColor: "rgb(var(--nav-dropdown-bg) / 0.85)",
                        border: "1px solid rgb(var(--nav-glass-border) / 0.4)",
                      }}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={`block rounded-xl px-4 py-2.5 text-[13px] transition-colors duration-200 nav-glass-interactive ${
                            pathname === child.href
                              ? "font-medium text-foreground"
                              : "text-foreground/85 hover:text-foreground"
                          }`}
                          style={pathname === child.href
                            ? { backgroundColor: "rgb(var(--nav-glass-item-active) / 0.28)" }
                            : undefined
                          }
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
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 nav-glass-interactive ${
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-foreground/85 hover:text-foreground"
                }`}
                style={isActive(item.href)
                  ? { backgroundColor: "rgb(var(--nav-glass-item-active) / 0.32)" }
                  : undefined
                }
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/85 hover:text-foreground transition-all duration-200 nav-glass-interactive lg:hidden"
          style={{ backgroundColor: mobileOpen ? "rgb(var(--nav-glass-item-hover) / 0.2)" : undefined }}
          onClick={() => {
            const next = !mobileOpen
            setMobileOpen(next)
            trackEvent("nav_mobile_toggle", { open: next })
          }}
          aria-label={mobileOpen ? "Navigation schließen" : "Navigation öffnen"}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          className="mx-4 mt-2 rounded-3xl backdrop-blur-xl p-3 shadow-xl lg:hidden animate-blur-in"
          style={{
            backgroundColor: "rgb(var(--nav-glass-bg) / 0.24)",
            border: "1px solid rgb(var(--nav-glass-border) / 0.26)",
          }}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className={`block rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-200 nav-glass-interactive ${
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/85 hover:text-foreground"
                  }`}
                  style={pathname === item.href
                    ? { backgroundColor: "rgb(var(--nav-glass-item-active) / 0.3)" }
                    : undefined
                  }
                  onClick={() => {
                    setMobileOpen(false)
                    trackEvent("nav_link_click", { label: item.label, href: item.href })
                  }}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    className={`block rounded-full py-2 pl-7 pr-3 text-sm transition-all duration-200 nav-glass-interactive ${
                      pathname === child.href
                        ? "font-medium text-foreground"
                        : "text-foreground/85 hover:text-foreground"
                    }`}
                    onClick={() => {
                      setMobileOpen(false)
                      trackEvent("nav_link_click", { label: child.label, href: child.href })
                    }}
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
