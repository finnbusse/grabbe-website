"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserPlus, Trash2, Shield, Mail, UserCircle } from "lucide-react"
import Image from "next/image"

interface UserEntry {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  user_profiles?: {
    first_name: string | null
    last_name: string | null
    title: string | null
    profile_image_url: string | null
  } | null
}

export default function UsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserEntry[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)

  const loadUsers = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUser(user.id)
    const res = await fetch("/api/users")
    if (res.ok) {
      const data = await res.json()
      const usersList = data.users || []
      
      // Fetch profiles for all users
      const userIds = usersList.map((u: UserEntry) => u.id)
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("*")
          .in("user_id", userIds)
        
        // Merge profiles with users
        const usersWithProfiles = usersList.map((u: UserEntry) => ({
          ...u,
          user_profiles: profiles?.find(p => p.user_id === u.id) || null
        }))
        setUsers(usersWithProfiles)
      } else {
        setUsers(usersList)
      }
    }
  }, [supabase])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setMessage("")
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler beim Erstellen")
      setMessage("Benutzer erfolgreich erstellt. Der Nutzer erhaelt eine Bestaetigungsmail.")
      setNewEmail("")
      setNewPassword("")
      setShowForm(false)
      loadUsers()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Benutzerverwaltung</h1>
          <p className="text-sm text-muted-foreground">Lehrer-Accounts fuer das CMS erstellen und verwalten</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Neuer Benutzer
        </Button>
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
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="lehrer@schule.de" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mind. 6 Zeichen" minLength={6} required />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={creating} className="w-full">{creating ? "Erstelle..." : "Account erstellen"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {users.map((u) => {
          const displayName = u.user_profiles?.first_name || u.user_profiles?.last_name
            ? `${u.user_profiles.title ? u.user_profiles.title + ' ' : ''}${u.user_profiles.first_name || ''} ${u.user_profiles.last_name || ''}`.trim()
            : u.email.split("@")[0]
          
          return (
            <div key={u.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                  {u.user_profiles?.profile_image_url ? (
                    <Image
                      src={u.user_profiles.profile_image_url}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{displayName}</span>
                    {u.id === currentUser && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Du</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{u.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {"Erstellt: "}{new Date(u.created_at).toLocaleDateString("de-DE")}
                    {u.last_sign_in_at && (" | Letzter Login: " + new Date(u.last_sign_in_at).toLocaleDateString("de-DE"))}
                  </p>
                </div>
              </div>
              {u.id !== currentUser && (
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={async () => {
                    if (!confirm("Diesen Benutzer wirklich loeschen?")) return
                    await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id }) })
                    loadUsers()
                  }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })}
        {users.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Noch keine weiteren Benutzer vorhanden.</p>
        )}
      </div>
    </div>
  )
}
