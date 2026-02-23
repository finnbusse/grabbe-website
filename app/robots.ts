import { resolveBaseUrl } from "@/lib/seo"

export default function robots() {
  const baseUrl = resolveBaseUrl()
  const isPreview = process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development"

  if (isPreview) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cms/", "/auth/", "/api/", "/protected/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
