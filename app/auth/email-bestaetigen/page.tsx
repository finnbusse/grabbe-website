"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { Suspense } from "react"

function ConfirmForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const uid = searchParams.get("uid")

  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newEmail, setNewEmail] = useState<string | null>(null)

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
                    Dieser Bestätigungslink ist ungültig oder abgelaufen.
                  </p>
                </div>
                <Link href="/cms/profil">
                  <Button variant="outline">Zurück zum Profil</Button>
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
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, uid, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten.")
        return
      }

      setNewEmail(data.newEmail)
      setSuccess(true)
    } catch {
      setError("Ein Fehler ist aufgetreten.")
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
              <Image src="/images/grabbe-logo.svg" alt="Grabbe-Gymnasium Logo" width={64} height={64} className="h-16 w-16" />
              <span className="font-display text-lg font-semibold text-foreground">Grabbe-Gymnasium</span>
            </Link>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">E-Mail geändert</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ihre E-Mail-Adresse wurde erfolgreich auf <strong>{newEmail}</strong> geändert.
                    Bitte melden Sie sich mit der neuen E-Mail-Adresse an.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button>Zum Login</Button>
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
            <Image src="/images/grabbe-logo.svg" alt="Grabbe-Gymnasium Logo" width={64} height={64} className="h-16 w-16" />
            <span className="font-display text-lg font-semibold text-foreground">Grabbe-Gymnasium</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">E-Mail bestätigen</CardTitle>
            <CardDescription>
              Bitte geben Sie Ihr aktuelles Passwort ein, um die Änderung der E-Mail-Adresse zu bestätigen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Aktuelles Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ihr aktuelles Passwort"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || !password}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bestätige...
                    </>
                  ) : (
                    "E-Mail-Änderung bestätigen"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ConfirmForm />
    </Suspense>
  )
}
