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
    color: "from-rose-500/90 to-rose-700/90",
    tag: "KNS",
  },
  {
    icon: Music,
    title: "Musikprojekt",
    slug: "musik",
    image: "/images/profil-musik.jpg",
    description:
      "Im Musikprofil entdecken Schuelerinnen und Schueler ihre musikalischen Interessen, Kreativitaet und Begabungen - in Theorie und Praxis, individuell und im Miteinander. Teil des Schulversuchs \"NRW-Musikprofil-Schule\".",
    color: "from-amber-500/90 to-amber-700/90",
    tag: "MSK",
  },
  {
    icon: Dumbbell,
    title: "Sportprojekt",
    slug: "sport",
    image: "/images/profil-sport.jpg",
    description:
      "Als eine der wenigen ausgewaehlten \"Partnerschulen des Sports\" in NRW bietet das Grabbe-Gymnasium allen jugendlichen Talenten die Chance, Schulausbildung mit optimaler Sportfoerderung zu verbinden.",
    color: "from-emerald-500/90 to-emerald-700/90",
    tag: "SPR",
  },
  {
    icon: FlaskConical,
    title: "NaWi-Projekt",
    slug: "nawi",
    image: "/images/profil-nawi.jpg",
    description:
      "Im Profilprojekt NaWi entdecken die Schueler:innen die spannende Welt der Naturwissenschaften. Mit Neugier und Forschergeist gehen sie Phaenomenen aus Biologie, Chemie, Physik und Informatik auf den Grund.",
    color: "from-sky-500/90 to-sky-700/90",
    tag: "NWI",
  },
]

export function ProfileSection() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-accent/3 blur-[128px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-[96px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
              {"// "}Profilprojekte
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground">
              Waehle <span className="italic text-accent">Dein</span> Profil
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl mx-auto">
              Gestalte frei - ohne Leistungsdruck! Die Profilprojekte in Kunst, Musik, Sport oder NaWi
              bieten dir die Moeglichkeit, in einer gemischten Gruppe neue Lernwege zu entdecken.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {profiles.map((profile, i) => (
            <AnimateOnScroll key={profile.slug} animation="fade-in-up" delay={i * 0.12}>
              <Link
                href={`/unsere-schule/profilprojekte#${profile.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={profile.image}
                    alt={profile.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${profile.color} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                  {/* Pixel / mono tag */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest bg-foreground/80 text-background px-3 py-1.5 rounded-md backdrop-blur-sm">
                      {profile.tag}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 backdrop-blur-sm text-foreground transition-all group-hover:bg-accent group-hover:text-foreground group-hover:rotate-6">
                    <profile.icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-2xl text-card-foreground group-hover:text-accent transition-colors duration-300">
                    {profile.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {profile.description}
                  </p>
                  <div className="mt-5 flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-accent">
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
