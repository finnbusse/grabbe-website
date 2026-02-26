"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { EMPTY_PERMISSIONS } from "@/lib/permissions-shared"
import type { CmsPermissions, CmsRole } from "@/lib/permissions-shared"

// ============================================================================
// Permission field descriptors — mirrors CmsPermissions exactly
// ============================================================================

type BoolField = {
  type: "boolean"
  label: string
  get: (p: CmsPermissions) => boolean
  set: (p: CmsPermissions, v: boolean) => CmsPermissions
}

type ThreeStateField = {
  type: "threestate"
  label: string
  get: (p: CmsPermissions) => "own" | "all" | false
  set: (p: CmsPermissions, v: "own" | "all" | false) => CmsPermissions
}

type PermissionField = BoolField | ThreeStateField

type PermissionSection = {
  title: string
  fields: PermissionField[]
}

const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    title: "Inhalte",
    fields: [
      // Posts
      {
        type: "boolean",
        label: "Beiträge erstellen",
        get: (p) => p.posts.create,
        set: (p, v) => ({ ...p, posts: { ...p.posts, create: v } }),
      },
      {
        type: "threestate",
        label: "Beiträge bearbeiten",
        get: (p) => p.posts.edit,
        set: (p, v) => ({ ...p, posts: { ...p.posts, edit: v } }),
      },
      {
        type: "threestate",
        label: "Beiträge löschen",
        get: (p) => p.posts.delete,
        set: (p, v) => ({ ...p, posts: { ...p.posts, delete: v } }),
      },
      {
        type: "boolean",
        label: "Beiträge veröffentlichen",
        get: (p) => p.posts.publish,
        set: (p, v) => ({ ...p, posts: { ...p.posts, publish: v } }),
      },
      // Events
      {
        type: "boolean",
        label: "Termine erstellen",
        get: (p) => p.events.create,
        set: (p, v) => ({ ...p, events: { ...p.events, create: v } }),
      },
      {
        type: "threestate",
        label: "Termine bearbeiten",
        get: (p) => p.events.edit,
        set: (p, v) => ({ ...p, events: { ...p.events, edit: v } }),
      },
      {
        type: "threestate",
        label: "Termine löschen",
        get: (p) => p.events.delete,
        set: (p, v) => ({ ...p, events: { ...p.events, delete: v } }),
      },
      {
        type: "boolean",
        label: "Termine veröffentlichen",
        get: (p) => p.events.publish,
        set: (p, v) => ({ ...p, events: { ...p.events, publish: v } }),
      },
      // Pages
      {
        type: "boolean",
        label: "Seiten bearbeiten",
        get: (p) => p.pages.edit,
        set: (p, v) => ({ ...p, pages: { edit: v } }),
      },
      // Documents
      {
        type: "boolean",
        label: "Dokumente hochladen",
        get: (p) => p.documents.upload,
        set: (p, v) => ({ ...p, documents: { ...p.documents, upload: v } }),
      },
      {
        type: "threestate",
        label: "Dokumente löschen",
        get: (p) => p.documents.delete,
        set: (p, v) => ({ ...p, documents: { ...p.documents, delete: v } }),
      },
    ],
  },
  {
    title: "Einstellungen",
    fields: [
      {
        type: "boolean",
        label: "Basis-Einstellungen",
        get: (p) => p.settings.basic,
        set: (p, v) => ({ ...p, settings: { ...p.settings, basic: v } }),
      },
      {
        type: "boolean",
        label: "Erweiterte Einstellungen",
        get: (p) => p.settings.advanced,
        set: (p, v) => ({ ...p, settings: { ...p.settings, advanced: v } }),
      },
      {
        type: "boolean",
        label: "SEO",
        get: (p) => p.settings.seo,
        set: (p, v) => ({ ...p, settings: { ...p.settings, seo: v } }),
      },
    ],
  },
  {
    title: "Website-Struktur",
    fields: [
      {
        type: "boolean",
        label: "Navigation",
        get: (p) => p.navigation,
        set: (p, v) => ({ ...p, navigation: v }),
      },
      {
        type: "boolean",
        label: "Seitenstruktur",
        get: (p) => p.seitenstruktur,
        set: (p, v) => ({ ...p, seitenstruktur: v }),
      },
      {
        type: "boolean",
        label: "Seiten-Editor",
        get: (p) => p.seitenEditor,
        set: (p, v) => ({ ...p, seitenEditor: v }),
      },
    ],
  },
  {
    title: "Verwaltung",
    fields: [
      {
        type: "boolean",
        label: "Benutzer anzeigen",
        get: (p) => p.users.view,
        set: (p, v) => ({ ...p, users: { ...p.users, view: v } }),
      },
      {
        type: "boolean",
        label: "Benutzer erstellen",
        get: (p) => p.users.create,
        set: (p, v) => ({ ...p, users: { ...p.users, create: v } }),
      },
      {
        type: "boolean",
        label: "Benutzer löschen",
        get: (p) => p.users.delete,
        set: (p, v) => ({ ...p, users: { ...p.users, delete: v } }),
      },
      {
        type: "boolean",
        label: "Rollen zuweisen",
        get: (p) => p.users.assignRoles,
        set: (p, v) => ({ ...p, users: { ...p.users, assignRoles: v } }),
      },
      {
        type: "boolean",
        label: "Tags",
        get: (p) => p.tags,
        set: (p, v) => ({ ...p, tags: v }),
      },
      {
        type: "boolean",
        label: "Nachrichten",
        get: (p) => p.messages,
        set: (p, v) => ({ ...p, messages: v }),
      },
      {
        type: "boolean",
        label: "Anmeldungen",
        get: (p) => p.anmeldungen,
        set: (p, v) => ({ ...p, anmeldungen: v }),
      },
      {
        type: "boolean",
        label: "Diagnose",
        get: (p) => p.diagnostic,
        set: (p, v) => ({ ...p, diagnostic: v }),
      },
    ],
  },
  {
    title: "Rollen",
    fields: [
      {
        type: "boolean",
        label: "Anzeigen",
        get: (p) => p.roles.view,
        set: (p, v) => ({ ...p, roles: { ...p.roles, view: v } }),
      },
      {
        type: "boolean",
        label: "Erstellen",
        get: (p) => p.roles.create,
        set: (p, v) => ({ ...p, roles: { ...p.roles, create: v } }),
      },
      {
        type: "boolean",
        label: "Bearbeiten",
        get: (p) => p.roles.edit,
        set: (p, v) => ({ ...p, roles: { ...p.roles, edit: v } }),
      },
      {
        type: "boolean",
        label: "Löschen",
        get: (p) => p.roles.delete,
        set: (p, v) => ({ ...p, roles: { ...p.roles, delete: v } }),
      },
    ],
  },
]

// ============================================================================
// Three-state value helpers
// ============================================================================

type ThreeStateValue = "none" | "own" | "all"

function toRadioValue(v: "own" | "all" | false): ThreeStateValue {
  if (v === "all") return "all"
  if (v === "own") return "own"
  return "none"
}

function fromRadioValue(v: ThreeStateValue): "own" | "all" | false {
  if (v === "all") return "all"
  if (v === "own") return "own"
  return false
}

// ============================================================================
// Sub-components
// ============================================================================

function toFieldId(label: string, suffix?: string): string {
  const base = `perm-${label.replace(/\s+/g, "-").toLowerCase()}`
  return suffix ? `${base}-${suffix}` : base
}

function BoolRow({
  field,
  permissions,
  onChange,
  disabled,
}: {
  field: BoolField
  permissions: CmsPermissions
  onChange: (p: CmsPermissions) => void
  disabled: boolean
}) {
  const id = toFieldId(field.label)
  const checked = field.get(permissions)
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <Label htmlFor={id} className={`text-sm ${disabled ? "text-muted-foreground" : "cursor-pointer"}`}>
        {field.label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(field.set(permissions, v))}
        disabled={disabled}
      />
    </div>
  )
}

function ThreeStateRow({
  field,
  permissions,
  onChange,
  disabled,
}: {
  field: ThreeStateField
  permissions: CmsPermissions
  onChange: (p: CmsPermissions) => void
  disabled: boolean
}) {
  const value = toRadioValue(field.get(permissions))
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className={`text-sm pt-0.5 ${disabled ? "text-muted-foreground" : ""}`}>{field.label}</span>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(field.set(permissions, fromRadioValue(v as ThreeStateValue)))}
        disabled={disabled}
        className="flex gap-3"
      >
        {(["none", "own", "all"] as ThreeStateValue[]).map((opt) => {
          const optId = toFieldId(field.label, opt)
          const label = opt === "none" ? "Keine" : opt === "own" ? "Eigene" : "Alle"
          return (
            <div key={opt} className="flex items-center gap-1">
              <RadioGroupItem value={opt} id={optId} disabled={disabled} />
              <Label htmlFor={optId} className={`text-xs font-normal ${disabled ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer"}`}>
                {label}
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

type RolesApiResponse = { success: true } | { error: string }

interface RoleEditorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = creating a new role */
  role: CmsRole | null
  onSaved: () => void
}

export function RoleEditorSheet({ open, onOpenChange, role, onSaved }: RoleEditorSheetProps) {
  const isNew = role === null
  const isSystem = role?.is_system ?? false

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [permissions, setPermissions] = useState<CmsPermissions>({ ...EMPTY_PERMISSIONS })
  const [saving, setSaving] = useState(false)

  // Populate form whenever the sheet opens or the role changes
  const resetForm = useCallback(() => {
    if (role) {
      setName(role.name)
      setSlug(role.slug)
      setPermissions(role.permissions)
    } else {
      setName("")
      setSlug("")
      setPermissions({ ...EMPTY_PERMISSIONS })
    }
  }, [role])

  useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Bitte einen Rollennamen eingeben.")
      return
    }
    setSaving(true)
    try {
      const method = isNew ? "POST" : "PUT"
      const body = isNew
        ? { name: name.trim(), slug: slug.trim(), permissions }
        : { id: role!.id, name: name.trim(), permissions }

      const res = await fetch("/api/roles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json() as RolesApiResponse
      if (!res.ok) throw new Error("error" in data ? data.error : "Unbekannter Fehler")

      toast.success(isNew ? "Rolle erstellt." : "Rolle aktualisiert.")
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        {/* Header */}
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{isNew ? "Neue Rolle erstellen" : isSystem ? "Rolle anzeigen" : "Rolle bearbeiten"}</SheetTitle>
          <SheetDescription>
            {isSystem
              ? "Systemrollen können nur angezeigt, nicht bearbeitet werden."
              : "Berechtigungen für diese Rolle festlegen."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <ScrollArea className="flex-1">
          <div className="space-y-5 px-6 py-5">
            {/* System role banner */}
            {isSystem && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Systemrollen können nicht bearbeitet werden.</span>
              </div>
            )}

            {/* Role name */}
            <div className="grid gap-2">
              <Label htmlFor="sheet-role-name">Rollenname</Label>
              <Input
                id="sheet-role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Redakteur"
                disabled={isSystem}
              />
            </div>

            {/* Slug — only shown when creating a new role */}
            {isNew && (
              <div className="grid gap-2">
                <Label htmlFor="sheet-role-slug">Slug (eindeutig)</Label>
                <Input
                  id="sheet-role-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="z.B. redakteur"
                />
              </div>
            )}

            {/* Permissions editor */}
            {PERMISSION_SECTIONS.map((section, si) => (
              <div key={section.title}>
                {si > 0 && <Separator className="mb-4" />}
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.fields.map((field) =>
                    field.type === "boolean" ? (
                      <BoolRow
                        key={field.label}
                        field={field}
                        permissions={permissions}
                        onChange={setPermissions}
                        disabled={isSystem}
                      />
                    ) : (
                      <ThreeStateRow
                        key={field.label}
                        field={field}
                        permissions={permissions}
                        onChange={setPermissions}
                        disabled={isSystem}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="border-t px-6 py-4">
          {isSystem ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Speichern
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
