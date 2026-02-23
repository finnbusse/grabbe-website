"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DeletePostButton({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from("posts").delete().eq("id", postId)
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
      aria-label="Beitrag löschen"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
