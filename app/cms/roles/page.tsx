"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Plus, Trash2, Pencil, Loader2, Eye } from "lucide-react"
import { RoleEditorSheet } from "@/components/cms/role-editor-sheet"
import type { CmsRole } from "@/lib/permissions-shared"

export default function RolesPage() {
  const [roles, setRoles] = useState<CmsRole[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<CmsRole | null>(null)
  const [message, setMessage] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/roles")
      if (res.ok) {
        const data = await res.json()
        setRoles(data.roles || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRoles() }, [loadRoles])

  function openCreate() {
    setEditingRole(null)
    setSheetOpen(true)
  }

  function openEdit(role: CmsRole) {
    setEditingRole(role)
    setSheetOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Rolle wirklich löschen?")) return
    setDeletingId(id)
    setMessage("")
    try {
      const res = await fetch("/api/roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler")
      setMessage("Rolle gelöscht.")
      loadRoles()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Rollenverwaltung</h1>
          <p className="mt-1 text-sm text-muted-foreground">System- und benutzerdefinierte Rollen verwalten</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Rolle
        </Button>
      </div>

      <div className="mt-6 space-y-6">

      {message && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">{message}</div>
      )}

      <RoleEditorSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        role={editingRole}
        onSaved={loadRoles}
      />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{role.name}</span>
                      {role.is_system && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">System</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Slug: {role.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {role.is_system ? (
                    <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={deletingId === role.id}
                        onClick={() => handleDelete(role.id)}
                      >
                        {deletingId === role.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {roles.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Keine Rollen vorhanden.</p>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
