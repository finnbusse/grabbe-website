"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import type { Campaign, CampaignButton } from "@/lib/types/database.types"

interface CampaignPopupProps {
  campaigns: Campaign[]
}

function getOverlayClass(style: Campaign["overlay_style"]) {
  switch (style) {
    case "blur":
      return "bg-background/60 backdrop-blur-sm"
    case "dark":
      return "bg-black/60"
    case "light":
      return "bg-white/70"
    default:
      return "bg-background/60 backdrop-blur-sm"
  }
}

function getButtonClass(style: CampaignButton["style"]) {
  switch (style) {
    case "primary":
      return "text-white"
    case "secondary":
      return "bg-muted text-foreground hover:bg-muted/80"
    case "outline":
      return "border-2 bg-transparent hover:bg-muted/50"
    case "ghost":
      return "bg-transparent text-foreground hover:bg-muted/50"
    default:
      return "text-white"
  }
}

export function CampaignPopup({ campaigns }: CampaignPopupProps) {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    if (!campaigns || campaigns.length === 0) return

    // Find the first campaign that should be shown
    const now = new Date()
    const campaign = campaigns.find((c) => {
      if (!c.is_active) return false
      if (c.starts_at && new Date(c.starts_at) > now) return false
      if (c.ends_at && new Date(c.ends_at) < now) return false

      // Check localStorage for show_once
      if (c.show_once) {
        const dismissed = localStorage.getItem(`campaign_dismissed_${c.id}`)
        if (dismissed) return false
      }

      return true
    })

    if (campaign) {
      setActiveCampaign(campaign)
    }
  }, [campaigns])

  const handleClose = () => {
    if (activeCampaign?.show_once) {
      localStorage.setItem(`campaign_dismissed_${activeCampaign.id}`, "1")
    }
    setActiveCampaign(null)
  }

  if (!activeCampaign) return null

  const accentColor = activeCampaign.accent_color || "#2563eb"

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${getOverlayClass(activeCampaign.overlay_style)}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={activeCampaign.headline}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Schließen"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h2
            className="font-display text-2xl font-bold leading-tight sm:text-3xl"
            style={{ color: accentColor }}
          >
            {activeCampaign.headline}
          </h2>
          <div className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {activeCampaign.message}
          </div>
        </div>

        {/* Buttons */}
        {activeCampaign.buttons.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {activeCampaign.buttons.map((btn) => {
              const isPrimary = btn.style === "primary"
              const isOutline = btn.style === "outline"
              return (
                <a
                  key={btn.id}
                  href={btn.url}
                  target={btn.target}
                  rel={btn.target === "_blank" ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${getButtonClass(btn.style)}`}
                  style={{
                    ...(isPrimary ? { backgroundColor: accentColor } : {}),
                    ...(isOutline ? { borderColor: accentColor, color: accentColor } : {}),
                  }}
                  onClick={handleClose}
                >
                  {btn.label}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
