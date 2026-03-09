"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react"
import { Suspense } from "react"

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
      <ul className="space-y-1 text-xs">
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

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const uid = searchParams.get("uid")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isValid = useMemo(() => {
    if (password.length < 8) return false
    if (!/[A-Z]/.test(password)) return false
    if (!/[a-z]/.test(password)) return false
    if (!/\d/.test(password)) return false
    if (!/[^A-Za-z0-9]/.test(password)) return false
    if (password !== confirmPassword) return false
    return true
  }, [password, confirmPassword])

  if (!token || !uid) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Ungültiger Link</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Dieser Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.
                  </p>
                </div>
                <Link href="/auth/passwort-vergessen">
                  <Button variant="outline" className="gap-2">
                    Neuen Link anfordern
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/passwort-zuruecksetzen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, uid, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten.")
        return
      }

      setSuccess(true)
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex flex-col items-center gap-2">
              <Image
                src="/images/grabbe-logo.svg"
                alt="Grabbe-Gymnasium Logo"
                width={64}
                height={64}
                className="h-16 w-16"
              />
              <span className="font-display text-lg font-semibold text-foreground">
                Grabbe-Gymnasium
              </span>
            </Link>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Passwort geändert</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Zum Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <Image
              src="/images/grabbe-logo.svg"
              alt="Grabbe-Gymnasium Logo"
              width={64}
              height={64}
              className="h-16 w-16"
            />
            <span className="font-display text-lg font-semibold text-foreground">
              Grabbe-Gymnasium
            </span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Neues Passwort</CardTitle>
            <CardDescription>
              Geben Sie Ihr neues Passwort ein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Neues Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mindestens 8 Zeichen"
                  />
                  <PasswordStrengthIndicator password={password} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort wiederholen"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">Die Passwörter stimmen nicht überein.</p>
                  )}
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || !isValid}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichere...
                    </>
                  ) : (
                    "Passwort speichern"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/auth/login" className="hover:text-foreground hover:underline">
            Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ResetForm />
    </Suspense>
  )
}
