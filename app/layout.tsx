import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { GeistPixelSquare } from "geist/font/pixel"
import { Instrument_Serif, Josefin_Sans } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import {
  getSEOSettings,
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  JsonLd,
} from "@/lib/seo"
import { getDesignSettings, DESIGN_DEFAULTS } from "@/lib/settings"
import type { DesignSettings } from "@/lib/settings"
import { tailwindToHex } from "@/lib/design-settings"
import "./globals.css"

const _instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
})

const _josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin-sans",
})

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings()
  const homepageTitle = `${seo.homepageTitlePrefix}${seo.titleSeparator}${seo.titleSuffix}`
  const description = seo.homepageDescription

  return {
    title: {
      default: homepageTitle,
      template: `%s${seo.titleSeparator}${seo.titleSuffix}`,
    },
    description,
    metadataBase: new URL(seo.siteUrl),
    alternates: { canonical: "/" },
    openGraph: {
      title: homepageTitle,
      description,
      type: "website",
      locale: "de_DE",
      siteName: seo.siteName,
      url: seo.siteUrl,
      ...(seo.ogImage ? { images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.siteName }] } : {}),
    },
    twitter: {
      card: seo.ogImage ? "summary_large_image" : "summary",
      title: homepageTitle,
      description,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    robots: seo.isPreview
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  }
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
}

// ---------------------------------------------------------------------------
// Build the CSS custom-property overrides + Google Fonts <link> URLs
// ---------------------------------------------------------------------------
function buildDesignOverrides(ds: DesignSettings) {
  const style: Record<string, string> = {}
  const googleFonts: string[] = []

  // Fonts already bundled via next/font or @font-face — skip Google Fonts loading
  const bundledFonts = new Set(["Instrument Serif", "Josefin Sans", "Geist", "Futura LT"])

  // Fonts — only override when not 'default'
  if (ds.fonts.heading !== "default") {
    style["--font-heading"] = `'${ds.fonts.heading}'`
    if (!bundledFonts.has(ds.fonts.heading)) googleFonts.push(ds.fonts.heading)
  }
  if (ds.fonts.body !== "default") {
    style["--font-body"] = `'${ds.fonts.body}'`
    if (!bundledFonts.has(ds.fonts.body)) googleFonts.push(ds.fonts.body)
  }
  if (ds.fonts.accent !== "default") {
    style["--font-accent"] = `'${ds.fonts.accent}'`
    if (!bundledFonts.has(ds.fonts.accent)) googleFonts.push(ds.fonts.accent)
  }

  // Primary color — convert Tailwind key to hex, then to HSL for the existing CSS variable system
  if (ds.colors.primary !== DESIGN_DEFAULTS.colors.primary) {
    const hex = tailwindToHex(ds.colors.primary)
    const hsl = hexToHSL(hex)
    if (hsl) style["--primary"] = hsl
  }

  // Subject accent colours (resolve Tailwind keys to hex)
  if (ds.colors.subjectNaturwissenschaften !== DESIGN_DEFAULTS.colors.subjectNaturwissenschaften) {
    style["--color-subject-nawi"] = tailwindToHex(ds.colors.subjectNaturwissenschaften)
  }
  if (ds.colors.subjectMusik !== DESIGN_DEFAULTS.colors.subjectMusik) {
    style["--color-subject-musik"] = tailwindToHex(ds.colors.subjectMusik)
  }
  if (ds.colors.subjectKunst !== DESIGN_DEFAULTS.colors.subjectKunst) {
    style["--color-subject-kunst"] = tailwindToHex(ds.colors.subjectKunst)
  }
  if (ds.colors.subjectSport !== DESIGN_DEFAULTS.colors.subjectSport) {
    style["--color-subject-sport"] = tailwindToHex(ds.colors.subjectSport)
  }

  // Build Google Fonts URL (deduped)
  const unique = [...new Set(googleFonts)]
  const fontsUrl =
    unique.length > 0
      ? `https://fonts.googleapis.com/css2?${unique
          .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
          .join("&")}&display=swap`
      : null

  return { style, fontsUrl }
}

/** Convert a hex colour (#rrggbb) to the "H S% L%" format used by the CSS vars */
function hexToHSL(hex: string): string | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!match) return null
  const r = parseInt(match[1], 16) / 255
  const g = parseInt(match[2], 16) / 255
  const b = parseInt(match[3], 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const seo = await getSEOSettings()
  const orgJsonLd = generateOrganizationJsonLd(seo)
  const siteJsonLd = generateWebSiteJsonLd(seo)
  const ds = await getDesignSettings()
  const { style, fontsUrl } = buildDesignOverrides(ds)

  return (
    <html
      lang="de"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} ${_instrumentSerif.variable} ${_josefinSans.variable}`}
      style={Object.keys(style).length > 0 ? (style as React.CSSProperties) : undefined}
    >
      <head>
        {fontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={fontsUrl} />
          </>
        )}
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={orgJsonLd} />
        <JsonLd data={siteJsonLd} />
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
