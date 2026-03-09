"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Save, Loader2, Camera, User, Lock, Mail, Shield, Github, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { usePermissions } from "@/components/cms/permissions-context"

/* ─────────── Password strength indicator ─────────── */
function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }), [password])

  const passed = Object.values(checks).filter(Boolean).length
  const strength = passed <= 2 ? "Schwach" : passed <= 3 ? "Mittel" : passed <= 4 ? "Gut" : "Stark"
  const color = passed <= 2 ? "bg-destructive" : passed <= 3 ? "bg-amber-500" : passed <= 4 ? "bg-primary" : "bg-green-500"

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= passed ? color : "bg-muted"}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Stärke: {strength}</p>
      <ul className="space-y-0.5 text-xs">
        <li className={checks.length ? "text-green-600" : "text-muted-foreground"}>
          {checks.length ? "✓" : "○"} Mindestens 8 Zeichen
        </li>
        <li className={checks.uppercase ? "text-green-600" : "text-muted-foreground"}>
          {checks.uppercase ? "✓" : "○"} Großbuchstabe
        </li>
        <li className={checks.lowercase ? "text-green-600" : "text-muted-foreground"}>
          {checks.lowercase ? "✓" : "○"} Kleinbuchstabe
        </li>
        <li className={checks.number ? "text-green-600" : "text-muted-foreground"}>
          {checks.number ? "✓" : "○"} Zahl
        </li>
        <li className={checks.special ? "text-green-600" : "text-muted-foreground"}>
          {checks.special ? "✓" : "○"} Sonderzeichen
        </li>
      </ul>
    </div>
  )
}

/* ─────────── Main page component ─────────── */
export default function ProfilPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { roleSlugs } = usePermissions()
  const isCurrentAdmin = roleSlugs.includes("administrator")

  /* ── Profile state ── */
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [title, setTitle] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  /* ── Password change state ── */
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  /* ── Email change state (admin only) ── */
  const [newEmail, setNewEmail] = useState("")
  const [changingEmail, setChangingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  /* ── MFA state ── */
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaSetupMode, setMfaSetupMode] = useState(false)
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null)
  const [mfaSecret, setMfaSecret] = useState<string | null>(null)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaVerifyCode, setMfaVerifyCode] = useState("")
  const [mfaVerifying, setMfaVerifying] = useState(false)
  const [mfaDisabling, setMfaDisabling] = useState(false)

  /* ── OAuth linking state ── */
  const [linkedProviders, setLinkedProviders] = useState<string[]>([])

  const isPasswordValid = useMemo(() => {
    if (newPassword.length < 8) return false
    if (!/[A-Z]/.test(newPassword)) return false
    if (!/[a-z]/.test(newPassword)) return false
    if (!/\d/.test(newPassword)) return false
    if (!/[^A-Za-z0-9]/.test(newPassword)) return false
    if (newPassword !== confirmPassword) return false
    return true
  }, [newPassword, confirmPassword])

  /* ── Load profile ── */
  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setEmail(user.email || "")

    // Check linked identities
    const identityProviders = user.identities?.map((i) => i.provider).filter((p) => p !== "email") || []
    setLinkedProviders(identityProviders)

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

  /* ── Load MFA status ── */
  const loadMfaStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) return
      const totpFactors = data.totp || []
      const verifiedFactor = totpFactors.find((f) => f.status === "verified")
      if (verifiedFactor) {
        setMfaEnabled(true)
        setMfaFactorId(verifiedFactor.id)
      } else {
        setMfaEnabled(false)
        setMfaFactorId(null)
      }
    } catch {
      // MFA may not be enabled on Supabase instance
    }
  }, [supabase])

  useEffect(() => {
    loadProfile()
    loadMfaStatus()
  }, [loadProfile, loadMfaStatus])

  /* ── Save profile ── */
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, title }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler beim Speichern")
      toast.success("Profil erfolgreich gespeichert!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setSaving(false)
    }
  }

  /* ── Avatar upload ── */
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
          "image/jpeg", quality
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
    try {
      const compressed = await compressImage(file, 400, 0.8)
      const compressedFile = new File([compressed], "avatar.jpg", { type: "image/jpeg" })
      const formData = new FormData()
      formData.append("avatar", compressedFile)
      const res = await fetch("/api/user-profile", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload fehlgeschlagen")
      setAvatarUrl(data.avatar_url)
      toast.success("Profilbild aktualisiert!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload-Fehler")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  /* ── Change password ── */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid || !currentPassword) return

    setChangingPassword(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler beim Ändern des Passworts")

      toast.success("Passwort erfolgreich geändert!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Ändern des Passworts")
    } finally {
      setChangingPassword(false)
    }
  }

  /* ── Change email (admin only) ── */
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail) return

    setChangingEmail(true)
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler")

      setEmailSent(true)
      toast.success("Bestätigungsmail wurde an die neue Adresse gesendet!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Ändern der E-Mail")
    } finally {
      setChangingEmail(false)
    }
  }

  /* ── MFA Setup ── */
  const handleEnrollMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      })
      if (error) throw error

      setMfaQrCode(data.totp.qr_code)
      setMfaSecret(data.totp.secret)
      setMfaFactorId(data.id)
      setMfaSetupMode(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "MFA konnte nicht eingerichtet werden.")
    }
  }

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaFactorId || mfaVerifyCode.length !== 6) return

    setMfaVerifying(true)
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaVerifyCode,
      })
      if (verifyError) throw verifyError

      setMfaEnabled(true)
      setMfaSetupMode(false)
      setMfaVerifyCode("")
      setMfaQrCode(null)
      setMfaSecret(null)
      toast.success("Zwei-Faktor-Authentifizierung erfolgreich aktiviert!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code ist ungültig.")
    } finally {
      setMfaVerifying(false)
    }
  }

  const handleDisableMfa = async () => {
    if (!mfaFactorId) return
    setMfaDisabling(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId })
      if (error) throw error

      setMfaEnabled(false)
      setMfaFactorId(null)
      toast.success("Zwei-Faktor-Authentifizierung deaktiviert.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "MFA konnte nicht deaktiviert werden.")
    } finally {
      setMfaDisabling(false)
    }
  }

  /* ── OAuth linking ── */
  const handleLinkProvider = async (provider: "github" | "google" | "azure") => {
    try {
      const { data, error } = await supabase.auth.linkIdentity({ provider })
      if (error) throw error
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Verknüpfung mit ${provider} fehlgeschlagen.`)
    }
  }

  const handleUnlinkProvider = async (provider: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const identity = user.identities?.find((i) => i.provider === provider)
      if (!identity) {
        toast.error("Verknüpfung nicht gefunden.")
        return
      }

      const { error } = await supabase.auth.unlinkIdentity(identity)
      if (error) throw error

      setLinkedProviders((prev) => prev.filter((p) => p !== provider))
      toast.success(`${provider}-Verknüpfung aufgehoben.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verknüpfung konnte nicht aufgehoben werden.")
    }
  }

  const getInitials = () => {
    const f = firstName?.charAt(0)?.toUpperCase() || ""
    const l = lastName?.charAt(0)?.toUpperCase() || ""
    return f + l || email?.charAt(0)?.toUpperCase() || "?"
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Mein Profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">Persönliche Informationen, Sicherheit und Kontoeinstellungen</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* ─────────── Profile Section ─────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profilbild</CardTitle>
              <CardDescription>Wird bei Ihren Beiträgen angezeigt</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profilbild" className="h-32 w-32 rounded-full object-cover border-4 border-primary/10" />
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
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Klicken Sie auf das Kamera-Symbol, um ein neues Bild hochzuladen.
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

        {/* ─────────── Security Section ─────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Passwort ändern</CardTitle>
              </div>
              <CardDescription>Aktualisieren Sie Ihr Passwort regelmäßig für bessere Sicherheit</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPw">Aktuelles Passwort</Label>
                  <div className="relative">
                    <Input
                      id="currentPw"
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ihr aktuelles Passwort"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showCurrentPw ? "Passwort verbergen" : "Passwort anzeigen"}
                    >
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPw">Neues Passwort</Label>
                  <div className="relative">
                    <Input
                      id="newPw"
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mindestens 8 Zeichen"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showNewPw ? "Passwort verbergen" : "Passwort anzeigen"}
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={newPassword} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPw">Passwort bestätigen</Label>
                  <Input
                    id="confirmPw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort wiederholen"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">Die Passwörter stimmen nicht überein.</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={changingPassword || !isPasswordValid || !currentPassword}>
                  {changingPassword ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ändere...</>
                  ) : (
                    <><Lock className="mr-2 h-4 w-4" />Passwort ändern</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* MFA */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Zwei-Faktor-Authentifizierung</CardTitle>
              </div>
              <CardDescription>
                Schützen Sie Ihr Konto zusätzlich mit einer Authenticator-App
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mfaSetupMode ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-medium text-foreground mb-3">
                      Scannen Sie diesen QR-Code mit Ihrer Authenticator-App:
                    </p>
                    {mfaQrCode && (
                      <div className="flex justify-center mb-3">
                        <img src={mfaQrCode} alt="MFA QR Code" className="h-48 w-48 rounded-lg" />
                      </div>
                    )}
                    {mfaSecret && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Manueller Code:</p>
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono select-all">{mfaSecret}</code>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleVerifyMfa}>
                    <div className="grid gap-2">
                      <Label htmlFor="mfaCode">6-stelliger Code aus Ihrer App</Label>
                      <Input
                        id="mfaCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={mfaVerifyCode}
                        onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="text-center font-mono text-lg tracking-[0.3em]"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex-1"
                        onClick={() => {
                          setMfaSetupMode(false)
                          setMfaQrCode(null)
                          setMfaSecret(null)
                          setMfaVerifyCode("")
                        }}
                      >
                        Abbrechen
                      </Button>
                      <Button type="submit" className="flex-1" disabled={mfaVerifying || mfaVerifyCode.length !== 6}>
                        {mfaVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Bestätigen
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${mfaEnabled ? "bg-green-500/10" : "bg-muted"}`}>
                        <Shield className={`h-5 w-5 ${mfaEnabled ? "text-green-600" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{mfaEnabled ? "Aktiviert" : "Deaktiviert"}</p>
                        <p className="text-xs text-muted-foreground">
                          {mfaEnabled ? "Authenticator-App ist eingerichtet" : "Noch keine 2FA eingerichtet"}
                        </p>
                      </div>
                    </div>
                    {mfaEnabled && (
                      <Switch
                        checked={mfaEnabled}
                        onCheckedChange={() => handleDisableMfa()}
                        disabled={mfaDisabling}
                      />
                    )}
                  </div>
                  {!mfaEnabled && (
                    <Button onClick={handleEnrollMfa} className="w-full gap-2">
                      <Shield className="h-4 w-4" />
                      2FA einrichten
                    </Button>
                  )}
                  {mfaEnabled && (
                    <p className="text-xs text-muted-foreground">
                      <AlertTriangle className="inline h-3 w-3 mr-1 -mt-0.5" />
                      Das Deaktivieren von 2FA verringert die Sicherheit Ihres Kontos.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─────────── Email Change (Admin only) ─────────── */}
        {isCurrentAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">E-Mail-Adresse ändern</CardTitle>
              </div>
              <CardDescription>
                Ändern Sie Ihre E-Mail-Adresse. Eine Bestätigungsmail wird an die neue Adresse gesendet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bestätigungsmail gesendet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bitte prüfen Sie das Postfach von <strong>{newEmail}</strong> und klicken Sie auf den Bestätigungslink.
                      Sie müssen anschließend Ihr Passwort eingeben.
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setEmailSent(false); setNewEmail("") }}>
                      Erneut versuchen
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangeEmail} className="flex items-end gap-3">
                  <div className="flex-1 grid gap-2">
                    <Label htmlFor="newEmail">Neue E-Mail-Adresse</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="neue.email@schule.de"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={changingEmail || !newEmail}>
                    {changingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Bestätigen
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─────────── OAuth Linking (Beta) ─────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Verknüpfte Konten</CardTitle>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">Beta</span>
            </div>
            <CardDescription>
              Verknüpfen Sie externe Konten für schnelleren Login. Nach der Verknüpfung können Sie sich auch über diese Dienste anmelden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* GitHub */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24292f]/10">
                    <Github className="h-5 w-5 text-[#24292f] dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">GitHub</p>
                    <p className="text-xs text-muted-foreground">
                      {linkedProviders.includes("github") ? "Verknüpft" : "Nicht verknüpft"}
                    </p>
                  </div>
                </div>
                {linkedProviders.includes("github") ? (
                  <Button variant="outline" size="sm" onClick={() => handleUnlinkProvider("github")}>
                    Trennen
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleLinkProvider("github")}>
                    Verknüpfen
                  </Button>
                )}
              </div>

              {/* Microsoft */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a4ef]/10">
                    <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Microsoft</p>
                    <p className="text-xs text-muted-foreground">
                      {linkedProviders.includes("azure") ? "Verknüpft" : "Nicht verknüpft"}
                    </p>
                  </div>
                </div>
                {linkedProviders.includes("azure") ? (
                  <Button variant="outline" size="sm" onClick={() => handleUnlinkProvider("azure")}>
                    Trennen
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleLinkProvider("azure")}>
                    Verknüpfen
                  </Button>
                )}
              </div>

              {/* Google */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4285F4]/10">
                    <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Google</p>
                    <p className="text-xs text-muted-foreground">
                      {linkedProviders.includes("google") ? "Verknüpft" : "Nicht verknüpft"}
                    </p>
                  </div>
                </div>
                {linkedProviders.includes("google") ? (
                  <Button variant="outline" size="sm" onClick={() => handleUnlinkProvider("google")}>
                    Trennen
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleLinkProvider("google")}>
                    Verknüpfen
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
