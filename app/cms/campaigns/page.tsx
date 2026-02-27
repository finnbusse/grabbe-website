import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteCampaignButton } from "@/components/cms/delete-campaign-button"
import type { Campaign } from "@/lib/types/database.types"

export default async function CmsCampaignsPage() {
  const supabase = await createClient()
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })

  const campaignList = (campaigns || []) as unknown as Campaign[]
  const now = new Date()

  function getStatus(campaign: { is_active: boolean; starts_at: string | null; ends_at: string | null }) {
    if (!campaign.is_active) return { label: "Inaktiv", variant: "secondary" as const }
    const start = campaign.starts_at ? new Date(campaign.starts_at) : null
    const end = campaign.ends_at ? new Date(campaign.ends_at) : null
    if (start && start > now) return { label: "Geplant", variant: "outline" as const }
    if (end && end < now) return { label: "Abgelaufen", variant: "secondary" as const }
    return { label: "Aktiv", variant: "default" as const }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Kampagnen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verwalten Sie Popup-Kampagnen für die Startseite.
          </p>
        </div>
        <Button asChild>
          <Link href="/cms/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue Kampagne
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {campaignList.length > 0 ? (
          campaignList.map((campaign) => {
            const status = getStatus(campaign)
            return (
              <div
                key={campaign.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/cms/campaigns/${campaign.id}`}
                        className="font-display text-sm font-semibold text-card-foreground hover:text-primary"
                      >
                        {campaign.title}
                      </Link>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {campaign.headline}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/cms/campaigns/${campaign.id}`}>Bearbeiten</Link>
                  </Button>
                  <DeleteCampaignButton campaignId={campaign.id} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">Noch keine Kampagnen vorhanden.</p>
            <Button asChild className="mt-4">
              <Link href="/cms/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                Erste Kampagne erstellen
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
