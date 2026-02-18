# 📘 CMS-Dokumentation – Grabbe-Gymnasium Detmold

> Umfassende Dokumentation des Content-Management-Systems für die Schulhomepage des Grabbe-Gymnasiums Detmold.

---

## Inhaltsverzeichnis

1. [Einführung](#1-einführung)
2. [Erste Schritte](#2-erste-schritte)
3. [Dashboard-Übersicht](#3-dashboard-übersicht)
4. [Seitenverwaltung (Eigene Seiten)](#4-seitenverwaltung-eigene-seiten)
5. [Baustein-Editor (Block Editor)](#5-baustein-editor-block-editor)
6. [Seiten-Editor (Vordefinierte Inhalte)](#6-seiten-editor-vordefinierte-inhalte)
7. [Beiträge (Posts)](#7-beiträge-posts)
8. [Termine (Events)](#8-termine-events)
9. [Dokumente & Dateien](#9-dokumente--dateien)
10. [Einstellungen](#10-einstellungen)
11. [Benutzerverwaltung](#11-benutzerverwaltung)
12. [Navigation verwalten](#12-navigation-verwalten)
13. [Seitenstruktur](#13-seitenstruktur)
14. [Nachrichten & Anmeldungen](#14-nachrichten--anmeldungen)
15. [Benutzerprofil](#15-benutzerprofil)
16. [Technische Referenz](#16-technische-referenz)
17. [FAQ – Häufig gestellte Fragen](#17-faq--häufig-gestellte-fragen)
18. [Tipps & Best Practices](#18-tipps--best-practices)

---

## 1. Einführung

### Was ist das CMS?

Das Content-Management-System (CMS) des Grabbe-Gymnasiums ermöglicht es berechtigten Lehrkräften und Administratoren, die Inhalte der Schulhomepage direkt über eine benutzerfreundliche Oberfläche zu verwalten – ohne technisches Vorwissen.

### Funktionsumfang

| Bereich | Beschreibung |
|---|---|
| **Eigene Seiten** | Seiten erstellen und bearbeiten mit dem Baustein-Editor oder Markdown |
| **Seiten-Editor** | Texte und Bilder auf vordefinierten Seiten ändern (Startseite, Schulseiten, etc.) |
| **Beiträge** | Neuigkeiten und Aktuelles veröffentlichen |
| **Termine** | Schultermine im Kalender verwalten |
| **Dokumente** | PDFs, Bilder und andere Dateien hochladen |
| **Navigation** | Header- und Footer-Links verwalten |
| **Seitenstruktur** | Kategorien und Hierarchie der Website organisieren |
| **Einstellungen** | Globale Variablen, SEO-Daten und Kontaktdaten bearbeiten |
| **Benutzerverwaltung** | Lehrer-Accounts erstellen und verwalten |
| **Nachrichten** | Eingehende Kontaktformular-Nachrichten lesen |
| **Anmeldungen** | Schulanmeldungen einsehen |

### Technologie

Das CMS basiert auf folgenden Technologien:

- **Next.js 16** – React-basiertes Full-Stack-Framework
- **Supabase** – PostgreSQL-Datenbank mit Authentifizierung
- **Tailwind CSS** – Utility-first CSS-Framework
- **shadcn/ui** – Komponentenbibliothek
- **TypeScript** – Typsichere Programmierung

---

## 2. Erste Schritte

### Anmeldung

1. Navigieren Sie zur Website und klicken im Footer auf **„Verwaltung"**
2. Alternativ rufen Sie direkt `/auth/login` auf
3. Geben Sie Ihre **E-Mail-Adresse** und Ihr **Passwort** ein
4. Optional: Aktivieren Sie **„Angemeldet bleiben"** um Ihre Sitzung zu speichern
5. Klicken Sie auf **„Anmelden"**

> **Hinweis:** Ein Administrator muss Ihren Account zunächst erstellen. Wenden Sie sich an die Schulverwaltung, wenn Sie noch keinen Zugang haben.

### Abmeldung

Klicken Sie in der Seitenleiste unten auf **„Abmelden"**. Ihre Sitzung wird beendet und die „Angemeldet bleiben"-Einstellung wird zurückgesetzt.

### CMS-Oberfläche

Nach der Anmeldung sehen Sie die CMS-Oberfläche mit:

- **Seitenleiste (links):** Navigation zu allen CMS-Bereichen
- **Hauptbereich (rechts):** Inhalte des aktiven Bereichs
- **Profilbereich (unten links):** Ihr Benutzerprofil und Abmeldeknopf

Die Seitenleiste ist in drei Abschnitte gegliedert:

| Abschnitt | Einträge |
|---|---|
| **Inhalte** | Dashboard, Seiten-Editor, Beiträge, Eigene Seiten, Termine, Dokumente |
| **Eingänge** | Nachrichten, Anmeldungen |
| **Verwaltung** | Seitenstruktur, Navigation, Einstellungen, Benutzer, Diagnose |

---

## 3. Dashboard-Übersicht

Das Dashboard (`/cms`) ist die Startseite des CMS und bietet:

### Statistik-Karten

Sechs farbcodierte Karten zeigen den aktuellen Stand:

| Karte | Farbe | Beschreibung |
|---|---|---|
| 📝 Beiträge | Blau | Gesamtzahl aller Beiträge |
| 📖 Seiten | Grün | Gesamtzahl aller eigenen Seiten |
| 📅 Termine | Hellblau | Gesamtzahl aller Termine |
| 📤 Dokumente | Violett | Gesamtzahl aller hochgeladenen Dateien |
| ✉️ Nachrichten | Rot | Anzahl **ungelesener** Kontaktnachrichten |
| 🎓 Anmeldungen | Orange | Gesamtzahl aller Schulanmeldungen |

### Letzte Aktivitäten

Eine Zeitleiste zeigt die 15 zuletzt bearbeiteten Inhalte (Beiträge, Seiten, Termine) mit:
- Typ-Badge (Beitrag / Seite / Termin)
- Titel
- Datum der letzten Änderung
- Veröffentlichungsstatus

### Schnellstart

Direkte Links zum Erstellen neuer Inhalte:
- **Neuer Beitrag** → `/cms/posts/new`
- **Neuer Termin** → `/cms/events/new`
- **Neue Seite** → `/cms/pages/new`
- **Dokument hochladen** → `/cms/documents`

### Verwaltung

Schnellzugriff auf administrative Bereiche:
- Einstellungen (Schulname, Logo, SEO)
- Navigation (Header, Footer)
- Seitenstruktur (Kategorien, Hierarchie)
- Benutzerverwaltung (Lehrer-Accounts)

---

## 4. Seitenverwaltung (Eigene Seiten)

### Übersicht (`/cms/pages`)

Die Seitenübersicht zeigt alle eigenen Seiten in einer Rasteransicht mit:

- **Suche** nach Titel oder URL-Pfad
- **Filter nach Bereich:** Alle, Allgemein, Unsere Schule, Schulleben, Informationen
- **Filter nach Status:** Alle, Veröffentlicht, Entwurf
- **Seitenzähler** (z.B. „12 Seiten")

Jede Seitenkarte zeigt:
- Titel und URL-Pfad
- Status-Badge (Aktiv / Entwurf)
- Bereich-Badge
- Inhaltstyp (Markdown oder Bausteine)
- Datum der letzten Bearbeitung
- Systemseiten-Indikator (🔒)

### Neue Seite erstellen

1. Klicken Sie auf **„Neue Seite"** (oder `/cms/pages/new`)
2. Geben Sie einen **Seitentitel** ein (URL-Pfad wird automatisch generiert)
3. Wählen Sie den **Bearbeitungsmodus**: Markdown oder Bausteine
4. Bearbeiten Sie den Inhalt
5. Konfigurieren Sie die Seiteneinstellungen (rechte Spalte)
6. Klicken Sie auf **„Speichern"**

### Seite bearbeiten

1. Klicken Sie auf eine Seite in der Übersicht
2. Bearbeiten Sie Titel, Inhalt und Einstellungen
3. Nutzen Sie die **Vorschau** um das Ergebnis zu prüfen
4. Klicken Sie auf **„Speichern"**

### Bearbeitungsmodi

#### Markdown-Modus
Für Nutzer die mit Markdown vertraut sind:

| Syntax | Ergebnis |
|---|---|
| `**fett**` | **fett** |
| `*kursiv*` | *kursiv* |
| `## Überschrift` | Überschrift (H2) |
| `[Link](url)` | Klickbarer Link |
| `![Bild](url)` | Eingebettetes Bild |
| `- Punkt` | Aufzählungspunkt |

#### Baustein-Modus (Block Editor)
Visueller Editor mit 14 Baustein-Typen (siehe [Kapitel 5](#5-baustein-editor-block-editor)).

### Live-Vorschau

Der Page Editor verfügt über eine **Live-Vorschau**, die den aktuellen Inhalt der Seite so rendert, wie er auf der Website erscheinen wird – auch für unveröffentlichte Seiten:

1. Klicken Sie auf den **„Vorschau"**-Button in der oberen Leiste
2. Der Editor wechselt zur Vorschauansicht mit dem gerenderten Inhalt
3. Klicken Sie auf **„Editor"** um zurück zur Bearbeitung zu wechseln

Zusätzlich gibt es den **„Live ansehen"**-Button, der die veröffentlichte Seite in einem neuen Tab öffnet.

### Seiteneinstellungen

| Einstellung | Beschreibung |
|---|---|
| **Veröffentlicht** | Toggle: Seite ist live sichtbar oder als Entwurf gespeichert |
| **Bereich** | Zuordnung: Allgemein, Unsere Schule, Schulleben, Informationen |
| **Kategorie / Pfad** | URL-Pfad der Seite (z.B. `/unsere-schule` oder `/schulleben`) |
| **Sortierung** | Numerische Reihenfolge innerhalb des Bereichs |

### Hero-Bild

Jede Seite kann ein Hero-Bild haben, das im Seitenkopf angezeigt wird:

1. Klicken Sie auf **„Bild hochladen"** oder
2. Geben Sie eine **Bild-URL** direkt ein
3. Das Bild wird als Vorschau angezeigt
4. Klicken Sie auf **✕** um das Bild zu entfernen

---

## 5. Baustein-Editor (Block Editor)

Der Baustein-Editor ermöglicht es, Seiteninhalte visuell mit verschiedenen Bausteinen zusammenzustellen. Jeder Baustein hat einen eigenen Typ und kann frei angeordnet werden.

### Verfügbare Bausteine (14 Typen)

#### 📝 Textabschnitt (`text`)
Überschrift und Fließtext.

| Feld | Beschreibung |
|---|---|
| Überschrift | Optionale H2-Überschrift |
| Text | Fließtext (Markdown wird unterstützt) |

#### 🃏 Karten (`cards`)
2–4 nebeneinander angeordnete Info-Karten.

| Feld | Beschreibung |
|---|---|
| Karten (2–4) | Jede Karte hat Titel und Beschreibungstext |

**Layout:** 2 Karten = 2 Spalten, 3 = 3 Spalten, 4 = 2×2 (Desktop: 4 Spalten)

#### ❓ FAQ / Aufklappbar (`faq`)
Aufklappbare Frage-Antwort-Bereiche.

| Feld | Beschreibung |
|---|---|
| Frage | Die angezeigte Frage (Zusammenfassung) |
| Antwort | Text, der beim Aufklappen erscheint |

#### 🖼️ Bildergalerie (`gallery`)
Raster aus mehreren Bildern.

| Feld | Beschreibung |
|---|---|
| Bild-URL | URL zum Bild (aus Dokumente-Bereich hochladen) |
| Bildbeschreibung | Alt-Text für Barrierefreiheit |

**Layout:** 1–2 Bilder = 2 Spalten, 3+ = 3 Spalten

#### 📋 Aufzählung (`list`)
Punkteliste mit optionaler Überschrift.

| Feld | Beschreibung |
|---|---|
| Überschrift | Optionale Überschrift über der Liste |
| Listenpunkte | Einzelne Punkte der Aufzählung |

#### 🎯 Hero / Banner (`hero`)
Großer Banner-Bereich mit Hintergrundbild und Call-to-Action.

| Feld | Beschreibung |
|---|---|
| Überschrift | Große Hauptüberschrift |
| Unterüberschrift | Erklärungstext unter der Überschrift |
| Hintergrundbild-URL | Bild das den gesamten Banner füllt |
| Button-Text | Beschriftung des CTA-Buttons (optional) |
| Button-URL | Ziel-Link des Buttons (optional) |

#### 💬 Zitat (`quote`)
Hervorgehobenes Zitat mit optionalem Autor.

| Feld | Beschreibung |
|---|---|
| Zitat | Der Zitattext |
| Autor | Name des zitierten Autors (optional) |

#### ➖ Trennlinie (`divider`)
Visueller Trenner zwischen Abschnitten. Keine Einstellungen nötig.

#### 🎬 Video (`video`)
YouTube- oder Vimeo-Video einbetten.

| Feld | Beschreibung |
|---|---|
| Video-URL | YouTube- oder Vimeo-Link (wird automatisch in Embed-URL konvertiert) |
| Beschriftung | Optionaler Text unter dem Video |

**Unterstützte Formate:**
- `https://www.youtube.com/watch?v=XXXXX`
- `https://youtu.be/XXXXX`
- `https://vimeo.com/XXXXXXX`

#### 🔘 Call-to-Action (`cta`)
Auffälliger Handlungsaufruf mit Button.

| Feld | Beschreibung |
|---|---|
| Überschrift | Aufmerksamkeitsstarke Überschrift |
| Text | Erklärungstext |
| Button-Text | Beschriftung des Buttons |
| Button-URL | Ziel-Link des Buttons |
| Stil | `hell` (heller Hintergrund) oder `dunkel` (dunkler Hintergrund) |

#### 📊 Zwei Spalten (`columns`)
Zweispaltiges Layout mit jeweils Überschrift und Text.

| Feld | Beschreibung |
|---|---|
| Linke Spalte: Überschrift | H3-Überschrift links |
| Linke Spalte: Text | Fließtext links |
| Rechte Spalte: Überschrift | H3-Überschrift rechts |
| Rechte Spalte: Text | Fließtext rechts |

#### ↕️ Abstand (`spacer`)
Vertikaler Abstand zwischen Abschnitten.

| Option | CSS-Klasse | Höhe |
|---|---|---|
| Klein | `py-4` | 1rem (16px) |
| Mittel | `py-8` | 2rem (32px) |
| Groß | `py-16` | 4rem (64px) |

#### 📂 Akkordeon (`accordion`)
Aufklappbare Abschnitte (ähnlich FAQ, aber allgemeiner).

| Feld | Beschreibung |
|---|---|
| Titel | Sichtbare Überschrift |
| Inhalt | Text, der beim Aufklappen erscheint |

#### 📊 Tabelle (`table`)
Einfache Tabelle mit konfigurierbaren Zeilen und Spalten.

| Feld | Beschreibung |
|---|---|
| Zeilen | Erste Zeile = Kopfzeile (th), restliche = Datenzeilen (td) |
| Spalten | Können hinzugefügt/entfernt werden |

### Bausteine verwalten

| Aktion | Beschreibung |
|---|---|
| **Hinzufügen** | Klick auf „Baustein hinzufügen" → Typ auswählen |
| **Verschieben** | Pfeiltasten ↑ / ↓ im Baustein-Header |
| **Löschen** | Papierkorb-Icon im Baustein-Header |
| **Bearbeiten** | Direkt im Baustein-Bereich die Felder ausfüllen |

---

## 6. Seiten-Editor (Vordefinierte Inhalte)

### Übersicht (`/cms/seiten-editor`)

Der Seiten-Editor erlaubt es, die Texte und Bilder auf **vordefinierten Seiten** zu bearbeiten, ohne das Design oder Layout zu verändern. Die Seiten sind nach Bereichen gruppiert:

| Bereich | Seiten |
|---|---|
| **Startseite** | Hero-Bereich, Willkommen, Profilprojekte, Infos & Quick-Links, Nachmittag, Partner, Neuigkeiten, Kalender |
| **Unsere Schule** | Erprobungsstufe, Profilprojekte, Oberstufe, Anmeldung |
| **Schulleben** | Fächer & AGs, Nachmittagsbetreuung, Netzwerk & Partner |
| **Sonstige** | Kontakt, Impressum, Datenschutz, Aktuelles, Termine, Downloads |

### Seite bearbeiten (`/cms/seiten-editor/[pageId]`)

1. Wählen Sie eine Seite aus der Übersicht
2. Bearbeiten Sie einzelne **Felder** (Texte, Bilder, Links)
3. Jedes Feld zeigt den **Feldtyp** an (Text, Textarea, Bild, Link)
4. Nutzen Sie **„Zurücksetzen"** um ein einzelnes Feld auf den Standardwert zurückzusetzen
5. Nutzen Sie **„Alle zurücksetzen"** für alle Felder
6. Klicken Sie auf **„Speichern"**

> **Wichtig:** Die Änderungen betreffen nur die Texte und Bilder. Das Layout und Design der Seiten bleibt unverändert und folgt den Design-Richtlinien der Schulhomepage.

### Feldtypen

| Typ | Beschreibung | Beispiel |
|---|---|---|
| `text` | Einzeiliger Text | Überschriften, Labels |
| `textarea` | Mehrzeiliger Text | Beschreibungen, Absätze |
| `image` | Bild-URL | Hero-Bilder, Logos |
| `link` | URL/Pfad | Button-Links, Weiterleitungen |
| `list` | Komma-getrennte Liste | Partnernamen, Tags |
| `items` | Strukturierte Einträge | Karten, Feature-Listen |

---

## 7. Beiträge (Posts)

### Übersicht (`/cms/posts`)

Alle Beiträge werden in einer Liste angezeigt mit:
- Titel und Kategorie-Badge
- Veröffentlichungsstatus
- Erstellungsdatum
- Featured-Indikator (⭐)

### Neuen Beitrag erstellen (`/cms/posts/new`)

1. **Titel** eingeben (URL-Pfad wird automatisch generiert)
2. **Kurztext/Excerpt** eingeben (wird in der Vorschau angezeigt)
3. **Inhalt** im Markdown-Format schreiben
4. **Kategorie** wählen
5. Optional: **Beitragsbild** hochladen
6. Optional: **Auf Startseite anzeigen** aktivieren
7. Optional: **Benutzerdefiniertes Datum** setzen
8. **Veröffentlicht**-Toggle setzen
9. **Speichern**

### Kategorien

| Kategorie | Beschreibung |
|---|---|
| Aktuelles | Allgemeine Neuigkeiten |
| Schulleben | Berichte aus dem Schulalltag |
| Veranstaltungen | Berichte über Events |
| Projekte | Projektvorstellungen |
| Wettbewerbe | Wettbewerbsberichte und -ergebnisse |

### Dateien im Beitrag

Über den **„Dateien & Medien"**-Bereich können Sie:
- Bilder hochladen und per Klick in den Markdown-Inhalt einfügen
- PDFs hochladen und als Download-Link einfügen

---

## 8. Termine (Events)

### Übersicht (`/cms/events`)

Alle Termine werden chronologisch angezeigt mit Datum, Uhrzeit und Ort.

### Neuen Termin erstellen (`/cms/events/new`)

| Feld | Pflicht | Beschreibung |
|---|---|---|
| Titel | ✅ | Name des Termins |
| Datum | ✅ | Startdatum (YYYY-MM-DD) |
| Enddatum | ❌ | Optionales Enddatum bei mehrtägigen Events |
| Uhrzeit | ❌ | Uhrzeit (Freitext, z.B. „14:00 – 16:00 Uhr") |
| Ort | ❌ | Veranstaltungsort |
| Beschreibung | ❌ | Ausführliche Beschreibung (Markdown) |
| Kategorie | ✅ | Typ des Termins |
| Veröffentlicht | ✅ | Toggle für Sichtbarkeit |

### Kategorien

| Kategorie | Beschreibung |
|---|---|
| Schultermin | Allgemeine Schultermine |
| Ferien | Ferienzeiten |
| Prüfung/Klausur | Prüfungstermine |
| Veranstaltung | Schulveranstaltungen |
| Elternabend | Elternabende |
| Projekttag | Projekttage |
| Sonstiges | Sonstige Termine |

---

## 9. Dokumente & Dateien

### Übersicht (`/cms/documents`)

Der Dokumenten-Bereich dient zum Hochladen und Verwalten von Dateien:

- **PDFs** – Elternbriefe, Formulare, Informationsblätter
- **Bilder** – Fotos für Beiträge und Seiten
- **Andere Dateien** – Weitere Dokumente

### Dateien hochladen

1. Klicken Sie auf **„Datei hochladen"**
2. Wählen Sie eine Datei von Ihrem Computer
3. Die Datei wird auf den Server hochgeladen
4. Die **URL** wird angezeigt und kann kopiert werden
5. Die Datei erscheint automatisch im Downloads-Bereich der Website

### Dateien in Inhalten verwenden

Kopieren Sie die URL einer hochgeladenen Datei und verwenden Sie sie:

- **In Beiträgen:** `![Bildname](URL)` für Bilder oder `[Linktext](URL)` für Downloads
- **In Seiten (Markdown):** Gleiche Syntax wie bei Beiträgen
- **In Bausteinen:** Fügen Sie die URL direkt in das Bild-URL-Feld ein
- **In Einstellungen:** Nutzen Sie den „Bild hochladen"-Button

---

## 10. Einstellungen

### Übersicht (`/cms/settings`)

Die Einstellungen verwalten globale Variablen der Website. Sie sind in **5 Kategorien** organisiert:

### Kategorien

#### 🔧 Allgemein
Grundlegende Website-Einstellungen wie Schulname, Motto und allgemeine Texte.

#### 📞 Kontaktdaten
Kontaktinformationen der Schule: E-Mail, Telefon, Adresse, Koordinaten.

#### 🔍 SEO & Open Graph
Suchmaschinenoptimierung und Social-Media-Vorschaubilder/-texte.

#### 🏠 Startseite
Spezifische Inhalte und Medien für die Startseite.

#### 📊 Statistiken
Tracking-IDs und Analysecodes.

### Funktionen

| Funktion | Beschreibung |
|---|---|
| **Suche** | Einstellungen nach Name oder Schlüssel filtern |
| **Tabs** | Zwischen Kategorien wechseln (mit Änderungszähler) |
| **Speichern** | Alle Änderungen über alle Tabs gleichzeitig speichern |
| **Variable hinzufügen** | Neue benutzerdefinierte Variable erstellen |
| **Variable löschen** | Bestehende Variable entfernen |
| **Bild hochladen** | Bild für Bild-Variablen hochladen |

### Variable erstellen

1. Klicken Sie auf **„Neue Variable hinzufügen"**
2. Füllen Sie das Formular aus:
   - **Schlüssel** – Technischer Name (z.B. `footer_text`)
   - **Anzeigename** – Lesbarer Name (z.B. „Footer-Text")
   - **Typ** – Text, Textarea oder Bild
3. Klicken Sie auf **„Hinzufügen"**

### Ungespeicherte Änderungen

- Geänderte Einstellungen zeigen ein **„geändert"**-Badge
- Tabs mit Änderungen zeigen die **Anzahl** der Änderungen
- Beim Verlassen der Seite mit ungespeicherten Änderungen erscheint eine **Warnung**
- Der Speichern-Button ist deaktiviert wenn keine Änderungen vorliegen

---

## 11. Benutzerverwaltung

### Übersicht (`/cms/users`)

Zeigt alle CMS-Benutzer mit Suchfunktion und Gesamtanzahl.

### Benutzer erstellen

1. Klicken Sie auf **„Neuer Benutzer"**
2. Füllen Sie das Formular aus:
   - **Vorname** und **Nachname**
   - **Titel** (optional: Dr., Prof., etc.)
   - **E-Mail-Adresse**
   - **Passwort** (mindestens 6 Zeichen)
3. Klicken Sie auf **„Account erstellen"**

> Der neue Benutzer kann sich sofort im CMS anmelden. Es wird keine Bestätigungsmail versendet.

### Benutzer bearbeiten

- **Profil bearbeiten:** Klicken Sie auf das Stift-Icon → Name, Titel ändern → Speichern
- **Avatar hochladen:** Klicken Sie auf das Kamera-Icon → Bild wird automatisch komprimiert (max. 400px, JPEG 80%)
- **Benutzer löschen:** Klicken Sie auf das Papierkorb-Icon (nicht für den eigenen Account möglich)

### Benutzeranzeige

Für jeden Benutzer wird angezeigt:
- Avatar oder Initialen
- Vollständiger Name (mit Titel)
- E-Mail-Adresse
- Erstellungsdatum
- Datum des letzten Logins
- „Du"-Badge für den eigenen Account

---

## 12. Navigation verwalten

### Übersicht (`/cms/navigation`)

Die Navigation wird in drei Bereichen verwaltet:

| Bereich | Beschreibung |
|---|---|
| **Header** | Hauptnavigation im Seitenkopf |
| **Footer** | Links im Fußbereich |
| **Footer-Legal** | Rechtliche Links (Impressum, Datenschutz) |

### Navigation bearbeiten

1. Wählen Sie den Navigationsbereich (Header / Footer / Footer-Legal)
2. **Reihenfolge ändern:** Ziehen Sie Einträge per Drag & Drop
3. **Eintrag bearbeiten:** Klicken Sie auf einen Eintrag → Label, URL, Sortierung ändern
4. **Sichtbarkeit:** Toggle zum Ein-/Ausblenden einzelner Links
5. **Untermenüs** (nur Header): Links können einem übergeordneten Menüpunkt zugeordnet werden
6. **Neuer Eintrag:** Klicken Sie auf „Neuer Link" → Label und URL eingeben
7. Klicken Sie auf **„Alle Speichern"**

### Hierarchie (nur Header)

Header-Links können verschachtelt werden:
- **Hauptmenüpunkte** – Direkt in der Navigationsleiste sichtbar
- **Untermenüpunkte** – Erscheinen im Dropdown bei Hover

---

## 13. Seitenstruktur

### Übersicht (`/cms/seitenstruktur`)

Die Seitenstruktur organisiert alle Seiten in einer Baumansicht mit Kategorien und Unterkategorien.

### Systemseiten

Fest definierte Seiten, die nicht verschoben oder gelöscht werden können (🔒):

| Pfad | Seite |
|---|---|
| `/` | Startseite |
| `/aktuelles` | Aktuelles |
| `/termine` | Termine |
| `/downloads` | Downloads |
| `/kontakt` | Kontakt |
| `/impressum` | Impressum |
| `/datenschutz` | Datenschutz |
| `/unsere-schule/erprobungsstufe` | Erprobungsstufe |
| `/unsere-schule/profilprojekte` | Profilprojekte |
| `/unsere-schule/oberstufe` | Oberstufe |
| `/unsere-schule/anmeldung` | Anmeldung |
| `/schulleben/faecher-ags` | Fächer & AGs |
| `/schulleben/nachmittag` | Nachmittagsbetreuung |
| `/schulleben/netzwerk` | Netzwerk & Partner |

### Kategorien verwalten

- **Neue Kategorie:** Name und Pfad eingeben
- **Unterkategorie:** Einer bestehenden Kategorie zuordnen
- **Kategorie bearbeiten:** Name und Pfad ändern
- **Kategorie löschen:** Nur möglich wenn keine Seiten zugeordnet sind

### Seiten zuordnen

Eigene Seiten können per Dialog einer Kategorie zugeordnet werden:
1. Klicken Sie auf **„Seite verschieben"** bei einer Seite
2. Wählen Sie die Zielkategorie aus dem Dropdown
3. Die URL der Seite ändert sich entsprechend

---

## 14. Nachrichten & Anmeldungen

### Nachrichten (`/cms/messages`)

Eingehende Kontaktformular-Nachrichten werden hier angezeigt:
- Name und E-Mail des Absenders
- Betreff und Nachrichtentext
- Datum
- Gelesen/Ungelesen-Status

### Anmeldungen (`/cms/anmeldungen`)

Schulanmeldungen über das Online-Formular:
- Kinddaten (Name, Geburtstag)
- Elterndaten (Name, E-Mail, Telefon)
- Grundschule
- Anmeldetyp (Klasse 5 / Oberstufe)
- Wunschpartner, Profilprojekt
- Zusätzliche Nachricht

---

## 15. Benutzerprofil

### Profil bearbeiten (`/cms/profil`)

Hier können Sie Ihr eigenes Profil verwalten:
- **Vorname** und **Nachname**
- **Titel** (Dr., Prof., etc.)
- **Profilbild** hochladen (wird automatisch komprimiert)

Das Profilbild wird in der CMS-Seitenleiste, bei Beiträgen (Autorenansicht) und in der Benutzerverwaltung angezeigt.

---

## 16. Technische Referenz

### Datenbank-Tabellen

| Tabelle | Beschreibung |
|---|---|
| `pages` | Eigene Seiten (Titel, Slug, Inhalt, Bereich, Veröffentlicht) |
| `posts` | Beiträge/News (Titel, Slug, Markdown-Inhalt, Kategorie, Bild) |
| `events` | Termine (Titel, Datum, Uhrzeit, Ort, Kategorie) |
| `documents` | Hochgeladene Dateien (Titel, URL, Größe, Typ) |
| `site_settings` | Schlüssel-Wert-Paare für globale Einstellungen |
| `navigation_items` | Header/Footer-Navigation (hierarchisch) |
| `user_profiles` | Erweiterte Benutzerprofile (Name, Titel, Avatar) |
| `contact_submissions` | Kontaktformular-Eingänge |
| `anmeldung_submissions` | Schulanmeldungen |

### API-Endpunkte

| Endpunkt | Methoden | Beschreibung |
|---|---|---|
| `/api/settings` | GET, PUT, POST | Einstellungen lesen/aktualisieren/erstellen |
| `/api/users` | GET, POST, DELETE | Benutzer verwalten |
| `/api/user-profile` | POST | Profil aktualisieren (inkl. Avatar) |
| `/api/navigation` | GET, POST, PUT, DELETE | Navigationseinträge verwalten |
| `/api/page-content` | GET, POST | Seiteneditor-Inhalte laden/speichern |
| `/api/upload` | POST | Dateien hochladen |
| `/api/upload/delete` | POST | Dateien löschen |
| `/api/contact` | POST | Kontaktformular absenden |
| `/api/anmeldung` | POST | Anmeldeformular absenden |
| `/api/diagnostic` | GET | Systemdiagnose |

### URL-Routing für eigene Seiten

Eigene Seiten verwenden **Catch-All-Routen** (`[...slug]`):

```
/unsere-schule/[...slug]  →  z.B. /unsere-schule/faecher/mathematik
/schulleben/[...slug]     →  z.B. /schulleben/netzwerk/partner
/seiten/[slug]            →  Standard-Pfad für Seiten ohne Kategorie
```

### Umgebungsvariablen

| Variable | Beschreibung |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Öffentlicher Supabase-Schlüssel |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin-Schlüssel (nur server-seitig) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage Token (optional) |

---

## 17. FAQ – Häufig gestellte Fragen

### Allgemein

**F: Wie ändere ich den Schulnamen auf der Website?**
A: Gehen Sie zu **Einstellungen** → Tab **Allgemein** → Variable `site_name` bearbeiten → Speichern.

**F: Wie ändere ich das Logo?**
A: Gehen Sie zu **Einstellungen** → Tab **Allgemein** → Variable für das Logo suchen → Neues Bild hochladen → Speichern.

**F: Meine Änderungen werden nicht auf der Website angezeigt.**
A: 
1. Prüfen Sie, ob der Inhalt auf **„Veröffentlicht"** gesetzt ist
2. Laden Sie die Seite im Browser mit `Strg+Shift+R` (Hard Refresh) neu
3. Warten Sie einige Sekunden – manche Änderungen werden zwischengespeichert

### Seiten

**F: Wie erstelle ich eine Unterseite?**
A: Erstellen Sie eine neue Seite und setzen Sie den **Kategorie/Pfad** auf den gewünschten übergeordneten Pfad (z.B. `/unsere-schule`).

**F: Kann ich das Layout einer Seite ändern?**
A: Eigene Seiten können mit dem **Baustein-Editor** frei gestaltet werden. Die vordefinierten Seiten (Startseite, etc.) haben ein festes Layout, bei dem nur die Texte und Bilder geändert werden können.

**F: Markdown oder Bausteine – was soll ich nutzen?**
A: 
- **Bausteine** empfehlen wir für die meisten Nutzer – sie sind visueller und bieten mehr Gestaltungsmöglichkeiten
- **Markdown** eignet sich für technisch versierte Nutzer, die schnell reinen Text formatieren möchten

### Benutzer

**F: Ich habe mein Passwort vergessen.**
A: Wenden Sie sich an einen Administrator. Passwörter können derzeit nur über das Supabase-Dashboard zurückgesetzt werden.

**F: Kann ich meinen eigenen Account löschen?**
A: Nein, Sie können nur andere Accounts löschen. Wenden Sie sich an einen Administrator.

### Medien

**F: Welche Dateiformate werden unterstützt?**
A: 
- **Bilder:** JPEG, PNG, GIF, WebP, SVG
- **Dokumente:** PDF, DOC/DOCX, XLS/XLSX
- **Andere:** Nahezu alle gängigen Formate

**F: Gibt es eine Größenbeschränkung für Uploads?**
A: Ja, die maximale Dateigröße richtet sich nach der Konfiguration des Hosting-Anbieters (Vercel). Profilbilder werden automatisch auf max. 400px Breite komprimiert.

---

## 18. Tipps & Best Practices

### Inhaltserstellung

1. **Aussagekräftige Titel:** Verwenden Sie klare, beschreibende Titel für Seiten und Beiträge
2. **Bilder optimieren:** Laden Sie Bilder in angemessener Größe hoch (max. 2000px Breite empfohlen)
3. **Vorschau nutzen:** Prüfen Sie immer die Vorschau bevor Sie veröffentlichen
4. **Entwürfe nutzen:** Speichern Sie Inhalte zunächst als Entwurf und veröffentlichen Sie erst, wenn alles fertig ist
5. **Kurztexte schreiben:** Füllen Sie bei Beiträgen immer den „Kurztext" aus – er wird in der Übersicht angezeigt
6. **Alt-Texte:** Geben Sie bei Bildern in der Galerie immer eine Beschreibung an (Barrierefreiheit)

### Organisation

1. **Seitenstruktur:** Ordnen Sie Seiten immer einer passenden Kategorie zu
2. **Sortierung:** Nutzen Sie die Sortierungsnummer um die Reihenfolge von Seiten festzulegen
3. **Navigation aktuell halten:** Überprüfen Sie regelmäßig, ob alle Links in der Navigation funktionieren
4. **Alte Inhalte:** Setzen Sie veraltete Beiträge auf „Entwurf" statt sie zu löschen

### Sicherheit

1. **Sichere Passwörter:** Verwenden Sie starke Passwörter (mind. 8 Zeichen, Buchstaben + Zahlen + Sonderzeichen)
2. **Abmelden:** Melden Sie sich nach der Nutzung ab, besonders an gemeinsam genutzten Computern
3. **Berechtigungen:** Erstellen Sie nur Accounts für Personen, die tatsächlich Inhalte verwalten müssen

---

> 📝 *Diese Dokumentation wurde erstellt für das CMS des Grabbe-Gymnasiums Detmold. Bei Fragen wenden Sie sich an die IT-Administration der Schule.*
