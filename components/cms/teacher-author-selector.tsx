"use client"

/**
 * TeacherAuthorSelector — Reusable component for selecting teacher(s) as
 * content authors. Uses shadcn Popover + Command for the dropdown.
 * Supports @-mention style search by abbreviation (Kürzel) or name.
 * Selected teachers are shown as removable chips/badges.
 *
 * The component also supports auto-populating the current logged-in user's
 * linked teacher record as the default author.
 *
 * Usage:
 *   <TeacherAuthorSelector
 *     selectedTeacherIds={["uuid-1", "uuid-2"]}
 *     onChange={(ids) => setTeacherIds(ids)}
 *   />
 */

import { useState, useEffect, useCallback } from "react"
import { X, AtSign, ChevronsUpDown, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TeacherOption {
  id: string
  first_name: string
  last_name: string
  abbreviation: string
  image_url: string | null
  gender: string
  user_id: string | null
}

interface TeacherAuthorSelectorProps {
  /** Currently selected teacher IDs */
  selectedTeacherIds: string[]
  /** Callback when selection changes */
  onChange: (teacherIds: string[]) => void
  /** Placeholder text (default: "Autor/innen auswählen…") */
  placeholder?: string
  /** Whether to allow multiple selections (default: true) */
  multiple?: boolean
  /** Auto-populate with the current user's linked teacher (default: false) */
  autoPopulateCurrentUser?: boolean
}

// ---------------------------------------------------------------------------
// Helper: gender-aware salutation prefix for display
// ---------------------------------------------------------------------------

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

export function teacherDisplayName(teacher: Pick<TeacherOption, "gender" | "first_name" | "last_name">): string {
  const prefix = genderPrefix(teacher.gender)
  return [prefix, teacher.first_name, teacher.last_name].filter(Boolean).join(" ")
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeacherAuthorSelector({
  selectedTeacherIds,
  onChange,
  placeholder = "Autor/innen auswählen…",
  multiple = true,
  autoPopulateCurrentUser = false,
}: TeacherAuthorSelectorProps) {
  const [allTeachers, setAllTeachers] = useState<TeacherOption[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [autoPopulated, setAutoPopulated] = useState(false)

  // Fetch teachers on mount
  useEffect(() => {
    fetch("/api/teachers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllTeachers(
            data.map((t: TeacherOption) => ({
              id: t.id,
              first_name: t.first_name,
              last_name: t.last_name,
              abbreviation: t.abbreviation,
              image_url: t.image_url,
              gender: t.gender,
              user_id: t.user_id ?? null,
            }))
          )
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Auto-populate the current user's linked teacher if enabled
  useEffect(() => {
    if (!autoPopulateCurrentUser || autoPopulated || loading || selectedTeacherIds.length > 0) return
    // Fetch current user ID and match against teachers
    fetch("/api/user-profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { profile?: { user_id?: string } } | null) => {
        const userId = data?.profile?.user_id
        if (!userId) return
        const match = allTeachers.find((t) => t.user_id === userId)
        if (match) {
          onChange([match.id])
        }
      })
      .catch(() => {})
      .finally(() => setAutoPopulated(true))
  }, [autoPopulateCurrentUser, autoPopulated, loading, allTeachers, selectedTeacherIds.length, onChange])

  const selectedTeachers = allTeachers.filter((t) => selectedTeacherIds.includes(t.id))

  const toggleTeacher = useCallback(
    (teacherId: string) => {
      if (selectedTeacherIds.includes(teacherId)) {
        onChange(selectedTeacherIds.filter((id) => id !== teacherId))
      } else if (multiple) {
        onChange([...selectedTeacherIds, teacherId])
      } else {
        onChange([teacherId])
      }
      if (!multiple) setOpen(false)
    },
    [multiple, onChange, selectedTeacherIds]
  )

  const removeTeacher = useCallback(
    (teacherId: string) => {
      onChange(selectedTeacherIds.filter((id) => id !== teacherId))
    },
    [onChange, selectedTeacherIds]
  )

  if (loading) {
    return <p className="text-xs text-muted-foreground">Lehrkräfte laden…</p>
  }

  return (
    <div className="space-y-2">
      {/* Selected teacher chips */}
      {selectedTeachers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedTeachers.map((teacher) => (
            <Badge
              key={teacher.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <AtSign className="h-3 w-3" />
              {teacher.abbreviation.toUpperCase()}
              <span className="text-muted-foreground font-normal ml-0.5">
                ({genderPrefix(teacher.gender)}{genderPrefix(teacher.gender) ? " " : ""}{teacher.last_name})
              </span>
              <button
                type="button"
                onClick={() => removeTeacher(teacher.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`${teacher.first_name} ${teacher.last_name} entfernen`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Popover + Command dropdown */}
      {(multiple || selectedTeacherIds.length === 0) && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal text-muted-foreground"
              size="sm"
            >
              {placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="@Kürzel oder Name suchen…" />
              <CommandList>
                <CommandEmpty>Keine Lehrkraft gefunden.</CommandEmpty>
                <CommandGroup>
                  {allTeachers.map((teacher) => {
                    const isSelected = selectedTeacherIds.includes(teacher.id)
                    return (
                      <CommandItem
                        key={teacher.id}
                        value={`${teacher.abbreviation} ${teacher.first_name} ${teacher.last_name}`}
                        onSelect={() => toggleTeacher(teacher.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          {teacher.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={teacher.image_url}
                              alt=""
                              className="h-6 w-6 rounded-full object-cover shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              <span className="text-[10px] font-bold text-primary">
                                {teacher.first_name.charAt(0)}
                                {teacher.last_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {teacherDisplayName(teacher)}
                            </p>
                            <p className="text-xs text-muted-foreground">@{teacher.abbreviation}</p>
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
