"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function DeleteCampaignButton({ campaignId }: { campaignId: string }) {
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const supabase = createClient()
    const { error } = await supabase.from("campaigns").delete().eq("id", campaignId)
    if (error) {
      toast.error("Fehler beim Löschen")
      return
    }
    toast.success("Kampagne gelöscht")
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          Ja, löschen
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Abbrechen
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={() => setConfirming(true)}
      aria-label="Kampagne löschen"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
