import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Instrument_Serif, Josefin_Sans } from "next/font/google"
import { getSettings } from "@/lib/settings"
import "./globals.css"

const _geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const _geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

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
  const s = await getSettings()
  const title = s.seo_title || "Grabbe-Gymnasium Detmold"
  const description = s.seo_description || "Das Christian-Dietrich-Grabbe-Gymnasium in Detmold - Wir foerdern Deine Talente und staerken Deine Persoenlichkeit."
  return {
    title: {
      default: title,
      template: `%s | ${s.school_name || "Grabbe-Gymnasium"}`,
    },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "de_DE",
      ...(s.seo_og_image ? { images: [{ url: s.seo_og_image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    generator: "v0.app",
  }
}

export const viewport: Viewport = {
  themeColor: "#1e2a3d",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${_geistSans.variable} ${_geistMono.variable} ${_instrumentSerif.variable} ${_josefinSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
