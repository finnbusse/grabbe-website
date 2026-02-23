import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import Image from "next/image"
import { Palette, Music, Dumbbell, FlaskConical } from "lucide-react"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { generatePageMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Profilprojekte",
    description: "Die Profilprojekte in Kunst, Musik, Sport und NaWi am Grabbe-Gymnasium Detmold.",
    path: "/unsere-schule/profilprojekte",
  })
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

        {/* ═══ Section Header (blue mesh bg) ═══ */}
        <section className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">// Profilprojekte</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                Wähle Dein Profil
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl mx-auto">
                Am Grabbe-Gymnasium kannst Du Dich in einem von vier Profilprojekten entfalten. Jedes Profil bietet einzigartige Möglichkeiten, Deine Stärken zu entdecken und weiterzuentwickeln.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ Kunst (white bg) ═══ */}
        <section id="kunst" className="relative py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={profiles[0].image}
                  alt={profiles[0].title as string}
                  fill
                  className="object-cover"
                />
                <div className={`absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl ${profiles[0].color} text-background`}>
                  <Palette className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Profilprojekt</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {profiles[0].title}
                </h2>
                <div className="mt-6 space-y-4">
                  {profiles[0].content.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Musik (muted bg, reversed) ═══ */}
        <section id="musik" className="relative py-28 lg:py-36 bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <div className="lg:order-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={profiles[1].image}
                    alt={profiles[1].title as string}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl ${profiles[1].color} text-background`}>
                    <Music className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="lg:order-1">
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Profilprojekt</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {profiles[1].title}
                </h2>
                <div className="mt-6 space-y-4">
                  {profiles[1].content.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Sport (white bg) ═══ */}
        <section id="sport" className="relative py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={profiles[2].image}
                  alt={profiles[2].title as string}
                  fill
                  className="object-cover"
                />
                <div className={`absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl ${profiles[2].color} text-background`}>
                  <Dumbbell className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Profilprojekt</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {profiles[2].title}
                </h2>
                <div className="mt-6 space-y-4">
                  {profiles[2].content.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ NaWi (blue mesh bg, reversed) ═══ */}
        <section id="nawi" className="relative py-28 lg:py-36 bg-mesh-blue">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <div className="lg:order-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={profiles[3].image}
                    alt={profiles[3].title as string}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl ${profiles[3].color} text-background`}>
                    <FlaskConical className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="lg:order-1">
                <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">Profilprojekt</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                  {profiles[3].title}
                </h2>
                <div className="mt-6 space-y-4">
                  {profiles[3].content.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
