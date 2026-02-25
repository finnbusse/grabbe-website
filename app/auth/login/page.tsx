"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0)

  // Live countdown timer
  useEffect(() => {
    if (retryAfterSeconds <= 0) return
    const interval = setInterval(() => {
      setRetryAfterSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [retryAfterSeconds])

  const formatCountdown = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, "0")} Min.`
    return `${secs} Sek.`
  }, [])

  const isBlocked = retryAfterSeconds > 0

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBlocked) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.retryAfterSeconds && data.retryAfterSeconds > 0) {
        setRetryAfterSeconds(data.retryAfterSeconds)
      }

      if (data.remainingAttempts !== undefined) {
        setRemainingAttempts(data.remainingAttempts)
      }

      if (!res.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten.")
        return
      }

      // Set the session in the browser Supabase client
      if (data.session) {
        const supabase = createClient()
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }

      if (rememberMe) {
        localStorage.setItem("cms_remember_me", "true")
      } else {
        localStorage.removeItem("cms_remember_me")
      }

      // Reset rate limit UI state
      setRemainingAttempts(null)
      setRetryAfterSeconds(0)

      // Use full page navigation to ensure middleware properly picks up the new session cookies
      window.location.href = "/cms"
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground font-display">G</span>
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              Grabbe-Gymnasium
            </span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">CMS Login</CardTitle>
            <CardDescription>
              Melden Sie sich an, um Inhalte zu verwalten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@grabbe.nrw.schule"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isBlocked}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isBlocked}
                  />
                </div>
                {isBlocked && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-medium">Zugang vorübergehend gesperrt</p>
                    <p className="mt-1">
                      Bitte warten Sie {formatCountdown(retryAfterSeconds)}, bevor Sie es erneut versuchen.
                    </p>
                  </div>
                )}
                {error && !isBlocked && (
                  <div className="text-sm text-destructive">
                    <p>{error}</p>
                    {remainingAttempts !== null && remainingAttempts > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Verbleibende Versuche: {remainingAttempts}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                    disabled={isBlocked}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground cursor-pointer">
                    Angemeldet bleiben
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || isBlocked}>
                  {isBlocked
                    ? `Gesperrt (${formatCountdown(retryAfterSeconds)})`
                    : isLoading
                      ? "Anmelden..."
                      : "Anmelden"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            Zurück zur Website
          </Link>
        </p>
      </div>
    </div>
  )
}
