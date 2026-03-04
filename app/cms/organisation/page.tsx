"use client"

/**
 * /cms/organisation — Organisation management page.
 *
 * Currently features a "Lehrer" (Teachers) tab where school staff can be
 * managed (CRUD).  The tab bar is designed to be extended with future tabs
 * (e.g. Zuständigkeiten, Fachkonferenzen, …).
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImagePicker } from "@/components/cms/image-picker"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GraduationCap,
  X,
  Save,
  AtSign,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { SUBJECTS, getSubjectsByIds, type Subject } from "@/lib/constants/subjects"
import type { TeacherWithSubjects, TeacherGender } from "@/lib/types/database.types"

// ---------------------------------------------------------------------------
// Tab definitions (extensible for future tabs)
// ---------------------------------------------------------------------------

const TABS = [
  { id: "lehrer", label: "Lehrer", icon: GraduationCap },
] as const

type TabId = (typeof TABS)[number]["id"]

// ---------------------------------------------------------------------------
// Gender helpers
// ---------------------------------------------------------------------------

const GENDER_OPTIONS: { value: TeacherGender; label: string }[] = [
  { value: "", label: "Nicht angegeben" },
  { value: "male", label: "Männlich" },
  { value: "female", label: "Weiblich" },
  { value: "diverse", label: "Divers" },
]

function genderLabel(gender: TeacherGender): string {
  return GENDER_OPTIONS.find((g) => g.value === gender)?.label ?? ""
}

function genderPrefix(gender: string): string {
  switch (gender) {
    case "male":
      return "Herr"
    case "female":
      return "Frau"
    default:
      return ""
  }
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function OrganisationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("lehrer")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Organisation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lehrkräfte und schulische Strukturen verwalten.
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b">
        <nav className="flex gap-4 -mb-px" aria-label="Organisation Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "lehrer" && <TeacherTab />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Teacher Tab
// ---------------------------------------------------------------------------

function TeacherTab() {
  const [teachers, setTeachers] = useState<TeacherWithSubjects[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingTeacher, setEditingTeacher] = useState<TeacherWithSubjects | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/teachers")
      const data = await res.json()
      if (Array.isArray(data)) setTeachers(data)
    } catch {
      toast.error("Fehler beim Laden der Lehrkräfte")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  // Filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) return teachers
    const s = search.toLowerCase()
    return teachers.filter(
      (t) =>
        t.first_name.toLowerCase().includes(s) ||
        t.last_name.toLowerCase().includes(s) ||
        t.abbreviation.toLowerCase().includes(s) ||
        (t.email && t.email.toLowerCase().includes(s))
    )
  }, [teachers, search])

  const openCreate = () => {
    setEditingTeacher(null)
    setIsCreating(true)
    setSheetOpen(true)
  }

  const openEdit = (teacher: TeacherWithSubjects) => {
    setEditingTeacher(teacher)
    setIsCreating(false)
    setSheetOpen(true)
  }

  const handleDelete = async (teacher: TeacherWithSubjects) => {
    if (!confirm(`Lehrkraft "${teacher.first_name} ${teacher.last_name}" wirklich löschen?`)) return
    try {
      const res = await fetch(`/api/teachers?id=${teacher.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Fehler")
      }
      toast.success("Lehrkraft gelöscht")
      fetchTeachers()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Löschen")
    }
  }

  const handleSaved = () => {
    setSheetOpen(false)
    fetchTeachers()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lehrkräfte suchen…"
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Lehrkraft hinzufügen
        </Button>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "Lehrkraft" : "Lehrkräfte"}
        {search && ` (von ${teachers.length})`}
      </p>

      {/* Teacher list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {teachers.length === 0
              ? "Noch keine Lehrkräfte angelegt."
              : "Keine Lehrkräfte gefunden."}
          </p>
          {teachers.length === 0 && (
            <Button variant="outline" className="mt-3 gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Erste Lehrkraft anlegen
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kürzel</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">E-Mail</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Fächer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((teacher) => {
                  const subjects = getSubjectsByIds(teacher.subject_ids)
                  return (
                    <tr
                      key={teacher.id}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {teacher.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={teacher.image_url}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {teacher.first_name.charAt(0)}
                                {teacher.last_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {genderPrefix(teacher.gender)}{genderPrefix(teacher.gender) ? " " : ""}
                              {teacher.first_name} {teacher.last_name}
                            </p>
                            {teacher.gender && (
                              <p className="text-xs text-muted-foreground">{genderLabel(teacher.gender)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="font-mono text-xs">
                          @{teacher.abbreviation}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {teacher.email || "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {subjects.slice(0, 4).map((s) => (
                              <Badge key={s.id} variant="outline" className="text-[10px] px-1.5 py-0">
                                {s.shortName}
                              </Badge>
                            ))}
                            {subjects.length > 4 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                +{subjects.length - 4}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge
                          className={
                            teacher.is_active
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }
                        >
                          {teacher.is_active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(teacher)}
                            title="Bearbeiten"
                            aria-label={`${teacher.first_name} ${teacher.last_name} bearbeiten`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(teacher)}
                            title="Löschen"
                            aria-label={`${teacher.first_name} ${teacher.last_name} löschen`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isCreating ? "Neue Lehrkraft" : "Lehrkraft bearbeiten"}</SheetTitle>
            <SheetDescription>
              {isCreating
                ? "Legen Sie eine neue Lehrkraft an."
                : `${editingTeacher?.first_name} ${editingTeacher?.last_name} bearbeiten`}
            </SheetDescription>
          </SheetHeader>
          <TeacherForm
            teacher={isCreating ? null : editingTeacher}
            onSaved={handleSaved}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Teacher Form (used in Sheet for create/edit)
// ---------------------------------------------------------------------------

interface TeacherFormProps {
  teacher: TeacherWithSubjects | null
  onSaved: () => void
  onCancel: () => void
}

function TeacherForm({ teacher, onSaved, onCancel }: TeacherFormProps) {
  const [gender, setGender] = useState<TeacherGender>(teacher?.gender ?? "")
  const [firstName, setFirstName] = useState(teacher?.first_name ?? "")
  const [lastName, setLastName] = useState(teacher?.last_name ?? "")
  const [email, setEmail] = useState(teacher?.email ?? "")
  const [abbreviation, setAbbreviation] = useState(teacher?.abbreviation ?? "")
  const [imageUrl, setImageUrl] = useState<string | null>(teacher?.image_url ?? null)
  const [isActive, setIsActive] = useState(teacher?.is_active ?? true)
  const [subjectIds, setSubjectIds] = useState<string[]>(teacher?.subject_ids ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!teacher

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !abbreviation.trim()) {
      setError("Vorname, Nachname und Kürzel sind Pflichtfelder.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = {
        gender,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        abbreviation: abbreviation.trim().toLowerCase(),
        image_url: imageUrl,
        is_active: isActive,
        subject_ids: subjectIds,
      }

      if (isEdit) {
        payload.id = teacher.id
      }

      const res = await fetch("/api/teachers", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler beim Speichern")

      toast.success(isEdit ? "Lehrkraft aktualisiert" : "Lehrkraft angelegt")
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  // Subject toggle
  const toggleSubject = (subjectId: string) => {
    setSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    )
  }

  const selectedSubjects = getSubjectsByIds(subjectIds)

  return (
    <div className="mt-6 space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Gender */}
      <div className="grid gap-2">
        <Label>Geschlecht</Label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as TeacherGender)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* First & Last name */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="teacher-fn">Vorname *</Label>
          <Input
            id="teacher-fn"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Max"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="teacher-ln">Nachname *</Label>
          <Input
            id="teacher-ln"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Mustermann"
          />
        </div>
      </div>

      {/* Abbreviation */}
      <div className="grid gap-2">
        <Label htmlFor="teacher-abbr">Kürzel *</Label>
        <div className="flex items-center gap-2">
          <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            id="teacher-abbr"
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value.slice(0, 5))}
            placeholder="mus"
            className="font-mono"
            maxLength={5}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Das Kürzel wird zum schnellen Zuweisen verwendet (z.B. @mus).
        </p>
      </div>

      {/* Email */}
      <div className="grid gap-2">
        <Label htmlFor="teacher-email">E-Mail</Label>
        <Input
          id="teacher-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="max.mustermann@schule.de"
        />
      </div>

      {/* Image */}
      <div className="grid gap-2">
        <Label>Foto (optional)</Label>
        <ImagePicker
          value={imageUrl}
          onChange={(url) => setImageUrl(url || null)}
          aspectRatio="1/1"
        />
      </div>

      {/* Subjects */}
      <div className="grid gap-2">
        <Label>Fächer</Label>
        {selectedSubjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {selectedSubjects.map((s) => (
              <Badge
                key={s.id}
                className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 text-xs gap-1"
              >
                {s.name}
                <button type="button" onClick={() => toggleSubject(s.id)} className="hover:opacity-70">
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <SubjectPicker
          selectedIds={subjectIds}
          onToggle={toggleSubject}
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Status</Label>
          <p className="text-[11px] text-muted-foreground">
            Inaktive Lehrkräfte werden nicht in der Auswahl angezeigt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !firstName.trim() || !lastName.trim() || !abbreviation.trim()}
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Speichern…" : isEdit ? "Aktualisieren" : "Anlegen"}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Subject Picker (inline searchable list)
// ---------------------------------------------------------------------------

function SubjectPicker({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? SUBJECTS.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.shortName.toLowerCase().includes(search.toLowerCase())
      )
    : SUBJECTS

  return (
    <div className="rounded-lg border">
      <div className="p-2 border-b">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Fach suchen…"
          className="h-8 text-xs"
        />
      </div>
      <div className="max-h-36 overflow-y-auto p-1">
        {filtered.map((subject) => {
          const isSelected = selectedIds.includes(subject.id)
          return (
            <button
              key={subject.id}
              type="button"
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
              onClick={() => onToggle(subject.id)}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input"
                }`}
              >
                {isSelected && "✓"}
              </span>
              <span className="flex-1 text-left">{subject.name}</span>
              <span className="text-xs text-muted-foreground">{subject.shortName}</span>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="px-2.5 py-2 text-xs text-muted-foreground">Kein Fach gefunden</p>
        )}
      </div>
    </div>
  )
}
