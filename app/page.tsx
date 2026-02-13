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
      .select("id, title, slug, excerpt, category, image_url, author_name, created_at")
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

  return (
    <SiteLayout>
      <main>
        <HeroSection content={pageContents['homepage-hero']} />
        <WelcomeSection content={pageContents['homepage-welcome']} />
        <NewsSection posts={postsRes.data || []} content={pageContents['homepage-news']} />
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
