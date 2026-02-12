import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* School info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground font-display">G</span>
              </div>
              <div>
                <p className="font-semibold font-display">Grabbe-Gymnasium</p>
                <p className="text-sm opacity-70">Detmold</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed opacity-70">
              Wir foerdern Deine Talente und staerken Deine Persoenlichkeit.
              Wir gestalten Deine Zukunft mit Dir.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">
              Schnellzugriff
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: "Anmeldung Klasse 5", href: "/unsere-schule/anmeldung" },
                { label: "Oberstufe", href: "/unsere-schule/oberstufe" },
                { label: "Profilprojekte", href: "/unsere-schule/profilprojekte" },
                { label: "Aktuelles", href: "/aktuelles" },
                { label: "Termine", href: "/termine" },
                { label: "Downloads", href: "/downloads" },
                { label: "Faecher & AGs", href: "/schulleben/faecher-ags" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-70 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">
              Kontakt
            </h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                <span className="text-sm opacity-70">
                  Kuester-Meyer-Platz 2, 32756 Detmold
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 opacity-60" />
                <a href="tel:0523199260" className="text-sm opacity-70 hover:opacity-100">
                  05231 - 99260
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 opacity-60" />
                <a
                  href="mailto:sekretariat@grabbe.nrw.schule"
                  className="text-sm opacity-70 hover:opacity-100"
                >
                  sekretariat@grabbe.nrw.schule
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">
              Rechtliches
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/impressum" className="text-sm opacity-70 hover:opacity-100">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-sm opacity-70 hover:opacity-100">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
          <p className="text-xs opacity-50">
            Christian-Dietrich-Grabbe-Gymnasium Detmold
          </p>
          <p className="text-xs opacity-50">
            Verantwortlich: Dr. Claus Hilbing und Oliver Sprenger
          </p>
        </div>
      </div>
    </footer>
  )
}
