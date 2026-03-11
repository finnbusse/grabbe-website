# Social Media Integration (Buffer API)

## Übersicht

Die Social-Media-Integration ermöglicht es Administratoren, direkt aus dem CMS Social-Media-Posts über [Buffer](https://buffer.com) zu veröffentlichen. Buffer fungiert als Middleware, die Posts an verbundene soziale Netzwerke weiterleitet.

### Unterstützte Plattformen (über Buffer)

- **X (Twitter)**
- **Facebook**
- **Instagram**
- **LinkedIn**
- **Threads**
- **Pinterest**
- **Mastodon**
- **TikTok**
- **YouTube**
- **Bluesky**

---

## Architektur

```
┌─────────────────────┐
│  CMS Settings UI    │  ← Social Media Tab
│  (Next.js Client)   │
└──────────┬──────────┘
           │
    ┌──────▼──────────────┐
    │  API Routes          │
    │  /api/social-media/* │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │  lib/buffer.ts       │  ← Buffer API Client
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │  Buffer.com API      │  ← Externer Dienst
    │  (GraphQL API)       │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │  Soziale Netzwerke   │
    │  (X, FB, IG, etc.)   │
    └─────────────────────┘
```

---

## Einrichtung

### 1. Buffer-Account erstellen

1. Registriere dich auf [buffer.com](https://buffer.com)
2. Verbinde die gewünschten Social-Media-Kanäle im Buffer-Dashboard
3. Erstelle einen Access Token unter [publish.buffer.com/settings/api](https://publish.buffer.com/settings/api)

### 2. Access Token im CMS hinterlegen

1. Navigiere zu **CMS → Einstellungen → CMS-Einstellungen → Social Media**
2. Gib den Access Token ein und klicke auf **Speichern**
3. Der Token wird validiert und sicher in der Datenbank gespeichert

### 3. Posts erstellen

1. Im **Post-Playground** (Social Media Tab) die Zielkanäle auswählen
2. Post-Text eingeben (mit Hashtags, Links, Erwähnungen)
3. Optional: Bild-URL anhängen
4. Sofort veröffentlichen oder zeitgesteuert planen

---

## API-Referenz

### Buffer Access Token

#### `GET /api/social-media/key`

Gibt den Status des gespeicherten Buffer-Tokens zurück (maskiert).

**Berechtigung:** Nur Administratoren

**Response:**
```json
{
  "configured": true,
  "masked_key": "••••••••ab12"
}
```

#### `PUT /api/social-media/key`

Speichert oder aktualisiert den Buffer Access Token. Der Token wird **vor dem Speichern** gegen die Buffer GraphQL API validiert – ungültige Tokens werden abgelehnt.

**Berechtigung:** Nur Administratoren

**Request Body:**
```json
{
  "access_token": "1/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response (Erfolg):**
```json
{
  "success": true,
  "buffer_account": {
    "organization_name": "Grabbe-Gymnasium",
    "organization_count": 1
  }
}
```

**Response (Fehler – ungültiger Token):**
```json
{
  "error": "Token ungültig: Buffer GraphQL Fehler: ..."
}
```

#### `DELETE /api/social-media/key`

Entfernt den gespeicherten Buffer Access Token.

**Berechtigung:** Nur Administratoren

---

### Kanäle (Channels)

#### `GET /api/social-media/profiles`

Gibt alle mit Buffer verbundenen Social-Media-Kanäle zurück (über die GraphQL Organizations/Channels API).

**Berechtigung:** Nur Administratoren

**Response:**
```json
{
  "channels": [
    {
      "id": "abc123",
      "name": "grabbedetmold",
      "displayName": "Grabbe-Gymnasium",
      "service": "twitter",
      "avatar": "https://...",
      "isQueuePaused": false,
      "organizationId": "org456"
    }
  ]
}
```

---

### Posts veröffentlichen

#### `POST /api/social-media/publish`

Erstellt einen neuen Post über die Buffer REST API (`/1/updates/create.json`). Posts werden pro Kanal parallel erstellt.

**Berechtigung:** Nur Administratoren

**Request Body:**
```json
{
  "text": "Neuer Beitrag auf unserer Website! 🎓 #GrabbeGymnasium",
  "channel_ids": ["abc123", "def456"],
  "now": true,
  "image_url": "https://example.com/bild.jpg",
  "scheduled_at": "2025-03-15T10:00:00.000Z"
}
```

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `text` | string | ✓ | Der Post-Text |
| `channel_ids` | string[] | ✓ | IDs der Zielkanäle |
| `now` | boolean | - | Sofort veröffentlichen (Standard: `true`) |
| `image_url` | string | - | URL eines Bildes |
| `scheduled_at` | string | - | ISO-8601 Zeitstempel für geplante Veröffentlichung |

**Response:**
```json
{
  "success": true,
  "message": "2 Posts erfolgreich erstellt.",
  "results": [
    {
      "channelId": "abc123",
      "success": true,
      "postId": "post_xyz"
    }
  ]
}
```

---

## Datenspeicherung

Der Buffer Access Token wird in der `site_settings`-Tabelle gespeichert:

| Key | Kategorie | Typ |
|-----|-----------|-----|
| `buffer_access_token` | `social_media` | `secret` |

Der Token wird ausschließlich über die Admin-API-Routen gelesen und geschrieben. Nicht-Administratoren haben keinen Zugriff.

---

## Buffer API Client (`lib/buffer.ts`)

Die Client-Bibliothek bietet folgende Funktionen:

| Funktion | Beschreibung |
|----------|-------------|
| `validateBufferToken(token)` | Validiert einen Token gegen die Buffer GraphQL API |
| `getBufferChannels(token)` | Listet alle verbundenen Kanäle (Organizations → Channels) |
| `createBufferPost(token, params)` | Erstellt einen neuen Post (REST API) |
| `getServiceDisplayName(service)` | Gibt den Anzeigenamen eines Dienstes zurück |
| `maskToken(token)` | Maskiert einen Token für die Anzeige |

---

## Sicherheit

- **Nur Administratoren** können den API-Schlüssel verwalten und Posts erstellen
- Der Token wird serverseitig in der Datenbank gespeichert
- Alle API-Routen prüfen die Administratorrolle über Supabase Auth + User Roles
- Der Token wird in der UI nur maskiert angezeigt (letzte 4 Zeichen)
- Bei Token-Eingabe wird der Token vor dem Speichern validiert

---

## Zukünftige Erweiterungen

- [ ] Automatische Posts bei Veröffentlichung von CMS-Beiträgen
- [ ] Post-Templates für wiederkehrende Inhalte
- [ ] Post-Historie und Statistiken
- [ ] Multi-Bild-Upload
- [ ] Video-Upload-Unterstützung
- [ ] Redaktionskalender-Integration
- [ ] Automatische Hashtag-Vorschläge
- [ ] Post-Vorschau pro Plattform
