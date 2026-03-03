"use client"

import { useState } from "react"
import { Share2, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareButtonProps {
  title: string
  text?: string
  url?: string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
    const shareData = { title, text: text || title, url: shareUrl }

    // Use native share if available (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // last resort
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      title="Seite teilen"
      aria-label="Seite teilen"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          Kopiert!
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Teilen
        </>
      )}
    </Button>
  )
}
