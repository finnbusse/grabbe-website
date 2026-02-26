"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Settings, Save, Loader2, Mail, Globe, Send,
  CheckCircle2, XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { usePermissions } from "@/components/cms/permissions-context"
import { isAdmin } from "@/lib/permissions-shared"

// ---------------------------------------------------------------------------
// Section component
// ---------------------------------------------------------------------------
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-5 px-6 py-5">{children}</div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

// ===========================================================================
// Page
// ===========================================================================
export default function SystemSettingsPage() {
  const { roleSlugs } = usePermissions()
  const showEmailSection = isAdmin(roleSlugs)

  // Email tab state
  const [emailStatus, setEmailStatus] = useState<{ configured: boolean; domain: string; from: string } | null>(null)
  const [emailStatusLoading, setEmailStatusLoading] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState("")
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  // Load email configuration status (admin only)
  useEffect(() => {
    if (!showEmailSection) return
    setEmailStatusLoading(true)
    fetch("/api/email/status")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setEmailStatus(data) })
      .catch((err) => { console.error("[Email] Failed to load status:", err) })
      .finally(() => setEmailStatusLoading(false))
  }, [showEmailSection])

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) return
    setSendingTestEmail(true)
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "test", to: testEmailAddress.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Test-E-Mail wurde gesendet an ${testEmailAddress.trim()}`)
        setTestEmailAddress("")
      } else {
        toast.error(`Fehler beim Senden: ${data.error || "Unbekannter Fehler"}`)
      }
    } catch {
      toast.error("Fehler beim Senden: Netzwerkfehler")
    } finally {
      setSendingTestEmail(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">CMS-Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Einstellungen, die das CMS-System betreffen.
        </p>
      </div>

      {showEmailSection && (
        <>
          <Section
            icon={Mail}
            title="E-Mail-Konfiguration"
            description="Übersicht der E-Mail-Infrastruktur."
          >
            {emailStatusLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Lade Status…
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-sm">
                  {emailStatus?.configured ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">RESEND_API_KEY:</span>
                  <span className={emailStatus?.configured ? "text-green-600" : "text-red-500"}>
                    {emailStatus?.configured ? "Konfiguriert ✓" : "Nicht gesetzt ✗"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Absenderdomain:</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{emailStatus?.domain ?? "push.grabbe.site"}</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Absenderadresse:</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{emailStatus?.from ?? "noreply@push.grabbe.site"}</code>
                </div>
              </div>
            )}
          </Section>

          <Section
            icon={Send}
            title="Test-E-Mail senden"
            description="Sende eine Test-E-Mail, um die Konfiguration zu prüfen."
          >
            <Field label="Empfänger-E-Mail-Adresse">
              <div className="flex items-center gap-3">
                <Input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="test@example.com"
                  className="flex-1"
                />
                <Button
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail || !testEmailAddress.trim()}
                >
                  {sendingTestEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Test-E-Mail senden
                </Button>
              </div>
            </Field>
          </Section>
        </>
      )}

      {!showEmailSection && (
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-foreground">Keine Systemeinstellungen verfügbar</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Sie benötigen Administrator-Rechte, um die Systemeinstellungen zu verwalten.
          </p>
        </div>
      )}
    </div>
  )
}
