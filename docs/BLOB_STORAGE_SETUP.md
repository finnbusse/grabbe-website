# Dokument-Upload Reparatur - Vercel Blob Storage

## Das Problem

Der Dokument-Upload funktioniert nicht, weil **Vercel Blob Storage nicht konfiguriert ist**.

## Die Lösung - in 3 Schritten 🚀

### Schritt 1: Vercel Blob Store hinzufügen

1. **Öffnen Sie Ihr Vercel Dashboard**
   - Gehen Sie zu: https://vercel.com/dashboard
   - Wählen Sie Ihr Projekt

2. **Gehen Sie zu Storage**
   - Klicken Sie auf den Tab "Storage"
   - Oder: Settings → Storage

3. **Erstellen Sie einen Blob Store**
   - Klicken Sie "Create Database" oder "Add Store"
   - Wählen Sie "Blob Storage"
   - Klicken Sie "Continue"
   - Bestätigen Sie die Region (empfohlen: gleiche wie Ihr Projekt)
   - Klicken Sie "Create"

4. **Verbinden Sie mit Ihrem Projekt**
   - Vercel fragt: "Connect to project?"
   - Wählen Sie Ihr Projekt aus
   - Klicken Sie "Connect"

### Schritt 2: Umgebungsvariable prüfen

Nach dem Verbinden sollte automatisch die Variable `BLOB_READ_WRITE_TOKEN` hinzugefügt werden.

**Überprüfen**:
1. Gehen Sie zu Settings → Environment Variables
2. Suchen Sie nach `BLOB_READ_WRITE_TOKEN`
3. Sie sollten sehen: `BLOB_READ_WRITE_TOKEN = vercel_blob_rw_...`

**Falls NICHT vorhanden**:
- Die Variable wurde automatisch hinzugefügt, aber nur für neue Deployments
- Lösung: Neues Deployment triggern (siehe Schritt 3)

### Schritt 3: Neu deployen

1. **Trigger ein neues Deployment**:
   - Option A: Gehen Sie zu Deployments → Redeploy
   - Option B: Pushen Sie einen neuen Commit
   - Option C: In Settings → Environment Variables → Deployment auswählen

2. **Warten Sie auf Deployment** (~1-2 Minuten)

3. **Testen Sie den Upload**:
   - Gehen Sie zu `/cms/documents`
   - Versuchen Sie eine Datei hochzuladen
   - **ES FUNKTIONIERT!** ✅

## Was ist Vercel Blob Storage?

**Vercel Blob Storage** ist ein Service zum Speichern von Dateien:
- ✅ PDFs
- ✅ Bilder
- ✅ Dokumente
- ✅ Präsentationen
- ✅ Jede andere Datei

**Warum brauchen wir es?**
- Dateien können nicht direkt in der Datenbank gespeichert werden
- Vercel Blob bietet schnellen, skalierbaren File-Storage
- Automatische CDN-Verteilung für schnelle Downloads

## Kosten

**Vercel Blob Storage**:
- ✅ **Hobby Plan**: 1 GB kostenlos
- ✅ **Pro Plan**: 100 GB inklusive
- ➕ Zusätzlicher Speicher: ~$0.15/GB/Monat

Für eine Schulwebsite sollte 1 GB mehr als ausreichend sein!

## Fehlerbehebung

### Fehler: "BLOB_READ_WRITE_TOKEN fehlt"

**Lösung**:
- Blob Store noch nicht erstellt → Siehe Schritt 1
- Blob Store erstellt aber nicht deployed → Siehe Schritt 3

### Fehler: "Upload fehlgeschlagen"

**Mögliche Ursachen**:
1. **Token fehlt**: Blob Store nicht konfiguriert
2. **Datei zu groß**: Maximum 50MB pro Datei
3. **Keine Berechtigung**: Nicht im CMS eingeloggt

**Lösung**:
- Gehen Sie zu `/cms/diagnostic`
- Prüfen Sie den Status von "Blob Storage"
- Folgen Sie den Anweisungen

### Fehler: "Service Unavailable"

**Das bedeutet**:
- Blob Storage ist nicht verfügbar
- Token ist ungültig

**Lösung**:
1. Gehen Sie zu Vercel Dashboard → Storage
2. Prüfen Sie, ob Blob Store noch existiert
3. Falls gelöscht: Neu erstellen (Schritt 1)
4. Falls vorhanden: Disconnect und neu Connect

## Überprüfung

**Wie weiß ich, dass es funktioniert?**

### Option 1: Diagnostic Tool
1. Gehen Sie zu `/cms/diagnostic`
2. Suchen Sie nach "Blob Storage"
3. Status sollte "SUCCESS" sein ✅

### Option 2: Direkter Test
1. Gehen Sie zu `/cms/documents`
2. Klicken Sie "Datei auswählen"
3. Wählen Sie eine PDF oder Bild
4. Upload sollte erfolgreich sein
5. Datei erscheint in der Liste ✅

## Alternative: Ohne Blob Storage

Falls Sie Vercel Blob **nicht** verwenden möchten:

**Alternative 1: Supabase Storage**
- Nutzen Sie Supabase Storage statt Vercel Blob
- Erfordert Code-Änderungen
- Kontaktieren Sie Support

**Alternative 2: Externe URLs**
- Laden Sie Dateien woanders hoch (z.B. Google Drive, Dropbox)
- Kopieren Sie die öffentliche URL
- Fügen Sie manuell in die Datenbank ein
- Umständlich, aber funktioniert

**Empfehlung**: Vercel Blob ist die einfachste Lösung! ✅

## Zusammenfassung

1. ✅ Vercel Dashboard → Storage → Create Blob Store
2. ✅ Connect to Project
3. ✅ Redeploy
4. ✅ Testen in `/cms/documents`
5. ✅ **Funktioniert!** 🎉

## Automatische Bildoptimierung

Alle Bilder, die über den **Bilder-Picker** hochgeladen werden (per Datei-Upload oder URL-Import), durchlaufen vor dem Hochladen zum CDN eine automatische Optimierungspipeline:

### Was passiert beim Bild-Upload?

| Schritt | Beschreibung |
|---|---|
| **1. Format-Konvertierung** | Alle Rasterbilder (JPEG, PNG, GIF, etc.) werden in **WebP** konvertiert. SVGs bleiben unverändert. |
| **2. Metadaten entfernen** | Sämtliche EXIF-Daten (GPS-Standort, Kamera-Modell, Aufnahmezeit, etc.) werden entfernt. |
| **3. Komprimierung** | Die WebP-Qualität wird iterativ angepasst, bis die Datei unter **700 KB** liegt (Ziel: ~500 KB). Bilder mit mehr als 2048 px Seitenlänge werden proportional herunterskaliert. |
| **4. Copyright** | Eine XMP-Copyright-Information (`© Finbooster`) wird in die Datei eingebettet. |
| **5. Dateiname** | Der ursprüngliche Dateiname wird durch einen **zufälligen UUID** ersetzt (z.B. `a1b2c3d4-e5f6-7890-abcd-ef1234567890.webp`). |

### Warum?

- **Performance:** Kleinere Dateien = schnellere Ladezeiten = besseres Largest Contentful Paint (LCP)
- **Datenschutz:** Keine persönlichen Metadaten (Standort, Geräteinformationen) in öffentlichen Bildern
- **Konsistenz:** Einheitliches WebP-Format für alle Bilder
- **Urheberrecht:** Automatische Copyright-Kennzeichnung

### Technische Details

Die Bildverarbeitung findet **vollständig im Browser** statt (in `lib/image-processing.ts`). Es wird keine serverseitige Bibliothek benötigt. Die Verarbeitung nutzt die Canvas API für Konvertierung und Komprimierung.

---

## Support

Bei Problemen:
1. Screenshot von `/cms/diagnostic` machen
2. Screenshot von Vercel Dashboard → Storage
3. Screenshot vom Upload-Fehler
4. An Support senden

---

**Zeit benötigt**: ~5 Minuten
**Schwierigkeit**: Einfach
**Kosten**: Kostenlos (1 GB)

**JETZT EINRICHTEN UND DOKUMENTE HOCHLADEN!** 🚀
