"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserPlus, Trash2, Shield, Mail, Pencil, X, Save, Loader2, Camera, Search, Users, ShieldCheck, FileStack, Send, RotateCcw, Clock } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { usePermissions } from "@/components/cms/permissions-context"
import type { CmsRole } from "@/lib/permissions-shared"

interface UserProfile {
  user_id: string
  first_name: string
  last_name: string
  title: string
  avatar_url: string | null
}

interface UserEntry {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  role: string | null
  profile: UserProfile | null
}

interface UserRoleAssignment {
  user_id: string
  role_id: string
  cms_roles: { slug: string; name: string } | null
}

interface PagePermEntry {
  page_type: "editable" | "cms"
  page_id: string
}

interface PendingInvitation {
  id: string
  email: string
  role_id: string | null
  expires_at: string
  created_at: string
  personal_message: string | null
  inviter_name: string | null
  cms_roles: { name: string } | null
}

function getInitials(profile: UserProfile | null, email: string) {
  if (profile?.first_name || profile?.last_name) {
    return (
      (profile.first_name?.charAt(0)?.toUpperCase() || "") +
      (profile.last_name?.charAt(0)?.toUpperCase() || "")
    )
  }
  return email?.charAt(0)?.toUpperCase() || "?"
}

function getDisplayName(profile: UserProfile | null, email: string) {
  if (profile?.first_name || profile?.last_name) {
    const parts = [profile.title, profile.first_name, profile.last_name].filter(Boolean)
    return parts.join(" ")
  }
  return email
}

function compressImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      let w = img.width
      let h = img.height
      if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) { reject(new Error("Canvas not supported")); return }
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => { blob ? resolve(blob) : reject(new Error("Compression failed")) },
        "image/jpeg", quality
      )
    }
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"))
    img.src = url
  })
}

// Known editable page IDs for the page permissions UI
const EDITABLE_PAGE_OPTIONS = [
  { id: "homepage-hero", label: "Startseite: Hero" },
  { id: "homepage-welcome", label: "Startseite: Willkommen" },
  { id: "homepage-profiles", label: "Startseite: Profilprojekte" },
  { id: "homepage-info", label: "Startseite: Info" },
  { id: "homepage-nachmittag", label: "Startseite: Nachmittag" },
  { id: "homepage-partners", label: "Startseite: Partner" },
  { id: "homepage-news", label: "Startseite: News" },
  { id: "homepage-calendar", label: "Startseite: Kalender" },
  { id: "erprobungsstufe", label: "Erprobungsstufe" },
  { id: "profilprojekte", label: "Profilprojekte" },
  { id: "oberstufe", label: "Oberstufe" },
  { id: "anmeldung", label: "Anmeldung" },
  { id: "faecher-ags", label: "Fächer & AGs" },
  { id: "nachmittag", label: "Nachmittag" },
  { id: "netzwerk", label: "Netzwerk" },
  { id: "kontakt", label: "Kontakt" },
  { id: "impressum", label: "Impressum" },
  { id: "datenschutz", label: "Datenschutz" },
]

export default function UsersPage() {
  const supabase = createClient()
  const { permissions, roleSlugs: currentRoleSlugs } = usePermissions()
  const isCurrentAdmin = currentRoleSlugs.includes("administrator")
  const isCurrentSchulleitung = currentRoleSlugs.includes("schulleitung")
  const canManageRoles = permissions.users.assignRoles

  const [users, setUsers] = useState<UserEntry[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newFirstName, setNewFirstName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newRoleId, setNewRoleId] = useState("")
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Invitation state
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRoleId, setInviteRoleId] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  // Role management state
  const [allRoles, setAllRoles] = useState<CmsRole[]>([])
  const [userRoleMap, setUserRoleMap] = useState<Record<string, string[]>>({}) // userId -> roleId[]
  const [roleEditingId, setRoleEditingId] = useState<string | null>(null)
  const [roleEditSelection, setRoleEditSelection] = useState<string[]>([])
  const [roleSaving, setRoleSaving] = useState(false)

  // Page permissions state
  const [pageEditingId, setPageEditingId] = useState<string | null>(null)
  const [pageEditSelection, setPageEditSelection] = useState<PagePermEntry[]>([])
  const [pageSaving, setPageSaving] = useState(false)
  const [cmsPages, setCmsPages] = useState<Array<{ id: string; title: string }>>([])

  const loadUsers = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUser(user.id)
    const res = await fetch("/api/users")
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users || [])
    }
  }, [supabase])

  const loadRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/roles")
      if (res.ok) {
        const data = await res.json()
        setAllRoles(data.roles || [])
      }
    } catch { /* roles table may not exist */ }
  }, [])

  const loadUserRoles = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("user_id, role_id")

      if (data) {
        const map: Record<string, string[]> = {}
        for (const row of data as Array<{ user_id: string; role_id: string }>) {
          if (!map[row.user_id]) map[row.user_id] = []
          map[row.user_id].push(row.role_id)
        }
        setUserRoleMap(map)
      }
    } catch { /* table may not exist */ }
  }, [supabase])

  const loadCmsPages = useCallback(async () => {
    try {
      const { data } = await supabase.from("pages").select("id, title").order("title")
      if (data) setCmsPages(data as Array<{ id: string; title: string }>)
    } catch { /* ok */ }
  }, [supabase])

  const loadInvitations = useCallback(async () => {
    if (!isCurrentAdmin) return
    try {
      const res = await fetch("/api/invitations")
      if (res.ok) {
        const data = await res.json()
        setPendingInvitations(data.invitations || [])
      }
    } catch { /* ok */ }
  }, [isCurrentAdmin])

  useEffect(() => {
    loadUsers()
    loadRoles()
    loadUserRoles()
    loadCmsPages()
    loadInvitations()
  }, [loadUsers, loadRoles, loadUserRoles, loadCmsPages, loadInvitations])

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter((u) => {
      const name = getDisplayName(u.profile, u.email).toLowerCase()
      const email = u.email.toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [users, searchQuery])

  function getRoleNames(userId: string): string[] {
    const roleIds = userRoleMap[userId] || []
    return roleIds
      .map((rid) => allRoles.find((r) => r.id === rid)?.name)
      .filter((n): n is string => !!n)
  }

  // Available roles for assignment (Schulleitung can't assign admin/schulleitung)
  const assignableRoles = useMemo(() => {
    if (isCurrentAdmin) return allRoles
    return allRoles.filter((r) => !["administrator", "schulleitung"].includes(r.slug))
  }, [allRoles, isCurrentAdmin])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setMessage("")
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          first_name: newFirstName,
          last_name: newLastName,
          title: newTitle,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler beim Erstellen")

      // Assign role if selected
      if (newRoleId && data.user?.id) {
        await fetch("/api/user-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user.id, roleIds: [newRoleId] }),
        })
      }

      setMessage("Benutzer erfolgreich erstellt. Der Nutzer erhält ggf. eine Bestätigungsmail.")
      setNewEmail("")
      setNewPassword("")
      setNewFirstName("")
      setNewLastName("")
      setNewTitle("")
      setNewRoleId("")
      setShowForm(false)
      loadUsers()
      loadUserRoles()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setCreating(false)
    }
  }

  function startEdit(u: UserEntry) {
    setEditingId(u.id)
    setEditFirstName(u.profile?.first_name || "")
    setEditLastName(u.profile?.last_name || "")
    setEditTitle(u.profile?.title || "")
  }

  async function saveEdit(userId: string) {
    setEditSaving(true)
    try {
      const res = await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          first_name: editFirstName,
          last_name: editLastName,
          title: editTitle,
        }),
      })
      if (!res.ok) throw new Error("Fehler beim Speichern")
      setEditingId(null)
      loadUsers()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler")
    } finally {
      setEditSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>, userId: string) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingId(userId)
    try {
      const compressed = await compressImage(file, 400, 0.8)
      const compressedFile = new File([compressed], "avatar.jpg", { type: "image/jpeg" })
      const formData = new FormData()
      formData.append("avatar", compressedFile)
      formData.append("userId", userId)
      const res = await fetch("/api/user-profile", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload fehlgeschlagen")
      loadUsers()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload-Fehler")
    } finally {
      setUploadingId(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Role editing
  function startRoleEdit(userId: string) {
    setRoleEditingId(userId)
    setRoleEditSelection(userRoleMap[userId] || [])
  }

  async function saveRoleEdit(userId: string) {
    setRoleSaving(true)
    try {
      const res = await fetch("/api/user-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleIds: roleEditSelection }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Fehler")
      }
      setRoleEditingId(null)
      loadUserRoles()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler beim Speichern der Rollen")
    } finally {
      setRoleSaving(false)
    }
  }

  // Page permissions editing
  async function startPageEdit(userId: string) {
    setPageEditingId(userId)
    try {
      const res = await fetch(`/api/user-page-permissions?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setPageEditSelection((data.permissions || []).map((p: PagePermEntry) => ({ page_type: p.page_type, page_id: p.page_id })))
      }
    } catch { /* ok */ }
  }

  async function savePageEdit(userId: string) {
    setPageSaving(true)
    try {
      const res = await fetch("/api/user-page-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pages: pageEditSelection }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Fehler")
      }
      setPageEditingId(null)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler beim Speichern der Seitenzuweisungen")
    } finally {
      setPageSaving(false)
    }
  }

  function togglePagePerm(pageType: "editable" | "cms", pageId: string) {
    setPageEditSelection((prev) => {
      const exists = prev.some((p) => p.page_type === pageType && p.page_id === pageId)
      if (exists) return prev.filter((p) => !(p.page_type === pageType && p.page_id === pageId))
      return [...prev, { page_type: pageType, page_id: pageId }]
    })
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteSending(true)
    setInviteError("")
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          roleId: inviteRoleId,
          personalMessage: inviteMessage || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler beim Senden")
      setInviteEmail("")
      setInviteRoleId("")
      setInviteMessage("")
      setInviteSheetOpen(false)
      setMessage("Einladung erfolgreich gesendet!")
      loadInvitations()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Fehler beim Senden der Einladung")
    } finally {
      setInviteSending(false)
    }
  }

  async function handleResendInvite(id: string) {
    setResendingId(id)
    try {
      const res = await fetch(`/api/invitations/${id}/resend`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler")
      setMessage("Einladung erneut gesendet!")
      loadInvitations()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler beim erneuten Senden")
    } finally {
      setResendingId(null)
    }
  }

  async function handleRevokeInvite(id: string) {
    if (!confirm("Einladung wirklich widerrufen?")) return
    setRevokingId(id)
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler")
      setMessage("Einladung widerrufen.")
      loadInvitations()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler beim Widerrufen")
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Benutzerverwaltung</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lehrer-Accounts für das CMS erstellen und verwalten</p>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentAdmin && (
            <Button onClick={() => setInviteSheetOpen(true)} variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Mitglied einladen
            </Button>
          )}
          {permissions.users.create && (
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Neuer Benutzer
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-6">

      {/* Invite Sheet */}
      <Sheet open={inviteSheetOpen} onOpenChange={setInviteSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Mitglied einladen</SheetTitle>
            <SheetDescription>Sende eine Einladung per E-Mail, um ein neues Teammitglied hinzuzufügen.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSendInvite} className="mt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="inviteEmail">E-Mail-Adresse</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="lehrer@schule.de"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inviteRole">Rolle zuweisen</Label>
              <select
                id="inviteRole"
                value={inviteRoleId}
                onChange={(e) => setInviteRoleId(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Rolle wählen...</option>
                {assignableRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inviteMsg">Persönliche Nachricht (optional)</Label>
              <Textarea
                id="inviteMsg"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value.slice(0, 200))}
                placeholder="Willkommen im Team..."
                rows={3}
                maxLength={200}
              />
              <span className="text-xs text-muted-foreground">{inviteMessage.length}/200</span>
            </div>
            {inviteError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{inviteError}</div>
            )}
            <Button type="submit" className="w-full gap-2" disabled={inviteSending || !inviteEmail || !inviteRoleId}>
              {inviteSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Einladung senden
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{users.length} Benutzer</span>
        </div>
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name oder E-Mail suchen..."
            className="pl-9"
          />
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">{message}</div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Neuen Lehrer-Account erstellen</CardTitle>
            <CardDescription>Der neue Benutzer kann sich nach der Erstellung im CMS anmelden.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input id="firstName" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="Max" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input id="lastName" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="Mustermann" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="userTitle">Titel (optional)</Label>
                  <Input id="userTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Dr., Prof." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="lehrer@schule.de" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input id="password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mind. 6 Zeichen" minLength={6} required />
                </div>
              </div>
              {canManageRoles && assignableRoles.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="newUserRole">Rolle zuweisen</Label>
                  <select
                    id="newUserRole"
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Keine Rolle</option>
                    {assignableRoles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={creating}>{creating ? "Erstelle..." : "Account erstellen"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {isCurrentAdmin && pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
            <Clock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
            Ausstehende Einladungen ({pendingInvitations.length})
          </h2>
          {pendingInvitations.map((inv) => {
            const isExpired = new Date(inv.expires_at) < new Date()
            return (
              <div key={inv.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{inv.email}</span>
                        {inv.cms_roles && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <Shield className="h-2.5 w-2.5" />
                            {inv.cms_roles.name}
                          </span>
                        )}
                        {isExpired && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">Abgelaufen</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {"Eingeladen: "}{new Date(inv.created_at).toLocaleDateString("de-DE")}
                        {inv.inviter_name && ` von ${inv.inviter_name}`}
                        {" · Gültig bis: "}{new Date(inv.expires_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Erneut senden"
                      disabled={resendingId === inv.id}
                      onClick={() => handleResendInvite(inv.id)}
                    >
                      {resendingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Widerrufen"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={revokingId === inv.id}
                      onClick={() => handleRevokeInvite(inv.id)}
                    >
                      {revokingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid gap-3">
        {filteredUsers.map((u) => (
          <div key={u.id} className="rounded-xl border border-border bg-card p-4">
            {editingId === u.id ? (
              /* Edit mode */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {u.profile?.avatar_url ? (
                      <img src={u.profile.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="font-display text-sm font-bold text-primary">{getInitials(u.profile, u.email)}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(`avatar-${u.id}`) as HTMLInputElement
                        input?.click()
                      }}
                      disabled={uploadingId === u.id}
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                    >
                      {uploadingId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                    </button>
                    <input id={`avatar-${u.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, u.id)} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{u.email}</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input placeholder="Vorname" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                  <Input placeholder="Nachname" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                  <Input placeholder="Titel (Dr., Prof.)" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="mr-1 h-3.5 w-3.5" />Abbrechen</Button>
                  <Button size="sm" onClick={() => saveEdit(u.id)} disabled={editSaving}>
                    {editSaving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                    Speichern
                  </Button>
                </div>
              </div>
            ) : roleEditingId === u.id ? (
              /* Role edit mode */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Rollen für {getDisplayName(u.profile, u.email)}</span>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {assignableRoles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roleEditSelection.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) setRoleEditSelection([...roleEditSelection, role.id])
                          else setRoleEditSelection(roleEditSelection.filter((id) => id !== role.id))
                        }}
                        className="rounded border-border"
                      />
                      {role.name}
                      {role.is_system && <span className="text-[10px] text-muted-foreground">(System)</span>}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setRoleEditingId(null)}>
                    <X className="mr-1 h-3.5 w-3.5" />Abbrechen
                  </Button>
                  <Button size="sm" onClick={() => saveRoleEdit(u.id)} disabled={roleSaving}>
                    {roleSaving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                    Rollen speichern
                  </Button>
                </div>
              </div>
            ) : pageEditingId === u.id ? (
              /* Page permissions edit mode */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileStack className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Seitenzuweisungen für {getDisplayName(u.profile, u.email)}</span>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Editierbare Seiten</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {EDITABLE_PAGE_OPTIONS.map((page) => (
                      <label key={page.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pageEditSelection.some((p) => p.page_type === "editable" && p.page_id === page.id)}
                          onChange={() => togglePagePerm("editable", page.id)}
                          className="rounded border-border"
                        />
                        {page.label}
                      </label>
                    ))}
                  </div>
                </div>
                {cmsPages.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">CMS-Seiten</p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {cmsPages.map((page) => (
                        <label key={page.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pageEditSelection.some((p) => p.page_type === "cms" && p.page_id === page.id)}
                            onChange={() => togglePagePerm("cms", page.id)}
                            className="rounded border-border"
                          />
                          {page.title}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPageEditingId(null)}>
                    <X className="mr-1 h-3.5 w-3.5" />Abbrechen
                  </Button>
                  <Button size="sm" onClick={() => savePageEdit(u.id)} disabled={pageSaving}>
                    {pageSaving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                    Seiten speichern
                  </Button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {u.profile?.avatar_url ? (
                    <img src={u.profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-display text-sm font-bold text-primary">{getInitials(u.profile, u.email)}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{getDisplayName(u.profile, u.email)}</span>
                      {u.id === currentUser && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Du</span>
                      )}
                      {getRoleNames(u.id).map((rn) => (
                        <span key={rn} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <Shield className="h-2.5 w-2.5" />
                          {rn}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{u.email}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {"Erstellt: "}{new Date(u.created_at).toLocaleDateString("de-DE")}
                      {u.last_sign_in_at && (" | Letzter Login: " + new Date(u.last_sign_in_at).toLocaleDateString("de-DE"))}
                      {!u.last_sign_in_at && (
                        <span className="ml-1 text-amber-500">| Noch nie angemeldet</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {canManageRoles && (
                    <Button variant="ghost" size="sm" title="Rollen bearbeiten" onClick={() => startRoleEdit(u.id)}>
                      <ShieldCheck className="h-4 w-4" />
                    </Button>
                  )}
                  {canManageRoles && (
                    <Button variant="ghost" size="sm" title="Seitenzuweisungen" onClick={() => startPageEdit(u.id)}>
                      <FileStack className="h-4 w-4" />
                    </Button>
                  )}
                  {u.id !== currentUser && permissions.users.delete && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={deletingId === u.id}
                      onClick={async () => {
                        if (!confirm(`"${getDisplayName(u.profile, u.email)}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return
                        setDeletingId(u.id)
                        setMessage("")
                        try {
                          const res = await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id }) })
                          const data = await res.json()
                          if (!res.ok) throw new Error(data.error || "Fehler beim Löschen")
                          setMessage("Benutzer erfolgreich gelöscht.")
                          loadUsers()
                        } catch (err) {
                          setMessage(err instanceof Error ? err.message : "Fehler beim Löschen")
                        } finally {
                          setDeletingId(null)
                        }
                      }}>
                      {deletingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {users.length > 0 && filteredUsers.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Keine Benutzer für &quot;{searchQuery}&quot; gefunden.</p>
        )}
        {users.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Noch keine weiteren Benutzer vorhanden.</p>
        )}
      </div>
      </div>
    </div>
  )
}