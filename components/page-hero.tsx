import Image from "next/image"

// ─── ASCII art fallback generator ──────────────────────────────────────────

/** Simple DJB2-style hash for deterministic seeding */
function djb2(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i)
  }
  return h >>> 0 // unsigned 32-bit
}

/**
 * Generate a deterministic ASCII art grid from a seed string.
 * Returns a multi-line string rendered as monospace text.
 */
function generateAsciiGrid(seed: string, cols = 90, rows = 16): string {
  const h = djb2(seed)

  // Sparse character set: mostly dots / light symbols with occasional emphasis
  const glyphs = ["·", "·", "·", "·", ":", ".", " ", " ", " ", " ", " ", " ", "+", "×", "◇", "·"]

  const lines: string[] = []
  for (let r = 0; r < rows; r++) {
    let line = ""
    for (let c = 0; c < cols; c++) {
      // Smooth waves from two superimposed sinusoids — yields a natural-looking sparse field
      const v =
        Math.sin(((h % 997) * 0.0031 + r * 0.71 + c * 0.29)) *
        Math.cos(((h % 503) * 0.0017 + r * 0.43 + c * 0.61))
      line += v > 0.42 ? glyphs[Math.abs(Math.floor(v * 100 + h)) % glyphs.length] : " "
    }
    lines.push(line)
  }
  return lines.join("\n")
}

// Pre-built dark gradient palette — cycled by hash
const GRADIENTS = [
  "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)",
  "linear-gradient(135deg,#111827 0%,#1f2937 60%,#111827 100%)",
  "linear-gradient(135deg,#09090b 0%,#18181b 55%,#27272a 100%)",
  "linear-gradient(135deg,#0c0a09 0%,#1c1917 55%,#0c0a09 100%)",
  "linear-gradient(150deg,#0d0d0d 0%,#1a1a2e 55%,#0d0d0d 100%)",
]

// ─── Component ──────────────────────────────────────────────────────────────

interface PageHeroProps {
  /** Main heading displayed on the hero */
  title: string
  /** Optional small label shown above the title (uppercase tracking) */
  label?: string
  /** Optional subtitle shown below the title */
  subtitle?: string
  /**
   * Optional hero image URL.
   * When omitted an ASCII-art fallback pattern is generated deterministically
   * from the title so every page gets a unique, branded backdrop.
   */
  imageUrl?: string
}

export function PageHero({ title, label, subtitle, imageUrl }: PageHeroProps) {
  const gradient = GRADIENTS[djb2(title) % GRADIENTS.length]
  const ascii = imageUrl ? "" : generateAsciiGrid(title)

  return (
    <div className="relative w-full overflow-hidden rounded-b-[1.5rem] sm:rounded-b-[2rem] md:rounded-b-[3rem] h-44 sm:h-52 md:h-64">
      {/* ── Background ── */}
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="100vw" priority />
          {/* Gradient overlay so text is always readable on any image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/5" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: gradient }}>
          {/* ASCII art texture layer */}
          <pre
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden font-mono text-[9px] sm:text-[10px] leading-[1.45] text-white/[0.075] select-none pointer-events-none p-3"
          >
            {ascii}
          </pre>
          {/* Vignette so text area is darker at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
          {/* Subtle horizontal scan line to reinforce the monospace aesthetic */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom,transparent,transparent 13px,rgba(255,255,255,0.015) 13px,rgba(255,255,255,0.015) 14px)",
            }}
          />
        </div>
      )}

      {/* ── Text overlay ── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-8 md:p-10">
        {label && (
          <p
            className="mb-2 text-[10px] sm:text-xs font-sub uppercase tracking-[0.22em] text-white/60"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
          >
            {label}
          </p>
        )}
        <h1
          className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white leading-tight"
          style={{ textShadow: "0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.35)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-2 text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
