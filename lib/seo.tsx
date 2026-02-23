import { getSettings } from "@/lib/settings"
import type { Metadata } from "next"

// ============================================================================
// Types
// ============================================================================

export interface SEOSettings {
  siteUrl: string
  siteName: string
  titleSeparator: string
  titleSuffix: string
  homepageTitlePrefix: string
  defaultDescription: string
  homepageDescription: string
  ogImage: string
  orgName: string
  orgLogo: string
  orgEmail: string
  orgPhone: string
  orgStreet: string
  orgCity: string
  orgZip: string
  orgCountry: string
  socialInstagram: string
  socialFacebook: string
  socialYoutube: string
  robotsTxt: string
  isPreview: boolean
}

export interface PageSEO {
  title: string
  description?: string
  ogImage?: string
  path: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  noIndex?: boolean
}

export interface BreadcrumbItem {
  name: string
  href: string
}

// ============================================================================
// Helpers
// ============================================================================

/** Resolve the canonical base URL – always returns a usable URL */
export function resolveBaseUrl(dbValue?: string): string {
  const fromDb = (dbValue || "").replace(/\/$/, "")
  if (fromDb) return fromDb

  const pubUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")
  if (pubUrl) return pubUrl

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProd) return `https://${vercelProd}`

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`

  return "http://localhost:3000"
}

/** True on non-production Vercel deploys (preview / dev) */
function isPreviewEnvironment(): boolean {
  const env = process.env.VERCEL_ENV
  if (!env) return false
  return env !== "production"
}

// ============================================================================
// Settings Loader
// ============================================================================

export async function getSEOSettings(): Promise<SEOSettings> {
  let s: Record<string, string> = {}
  try {
    s = await getSettings()
  } catch {
    // DB unavailable – degrade gracefully
  }
  return {
    siteUrl: resolveBaseUrl(s.seo_site_url),
    siteName: s.school_name || "Grabbe-Gymnasium Detmold",
    titleSeparator: s.seo_title_separator || " / ",
    titleSuffix: s.seo_title_suffix || "Grabbe-Gymnasium",
    homepageTitlePrefix: s.seo_homepage_title_prefix || "Start",
    defaultDescription:
      s.seo_default_description ||
      s.seo_description ||
      "Das Christian-Dietrich-Grabbe-Gymnasium in Detmold – Wir foerdern Deine Talente und staerken Deine Persoenlichkeit.",
    homepageDescription:
      s.seo_homepage_description ||
      s.seo_default_description ||
      s.seo_description ||
      "Das Christian-Dietrich-Grabbe-Gymnasium in Detmold – Wir foerdern Deine Talente und staerken Deine Persoenlichkeit.",
    ogImage: s.seo_og_image || "",
    orgName: s.seo_org_name || s.school_name || "Grabbe-Gymnasium Detmold",
    orgLogo: s.seo_org_logo || "",
    orgEmail: s.seo_org_email || s.contact_email || "",
    orgPhone: s.seo_org_phone || s.contact_phone || "",
    orgStreet: s.seo_org_address_street || "",
    orgCity: s.seo_org_address_city || "Detmold",
    orgZip: s.seo_org_address_zip || "",
    orgCountry: s.seo_org_address_country || "DE",
    socialInstagram: s.seo_social_instagram || "",
    socialFacebook: s.seo_social_facebook || "",
    socialYoutube: s.seo_social_youtube || "",
    robotsTxt:
      s.seo_robots_txt ||
      "User-agent: *\nAllow: /\nDisallow: /cms/\nDisallow: /auth/\nDisallow: /api/",
    isPreview: isPreviewEnvironment(),
  }
}

// ============================================================================
// Metadata Generator
// ============================================================================

export async function generatePageMetadata(page: PageSEO): Promise<Metadata> {
  const seo = await getSEOSettings()
  const description = page.description || seo.defaultDescription
  const ogImage = page.ogImage || seo.ogImage
  const shouldNoIndex = seo.isPreview || page.noIndex

  const metadata: Metadata = {
    title: page.title,
    description,
    alternates: { canonical: page.path },
    ...(shouldNoIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: `${page.title}${seo.titleSeparator}${seo.titleSuffix}`,
      description,
      type: page.type === "article" ? "article" : "website",
      locale: "de_DE",
      siteName: seo.siteName,
      url: `${seo.siteUrl}${page.path}`,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: page.title }] } : {}),
      ...(page.type === "article"
        ? {
            ...(page.publishedTime ? { publishedTime: page.publishedTime } : {}),
            ...(page.modifiedTime ? { modifiedTime: page.modifiedTime } : {}),
            ...(page.author ? { authors: [page.author] } : {}),
            ...(page.section ? { section: page.section } : {}),
          }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${page.title}${seo.titleSeparator}${seo.titleSuffix}`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }

  return metadata
}

// ============================================================================
// JSON-LD Generators
// ============================================================================

export function generateOrganizationJsonLd(seo: SEOSettings) {
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: seo.orgName,
    url: seo.siteUrl,
    ...(seo.orgLogo
      ? { logo: { "@type": "ImageObject", url: seo.orgLogo } }
      : {}),
    ...(seo.orgEmail ? { email: seo.orgEmail } : {}),
    ...(seo.orgPhone ? { telephone: seo.orgPhone } : {}),
  }

  if (seo.orgStreet || seo.orgCity || seo.orgZip) {
    org.address = {
      "@type": "PostalAddress",
      ...(seo.orgStreet ? { streetAddress: seo.orgStreet } : {}),
      ...(seo.orgCity ? { addressLocality: seo.orgCity } : {}),
      ...(seo.orgZip ? { postalCode: seo.orgZip } : {}),
      ...(seo.orgCountry ? { addressCountry: seo.orgCountry } : {}),
    }
  }

  const sameAs: string[] = []
  if (seo.socialInstagram) sameAs.push(seo.socialInstagram)
  if (seo.socialFacebook) sameAs.push(seo.socialFacebook)
  if (seo.socialYoutube) sameAs.push(seo.socialYoutube)
  if (sameAs.length > 0) org.sameAs = sameAs

  return org
}

export function generateWebSiteJsonLd(seo: SEOSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seo.siteName,
    url: seo.siteUrl,
    description: seo.defaultDescription,
    inLanguage: "de-DE",
    publisher: {
      "@type": "EducationalOrganization",
      name: seo.orgName,
    },
  }
}

export function generateArticleJsonLd(opts: {
  seo: SEOSettings
  title: string
  description: string
  url: string
  imageUrl?: string
  publishedTime: string
  modifiedTime: string
  authorName?: string
  section?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    ...(opts.imageUrl ? { image: opts.imageUrl } : {}),
    datePublished: opts.publishedTime,
    dateModified: opts.modifiedTime,
    inLanguage: "de-DE",
    ...(opts.authorName
      ? { author: { "@type": "Person", name: opts.authorName } }
      : { author: { "@type": "EducationalOrganization", name: opts.seo.orgName } }),
    publisher: {
      "@type": "EducationalOrganization",
      name: opts.seo.orgName,
      ...(opts.seo.orgLogo ? { logo: { "@type": "ImageObject", url: opts.seo.orgLogo } } : {}),
    },
    ...(opts.section ? { articleSection: opts.section } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
  }
}

export function generateBreadcrumbJsonLd(seo: SEOSettings, items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${seo.siteUrl}${item.href}`,
    })),
  }
}

export function generateWebPageJsonLd(opts: {
  seo: SEOSettings
  title: string
  description: string
  url: string
  breadcrumbs?: BreadcrumbItem[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.title,
    description: opts.description,
    url: opts.url,
    inLanguage: "de-DE",
    isPartOf: {
      "@type": "WebSite",
      name: opts.seo.siteName,
      url: opts.seo.siteUrl,
    },
    ...(opts.breadcrumbs
      ? { breadcrumb: generateBreadcrumbJsonLd(opts.seo, opts.breadcrumbs) }
      : {}),
  }
}

// ============================================================================
// JSON-LD Script Component Helper
// ============================================================================

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
