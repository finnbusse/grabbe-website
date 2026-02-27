"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Plus, CalendarDays, Eye, EyeOff, Tag as TagIcon, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DeletePostButton } from "@/components/cms/delete-post-button"
import { DeleteCampaignButton } from "@/components/cms/delete-campaign-button"
import type { Campaign, Tag } from "@/lib/types/database.types"

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  green:   { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  red:     { bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200" },
  yellow:  { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
  purple:  { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200" },
  pink:    { bg: "bg-pink-100",    text: "text-pink-700",    border: "border-pink-200" },
  orange:  { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200" },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700",    border: "border-teal-200" },
  gray:    { bg: "bg-gray-100",    text: "text-gray-700",    border: "border-gray-200" },
}

// ============================================================================
// Posts (Beiträge) Tab
// ============================================================================

interface PostItem {
  id: string
  title: string
  slug: string
  status: string
  event_date: string | null
  created_at: string
  category: string | null
}

function BeitraegeTab() {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [postTagsMap, setPostTagsMap] = useState<Map<string, Tag[]>>(new Map())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: postsData }, { data: allTags }, { data: postTags }] = await Promise.all([
        supabase.from("posts").select("id,title,slug,status,event_date,created_at,category").order("created_at", { ascending: false }),
        supabase.from("tags").select("*"),
        supabase.from("post_tags").select("*"),
      ])

      const tm = new Map<string, Tag>((allTags || []).map((t: Tag) => [t.id, t]))
      const ptm = new Map<string, Tag[]>()
      ;(postTags || []).forEach((pt: { post_id: string; tag_id: string }) => {
        const tag = tm.get(pt.tag_id)
        if (!tag) return
        const existing = ptm.get(pt.post_id) || []
        existing.push(tag)
        ptm.set(pt.post_id, existing)
      })

      setPosts((postsData as PostItem[]) || [])
      setPostTagsMap(ptm)
      setLoaded(true)
    }
    load()
  }, [])

  if (!loaded) {
    return <div className="py-12 text-center text-muted-foreground">Laden...</div>
  }

  return (
    <div className="space-y-3">
      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/cms/posts/${post.id}`}
                  className="font-display text-sm font-semibold text-card-foreground hover:text-primary"
                >
                  {post.title}
                </Link>
                {post.status === 'published' ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">
                    <Eye className="h-3 w-3" />
                    Veröffentlicht
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    <EyeOff className="h-3 w-3" />
                    Entwurf
                  </span>
                )}
                {(postTagsMap.get(post.id) || []).map((tag) => {
                  const c = TAG_COLORS[tag.color] || TAG_COLORS.blue
                  return (
                    <span key={tag.id} className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0 text-[10px] font-medium ${c.bg} ${c.text} ${c.border}`}>
                      <TagIcon className="h-2 w-2" />{tag.name}
                    </span>
                  )
                })}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">/aktuelles/{post.slug}</span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(post.event_date || post.created_at).toLocaleDateString("de-DE")}
                </span>
                {post.category && <span>{post.category}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/cms/posts/${post.id}`}>Bearbeiten</Link>
              </Button>
              <DeletePostButton postId={post.id} />
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">Noch keine Beiträge vorhanden.</p>
          <Button asChild className="mt-4">
            <Link href="/cms/posts/new">
              <Plus className="mr-2 h-4 w-4" />
              Ersten Beitrag erstellen
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Campaigns (Kampagnen) Tab
// ============================================================================

function KampagnenTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
      setCampaigns((data as unknown as Campaign[]) || [])
      setLoaded(true)
    }
    load()
  }, [])

  if (!loaded) {
    return <div className="py-12 text-center text-muted-foreground">Laden...</div>
  }

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
    <div className="space-y-3">
      {campaigns.length > 0 ? (
        campaigns.map((campaign) => {
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
  )
}

// ============================================================================
// Main Page Content
// ============================================================================

function PostsContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "beitraege"

  const handleTabChange = (value: string) => {
    window.history.replaceState(null, "", `?tab=${value}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News</h1>
          <p className="mt-1 text-sm text-muted-foreground">Beiträge und Popup-Kampagnen verwalten</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/cms/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Neue Kampagne
            </Link>
          </Button>
          <Button asChild>
            <Link href="/cms/posts/new">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Beitrag
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList>
          <TabsTrigger value="beitraege">Beiträge</TabsTrigger>
          <TabsTrigger value="kampagnen">Kampagnen</TabsTrigger>
        </TabsList>

        <TabsContent value="beitraege" className="mt-6">
          <BeitraegeTab />
        </TabsContent>

        <TabsContent value="kampagnen" className="mt-6">
          <KampagnenTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function CmsPostsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Laden...</div>}>
      <PostsContent />
    </Suspense>
  )
}
