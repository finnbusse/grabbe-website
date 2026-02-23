"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserPlus, Trash2, Shield, Mail, Pencil, X, Save, Loader2, Camera, Search, Users } from "lucide-react"

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

export default function UsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserEntry[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newFirstName, setNewFirstName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [newTitle, setNewTitle] = useState("")
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

  const loadUsers = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUser(user.id)
    const res = await fetch("/api/users")
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users || [])
    }
  }, [supabase])

  useEffect(() => { loadUsers() }, [loadUsers])

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter((u) => {
      const name = getDisplayName(u.profile, u.email).toLowerCase()
      const email = u.email.toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [users, searchQuery])

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
      setMessage("Benutzer erfolgreich erstellt. Der Nutzer erhält ggf. eine Bestätigungsmail.")
      setNewEmail("")
      setNewPassword("")
      setNewFirstName("")
      setNewLastName("")
      setNewTitle("")
      setShowForm(false)
      loadUsers()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Benutzerverwaltung</h1>
          <p className="text-sm text-muted-foreground">Lehrer-Accounts für das CMS erstellen und verwalten</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Neuer Benutzer
        </Button>
      </div>

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
              <div className="flex justify-end">
                <Button type="submit" disabled={creating}>{creating ? "Erstelle..." : "Account erstellen"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
                      {u.role && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <Shield className="h-2.5 w-2.5" />
                          {u.role}
                        </span>
                      )}
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
                  {u.id !== currentUser && (
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
  )
}
