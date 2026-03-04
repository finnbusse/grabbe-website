/**
 * School subjects (Schulfächer) used across the CMS.
 *
 * Each subject has a stable `id` (slug), a `name` (display label), and a
 * `shortName` (common abbreviation).  These are kept as plain constants so
 * that both client and server code can reference them without a DB call.
 *
 * When subjects are stored in the database (e.g. teacher_subjects junction)
 * they reference the `id` string, making it easy to match back.
 */

export interface Subject {
  /** Stable identifier / slug — used as FK in junction tables */
  id: string
  /** Full display name */
  name: string
  /** Common abbreviation (e.g. "Ma", "De", "En") */
  shortName: string
}

/**
 * The canonical list of subjects offered at the school (≈20).
 * Sorted alphabetically by name.
 */
export const SUBJECTS: Subject[] = [
  { id: "biologie",       name: "Biologie",                  shortName: "Bi" },
  { id: "chemie",         name: "Chemie",                    shortName: "Ch" },
  { id: "deutsch",        name: "Deutsch",                   shortName: "De" },
  { id: "englisch",       name: "Englisch",                  shortName: "En" },
  { id: "erdkunde",       name: "Erdkunde",                  shortName: "Ek" },
  { id: "evangelische-religion", name: "Evangelische Religion", shortName: "ER" },
  { id: "franzoesisch",   name: "Französisch",               shortName: "Fr" },
  { id: "geschichte",     name: "Geschichte",                shortName: "Ge" },
  { id: "informatik",     name: "Informatik",                shortName: "If" },
  { id: "katholische-religion", name: "Katholische Religion", shortName: "KR" },
  { id: "kunst",          name: "Kunst",                     shortName: "Ku" },
  { id: "latein",         name: "Latein",                    shortName: "La" },
  { id: "literatur",      name: "Literatur",                 shortName: "Li" },
  { id: "mathematik",     name: "Mathematik",                shortName: "Ma" },
  { id: "musik",          name: "Musik",                     shortName: "Mu" },
  { id: "paedagogik",     name: "Pädagogik",                 shortName: "Pa" },
  { id: "philosophie",    name: "Philosophie",                shortName: "Pl" },
  { id: "physik",         name: "Physik",                    shortName: "Ph" },
  { id: "politik",        name: "Politik/Wirtschaft",         shortName: "Pk" },
  { id: "sozialwissenschaften", name: "Sozialwissenschaften", shortName: "Sw" },
  { id: "sport",          name: "Sport",                     shortName: "Sp" },
]

/** Look up a subject by id */
export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id)
}

/** Look up multiple subjects by id list */
export function getSubjectsByIds(ids: string[]): Subject[] {
  return ids.map((id) => SUBJECTS.find((s) => s.id === id)).filter(Boolean) as Subject[]
}
