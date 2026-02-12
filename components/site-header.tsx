"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  {
    label: "Unsere Schule",
    href: "/unsere-schule",
    children: [
      { label: "Erprobungsstufe", href: "/unsere-schule/erprobungsstufe" },
      { label: "Profilprojekte", href: "/unsere-schule/profilprojekte" },
      { label: "Oberstufe", href: "/unsere-schule/oberstufe" },
      { label: "Anmeldung", href: "/unsere-schule/anmeldung" },
      { label: "Wer, Was, Wo?", href: "/unsere-schule/wer-was-wo" },
    ],
  },
  {
    label: "Schulleben",
    href: "/schulleben",
    children: [
      { label: "Faecher & AGs", href: "/schulleben/faecher-ags" },
      { label: "Nachmittags am Grabbe", href: "/schulleben/nachmittag" },
      { label: "Netzwerk & Partner", href: "/schulleben/netzwerk" },
    ],
  },
  { label: "Aktuelles", href: "/aktuelles" },
  { label: "Termine", href: "/termine" },
  { label: "Downloads", href: "/downloads" },
  { label: "Kontakt", href: "/kontakt" },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground font-display">G</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-foreground font-display">
              Grabbe-Gymnasium
            </p>
            <p className="text-xs text-muted-foreground">Detmold</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
          {navigation.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 text-sm font-medium text-foreground">
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link href={child.href} className="cursor-pointer">
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button key={item.label} variant="ghost" asChild className="text-sm font-medium text-foreground">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            )
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/login">CMS Login</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Menu schliessen" : "Menu oeffnen"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 pb-6 pt-4 lg:hidden" aria-label="Mobile Navigation">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block rounded-md px-6 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/auth/login">CMS Login</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  )
}
