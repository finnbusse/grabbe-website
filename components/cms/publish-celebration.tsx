"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PublishCelebrationProps {
  title: string
  url: string
  onClose: () => void
}

// ---------------------------------------------------------------------------
// CSS keyframes are defined inline using style tag
// ---------------------------------------------------------------------------

const confettiColors = [
  "hsl(215, 70%, 45%)",   // primary blue
  "hsl(142, 71%, 45%)",   // emerald
  "hsl(346, 77%, 50%)",   // rose
  "hsl(37, 90%, 51%)",    // amber
  "hsl(258, 90%, 66%)",   // violet
  "hsl(330, 81%, 60%)",   // pink
]

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PublishCelebration({ title, url, onClose }: PublishCelebrationProps) {
  const [copied, setCopied] = useState(false)
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number
    color: string
    left: number
    delay: number
    duration: number
    rotateEnd: number
    xDrift: number
    width: number
    height: number
    isCircle: boolean
  }>>([])

  useEffect(() => {
    // Generate confetti pieces once on mount
    const pieces = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      color: confettiColors[i % confettiColors.length],
      left: randomBetween(10, 90),
      delay: randomBetween(0, 0.5),
      duration: randomBetween(2, 3.5),
      rotateEnd: randomBetween(360, 720) * (Math.random() > 0.5 ? 1 : -1),
      xDrift: randomBetween(-40, 40),
      width: randomBetween(6, 10),
      height: randomBetween(6, 10),
      isCircle: Math.random() > 0.5,
    }))
    setConfettiPieces(pieces)
  }, [])

  const fullUrl = url.startsWith("http") ? url : `${typeof window !== "undefined" ? window.location.origin : ""}${url}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.left}%`,
                top: "-10px",
                width: `${piece.width}px`,
                height: `${piece.height}px`,
                backgroundColor: piece.color,
                borderRadius: piece.isCircle ? "50%" : "2px",
                animation: `confetti-fall ${piece.duration}s ease-in ${piece.delay}s forwards`,
                opacity: 0,
                ["--x-drift" as string]: `${piece.xDrift}px`,
                ["--rotate-end" as string]: `${piece.rotateEnd}deg`,
              }}
            />
          ))}
        </div>

        {/* Emoji */}
        <div className="mb-4 text-5xl animate-in zoom-in-50 duration-500">
          🎉
        </div>

        <h2 className="font-display text-2xl font-bold text-card-foreground">
          Seite veröffentlicht!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          &bdquo;{title}&ldquo; ist jetzt live und für alle Besucher sichtbar.
        </p>

        {/* URL box */}
        <div className="mt-5 flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2.5">
          <span className="flex-1 truncate text-sm font-mono text-muted-foreground">
            {fullUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="Link kopieren"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-xs"
          onClick={handleCopy}
        >
          {copied ? "✓ Kopiert!" : "Link kopieren"}
        </Button>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Zur Seite
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link href="/cms/seiten" onClick={onClose}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Zurück zum CMS
            </Link>
          </Button>
        </div>
      </div>

      {/* Confetti keyframes */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(400px) translateX(var(--x-drift, 0px)) rotate(var(--rotate-end, 360deg));
          }
        }
      `}</style>
    </div>
  )
}
