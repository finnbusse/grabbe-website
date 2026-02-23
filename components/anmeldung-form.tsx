"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GraduationCap, Loader2, CheckCircle2 } from "lucide-react"

export function AnmeldungForm() {
  const [childName, setChildName] = useState("")
  const [childBirthday, setChildBirthday] = useState("")
  const [parentName, setParentName] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [grundschule, setGrundschule] = useState("")
  const [anmeldungType, setAnmeldungType] = useState("klasse5")
  const [wunschpartner, setWunschpartner] = useState("")
  const [profilprojekt, setProfilprojekt] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const res = await fetch("/api/anmeldung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_name: childName,
          child_birthday: childBirthday || null,
          parent_name: parentName,
          parent_email: parentEmail,
          parent_phone: parentPhone || null,
          grundschule: grundschule || null,
          anmeldung_type: anmeldungType,
          wunschpartner: wunschpartner || null,
          profilprojekt: profilprojekt || null,
          message: message || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Fehler beim Senden")
      }
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Senden")
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 font-display text-xl font-semibold">Voranmeldung erhalten!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Vielen Dank für Ihre Voranmeldung. Wir werden uns in Kürze bei Ihnen melden, um einen Termin
          für die persönliche Anmeldung zu vereinbaren. Bitte bringen Sie dann alle erforderlichen
          Unterlagen mit.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Online-Voranmeldung</h2>
          <p className="text-xs text-muted-foreground">Unverbindliche Interessensbekundung</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-2">
        <Label>Anmeldung für</Label>
        <div className="flex gap-3">
          <button type="button" onClick={() => setAnmeldungType("klasse5")}
            className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${anmeldungType === "klasse5" ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}>
            Klasse 5
          </button>
          <button type="button" onClick={() => setAnmeldungType("oberstufe")}
            className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${anmeldungType === "oberstufe" ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}>
            Oberstufe (EF)
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="child-name">Name des Kindes *</Label>
          <Input id="child-name" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Vorname Nachname" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="child-bday">Geburtsdatum</Label>
          <Input id="child-bday" type="date" value={childBirthday} onChange={(e) => setChildBirthday(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="parent-name">Name Erziehungsberechtigte:r *</Label>
          <Input id="parent-name" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Vorname Nachname" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parent-email">E-Mail *</Label>
          <Input id="parent-email" type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="ihre@email.de" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="05231 ..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grundschule">{anmeldungType === "klasse5" ? "Aktuelle Grundschule" : "Aktuelle Schule"}</Label>
          <Input id="grundschule" value={grundschule} onChange={(e) => setGrundschule(e.target.value)} placeholder="Name der Schule" />
        </div>
      </div>

      {anmeldungType === "klasse5" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="wunsch">Wunschpartner:in</Label>
            <Input id="wunsch" value={wunschpartner} onChange={(e) => setWunschpartner(e.target.value)} placeholder="Name des Wunschpartners" />
          </div>
          <div className="space-y-2">
            <Label>Wunsch-Profilprojekt</Label>
            <select value={profilprojekt} onChange={(e) => setProfilprojekt(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Bitte wählen</option>
              <option value="kunst">Kunstprojekt</option>
              <option value="musik">Musikprojekt</option>
              <option value="sport">Sportprojekt</option>
              <option value="nawi">NaWi-Projekt</option>
            </select>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="anm-message">Nachricht / Anmerkungen</Label>
        <Textarea id="anm-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Besonderheiten, Fragen..." rows={3} />
      </div>

      <Button type="submit" disabled={sending || !childName || !parentName || !parentEmail} className="w-full">
        {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GraduationCap className="mr-2 h-4 w-4" />}
        {sending ? "Wird gesendet..." : "Voranmeldung absenden"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Diese Online-Voranmeldung ersetzt nicht die persönliche Anmeldung vor Ort.
        Wir melden uns bei Ihnen für einen Termin.
      </p>
    </form>
  )
}
