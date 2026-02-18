# 🎨 Style Guidelines – Grabbe-Gymnasium Detmold

> Umfassender und detaillierter Leitfaden für Design, Typografie, Farben, Komponenten, Animationen und Best Practices der Schulhomepage des Grabbe-Gymnasiums Detmold.

---

## Inhaltsverzeichnis

1. [Design-Philosophie](#1-design-philosophie)
2. [Farbsystem](#2-farbsystem)
3. [Typografie](#3-typografie)
4. [Abstände & Layout](#4-abstände--layout)
5. [Border-Radius & Schatten](#5-border-radius--schatten)
6. [Icons & Bilder](#6-icons--bilder)
7. [Komponenten-Bibliothek](#7-komponenten-bibliothek)
8. [Buttons & Interaktive Elemente](#8-buttons--interaktive-elemente)
9. [Navigation & Header](#9-navigation--header)
10. [Hero-Bereich & Seitenköpfe](#10-hero-bereich--seitenköpfe)
11. [Footer](#11-footer)
12. [Karten & Container](#12-karten--container)
13. [Formulare & Eingabefelder](#13-formulare--eingabefelder)
14. [Animationen & Transitions](#14-animationen--transitions)
15. [Glass-Morphism-Effekte](#15-glass-morphism-effekte)
16. [Responsive Design](#16-responsive-design)
17. [Dark Mode](#17-dark-mode)
18. [CMS-spezifische Patterns](#18-cms-spezifische-patterns)
19. [Barrierefreiheit (Accessibility)](#19-barrierefreiheit-accessibility)
20. [Do's & Don'ts](#20-dos--donts)
21. [Code-Konventionen](#21-code-konventionen)
22. [Referenz: CSS-Variablen](#22-referenz-css-variablen)
23. [Referenz: Tailwind-Klassen](#23-referenz-tailwind-klassen)

---

## 1. Design-Philosophie

### Grundprinzipien

Das Design der Grabbe-Gymnasium-Website folgt diesen Kernprinzipien:

1. **Klarheit** – Jede Seite hat eine klare visuelle Hierarchie. Inhalte sind sofort erfassbar.
2. **Modernität** – Zeitgemäßes Design mit Glass-Morphism, subtilen Animationen und weichen Übergängen.
3. **Konsistenz** – Alle Seiten verwenden dasselbe Farbschema, dieselben Schriftarten und denselben Designansatz.
4. **Barrierefreiheit** – Ausreichende Kontrastverhältnisse, lesbare Schriftgrößen, responsive Layouts.
5. **Zurückhaltung** – Design unterstützt den Inhalt, drängt sich aber nicht in den Vordergrund.

### Design-Sprache

| Element | Stil |
|---|---|
| Ecken | Weich abgerundet (12px Basis-Radius) |
| Oberflächen | Leichte Transparenz mit Blur (Glass-Morphism) |
| Farben | Blau-Grau-Palette mit hohem Kontrast |
| Typografie | Serifenschrift für Überschriften, Sans-Serif für Fließtext |
| Animationen | Subtil und zweckgebunden (Einblenden, Gleiten) |
| Schatten | Dezent und kontextabhängig |

---

## 2. Farbsystem

### Grundlagen

Alle Farben werden als **HSL-Werte** in CSS-Variablen definiert und können so einfach für Light- und Dark-Mode angepasst werden.

### Primäre Farbpalette

#### Light Mode

| Name | CSS-Variable | HSL-Wert | Hex (ungefähr) | Verwendung |
|---|---|---|---|---|
| **Background** | `--background` | `210 40% 98%` | `#f5f7fa` | Seitenhintergrund |
| **Foreground** | `--foreground` | `215 25% 12%` | `#1a2332` | Haupttext |
| **Primary** | `--primary` | `215 70% 45%` | `#2563b0` | Primäre Aktionen, Links, Akzente |
| **Primary Foreground** | `--primary-foreground` | `210 40% 98%` | `#f5f7fa` | Text auf Primary-Hintergrund |
| **Secondary** | `--secondary` | `210 30% 93%` | `#e4eaf0` | Sekundäre Flächen |
| **Accent** | `--accent` | `210 80% 55%` | `#3b8cf5` | Hervorhebungen, Hover |
| **Muted** | `--muted` | `210 25% 95%` | `#eef1f4` | Dezente Hintergründe |
| **Muted Foreground** | `--muted-foreground` | `215 16% 47%` | `#667085` | Sekundärtext, Beschreibungen |
| **Destructive** | `--destructive` | `0 84.2% 60.2%` | `#ef4444` | Fehler, Löschen, Warnung |
| **Card** | `--card` | `0 0% 100%` | `#ffffff` | Kartenhintergrund |
| **Border** | `--border` | `210 25% 90%` | `#dfe5ec` | Rahmenlinien |

#### Dark Mode

| Name | CSS-Variable | HSL-Wert | Hex (ungefähr) | Unterschied zu Light |
|---|---|---|---|---|
| **Background** | `--background` | `215 30% 7%` | `#0d1117` | Dunkelblau-Schwarz |
| **Foreground** | `--foreground` | `210 30% 95%` | `#eef1f4` | Helles Grau-Weiß |
| **Primary** | `--primary` | `210 80% 55%` | `#3b8cf5` | Helleres Blau |
| **Card** | `--card` | `215 30% 11%` | `#161d27` | Dunkelblau |
| **Muted** | `--muted` | `215 25% 15%` | `#1f2937` | Dunkles Grau-Blau |
| **Border** | `--border` | `215 20% 20%` | `#2d3748` | Dezenter Rahmen |

### Semantische Farben

| Farbe | Bedeutung | Beispiel |
|---|---|---|
| `primary` | Hauptaktionen, Navigation | Buttons, Links, aktive Zustände |
| `secondary` | Sekundäre Flächen | Hintergründe, Karten |
| `accent` | Hervorhebung | Hover-Effekte, spezielle Elemente |
| `destructive` | Gefährlich/Warnung | Lösch-Buttons, Fehlermeldungen |
| `muted` | Zurückhaltend | Beschreibungen, Platzhalter, Badges |

### Chart-Farben (Diagramme)

| Variable | Wert (Light) | Verwendung |
|---|---|---|
| `--chart-1` | `215 70% 45%` | Erste Datenserie |
| `--chart-2` | `180 60% 40%` | Zweite Datenserie |
| `--chart-3` | `30 80% 55%` | Dritte Datenserie |
| `--chart-4` | `280 65% 60%` | Vierte Datenserie |
| `--chart-5` | `340 75% 55%` | Fünfte Datenserie |

### Opazitäts-Hierarchie

Für Text und Oberflächen wird eine konsistente Opazitäts-Skala verwendet:

| Stufe | Opazität | Verwendung |
|---|---|---|
| Primär | `100%` | Überschriften, Haupttext |
| Sekundär | `80%` | Navigationstext, Labels |
| Tertiär | `60%` | Beschreibungstexte, Icons |
| Quaternär | `40%` | Dezente Labels, Trenner |
| Minimal | `25%–15%` | Rahmen, Trennlinien |
| Subtle | `10%–5%` | Hintergrund-Akzente |

**Tailwind-Notation:**
```
text-foreground        → 100%
text-foreground/80     → 80%
text-muted-foreground  → ~47% (eigene Variable)
bg-white/15            → 15% Weiß
bg-primary/10          → 10% Primary
```

### Spezielle Akzentfarben

| Kontext | Farbe | CSS |
|---|---|---|
| Hero-Überschrift (Italic) | Helles Cyan-Blau | `text-[hsl(200,85%,80%)]` |
| Footer Hover-Links | Helles Cyan | `hsl(200,90%,80%)` |
| Erfolg-Badges | Emerald | `bg-emerald-500/10 text-emerald-600` |
| Info-Badges | Sky | `bg-sky-500/10 text-sky-600` |
| Warnung-Badges | Amber | `bg-amber-500/10 text-amber-600` |
| Gefahr-Badges | Rose | `bg-rose-500/10 text-rose-600` |
| Highlight-Badges | Violet | `bg-violet-500/10 text-violet-600` |

---

## 3. Typografie

### Schriftfamilien

| Schriftfamilie | Tailwind-Klasse | Verwendung | Fallback |
|---|---|---|---|
| **Geist Sans** | `font-sans` | Fließtext, UI-Elemente, Buttons | System Sans-Serif |
| **Instrument Serif** | `font-display` | Überschriften, Display-Text | Georgia, Serif |
| **Josefin Sans** | `font-sub` | Labels, Kategorien, Akzent-Text | Sans-Serif |
| **Geist Mono** | `font-mono` | Code, URLs, technische Angaben | Monospace |
| **Geist Pixel Square** | `font-pixel` | Dekorative Elemente (selten) | Monospace |

### Schriftgrößen-System

#### Überschriften

| Ebene | Klassen | Größe (Desktop) | Verwendung |
|---|---|---|---|
| **Display** | `font-display text-3xl md:text-4xl lg:text-5xl font-bold` | 48px | Seitentitel, Hero-Überschriften |
| **H1** | `font-display text-3xl font-bold` | 30px | Seitenüberschriften |
| **H2** | `font-display text-2xl font-bold` | 24px | Abschnittsüberschriften |
| **H3** | `font-display text-lg font-semibold` | 18px | Unterabschnittsüberschriften |
| **H4** | `font-display text-sm font-semibold` | 14px | Kleine Überschriften, Labels |

#### Fließtext

| Stufe | Klassen | Größe | Verwendung |
|---|---|---|---|
| **Body** | `text-sm` | 14px | Standard-Fließtext |
| **Body Large** | `text-base` | 16px | Hervorgehobener Fließtext |
| **Small** | `text-xs` | 12px | Nebeninfo, Zeitstempel, Hinweise |
| **Tiny** | `text-[10px]` oder `text-[11px]` | 10–11px | Badges, Minimal-Labels |

#### Spezielle Typografie

| Name | Klassen | Beschreibung |
|---|---|---|
| **Kategorie-Label** | `font-sub text-[10px] uppercase tracking-[0.25em]` | Überschriften-Label (z.B. „WILLKOMMEN") |
| **Akzent-Serif** | `accent-serif` (CSS-Klasse) | Instrument Serif italic für Zitate |
| **Scroll-Text** | `text-[10px] uppercase tracking-[0.25em] text-white/60` | Scroll-Indikator im Hero |
| **Monospace-URL** | `font-mono text-xs` oder `font-mono text-sm` | URL-Anzeigen, technische Werte |

### Zeilenhöhe (Leading)

| Kontext | Klasse | Wert |
|---|---|---|
| Überschriften (Display) | `leading-[1.1]` | 1.1 (sehr eng) |
| Überschriften (Normal) | Standard | 1.25–1.5 |
| Fließtext | `leading-relaxed` | 1.625 |
| Listen | Standard | 1.5 |

### Zeichenabstand (Tracking/Letter-Spacing)

| Kontext | Klasse | Wert |
|---|---|---|
| Überschriften | `tracking-tight` | -0.025em |
| Labels/Kategorien | `tracking-[0.22em]` oder `tracking-[0.25em]` | +0.22–0.25em |
| Pixel-Schrift | `tracking-[0.15em]` (in CSS) | +0.15em |
| Normal | Standard | 0 |

### Text-Balance

Für Überschriften wird die CSS-Eigenschaft `text-balance` verwendet, um unschöne Zeilenumbrüche zu vermeiden:

```html
<h1 class="text-balance">Lange Überschrift die sich schön umbrechen soll</h1>
```

---

## 4. Abstände & Layout

### Abstands-System

Die Website verwendet ein konsistentes Abstands-System basierend auf `rem` (1rem = 16px):

| Name | Wert | Tailwind | Verwendung |
|---|---|---|---|
| Minimal | 4px | `p-1`, `gap-1` | Icon-Padding |
| Klein | 8px | `p-2`, `gap-2` | Enge Abstände |
| Standard | 12px | `p-3`, `gap-3` | Standard-Abstände |
| Mittel | 16px | `p-4`, `gap-4` | Karten-Padding, Abschnitte |
| Groß | 24px | `p-6`, `gap-6` | Sektions-Abstände |
| XL | 32px | `p-8`, `gap-8` | Große Abstände |
| XXL | 48–64px | `p-12`–`p-16` | Hero-Padding, Sektionsabstände |

### Container-System

| Kontext | Klasse | Maximale Breite |
|---|---|---|
| Seiten-Container | `max-w-6xl mx-auto` | 1152px |
| Inhalts-Container | `max-w-4xl mx-auto` | 896px |
| Navbar-Container | `max-w-3xl mx-auto` | 768px |
| CMS-Hauptbereich | `max-w-5xl mx-auto px-6 py-8` | 1024px |

### Responsive Padding

```
// Standard-Responsive-Padding
p-4 sm:p-6 md:p-10 lg:p-14

// Container-Padding
px-4 sm:px-6 md:px-8
```

### Grid-System

| Layout | Klassen | Verwendung |
|---|---|---|
| 2 Spalten | `grid sm:grid-cols-2 gap-4` | Karten-Paare |
| 3 Spalten | `grid sm:grid-cols-2 lg:grid-cols-3 gap-4` | Statistiken, Übersichten |
| 4 Spalten | `grid sm:grid-cols-2 lg:grid-cols-4 gap-4` | Footer-Links |
| Sidebar-Layout | `grid lg:grid-cols-3 gap-6` (2:1) | Editor mit Seitenleiste |
| Flexible Reihe | `flex flex-col sm:flex-row gap-3` | Buttons, Aktionen |

### Vertikaler Rhythmus

Zwischen Hauptabschnitten auf Seiten wird `mb-8` (32px) als Standard-Abstand verwendet. Innerhalb von Abschnitten `space-y-3` bis `space-y-6`.

---

## 5. Border-Radius & Schatten

### Border-Radius

| Stufe | CSS-Variable | Tailwind | Wert | Verwendung |
|---|---|---|---|---|
| **Large** | `--radius` | `rounded-lg` | 12px (0.75rem) | Standard-Container |
| **Medium** | `calc(var(--radius) - 2px)` | `rounded-md` | 10px | Inputs, Buttons |
| **Small** | `calc(var(--radius) - 4px)` | `rounded-sm` | 8px | Kleine Elemente |
| **XL** | – | `rounded-xl` | 12px | Karten, Panels |
| **2XL** | – | `rounded-2xl` | 16px | Große Karten, Hero-Elemente |
| **Full** | – | `rounded-full` | 50% | Pills, Avatare, Buttons |

### Bevorzugte Radius-Verwendung

| Element | Radius |
|---|---|
| Karten, große Container | `rounded-2xl` |
| Navigation-Pills | `rounded-full` |
| Input-Felder | `rounded-lg` |
| Kleine Badges | `rounded-full` |
| Bilder/Medien | `rounded-xl` oder `rounded-2xl` |
| Buttons | `rounded-md` oder `rounded-lg` |
| Avatare | `rounded-full` |

### Schatten

| Stufe | Tailwind | Verwendung |
|---|---|---|
| Kein Schatten | – | Standard für die meisten Elemente |
| Subtil | `shadow-sm` | Karten im PageHero |
| Standard | `shadow-md` | Hover-Effekte auf Karten |
| Prominent | `shadow-lg` | Navbar, Dropdowns |
| Text-Schatten | Inline-Style | Hero-Text für Lesbarkeit |

**Text-Schatten im Hero-Bereich:**
```css
text-shadow: 0 2px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4);
```

---

## 6. Icons & Bilder

### Icon-Bibliothek: Lucide React

Alle Icons stammen aus **Lucide React** (`lucide-react`). Verwendungsprinzipien:

| Kontext | Größe | Tailwind |
|---|---|---|
| Inline-Text | 12–14px | `h-3 w-3` oder `h-3.5 w-3.5` |
| Standard | 16px | `h-4 w-4` |
| Medium | 20px | `h-5 w-5` |
| Large | 28px | `h-7 w-7` |
| Display | 40px+ | `h-10 w-10` |

### Häufig verwendete Icons

| Icon | Kontext |
|---|---|
| `FileText` | Beiträge |
| `BookOpen` | Seiten |
| `CalendarDays` | Termine |
| `Upload` | Dokumente |
| `Mail` | Nachrichten |
| `GraduationCap` | Anmeldungen |
| `Settings` | Einstellungen |
| `Users` | Benutzer |
| `FolderTree` | Seitenstruktur |
| `Menu` | Navigation |
| `Eye` / `EyeOff` | Veröffentlicht/Entwurf |
| `Save` | Speichern |
| `Loader2` | Laden (mit `animate-spin`) |
| `Plus` | Hinzufügen |
| `Trash2` | Löschen |
| `Pencil` | Bearbeiten |
| `ArrowLeft` | Zurück |
| `ChevronDown` / `ChevronUp` | Auf-/Zuklappen |
| `GripVertical` | Drag-Handle |
| `X` | Schließen/Entfernen |

### Bildbehandlung

| Kontext | Klassen | Beschreibung |
|---|---|---|
| Hero-Bild | `w-full h-auto object-cover rounded-2xl` | Volle Breite, proportional |
| Galerie-Bild | `w-full h-auto object-cover rounded-2xl border` | In Rasterzelle |
| Avatar | `h-8 w-8 rounded-full object-cover` | Runder Ausschnitt |
| Vorschau-Bild | `h-32 w-full object-cover rounded-xl` | Feste Höhe, volle Breite |
| Logo | `h-16 w-auto md:h-20 lg:h-24 drop-shadow-lg` | Responsive Höhe |

### Bild-Overlays

```
// Dunkles Overlay auf Bildern
<div className="absolute inset-0 bg-black/50" />

// Gradient-Fade (unten)
<div className="h-2/5 bg-gradient-to-t from-background" />

// Gradient-Fade (links)
<div className="bg-gradient-to-r from-background/30 via-transparent" />
```

---

## 7. Komponenten-Bibliothek

### shadcn/ui Komponenten

Die Website verwendet **shadcn/ui** als Basis-Komponentenbibliothek. Folgende 46 Komponenten sind verfügbar:

#### Formular-Komponenten
| Komponente | Import | Beschreibung |
|---|---|---|
| `Button` | `@/components/ui/button` | Primäre Interaktionselemente |
| `Input` | `@/components/ui/input` | Text-Eingabefelder |
| `Label` | `@/components/ui/label` | Formular-Labels |
| `Textarea` | `@/components/ui/textarea` | Mehrzeilige Eingabe |
| `Select` | `@/components/ui/select` | Dropdown-Auswahl |
| `Checkbox` | `@/components/ui/checkbox` | Checkbox |
| `RadioGroup` | `@/components/ui/radio-group` | Radio-Buttons |
| `Switch` | `@/components/ui/switch` | Toggle-Schalter |
| `Slider` | `@/components/ui/slider` | Schieberegler |
| `Form` | `@/components/ui/form` | Formular-Wrapper (react-hook-form) |

#### Layout-Komponenten
| Komponente | Import | Beschreibung |
|---|---|---|
| `Card` | `@/components/ui/card` | Karten-Container |
| `Badge` | `@/components/ui/badge` | Status-Badges |
| `Avatar` | `@/components/ui/avatar` | Benutzer-Avatare |
| `Separator` | `@/components/ui/separator` | Trennlinien |
| `Skeleton` | `@/components/ui/skeleton` | Lade-Platzhalter |
| `AspectRatio` | `@/components/ui/aspect-ratio` | Seitenverhältnis-Container |

#### Dialog- & Overlay-Komponenten
| Komponente | Import | Beschreibung |
|---|---|---|
| `Dialog` | `@/components/ui/dialog` | Modale Dialoge |
| `AlertDialog` | `@/components/ui/alert-dialog` | Bestätigungsdialoge |
| `Sheet` | `@/components/ui/sheet` | Seitenpanel |
| `Drawer` | `@/components/ui/drawer` | Mobile Drawer |
| `Popover` | `@/components/ui/popover` | Popup-Tooltips |
| `DropdownMenu` | `@/components/ui/dropdown-menu` | Dropdown-Menüs |
| `Tooltip` | `@/components/ui/tooltip` | Hover-Tooltips |
| `HoverCard` | `@/components/ui/hover-card` | Hover-Informationskarten |

#### Daten-Anzeige
| Komponente | Import | Beschreibung |
|---|---|---|
| `Table` | `@/components/ui/table` | Datentabellen |
| `Accordion` | `@/components/ui/accordion` | Aufklappbare Bereiche |
| `Tabs` | `@/components/ui/tabs` | Tab-Navigation |
| `Progress` | `@/components/ui/progress` | Fortschrittsbalken |
| `Calendar` | `@/components/ui/calendar` | Kalender-Widget |
| `Chart` | `@/components/ui/chart` | Diagramme (Recharts) |
| `Carousel` | `@/components/ui/carousel` | Bilder-Karussell |
| `ScrollArea` | `@/components/ui/scroll-area` | Scrollbarer Bereich |

---

## 8. Buttons & Interaktive Elemente

### Button-Varianten

| Variante | Tailwind-Klassen (vereinfacht) | Verwendung |
|---|---|---|
| **Default/Primary** | `bg-primary text-primary-foreground hover:bg-primary/90` | Primäre Aktionen (Speichern, Erstellen) |
| **Outline** | `border border-input bg-background hover:bg-muted` | Sekundäre Aktionen |
| **Ghost** | `hover:bg-muted hover:text-foreground` | Tertiäre Aktionen, Icons |
| **Destructive** | `bg-destructive text-destructive-foreground` | Löschen, Abbrechen |
| **Link** | `text-primary underline-offset-4 hover:underline` | Inline-Links |

### Button-Größen

| Größe | Klasse | Padding | Verwendung |
|---|---|---|---|
| Default | – | `h-10 px-4 py-2` | Standard-Buttons |
| Small | `size="sm"` | `h-9 px-3` | Kompakte Buttons |
| Icon | `size="icon"` | `h-10 w-10` | Nur-Icon-Buttons |
| Large | `size="lg"` | `h-11 px-8` | Prominente CTAs |

### CTA-Buttons (Hero & Landingpages)

```
// Primärer CTA (Hell auf dunkel)
bg-white/95 text-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-full
font-medium text-sm shadow-lg hover:bg-white

// Sekundärer CTA (Transparent)
bg-white/15 backdrop-blur-md border border-white/25 rounded-full
text-white/90 hover:bg-white/25 px-4 sm:px-5 py-2 sm:py-2.5
```

### Interaktive Zustände

| Zustand | Klasse | Beschreibung |
|---|---|---|
| Hover | `hover:bg-primary/90` | Leichte Verdunkelung |
| Active/Pressed | – | Nativer Browser-Zustand |
| Disabled | `disabled:opacity-50` | Reduzierte Deckkraft |
| Loading | `<Loader2 className="animate-spin" />` | Drehender Ladeindikator |
| Focus | `focus:outline-none focus:ring-2 focus:ring-ring` | Fokusring |

### Link-Styling

```
// Inline-Links
text-primary hover:underline

// Footer-Links
text-primary-foreground/60 hover:text-[hsl(200,90%,80%)]

// Navigations-Links
text-foreground/80 hover:text-foreground hover:bg-white/25 rounded-full px-3 py-1.5

// CMS-Sidebar-Links (Aktiv)
bg-primary/10 text-primary rounded-lg
```

---

## 9. Navigation & Header

### Desktop-Navigation

**Struktur:** Zentrierte Pill-Navigation mit Glass-Morphism-Hintergrund.

```
// Navbar-Container
fixed top-0 z-50 w-full
→ innerer Container: max-w-3xl mx-auto

// Glass-Hintergrund
bg-white/15 backdrop-blur-md border border-white/25 shadow-lg rounded-full
```

**Nav-Items:**
```
// Normal
rounded-full px-3 py-1.5 text-sm font-medium
text-foreground/80 hover:text-foreground hover:bg-white/25
transition-colors duration-200

// Aktiv
bg-white/30 text-foreground
```

**Dropdown-Menüs:**
```
// Container
absolute top-full -translate-x-1/2 pt-2 min-w-[220px]
animate-blur-in

// Hintergrund
bg-background/95 backdrop-blur-xl border border-border
rounded-2xl shadow-2xl p-2

// Items
rounded-lg px-3 py-2 text-sm hover:bg-muted
```

### Mobile-Navigation

```
// Toggle-Button
h-9 w-9 rounded-full bg-white/15 hover:bg-white/25

// Menü-Container
bg-background/98 backdrop-blur-xl border border-border
rounded-2xl shadow-2xl max-h-[70vh] overflow-y-auto

// Items
rounded-lg px-4 py-3 text-base
```

### Logo

```
// Position
absolute left-4 md:left-8 top-4 z-40  (scrollt mit der Seite)

// Bild
h-16 w-auto md:h-20 lg:h-24 drop-shadow-lg
```

> **Wichtig:** Das Logo ist in einem eigenen `div` (z-40) außerhalb des fixierten Headers (z-50), damit es beim Scrollen verschwindet, die Navbar aber fixiert bleibt.

---

## 10. Hero-Bereich & Seitenköpfe

### Startseiten-Hero

**Bild-Container:**
```
w-full overflow-hidden
rounded-b-[1.5rem] sm:rounded-b-[2rem] md:rounded-b-[3rem]
aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]
```

**Text-Overlay:**
```
absolute inset-0
flex flex-col justify-end
p-4 sm:p-6 md:p-10 lg:p-14
text-white
```

> **Kein dunkles Overlay!** Stattdessen Text-Schatten für Lesbarkeit:
> ```css
> text-shadow: 0 2px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4);
> ```

**Überschrift:**
```
font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl
font-bold tracking-tight leading-[1.1]
```

**Italic-Akzent in Überschrift:**
```
italic text-[hsl(200,85%,80%)]
```

### Unterseiten-Hero (PageHero)

**Layout:**
```
flex items-center gap-8
→ Linke Spalte: flex-1 (Titel + Text)
→ Rechte Spalte: hidden sm:block w-64 md:w-80 lg:w-96 (Bild/Dekorativ)
```

**Label über dem Titel:**
```
text-xs font-sub uppercase tracking-[0.22em] text-primary
```

**Titel:**
```
font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance
```

**Dekoratives Panel (wenn kein Bild):**
```
rounded-2xl shadow-sm h-40 md:h-52 lg:h-60
Hintergrund: linear-gradient(135deg, #bae6fd, #38bdf8, #7dd3fc)
→ ASCII-Art-Generator mit font-mono text-[8px] text-sky-900/25
```

---

## 11. Footer

### Struktur

```
bg-primary text-primary-foreground
→ noise-overlay Klasse für subtile Textur
```

**Layout:**
```
max-w-6xl mx-auto px-6 py-16

// Grid
grid gap-12 md:grid-cols-2 lg:grid-cols-4
```

### Typografie im Footer

| Element | Klassen |
|---|---|
| Sektions-Header | `font-sub text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40` |
| Links | `text-primary-foreground/60 hover:text-[hsl(200,90%,80%)]` |
| Body-Text | `text-primary-foreground/60 text-sm` |
| Icons | `text-primary-foreground/30 h-4 w-4` |

### Dekoratives Wasserzeichen

```
font-display text-[20vw] italic
text-primary-foreground/[0.02]
pointer-events-none select-none
```

### Footer-Logo

```
filter: brightness-0 invert  (konvertiert zu Weiß)
opacity-80
h-20
```

---

## 12. Karten & Container

### Standard-Karte

```
rounded-2xl border border-border bg-card p-6
```

### Karte mit Hover

```
rounded-2xl border bg-card p-6
transition-all
hover:border-primary/30 hover:shadow-md
```

### Info-Karte (mit Icon)

```
rounded-2xl border bg-card p-6

// Icon-Container
flex h-10 w-10 items-center justify-center rounded-xl
bg-primary/10 text-primary  (oder andere Farbvarianten)
```

### Hervorgehobene Karte

```
rounded-2xl border border-primary/20 bg-primary/5 p-6
```

### Leerer Zustand

```
rounded-2xl border border-dashed border-border py-16 text-center
→ Text: text-muted-foreground
→ Optional: CTA-Button
```

### CMS-Einstellungs-Karte

```
rounded-xl border border-border bg-card p-4
→ Flex-Layout mit Label, Wert und Aktions-Buttons
```

---

## 13. Formulare & Eingabefelder

### Standard-Input

```
flex h-10 w-full rounded-md border border-input bg-background
px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-ring
placeholder:text-muted-foreground
```

### Textarea

```
min-h-[80px] w-full resize-y rounded-lg border border-input bg-background
px-3 py-2 text-sm leading-relaxed
focus:outline-none focus:ring-2 focus:ring-ring
```

### Markdown-Editor

```
min-h-[400px] w-full resize-y rounded-lg border border-input bg-background
px-4 py-3 text-sm leading-relaxed font-mono
```

### Select (Native)

```
flex h-10 w-full rounded-md border border-input bg-background
px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring
```

### Labels

```
text-sm font-medium  (Standard)
text-xs              (Kompakt)
font-semibold        (Hervorgehoben)
```

### Fehler-Anzeige

```
rounded-lg border border-destructive/30 bg-destructive/10
px-4 py-3 text-sm text-destructive
```

### Erfolgs-Anzeige

```
rounded-lg border border-primary/20 bg-primary/5
p-4 text-sm text-primary
```

---

## 14. Animationen & Transitions

### Eingangs-Animationen

| Animation | Klasse | Dauer | Beschreibung |
|---|---|---|---|
| **Fade-in Up** | `animate-fade-in-up` | 0.9s | Opacity + translateY(40px→0) |
| **Fade-in** | `animate-fade-in` | 0.6s | Nur Opacity |
| **Slide-in Left** | `animate-slide-in-left` | 0.9s | Opacity + translateX(-50px→0) |
| **Slide-in Right** | `animate-slide-in-right` | 0.9s | Opacity + translateX(50px→0) |
| **Scale-in** | `animate-scale-in` | 0.7s | Opacity + scale(0.9→1) |
| **Reveal Up** | `animate-reveal-up` | 1.0s | Clip-path reveal + translateY |
| **Blur-in** | `animate-blur-in` | 0.9s | Blur(16px→0) + opacity + translateY |
| **Slide-up** | `animate-slide-up` | 1.0s | translateY(60px→0) |
| **Count-up** | `animate-count-up` | 0.6s | Opacity + translateY(20px→0) |

### Timing-Funktion

Alle Eingangs-Animationen verwenden die gleiche Easing-Funktion:
```css
cubic-bezier(0.22, 1, 0.36, 1)
```
Diese Kurve erzeugt einen schnellen Start mit langsamem, elegantem Auslauf.

### Endlos-Animationen

| Animation | Klasse | Dauer | Beschreibung |
|---|---|---|---|
| **Parallax Float** | `animate-parallax-float` | 6s | Sanftes Auf/Ab-Schweben |
| **Gentle Pulse** | `animate-gentle-pulse` | 5s | Dezentes Pulsieren (Scale + Opacity) |
| **Marquee** | `animate-marquee` | 35s | Horizontaler Lauftext |
| **Float Slow** | `animate-float-slow` | 8s | Langsames Schweben mit Rotation |
| **Glow Pulse** | `animate-glow-pulse` | 3s | Schimmer-Effekt |
| **Border Glow** | `animate-border-glow` | 3s | Leuchtender Rahmen |

### Verzögerungs-Helfer

```
.delay-100  { animation-delay: 100ms }
.delay-200  { animation-delay: 200ms }
.delay-300  { animation-delay: 300ms }
.delay-400  { animation-delay: 400ms }
.delay-500  { animation-delay: 500ms }
.delay-600  { animation-delay: 600ms }
.delay-700  { animation-delay: 700ms }
.delay-800  { animation-delay: 800ms }
.delay-900  { animation-delay: 900ms }
.delay-1000 { animation-delay: 1000ms }
.delay-1100 { animation-delay: 1100ms }
.delay-1200 { animation-delay: 1200ms }
.delay-1500 { animation-delay: 1500ms }
```

### Hover-Transitions

```
transition-colors duration-200     → Farbwechsel
transition-all                     → Alle Eigenschaften
transition-transform duration-200  → Transform-Animationen
group-hover:translate-x-1          → Icon-Verschiebung bei Button-Hover
```

### Typing-Animation

Für den Hero-Bereich gibt es eine spezielle Tipp-Animation:

```css
.typing-wrapper {
  overflow: hidden;
  border-right: 2px solid white;
  white-space: nowrap;
  animation: typing 2s steps(40, end), blink 0.75s step-end infinite;
}
```

---

## 15. Glass-Morphism-Effekte

### Grundprinzip

Glass-Morphism erzeugt einen halbtransparenten, verschwommenen Hintergrund:

### Verfügbare Klassen

| Klasse | Eigenschaften | Verwendung |
|---|---|---|
| `.glass` | `backdrop-blur(20px)`, opacity 0.6 | Standard-Glass |
| `.glass-strong` | `backdrop-blur(32px)`, opacity 0.75 | Stärkerer Blur |
| `.glass-dark` | `backdrop-blur(20px)`, dunkle Variante | Dark-Mode-Glass |

### Inline Glass-Morphism

```
// Navbar
bg-white/15 backdrop-blur-md border border-white/25 shadow-lg

// Dropdown
bg-background/95 backdrop-blur-xl border border-border shadow-2xl

// Mobile Menu
bg-background/98 backdrop-blur-xl border border-border

// CTA-Button (sekundär)
bg-white/15 backdrop-blur-md border border-white/25
```

### Wann Glass-Morphism verwenden

✅ **Ja:**
- Navigationsleiste (über Bildern)
- Dropdowns und Overlays
- CTA-Buttons auf Bildhintergründen
- Mobile Menüs

❌ **Nein:**
- Standard-Karten auf hellem Hintergrund
- Formular-Container
- Footer-Elemente
- CMS-Verwaltungselemente

---

## 16. Responsive Design

### Breakpoints

| Breakpoint | Mindestbreite | Tailwind-Prefix | Typisches Gerät |
|---|---|---|---|
| Default | 0px | (kein Prefix) | Smartphones (Portrait) |
| `sm` | 640px | `sm:` | Smartphones (Landscape), kleine Tablets |
| `md` | 768px | `md:` | Tablets |
| `lg` | 1024px | `lg:` | Laptops, kleine Desktops |
| `xl` | 1280px | `xl:` | Große Desktops |

### Mobile-First-Ansatz

Alle Stile werden zuerst für die kleinste Bildschirmgröße definiert und dann mit Breakpoints erweitert:

```
// Falsch ❌
lg:text-sm md:text-base text-xl

// Richtig ✅
text-sm md:text-base lg:text-xl
```

### Responsive Patterns

#### Text-Skalierung
```
text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl  → Hero-Überschrift
text-sm md:text-base lg:text-lg                           → Fließtext
text-xs sm:text-sm                                        → Kleine Texte
```

#### Layout-Wechsel
```
flex flex-col sm:flex-row          → Vertikal → Horizontal
grid sm:grid-cols-2 lg:grid-cols-3 → 1 → 2 → 3 Spalten
hidden sm:block                    → Auf Mobile ausblenden
w-full sm:w-auto                   → Volle Breite → Auto-Breite
```

#### Sichtbarkeit
```
hidden lg:flex     → Desktop-Navigation
flex lg:hidden     → Mobile-Navigation
hidden sm:block    → Bild im PageHero
```

#### Spacing
```
p-4 sm:p-6 md:p-10 lg:p-14   → Responsive Padding
gap-4 sm:gap-6 md:gap-8       → Responsive Gap
px-4 sm:px-6 md:px-8          → Responsive Horizontal-Padding
```

### Hero-Bild Seitenverhältnis

```
aspect-[4/3]     → Mobile (Hochformat)
sm:aspect-[16/9] → Tablet (Breitbild)
md:aspect-[21/9] → Desktop (Ultrabreit)
```

---

## 17. Dark Mode

### Implementierung

Dark Mode wird über CSS-Klasse `.dark` auf dem `<html>`-Element aktiviert. Die CSS-Variablen in `:root` werden durch die `.dark`-Variante überschrieben.

### Farbumkehrung

| Element | Light | Dark |
|---|---|---|
| Hintergrund | Helles Grau-Blau | Dunkles Blau-Schwarz |
| Text | Dunkles Blau-Grau | Helles Grau-Weiß |
| Karten | Weiß | Dunkles Blau |
| Rahmen | Helles Grau | Dunkles Grau |
| Primary | Mittleres Blau | Helleres Blau |
| Muted | Helles Grau | Dunkles Grau |

### Best Practices für Dark Mode

1. **Keine festen Farben verwenden** – Immer CSS-Variablen nutzen
2. **Opazität statt fester Farbe** – `text-foreground/80` statt `text-gray-600`
3. **Primary-Varianten** – `bg-primary/10` statt `bg-blue-100`
4. **Schatten reduzieren** – Schatten in Dark Mode sind weniger sichtbar
5. **Bilder testen** – Prüfen ob Bilder auch in Dark Mode gut aussehen

---

## 18. CMS-spezifische Patterns

### CMS-Layout

```
// Sidebar
w-64 shrink-0 border-r border-border bg-card

// Main Content
flex-1 overflow-y-auto
→ Container: max-w-5xl mx-auto px-6 py-8
```

### CMS-Sidebar-Design

```
// Logo-Bereich
border-b border-border px-5 py-4
→ Logo-Icon: h-8 w-8 rounded-lg bg-primary
→ Text: font-display font-semibold

// Sektions-Header
px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground

// Nav-Items
rounded-lg px-3 py-2 text-sm font-medium
→ Aktiv: bg-primary/10 text-primary
→ Inaktiv: text-muted-foreground hover:bg-muted hover:text-foreground
```

### CMS-Seiten-Header

```
// Titel
font-display text-2xl font-bold text-foreground  (oder text-3xl für Hauptseiten)

// Beschreibung
text-sm text-muted-foreground mt-1

// Aktions-Buttons
flex items-center gap-2 (rechts ausgerichtet)
```

### CMS-Editor-Pattern

```
// Zweispaltiges Layout
grid gap-6 lg:grid-cols-3
→ Editor: lg:col-span-2 space-y-6
→ Sidebar: space-y-6

// Editor-Panel
rounded-2xl border bg-card p-6 space-y-4

// Sidebar-Panel
rounded-2xl border bg-card p-6 space-y-3

// Info-Panel (blau)
rounded-2xl border border-primary/20 bg-primary/5 p-6
```

### CMS-Listen-Pattern

```
// Liste
space-y-3

// Listen-Item
rounded-xl border border-border bg-card p-4
flex items-center justify-between
```

### CMS-Status-Badges

```
// Veröffentlicht
rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600

// Entwurf
rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground

// Geändert
rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700

// Eigener Benutzer
rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary
```

---

## 19. Barrierefreiheit (Accessibility)

### Grundregeln

1. **Kontrastverhältnisse:** Mindestens 4.5:1 für normalen Text, 3:1 für großen Text (WCAG AA)
2. **Fokus-Indikatoren:** Alle interaktiven Elemente müssen sichtbare Focus-Stile haben (`focus:ring-2 focus:ring-ring`)
3. **Alt-Texte:** Alle Bilder benötigen beschreibende `alt`-Attribute
4. **Semantisches HTML:** Verwenden Sie `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>` etc.
5. **ARIA-Labels:** Navigation erhält `aria-label="CMS Navigation"` bzw. `"Hauptnavigation"`
6. **Tastatur-Navigation:** Alle Funktionen müssen per Tastatur erreichbar sein

### Implementierte Accessibility-Features

| Feature | Umsetzung |
|---|---|
| Navigations-Landmarks | `<nav aria-label="...">` in Header und CMS |
| Fokus-Ringe | `focus:outline-none focus:ring-2 focus:ring-ring` |
| Skip-Links | – (empfohlen für zukünftige Umsetzung) |
| Bild-Alt-Texte | `alt` auf allen `<img>`-Elementen |
| Button-Labels | Icons mit Text-Labels oder `aria-label` |
| Farbkontrast | HSL-basiertes System mit ausreichendem Kontrast |

### `prefers-reduced-motion`

Animationen sollten für Nutzer deaktiviert werden, die reduzierte Bewegung bevorzugen:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 20. Do's & Don'ts

### ✅ Do's

| Regel | Begründung |
|---|---|
| **CSS-Variablen für Farben nutzen** | Ermöglicht konsistentes Theming und Dark Mode |
| **`font-display` für Überschriften** | Instrument Serif ist die Display-Schrift der Marke |
| **`rounded-2xl` für große Container** | Konsistentes Border-Radius-System |
| **`text-muted-foreground` für Sekundärtext** | Einheitliche Typografie-Hierarchie |
| **Mobile-First entwickeln** | Responsive Design von klein nach groß |
| **Animationen sparsam einsetzen** | Nur für Eingangsanimationen und Feedback |
| **`space-y-*` für vertikale Abstände** | Konsistenter vertikaler Rhythmus |
| **shadcn/ui-Komponenten verwenden** | Einheitliches Look & Feel |
| **`transition-colors duration-200`** | Sanfte Hover-Übergänge |
| **Badges für Status verwenden** | Klare visuelle Kommunikation |

### ❌ Don'ts

| Regel | Begründung |
|---|---|
| **Keine festen Hex-Farben** | Bricht Dark Mode und Konsistenz |
| **Kein `!important`** | Erzeugt Spezifitäts-Probleme |
| **Keine externen CSS-Frameworks mischen** | Nur Tailwind CSS verwenden |
| **Keine anderen Icon-Bibliotheken** | Nur Lucide React verwenden |
| **Kein `margin-top` auf erstem Kind** | `space-y-*` auf dem Parent verwenden |
| **Keine festen Breakpoints (px)** | Tailwind-Breakpoints verwenden |
| **Keine Auto-Play-Videos** | Nutzerfreundlichkeit beachten |
| **Keine Scroll-Hijacking** | Natürliches Scrollverhalten beibehalten |
| **Keine Animationen über 1s** | Ausnahme: Endlos-Animationen (Marquee, Float) |
| **Kein dunkles Overlay auf Hero-Bildern** | Text-Schatten verwenden stattdessen |

---

## 21. Code-Konventionen

### TypeScript / React

```typescript
// Komponenten: PascalCase
export function PageEditor({ page }: PageEditorProps) { ... }

// Props: Interface mit -Props Suffix
interface PageEditorProps {
  page?: { id: string; title: string; ... }
}

// State: camelCase
const [showPreview, setShowPreview] = useState(false)

// Event-Handler: handle-Prefix
const handleSave = async () => { ... }
const handleTitleChange = (value: string) => { ... }
```

### Tailwind-Klassen-Reihenfolge

Empfohlene Reihenfolge der Tailwind-Klassen:

```
1. Layout:        flex, grid, block, hidden
2. Position:      relative, absolute, fixed, z-*
3. Größe:         w-*, h-*, min-*, max-*
4. Spacing:       p-*, m-*, gap-*
5. Typografie:    font-*, text-*, leading-*, tracking-*
6. Hintergrund:   bg-*
7. Rahmen:        border-*, rounded-*
8. Effekte:       shadow-*, opacity-*, backdrop-*
9. Transitions:   transition-*, duration-*, animate-*
10. Responsive:   sm:*, md:*, lg:*, xl:*
11. Zustände:     hover:*, focus:*, active:*, disabled:*
```

### Import-Reihenfolge

```typescript
// 1. React/Next.js
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// 2. Externe Bibliotheken
import { createClient } from "@/lib/supabase/client"

// 3. UI-Komponenten
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// 4. Icons
import { Save, Loader2, Plus } from "lucide-react"

// 5. Eigene Komponenten
import { PageEditor } from "@/components/cms/page-editor"
```

### Datei-Konventionen

| Typ | Konvention | Beispiel |
|---|---|---|
| Komponente | `kebab-case.tsx` | `page-editor.tsx` |
| Seite | `page.tsx` (in Verzeichnis) | `app/cms/settings/page.tsx` |
| Layout | `layout.tsx` | `app/cms/layout.tsx` |
| API-Route | `route.ts` | `app/api/users/route.ts` |
| Typen | `*.types.ts` | `database.types.ts` |
| Utilities | `kebab-case.ts` | `page-content.ts` |
| SQL | `snake_case.sql` | `complete_schema.sql` |

### Supabase-Konventionen

```typescript
// Server-seitig (RSC)
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()

// Client-seitig ("use client")
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()

// Admin-Operationen (nur server-seitig)
import { createAdminClient } from "@/lib/supabase/admin"
const adminClient = createAdminClient()

// Immer mit Database-Typ
createServerClient<Database>(url, key, options)
```

### Fehlerbehandlung

```typescript
// Resiliente DB-Abfragen (für optionale Spalten)
try {
  const { data, error } = await supabase.from("table").select("*, new_column")
  if (error?.message?.includes("new_column")) {
    // Retry ohne neue Spalte
    const { data: fallback } = await supabase.from("table").select("*")
    return { ...fallback, new_column: null }
  }
} catch { /* Graceful degradation */ }
```

---

## 22. Referenz: CSS-Variablen

### Vollständige Variablen-Liste (Light Mode)

```css
:root {
  /* Basis */
  --radius: 0.75rem;

  /* Hauptfarben */
  --background: 210 40% 98%;
  --foreground: 215 25% 12%;

  /* Primär */
  --primary: 215 70% 45%;
  --primary-foreground: 210 40% 98%;

  /* Sekundär */
  --secondary: 210 30% 93%;
  --secondary-foreground: 215 25% 25%;

  /* Akzent */
  --accent: 210 80% 55%;
  --accent-foreground: 215 25% 15%;

  /* Gedämpft */
  --muted: 210 25% 95%;
  --muted-foreground: 215 16% 47%;

  /* Destruktiv */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 100%;

  /* Karte */
  --card: 0 0% 100%;
  --card-foreground: 215 25% 12%;

  /* Popover */
  --popover: 0 0% 100%;
  --popover-foreground: 215 25% 12%;

  /* Eingabe */
  --input: 210 25% 88%;
  --ring: 215 70% 45%;

  /* Sidebar */
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217.2 91.2% 59.8%;

  /* Diagramme */
  --chart-1: 215 70% 45%;
  --chart-2: 180 60% 40%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
```

### Dark Mode Variablen

```css
.dark {
  --background: 215 30% 7%;
  --foreground: 210 30% 95%;
  --primary: 210 80% 55%;
  --primary-foreground: 215 30% 7%;
  --secondary: 215 25% 15%;
  --secondary-foreground: 210 25% 90%;
  --accent: 210 80% 55%;
  --accent-foreground: 215 25% 15%;
  --muted: 215 25% 15%;
  --muted-foreground: 215 16% 55%;
  --destructive: 0 62.8% 50.6%;
  --destructive-foreground: 0 0% 100%;
  --card: 215 30% 11%;
  --card-foreground: 210 30% 95%;
  --popover: 215 30% 11%;
  --popover-foreground: 210 30% 95%;
  --input: 215 20% 20%;
  --border: 215 20% 20%;
  --ring: 210 80% 55%;
  --sidebar-background: 215 30% 7%;
  --sidebar-foreground: 210 30% 95%;
  --sidebar-primary: 210 80% 55%;
  --sidebar-primary-foreground: 215 30% 7%;
  --sidebar-accent: 215 25% 15%;
  --sidebar-accent-foreground: 210 30% 95%;
  --sidebar-border: 215 20% 20%;
  --sidebar-ring: 210 80% 55%;
  --chart-1: 210 80% 55%;
  --chart-2: 180 55% 50%;
  --chart-3: 30 85% 60%;
  --chart-4: 280 70% 65%;
  --chart-5: 340 80% 60%;
}
```

---

## 23. Referenz: Tailwind-Klassen

### Häufig verwendete Klassen-Kombinationen

```
/* Standard-Seite */
max-w-6xl mx-auto px-4 sm:px-6 md:px-8

/* CMS-Seitenheader */
flex items-center justify-between

/* CMS-Seitentitel */
font-display text-2xl font-bold text-foreground

/* Standard-Karte */
rounded-2xl border border-border bg-card p-6

/* Editor-Panel */
rounded-2xl border bg-card p-6 space-y-4

/* Status-Badge (aktiv) */
flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600

/* Status-Badge (entwurf) */
flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground

/* Lade-Spinner */
<Loader2 className="h-6 w-6 animate-spin text-primary" />

/* Leerer Zustand */
rounded-2xl border border-dashed border-border py-16 text-center

/* Fehler-Box */
rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive

/* Erfolgs-Box */
rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary

/* Avatar-Circle */
flex h-10 w-10 items-center justify-center rounded-full bg-primary/10

/* Icon-Container (farbig) */
flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary
```

---

> 🎨 *Diese Style Guidelines sind der verbindliche Leitfaden für alle Design-Entscheidungen auf der Website des Grabbe-Gymnasiums Detmold. Bei Fragen oder Erweiterungswünschen wenden Sie sich an die Entwicklungsabteilung.*
