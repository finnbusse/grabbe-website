import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import Image from "next/image"
import { Palette, Music, Dumbbell, FlaskConical } from "lucide-react"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"

export const metadata = {
  title: "Profilprojekte - Grabbe-Gymnasium Detmold",
  description: "Die Profilprojekte in Kunst, Musik, Sport und NaWi am Grabbe-Gymnasium Detmold.",
}

export default async function ProfilprojektePage() {
  const content = await getPageContent('profilprojekte', PAGE_DEFAULTS['profilprojekte'])

  const profiles = [
    {
      id: "kunst",
      icon: Palette,
      title: content.kunst_title,
      image: "/images/profil-kunst.jpg",
      color: "bg-rose-500",
      content: [
        content.kunst_p1,
        content.kunst_p2,
        content.kunst_p3,
        content.kunst_p4,
      ],
    },
    {
      id: "musik",
      icon: Music,
      title: content.musik_title,
      image: "/images/profil-musik.jpg",
      color: "bg-amber-500",
      content: [
        content.musik_p1,
        content.musik_p2,
        content.musik_p3,
        content.musik_p4,
      ],
    },
    {
      id: "sport",
      icon: Dumbbell,
      title: content.sport_title,
      image: "/images/profil-sport.jpg",
      color: "bg-emerald-500",
      content: [
        content.sport_p1,
        content.sport_p2,
        content.sport_p3,
      ],
    },
    {
      id: "nawi",
      icon: FlaskConical,
      title: content.nawi_title,
      image: "/images/profil-nawi.jpg",
      color: "bg-sky-500",
      content: [
        content.nawi_p1,
        content.nawi_p2,
        content.nawi_p3,
        content.nawi_p4,
      ],
    },
  ]

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={content.page_title as string}
          label={content.page_label as string}
          subtitle={content.page_subtitle as string}
          imageUrl={(content.hero_image_url as string) || undefined}
        />

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="space-y-24">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                id={profile.id}
                className={`grid items-start gap-10 lg:grid-cols-2 ${index % 2 === 1 ? "lg:direction-rtl" : ""}`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={profile.image}
                      alt={profile.title}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl ${profile.color} text-background`}>
                      <profile.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                    {profile.title}
                  </h2>
                  <div className="mt-6 space-y-4">
                    {profile.content.map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
