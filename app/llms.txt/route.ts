import { resolveBaseUrl } from "@/lib/seo"

export const revalidate = 86400

export async function GET() {
  const baseUrl = resolveBaseUrl()

  const content = `# Grabbe-Gymnasium Detmold
> Deine Talente. Deine Bühne. Dein Grabbe.

This is the official website for the Christian-Dietrich-Grabbe-Gymnasium in Detmold.
The site provides public information about the school's profile, subjects, curriculum, and recent news.

## Navigation
- /unsere-schule : General info about the school (profil, anmeldung, oberstufe, erprobungsstufe).
- /schulleben : Info about school life, projects, working groups, and afternoon care.
- /unterricht : Info about the subjects taught and curriculum.
- /aktuelles : Recent news and posts from the school.
- /termine : Calendar of upcoming events.

## API Notes
Most of the site is statically generated. For LLMs, consider fetching individual paths to read full texts on specific topics.

## Sitemap
Sitemap available at: ${baseUrl}/sitemap.xml
`

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
