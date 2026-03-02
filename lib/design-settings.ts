// ---------------------------------------------------------------------------
// Design settings types & defaults — safe for both server and client imports
// ---------------------------------------------------------------------------

export interface DesignSettings {
  fonts: {
    heading: string   // Google Fonts family name or 'default'
    body: string
    accent: string
  }
  colors: {
    primary: string   // Tailwind color key e.g. "blue-600"
    darkPrimary: string
    subjectNaturwissenschaften: string
    darkSubjectNaturwissenschaften: string
    subjectMusik: string
    darkSubjectMusik: string
    subjectKunst: string
    darkSubjectKunst: string
    subjectSport: string
    darkSubjectSport: string
  }
}

export const DESIGN_DEFAULTS: DesignSettings = {
  fonts: { heading: "default", body: "default", accent: "default" },
  colors: {
    primary: "blue-600",
    darkPrimary: "blue-500",
    subjectNaturwissenschaften: "green-600",
    darkSubjectNaturwissenschaften: "green-500",
    subjectMusik: "orange-600",
    darkSubjectMusik: "orange-500",
    subjectKunst: "violet-600",
    darkSubjectKunst: "violet-500",
    subjectSport: "cyan-600",
    darkSubjectSport: "cyan-500",
  },
}

// ---------------------------------------------------------------------------
// Tailwind color palette — name → hex mapping
// ---------------------------------------------------------------------------
export const TAILWIND_COLORS: Record<string, string> = {
  "slate-300": "#cbd5e1", "slate-400": "#94a3b8", "slate-500": "#64748b", "slate-600": "#475569", "slate-700": "#334155", "slate-800": "#1e293b",
  "gray-300": "#d1d5db", "gray-400": "#9ca3af", "gray-500": "#6b7280", "gray-600": "#4b5563", "gray-700": "#374151", "gray-800": "#1f2937",
  "red-300": "#fca5a5", "red-400": "#f87171", "red-500": "#ef4444", "red-600": "#dc2626", "red-700": "#b91c1c", "red-800": "#991b1b",
  "orange-300": "#fdba74", "orange-400": "#fb923c", "orange-500": "#f97316", "orange-600": "#ea580c", "orange-700": "#c2410c", "orange-800": "#9a3412",
  "amber-300": "#fcd34d", "amber-400": "#fbbf24", "amber-500": "#f59e0b", "amber-600": "#d97706", "amber-700": "#b45309", "amber-800": "#92400e",
  "yellow-300": "#fde047", "yellow-400": "#facc15", "yellow-500": "#eab308", "yellow-600": "#ca8a04", "yellow-700": "#a16207", "yellow-800": "#854d0e",
  "lime-300": "#bef264", "lime-400": "#a3e635", "lime-500": "#84cc16", "lime-600": "#65a30d", "lime-700": "#4d7c0f", "lime-800": "#3f6212",
  "green-300": "#86efac", "green-400": "#4ade80", "green-500": "#22c55e", "green-600": "#16a34a", "green-700": "#15803d", "green-800": "#166534",
  "emerald-300": "#6ee7b7", "emerald-400": "#34d399", "emerald-500": "#10b981", "emerald-600": "#059669", "emerald-700": "#047857", "emerald-800": "#065f46",
  "teal-300": "#5eead4", "teal-400": "#2dd4bf", "teal-500": "#14b8a6", "teal-600": "#0d9488", "teal-700": "#0f766e", "teal-800": "#115e59",
  "cyan-300": "#67e8f9", "cyan-400": "#22d3ee", "cyan-500": "#06b6d4", "cyan-600": "#0891b2", "cyan-700": "#0e7490", "cyan-800": "#155e75",
  "sky-300": "#7dd3fc", "sky-400": "#38bdf8", "sky-500": "#0ea5e9", "sky-600": "#0284c7", "sky-700": "#0369a1", "sky-800": "#075985",
  "blue-300": "#93c5fd", "blue-400": "#60a5fa", "blue-500": "#3b82f6", "blue-600": "#2563eb", "blue-700": "#1d4ed8", "blue-800": "#1e40af",
  "indigo-300": "#a5b4fc", "indigo-400": "#818cf8", "indigo-500": "#6366f1", "indigo-600": "#4f46e5", "indigo-700": "#4338ca", "indigo-800": "#3730a3",
  "violet-300": "#c4b5fd", "violet-400": "#a78bfa", "violet-500": "#8b5cf6", "violet-600": "#7c3aed", "violet-700": "#6d28d9", "violet-800": "#5b21b6",
  "purple-300": "#d8b4fe", "purple-400": "#c084fc", "purple-500": "#a855f7", "purple-600": "#9333ea", "purple-700": "#7e22ce", "purple-800": "#6b21a8",
  "fuchsia-300": "#f0abfc", "fuchsia-400": "#e879f9", "fuchsia-500": "#d946ef", "fuchsia-600": "#c026d3", "fuchsia-700": "#a21caf", "fuchsia-800": "#86198f",
  "pink-300": "#f9a8d4", "pink-400": "#f472b6", "pink-500": "#ec4899", "pink-600": "#db2777", "pink-700": "#be185d", "pink-800": "#9d174d",
  "rose-300": "#fda4af", "rose-400": "#fb7185", "rose-500": "#f43f5e", "rose-600": "#e11d48", "rose-700": "#be123c", "rose-800": "#9f1239",
}

/** Colour family names in display order */
export const TAILWIND_COLOR_FAMILIES = [
  "blue", "sky", "cyan", "teal", "emerald", "green", "lime",
  "yellow", "amber", "orange", "red", "rose", "pink", "fuchsia",
  "purple", "violet", "indigo",
  "slate", "gray",
] as const

/** Shade steps available for each family */
export const TAILWIND_COLOR_SHADES = ["300", "400", "500", "600", "700", "800"] as const

/** Resolve a Tailwind key like "blue-600" to its hex value */
export function tailwindToHex(key: string): string {
  return TAILWIND_COLORS[key] ?? key // fallback: treat as raw hex for legacy values
}

/** Parse stored JSON into DesignSettings, falling back to defaults */
export function parseDesignSettings(raw: string | undefined): DesignSettings {
  if (!raw) return DESIGN_DEFAULTS
  try {
    const parsed = JSON.parse(raw) as Partial<DesignSettings>
    return {
      fonts: { ...DESIGN_DEFAULTS.fonts, ...parsed.fonts },
      colors: { ...DESIGN_DEFAULTS.colors, ...parsed.colors },
    }
  } catch {
    return DESIGN_DEFAULTS
  }
}
