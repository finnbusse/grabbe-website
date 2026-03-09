"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

function generateCaptcha(): { question: string; answer: number } {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  return { question: `${a} + ${b} = ?`, answer: a + b }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [captcha, setCaptcha] = useState(() => generateCaptcha())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setCaptchaInput("")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldown > 0) return

    // Verify captcha
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      setError("Falsche Antwort auf die Sicherheitsfrage. Bitte versuchen Sie es erneut.")
      refreshCaptcha()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/passwort-vergessen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.status === 429) {
        const retrySeconds = data.retryAfterSeconds || 60
        setCooldown(retrySeconds)
        cooldownRef.current = retrySeconds
        setError(data.error || "Zu viele Anfragen. Bitte warten Sie.")
        refreshCaptcha()
        return
      }

      // Always show success to prevent email enumeration
      setSuccess(true)
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
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
                  <h2 className="font-display text-lg font-semibold">E-Mail gesendet</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Falls ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie in Kürze eine E-Mail
                    mit einem Link zum Zurücksetzen Ihres Passworts.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Zurück zum Login
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
            <CardTitle className="font-display text-2xl">Passwort vergessen</CardTitle>
            <CardDescription>
              Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@grabbe.nrw.schule"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={cooldown > 0}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="captcha">
                    Sicherheitsfrage: <span className="font-mono font-bold text-primary">{captcha.question}</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="captcha"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Antwort"
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      disabled={cooldown > 0}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={refreshCaptcha}
                      disabled={cooldown > 0}
                      className="text-xs text-muted-foreground"
                    >
                      Neue Frage
                    </Button>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {cooldown > 0 && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-medium">Bitte warten</p>
                    <p className="mt-1">
                      Nächster Versuch in {cooldown} Sekunde{cooldown !== 1 ? "n" : ""}.
                    </p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || cooldown > 0}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sende...
                    </>
                  ) : cooldown > 0 ? (
                    `Bitte warten (${cooldown}s)`
                  ) : (
                    "Link senden"
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
