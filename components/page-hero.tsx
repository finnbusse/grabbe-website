import Image from "next/image"

// ─── ASCII art fallback generator ──────────────────────────────────────────

/** Simple DJB2-style hash for deterministic seeding */
function djb2(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i)
  }
  return h >>> 0
}

/**
 * Generate a small deterministic ASCII art grid for the decorative right panel.
 */
function generateAsciiGrid(seed: string, cols = 44, rows = 12): string {
  const h = djb2(seed)
  const glyphs = ["·", "·", "·", ":", ".", " ", " ", " ", " ", " ", "+", "×", "◇"]
  const lines: string[] = []
  for (let r = 0; r < rows; r++) {
    let line = ""
    for (let c = 0; c < cols; c++) {
      const v =
        Math.sin((h % 997) * 0.0031 + r * 0.71 + c * 0.29) *
        Math.cos((h % 503) * 0.0017 + r * 0.43 + c * 0.61)
      line += v > 0.38 ? glyphs[Math.abs(Math.floor(v * 100 + h)) % glyphs.length] : " "
    }
    lines.push(line)
  }
  return lines.join("\n")
}

// ─── Component ──────────────────────────────────────────────────────────────

interface PageHeroProps {
  /** Main heading displayed on the hero */
  title: string
  /** Optional small label shown above the title (uppercase tracking) */
  label?: string
  /** Optional subtitle shown below the title */
  subtitle?: string
  /**
   * Optional hero image URL shown in the decorative right panel instead of ASCII art.
   */
  imageUrl?: string
}

export function PageHero({ title, label, subtitle, imageUrl }: PageHeroProps) {
  const ascii = imageUrl ? "" : generateAsciiGrid(title)

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="flex items-center justify-between gap-8">

          {/* ── Left: text ── */}
          <div className="min-w-0 flex-1">
            {label && (
              <p className="mb-2 text-xs font-sub uppercase tracking-[0.22em] text-primary">
                {label}
              </p>
            )}
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* ── Right: decorative / hero image panel ── */}
          <div
            className="hidden sm:block shrink-0 w-64 md:w-80 lg:w-96 h-40 md:h-52 lg:h-60 rounded-2xl overflow-hidden relative shadow-sm"
            aria-hidden={!imageUrl}
          >
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="384px"
                />
                {/* Bottom fade blending into page background */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg,#bae6fd 0%,#38bdf8 50%,#7dd3fc 100%)",
                }}
              >
                {/* ASCII texture */}
                <pre className="absolute inset-0 p-3 font-mono text-[8px] leading-[1.4] text-sky-900/25 select-none overflow-hidden">
                  {ascii}
                </pre>
                {/* Subtle inner glow to the left so it fades into the page */}
                <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-transparent" />
                {/* Bottom fade blending into page background */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

