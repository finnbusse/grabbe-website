"use client"

/**
 * TeacherAuthorSelector — reusable component for selecting teacher(s) as
 * content authors.  Supports @-mention style search by abbreviation (Kürzel)
 * or name.  Selected teachers are shown as removable chips/badges.
 *
 * Usage:
 *   <TeacherAuthorSelector
 *     selectedTeacherIds={["uuid-1", "uuid-2"]}
 *     onChange={(ids) => setTeacherIds(ids)}
 *   />
 */

import { useState, useEffect, useRef, useCallback } from "react"
import { X, AtSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
}

interface TeacherAuthorSelectorProps {
  /** Currently selected teacher IDs */
  selectedTeacherIds: string[]
  /** Callback when selection changes */
  onChange: (teacherIds: string[]) => void
  /** Placeholder text (default: "@Kürzel eingeben…") */
  placeholder?: string
  /** Whether to allow multiple selections (default: true) */
  multiple?: boolean
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeacherAuthorSelector({
  selectedTeacherIds,
  onChange,
  placeholder = "@Kürzel eingeben…",
  multiple = true,
}: TeacherAuthorSelectorProps) {
  const [allTeachers, setAllTeachers] = useState<TeacherOption[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
            }))
          )
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // --- Derived data ---
  const selectedTeachers = allTeachers.filter((t) => selectedTeacherIds.includes(t.id))
  const available = allTeachers.filter((t) => !selectedTeacherIds.includes(t.id))

  // Filter by search value: strip leading "@" and match against abbreviation, first_name, last_name
  const searchTerm = inputValue.replace(/^@/, "").toLowerCase().trim()
  const filtered = searchTerm
    ? available.filter(
        (t) =>
          t.abbreviation.toLowerCase().includes(searchTerm) ||
          t.first_name.toLowerCase().includes(searchTerm) ||
          t.last_name.toLowerCase().includes(searchTerm) ||
          `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm)
      )
    : available

  // Clamp highlight
  const clampedHighlight = Math.min(highlightIndex, Math.max(0, filtered.length - 1))

  // --- Actions ---
  const addTeacher = useCallback(
    (teacherId: string) => {
      if (multiple) {
        onChange([...selectedTeacherIds, teacherId])
      } else {
        onChange([teacherId])
      }
      setInputValue("")
      setShowDropdown(false)
      setHighlightIndex(0)
      inputRef.current?.focus()
    },
    [multiple, onChange, selectedTeacherIds]
  )

  const removeTeacher = useCallback(
    (teacherId: string) => {
      onChange(selectedTeacherIds.filter((id) => id !== teacherId))
    },
    [onChange, selectedTeacherIds]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowDropdown(true)
    setHighlightIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filtered.length > 0 && showDropdown) {
        addTeacher(filtered[clampedHighlight].id)
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    } else if (e.key === "Backspace" && !inputValue && selectedTeacherIds.length > 0) {
      // Remove last selected on backspace in empty input
      removeTeacher(selectedTeacherIds[selectedTeacherIds.length - 1])
    }
  }

  if (loading) {
    return <p className="text-xs text-muted-foreground">Lehrkräfte laden…</p>
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Selected teacher chips */}
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 min-h-[38px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTeachers.map((teacher) => (
          <Badge
            key={teacher.id}
            className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 text-xs font-medium hover:bg-primary/15 gap-1"
          >
            <AtSign className="h-3 w-3" />
            {teacher.abbreviation.toUpperCase()}
            <span className="text-muted-foreground font-normal ml-0.5">
              ({genderPrefix(teacher.gender)}{genderPrefix(teacher.gender) ? " " : ""}{teacher.last_name})
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTeacher(teacher.id)
              }}
              className="ml-0.5 hover:opacity-70"
              aria-label={`${teacher.first_name} ${teacher.last_name} entfernen`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Input field */}
        {(multiple || selectedTeacherIds.length === 0) && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue || available.length > 0) setShowDropdown(true)
            }}
            placeholder={selectedTeacherIds.length === 0 ? placeholder : "@Kürzel…"}
            className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="relative">
          <div className="absolute top-0 left-0 z-20 w-full max-h-56 overflow-y-auto rounded-lg border bg-popover shadow-md">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                {searchTerm ? "Keine Lehrkraft gefunden" : "Alle Lehrkräfte zugewiesen"}
              </p>
            ) : (
              filtered.map((teacher, idx) => (
                <button
                  key={teacher.id}
                  type="button"
                  className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    idx === clampedHighlight ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => addTeacher(teacher.id)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                >
                  {/* Avatar / initials */}
                  {teacher.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={teacher.image_url}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <span className="text-[10px] font-bold text-primary">
                        {teacher.first_name.charAt(0)}
                        {teacher.last_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">
                      {genderPrefix(teacher.gender)}{genderPrefix(teacher.gender) ? " " : ""}
                      {teacher.first_name} {teacher.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">@{teacher.abbreviation}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
