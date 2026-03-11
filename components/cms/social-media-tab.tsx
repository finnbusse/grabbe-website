"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Key, Loader2, CheckCircle2, XCircle, Trash2,
  Send, RefreshCw, Image as ImageIcon, Link2,
  Hash, Eye, Globe, AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { getServiceDisplayName, maskToken } from "@/lib/buffer"
import { ImagePicker } from "./image-picker"

// ============================================================================
// Types
// ============================================================================

interface BufferChannel {
  id: string
  name: string
  displayName: string
  service: string
  avatar: string
  isQueuePaused: boolean
  organizationId?: string
}

// ============================================================================
// Section / Field helpers (matches system settings style)
// ============================================================================

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-5 px-6 py-5">{children}</div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

// ============================================================================
// Service icon color helper
// ============================================================================

function getServiceColor(service: string): string {
  const map: Record<string, string> = {
    facebook: "bg-blue-100 text-blue-700",
    twitter: "bg-sky-100 text-sky-700",
    linkedin: "bg-blue-100 text-blue-800",
    instagram: "bg-pink-100 text-pink-700",
    threads: "bg-gray-100 text-gray-800",
    pinterest: "bg-red-100 text-red-700",
    tiktok: "bg-gray-100 text-gray-900",
    youtube: "bg-red-100 text-red-600",
    mastodon: "bg-purple-100 text-purple-700",
    bluesky: "bg-sky-100 text-sky-600",
  }
  return map[service.toLowerCase()] ?? "bg-gray-100 text-gray-700"
}

// ============================================================================
// Social Media Tab Component
// ============================================================================

export default function SocialMediaTab() {
  // ---- API Key State ----
  const [keyStatus, setKeyStatus] = useState<{ configured: boolean; masked_key: string } | null>(null)
  const [keyLoading, setKeyLoading] = useState(true)
  const [newToken, setNewToken] = useState("")
  const [savingKey, setSavingKey] = useState(false)
  const [deletingKey, setDeletingKey] = useState(false)

  // ---- Channels State ----
  const [channels, setChannels] = useState<BufferChannel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [channelsError, setChannelsError] = useState<string | null>(null)

  // ---- Post Composer State ----
  const [postText, setPostText] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [publishNow, setPublishNow] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [scheduledAt, setScheduledAt] = useState("")
  const [publishing, setPublishing] = useState(false)
  const [showMediaSection, setShowMediaSection] = useState(false)

  // ---- Load API Key Status ----
  useEffect(() => {
    setKeyLoading(true)
    fetch("/api/social-media/key")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setKeyStatus(data)
      })
      .catch((err) => console.error("[SocialMedia] Failed to load key status:", err))
      .finally(() => setKeyLoading(false))
  }, [])

  // ---- Load Channels ----
  const loadChannels = useCallback(async () => {
    setChannelsLoading(true)
    setChannelsError(null)
    try {
      const res = await fetch("/api/social-media/profiles")
      const data = await res.json()
      if (res.ok && data.channels) {
        setChannels(data.channels)
        // Show errors from individual organizations if channels were found but some orgs failed
        if (data.errors && data.errors.length > 0 && data.channels.length > 0) {
          const orgNames = data.errors.map((e: { orgName: string; message: string }) => `${e.orgName}: ${e.message}`).join("; ")
          toast.error(`Einige Organisationen konnten nicht geladen werden: ${orgNames}`)
        }
        // Show detailed error if no channels were found
        if (data.channels.length === 0) {
          if (data.errors && data.errors.length > 0) {
            const details = data.errors.map((e: { orgName: string; message: string }) => e.message).join("; ")
            setChannelsError(`Keine Kanäle geladen. Buffer-API-Fehler: ${details}`)
          } else {
            setChannelsError("Keine Kanäle gefunden. Verbinde Social-Media-Kanäle in deinem Buffer-Dashboard.")
          }
        }
      } else {
        const errMsg = data.error || "Kanäle konnten nicht geladen werden."
        setChannelsError(errMsg)
        toast.error(errMsg)
      }
    } catch {
      const errMsg = "Netzwerkfehler beim Laden der Kanäle."
      setChannelsError(errMsg)
      toast.error(errMsg)
    } finally {
      setChannelsLoading(false)
    }
  }, [])

  // Load channels when key is configured
  useEffect(() => {
    if (keyStatus?.configured) {
      loadChannels()
    }
  }, [keyStatus?.configured, loadChannels])

  // ---- Save API Key ----
  const handleSaveKey = async () => {
    if (!newToken.trim()) return
    setSavingKey(true)
    try {
      const res = await fetch("/api/social-media/key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: newToken.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const orgName = data.buffer_account?.organization_name
        toast.success(
          orgName
            ? `Buffer-Token gespeichert und validiert. Organisation: ${orgName}`
            : "Buffer-Token gespeichert und validiert."
        )
        setKeyStatus({ configured: true, masked_key: maskToken(newToken.trim()) })
        setNewToken("")
        loadChannels()
      } else {
        toast.error(data.error || "Token konnte nicht gespeichert werden.")
      }
    } catch {
      toast.error("Netzwerkfehler beim Speichern des Tokens.")
    } finally {
      setSavingKey(false)
    }
  }

  // ---- Delete API Key ----
  const handleDeleteKey = async () => {
    setDeletingKey(true)
    try {
      const res = await fetch("/api/social-media/key", { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Buffer-Token wurde entfernt.")
        setKeyStatus({ configured: false, masked_key: "" })
        setChannels([])
        setSelectedChannels([])
      } else {
        toast.error(data.error || "Token konnte nicht entfernt werden.")
      }
    } catch {
      toast.error("Netzwerkfehler beim Entfernen des Tokens.")
    } finally {
      setDeletingKey(false)
    }
  }

  // ---- Toggle Channel Selection ----
  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    )
  }

  // ---- Publish Post ----
  const handlePublish = async () => {
    if (!postText.trim()) {
      toast.error("Bitte gib einen Post-Text ein.")
      return
    }
    if (selectedChannels.length === 0) {
      toast.error("Bitte wähle mindestens einen Kanal aus.")
      return
    }

    setPublishing(true)
    try {
      const body: Record<string, unknown> = {
        text: postText.trim(),
        channel_ids: selectedChannels,
        now: publishNow,
      }

      if (showMediaSection && imageUrl.trim()) {
        body.image_url = imageUrl.trim()
      }

      if (!publishNow && scheduledAt) {
        body.scheduled_at = new Date(scheduledAt).toISOString()
      }

      // Client-side timeout to prevent hanging forever if the server doesn't respond
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 30_000)

      let res: Response
      try {
        res = await fetch("/api/social-media/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timer)
      }

      const data = await res.json()
      if (res.ok && data.success) {
        const count = data.results?.filter((r: { success: boolean }) => r.success).length ?? 0
        toast.success(`Post erfolgreich erstellt! (${count} ${count !== 1 ? "Kanäle" : "Kanal"})`)
        // Reset form
        setPostText("")
        setImageUrl("")
        setShowMediaSection(false)
      } else {
        toast.error(data.error || data.message || "Post konnte nicht erstellt werden.")
      }
    } catch {
      toast.error("Netzwerk-/Timeout-Fehler beim Veröffentlichen. Bitte versuche es erneut.")
    } finally {
      setPublishing(false)
    }
  }

  // Character count
  const charCount = postText.length

  return (
    <div className="space-y-6 pb-12">
      {/* ================================================================== */}
      {/* SECTION 1: Buffer API Key Configuration                           */}
      {/* ================================================================== */}
      <Section
        icon={Key}
        title="Buffer API-Konfiguration"
        description="Verbinde Buffer, um Social-Media-Posts direkt aus dem CMS zu veröffentlichen."
      >
        {/* Status */}
        {keyLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Lade Status…
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-2 text-sm">
              {keyStatus?.configured ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Buffer-Verbindung:</span>
              <span className={keyStatus?.configured ? "text-green-600" : "text-red-500"}>
                {keyStatus?.configured ? "Verbunden ✓" : "Nicht verbunden ✗"}
              </span>
              {keyStatus?.configured && keyStatus.masked_key && (
                <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">
                  {keyStatus.masked_key}
                </code>
              )}
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="text-amber-800 dark:text-amber-200">
                <p className="font-medium">Hinweis zum Buffer Access Token</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Der Buffer Access Token läuft regelmäßig ab und muss dann erneuert werden.
                  Du findest deinen Token unter{" "}
                  <a
                    href="https://publish.buffer.com/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    publish.buffer.com/settings/api
                  </a>
                  {" "}→ Access Token. Der Token wird sicher in der Datenbank gespeichert
                  und ist nur für Administratoren sichtbar.
                </p>
              </div>
            </div>

            {/* Token input */}
            <Field
              label="Access Token"
              hint="Gib den Buffer Access Token ein. Er wird erst nach erfolgreicher Validierung über die Buffer-API gespeichert."
            >
              <div className="flex items-center gap-3">
                <Input
                  type="password"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  placeholder="1/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={handleSaveKey}
                  disabled={savingKey || !newToken.trim()}
                >
                  {savingKey ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="mr-2 h-4 w-4" />
                  )}
                  Speichern
                </Button>
                {keyStatus?.configured && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteKey}
                    disabled={deletingKey}
                    title="Token entfernen"
                    aria-label="Buffer-Token entfernen"
                  >
                    {deletingKey ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </Field>
          </div>
        )}
      </Section>

      {/* ================================================================== */}
      {/* SECTION 2: Connected Profiles                                     */}
      {/* ================================================================== */}
      {keyStatus?.configured && (
        <Section
          icon={Globe}
          title="Verbundene Kanäle"
          description="Social-Media-Kanäle, die über Buffer verbunden sind."
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {channels.length} {channels.length !== 1 ? "Kanäle" : "Kanal"} verbunden
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadChannels}
              disabled={channelsLoading}
            >
              {channelsLoading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              Aktualisieren
            </Button>
          </div>

          {channelsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Lade Kanäle…
            </div>
          ) : channelsError && channels.length === 0 ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm text-red-700 dark:text-red-300">{channelsError}</p>
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                Stelle sicher, dass dein Buffer Access Token gültig ist und Social-Media-Kanäle in deinem{" "}
                <a
                  href="https://publish.buffer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Buffer-Dashboard
                </a>{" "}
                verbunden sind.
              </p>
            </div>
          ) : channels.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Kanäle gefunden. Verbinde Social-Media-Kanäle in deinem{" "}
              <a
                href="https://publish.buffer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Buffer-Dashboard
              </a>.
            </p>
          ) : (
            <div className="grid gap-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
                >
                  {channel.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={channel.avatar}
                      alt={channel.displayName || channel.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Globe className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {channel.displayName || channel.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getServiceDisplayName(channel.service)}
                      {channel.isQueuePaused && " · Warteschlange pausiert"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getServiceColor(channel.service)}
                  >
                    {getServiceDisplayName(channel.service)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ================================================================== */}
      {/* SECTION 3: Post Playground / Composer                             */}
      {/* ================================================================== */}
      {keyStatus?.configured && channels.length > 0 && (
        <Section
          icon={Send}
          title="Post-Playground"
          description="Erstelle Test-Posts und veröffentliche sie über Buffer an deine verbundenen Kanäle."
        >
          {/* Channel selection */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Zielkanäle auswählen</Label>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => {
                const isSelected = selectedChannels.includes(channel.id)
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => toggleChannel(channel.id)}
                    className={`
                      inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors
                      ${isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }
                    `}
                  >
                    {channel.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={channel.avatar}
                        alt=""
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                    <span className="font-medium">{channel.displayName || channel.name}</span>
                    <Badge variant="secondary" className={`text-[10px] ${getServiceColor(channel.service)}`}>
                      {getServiceDisplayName(channel.service)}
                    </Badge>
                  </button>
                )
              })}
            </div>
            {selectedChannels.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Klicke auf Kanäle, um sie auszuwählen.
              </p>
            )}
          </div>

          <Separator />

          {/* Post text */}
          <Field
            label="Post-Text"
            hint={`${charCount} Zeichen · Unterstützt Hashtags (#), Erwähnungen (@) und Links.`}
          >
            <Textarea
              ref={textareaRef}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Was möchtest du teilen? Verwende #Hashtags, @Erwähnungen und Links…"
              className="min-h-[120px] resize-y"
              rows={5}
            />
          </Field>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMediaSection(!showMediaSection)}
              className={showMediaSection ? "border-primary text-primary" : ""}
            >
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Medien
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const el = textareaRef.current
                const cursorPos = el ? el.selectionStart : postText.length
                setPostText(postText.slice(0, cursorPos) + " #" + postText.slice(cursorPos))
              }}
            >
              <Hash className="mr-1.5 h-3.5 w-3.5" />
              Hashtag
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const el = textareaRef.current
                const cursorPos = el ? el.selectionStart : postText.length
                setPostText(postText.slice(0, cursorPos) + " https://" + postText.slice(cursorPos))
              }}
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Link
            </Button>
          </div>

          {/* Media section (collapsible) */}
          {showMediaSection && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Bild-Anhang
              </h3>
              <ImagePicker
                value={imageUrl || null}
                onChange={(url) => setImageUrl(url || "")}
                label="Bild für Social-Media-Post"
                hint="Wähle ein Bild aus der Mediathek oder lade ein neues hoch."
                aspectRatio="free"
              />
            </div>
          )}

          <Separator />

          {/* Scheduling */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={publishNow}
                onCheckedChange={setPublishNow}
                id="publish-now"
              />
              <Label htmlFor="publish-now" className="text-sm font-medium cursor-pointer">
                {publishNow ? "Sofort veröffentlichen" : "Zeitgesteuert veröffentlichen"}
              </Label>
            </div>
            {!publishNow && (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-auto"
              />
            )}
          </div>

          <Separator />

          {/* Preview & Publish */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>
                {selectedChannels.length} {selectedChannels.length !== 1 ? "Kanäle" : "Kanal"} ausgewählt
              </span>
              {!publishNow && scheduledAt && !isNaN(new Date(scheduledAt).getTime()) && (
                <span>
                  · Geplant für{" "}
                  {new Date(scheduledAt).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <Button
              onClick={handlePublish}
              disabled={publishing || !postText.trim() || selectedChannels.length === 0}
            >
              {publishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {publishNow ? "Jetzt veröffentlichen" : "Planen"}
            </Button>
          </div>
        </Section>
      )}
    </div>
  )
}
