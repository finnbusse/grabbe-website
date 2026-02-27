"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Check, Mail, Shield, UserRound, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InvitationData {
  id: string
  email: string
  role: { id: string; name: string } | null
  personalMessage: string | null
  inviterName: string | null
  expiresAt: string
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFrame><LoadingState /></OnboardingFrame>}>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [step, setStep] = useState(0)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [displayNameTouched, setDisplayNameTouched] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const firstNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) {
      setError("Kein Token angegeben")
      setLoading(false)
      return
    }

    async function validate() {
      try {
        const res = await fetch(`/api/onboarding?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Einladung ungültig")
        } else {
          setInvitation(data.invitation)
        }
      } catch {
        setError("Verbindungsfehler. Bitte versuche es erneut.")
      } finally {
        setLoading(false)
      }
    }

    validate()
  }, [token])

  useEffect(() => {
    if (!displayNameTouched && (firstName || lastName)) {
      setDisplayName(`${firstName} ${lastName}`.trim())
    }
  }, [firstName, lastName, displayNameTouched])

  useEffect(() => {
    if (step === 1 && firstNameRef.current) {
      setTimeout(() => firstNameRef.current?.focus(), 150)
    }
  }, [step])

  const goToStep = useCallback((nextStep: number) => {
    setSubmitError(null)
    setStep(nextStep)
  }, [])

  const pwChecks = {
    length: password.length >= 8,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  }

  const allPwValid = pwChecks.length && pwChecks.mixed && pwChecks.number && pwChecks.special
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const strength = [pwChecks.length, pwChecks.mixed, pwChecks.number, pwChecks.special].filter(Boolean).length
  const strengthLabel = strength <= 1 ? "Schwach" : strength === 2 ? "Mittel" : strength === 3 ? "Gut" : "Stark"

  async function handleSubmit() {
    if (!allPwValid || !passwordsMatch || !token) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          firstName,
          lastName,
          displayName: displayName || `${firstName} ${lastName}`.trim(),
          password,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || "Fehler beim Erstellen des Kontos")
        return
      }

      setDone(true)
      goToStep(3)
    } catch {
      setSubmitError("Verbindungsfehler. Bitte versuche es erneut.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <OnboardingFrame><LoadingState /></OnboardingFrame>

  if (error) {
    return (
      <OnboardingFrame>
        <Card className="rounded-xl border-border font-sans">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <CardTitle className="font-display">Einladung ungültig</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <a href="mailto:info@grabbe-gymnasium.de">Administrator kontaktieren</a>
            </Button>
          </CardContent>
        </Card>
      </OnboardingFrame>
    )
  }

  if (!invitation) return null

  return (
    <OnboardingFrame>
      <StepDots step={step} totalSteps={4} />

      {step === 0 && (
        <Card className="rounded-xl border-border font-sans">
          <CardHeader className="space-y-4">
            <CardTitle className="font-display text-2xl tracking-tight">Willkommen im Team</CardTitle>
            <CardDescription>Richte jetzt dein Konto ein. Das dauert nur wenige Minuten.</CardDescription>
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-sub text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {invitation.email}
              </span>
              {invitation.role && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-sub font-medium text-primary">
                  {invitation.role.name}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {invitation.personalMessage && (
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
                <p className="italic">„{invitation.personalMessage}“</p>
                {invitation.inviterName && (
                  <p className="mt-2 text-xs text-muted-foreground">— {invitation.inviterName}</p>
                )}
              </div>
            )}
            <Button onClick={() => goToStep(1)} className="w-full">Los geht’s</Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="rounded-xl border-border font-sans">
          <CardHeader>
            <CardTitle className="font-display text-xl">Persönliche Angaben</CardTitle>
            <CardDescription>Diese Daten werden für dein Profil im CMS verwendet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ob-firstname">Vorname *</Label>
                <Input
                  ref={firstNameRef}
                  id="ob-firstname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setTouched((s) => ({ ...s, firstName: true }))}
                  placeholder="Max"
                />
                {touched.firstName && !firstName && <p className="text-xs text-destructive">Vorname ist erforderlich.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-lastname">Nachname *</Label>
                <Input
                  id="ob-lastname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setTouched((s) => ({ ...s, lastName: true }))}
                  placeholder="Mustermann"
                />
                {touched.lastName && !lastName && <p className="text-xs text-destructive">Nachname ist erforderlich.</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ob-displayname">Anzeigename</Label>
              <Input
                id="ob-displayname"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  setDisplayNameTouched(true)
                }}
                placeholder="Max Mustermann"
              />
              <p className="text-xs text-muted-foreground">So wirst du im CMS angezeigt.</p>
            </div>
            <p className="text-xs text-muted-foreground">Profilbild und weitere Angaben kannst du später im Profil ergänzen.</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => goToStep(0)}>Zurück</Button>
              <Button onClick={() => goToStep(2)} disabled={!firstName || !lastName}>Weiter</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="rounded-xl border-border font-sans">
          <CardHeader>
            <CardTitle className="font-display text-xl">Passwort festlegen</CardTitle>
            <CardDescription>Wähle ein sicheres Passwort für dein neues Konto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ob-password">Passwort</Label>
              <div className="relative">
                <Input
                  id="ob-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sicheres Passwort"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(20, strength * 25)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">Passwortstärke: {strengthLabel}</p>
              </div>
              <div className="grid gap-1 text-xs text-muted-foreground">
                <PwCheck met={pwChecks.length} label="Mindestens 8 Zeichen" />
                <PwCheck met={pwChecks.mixed} label="Groß- und Kleinbuchstaben" />
                <PwCheck met={pwChecks.number} label="Mindestens eine Zahl" />
                <PwCheck met={pwChecks.special} label="Mindestens ein Sonderzeichen" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ob-confirm">Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="ob-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && <p className="text-xs text-destructive">Passwörter stimmen nicht überein.</p>}
            </div>

            {submitError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => goToStep(1)}>Zurück</Button>
              <Button onClick={handleSubmit} disabled={!allPwValid || !passwordsMatch || submitting}>
                {submitting ? "Konto wird erstellt..." : "Konto erstellen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && done && (
        <Card className="rounded-xl border-border font-sans">
          <CardHeader className="items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="font-display">Alles bereit</CardTitle>
            <CardDescription>Dein Konto wurde erfolgreich eingerichtet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/cms">Zum CMS</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </OnboardingFrame>
  )
}

function OnboardingFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-background px-4 py-10 font-sans text-foreground sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="h-4 w-4" />
          <span className="font-sub font-medium text-foreground">Grabbe-Gymnasium</span>
          <span>·</span>
          <span>Onboarding</span>
        </header>
        {children}
      </div>
    </main>
  )
}

function LoadingState() {
  return (
    <Card className="rounded-xl border-border">
      <CardHeader>
        <CardTitle>Einladung wird überprüft</CardTitle>
        <CardDescription>Bitte einen Moment Geduld…</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
      </CardContent>
    </Card>
  )
}

function StepDots({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition ${i <= step ? "bg-primary" : "bg-border"}`}
        />
      ))}
    </div>
  )
}

function PwCheck({ met, label }: { met: boolean; label: string }) {
  return (
    <p className={`inline-flex items-center gap-1.5 ${met ? "text-primary" : "text-muted-foreground"}`}>
      <Check className="h-3.5 w-3.5" />
      {label}
    </p>
  )
}
