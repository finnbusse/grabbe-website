"use client"

import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

export type FooterLink = { id: string; label: string; href: string }

export function SiteFooter({
  links,
  legalLinks,
  settings,
}: {
  links: FooterLink[]
  legalLinks: FooterLink[]
  settings: Record<string, string>
}) {
  const name = settings.school_name || "Grabbe-Gymnasium"
  const fullName =
    settings.school_name_full || settings.seo_org_name || "Christian-Dietrich-Grabbe-Gymnasium Detmold"
  const seoZipCity = [settings.seo_org_address_zip, settings.seo_org_address_city].filter(Boolean).join(" ")
  const seoAddress = [settings.seo_org_address_street, seoZipCity].filter(Boolean).join(", ")
  const address =
    settings.school_address ||
    seoAddress ||
    "Küster-Meyer-Platz 2, 32756 Detmold"
  const phone = settings.school_phone || settings.seo_org_phone || "05231 - 99260"
  const email = settings.school_email || settings.seo_org_email || "sekretariat@grabbe.nrw.schule"
  const motto = settings.school_motto || '"Deine Talente. Deine Bühne. Dein Grabbe."'
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-primary text-primary-foreground overflow-hidden noise-overlay">
      {/* Large decorative serif text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display text-[20vw] italic text-primary-foreground/[0.02] leading-none select-none whitespace-nowrap">
          Grabbe
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-24">
        {/* Top: Large branding */}
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <img
                src="/images/grabbe-logo.svg"
                alt={name}
                className="h-10 w-auto brightness-0 invert opacity-80"
              />
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/50">
              {settings.school_description ||
                settings.seo_homepage_description ||
                "Wir fördern Deine Talente und stärken Deine Persönlichkeit."}
            </p>
          </div>
          <p className="font-sub text-[10px] uppercase tracking-[0.3em] text-primary-foreground/30">
            {settings.school_city || settings.seo_org_address_city || "Detmold"}, NRW
          </p>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px bg-primary-foreground/10" />

        {/* Main grid */}
        <div className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Quick links */}
          <div>
            <h3 className="font-sub text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40">
              Schnellzugriff
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {links.map((l) => (
                <li key={l.id}>
                  <Link
                    href={l.href}
                    className="text-sm text-primary-foreground/60 transition-colors hover:text-[hsl(200,90%,80%)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sub text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40">
              Kontakt
            </h3>
            <ul className="mt-5 flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/30" />
                <span className="text-sm text-primary-foreground/60">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary-foreground/30" />
                <a
                  href={`tel:${phone.replace(/[\s()-]/g, "")}`}
                  onClick={() => trackEvent("footer_phone_click")}
                  className="text-sm text-primary-foreground/60 hover:text-[hsl(200,90%,80%)] transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary-foreground/30" />
                <a
                  href={`mailto:${email}`}
                  onClick={() => trackEvent("footer_email_click")}
                  className="text-sm text-primary-foreground/60 hover:text-[hsl(200,90%,80%)] transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-sub text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40">
              Rechtliches
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {legalLinks.map((l) => (
                <li key={l.id}>
                  <Link
                    href={l.href}
                    className="text-sm text-primary-foreground/60 transition-colors hover:text-[hsl(200,90%,80%)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Motto */}
          <div>
            <h3 className="font-sub text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40">
              Unser Motto
            </h3>
            <blockquote className="mt-5">
              <p className="font-display text-xl italic text-primary-foreground/70 leading-relaxed">
                {motto}
              </p>
            </blockquote>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 sm:flex-row">
          <p className="text-[11px] text-primary-foreground/30">
            © {year} Finn Busse · Alle Rechte vorbehalten
          </p>
          <Link
            href="/cms"
            className="text-[11px] text-primary-foreground/15 transition-colors hover:text-primary-foreground/40"
          >
            Verwaltung
          </Link>
        </div>
      </div>
    </footer>
  )
}
