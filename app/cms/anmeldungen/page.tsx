"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Trash2, Download, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Submission {
  id: string
  child_name: string
  child_birthday: string | null
  parent_name: string
  parent_email: string
  parent_phone: string | null
  grundschule: string | null
  anmeldung_type: string
  wunschpartner: string | null
  profilprojekt: string | null
  message: string | null
  created_at: string
}

export default function AnmeldungenPage() {
  const [items, setItems] = useState<Submission[]>([])
  const [loaded, setLoaded] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("anmeldung_submissions")
        .select("*")
        .order("created_at", { ascending: false })
      setItems((data as Submission[]) || [])
      setLoaded(true)
    }
    loadData()
  }, [])

  if (!loaded) {
    return <div className="py-12 text-center text-muted-foreground">Laden...</div>
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Anmeldung wirklich löschen?")) return
    const supabase = createClient()
    await supabase.from("anmeldung_submissions").delete().eq("id", id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const exportCSV = () => {
    const headers = ["Kind", "Geburtsdatum", "Elternteil", "E-Mail", "Telefon", "Grundschule", "Typ", "Profilprojekt", "Wunschpartner", "Nachricht", "Datum"]
    const rows = items.map(i => [
      i.child_name,
      i.child_birthday ? new Date(i.child_birthday).toLocaleDateString("de-DE") : "",
      i.parent_name,
      i.parent_email,
      i.parent_phone || "",
      i.grundschule || "",
      i.anmeldung_type === "klasse5" ? "Klasse 5" : "Oberstufe",
      i.profilprojekt || "",
      i.wunschpartner || "",
      (i.message || "").replace(/\n/g, " "),
      new Date(i.created_at).toLocaleDateString("de-DE"),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `anmeldungen_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Anmeldungen</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} Anmeldung{items.length !== 1 ? "en" : ""} eingegangen</p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            CSV Export
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Noch keine Anmeldungen eingegangen.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-sm truncate">{item.child_name}</span>
                  <span className="text-xs rounded-full bg-primary/10 px-2 py-0.5 text-primary shrink-0">
                    {item.anmeldung_type === "klasse5" ? "Klasse 5" : "Oberstufe"}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(item.created_at).toLocaleDateString("de-DE")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {expandedId === item.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {expandedId === item.id && (
                <div className="border-t px-5 py-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Elternteil</p>
                    <p>{item.parent_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">E-Mail</p>
                    <p><a href={`mailto:${item.parent_email}`} className="text-primary hover:underline">{item.parent_email}</a></p>
                  </div>
                  {item.parent_phone && (
                    <div>
                      <p className="text-muted-foreground text-xs">Telefon</p>
                      <p>{item.parent_phone}</p>
                    </div>
                  )}
                  {item.grundschule && (
                    <div>
                      <p className="text-muted-foreground text-xs">Grundschule</p>
                      <p>{item.grundschule}</p>
                    </div>
                  )}
                  {item.child_birthday && (
                    <div>
                      <p className="text-muted-foreground text-xs">Geburtsdatum</p>
                      <p>{new Date(item.child_birthday).toLocaleDateString("de-DE")}</p>
                    </div>
                  )}
                  {item.profilprojekt && (
                    <div>
                      <p className="text-muted-foreground text-xs">Wunsch-Profilprojekt</p>
                      <p>{item.profilprojekt}</p>
                    </div>
                  )}
                  {item.wunschpartner && (
                    <div>
                      <p className="text-muted-foreground text-xs">Wunschpartner</p>
                      <p>{item.wunschpartner}</p>
                    </div>
                  )}
                  {item.message && (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground text-xs">Nachricht</p>
                      <p className="whitespace-pre-wrap">{item.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
