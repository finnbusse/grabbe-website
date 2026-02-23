import { getSettings, getNavigation, getAllNavItems } from "@/lib/settings"
import { SiteHeader, type NavItemData } from "@/components/site-header"
import { SiteFooter, type FooterLink } from "@/components/site-footer"

export async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, headerNav, footerNav, footerLegalNav] = await Promise.all([
    getSettings(),
    getNavigation("header"),
    getAllNavItems("footer"),
    getAllNavItems("footer-legal"),
  ])

  const defaultNavItems: NavItemData[] = [
    { id: "home", label: "Startseite", href: "/" },
    {
      id: "schule",
      label: "Unsere Schule",
      href: "/unsere-schule",
      children: [
        { id: "profil", label: "Profilprojekte", href: "/unsere-schule/profilprojekte" },
        { id: "erprobung", label: "Erprobungsstufe", href: "/unsere-schule/erprobungsstufe" },
        { id: "oberstufe", label: "Oberstufe", href: "/unsere-schule/oberstufe" },
        { id: "anmeldung", label: "Anmeldung", href: "/unsere-schule/anmeldung" },
      ],
    },
    {
      id: "schulleben",
      label: "Schulleben",
      href: "/schulleben",
      children: [
        { id: "nachmittag", label: "Nachmittag", href: "/schulleben/nachmittag" },
        { id: "faecher", label: "Fächer & AGs", href: "/schulleben/faecher-ags" },
      ],
    },
    { id: "aktuelles", label: "Aktuelles", href: "/aktuelles" },
    { id: "termine", label: "Termine", href: "/termine" },
    { id: "kontakt", label: "Kontakt", href: "/kontakt" },
  ]

  const navItems: NavItemData[] = headerNav.length > 0
    ? headerNav.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        children: item.children?.map((c) => ({
          id: c.id,
          label: c.label,
          href: c.href,
        })),
      }))
    : defaultNavItems

  const footerLinks: FooterLink[] = footerNav.map((l) => ({
    id: l.id,
    label: l.label,
    href: l.href,
  }))

  const legalLinks: FooterLink[] = footerLegalNav.map((l) => ({
    id: l.id,
    label: l.label,
    href: l.href,
  }))

  return (
    <>
      <SiteHeader
        navItems={navItems}
        schoolName={settings.school_name || "Grabbe-Gymnasium"}
        logoUrl={settings.school_logo_url || undefined}
      />
      {children}
      <SiteFooter links={footerLinks} legalLinks={legalLinks} settings={settings} />
    </>
  )
}
