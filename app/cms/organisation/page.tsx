"use client"

/**
 * /cms/organisation — Organisation management page.
 *
 * Currently features a "Lehrer" (Teachers) tab where school staff can be
 * managed (CRUD).  The tab bar is designed to be extended with future tabs
 * (e.g. Zuständigkeiten, Fachkonferenzen, …).
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Check,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import { SUBJECTS, getSubjectsByIds } from "@/lib/constants/subjects"
import type { TeacherWithSubjects, TeacherGender } from "@/lib/types/database.types"
import { DocumentPicker } from "@/components/cms/document-picker"
import Link from "next/link"

// ---------------------------------------------------------------------------
// Tab definitions (extensible for future tabs)
// ---------------------------------------------------------------------------

const TABS = [
  { id: "lehrer", label: "Lehrer", icon: GraduationCap },
  { id: "dokumente", label: "Dokumente", icon: FileText },
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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Organisation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lehrkräfte und schulische Strukturen verwalten.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lehrer">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="lehrer" className="mt-6">
          <TeacherTab />
        </TabsContent>
        <TabsContent value="dokumente" className="mt-6">
          <DocumentPlacementsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Document Placements Tab
// ---------------------------------------------------------------------------

interface DocumentPlacement {
  pageId: string
  pageLabel: string
  blockId: string
  label: string
  url: string
  fileType: string
}

function DocumentPlacementsTab() {
  const [placements, setPlacements] = useState<DocumentPlacement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updatingBlockId, setUpdatingBlockId] = useState<string | null>(null)

  const fetchPlacements = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/page-content/documents")
      const data = await res.json()
      if (Array.isArray(data.placements)) setPlacements(data.placements)
    } catch {
      toast.error("Fehler beim Laden der Dokumenten-Platzhalter")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlacements()
  }, [fetchPlacements])

  const filtered = useMemo(() => {
    if (!search.trim()) return placements
    const s = search.toLowerCase()
    return placements.filter(
      (p) =>
        p.label.toLowerCase().includes(s) ||
        p.pageLabel.toLowerCase().includes(s) ||
        (p.url && p.url.toLowerCase().includes(s))
    )
  }, [placements, search])

  const groupedByPage = useMemo(() => {
    const groups: Record<string, { label: string; items: DocumentPlacement[] }> = {}
    filtered.forEach((p) => {
      if (!groups[p.pageId]) {
        groups[p.pageId] = { label: p.pageLabel.replace('Seiteninhalt: ', ''), items: [] }
      }
      groups[p.pageId].items.push(p)
    })
    return groups
  }, [filtered])

  const handleUpdateDocument = async (placement: DocumentPlacement, newDoc: { url: string; fileType: string } | null) => {
    setUpdatingBlockId(placement.blockId)
    try {
      const res = await fetch("/api/page-content/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: placement.pageId,
          blockId: placement.blockId,
          url: newDoc ? newDoc.url : "",
          fileType: newDoc ? newDoc.fileType : "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Fehler beim Speichern")
      toast.success("Dokument aktualisiert")
      fetchPlacements()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setUpdatingBlockId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nach Dokumenten oder Seiten suchen…"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? "Dokumenten-Block" : "Dokumenten-Blöcke"} gefunden
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : Object.keys(groupedByPage).length === 0 ? (
        <div className="text-center py-12 rounded-xl border bg-card">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {placements.length === 0
              ? "Es wurden noch keine Dokument-Blöcke auf Seiten angelegt."
              : "Keine übereinstimmenden Dokument-Blöcke gefunden."}
          </p>
          {placements.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
              Lehrer können im Seiten-Editor über den Baustein "Dokument" neue Platzhalter anlegen.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByPage).map(([pageId, group]) => (
            <div key={pageId} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between bg-muted/40 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{group.label}</span>
                  <Badge variant="secondary" className="text-[10px]">{group.items.length}</Badge>
                </div>
                <Link href={`/cms/seiten-editor/${pageId}`} className="text-xs text-primary hover:underline">
                  Seite bearbeiten
                </Link>
              </div>
              <div className="divide-y">
                {group.items.map((p) => (
                  <div key={p.blockId} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-muted/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-foreground truncate">{p.label}</p>
                        {!p.url && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                            Kein Dokument hinterlegt
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        {p.url || "Bitte weisen Sie ein Dokument zu."}
                      </p>
                    </div>
                    <div className="shrink-0 w-full md:w-auto flex items-center gap-3">
                      {updatingBlockId === p.blockId && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      <div className="w-full md:w-64">
                        <DocumentPicker
                          value={p.url ? { url: p.url, title: p.url.split('/').pop() || p.label } : null}
                          onChange={(doc) => handleUpdateDocument(p, doc)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
        <Select value={gender || "__none"} onValueChange={(v) => setGender((v === "__none" ? "" : v) as TeacherGender)}>
          <SelectTrigger>
            <SelectValue placeholder="Geschlecht wählen" />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "__none"} value={opt.value || "__none"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <Label htmlFor="teacher-active">Status</Label>
          <p className="text-[11px] text-muted-foreground">
            Inaktive Lehrkräfte werden nicht in der Auswahl angezeigt.
          </p>
        </div>
        <Switch
          id="teacher-active"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
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
              <div
                className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] shrink-0 ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input"
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>
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
