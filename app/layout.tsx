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
  const title = seo.siteName
  const description = seo.defaultDescription

  return {
    title: {
      default: title,
      template: `%s${seo.titleSeparator}${seo.titleSuffix}`,
    },
    description,
    metadataBase: seo.siteUrl ? new URL(seo.siteUrl) : undefined,
    ...(seo.siteUrl ? { alternates: { canonical: "/" } } : {}),
    openGraph: {
      title,
      description,
      type: "website",
      locale: "de_DE",
      siteName: seo.siteName,
      ...(seo.siteUrl ? { url: seo.siteUrl } : {}),
      ...(seo.ogImage ? { images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.siteName }] } : {}),
    },
    twitter: {
      card: seo.ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    robots: {
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const seo = await getSEOSettings()
  const orgJsonLd = generateOrganizationJsonLd(seo)
  const siteJsonLd = generateWebSiteJsonLd(seo)

  return (
    <html lang="de" className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} ${_instrumentSerif.variable} ${_josefinSans.variable}`}>
      <body className="font-sans antialiased">
        <JsonLd data={orgJsonLd} />
        <JsonLd data={siteJsonLd} />
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
