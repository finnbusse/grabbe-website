"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Save, Loader2, Camera, User } from "lucide-react"

export default function ProfilPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [title, setTitle] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setEmail(user.email || "")

    const res = await fetch("/api/user-profile")
    if (res.ok) {
      const data = await res.json()
      if (data.profile) {
        setFirstName(data.profile.first_name || "")
        setLastName(data.profile.last_name || "")
        setTitle(data.profile.title || "")
        setAvatarUrl(data.profile.avatar_url || null)
      }
    }
  }, [supabase])

  useEffect(() => { loadProfile() }, [loadProfile])

  const handleSave = async () => {
    setSaving(true)
    setMessage("")
    setError("")
    try {
      const res = await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, title }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler beim Speichern")
      setMessage("Profil erfolgreich gespeichert!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setSaving(false)
    }
  }

  const compressImage = (file: File, maxWidth: number, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement("canvas")
        let w = img.width
        let h = img.height
        if (w > maxWidth) {
          h = (h * maxWidth) / w
          w = maxWidth
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) { reject(new Error("Canvas not supported")); return }
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => { blob ? resolve(blob) : reject(new Error("Compression failed")) },
          "image/jpeg",
          quality
        )
      }
      img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"))
      img.src = url
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")
    try {
      // Compress to max 400px width, JPEG quality 0.8 (~100-300kb)
      const compressed = await compressImage(file, 400, 0.8)
      const compressedFile = new File([compressed], "avatar.jpg", { type: "image/jpeg" })

      const formData = new FormData()
      formData.append("avatar", compressedFile)

      const res = await fetch("/api/user-profile", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload fehlgeschlagen")
      setAvatarUrl(data.avatar_url)
      setMessage("Profilbild aktualisiert!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload-Fehler")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const getInitials = () => {
    const f = firstName?.charAt(0)?.toUpperCase() || ""
    const l = lastName?.charAt(0)?.toUpperCase() || ""
    return f + l || email?.charAt(0)?.toUpperCase() || "?"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mein Profil</h1>
        <p className="text-sm text-muted-foreground">Persönliche Informationen und Profilbild verwalten</p>
      </div>

      {message && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">{message}</div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profilbild</CardTitle>
            <CardDescription>Wird bei Ihren Beiträgen angezeigt</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profilbild"
                  className="h-32 w-32 rounded-full object-cover border-4 border-primary/10"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/5">
                  <span className="font-display text-4xl font-bold text-primary">{getInitials()}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Klicken Sie auf das Kamera-Symbol, um ein neues Bild hochzuladen. Große Bilder werden automatisch komprimiert.
            </p>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Persönliche Informationen</CardTitle>
            <CardDescription>Diese Daten werden als Autoreninfo bei Beiträgen angezeigt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Max" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Mustermann" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titel (optional)</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dr., Prof., etc." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{email}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                  {saving ? "Speichern..." : "Profil speichern"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
