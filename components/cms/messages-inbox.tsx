"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2, Mail, MailOpen, ChevronDown, ChevronUp } from "lucide-react"

interface Message {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export function MessagesInbox({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [openId, setOpenId] = useState<string | null>(null)

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from("contact_submissions").update({ read: true }).eq("id", id)
    setMessages(messages.map((m) => m.id === id ? { ...m, read: true } : m))
  }

  async function handleDelete(id: string) {
    if (!confirm("Nachricht wirklich löschen?")) return
    const supabase = createClient()
    await supabase.from("contact_submissions").delete().eq("id", id)
    setMessages(messages.filter((m) => m.id !== id))
  }

  const unread = messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Nachrichten</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread} ungelesene Nachricht{unread !== 1 ? "en" : ""} von {messages.length} gesamt</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Keine Nachrichten vorhanden.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`rounded-xl border bg-card transition-colors ${!msg.read ? "border-primary/30 bg-primary/5" : ""}`}>
              <button
                className="flex w-full items-center gap-4 p-4 text-left"
                onClick={() => { setOpenId(openId === msg.id ? null : msg.id); if (!msg.read) markRead(msg.id) }}
              >
                {msg.read ? <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" /> : <Mail className="h-4 w-4 text-primary shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!msg.read ? "font-semibold" : "font-medium"}`}>{msg.subject || "Allgemeine Anfrage"}</p>
                  <p className="text-xs text-muted-foreground truncate">{msg.name} &middot; {msg.email} &middot; {new Date(msg.created_at).toLocaleDateString("de-DE")}</p>
                </div>
                {openId === msg.id ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
              {openId === msg.id && (
                <div className="border-t px-4 py-4 space-y-3">
                  <div className="grid gap-1 text-sm">
                    <p><span className="font-medium">Von:</span> {msg.name} ({msg.email})</p>
                    <p><span className="font-medium">Datum:</span> {new Date(msg.created_at).toLocaleString("de-DE")}</p>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <div className="flex gap-2 pt-2">
                    <a href={`mailto:${msg.email}?subject=Re: ${msg.subject || "Ihre Anfrage"}`}>
                      <Button variant="outline" size="sm">Antworten</Button>
                    </a>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(msg.id)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />Löschen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
