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

import { createStaticClient } from '@/lib/supabase/static'
import { unstable_cache } from 'next/cache'

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
    const stored = await unstable_cache(
      async () => {
        const supabase = createStaticClient()
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', `page_content:${pageId}`)
          .single()

        if (error || !data?.value) return null
        return JSON.parse(data.value) as Record<string, unknown>
      },
      ['page-content', pageId],
      { revalidate: 3600, tags: ['page-content', 'settings'] }
    )()

    if (!stored) return defaults
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
    const cacheKey = [...pageIds].sort().join(',')
    const rows = await unstable_cache(
      async () => {
        const supabase = createStaticClient()
        const keys = pageIds.map(id => `page_content:${id}`)
        
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', keys)

        if (error || !data) return [] as Array<{ key: string; value: string }>
        return data
      },
      ['page-contents-batch', cacheKey],
      { revalidate: 3600, tags: ['page-content', 'settings'] }
    )()

    // Start with all defaults
    for (const id of pageIds) {
      result[id] = { ...(defaultsMap[id] || {}) }
    }

    // Override with stored values
    for (const row of rows) {
      const pageId = row.key.replace('page_content:', '')
      try {
        const stored = JSON.parse(row.value)
        result[pageId] = { ...(defaultsMap[pageId] || {}), ...stored }
      } catch {
        // Invalid JSON, skip
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
    subtitle: 'Wir fördern Deine Talente und stärken Deine Persönlichkeit.',
    cta1_text: 'Anmeldung Klasse 5',
    cta1_link: '/unsere-schule/anmeldung',
    cta2_text: 'Profilprojekte entdecken',
    cta2_link: '/unsere-schule/profilprojekte',
    scroll_text: 'Entdecken',
  },
  'homepage-welcome': {
    label: 'Herzlich willkommen',
    headline: 'Entdecke das Grabbe',
    text: 'Liebe Freund:innen des Grabbe-Gymnasiums, die es sind und werden wollen. Mit neuem Schwung in innovativer Kraft entwickeln wir unsere Schule für Dich weiter. Das Grabbe-Gymnasium ist ein Ort des Lernens, der Begegnung und der persönlichen Entfaltung im Herzen von Detmold.',
    card1_title: 'Talente fördern',
    card1_text: 'Wir fördern Deine Talente und stärken Deine Persönlichkeit. Am Grabbe kannst Du Dich in den Profilprojekten Kunst, Musik, Sport und NaWi frei entfalten.',
    card2_title: 'Gemeinschaft leben',
    card2_text: 'Wir wünschen uns glückliche Schüler:innen in einer guten Gemeinschaft - mit Deinen Freund:innen. Durch gemeinsame Projekte und Klassenfahrten stärken wir den Zusammenhalt.',
    card3_title: 'Zukunft gestalten',
    card3_text: 'Wir gestalten Deine Zukunft mit Dir. Mit modernen Lernmethoden, digitaler Ausstattung und individueller Förderung bereiten wir Dich optimal auf Studium und Beruf vor.',
    card4_title: 'Verantwortung übernehmen',
    card4_text: 'Als UNESCO-Projektschule in Nordrhein-Westfalen setzen wir uns für Nachhaltigkeit, Toleranz und interkulturelles Lernen ein. Engagement ist bei uns gelebter Alltag.',
  },
  'homepage-profiles': {
    label: '// Profilprojekte',
    headline: 'Wähle Dein Profil',
    description: 'Gestalte frei - ohne Leistungsdruck! Die Profilprojekte in Kunst, Musik, Sport oder NaWi bieten dir die Möglichkeit, in einer gemischten Gruppe neue Lernwege zu entdecken.',
    profile1_title: 'Kunstprojekt',
    profile1_tag: 'KNS',
    profile1_description: 'Der Kunstunterricht am Grabbe-Gymnasium versteht sich als bedeutsamer Baustein im Aufbau zukunftsrelevanter Kompetenzen. Im Projektkurs "Werkstatt Kunst" arbeiten die Schüler:innen ohne Notendruck projektbezogen.',
    profile2_title: 'Musikprojekt',
    profile2_tag: 'MSK',
    profile2_description: 'Im Musikprofil entdecken Schülerinnen und Schüler ihre musikalischen Interessen, Kreativität und Begabungen - in Theorie und Praxis, individuell und im Miteinander. Teil des Schulversuchs "NRW-Musikprofil-Schule".',
    profile3_title: 'Sportprojekt',
    profile3_tag: 'SPR',
    profile3_description: 'Als eine der wenigen ausgewählten "Partnerschulen des Sports" in NRW bietet das Grabbe-Gymnasium allen jugendlichen Talenten die Chance, Schulausbildung mit optimaler Sportförderung zu verbinden.',
    profile4_title: 'NaWi-Projekt',
    profile4_tag: 'NWI',
    profile4_description: 'Im Profilprojekt NaWi entdecken die Schüler:innen die spannende Welt der Naturwissenschaften. Mit Neugier und Forschergeist gehen sie Phänomenen aus Biologie, Chemie, Physik und Informatik auf den Grund.',
  },
  'homepage-info': {
    left_label: 'Erprobungsstufe',
    left_headline: 'Dein Start am Grabbe',
    left_text1: 'Die Jahrgänge 5 und 6 bilden eine besondere pädagogische Einheit, die Erprobungsstufe. Während dieser Zeit begleiten wir Ihre Kinder intensiv. Anknüpfend an die Lernerfahrungen in der Grundschule führen wir die Schüler:innen an die Unterrichtsmethoden und Lernangebote des Gymnasiums heran.',
    left_text2: 'Die Klassenbildung erfolgt nach sozialen Kriterien und berücksichtigt neben der Grundschulzugehörigkeit auch die Wunschpartner:innen. Eine einwöchige Klassenfahrt zu Beginn der sechsten Klasse festigt die Klassengemeinschaft.',
    left_quote: 'Ein Ort, an dem jedes Kind seinen Platz findet.',
    left_link_text: 'Mehr zur Erprobungsstufe',
    right_label: 'Beliebte Themen',
    right_headline: 'Schnellzugriff',
  },
  'homepage-nachmittag': {
    label: 'Nachmittags am Grabbe',
    headline: 'Verlässlich und flexibel',
    attribution: 'Beate Bossmanns',
    text: 'Nach Unterrichtsschluss bietet das Grabbe-Gymnasium mit einem breiten Spektrum an Nachmittagsaktivitäten eine verlässliche und flexibel gestaltbare Betreuungszeit bis 15:30 Uhr an. Neben unserer verlässlichen Nachmittagsbetreuung mit offenen Betreuungszeiten kann Ihr Kind aus zahlreichen AG-Angeboten wählen oder in der Hausaufgabenbetreuung unter Anleitung unserer Schülertutorinnen und -tutoren Hausaufgaben erledigen.',
    features_title: 'Betreuungsangebote',
    feature1: 'Offene Betreuungszeiten in modernen Räumen',
    feature2: 'Zahlreiche AG-Angebote am Nachmittag',
    feature3: 'Hausaufgabenbetreuung durch Schülertutoren',
    feature4: 'Module für ein halbes Jahr wählbar',
    feature5: 'Mensa mit Kioskangebot und Mittagessen (LKS)',
    link_text: 'Weitere Informationen',
  },
  'homepage-partners': {
    label: 'Vernetzt in Detmold',
    headline: 'Unsere Partner',
    description: 'Wir bieten Ihren Kindern nicht nur in der Schule lebensnahe Erfahrungen, sondern auch mit unseren vertrauensvollen Partnern.',
    partners: 'Hochschule für Musik, Landestheater Detmold, Johanniter, Stadtbibliothek Detmold, Lippische Landesbibliothek, Landesarchiv NRW, Holocaust-Gedenkstätte Yad Vashem, McLean Highschool Washington, Wortmann KG, Weidmüller GmbH & Co KG, Peter-Gläsel-Schule Detmold',
  },
  'homepage-news': {
    label: 'Aktuelles',
    headline: 'Neuigkeiten vom Grabbe',
    all_link_text: 'Alle Beiträge',
    read_more_text: 'Weiterlesen',
    all_button_text: 'Alle Beiträge ansehen',
  },
  'homepage-calendar': {
    label: 'Termine',
    headline: 'Nächste Veranstaltungen',
    all_link_text: 'Alle Termine',
    empty_text: 'Aktuell sind keine Termine eingetragen.',
    all_button_text: 'Alle Termine ansehen',
  },

  // Static pages
  'erprobungsstufe': {
    page_label: 'Klassen 5 & 6',
    page_title: 'Erprobungsstufe',
    page_subtitle: 'Entdecke deine Talente! Bringe deine Ideen ein und mach sie sichtbar! Ich kann was - und es zählt!',
    hero_image_url: '',
    card1_title: 'Deine Talente entdecken',
    card1_text: 'Du wirst zunehmend kreativer und selbstständiger!',
    card2_title: 'Gemeinschaft bilden',
    card2_text: 'Wir beteiligen Dich an immer mehr Entscheidungen!',
    card3_title: 'Persönlichkeit stärken',
    card3_text: 'Du kannst was - und es zählt!',
    content_p1: 'Die Jahrgänge 5 und 6 bilden eine besondere pädagogische Einheit, die Erprobungsstufe. Während dieser Zeit, die für Schüler:innen mit dem Übergang von der Grundschule zum Gymnasium viele Veränderungen mit sich bringt, begleiten wir Ihre Kinder intensiv. Anknüpfend an die Lernerfahrungen in der Grundschule führen wir die Schüler:innen an die Unterrichtsmethoden und Lernangebote des Gymnasiums heran.',
    content_p2: 'Das besondere Profil des Grabbe mit den Profilprojekten in Kunst, Musik, Sport oder NaWi bietet den Schüler:innen die Möglichkeit, frei wählbar in einem der vier Profilprojekte für ein Jahr in einer gemischten Gruppe neue Lernwege zu entdecken. Moderner, vom Leistungsdruck befreiter und die unterschiedlichen Talente und Neigungen der Schüler:innen fördernder Projektunterricht steht dabei im Mittelpunkt.',
    content_p3: 'Die Klassenbildung erfolgt dabei nach sozialen Kriterien und berücksichtigt dabei neben der Grundschulzugehörigkeit auch die Wunschpartner:innen.',
    content_p4: 'Wir laden Sie vor den Sommerferien zu einem Begrüßungsnachmittag ein, an dem Ihre Kinder ihre neuen Mitschüler:innen sowie ihr Klassenleitungsteam und ihren Klassenraum kennenlernen. Die ersten Unterrichtstage zum Kennenlernen gestaltet das Klassenleitungsteam mit einem pädagogischen Programm und auch in der Klassenleitungsstunde liegt der Schwerpunkt auf dem sozialen Lernen. Eine einwöchige Klassenfahrt zu Beginn der sechsten Klasse festigt weiterhin die Klassengemeinschaft.',
    cta1_text: 'Profilprojekte entdecken',
    cta2_text: 'Zur Anmeldung',
  },

  // Profilprojekte
  'profilprojekte': {
    page_label: 'Unser besonderes Profil',
    page_title: 'Profilprojekte',
    page_subtitle: 'Wähle das Profilprojekt nach deinen Interessen! Gestalte frei - ohne Leistungsdruck! In Klasse 5 und 6 kannst du in einem der vier Profilprojekte neue Lernwege entdecken.',
    hero_image_url: '',
    kunst_title: 'Kunstprojekt',
    kunst_p1: 'Das Fach Kunst ist durch selbstbestimmtes Handeln und anschauliches Denken geprägt, was Lernen besonders nachhaltig macht und zum ganzheitlichen Erleben und Verstehen der Wirklichkeit führt. Dies ist bedeutsam in Bezug auf die zunehmende Ästhetisierung und Virtualisierung der Lebenswelt. Durch die Stärkung der Ich-Identität ermöglicht das Fach Kunst den Kindern, sich in der Welt zu behaupten und diese als gestaltbar und veränderbar zu begreifen.',
    kunst_p2: 'Der Kunstunterricht am Grabbe-Gymnasium versteht sich so als bedeutsamer und hochwertiger Baustein im Aufbau zukunftsrelevanter Kompetenzen für alle Schüler und Schülerinnen.',
    kunst_p3: 'Neben den für alle Gymnasien obligatorischen Wochenstunden im Fach Kunst wird in den Klassen 5 und 6 ein Projektkurs "Werkstatt Kunst - Unsere Welt mit den Augen von Künstlerinnen und Künstlern" zusätzlich verankert. Dies bietet weiteren Freiraum, in dem die Schülerinnen und Schüler ohne Notendruck projektbezogen arbeiten können.',
    kunst_p4: 'Dem Profilprojekt liegt ein ganzheitliches und erfahrungsbezogenes Konzept zugrunde, in dem in besonderer Weise der künstlerische Prozess im Mittelpunkt steht. Ein Anliegen des Kurses ist u.a. die Sensibilisierung und Schärfung der Wahrnehmung, die Auseinandersetzung mit der eigenen Lebenswelt und der Aufbau künstlerischen Ausdrucks.',
    musik_title: 'Musikprojekt',
    musik_p1: 'Im Musikprofil entdecken Schülerinnen und Schüler ihre musikalischen Interessen, Kreativität und Begabungen - in Theorie und Praxis, individuell und im Miteinander. Der Musikunterricht bildet dabei das kontinuierliche Rückgrat ihrer musikalischen Bildung.',
    musik_p2: 'Ergänzend zum Musikunterricht wird im Musikprofil Instrumentalunterricht in Kooperation mit externen Instrumentallehrkräften angeboten. Im zweiten Halbjahr des Jahrgangs 5 wird die instrumentale Praxis im Profilorchester intensiviert und vertieft.',
    musik_p3: 'Im Musikprojekt arbeiten die Schülerinnen und Schüler praxisorientiert in unterschiedlichen Vorhaben: Instrument & Stimme (Jg. 5.1), Profilorchester (Jg. 5.2, wöchentlich), Klang & Szene (Jg. 6).',
    musik_p4: 'Darüber hinaus bieten die AG-Angebote vielfältige Möglichkeiten Musik aktiv zu leben. Die Ensembles arbeiten jahrgangsübergreifend und fördern Begabungen nachhaltig und individuell. Das Profilfach Musik ist Teil des Schulversuchs "NRW-Musikprofil-Schule".',
    sport_title: 'Sportprojekt',
    sport_p1: 'Als eine der wenigen ausgewählten "Partnerschulen des Sports" in NRW zeichnet sich das Grabbe-Gymnasium durch ein besonders sportfreundliches Klima aus und bietet allen jugendlichen Talenten die Chance, eine fundierte Schulausbildung mit einer optimalen Sportförderung zu verbinden.',
    sport_p2: 'Diese Förderung erfolgt u.a. durch frei wählbare Sport-Projektkurse, vielfältige Sport-AGs in den Sportarten Kunstturnen, Fussball, Leichtathletik und Volleyball und die besondere Unterstützung von leistungssport-orientierten Schülerinnen und Schülern.',
    sport_p3: 'Regelmäßig nehmen Schulmannschaften des Grabbe-Gymnasiums erfolgreich an Schulwettkämpfen teil. Basierend auf einer engen Zusammenarbeit von Schule, Verein, Eltern und Schülerinnen und Schülern werden darüber hinaus individuelle Lösungen für Kaderathleten gefunden, sodass sportliche Begabungen in besonderer Form gefördert werden.',
    nawi_title: 'NaWi-Projekt',
    nawi_p1: 'Im Profilprojekt NaWi entdecken die Schülerinnen und Schüler der Klassen 5 und 6 die spannende Welt der Naturwissenschaften. Mit Neugier und Forschergeist gehen sie Phänomenen aus Biologie, Chemie, Physik und Informatik auf den Grund - immer mit dem Ziel, durch eigenes Beobachten, Experimentieren und Nachdenken Zusammenhänge in der Natur und Technik zu verstehen.',
    nawi_p2: 'Im Mittelpunkt steht das selbstständige und entdeckende Lernen. Die Kinder lernen, Fragen zu stellen, eigene Ideen zu entwickeln, Versuche zu planen und ihre Ergebnisse zu präsentieren. So erwerben sie nicht nur naturwissenschaftliches Wissen, sondern auch wichtige Fähigkeiten wie Teamarbeit, Genauigkeit und Ausdauer.',
    nawi_p3: 'Die Themen orientieren sich an der Lebenswelt der Kinder und wechseln mit den Jahreszeiten. Ob beim Erkunden der Sinne, beim Beobachten von Pflanzen und Tieren, beim Experimentieren mit Wasser und Energie oder beim Untersuchen von Wetterphänomenen - überall steht das eigene Erleben und Ausprobieren im Vordergrund. Digitale Messgeräte und Sensoren helfen dabei, Daten zu erfassen und wissenschaftlich auszuwerten.',
    nawi_p4: 'Ergänzt wird das Profilprojekt durch Wettbewerbe und Exkursionen, die Einblicke in die Anwendung naturwissenschaftlicher Erkenntnisse geben und die Freude am Forschen vertiefen. Dass die Naturwissenschaften an unserer Schule einen besonderen Stellenwert haben, zeigt die wiederholte Auszeichnung durch die Initiative "MINT Zukunft Schaffen!". Als MINT-freundliche Schule legen wir grossen Wert darauf, Begeisterung für Mathematik, Informatik, Naturwissenschaften und Technik zu wecken und zu fördern.',
  },

  // Oberstufe
  'oberstufe': {
    page_label: 'Sekundarstufe II',
    page_title: 'Oberstufe',
    page_subtitle: 'Informationen zur gymnasialen Oberstufe am Grabbe-Gymnasium Detmold',
    hero_image_url: '',

    // Quick access links (comma-separated label:anchor pairs)
    quicklinks: 'Formulare:#antraege,Klausurpläne:#klausuren,Beratung:#beratung,Fehlzeiten:#fehlzeiten,Laufbahn:#laufbahn,Facharbeit:#facharbeit',

    // Overview section
    overview_title: 'Die gymnasiale Oberstufe',
    overview_text: 'Die Regeldauer der gymnasialen Oberstufe beträgt drei Jahre. In der Einführungsphase werden die Schülerinnen und Schüler mit den inhaltlichen und methodischen Anforderungen der Oberstufe vertraut gemacht. Der Unterricht findet nicht mehr im Klassenverband statt, sondern in Grundkursen. Diese sind in der Regel dreistündig, in der neu einsetzenden Fremdsprache vierstündig. Auf der Grundlage der Vorgaben der APO-GOSt können Fächer und Schwerpunkte nach individuellen Stärken und Neigungen gewählt werden.',
    overview_quali: 'Zu Beginn der Qualifikationsphase werden aus den bisher belegten Kursen zwei als Leistungskurse ausgewählt, die jeweils fünfstündig unterrichtet werden. Die zweijährige Qualifikationsphase baut auf den in der Einführungsphase erworbenen Grundlagen auf und bereitet auf die Abiturprüfung vor. Die im Laufe der Qualifikationsphase erbrachten Leistungen gehen bereits als Block I in die Abiturendnote ein.',
    overview_stunden: 'Im Laufe der Oberstufe sind insgesamt 102 Wochenstunden zu belegen, davon 34 in der Einführungsphase. Die Kernunterrichtszeit endet mit der 9. Stunde, in Ausnahmefällen liegen Kurse aber auch am späteren Nachmittag.',
    overview_stammgruppen: 'Zur Erleichterung des Übergangs in die Oberstufe wird am Grabbe-Gymnasium der Unterricht in den in der Regel von allen belegten Fächern Deutsch, Mathematik, Englisch und Sport in der Einführungsphase noch in Stammgruppen erteilt, sodass die Schülerinnen und Schüler in diesen Fächern immer mit derselben Lerngruppe Unterricht haben.',
    overview_realschule: 'Traditionell liegt uns besonders die Förderung von Schülerinnen und Schülern aus der Realschule am Herzen, die ihre Schullaufbahn in der gymnasialen Oberstufe fortsetzen möchten. Diesen bieten wir individuelle Hospitationsangebote und Beratungstermine an. Vertiefungskurse in Deutsch, Mathematik und Englisch in der Einführungsphase bieten allen Schülerinnen und Schülern die Möglichkeit, Defizite in diesen für den Erfolg in der Oberstufe zentralen Fächern aufzuarbeiten.',
    overview_kooperation: 'Aufgrund der guten Kooperation mit den beiden anderen Detmolder Gymnasien können wir unseren Schülerinnen und Schülern in der Oberstufe ein breites Leistungskurs-Angebot machen, darunter Kunst, Musik und Sport als Besonderheiten unseres Schulprofils. Im Bereich der Fremdsprachen bieten wir zur Zeit Latein, Spanisch und Französisch als neu einsetzende Fremdsprachen an, Englisch, Französisch und Latein als fortgeführte Fremdsprachen.',
    overview_abschlüsse: 'Neben der Allgemeinen Hochschulreife können die Schülerinnen und Schüler in der Oberstufe auch den schulischen Teil der Fachhochschulreife erwerben. Schülerinnen und Schüler, die Latein gewählt haben, können zusätzlich das Latinum erwerben.',
    overview_extras: 'Darüber hinaus bereitet die Oberstufe durch gezielte Förderung des wissenschaftspropädeutischen Arbeitens, z.B. im Rahmen der Facharbeitsvorbereitung, und ein vielfältiges Angebot an Berufsorientierungsmaßnahmen auf das Leben nach der Schule vor. Im Bereich unserer Profilfächer können die Schülerinnen und Schüler aus einem breiten Angebot an AGs und instrumental- und vokalpraktischen Kursen auswählen.',

    // Anträge section
    antraege_title: 'Anträge & Formulare',
    antraege_buecher: 'Wer den Termin zur Bücherausgabe verpasst oder ein Schulbuch verloren hat, kann sich direkt an Herrn Rieche wenden. Dieser ist auch für die Erstellung der Schülerausweise zuständig.',
    antraege_wlan: 'Schülerinnen und Schüler, die einen WLAN-Zugang bekommen möchten, können diesen bei Frau Knueppel beantragen, indem sie das Antragsformular herunterladen und ausgefüllt im Lehrerzimmer abgeben.',
    antraege_tablet: 'Wer sein privates Tablet im Unterricht nutzen möchte, kann dies durch Abgabe des unterschriebenen Tablet-Knigges beantragen.',
    antraege_office: 'Alle Lehrenden und Lernenden unserer Schule haben die Möglichkeit, Office 365 zu nutzen; dafür ist kein gesonderter Antrag erforderlich. Die Anmeldedaten von IServ verwenden. Tipp: Bei Anmeldung direkt bei Office den Nutzerinnennamen in der Form mit ...@grabbe-dt.de wählen.',
    // Tag IDs for modular tagged content blocks (configured in CMS)
    antraege_downloads_tag_id: '',

    // Beratung section
    beratung_title: 'Beratungsangebote',
    beratung_text: 'Grundlage für die Laufbahnberatung sind die Vorgaben der APO-GOSt, deren zentrale Inhalte in der Broschüre zur Gymnasialen Oberstufe zusammengefasst dargestellt werden.',
    beratung_team: 'EF: Frau Knueppel (j.knueppel@grabbe.nrw.schule) & Frau Wormuth (f.wormuth@grabbe.nrw.schule)\nQ1: Frau Mannebach (b.mannebach@grabbe.nrw.schule) & Frau Seidel (s.seidel@grabbe.nrw.schule)\nKoordination: Frau Mannebach (b.mannebach@grabbe.nrw.schule)',
    beratung_additional: 'Die Stufenleiterinnen und Stufenleiter sind auch Ansprechpartner bei persönlichen Problemen; darüber hinaus könnt ihr die Beratungsangebote des Beratungsteams (Frau Moebus und Frau Bossmanns) nutzen. Frau Bossmanns und Frau Holste-Doerksen bieten auch Lerncoaching oder Hilfe beim Umgang mit Prüfungsangst und anderen Lernproblemen an.',
    beratung_arbeit: 'Zusätzliche Beratung zu den Themen Ausbildung und Studium bietet Frau Roedding von der Agentur für Arbeit an, die regelmäßig eine Sprechstunde am Grabbe abhält. (Terminreservierung durch Eintrag in die Liste im BO-Ordner bei IServ.)',

    // Unterrichtsausfall section
    ausfall_title: 'Verfahren bei Unterrichtsausfall',
    ausfall_text: 'Die Schülerinnen und Schüler haben die Pflicht, sich über Aufgaben und Inhalt der eigenverantwortlichen Lernzeit zu informieren, und bearbeiten das bereitgestellte Material gewissenhaft und vollständig. Diese Leistung fließt in die sonstige Mitarbeitsnote ein, da sie eine Unterrichtseinheit ersetzt.',
    ausfall_vorhersehbar: 'Liegt eine vorhersehbare Abwesenheit der Lehrperson vor, bekommen die Schülerinnen und Schüler in der Regel in der Stunde zuvor Aufgaben und Materialien, an denen sie in den ausfallenden Stunden arbeiten können.',
    ausfall_unvorhersehbar: 'Liegt eine unvorhersehbare Abwesenheit der Lehrperson vor, so stellt diese in der Regel über ein im Kurs vereinbartes digitales Distributionsverfahren Material zur Verfügung (z.B. per E-Mail, über das Aufgabenmodul oder den Kursordner auf IServ). Wenn die Lehrperson keine Aufgaben zur Bearbeitung vorgesehen hat, nutzen die Schülerinnen und Schüler die Lernzeit eigenverantwortlich. Auf dem Vertretungsplan erscheint dann ein entsprechender Vermerk (EVA für "eigenverantwortliches Arbeiten").',

    // Vertretungsplan
    vertretung_title: 'Vertretungsplan',
    vertretung_text: 'Der Vertretungsplan steht über WebUntis zur Verfügung. Antrag (siehe unter Anträge oder im Dateimanager) ausfüllen und abgeben, dann App (Untis Mobile) herunterladen. Alternativ: Info-Displays im Neubau-Foyer oder im Altbau benutzen!',

    // Laufbahnplanung
    laufbahn_title: 'Laufbahnplanung',
    laufbahn_text: 'Weitere Informationen z.B. zum Zentralabitur oder einzelnen Fächern sind auch auf den Seiten des Ministeriums zugänglich.',
    laufbahn_links: 'Bildungsportal NRW|https://www.schulministerium.nrw.de,FAQ zur Oberstufe|https://www.schulministerium.nrw.de/themen/schulsystem/schulformen/gymnasium/gymnasiale-oberstufe,Standardsicherung NRW|https://www.standardsicherung.schulministerium.nrw.de',
    laufbahn_downloads_tag_id: '',

    // Klausuren
    klausuren_title: 'Klausuren',
    klausuren_text: 'Die Klausurpläne werden hier jeweils zu Beginn des Halbjahres veröffentlicht und im Kasten im Neubaufoyer ausgehängt. Bitte meldet euch umgehend, falls für euch trotz sorgfältiger Prüfung versehentlich mehr als drei Klausuren pro Woche angesetzt sind oder es andere Terminschwierigkeiten gibt.',
    klausuren_nachschreiben: 'Schülerinnen und Schüler, die eine Klausur aus von ihnen zu vertretenden Gründen versäumen (z.B. Termin falsch notiert, verschlafen usw.), haben keinen Anspruch auf eine Nachschreibklausur; für alle anderen finden jeweils gegen Ende eines Quartals Nachschreibtermine statt.',
    klausuren_downloads_tag_id: '',

    // Fehlzeiten
    fehlzeiten_title: 'Fehlzeiten und Beurlaubungen',
    fehlzeiten_text: 'Das Schulgesetz sieht vor, dass die Schule unverzüglich zu benachrichtigen ist, wenn Schüler:innen durch Krankheit oder aus anderen nicht vorhersehbaren Gründen verhindert sind, die Schule zu besuchen. Wie in der Sekundarstufe I erfolgt diese Benachrichtigung zunächst durch die Erziehungsberechtigten über deren WebUntis-Zugang. Volljährige Schüler:innen können die Eintragung selbst vornehmen.',
    fehlzeiten_entschuldigung: 'Die Erziehungsberechtigten bzw. die volljährigen Schüler:innen sind laut Schulgesetz ebenfalls verpflichtet, den Grund für das Schulversäumnis schriftlich mitzuteilen. Dies geschieht über das Entschuldigungsformular. Das Entschuldigungsformular muss unmittelbar nach der Rückkehr in den Unterricht, spätestens jedoch eine Woche nach dem letzten Krankheitstag, in Papierform bei der Stufenleitung eingereicht werden.',
    fehlzeiten_beurlaubung: 'Bei allen im Voraus absehbaren Terminen (z.B. nicht akut bedingte Arztbesuche, Fahrprüfung) ist rechtzeitig ein Antrag auf Beurlaubung vom Unterricht zu stellen. Für Tage, an denen Klausuren oder andere Prüfungen angesetzt sind, kann eine Beurlaubung nur in begründeten Ausnahmefällen gewährt werden.',
    fehlzeiten_hinweis: 'Fehlzeiten, für die nicht innerhalb einer Woche nach Rückkehr in den Unterricht eine Entschuldigung vorgelegt worden ist, gelten als unentschuldigt und können als nicht erbrachte Leistungen in die Notengebung einfließen. Schülerinnen und Schüler sind verpflichtet, den versäumten Stoff selbstständig nachzuarbeiten.',
    fehlzeiten_downloads_tag_id: '',

    // Facharbeit
    facharbeit_title: 'Facharbeit',
    facharbeit_text: 'Alle Informationen zur Facharbeit finden sich hier. Bitte beachtet den Terminplan für das aktuelle Schuljahr und die Handreichung zur Facharbeit.',
    facharbeit_downloads_tag_id: '',

    // Berufsorientierung
    berufsorientierung_title: 'Berufsorientierung',
    berufsorientierung_text: 'Umfangreiche Informationen zur Berufsorientierung finden sich in unserem Berufsorientierungsportal.',
    berufsorientierung_link: '/schulleben/faecher-ags',

    // Studium & Stipendien
    stipendien_title: 'Studium & Stipendien',
    stipendien_text: 'Die Bewerbungskriterien ergeben sich oft aus dem Charakter der Stiftungen, z.B. wird häufig neben guten schulischen Leistungen auch gesellschaftliches oder politisches Engagement erwartet. Einige Angebote richten sich auch an Auszubildende oder sind auf bestimmte Personengruppen beschränkt.',
    stipendien_links: 'Studieren ab 15 (Uni Bielefeld)|https://www.uni-bielefeld.de/studium/studienangebot/studieren-ab-15/,Studifinder|https://www.studifinder.de,Stipendienfinder des DAAD|https://www.daad.de/de/studieren-und-forschen-in-deutschland/stipendien-finden/,Studienstiftung des Deutschen Volkes|https://www.studienstiftung.de,Deutschlandstipendium|https://www.deutschlandstipendium.de,Mystipendium|https://www.mystipendium.de',

    // Abitur
    abitur_title: 'Informationen zum Abitur',
    abitur_text: 'Im Schuljahr 2025/26 gibt es aufgrund des Wechsels vom G8- zum G9-System keine Abiturprüfungen am Grabbe.',

    // Tagged content block IDs (CMS-configurable)
    events_tag_id: '',
    news_tag_id: '',
  },

  // Anmeldung
  'anmeldung': {
    page_label: 'Herzlich willkommen',
    page_title: 'Anmeldung',
    page_subtitle: 'Wir freuen uns, dass Sie Ihr Kind bei uns am Grabbe anmelden wollen.',
    hero_image_url: '',
    klasse5_title: 'Anmeldung Klasse 5',
    klasse5_subtitle: 'Schuljahr 2026/27',
    klasse5_text: 'Liebe Eltern und Erziehungsberechtigte, wir freuen uns, dass Sie Ihr Kind bei uns am Grabbe anmelden wollen. Alle weiteren Infos zur Erprobungsstufe (Konzept etc.) finden sich auf der Seite zur Erprobungsstufe.',
    klasse5_checklist: 'Anmeldeformular (Unterschrift BEIDER Erziehungsberechtigten),Einwilligung Datenverarbeitung,Kopie der Geburtsurkunde,Das letzte Zeugnis,Nachweis über erfolgte Masernimpfung',
    oberstufe_title: 'Anmeldung Oberstufe',
    oberstufe_subtitle: 'Einführungsphase',
    oberstufe_text1: 'Wir freuen uns über Ihr/euer Interesse an unserer Schule! Die Anmeldewoche für die Oberstufe findet vom 23. bis 27.02.2026 statt. Die Terminvergabe erfolgt unter Tel. 05231 992617 oder per Mail an b.mannebach@grabbe.nrw.schule.',
    oberstufe_text2: 'Gerne können Interessent:innen sich auch im Vorfeld der Anmeldewoche persönlich oder telefonisch beraten lassen oder ein bis zwei Tage bei uns hospitieren.',
    oberstufe_checklist: 'Anmeldeformular (Unterschrift BEIDER Erziehungsberechtigten),Einwilligung Datenverarbeitung,Antrag auf Busfahrkarte,Kopie der Geburtsurkunde,Letztes Zeugnis,Nachweis Masernimpfung',
    oberstufe_hinweis: 'Voraussetzung für die Aufnahme in die Sekundarstufe II ist die Berechtigung zum Besuch der gymnasialen Oberstufe, die am Gymnasium durch die Versetzung am Ende der Jahrgangsstufe 10 oder an anderen Schulformen durch den Erwerb des Mittleren Schulabschlusses mit Q-Vermerk erworben wird.',
  },

  // Fächer & AGs
  'faecher-ags': {
    page_label: 'Schulleben',
    page_title: 'Fächer & Arbeitsgemeinschaften',
    page_subtitle: 'Viele Fächer warten auf dich! Am Nachmittag hast du bei uns die freie Wahl!',
    hero_image_url: '',
    intro_text: 'Das Grabbe-Gymnasium wird zum Lebensort Ihrer Kinder. Ihre Kinder können sich in vielen verschiedenen Fächern mit engagierten Kolleg:innen bilden. Sie haben nach Englisch die Möglichkeit, Französisch oder Latein und später Spanisch zu wählen. Alle Naturwissenschaften und Informatik werden einzeln und auch verbunden, wie in der Natur, angeboten. Die Gesellschaftswissenschaften runden das immer wichtigere Thema rund um Nachhaltigkeit, Demokratiebildung und geschichtliche Verantwortung und mehr ab. Ganz besonders betonen wir die Bildung im Bereich Kunst, Musik und Sport und NaWi.',
    cat1_title: 'Sprachen, Kunst, Musik',
    cat1_desc: 'Nach Englisch wählen Sie Französisch oder Latein, später Spanisch. Besonders betonen wir Kunst, Musik und Sport.',
    cat2_title: 'MINT',
    cat2_desc: 'Alle Naturwissenschaften und Informatik werden einzeln und verbunden angeboten. MINT-freundliche Schule!',
    cat3_title: 'Gesellschaft',
    cat3_desc: 'Nachhaltigkeit, Demokratiebildung und geschichtliche Verantwortung runden das Angebot ab.',
    cat4_title: 'Weitere Fächer',
    cat4_desc: 'Ein breites Spektrum an weiteren Fächern mit engagierten Kolleg:innen erwartet dich.',
  },

  // Nachmittag
  'nachmittag': {
    page_label: 'Schulleben',
    page_title: 'Nachmittags am Grabbe',
    page_subtitle: '"Verlässlich und flexibel" - Beate Bossmanns',
    hero_image_url: '',
    text_p1: 'Nach Unterrichtsschluss bietet das Grabbe-Gymnasium mit einem breiten Spektrum an Nachmittagsaktivitäten eine verlässliche und flexibel gestaltbare Betreuungszeit bis 15:30 Uhr an. Neben unserer verlässlichen Nachmittagsbetreuung mit offenen Betreuungszeiten in unseren modernen Betreuungsräumen, die von engagierten Betreuungskräften geleitet wird, kann Ihr Kind aus zahlreichen AG-Angeboten wählen oder in der Hausaufgabenbetreuung unter der Anleitung unserer Schülertutorinnen und -tutoren Hausaufgaben erledigen.',
    text_p2: 'Alle Angebote sind miteinander kombinierbar, sodass Sie die Nachmittagsgestaltung Ihres Kindes auf Ihre individuellen Betreuungswünsche anpassen können.',
    text_p3: 'Module der Hausaufgabenbetreuung und Arbeitsgemeinschaften werden für ein halbes Jahr gewählt. In der Mensa stehen zudem jeden Tag durch unseren Schulcaterer LKS - Pop & Corn sowohl ein ansprechendes Kioskangebot als auch ein reichhaltiges Mittagsessenangebot in Buffetform zur Verfügung.',
    card1_title: 'Betreuungszeiten',
    card1_text: 'Verlässliche Betreuung bis 15:30 Uhr mit offenen Zeiten in modernen Räumen.',
    card2_title: 'Arbeitsgemeinschaften',
    card2_text: 'Zahlreiche AG-Angebote für ein halbes Jahr wählbar.',
    card3_title: 'Hausaufgabenbetreuung',
    card3_text: 'Unter Anleitung von Schülertutorinnen und -tutoren.',
    card4_title: 'Mensa & Kiosk',
    card4_text: 'Täglich Mittagessen in Buffetform und Kioskangebot durch LKS.',
    combined_title: 'Alle Angebote kombinierbar',
    combined_items: 'Offene Betreuungszeiten,AG-Angebote,Hausaufgabenbetreuung,Mittagessen',
  },

  // Netzwerk
  'netzwerk': {
    page_label: 'Schulleben',
    page_title: 'Vernetzt in Detmold',
    page_subtitle: 'Wir bieten Ihren Kindern nicht nur in der Schule lebensnahe Erfahrungen, sondern auch mit unseren vertrauensvollen Partnern.',
    hero_image_url: '',
    partners: 'Hochschule für Musik|Kultur,Landestheater Detmold|Kultur,Johanniter|Soziales,Stadtbibliothek Detmold|Bildung,Lippische Landesbibliothek|Bildung,Landesarchiv NRW|Bildung,Holocaust-Gedenkstätte Yad Vashem|Gedenken,McLean Highschool Washington|International,Wortmann KG|Wirtschaft,Weidmüller GmbH & Co KG|Wirtschaft,Peter-Gläsel-Schule Detmold|Bildung',
  },

  // Kontakt
  'kontakt': {
    page_label: 'Wer, Was, Wo?',
    page_title: 'Kontakt',
    page_subtitle: 'Kommunikation miteinander macht den Grabbe-Spirit aus.',
    hero_image_url: '',
    address_name: 'Christian-Dietrich-Grabbe-Gymnasium',
    address_street: 'Küster-Meyer-Platz 2',
    address_city: '32756 Detmold',
    phone: '05231 - 99260',
    fax: '05231 - 992616',
    email: 'sekretariat@grabbe.nrw.schule',
    travel_info: 'Du bist in höchstens 30 min bei uns',
    steuergruppe_title: 'Steuergruppe Schulentwicklung',
    steuergruppe_text: 'Herr Beckmann, Frau Bossmanns, Frau Knueppel, Herr Wessel mit Herrn Dr. Hilbing',
    contacts: 'Schulleitung|Dr. Claus Hilbing|Personal- und Organisationsentwicklung, Unterrichtsverteilung,Ständige Vertretung (komm.)|Tanja Brentrup-Lappe|Haushaltsmittel, Schulgebäude und Schulanlagen,Erprobungsstufe (Kl. 5-6)|Herr Hecker|Koordination der Erprobungsstufe,Mittelstufe (Kl. 7-10)|Dr. Chee|Koordination der Mittelstufe,Oberstufe|Frau Mannebach|Koordination der gymnasialen Oberstufe,Verwaltung|Herr Schilling|Koordination der Verwaltung',
  },

  // Impressum
  'impressum': {
    page_title: 'Impressum',
    hero_image_url: '',
    verantwortlich: 'Dr. Claus Hilbing und Oliver Sprenger',
    anschrift: 'Christian-Dietrich-Grabbe-Gymnasium, Küster-Meyer-Platz 2, 32756 Detmold',
    kontakt_info: 'Telefon: 05231 - 99260, Telefax: 05231 - 992616, E-Mail: sekretariat@grabbe.nrw.schule',
    schultraeger: 'Stadt Detmold',
    aufsichtsbehoerde: 'Bezirksregierung Detmold',
  },

  // Datenschutz
  'datenschutz': {
    page_title: 'Datenschutz',
    hero_image_url: '',
    intro_text: 'Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschliesslich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, DSG-NRW, SchulG NRW). In diesen Datenschutzinformationen informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.',
    verantwortlicher: 'Christian-Dietrich-Grabbe-Gymnasium, Küster-Meyer-Platz 2, 32756 Detmold, Telefon: 05231 - 99260, E-Mail: sekretariat@grabbe.nrw.schule',
    hosting_text: 'Diese Website wird bei Vercel Inc. gehostet. Die Server befinden sich in der EU. Beim Besuch unserer Website werden automatisch technisch notwendige Daten erhoben (IP-Adresse, Zeitpunkt des Zugriffs, abgerufene Seite). Diese Daten werden ausschliesslich zum Betrieb der Website und zur Sicherstellung der Systemsicherheit verarbeitet.',
  },
  // Aktuelles
  'aktuelles': {
    hero_image_url: '',
  },

  // Termine
  'termine': {
    hero_image_url: '',
  },

  // Downloads
  'downloads': {
    hero_image_url: '',
  },

  // Landing pages (category overviews)
  'landing-unterricht': {
    page_label: 'Bildung',
    page_title: 'Unterricht',
    page_subtitle: 'Unser Unterrichtsangebot am Grabbe-Gymnasium – von der Erprobungsstufe bis zum Abitur.',
    hero_image_url: '',
    intro_text: 'Das Grabbe-Gymnasium bietet ein breites und modernes Unterrichtsangebot. Von der Erprobungsstufe über die Mittelstufe bis zum Abitur begleiten wir unsere Schüler:innen mit engagierten Lehrkräften, individueller Förderung und einem besonderen Profil in Kunst, Musik, Sport und Naturwissenschaften.',
  },
  'landing-unterricht-faecher': {
    page_label: 'Unterricht',
    page_title: 'Fächer',
    page_subtitle: 'Alle Fächer am Grabbe-Gymnasium im Überblick – von Sprachen über MINT bis Gesellschaftswissenschaften.',
    hero_image_url: '',
    intro_text: 'Am Grabbe-Gymnasium unterrichten wir ein breites Spektrum an Fächern. Unsere engagierten Fachlehrkräfte begleiten die Schüler:innen von der Erprobungsstufe bis zum Abitur und fördern individuelle Stärken und Interessen.',
  },
  'landing-schulleben': {
    page_label: 'Gemeinschaft',
    page_title: 'Schulleben',
    page_subtitle: 'Das Grabbe-Gymnasium ist mehr als Unterricht – entdecke unser vielfältiges Schulleben.',
    hero_image_url: '',
    intro_text: 'Am Grabbe-Gymnasium wird Gemeinschaft grossgeschrieben. Neben dem Unterricht bieten wir zahlreiche Arbeitsgemeinschaften, eine verlässliche Nachmittagsbetreuung und ein starkes Netzwerk mit Partnern aus Kultur, Wirtschaft und Bildung. Hier findest du alle Bereiche unseres Schullebens.',
  },
  'landing-unsere-schule': {
    page_label: 'Willkommen',
    page_title: 'Unsere Schule',
    page_subtitle: 'Das Grabbe-Gymnasium Detmold – ein Ort des Lernens, der Begegnung und der persönlichen Entfaltung.',
    hero_image_url: '',
    intro_text: 'Das Grabbe-Gymnasium liegt im Herzen von Detmold und bietet Schüler:innen von der fünften Klasse bis zum Abitur ein vielfältiges Bildungsangebot. Mit unseren Profilprojekten, einer engagierten Schulgemeinschaft und moderner Ausstattung gestalten wir Schule als Lebensort.',
  },
} as const

// ============================================================================
// Page Definitions for the CMS Editor
// ============================================================================

/** Reusable hero image section added to every editable sub-page */
const HERO_IMAGE_SECTION: ContentSectionDefinition = {
  id: 'hero',
  title: 'Hero-Bild',
  description: 'Bild das rechts oben im Seitenkopf angezeigt wird. Ohne Bild wird automatisch ein blauer Platzhalter generiert.',
  fields: [
    {
      key: 'hero_image_url',
      label: 'Hero-Bild',
      type: 'image',
      description: 'Empfohlene Größe: 800x600 px oder größer, Querformat.',
    },
  ],
}

export const EDITABLE_PAGES: PageDefinition[] = [
  {
    id: 'homepage-hero',
    title: 'Startseite: Hero-Bereich',
    description: 'Der grosse Banner-Bereich ganz oben auf der Startseite mit Überschriften und Buttons.',
    route: '/',
    sections: [
      {
        id: 'headlines',
        title: 'Überschriften',
        description: 'Die drei grossen Zeilen im Hero-Bereich',
        fields: [
          { key: 'headline1', label: 'Zeile 1', type: 'text', placeholder: 'z.B. Deine Talente.' },
          { key: 'headline2', label: 'Zeile 2', type: 'text', placeholder: 'z.B. Deine Bühne.' },
          { key: 'headline3', label: 'Zeile 3 (hervorgehoben)', type: 'text', placeholder: 'z.B. Dein Grabbe.' },
          { key: 'subtitle', label: 'Untertitel', type: 'text', placeholder: 'z.B. Wir fördern Deine Talente...' },
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
        title: 'Überschrift & Text',
        fields: [
          { key: 'label', label: 'Kategorie-Label', type: 'text', placeholder: 'z.B. Herzlich willkommen' },
          { key: 'headline', label: 'Überschrift', type: 'text', placeholder: 'z.B. Entdecke das Grabbe' },
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
        title: 'Überschrift & Text',
        fields: [
          { key: 'label', label: 'Kategorie-Label', type: 'text' },
          { key: 'headline', label: 'Überschrift', type: 'text' },
          { key: 'description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'profile1',
        title: 'Profil: Kunst',
        fields: [
          { key: 'profile1_title', label: 'Titel', type: 'text' },
          { key: 'profile1_tag', label: 'Kürzel (3 Buchstaben)', type: 'text' },
          { key: 'profile1_description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'profile2',
        title: 'Profil: Musik',
        fields: [
          { key: 'profile2_title', label: 'Titel', type: 'text' },
          { key: 'profile2_tag', label: 'Kürzel (3 Buchstaben)', type: 'text' },
          { key: 'profile2_description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'profile3',
        title: 'Profil: Sport',
        fields: [
          { key: 'profile3_title', label: 'Titel', type: 'text' },
          { key: 'profile3_tag', label: 'Kürzel (3 Buchstaben)', type: 'text' },
          { key: 'profile3_description', label: 'Beschreibung', type: 'textarea' },
        ],
      },
      {
        id: 'profile4',
        title: 'Profil: NaWi',
        fields: [
          { key: 'profile4_title', label: 'Titel', type: 'text' },
          { key: 'profile4_tag', label: 'Kürzel (3 Buchstaben)', type: 'text' },
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
          { key: 'left_headline', label: 'Überschrift', type: 'text' },
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
          { key: 'right_headline', label: 'Überschrift', type: 'text' },
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
        title: 'Überschrift',
        fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'headline', label: 'Überschrift (Zitat)', type: 'text' },
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
          { key: 'headline', label: 'Überschrift', type: 'text' },
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
          { key: 'headline', label: 'Überschrift', type: 'text' },
          { key: 'all_link_text', label: '"Alle Beiträge" Link-Text', type: 'text' },
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
          { key: 'headline', label: 'Überschrift', type: 'text' },
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
        description: 'Die Textabsätze auf der Seite',
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
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['erprobungsstufe'],
  },
  {
    id: 'profilprojekte',
    title: 'Profilprojekte',
    description: 'Die Seite "Unsere Schule > Profilprojekte" mit den vier Profilprojekten Kunst, Musik, Sport und NaWi.',
    route: '/unsere-schule/profilprojekte',
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
        id: 'kunst',
        title: 'Kunstprojekt',
        fields: [
          { key: 'kunst_title', label: 'Titel', type: 'text' },
          { key: 'kunst_p1', label: 'Absatz 1', type: 'textarea' },
          { key: 'kunst_p2', label: 'Absatz 2', type: 'textarea' },
          { key: 'kunst_p3', label: 'Absatz 3', type: 'textarea' },
          { key: 'kunst_p4', label: 'Absatz 4', type: 'textarea' },
        ],
      },
      {
        id: 'musik',
        title: 'Musikprojekt',
        fields: [
          { key: 'musik_title', label: 'Titel', type: 'text' },
          { key: 'musik_p1', label: 'Absatz 1', type: 'textarea' },
          { key: 'musik_p2', label: 'Absatz 2', type: 'textarea' },
          { key: 'musik_p3', label: 'Absatz 3', type: 'textarea' },
          { key: 'musik_p4', label: 'Absatz 4', type: 'textarea' },
        ],
      },
      {
        id: 'sport',
        title: 'Sportprojekt',
        fields: [
          { key: 'sport_title', label: 'Titel', type: 'text' },
          { key: 'sport_p1', label: 'Absatz 1', type: 'textarea' },
          { key: 'sport_p2', label: 'Absatz 2', type: 'textarea' },
          { key: 'sport_p3', label: 'Absatz 3', type: 'textarea' },
        ],
      },
      {
        id: 'nawi',
        title: 'NaWi-Projekt',
        fields: [
          { key: 'nawi_title', label: 'Titel', type: 'text' },
          { key: 'nawi_p1', label: 'Absatz 1', type: 'textarea' },
          { key: 'nawi_p2', label: 'Absatz 2', type: 'textarea' },
          { key: 'nawi_p3', label: 'Absatz 3', type: 'textarea' },
          { key: 'nawi_p4', label: 'Absatz 4', type: 'textarea' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['profilprojekte'],
  },
  {
    id: 'oberstufe',
    title: 'Oberstufe',
    description: 'Die Seite "Unsere Schule > Oberstufe" mit umfassenden Informationen zur gymnasialen Oberstufe.',
    route: '/unsere-schule/oberstufe',
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
        id: 'quicklinks',
        title: 'Schnellzugriff',
        description: 'Links für den Schnellzugriff oben rechts auf der Seite. Format: Anzeigename:#anker (kommagetrennt)',
        fields: [
          { key: 'quicklinks', label: 'Schnellzugriff-Links', type: 'textarea', description: 'Format: Anzeigename:#anker,Anzeigename2:#anker2 — Anker müssen zu Abschnitts-IDs auf der Seite passen.' },
        ],
      },
      {
        id: 'overview',
        title: 'Die gymnasiale Oberstufe',
        description: 'Allgemeine Informationen zur Oberstufe',
        fields: [
          { key: 'overview_title', label: 'Titel', type: 'text' },
          { key: 'overview_text', label: 'Einführungstext', type: 'textarea' },
          { key: 'overview_quali', label: 'Qualifikationsphase', type: 'textarea' },
          { key: 'overview_stunden', label: 'Wochenstunden', type: 'textarea' },
          { key: 'overview_stammgruppen', label: 'Stammgruppen', type: 'textarea' },
          { key: 'overview_realschule', label: 'Realschule/Vertiefungskurse', type: 'textarea' },
          { key: 'overview_kooperation', label: 'Kooperation/Leistungskurse', type: 'textarea' },
          { key: 'overview_abschlüsse', label: 'Abschlüsse', type: 'textarea' },
          { key: 'overview_extras', label: 'Weitere Angebote', type: 'textarea' },
        ],
      },
      {
        id: 'antraege',
        title: 'Anträge & Formulare',
        description: 'Informationen zu Bücher, Ausweisen, WLAN, Tablets und Office 365',
        fields: [
          { key: 'antraege_title', label: 'Titel', type: 'text' },
          { key: 'antraege_buecher', label: 'Bücher & Ausweise', type: 'textarea' },
          { key: 'antraege_wlan', label: 'WLAN-Zugang', type: 'textarea' },
          { key: 'antraege_tablet', label: 'Tablet-Nutzung', type: 'textarea' },
          { key: 'antraege_office', label: 'Office 365', type: 'textarea' },
          { key: 'antraege_downloads_tag_id', label: 'Downloads-Tag (für Formulare)', type: 'text', description: 'Tag-ID eingeben, um verknüpfte Dokumente automatisch anzuzeigen. Tag-IDs findest du unter CMS > Tags.' },
        ],
      },
      {
        id: 'beratung',
        title: 'Beratungsangebote',
        fields: [
          { key: 'beratung_title', label: 'Titel', type: 'text' },
          { key: 'beratung_text', label: 'Einführungstext', type: 'textarea' },
          { key: 'beratung_team', label: 'Oberstufenteam (Zeilenumbruch = neue Zeile)', type: 'textarea' },
          { key: 'beratung_additional', label: 'Weitere Beratung', type: 'textarea' },
          { key: 'beratung_arbeit', label: 'Agentur für Arbeit', type: 'textarea' },
        ],
      },
      {
        id: 'ausfall',
        title: 'Unterrichtsausfall',
        fields: [
          { key: 'ausfall_title', label: 'Titel', type: 'text' },
          { key: 'ausfall_text', label: 'Allgemein', type: 'textarea' },
          { key: 'ausfall_vorhersehbar', label: 'Vorhersehbar', type: 'textarea' },
          { key: 'ausfall_unvorhersehbar', label: 'Unvorhersehbar', type: 'textarea' },
        ],
      },
      {
        id: 'vertretung',
        title: 'Vertretungsplan',
        fields: [
          { key: 'vertretung_title', label: 'Titel', type: 'text' },
          { key: 'vertretung_text', label: 'Text', type: 'textarea' },
        ],
      },
      {
        id: 'laufbahn',
        title: 'Laufbahnplanung',
        fields: [
          { key: 'laufbahn_title', label: 'Titel', type: 'text' },
          { key: 'laufbahn_text', label: 'Text', type: 'textarea' },
          { key: 'laufbahn_links', label: 'Externe Links (Format: Name|URL, kommagetrennt)', type: 'textarea' },
          { key: 'laufbahn_downloads_tag_id', label: 'Downloads-Tag (für Laufbahn-Dokumente)', type: 'text', description: 'Tag-ID eingeben, um verknüpfte Dokumente automatisch anzuzeigen.' },
        ],
      },
      {
        id: 'klausuren',
        title: 'Klausuren',
        fields: [
          { key: 'klausuren_title', label: 'Titel', type: 'text' },
          { key: 'klausuren_text', label: 'Text', type: 'textarea' },
          { key: 'klausuren_nachschreiben', label: 'Nachschreiben', type: 'textarea' },
          { key: 'klausuren_downloads_tag_id', label: 'Downloads-Tag (für Klausurpläne)', type: 'text', description: 'Tag-ID eingeben, um verknüpfte Dokumente automatisch anzuzeigen.' },
        ],
      },
      {
        id: 'fehlzeiten',
        title: 'Fehlzeiten und Beurlaubungen',
        fields: [
          { key: 'fehlzeiten_title', label: 'Titel', type: 'text' },
          { key: 'fehlzeiten_text', label: 'Allgemein', type: 'textarea' },
          { key: 'fehlzeiten_entschuldigung', label: 'Entschuldigung', type: 'textarea' },
          { key: 'fehlzeiten_beurlaubung', label: 'Beurlaubung', type: 'textarea' },
          { key: 'fehlzeiten_hinweis', label: 'Wichtige Hinweise', type: 'textarea' },
          { key: 'fehlzeiten_downloads_tag_id', label: 'Downloads-Tag (für Formulare)', type: 'text', description: 'Tag-ID eingeben, um verknüpfte Dokumente automatisch anzuzeigen.' },
        ],
      },
      {
        id: 'facharbeit',
        title: 'Facharbeit',
        fields: [
          { key: 'facharbeit_title', label: 'Titel', type: 'text' },
          { key: 'facharbeit_text', label: 'Text', type: 'textarea' },
          { key: 'facharbeit_downloads_tag_id', label: 'Downloads-Tag (für Facharbeit-Dokumente)', type: 'text', description: 'Tag-ID eingeben, um verknüpfte Dokumente automatisch anzuzeigen.' },
        ],
      },
      {
        id: 'berufsorientierung',
        title: 'Berufsorientierung',
        fields: [
          { key: 'berufsorientierung_title', label: 'Titel', type: 'text' },
          { key: 'berufsorientierung_text', label: 'Text', type: 'textarea' },
          { key: 'berufsorientierung_link', label: 'Link zum Portal', type: 'text' },
        ],
      },
      {
        id: 'stipendien',
        title: 'Studium & Stipendien',
        fields: [
          { key: 'stipendien_title', label: 'Titel', type: 'text' },
          { key: 'stipendien_text', label: 'Text', type: 'textarea' },
          { key: 'stipendien_links', label: 'Links (Format: Name|URL, kommagetrennt)', type: 'textarea' },
        ],
      },
      {
        id: 'abitur',
        title: 'Abitur',
        fields: [
          { key: 'abitur_title', label: 'Titel', type: 'text' },
          { key: 'abitur_text', label: 'Text', type: 'textarea' },
        ],
      },
      {
        id: 'tagged-content',
        title: 'Dynamische Inhalte (Tags)',
        description: 'Hier können Tags ausgewählt werden, um Termine, News und Downloads automatisch auf der Oberstufenseite anzuzeigen. Tag-IDs findest du unter CMS > Tags.',
        fields: [
          { key: 'events_tag_id', label: 'Tag für Oberstufen-Termine', type: 'text', description: 'Tag-ID für Termine, die auf der Oberstufenseite angezeigt werden sollen.' },
          { key: 'news_tag_id', label: 'Tag für Oberstufen-News', type: 'text', description: 'Tag-ID für Beiträge/News, die auf der Oberstufenseite angezeigt werden sollen.' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['oberstufe'],
  },
  {
    id: 'anmeldung',
    title: 'Anmeldung',
    description: 'Die Seite "Unsere Schule > Anmeldung" mit Informationen zur Anmeldung für Klasse 5 und Oberstufe.',
    route: '/unsere-schule/anmeldung',
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
        id: 'klasse5',
        title: 'Anmeldung Klasse 5',
        fields: [
          { key: 'klasse5_title', label: 'Titel', type: 'text' },
          { key: 'klasse5_subtitle', label: 'Untertitel', type: 'text' },
          { key: 'klasse5_text', label: 'Text', type: 'textarea' },
          { key: 'klasse5_checklist', label: 'Checkliste (kommagetrennt)', type: 'textarea', description: 'Einträge getrennt durch Komma eingeben.' },
        ],
      },
      {
        id: 'oberstufe',
        title: 'Anmeldung Oberstufe',
        fields: [
          { key: 'oberstufe_title', label: 'Titel', type: 'text' },
          { key: 'oberstufe_subtitle', label: 'Untertitel', type: 'text' },
          { key: 'oberstufe_text1', label: 'Text 1', type: 'textarea' },
          { key: 'oberstufe_text2', label: 'Text 2', type: 'textarea' },
          { key: 'oberstufe_checklist', label: 'Checkliste (kommagetrennt)', type: 'textarea', description: 'Einträge getrennt durch Komma eingeben.' },
          { key: 'oberstufe_hinweis', label: 'Hinweis', type: 'textarea' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['anmeldung'],
  },
  {
    id: 'faecher-ags',
    title: 'Fächer & Arbeitsgemeinschaften',
    description: 'Die Seite "Schulleben > Fächer & AGs" mit Fächerübersicht und Kategorien.',
    route: '/schulleben/faecher-ags',
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
        id: 'intro',
        title: 'Einleitung',
        fields: [
          { key: 'intro_text', label: 'Einleitungstext', type: 'textarea' },
        ],
      },
      {
        id: 'categories',
        title: 'Kategorien',
        fields: [
          { key: 'cat1_title', label: 'Kategorie 1: Titel', type: 'text' },
          { key: 'cat1_desc', label: 'Kategorie 1: Beschreibung', type: 'textarea' },
          { key: 'cat2_title', label: 'Kategorie 2: Titel', type: 'text' },
          { key: 'cat2_desc', label: 'Kategorie 2: Beschreibung', type: 'textarea' },
          { key: 'cat3_title', label: 'Kategorie 3: Titel', type: 'text' },
          { key: 'cat3_desc', label: 'Kategorie 3: Beschreibung', type: 'textarea' },
          { key: 'cat4_title', label: 'Kategorie 4: Titel', type: 'text' },
          { key: 'cat4_desc', label: 'Kategorie 4: Beschreibung', type: 'textarea' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['faecher-ags'],
  },
  {
    id: 'nachmittag',
    title: 'Nachmittags am Grabbe',
    description: 'Die Seite "Schulleben > Nachmittag" mit Betreuungsangeboten und Informationen.',
    route: '/schulleben/nachmittag',
    sections: [
      {
        id: 'header',
        title: 'Seitenkopf',
        fields: [
          { key: 'page_label', label: 'Label', type: 'text' },
          { key: 'page_title', label: 'Seitentitel', type: 'text' },
          { key: 'page_subtitle', label: 'Untertitel', type: 'text' },
        ],
      },
      {
        id: 'content',
        title: 'Inhalt',
        fields: [
          { key: 'text_p1', label: 'Absatz 1', type: 'textarea' },
          { key: 'text_p2', label: 'Absatz 2', type: 'textarea' },
          { key: 'text_p3', label: 'Absatz 3', type: 'textarea' },
        ],
      },
      {
        id: 'cards',
        title: 'Angebots-Karten',
        fields: [
          { key: 'card1_title', label: 'Karte 1: Titel', type: 'text' },
          { key: 'card1_text', label: 'Karte 1: Text', type: 'textarea' },
          { key: 'card2_title', label: 'Karte 2: Titel', type: 'text' },
          { key: 'card2_text', label: 'Karte 2: Text', type: 'textarea' },
          { key: 'card3_title', label: 'Karte 3: Titel', type: 'text' },
          { key: 'card3_text', label: 'Karte 3: Text', type: 'textarea' },
          { key: 'card4_title', label: 'Karte 4: Titel', type: 'text' },
          { key: 'card4_text', label: 'Karte 4: Text', type: 'textarea' },
        ],
      },
      {
        id: 'combined',
        title: 'Kombinierbare Angebote',
        fields: [
          { key: 'combined_title', label: 'Titel', type: 'text' },
          { key: 'combined_items', label: 'Einträge (kommagetrennt)', type: 'textarea', description: 'Einträge getrennt durch Komma eingeben.' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['nachmittag'],
  },
  {
    id: 'netzwerk',
    title: 'Netzwerk & Partner',
    description: 'Die Seite "Schulleben > Netzwerk" mit Kooperationspartnern.',
    route: '/schulleben/netzwerk',
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
        id: 'partners',
        title: 'Partner',
        fields: [
          { key: 'partners', label: 'Partner (Name|Kategorie, kommagetrennt)', type: 'textarea', description: 'Format: Name|Kategorie getrennt durch Komma.' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['netzwerk'],
  },
  {
    id: 'kontakt',
    title: 'Kontakt',
    description: 'Die Kontaktseite mit Adresse, Ansprechpartnern und Kontaktformular.',
    route: '/kontakt',
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
        id: 'address',
        title: 'Adresse & Kontaktdaten',
        fields: [
          { key: 'address_name', label: 'Schulname', type: 'text' },
          { key: 'address_street', label: 'Strasse', type: 'text' },
          { key: 'address_city', label: 'PLZ und Ort', type: 'text' },
          { key: 'phone', label: 'Telefon', type: 'text' },
          { key: 'fax', label: 'Fax', type: 'text' },
          { key: 'email', label: 'E-Mail', type: 'text' },
          { key: 'travel_info', label: 'Anfahrtshinweis', type: 'text' },
        ],
      },
      {
        id: 'steuergruppe',
        title: 'Steuergruppe',
        fields: [
          { key: 'steuergruppe_title', label: 'Titel', type: 'text' },
          { key: 'steuergruppe_text', label: 'Text', type: 'textarea' },
        ],
      },
      {
        id: 'contacts',
        title: 'Ansprechpartner:innen',
        fields: [
          { key: 'contacts', label: 'Kontakte (Rolle|Name|Beschreibung, kommagetrennt)', type: 'textarea', description: 'Format: Rolle|Name|Beschreibung getrennt durch Komma.' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['kontakt'],
  },
  {
    id: 'impressum',
    title: 'Impressum',
    description: 'Die Impressum-Seite mit rechtlichen Angaben.',
    route: '/impressum',
    sections: [
      {
        id: 'content',
        title: 'Inhalt',
        fields: [
          { key: 'page_title', label: 'Seitentitel', type: 'text' },
          { key: 'verantwortlich', label: 'Verantwortlich', type: 'textarea' },
          { key: 'anschrift', label: 'Anschrift', type: 'textarea' },
          { key: 'kontakt_info', label: 'Kontakt', type: 'textarea' },
          { key: 'schultraeger', label: 'Schulträger', type: 'text' },
          { key: 'aufsichtsbehoerde', label: 'Aufsichtsbehörde', type: 'text' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['impressum'],
  },
  {
    id: 'datenschutz',
    title: 'Datenschutz',
    description: 'Die Datenschutzerklärung der Schule.',
    route: '/datenschutz',
    sections: [
      {
        id: 'content',
        title: 'Inhalt',
        fields: [
          { key: 'page_title', label: 'Seitentitel', type: 'text' },
          { key: 'intro_text', label: 'Einleitungstext', type: 'textarea' },
          { key: 'verantwortlicher', label: 'Verantwortlicher', type: 'textarea' },
          { key: 'hosting_text', label: 'Hosting', type: 'textarea' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['datenschutz'],
  },
  // Aktuelles, Termine, Downloads — only need hero image
  {
    id: 'aktuelles',
    title: 'Aktuelles',
    description: 'Hero-Bild für die Aktuelles-Seite.',
    route: '/aktuelles',
    sections: [HERO_IMAGE_SECTION],
    defaults: PAGE_DEFAULTS['aktuelles'],
  },
  {
    id: 'termine',
    title: 'Termine',
    description: 'Hero-Bild für die Termine-Seite.',
    route: '/termine',
    sections: [HERO_IMAGE_SECTION],
    defaults: PAGE_DEFAULTS['termine'],
  },
  {
    id: 'downloads',
    title: 'Downloads',
    description: 'Hero-Bild für die Downloads-Seite.',
    route: '/downloads',
    sections: [HERO_IMAGE_SECTION],
    defaults: PAGE_DEFAULTS['downloads'],
  },
  // Landing pages (category overviews)
  {
    id: 'landing-unterricht',
    title: 'Unterricht',
    description: 'Die Kategorieübersicht für den Bereich Unterricht.',
    route: '/unterricht',
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
        id: 'intro',
        title: 'Einleitung',
        fields: [
          { key: 'intro_text', label: 'Einleitungstext', type: 'textarea' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['landing-unterricht'],
  },
  {
    id: 'landing-unterricht-faecher',
    title: 'Fächer',
    description: 'Die Fächerübersicht unter Unterricht > Fächer.',
    route: '/unterricht/faecher',
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
        id: 'intro',
        title: 'Einleitung',
        fields: [
          { key: 'intro_text', label: 'Einleitungstext', type: 'textarea' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['landing-unterricht-faecher'],
  },
  {
    id: 'landing-schulleben',
    title: 'Schulleben (Übersicht)',
    description: 'Die Kategorieübersicht für den Bereich Schulleben.',
    route: '/schulleben',
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
        id: 'intro',
        title: 'Einleitung',
        fields: [
          { key: 'intro_text', label: 'Einleitungstext', type: 'textarea' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['landing-schulleben'],
  },
  {
    id: 'landing-unsere-schule',
    title: 'Unsere Schule (Übersicht)',
    description: 'Die Kategorieübersicht für den Bereich Unsere Schule.',
    route: '/unsere-schule',
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
        id: 'intro',
        title: 'Einleitung',
        fields: [
          { key: 'intro_text', label: 'Einleitungstext', type: 'textarea' },
        ],
      },
      HERO_IMAGE_SECTION,
    ],
    defaults: PAGE_DEFAULTS['landing-unsere-schule'],
  },
]
