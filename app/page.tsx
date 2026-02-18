import { SiteLayout } from "@/components/site-layout"
import { HeroSection } from "@/components/hero-section"
import { WelcomeSection } from "@/components/welcome-section"
import { ProfileSection } from "@/components/profile-section"
import { NewsSection } from "@/components/news-section"
import { CalendarPreview } from "@/components/calendar-preview"
import { InfoSection } from "@/components/info-section"
import { NachmittagSection } from "@/components/nachmittag-section"
import { ContactSection } from "@/components/contact-section"
import { PartnersSection } from "@/components/partners-section"
import { createClient } from "@/lib/supabase/server"
import { PAGE_DEFAULTS, getMultiplePageContents } from "@/lib/page-content"

export default async function HomePage() {
  const supabase = await createClient()

  // Load posts, events, and all page content in parallel (single DB round-trip for content)
  const pageIds = [
    'homepage-hero', 'homepage-welcome', 'homepage-profiles',
    'homepage-info', 'homepage-nachmittag', 'homepage-partners',
    'homepage-news', 'homepage-calendar',
  ]

  const [postsRes, eventsRes, pageContents] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, slug, excerpt, category, image_url, author_name, event_date, created_at, user_id")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("events")
      .select("id, title, event_date, event_time, location, category")
      .eq("published", true)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(6),
    getMultiplePageContents(pageIds, PAGE_DEFAULTS),
  ])

  // Fetch author profiles for posts
  const posts = postsRes.data || []
  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))]
  let authorProfiles: Record<string, { first_name?: string; last_name?: string; title?: string; avatar_url?: string | null }> = {}
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, first_name, last_name, title, avatar_url")
      .in("user_id", userIds)
    if (profiles) {
      authorProfiles = Object.fromEntries(profiles.map(p => [p.user_id, p]))
    } else if (profilesError?.message?.includes("avatar_url")) {
      // avatar_url column doesn't exist yet - query without it
      const { data: fallbackProfiles } = await supabase
        .from("user_profiles")
        .select("user_id, first_name, last_name, title")
        .in("user_id", userIds)
      if (fallbackProfiles) {
        authorProfiles = Object.fromEntries(fallbackProfiles.map(p => [p.user_id, { ...p, avatar_url: null }]))
      }
    }
  }
  const postsWithProfiles = posts.map(p => ({
    ...p,
    author_profile: p.user_id ? authorProfiles[p.user_id] || null : null,
  }))

  return (
    <SiteLayout>
      <main>
        <HeroSection content={pageContents['homepage-hero']} />
        <WelcomeSection content={pageContents['homepage-welcome']} />
        <NewsSection posts={postsWithProfiles} content={pageContents['homepage-news']} />
        <ProfileSection content={pageContents['homepage-profiles']} />
        <CalendarPreview events={eventsRes.data || []} content={pageContents['homepage-calendar']} />
        <InfoSection content={pageContents['homepage-info']} />
        <NachmittagSection content={pageContents['homepage-nachmittag']} />
        <ContactSection />
        <PartnersSection content={pageContents['homepage-partners']} />
      </main>
    </SiteLayout>
  )
}
