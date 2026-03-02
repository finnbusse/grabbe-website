import { resolveBaseUrl } from "@/lib/seo"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const baseUrl = resolveBaseUrl()
  const isPreview = process.env.VERCEL_ENV !== "production" && !!process.env.VERCEL_ENV

  if (isPreview) {
    return new Response("User-agent: *\nDisallow: /", {
      headers: { "Content-Type": "text/plain" },
    })
  }

  let content = `User-agent: *\nAllow: /\nDisallow: /cms/\nDisallow: /auth/\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml`

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "seo_robots_txt")
      .single()
    if (data?.value) {
      content = data.value
      if (!content.includes("Sitemap:")) {
        content += `\nSitemap: ${baseUrl}/sitemap.xml`
      }
    }
  } catch {
    /* use default */
  }

  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  })
}
