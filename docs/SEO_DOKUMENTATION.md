# SEO-Dokumentation – Grabbe-Gymnasium Website

> Letzte Aktualisierung: Februar 2026

## Inhaltsverzeichnis

1. [Ueberblick](#1-ueberblick)
2. [Architektur](#2-architektur)
3. [Einstellungen (CMS)](#3-einstellungen-cms)
4. [URL- und Canonical-Policy](#4-url--und-canonical-policy)
5. [Titel-System](#5-titel-system)
6. [Meta-Tags und Open Graph](#6-meta-tags-und-open-graph)
7. [JSON-LD Structured Data](#7-json-ld-structured-data)
8. [Sitemap](#8-sitemap)
9. [robots.txt](#9-robotstxt)
10. [Breadcrumbs](#10-breadcrumbs)
11. [Environments / Preview-Schutz](#11-environments--preview-schutz)
12. [SEO fuer Beitraege (News)](#12-seo-fuer-beitraege-news)
13. [SEO fuer eigene Seiten](#13-seo-fuer-eigene-seiten)
14. [SEO QA Tool](#14-seo-qa-tool)
15. [Go-live Checklist](#15-go-live-checklist)
16. [Content-Checklist fuer Redakteure](#16-content-checklist-fuer-redakteure)
17. [Verifikation (How to Verify)](#17-verifikation-how-to-verify)
18. [Technische Referenz](#18-technische-referenz)
19. [Datenbank-Migration](#19-datenbank-migration)

---

## 1. Ueberblick

Das SEO-System ist modular, umgebungsabhaengig und liefert auf jeder Seite:
- Konsistente **Seitentitel** via Template (`Seitenname / Grabbe-Gymnasium`)
- **Canonical URLs** (relativ, aufgeloest ueber `metadataBase`)
- **Open Graph + Twitter Cards** (automatisch, per Seite ueberschreibbar)
- **JSON-LD** (Organization + WebSite global, BreadcrumbList + WebPage/NewsArticle per Seite)
- Automatische **sitemap.xml** und **robots.txt**
- **Preview-Schutz**: Nicht-Produktionsumgebungen bekommen `noindex`

| Feature | Automatisch | Manuell anpassbar |
|---------|:-----------:|:-----------------:|
| Seitentitel | ✅ | ✅ per Einstellung |
| Meta-Beschreibungen | ✅ (Fallback) | ✅ per Seite/Beitrag |
| Open Graph / Twitter | ✅ | ✅ per Seite/Beitrag |
| Canonical URLs | ✅ | – |
| robots.txt | ✅ | – (hardcoded, sicher) |
| sitemap.xml | ✅ | – |
| JSON-LD | ✅ | ✅ per Einstellung |
| Preview noindex | ✅ | – |
| Breadcrumbs (visuell + JSON-LD) | ✅ | – |

---

## 2. Architektur

```
lib/seo.tsx                    ← Zentrale SEO-Bibliothek
├── resolveBaseUrl()           ← Base-URL aus DB → Env-Vars → Fallback
├── getSEOSettings()           ← Laedt Einstellungen (mit DB-Fehlertoleranz)
├── generatePageMetadata()     ← Next.js Metadata fuer beliebige Seiten
├── generateOrganizationJsonLd()
├── generateWebSiteJsonLd()
├── generateArticleJsonLd()
├── generateBreadcrumbJsonLd()
├── generateWebPageJsonLd()
└── JsonLd                     ← React-Komponente <script type="application/ld+json">

components/breadcrumbs.tsx     ← Breadcrumb-Navigation (visuell + JSON-LD)

app/layout.tsx                 ← Root-Metadata + Organization/WebSite JSON-LD
app/sitemap.ts                 ← Dynamische Sitemap
app/robots.ts                  ← robots.txt (umgebungsabhaengig)
app/api/seo-check/route.ts    ← SEO QA Diagnostic API
middleware.ts                  ← Schliesst sitemap.xml/robots.txt von Rewrites aus
```

### Datenfluss

1. `resolveBaseUrl()` liefert **immer** eine gueltige URL:
   - DB-Wert `seo_site_url` → `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `localhost:3000`
2. Root Layout setzt `metadataBase`, dadurch werden **alle relativen Canonicals automatisch absolut**
3. **Jede Seite** nutzt `generatePageMetadata()` als Single Source of Truth – diese Funktion erzeugt title, description, canonical, OG, Twitter und robots konsistent

---

## 3. Einstellungen (CMS)

Im CMS unter **Verwaltung → Einstellungen** befindet sich eine intuitive, nach Bereichen gegliederte Seite:

### Bereiche

| Bereich | Felder |
|---------|--------|
| **Allgemein** | Schulname, Logo |
| **Kontakt & Adresse** | E-Mail, Telefon, Strasse, PLZ, Stadt, Land |
| **Suchmaschinen (SEO)** | Website-URL, Startseiten-Praefix, Titel-Trennzeichen, Titel-Suffix, Startseiten-Beschreibung, Standard-Beschreibung, Standard OG-Bild |
| **Social Media** | Instagram, Facebook, YouTube |
| **Erweitert** | Organisationsname (Schema.org), Info zu auto-generierten Dateien |

Alle Felder werden ueber die `site_settings`-Tabelle in der Datenbank gespeichert (Key-Value).

---

## 4. URL- und Canonical-Policy

- **Canonical**: Jede Seite hat `alternates.canonical` als **relativen Pfad** (z.B. `/aktuelles`)
- `metadataBase` im Root Layout sorgt dafuer, dass der Pfad zu einer absoluten URL aufgeloest wird
- **Kein Trailing Slash** – Next.js Standard
- **HTTPS** – erzwungen durch Vercel
- **Keine Duplikate**: Redirect-Seiten (`/unsere-schule`, `/schulleben`, `/unsere-schule/wer-was-wo`) leiten serverseitig weiter (302)
- **Query-Parameter**: Werden von Next.js nicht in Canonicals aufgenommen (korrekt)

---

## 5. Titel-System

Das Root Layout definiert:
```tsx
title: {
  default: "Start / Grabbe-Gymnasium",      // Startseite (konfigurierbar)
  template: "%s / Grabbe-Gymnasium",         // Alle Unterseiten
}
```

Der Startseiten-Titel wird aus `{homepageTitlePrefix}{titleSeparator}{titleSuffix}` zusammengesetzt. Der Praefix ("Start") ist in den Einstellungen aenderbar.

| Seite | Tab-Titel |
|-------|-----------|
| Startseite | Start / Grabbe-Gymnasium |
| Aktuelles | Aktuelles / Grabbe-Gymnasium |
| Beitrag X | Beitrag X / Grabbe-Gymnasium |
| Impressum | Impressum / Grabbe-Gymnasium |

Praefix, Trennzeichen und Suffix sind in den Einstellungen aenderbar.

---

## 6. Meta-Tags und Open Graph

**Alle Seiten** verwenden die zentrale `generatePageMetadata()` Funktion. Dadurch wird sichergestellt, dass jede Seite vollstaendige und konsistente Meta-Tags liefert:

```html
<title>Aktuelles / Grabbe-Gymnasium</title>
<meta name="description" content="..." />
<link rel="canonical" href="https://grabbe.site/aktuelles" />
<meta property="og:title" content="Aktuelles / Grabbe-Gymnasium" />
<meta property="og:description" content="..." />
<meta property="og:type" content="website" />
<meta property="og:locale" content="de_DE" />
<meta property="og:site_name" content="Grabbe-Gymnasium Detmold" />
<meta property="og:url" content="https://grabbe.site/aktuelles" />
<meta property="og:image" content="..." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Aktuelles / Grabbe-Gymnasium" />
<meta name="twitter:description" content="..." />
```

Bei Beitraegen zusaetzlich:
```html
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2026-01-15T10:00:00Z" />
<meta property="article:modified_time" content="2026-01-16T12:00:00Z" />
```

---

## 7. JSON-LD Structured Data

### Global (auf jeder Seite via Root Layout)

**EducationalOrganization** + **WebSite** – immer vorhanden.

```json
{ "@type": "EducationalOrganization", "name": "...", "url": "...", "logo": { "@type": "ImageObject", "url": "..." }, ... }
{ "@type": "WebSite", "name": "...", "url": "...", "inLanguage": "de-DE", ... }
```

### Unterseiten

- **BreadcrumbList** (auf Seiten mit Breadcrumbs)
- **WebPage** (statische Seiten)

### News-Detail (`/aktuelles/[slug]`)

- **NewsArticle** mit `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `articleSection`, `image`

### Validierung

Logo wird als `ImageObject` ausgegeben (nicht als String), was dem Schema.org-Standard entspricht.

---

## 8. Sitemap

`/sitemap.xml` wird dynamisch generiert und enthaelt:

- **Startseite** (priority 1.0, daily)
- **Alle statischen Seiten** (Aktuelles, Termine, Kontakt, etc.)
- **Alle veroeffentlichten Beitraege** (mit `lastModified` aus DB)
- **Alle veroeffentlichten eigenen Seiten** (mit korrekten Pfaden)

Die Base-URL wird ueber `resolveBaseUrl()` ermittelt (DB → Env → Fallback).

### Wichtig

- Nur veroeffentlichte Inhalte (published = true)
- `priority` und `changeFrequency` sind Hinweise, nicht bindend
- Sitemap-URL wird in `robots.txt` referenziert

---

## 9. robots.txt

`/robots.txt` wird statisch generiert:

**Produktion:**
```
User-agent: *
Allow: /
Disallow: /cms/
Disallow: /auth/
Disallow: /api/
Disallow: /protected/

Sitemap: https://grabbe.site/sitemap.xml
```

**Preview/Staging:**
```
User-agent: *
Disallow: /
```

→ robots.txt ist **nicht** ueber die Einstellungen konfigurierbar, um Fehlkonfiguration zu vermeiden.

---

## 10. Breadcrumbs

Visuelle Breadcrumbs + BreadcrumbList JSON-LD auf:
- `/aktuelles` (Start > Aktuelles)
- `/aktuelles/[slug]` (Start > Aktuelles > Titel)
- `/seiten/[slug]` (Start > Titel)
- `/unsere-schule/[slug]` (Start > Unsere Schule > Titel)
- `/schulleben/[slug]` (Start > Schulleben > Titel)

---

## 11. Environments / Preview-Schutz

| Umgebung | `VERCEL_ENV` | robots meta | robots.txt | Sitemap |
|----------|-------------|-------------|------------|---------|
| Production | `production` | index, follow | Allow / | Alle URLs |
| Preview | `preview` | noindex, nofollow | Disallow / | Alle URLs (aber irrelevant) |
| Development | `development` | noindex, nofollow | Disallow / | Alle URLs |
| Lokal | – (undefined) | index, follow | Allow / | Alle URLs |

---

## 12. SEO fuer Beitraege (News)

Beim Erstellen eines Beitrags wird automatisch verwendet:
- **Titel** → og:title, JSON-LD headline
- **Kurztext (excerpt)** → Meta-Beschreibung (Fallback)
- **Beitragsbild** → OG-Image (Fallback)
- **Autor** → JSON-LD author
- **Erstellungsdatum** → datePublished
- **Kategorie** → articleSection

Optional im Editor ueberschreibbar:
- **Meta-Beschreibung** (eigene SEO-Beschreibung)
- **SEO OG-Bild** (eigenes Social-Media-Bild)

---

## 13. SEO fuer eigene Seiten

Im Seiten-Editor optional:
- **Meta-Beschreibung**
- **SEO OG-Bild**

Falls leer, wird die Standard-Beschreibung aus den Einstellungen verwendet.

---

## 14. SEO QA Tool

**API-Route:** `GET /api/seo-check?url=/aktuelles`

Gibt zurueck:
- `checkedPath` – gepruefter Pfad
- `environment` – isPreview, siteUrl, vercelEnv
- `titlePolicy` – Template + Default-Titel
- `resolvedCanonical` – aufgeloeste kanonische URL
- `robotsHint` – ob index oder noindex
- `defaultOgImage` – Standard-OG-Bild
- `matchedContent` – ob Post oder Page gefunden wurde
- `jsonLdTypes` – erwartete JSON-LD Typen
- `tips` – Hinweise fuer Verbesserungen

---

## 15. Go-live Checklist

- [ ] `seo_site_url` in Einstellungen auf die Produktions-URL setzen (z.B. `https://grabbe.site`)
- [ ] Logo hochladen (Einstellungen > Allgemein)
- [ ] Standard OG-Bild hochladen (1200 x 630 px)
- [ ] Kontaktdaten pruefen (E-Mail, Telefon, Adresse)
- [ ] Social-Media Links eintragen
- [ ] In Google Search Console verifizieren
- [ ] Sitemap in Search Console einreichen: `/sitemap.xml`
- [ ] Mit URL-Inspektion pruefen: `/`, `/aktuelles`, ein Beitrag
- [ ] Rich Results Test fuer die Startseite ausfuehren
- [ ] OG-Debugger (Facebook / Twitter / LinkedIn) testen
- [ ] Preview-Deploy pruefen: `robots.txt` muss `Disallow: /` zeigen
- [ ] Alle wichtigen Seiten per `/api/seo-check?url=/pfad` pruefen

---

## 16. Content-Checklist fuer Redakteure

### Neuer Beitrag
- [ ] Aussagekraeftiger Titel (max. 60 Zeichen)
- [ ] Kurztext / Excerpt (wird als Meta-Beschreibung verwendet, 120–160 Zeichen)
- [ ] Beitragsbild hochladen (wird fuer Social Media verwendet)
- [ ] Kategorie waehlen
- [ ] Optional: Eigene Meta-Beschreibung im SEO-Bereich
- [ ] Slug pruefen (kurz, ohne Umlaute, keine Sonderzeichen)

### Neue Seite
- [ ] Seitentitel klar und beschreibend
- [ ] URL-Pfad (Slug) kurz und eindeutig
- [ ] Optional: Meta-Beschreibung im SEO-Bereich
- [ ] Seite veroeffentlichen (sonst nicht in Sitemap)

---

## 17. Verifikation (How to Verify)

### 1. Search Console
1. Eigentumsrecht verifizieren (DNS oder HTML-Tag)
2. Sitemap einreichen unter **Sitemaps** → `/sitemap.xml`
3. URL-Inspektion fuer wichtige Seiten

### 2. Rich Results Test
- https://search.google.com/test/rich-results
- Startseite pruefen (EducationalOrganization + WebSite)
- Einen Beitrag pruefen (NewsArticle)

### 3. Schema Validator
- https://validator.schema.org/
- JSON-LD aus dem Quelltext kopieren und validieren

### 4. OG Debugger
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

### 5. Lokale Pruefung
```bash
# Sitemap pruefen
curl https://grabbe.site/sitemap.xml

# robots.txt pruefen
curl https://grabbe.site/robots.txt

# SEO QA API
curl "https://grabbe.site/api/seo-check?url=/aktuelles"
```

---

## 18. Technische Referenz

### Dateien

| Datei | Funktion |
|-------|----------|
| `lib/seo.tsx` | Zentrale SEO-Bibliothek |
| `app/layout.tsx` | Root-Metadata + JSON-LD |
| `app/sitemap.ts` | Sitemap-Generierung |
| `app/robots.ts` | robots.txt-Generierung |
| `components/breadcrumbs.tsx` | Breadcrumb-Komponente |
| `components/cms/post-editor.tsx` | SEO-Felder im Beitrags-Editor |
| `components/cms/page-editor.tsx` | SEO-Felder im Seiten-Editor |
| `app/cms/settings/page.tsx` | Einstellungsseite (CMS) |
| `app/api/seo-check/route.ts` | SEO QA API |
| `middleware.ts` | Schliesst sitemap/robots von Rewrites aus |
| `scripts/migration_seo.sql` | Datenbank-Migration |

### resolveBaseUrl() Fallback-Kette

```
1. DB: seo_site_url
2. Env: NEXT_PUBLIC_SITE_URL
3. Env: VERCEL_PROJECT_PRODUCTION_URL (→ https://)
4. Env: VERCEL_URL (→ https://)
5. Fallback: http://localhost:3000
```

---

## 19. Datenbank-Migration

Die Migration `scripts/migration_seo.sql` fuegt hinzu:

### Neue Spalten (posts + pages)
- `meta_description TEXT`
- `seo_og_image TEXT`

### Neue Einstellungen (site_settings)
- `seo_site_url`, `seo_title_separator`, `seo_title_suffix`
- `seo_homepage_title_prefix`, `seo_homepage_description`
- `seo_default_description`, `seo_og_image`
- `seo_org_name`, `seo_org_logo`, `seo_org_email`, `seo_org_phone`
- `seo_org_address_street`, `seo_org_address_city`, `seo_org_address_zip`, `seo_org_address_country`
- `seo_social_instagram`, `seo_social_facebook`, `seo_social_youtube`

Migration ausfuehren:
```sql
-- In Supabase SQL-Konsole: Inhalt von scripts/migration_seo.sql einfuegen
```
