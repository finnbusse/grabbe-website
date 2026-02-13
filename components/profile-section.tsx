"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Palette, Music, Dumbbell, FlaskConical } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

const profiles = [
  {
    icon: Palette,
    title: "Kunstprojekt",
    slug: "kunst",
    image: "/images/profil-kunst.jpg",
    description:
      "Der Kunstunterricht am Grabbe-Gymnasium versteht sich als bedeutsamer Baustein im Aufbau zukunftsrelevanter Kompetenzen. Im Projektkurs \"Werkstatt Kunst\" arbeiten die Schueler:innen ohne Notendruck projektbezogen.",
    color: "from-blue-400 to-blue-600",
    tag: "KNS",
  },
  {
    icon: Music,
    title: "Musikprojekt",
    slug: "musik",
    image: "/images/profil-musik.jpg",
    description:
      "Im Musikprofil entdecken Schuelerinnen und Schueler ihre musikalischen Interessen, Kreativitaet und Begabungen - in Theorie und Praxis, individuell und im Miteinander. Teil des Schulversuchs \"NRW-Musikprofil-Schule\".",
    color: "from-sky-400 to-sky-600",
    tag: "MSK",
  },
  {
    icon: Dumbbell,
    title: "Sportprojekt",
    slug: "sport",
    image: "/images/profil-sport.jpg",
    description:
      "Als eine der wenigen ausgewaehlten \"Partnerschulen des Sports\" in NRW bietet das Grabbe-Gymnasium allen jugendlichen Talenten die Chance, Schulausbildung mit optimaler Sportfoerderung zu verbinden.",
    color: "from-cyan-400 to-cyan-600",
    tag: "SPR",
  },
  {
    icon: FlaskConical,
    title: "NaWi-Projekt",
    slug: "nawi",
    image: "/images/profil-nawi.jpg",
    description:
      "Im Profilprojekt NaWi entdecken die Schueler:innen die spannende Welt der Naturwissenschaften. Mit Neugier und Forschergeist gehen sie Phaenomenen aus Biologie, Chemie, Physik und Informatik auf den Grund.",
    color: "from-indigo-400 to-indigo-600",
    tag: "NWI",
  },
]

export function ProfileSection({ content }: { content?: Record<string, unknown> }) {
  const c = content || {}
  const sectionLabel = (c.label as string) || '// Profilprojekte'
  const sectionHeadline = (c.headline as string) || 'Waehle Dein Profil'
  const sectionDescription = (c.description as string) || 'Gestalte frei - ohne Leistungsdruck! Die Profilprojekte in Kunst, Musik, Sport oder NaWi bieten dir die Moeglichkeit, in einer gemischten Gruppe neue Lernwege zu entdecken.'

  const dynamicProfiles = profiles.map((p, i) => ({
    ...p,
    title: (c[`profile${i + 1}_title`] as string) || p.title,
    tag: (c[`profile${i + 1}_tag`] as string) || p.tag,
    description: (c[`profile${i + 1}_description`] as string) || p.description,
  }))
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden bg-mesh-blue">
      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-pixel text-sm uppercase tracking-[0.4em] text-primary">
              {sectionLabel}
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground">
              {sectionHeadline.includes('Dein') ? (
                <>{sectionHeadline.split('Dein')[0]}<span className="italic text-primary">Dein</span>{sectionHeadline.split('Dein')[1]}</>
              ) : sectionHeadline}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl mx-auto">
              {sectionDescription}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {dynamicProfiles.map((profile, i) => (
            <AnimateOnScroll key={profile.slug} animation="fade-in-up" delay={i * 0.12}>
              <Link
                href={`/unsere-schule/profilprojekte#${profile.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/[0.08] hover:border-primary/30 hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={profile.image}
                    alt={profile.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${profile.color} opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                  {/* Pixel font tag -- uses Geist Pixel Square */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="font-pixel text-base uppercase tracking-widest bg-foreground/80 text-background px-3 py-1.5 rounded-md backdrop-blur-sm">
                      {profile.tag}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 backdrop-blur-sm text-foreground transition-all group-hover:bg-primary group-hover:text-white group-hover:rotate-6">
                    <profile.icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-2xl text-card-foreground group-hover:text-primary transition-colors duration-300">
                      {profile.title}
                    </h3>
                    <span className="font-pixel text-xs uppercase tracking-widest text-muted-foreground/60 border border-border rounded px-2 py-0.5">
                      profil
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {profile.description}
                  </p>
                  <div className="mt-5 flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-primary">
                    Mehr erfahren
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
