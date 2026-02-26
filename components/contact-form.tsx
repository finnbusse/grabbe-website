"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, CheckCircle2 } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Fehler beim Senden")
      }
      setSent(true)
      trackEvent("contact_form_sent")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Fehler beim Senden"
      setError(msg)
      trackEvent("contact_form_error", { message: msg })
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 font-display text-xl font-semibold">Vielen Dank!</h3>
        <p className="mt-2 text-sm text-muted-foreground">Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns so schnell wie möglich bei Ihnen melden.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 space-y-4">
      <h2 className="font-display text-lg font-semibold">Nachricht senden</h2>
      <p className="text-sm text-muted-foreground">Haben Sie Fragen? Schreiben Sie uns gerne.</p>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name *</Label>
          <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ihr Name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">E-Mail *</Label>
          <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihre@email.de" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject">Betreff</Label>
        <Input id="contact-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Worum geht es?" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Nachricht *</Label>
        <Textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ihre Nachricht..." rows={5} required />
      </div>
      <Button type="submit" disabled={sending || !name || !email || !message}>
        {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {sending ? "Wird gesendet..." : "Nachricht senden"}
      </Button>
    </form>
  )
}
