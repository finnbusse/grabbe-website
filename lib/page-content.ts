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

  // Profilprojekte
  'profilprojekte': {
    page_label: 'Unser besonderes Profil',
    page_title: 'Profilprojekte',
    page_subtitle: 'Waehle das Profilprojekt nach deinen Interessen! Gestalte frei - ohne Leistungsdruck! In Klasse 5 und 6 kannst du in einem der vier Profilprojekte neue Lernwege entdecken.',
    kunst_title: 'Kunstprojekt',
    kunst_p1: 'Das Fach Kunst ist durch selbstbestimmtes Handeln und anschauliches Denken gepraegt, was Lernen besonders nachhaltig macht und zum ganzheitlichen Erleben und Verstehen der Wirklichkeit fuehrt. Dies ist bedeutsam in Bezug auf die zunehmende Aesthetisierung und Virtualisierung der Lebenswelt. Durch die Staerkung der Ich-Identitaet ermoeglicht das Fach Kunst den Kindern, sich in der Welt zu behaupten und diese als gestaltbar und veraenderbar zu begreifen.',
    kunst_p2: 'Der Kunstunterricht am Grabbe-Gymnasium versteht sich so als bedeutsamer und hochwertiger Baustein im Aufbau zukunftsrelevanter Kompetenzen fuer alle Schueler und Schuelerinnen.',
    kunst_p3: 'Neben den fuer alle Gymnasien obligatorischen Wochenstunden im Fach Kunst wird in den Klassen 5 und 6 ein Projektkurs "Werkstatt Kunst - Unsere Welt mit den Augen von Kuenstlerinnen und Kuenstlern" zusaetzlich verankert. Dies bietet weiteren Freiraum, in dem die Schuelerinnen und Schueler ohne Notendruck projektbezogen arbeiten koennen.',
    kunst_p4: 'Dem Profilprojekt liegt ein ganzheitliches und erfahrungsbezogenes Konzept zugrunde, in dem in besonderer Weise der kuenstlerische Prozess im Mittelpunkt steht. Ein Anliegen des Kurses ist u.a. die Sensibilisierung und Schaerfung der Wahrnehmung, die Auseinandersetzung mit der eigenen Lebenswelt und der Aufbau kuenstlerischen Ausdrucks.',
    musik_title: 'Musikprojekt',
    musik_p1: 'Im Musikprofil entdecken Schuelerinnen und Schueler ihre musikalischen Interessen, Kreativitaet und Begabungen - in Theorie und Praxis, individuell und im Miteinander. Der Musikunterricht bildet dabei das kontinuierliche Rueckgrat ihrer musikalischen Bildung.',
    musik_p2: 'Ergaenzend zum Musikunterricht wird im Musikprofil Instrumentalunterricht in Kooperation mit externen Instrumentallehrkraeften angeboten. Im zweiten Halbjahr des Jahrgangs 5 wird die instrumentale Praxis im Profilorchester intensiviert und vertieft.',
    musik_p3: 'Im Musikprojekt arbeiten die Schuelerinnen und Schueler praxisorientiert in unterschiedlichen Vorhaben: Instrument & Stimme (Jg. 5.1), Profilorchester (Jg. 5.2, woechentlich), Klang & Szene (Jg. 6).',
    musik_p4: 'Darueber hinaus bieten die AG-Angebote vielfaeltige Moeglichkeiten Musik aktiv zu leben. Die Ensembles arbeiten jahrgangsuebergreifend und foerdern Begabungen nachhaltig und individuell. Das Profilfach Musik ist Teil des Schulversuchs "NRW-Musikprofil-Schule".',
    sport_title: 'Sportprojekt',
    sport_p1: 'Als eine der wenigen ausgewaehlten "Partnerschulen des Sports" in NRW zeichnet sich das Grabbe-Gymnasium durch ein besonders sportfreundliches Klima aus und bietet allen jugendlichen Talenten die Chance, eine fundierte Schulausbildung mit einer optimalen Sportfoerderung zu verbinden.',
    sport_p2: 'Diese Foerderung erfolgt u.a. durch frei waehlbare Sport-Projektkurse, vielfaeltige Sport-AGs in den Sportarten Kunstturnen, Fussball, Leichtathletik und Volleyball und die besondere Unterstuetzung von leistungssport-orientierten Schuelerinnen und Schuelern.',
    sport_p3: 'Regelmaessig nehmen Schulmannschaften des Grabbe-Gymnasiums erfolgreich an Schulwettkaempfen teil. Basierend auf einer engen Zusammenarbeit von Schule, Verein, Eltern und Schuelerinnen und Schuelern werden darueber hinaus individuelle Loesungen fuer Kaderathleten gefunden, sodass sportliche Begabungen in besonderer Form gefoerdert werden.',
    nawi_title: 'NaWi-Projekt',
    nawi_p1: 'Im Profilprojekt NaWi entdecken die Schuelerinnen und Schueler der Klassen 5 und 6 die spannende Welt der Naturwissenschaften. Mit Neugier und Forschergeist gehen sie Phaenomenen aus Biologie, Chemie, Physik und Informatik auf den Grund - immer mit dem Ziel, durch eigenes Beobachten, Experimentieren und Nachdenken Zusammenhaenge in der Natur und Technik zu verstehen.',
    nawi_p2: 'Im Mittelpunkt steht das selbststaendige und entdeckende Lernen. Die Kinder lernen, Fragen zu stellen, eigene Ideen zu entwickeln, Versuche zu planen und ihre Ergebnisse zu praesentieren. So erwerben sie nicht nur naturwissenschaftliches Wissen, sondern auch wichtige Faehigkeiten wie Teamarbeit, Genauigkeit und Ausdauer.',
    nawi_p3: 'Die Themen orientieren sich an der Lebenswelt der Kinder und wechseln mit den Jahreszeiten. Ob beim Erkunden der Sinne, beim Beobachten von Pflanzen und Tieren, beim Experimentieren mit Wasser und Energie oder beim Untersuchen von Wetterphaenomenen - ueberall steht das eigene Erleben und Ausprobieren im Vordergrund. Digitale Messgeraete und Sensoren helfen dabei, Daten zu erfassen und wissenschaftlich auszuwerten.',
    nawi_p4: 'Ergaenzt wird das Profilprojekt durch Wettbewerbe und Exkursionen, die Einblicke in die Anwendung naturwissenschaftlicher Erkenntnisse geben und die Freude am Forschen vertiefen. Dass die Naturwissenschaften an unserer Schule einen besonderen Stellenwert haben, zeigt die wiederholte Auszeichnung durch die Initiative "MINT Zukunft Schaffen!". Als MINT-freundliche Schule legen wir grossen Wert darauf, Begeisterung fuer Mathematik, Informatik, Naturwissenschaften und Technik zu wecken und zu foerdern.',
  },

  // Oberstufe
  'oberstufe': {
    page_label: 'Sekundarstufe II',
    page_title: 'Oberstufe',
    page_subtitle: 'Dein Start in der Oberstufe - Wir freuen uns ueber Ihr/euer Interesse an unserer Schule!',
    portal_title: 'Oberstufen-Portal',
    portal_text: 'Naehere Informationen ueber unsere Oberstufe finden sich unter dem Oberstufen-Portal, z.B. in der Broschuere, die unter der Rubrik "Laufbahnplanung" zur Verfuegung steht.',
    anmeldewoche_title: 'Anmeldewoche Oberstufe',
    anmeldewoche_date: '23. bis 27. Februar 2026',
    anmeldewoche_text: 'Anders als bei den fuenften Klassen erfolgt die Terminvergabe nicht ueber das Online-Tool, sondern telefonisch oder per Mail.',
    anmeldewoche_phone: '05231 992617',
    anmeldewoche_email: 'b.mannebach@grabbe.nrw.schule',
    documents: 'Anmeldeformular,Einwilligung Datenverarbeitung,Antrag auf Busfahrkarte',
    voraussetzung_title: 'Voraussetzung fuer die Aufnahme',
    voraussetzung_text: 'Voraussetzung fuer die Aufnahme in die Sekundarstufe II des Grabbe-Gymnasiums ist das Vorliegen der Berechtigung zum Besuch der gymnasialen Oberstufe, die am Gymnasium durch die Versetzung am Ende der Jahrgangsstufe 10 oder an anderen Schulformen durch den Erwerb des Mittleren Schulabschlusses mit Q-Vermerk erworben wird. Das entsprechende Zeugnis muss vor Beginn der Einfuehrungsphase nachgereicht werden.',
    koordination_name: 'Frau Mannebach',
    koordination_text: 'Frau Mannebach steht Ihnen fuer alle Fragen zur Oberstufe zur Verfuegung.',
    koordination_phone: '05231 992617',
    koordination_email: 'b.mannebach@grabbe.nrw.schule',
    hospitationstage_title: 'Hospitationstage',
    hospitationstage_text: 'Gerne koennen Interessent:innen sich auch im Vorfeld der Anmeldewoche persoenlich oder telefonisch beraten lassen oder einen oder zwei Tage bei uns hospitieren.',
  },

  // Anmeldung
  'anmeldung': {
    page_label: 'Herzlich willkommen',
    page_title: 'Anmeldung',
    page_subtitle: 'Wir freuen uns, dass Sie Ihr Kind bei uns am Grabbe anmelden wollen.',
    klasse5_title: 'Anmeldung Klasse 5',
    klasse5_subtitle: 'Schuljahr 2026/27',
    klasse5_text: 'Liebe Eltern und Erziehungsberechtigte, wir freuen uns, dass Sie Ihr Kind bei uns am Grabbe anmelden wollen. Alle weiteren Infos zur Erprobungsstufe (Konzept etc.) finden sich auf der Seite zur Erprobungsstufe.',
    klasse5_checklist: 'Anmeldeformular (Unterschrift BEIDER Erziehungsberechtigten),Einwilligung Datenverarbeitung,Kopie der Geburtsurkunde,Das letzte Zeugnis,Nachweis ueber erfolgte Masernimpfung',
    oberstufe_title: 'Anmeldung Oberstufe',
    oberstufe_subtitle: 'Einfuehrungsphase',
    oberstufe_text1: 'Wir freuen uns ueber Ihr/euer Interesse an unserer Schule! Die Anmeldewoche fuer die Oberstufe findet vom 23. bis 27.02.2026 statt. Die Terminvergabe erfolgt unter Tel. 05231 992617 oder per Mail an b.mannebach@grabbe.nrw.schule.',
    oberstufe_text2: 'Gerne koennen Interessent:innen sich auch im Vorfeld der Anmeldewoche persoenlich oder telefonisch beraten lassen oder ein bis zwei Tage bei uns hospitieren.',
    oberstufe_checklist: 'Anmeldeformular (Unterschrift BEIDER Erziehungsberechtigten),Einwilligung Datenverarbeitung,Antrag auf Busfahrkarte,Kopie der Geburtsurkunde,Letztes Zeugnis,Nachweis Masernimpfung',
    oberstufe_hinweis: 'Voraussetzung fuer die Aufnahme in die Sekundarstufe II ist die Berechtigung zum Besuch der gymnasialen Oberstufe, die am Gymnasium durch die Versetzung am Ende der Jahrgangsstufe 10 oder an anderen Schulformen durch den Erwerb des Mittleren Schulabschlusses mit Q-Vermerk erworben wird.',
  },

  // Faecher & AGs
  'faecher-ags': {
    page_label: 'Schulleben',
    page_title: 'Faecher & Arbeitsgemeinschaften',
    page_subtitle: 'Viele Faecher warten auf dich! Am Nachmittag hast du bei uns die freie Wahl!',
    intro_text: 'Das Grabbe-Gymnasium wird zum Lebensort Ihrer Kinder. Ihre Kinder koennen sich in vielen verschiedenen Faechern mit engagierten Kolleg:innen bilden. Sie haben nach Englisch die Moeglichkeit, Franzoesisch oder Latein und spaeter Spanisch zu waehlen. Alle Naturwissenschaften und Informatik werden einzeln und auch verbunden, wie in der Natur, angeboten. Die Gesellschaftswissenschaften runden das immer wichtigere Thema rund um Nachhaltigkeit, Demokratiebildung und geschichtliche Verantwortung und mehr ab. Ganz besonders betonen wir die Bildung im Bereich Kunst, Musik und Sport und NaWi.',
    cat1_title: 'Sprachen, Kunst, Musik',
    cat1_desc: 'Nach Englisch waehlen Sie Franzoesisch oder Latein, spaeter Spanisch. Besonders betonen wir Kunst, Musik und Sport.',
    cat2_title: 'MINT',
    cat2_desc: 'Alle Naturwissenschaften und Informatik werden einzeln und verbunden angeboten. MINT-freundliche Schule!',
    cat3_title: 'Gesellschaft',
    cat3_desc: 'Nachhaltigkeit, Demokratiebildung und geschichtliche Verantwortung runden das Angebot ab.',
    cat4_title: 'Weitere Faecher',
    cat4_desc: 'Ein breites Spektrum an weiteren Faechern mit engagierten Kolleg:innen erwartet dich.',
  },

  // Nachmittag
  'nachmittag': {
    page_label: 'Schulleben',
    page_title: 'Nachmittags am Grabbe',
    page_subtitle: '"Verlaesslich und flexibel" - Beate Bossmanns',
    text_p1: 'Nach Unterrichtsschluss bietet das Grabbe-Gymnasium mit einem breiten Spektrum an Nachmittagsaktivitaeten eine verlaessliche und flexibel gestaltbare Betreuungszeit bis 15:30 Uhr an. Neben unserer verlaesslichen Nachmittagsbetreuung mit offenen Betreuungszeiten in unseren modernen Betreuungsraeumen, die von engagierten Betreuungskraeften geleitet wird, kann Ihr Kind aus zahlreichen AG-Angeboten waehlen oder in der Hausaufgabenbetreuung unter der Anleitung unserer Schuelertutorinnen und -tutoren Hausaufgaben erledigen.',
    text_p2: 'Alle Angebote sind miteinander kombinierbar, sodass Sie die Nachmittagsgestaltung Ihres Kindes auf Ihre individuellen Betreuungswuensche anpassen koennen.',
    text_p3: 'Module der Hausaufgabenbetreuung und Arbeitsgemeinschaften werden fuer ein halbes Jahr gewaehlt. In der Mensa stehen zudem jeden Tag durch unseren Schulcaterer LKS - Pop & Corn sowohl ein ansprechendes Kioskangebot als auch ein reichhaltiges Mittagsessenangebot in Buffetform zur Verfuegung.',
    card1_title: 'Betreuungszeiten',
    card1_text: 'Verlaessliche Betreuung bis 15:30 Uhr mit offenen Zeiten in modernen Raeumen.',
    card2_title: 'Arbeitsgemeinschaften',
    card2_text: 'Zahlreiche AG-Angebote fuer ein halbes Jahr waehlbar.',
    card3_title: 'Hausaufgabenbetreuung',
    card3_text: 'Unter Anleitung von Schuelertutorinnen und -tutoren.',
    card4_title: 'Mensa & Kiosk',
    card4_text: 'Taeglich Mittagessen in Buffetform und Kioskangebot durch LKS.',
    combined_title: 'Alle Angebote kombinierbar',
    combined_items: 'Offene Betreuungszeiten,AG-Angebote,Hausaufgabenbetreuung,Mittagessen',
  },

  // Netzwerk
  'netzwerk': {
    page_label: 'Schulleben',
    page_title: 'Vernetzt in Detmold',
    page_subtitle: 'Wir bieten Ihren Kindern nicht nur in der Schule lebensnahe Erfahrungen, sondern auch mit unseren vertrauensvollen Partnern.',
    partners: 'Hochschule fuer Musik|Kultur,Landestheater Detmold|Kultur,Johanniter|Soziales,Stadtbibliothek Detmold|Bildung,Lippische Landesbibliothek|Bildung,Landesarchiv NRW|Bildung,Holocaust-Gedenkstaette Yad Vashem|Gedenken,McLean Highschool Washington|International,Wortmann KG|Wirtschaft,Weidmueller GmbH & Co KG|Wirtschaft,Peter-Glaesel-Schule Detmold|Bildung',
  },

  // Kontakt
  'kontakt': {
    page_label: 'Wer, Was, Wo?',
    page_title: 'Kontakt',
    page_subtitle: 'Kommunikation miteinander macht den Grabbe-Spirit aus.',
    address_name: 'Christian-Dietrich-Grabbe-Gymnasium',
    address_street: 'Kuester-Meyer-Platz 2',
    address_city: '32756 Detmold',
    phone: '05231 - 99260',
    fax: '05231 - 992616',
    email: 'sekretariat@grabbe.nrw.schule',
    travel_info: 'Du bist in hoechstens 30 min bei uns',
    steuergruppe_title: 'Steuergruppe Schulentwicklung',
    steuergruppe_text: 'Herr Beckmann, Frau Bossmanns, Frau Knueppel, Herr Wessel mit Herrn Dr. Hilbing',
    contacts: 'Schulleitung|Dr. Claus Hilbing|Personal- und Organisationsentwicklung, Unterrichtsverteilung,Staendige Vertretung (komm.)|Tanja Brentrup-Lappe|Haushaltsmittel, Schulgebaeude und Schulanlagen,Erprobungsstufe (Kl. 5-6)|Herr Hecker|Koordination der Erprobungsstufe,Mittelstufe (Kl. 7-10)|Dr. Chee|Koordination der Mittelstufe,Oberstufe|Frau Mannebach|Koordination der gymnasialen Oberstufe,Verwaltung|Herr Schilling|Koordination der Verwaltung',
  },

  // Impressum
  'impressum': {
    page_title: 'Impressum',
    verantwortlich: 'Dr. Claus Hilbing und Oliver Sprenger',
    anschrift: 'Christian-Dietrich-Grabbe-Gymnasium, Kuester-Meyer-Platz 2, 32756 Detmold',
    kontakt_info: 'Telefon: 05231 - 99260, Telefax: 05231 - 992616, E-Mail: sekretariat@grabbe.nrw.schule',
    schultraeger: 'Stadt Detmold',
    aufsichtsbehoerde: 'Bezirksregierung Detmold',
  },

  // Datenschutz
  'datenschutz': {
    page_title: 'Datenschutz',
    intro_text: 'Der Schutz Ihrer persoenlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschliesslich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, DSG-NRW, SchulG NRW). In diesen Datenschutzinformationen informieren wir Sie ueber die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.',
    verantwortlicher: 'Christian-Dietrich-Grabbe-Gymnasium, Kuester-Meyer-Platz 2, 32756 Detmold, Telefon: 05231 - 99260, E-Mail: sekretariat@grabbe.nrw.schule',
    hosting_text: 'Diese Website wird bei Vercel Inc. gehostet. Die Server befinden sich in der EU. Beim Besuch unserer Website werden automatisch technisch notwendige Daten erhoben (IP-Adresse, Zeitpunkt des Zugriffs, abgerufene Seite). Diese Daten werden ausschliesslich zum Betrieb der Website und zur Sicherstellung der Systemsicherheit verarbeitet.',
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
    ],
    defaults: PAGE_DEFAULTS['profilprojekte'],
  },
  {
    id: 'oberstufe',
    title: 'Oberstufe',
    description: 'Die Seite "Unsere Schule > Oberstufe" mit Informationen zur gymnasialen Oberstufe.',
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
        id: 'portal',
        title: 'Oberstufen-Portal',
        fields: [
          { key: 'portal_title', label: 'Titel', type: 'text' },
          { key: 'portal_text', label: 'Text', type: 'textarea' },
        ],
      },
      {
        id: 'anmeldewoche',
        title: 'Anmeldewoche',
        fields: [
          { key: 'anmeldewoche_title', label: 'Titel', type: 'text' },
          { key: 'anmeldewoche_date', label: 'Datum', type: 'text' },
          { key: 'anmeldewoche_text', label: 'Text', type: 'textarea' },
          { key: 'anmeldewoche_phone', label: 'Telefon', type: 'text' },
          { key: 'anmeldewoche_email', label: 'E-Mail', type: 'text' },
        ],
      },
      {
        id: 'documents',
        title: 'Anmeldeunterlagen',
        fields: [
          { key: 'documents', label: 'Dokumente (kommagetrennt)', type: 'textarea', description: 'Dokumentbezeichnungen getrennt durch Komma eingeben.' },
        ],
      },
      {
        id: 'voraussetzung',
        title: 'Voraussetzungen',
        fields: [
          { key: 'voraussetzung_title', label: 'Titel', type: 'text' },
          { key: 'voraussetzung_text', label: 'Text', type: 'textarea' },
        ],
      },
      {
        id: 'koordination',
        title: 'Oberstufen-Koordination',
        fields: [
          { key: 'koordination_name', label: 'Name', type: 'text' },
          { key: 'koordination_text', label: 'Beschreibung', type: 'textarea' },
          { key: 'koordination_phone', label: 'Telefon', type: 'text' },
          { key: 'koordination_email', label: 'E-Mail', type: 'text' },
        ],
      },
      {
        id: 'hospitationstage',
        title: 'Hospitationstage',
        fields: [
          { key: 'hospitationstage_title', label: 'Titel', type: 'text' },
          { key: 'hospitationstage_text', label: 'Text', type: 'textarea' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['oberstufe'],
  },
  {
    id: 'anmeldung',
    title: 'Anmeldung',
    description: 'Die Seite "Unsere Schule > Anmeldung" mit Informationen zur Anmeldung fuer Klasse 5 und Oberstufe.',
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
          { key: 'klasse5_checklist', label: 'Checkliste (kommagetrennt)', type: 'textarea', description: 'Eintraege getrennt durch Komma eingeben.' },
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
          { key: 'oberstufe_checklist', label: 'Checkliste (kommagetrennt)', type: 'textarea', description: 'Eintraege getrennt durch Komma eingeben.' },
          { key: 'oberstufe_hinweis', label: 'Hinweis', type: 'textarea' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['anmeldung'],
  },
  {
    id: 'faecher-ags',
    title: 'Faecher & Arbeitsgemeinschaften',
    description: 'Die Seite "Schulleben > Faecher & AGs" mit Faecheruebersicht und Kategorien.',
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
          { key: 'combined_items', label: 'Eintraege (kommagetrennt)', type: 'textarea', description: 'Eintraege getrennt durch Komma eingeben.' },
        ],
      },
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
          { key: 'schultraeger', label: 'Schultraeger', type: 'text' },
          { key: 'aufsichtsbehoerde', label: 'Aufsichtsbehoerde', type: 'text' },
        ],
      },
    ],
    defaults: PAGE_DEFAULTS['impressum'],
  },
  {
    id: 'datenschutz',
    title: 'Datenschutz',
    description: 'Die Datenschutzerklaerung der Schule.',
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
    ],
    defaults: PAGE_DEFAULTS['datenschutz'],
  },
]
