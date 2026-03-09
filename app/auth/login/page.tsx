"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback, useRef } from "react"
import { Github } from "lucide-react"

/** Calculate cooldown in seconds based on consecutive failure count.
 *  1→2s, 2→3s, 3→5s, 4→7s, 5→11s, 6→16s, 7→23s, 8+→30s */
function getCooldownSeconds(failCount: number): number {
  if (failCount <= 0) return 0
  return Math.min(Math.ceil(2 * Math.pow(1.5, failCount - 1)), 30)
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0)
  const failCountRef = useRef(0)

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState("")
  const [mfaVerifying, setMfaVerifying] = useState(false)
  // Hold session tokens in memory until MFA is verified to prevent session-based bypass
  const [pendingSession, setPendingSession] = useState<{ access_token: string; refresh_token: string } | null>(null)

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

      if (!res.ok) {
        // Increment local fail count and calculate progressive cooldown
        failCountRef.current += 1
        const localCooldown = getCooldownSeconds(failCountRef.current)
        // Use the larger of server-provided or local cooldown
        const serverCooldown = data.retryAfterSeconds ?? 0
        setRetryAfterSeconds(Math.max(localCooldown, serverCooldown))

        setError(data.error || "Ein Fehler ist aufgetreten.")
        return
      }

      // Reset on success
      failCountRef.current = 0

      // Set the session in the browser client (server already set cookies)
      if (data.session) {
        const supabase = createClient()
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })

        // Check if MFA is required — wrapped in try/catch so login
        // still succeeds if MFA check fails for any reason.
        try {
          const { data: factorsData } = await supabase.auth.mfa.listFactors()
          const verifiedTotpFactor = factorsData?.totp?.find((f) => f.status === "verified")

          if (verifiedTotpFactor) {
            // Sign out immediately so the AAL1 session cannot be used to access /cms
            await supabase.auth.signOut()
            // Store session tokens in memory for re-authentication after MFA
            setPendingSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            })
            setMfaRequired(true)
            setMfaFactorId(verifiedTotpFactor.id)
            setIsLoading(false)
            return
          }
        } catch (mfaErr) {
          // MFA check failed — proceed without MFA
          console.error("MFA check failed, proceeding without MFA:", mfaErr)
        }
      }

      if (rememberMe) {
        localStorage.setItem("cms_remember_me", "true")
      } else {
        localStorage.removeItem("cms_remember_me")
      }

      // Use full page navigation to ensure middleware properly picks up the new session cookies
      window.location.href = "/cms"
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaFactorId || mfaCode.length !== 6 || !pendingSession) return

    setMfaVerifying(true)
    setError(null)

    try {
      const supabase = createClient()

      // Re-establish session for MFA verification
      await supabase.auth.setSession({
        access_token: pendingSession.access_token,
        refresh_token: pendingSession.refresh_token,
      })

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      })
      if (challengeError) {
        // Sign out on failure to prevent AAL1 access
        await supabase.auth.signOut()
        throw challengeError
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode,
      })
      if (verifyError) {
        // Sign out on failure to prevent AAL1 access
        await supabase.auth.signOut()
        throw verifyError
      }

      // MFA verified — session is now at AAL2
      setPendingSession(null)

      if (rememberMe) {
        localStorage.setItem("cms_remember_me", "true")
      } else {
        localStorage.removeItem("cms_remember_me")
      }

      window.location.href = "/cms"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ungültiger Code. Bitte versuchen Sie es erneut.")
      setMfaCode("")
    } finally {
      setMfaVerifying(false)
    }
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
              priority
            />
            <span className="font-display text-lg font-semibold text-foreground">
              Grabbe-Gymnasium
            </span>
            <span className="text-sm text-muted-foreground -mt-1">
              Content Management
            </span>
          </Link>
        </div>
        <Card>
          {mfaRequired ? (
            <>
              <CardHeader>
                <CardTitle className="font-display text-2xl">Zwei-Faktor-Authentifizierung</CardTitle>
                <CardDescription>
                  Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMfaVerify}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="mfaCode">Verifizierungscode</Label>
                      <Input
                        id="mfaCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="text-center font-mono text-lg tracking-[0.3em]"
                        autoFocus
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={mfaVerifying || mfaCode.length !== 6}>
                      {mfaVerifying ? "Verifiziere..." : "Bestätigen"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setMfaRequired(false)
                        setMfaCode("")
                        setError(null)
                        setPendingSession(null)
                      }}
                    >
                      Zurück zum Login
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          ) : (
            <>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Passwort</Label>
                    <Link
                      href="/auth/passwort-vergessen"
                      className="text-xs text-muted-foreground hover:text-primary hover:underline"
                    >
                      Passwort vergessen?
                    </Link>
                  </div>
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
                    <p className="font-medium">Bitte warten</p>
                    <p className="mt-1">
                      Sie können es in {formatCountdown(retryAfterSeconds)} erneut versuchen.
                    </p>
                  </div>
                )}
                {error && !isBlocked && (
                  <p className="text-sm text-destructive">{error}</p>
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
                    ? `Bitte warten (${formatCountdown(retryAfterSeconds)})`
                    : isLoading
                      ? "Anmelden..."
                      : "Anmelden"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">oder</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isBlocked}
                  onClick={async () => {
                    const supabase = createClient()
                    const { data, error } = await supabase.auth.signInWithOAuth({
                      provider: "github",
                      options: { redirectTo: `${window.location.origin}/cms` },
                    })
                    if (error) {
                      setError("GitHub-Anmeldung fehlgeschlagen.")
                    } else if (data.url) {
                      window.location.href = data.url
                    }
                  }}
                >
                  <Github className="h-4 w-4" />
                  Mit GitHub anmelden
                </Button>
              </div>
            </form>
          </CardContent>
            </>
          )}
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
