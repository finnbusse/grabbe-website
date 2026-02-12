import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
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

export default async function HomePage() {
  const supabase = await createClient()

  const [postsRes, eventsRes] = await Promise.all([
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
  ])

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <WelcomeSection />
        <NewsSection posts={postsRes.data || []} />
        <ProfileSection />
        <CalendarPreview events={eventsRes.data || []} />
        <InfoSection />
        <NachmittagSection />
        <ContactSection />
        <PartnersSection />
      </main>
      <SiteFooter />
    </>
  )
}
