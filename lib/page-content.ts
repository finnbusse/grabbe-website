/**
 * Page Content System
 * 
 * Provides editable content for static pages via the site_settings table.
 * Each page section stores its content as a JSON string under a key like:
 *   page_content:{pageId}
 * 
 * Content is loaded server-side at render time with hardcoded fallbacks,
 * so pages always display correctly even without DB entries.
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// Types
// ============================================================================

/** A single editable field definition */
export interface ContentFieldDefinition {
  key: string
  label: string
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'link' | 'list' | 'items'
  description?: string
  placeholder?: string
}

/** A group of related fields (displayed as a card in the editor) */
export interface ContentSectionDefinition {
  id: string
  title: string
  description?: string
  fields: ContentFieldDefinition[]
}

/** Full page definition for the editor */
export interface PageDefinition {
  id: string
  title: string
  description: string
  route: string
  sections: ContentSectionDefinition[]
  defaults: Record<string, unknown>
}

// ============================================================================
// Content Loading
// ============================================================================

/**
 * Load page content from the database, merging with defaults.
 * Falls back to defaults if no DB entry exists (no error thrown).
 */
export async function getPageContent<T extends Record<string, unknown>>(
  pageId: string,
  defaults: T
): Promise<T> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', `page_content:${pageId}`)
      .single()

    if (error || !data?.value) return defaults

    const stored = JSON.parse(data.value)
    // Deep merge: defaults provide structure, stored values override
    return { ...defaults, ...stored }
  } catch {
    return defaults
  }
}

/**
 * Load multiple page contents in a single query (for homepage with many sections).
 * Returns a map of pageId -> content.
 */
export async function getMultiplePageContents(
  pageIds: string[],
  defaultsMap: Record<string, Record<string, unknown>>
): Promise<Record<string, Record<string, unknown>>> {
  const result: Record<string, Record<string, unknown>> = {}
  
  try {
    const supabase = await createClient()
    const keys = pageIds.map(id => `page_content:${id}`)
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', keys)

    // Start with all defaults
    for (const id of pageIds) {
      result[id] = { ...(defaultsMap[id] || {}) }
    }

    // Override with stored values
    if (!error && data) {
      for (const row of data) {
        const pageId = row.key.replace('page_content:', '')
        try {
          const stored = JSON.parse(row.value)
          result[pageId] = { ...(defaultsMap[pageId] || {}), ...stored }
        } catch {
          // Invalid JSON, skip
        }
      }
    }
  } catch {
    // Return defaults on error
    for (const id of pageIds) {
      result[id] = { ...(defaultsMap[id] || {}) }
    }
  }

  return result
}

// ============================================================================
// Default Content Definitions for All Static Pages
// ============================================================================

export const PAGE_DEFAULTS = {
  // Homepage sections
  'homepage-hero': {
    headline1: 'Deine Talente.',
    headline2: 'Deine Bühne.',
    headline3: 'Dein Grabbe.',
    subtitle: 'Wir foerdern Deine Talente und staerken Deine Persoenlichkeit.',
    cta1_text: 'Anmeldung Klasse 5',
    cta1_link: '/unsere-schule/anmeldung',
    cta2_text: 'Profilprojekte entdecken',
    cta2_link: '/unsere-schule/profilprojekte',
    scroll_text: 'Entdecken',
  },
  'homepage-welcome': {
    label: 'Herzlich willkommen',
    headline: 'Entdecke das Grabbe',
    text: 'Liebe Freund:innen des Grabbe-Gymnasiums, die es sind und werden wollen. Mit neuem Schwung in innovativer Kraft entwickeln wir unsere Schule fuer Dich weiter. Das Grabbe-Gymnasium ist ein Ort des Lernens, der Begegnung und der persoenlichen Entfaltung im Herzen von Detmold.',
    card1_title: 'Talente foerdern',
    card1_text: 'Wir foerdern Deine Talente und staerken Deine Persoenlichkeit. Am Grabbe kannst Du Dich in den Profilprojekten Kunst, Musik, Sport und NaWi frei entfalten.',
    card2_title: 'Gemeinschaft leben',
    card2_text: 'Wir wuenschen uns glueckliche Schueler:innen in einer guten Gemeinschaft - mit Deinen Freund:innen. Durch gemeinsame Projekte und Klassenfahrten staerken wir den Zusammenhalt.',
    card3_title: 'Zukunft gestalten',
    card3_text: 'Wir gestalten Deine Zukunft mit Dir. Mit modernen Lernmethoden, digitaler Ausstattung und individueller Foerderung bereiten wir Dich optimal auf Studium und Beruf vor.',
    card4_title: 'Verantwortung uebernehmen',
    card4_text: 'Als UNESCO-Projektschule in Nordrhein-Westfalen setzen wir uns fuer Nachhaltigkeit, Toleranz und interkulturelles Lernen ein. Engagement ist bei uns gelebter Alltag.',
  },
  'homepage-profiles': {
    label: '// Profilprojekte',
    headline: 'Waehle Dein Profil',
    description: 'Gestalte frei - ohne Leistungsdruck! Die Profilprojekte in Kunst, Musik, Sport oder NaWi bieten dir die Moeglichkeit, in einer gemischten Gruppe neue Lernwege zu entdecken.',
    profile1_title: 'Kunstprojekt',
    profile1_tag: 'KNS',
    profile1_description: 'Der Kunstunterricht am Grabbe-Gymnasium versteht sich als bedeutsamer Baustein im Aufbau zukunftsrelevanter Kompetenzen. Im Projektkurs "Werkstatt Kunst" arbeiten die Schueler:innen ohne Notendruck projektbezogen.',
    profile2_title: 'Musikprojekt',
    profile2_tag: 'MSK',
    profile2_description: 'Im Musikprofil entdecken Schuelerinnen und Schueler ihre musikalischen Interessen, Kreativitaet und Begabungen - in Theorie und Praxis, individuell und im Miteinander. Teil des Schulversuchs "NRW-Musikprofil-Schule".',
    profile3_title: 'Sportprojekt',
    profile3_tag: 'SPR',
    profile3_description: 'Als eine der wenigen ausgewaehlten "Partnerschulen des Sports" in NRW bietet das Grabbe-Gymnasium allen jugendlichen Talenten die Chance, Schulausbildung mit optimaler Sportfoerderung zu verbinden.',
    profile4_title: 'NaWi-Projekt',
    profile4_tag: 'NWI',
    profile4_description: 'Im Profilprojekt NaWi entdecken die Schueler:innen die spannende Welt der Naturwissenschaften. Mit Neugier und Forschergeist gehen sie Phaenomenen aus Biologie, Chemie, Physik und Informatik auf den Grund.',
  },
  'homepage-info': {
    left_label: 'Erprobungsstufe',
    left_headline: 'Dein Start am Grabbe',
    left_text1: 'Die Jahrgaenge 5 und 6 bilden eine besondere paedagogische Einheit, die Erprobungsstufe. Waehrend dieser Zeit begleiten wir Ihre Kinder intensiv. Anknuepfend an die Lernerfahrungen in der Grundschule fuehren wir die Schueler:innen an die Unterrichtsmethoden und Lernangebote des Gymnasiums heran.',
    left_text2: 'Die Klassenbildung erfolgt nach sozialen Kriterien und beruecksichtigt neben der Grundschulzugehoerigkeit auch die Wunschpartner:innen. Eine einwoechige Klassenfahrt zu Beginn der sechsten Klasse festigt die Klassengemeinschaft.',
    left_quote: 'Ein Ort, an dem jedes Kind seinen Platz findet.',
    left_link_text: 'Mehr zur Erprobungsstufe',
    right_label: 'Beliebte Themen',
    right_headline: 'Schnellzugriff',
  },
  'homepage-nachmittag': {
    label: 'Nachmittags am Grabbe',
    headline: 'Verlaesslich und flexibel',
    attribution: 'Beate Bossmanns',
    text: 'Nach Unterrichtsschluss bietet das Grabbe-Gymnasium mit einem breiten Spektrum an Nachmittagsaktivitaeten eine verlaessliche und flexibel gestaltbare Betreuungszeit bis 15:30 Uhr an. Neben unserer verlaesslichen Nachmittagsbetreuung mit offenen Betreuungszeiten kann Ihr Kind aus zahlreichen AG-Angeboten waehlen oder in der Hausaufgabenbetreuung unter Anleitung unserer Schuelertutorinnen und -tutoren Hausaufgaben erledigen.',
    features_title: 'Betreuungsangebote',
    feature1: 'Offene Betreuungszeiten in modernen Raeumen',
    feature2: 'Zahlreiche AG-Angebote am Nachmittag',
    feature3: 'Hausaufgabenbetreuung durch Schuelertutoren',
    feature4: 'Module fuer ein halbes Jahr waehlbar',
    feature5: 'Mensa mit Kioskangebot und Mittagessen (LKS)',
    link_text: 'Weitere Informationen',
  },
  'homepage-partners': {
    label: 'Vernetzt in Detmold',
    headline: 'Unsere Partner',
    description: 'Wir bieten Ihren Kindern nicht nur in der Schule lebensnahe Erfahrungen, sondern auch mit unseren vertrauensvollen Partnern.',
    partners: 'Hochschule fuer Musik, Landestheater Detmold, Johanniter, Stadtbibliothek Detmold, Lippische Landesbibliothek, Landesarchiv NRW, Holocaust-Gedenkstaette Yad Vashem, McLean Highschool Washington, Wortmann KG, Weidmueller GmbH & Co KG, Peter-Glaesel-Schule Detmold',
  },
  'homepage-news': {
    label: 'Aktuelles',
    headline: 'Neuigkeiten vom Grabbe',
    all_link_text: 'Alle Beitraege',
    read_more_text: 'Weiterlesen',
    all_button_text: 'Alle Beitraege ansehen',
  },
  'homepage-calendar': {
    label: 'Termine',
    headline: 'Naechste Veranstaltungen',
    all_link_text: 'Alle Termine',
    empty_text: 'Aktuell sind keine Termine eingetragen.',
    all_button_text: 'Alle Termine ansehen',
  },

  // Static pages
  'erprobungsstufe': {
    page_label: 'Klassen 5 & 6',
    page_title: 'Erprobungsstufe',
    page_subtitle: 'Entdecke deine Talente! Bringe deine Ideen ein und mach sie sichtbar! Ich kann was - und es zaehlt!',
    card1_title: 'Deine Talente entdecken',
    card1_text: 'Du wirst zunehmend kreativer und selbststaendiger!',
    card2_title: 'Gemeinschaft bilden',
    card2_text: 'Wir beteiligen Dich an immer mehr Entscheidungen!',
    card3_title: 'Persoenlichkeit staerken',
    card3_text: 'Du kannst was - und es zaehlt!',
    content_p1: 'Die Jahrgaenge 5 und 6 bilden eine besondere paedagogische Einheit, die Erprobungsstufe. Waehrend dieser Zeit, die fuer Schueler:innen mit dem Uebergang von der Grundschule zum Gymnasium viele Veraenderungen mit sich bringt, begleiten wir Ihre Kinder intensiv. Anknuepfend an die Lernerfahrungen in der Grundschule fuehren wir die Schueler:innen an die Unterrichtsmethoden und Lernangebote des Gymnasiums heran.',
    content_p2: 'Das besondere Profil des Grabbe mit den Profilprojekten in Kunst, Musik, Sport oder NaWi bietet den Schueler:innen die Moeglichkeit, frei waehlbar in einem der vier Profilprojekte fuer ein Jahr in einer gemischten Gruppe neue Lernwege zu entdecken. Moderner, vom Leistungsdruck befreiter und die unterschiedlichen Talente und Neigungen der Schueler:innen foerdernder Projektunterricht steht dabei im Mittelpunkt.',
    content_p3: 'Die Klassenbildung erfolgt dabei nach sozialen Kriterien und beruecksichtigt dabei neben der Grundschulzugehoerigkeit auch die Wunschpartner:innen.',
    content_p4: 'Wir laden Sie vor den Sommerferien zu einem Begruessungsnachmittag ein, an dem Ihre Kinder ihre neuen Mitschueler:innen sowie ihr Klassenleitungsteam und ihren Klassenraum kennenlernen. Die ersten Unterrichtstage zum Kennenlernen gestaltet das Klassenleitungsteam mit einem paedagogischen Programm und auch in der Klassenleitungsstunde liegt der Schwerpunkt auf dem sozialen Lernen. Eine einwoechige Klassenfahrt zu Beginn der sechsten Klasse festigt weiterhin die Klassengemeinschaft.',
    cta1_text: 'Profilprojekte entdecken',
    cta2_text: 'Zur Anmeldung',
  },
} as const

// ============================================================================
// Page Definitions for the CMS Editor
// ============================================================================

export const EDITABLE_PAGES: PageDefinition[] = [
  {
    id: 'homepage-hero',
    title: 'Startseite: Hero-Bereich',
    description: 'Der grosse Banner-Bereich ganz oben auf der Startseite mit Ueberschriften und Buttons.',
    route: '/',
    sections: [
      {
        id: 'headlines',
        title: 'Ueberschriften',
        description: 'Die drei grossen Zeilen im Hero-Bereich',
        fields: [
          { key: 'headline1', label: 'Zeile 1', type: 'text', placeholder: 'z.B. Deine Talente.' },
          { key: 'headline2', label: 'Zeile 2', type: 'text', placeholder: 'z.B. Deine Bühne.' },
          { key: 'headline3', label: 'Zeile 3 (hervorgehoben)', type: 'text', placeholder: 'z.B. Dein Grabbe.' },
          { key: 'subtitle', label: 'Untertitel', type: 'text', placeholder: 'z.B. Wir foerdern Deine Talente...' },
        ],
      },
      {
        id: 'buttons',
        title: 'Buttons',
        description: 'Die zwei Aktions-Buttons im Hero-Bereich',
        fields: [
          { key: 'cta1_text', label: 'Button 1 Text', type: 'text' },
          { key: 'cta1_link', label: 'Button 1 Link', type: 'link' },
          { key: 'cta2_text', label: 'Button 2 Text', type: 'text' },
          { key: 'cta2_link', label: 'Button 2 Link', type: 'link' },
          { key: 'scroll_text', label: 'Scroll-Hinweis Text', type: 'text' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['homepage-hero'],
  },
  {
    id: 'homepage-welcome',
    title: 'Startseite: Willkommen',
    description: 'Der Willkommens-Bereich mit Einleitungstext und den vier Werte-Karten.',
    route: '/',
    sections: [
      {
        id: 'header',
        title: 'Ueberschrift & Text',
        fields: [
          { key: 'label', label: 'Kategorie-Label', type: 'text', placeholder: 'z.B. Herzlich willkommen' },
          { key: 'headline', label: 'Ueberschrift', type: 'text', placeholder: 'z.B. Entdecke das Grabbe' },
          { key: 'text', label: 'Einleitungstext', type: 'textarea' },
        ],
      },
      {
        id: 'card1',
        title: 'Karte 1',
        fields: [
          { key: 'card1_title', label: 'Titel', type: 'text' },
          { key: 'card1_text', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'card2',
        title: 'Karte 2',
        fields: [
          { key: 'card2_title', label: 'Titel', type: 'text' },
          { key: 'card2_text', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'card3',
        title: 'Karte 3',
        fields: [
          { key: 'card3_title', label: 'Titel', type: 'text' },
          { key: 'card3_text', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'card4',
        title: 'Karte 4',
        fields: [
          { key: 'card4_title', label: 'Titel', type: 'text' },
          { key: 'card4_text', label: 'Beschreibung', type: 'textarea' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['homepage-welcome'],
  },
  {
    id: 'homepage-profiles',
    title: 'Startseite: Profilprojekte',
    description: 'Die vier Profilprojekt-Karten auf der Startseite.',
    route: '/',
    sections: [
      {
        id: 'header',
        title: 'Ueberschrift & Text',
        fields: [
          { key: 'label', label: 'Kategorie-Label', type: 'text' },
          { key: 'headline', label: 'Ueberschrift', type: 'text' },
          { key: 'description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'profile1',
        title: 'Profil: Kunst',
        fields: [
          { key: 'profile1_title', label: 'Titel', type: 'text' },
          { key: 'profile1_tag', label: 'Kuerzel (3 Buchstaben)', type: 'text' },
          { key: 'profile1_description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'profile2',
        title: 'Profil: Musik',
        fields: [
          { key: 'profile2_title', label: 'Titel', type: 'text' },
          { key: 'profile2_tag', label: 'Kuerzel (3 Buchstaben)', type: 'text' },
          { key: 'profile2_description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'profile3',
        title: 'Profil: Sport',
        fields: [
          { key: 'profile3_title', label: 'Titel', type: 'text' },
          { key: 'profile3_tag', label: 'Kuerzel (3 Buchstaben)', type: 'text' },
          { key: 'profile3_description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'profile4',
        title: 'Profil: NaWi',
        fields: [
          { key: 'profile4_title', label: 'Titel', type: 'text' },
          { key: 'profile4_tag', label: 'Kuerzel (3 Buchstaben)', type: 'text' },
          { key: 'profile4_description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['homepage-profiles'],
  },
  {
    id: 'homepage-info',
    title: 'Startseite: Info & Schnellzugriff',
    description: 'Der Bereich mit Erprobungsstufen-Info und den Schnellzugriff-Links.',
    route: '/',
    sections: [
      {
        id: 'left',
        title: 'Linke Seite: Erprobungsstufe',
        fields: [
          { key: 'left_label', label: 'Label', type: 'text' },
          { key: 'left_headline', label: 'Ueberschrift', type: 'text' },
          { key: 'left_text1', label: 'Absatz 1', type: 'textarea' },
          { key: 'left_text2', label: 'Absatz 2', type: 'textarea' },
          { key: 'left_quote', label: 'Zitat', type: 'text' },
          { key: 'left_link_text', label: 'Link-Text', type: 'text' },
        ],
      },
      {
        id: 'right',
        title: 'Rechte Seite: Schnellzugriff',
        fields: [
          { key: 'right_label', label: 'Label', type: 'text' },
          { key: 'right_headline', label: 'Ueberschrift', type: 'text' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['homepage-info'],
  },
  {
    id: 'homepage-nachmittag',
    title: 'Startseite: Nachmittag',
    description: 'Der Nachmittags-Bereich mit Betreuungsangeboten.',
    route: '/',
    sections: [
      {
        id: 'header',
        title: 'Ueberschrift',
        fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'headline', label: 'Ueberschrift (Zitat)', type: 'text' },
          { key: 'attribution', label: 'Zitat-Quelle', type: 'text' },
          { key: 'text', label: 'Beschreibungstext', type: 'textarea' },
        ],
      },
      {
        id: 'features',
        title: 'Betreuungsangebote',
        fields: [
          { key: 'features_title', label: 'Bereich-Titel', type: 'text' },
          { key: 'feature1', label: 'Punkt 1', type: 'text' },
          { key: 'feature2', label: 'Punkt 2', type: 'text' },
          { key: 'feature3', label: 'Punkt 3', type: 'text' },
          { key: 'feature4', label: 'Punkt 4', type: 'text' },
          { key: 'feature5', label: 'Punkt 5', type: 'text' },
          { key: 'link_text', label: 'Link-Text', type: 'text' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['homepage-nachmittag'],
  },
  {
    id: 'homepage-partners',
    title: 'Startseite: Partner',
    description: 'Die Partner-Sektion mit scrollenden Partner-Namen.',
    route: '/',
    sections: [
      {
        id: 'content',
        title: 'Inhalt',
        fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'headline', label: 'Ueberschrift', type: 'text' },
          { key: 'description', label: 'Beschreibung', type: 'textarea' },
          { key: 'partners', label: 'Partner (kommagetrennt)', type: 'textarea', description: 'Geben Sie die Partner-Namen getrennt durch Komma ein.' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['homepage-partners'],
  },
  {
    id: 'homepage-news',
    title: 'Startseite: Neuigkeiten',
    description: 'Texte im Neuigkeiten-Bereich der Startseite.',
    route: '/',
    sections: [
      {
        id: 'texts',
        title: 'Texte',
        fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'headline', label: 'Ueberschrift', type: 'text' },
          { key: 'all_link_text', label: '"Alle Beitraege" Link-Text', type: 'text' },
          { key: 'read_more_text', label: '"Weiterlesen" Text', type: 'text' },
          { key: 'all_button_text', label: 'Button-Text unten', type: 'text' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['homepage-news'],
  },
  {
    id: 'homepage-calendar',
    title: 'Startseite: Termine',
    description: 'Texte im Termine-Bereich der Startseite.',
    route: '/',
    sections: [
      {
        id: 'texts',
        title: 'Texte',
        fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'headline', label: 'Ueberschrift', type: 'text' },
          { key: 'all_link_text', label: '"Alle Termine" Link-Text', type: 'text' },
          { key: 'empty_text', label: 'Text wenn keine Termine', type: 'text' },
          { key: 'all_button_text', label: 'Button-Text unten', type: 'text' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['homepage-calendar'],
  },
  {
    id: 'erprobungsstufe',
    title: 'Erprobungsstufe',
    description: 'Die Seite "Unsere Schule > Erprobungsstufe" mit Informationen zu Klasse 5 & 6.',
    route: '/unsere-schule/erprobungsstufe',
    sections: [
      {
        id: 'header',
        title: 'Seitenkopf',
        fields: [
          { key: 'page_label', label: 'Label', type: 'text' },
          { key: 'page_title', label: 'Seitentitel', type: 'text' },
          { key: 'page_subtitle', label: 'Untertitel', type: 'textarea' },
        ],
      },
      {
        id: 'cards',
        title: 'Werte-Karten',
        fields: [
          { key: 'card1_title', label: 'Karte 1: Titel', type: 'text' },
          { key: 'card1_text', label: 'Karte 1: Text', type: 'text' },
          { key: 'card2_title', label: 'Karte 2: Titel', type: 'text' },
          { key: 'card2_text', label: 'Karte 2: Text', type: 'text' },
          { key: 'card3_title', label: 'Karte 3: Titel', type: 'text' },
          { key: 'card3_text', label: 'Karte 3: Text', type: 'text' },
        ],
      },
      {
        id: 'content',
        title: 'Inhalt',
        description: 'Die Textabsaetze auf der Seite',
        fields: [
          { key: 'content_p1', label: 'Absatz 1', type: 'textarea' },
          { key: 'content_p2', label: 'Absatz 2', type: 'textarea' },
          { key: 'content_p3', label: 'Absatz 3', type: 'textarea' },
          { key: 'content_p4', label: 'Absatz 4', type: 'textarea' },
        ],
      },
      {
        id: 'buttons',
        title: 'Buttons',
        fields: [
          { key: 'cta1_text', label: 'Button 1 Text', type: 'text' },
          { key: 'cta2_text', label: 'Button 2 Text', type: 'text' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['erprobungsstufe'],
  },
]
