# SOFORTIGE REPARATUR - CMS Dashboard kann nicht speichern

## Das Problem
Die Anwendung benötigt spezifische Umgebungsvariablen mit `NEXT_PUBLIC_` Präfix für den Browser-Zugriff (CMS Dashboard).

## Die Ursache
Ihre Vercel Umgebungsvariablen verwenden möglicherweise andere Namen oder fehlen das erforderliche `NEXT_PUBLIC_` Präfix.

## Die Lösung ✅

Die Anwendung wurde gerade aktualisiert und unterstützt jetzt **BEIDE** Namenskonventionen automatisch!

### Was Sie JETZT tun müssen:

1. **Gehen Sie zu Vercel Dashboard**
   - Öffnen Sie Ihr Projekt
   - Klicken Sie auf "Settings" → "Environment Variables"

2. **Überprüfen Sie diese Variablen**
   
   **WICHTIG**: Für das CMS Dashboard (Browser) MÜSSEN die Variablen mit `NEXT_PUBLIC_` beginnen!

   **Option A** (Standard - empfohlen):
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://ihr-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = ihr-anon-key
   ```

   **Option B** (Vercel Integration):
   Wenn Sie Vercels Supabase Integration verwenden, brauchen Sie BEIDE:
   ```
   SUPABASE_URL = https://ihr-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_URL = https://ihr-projekt.supabase.co
   
   SUPABASE_PUBLISHABLE_KEY = ihr-anon-key
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ihr-anon-key
   ```
   
   **Das ist der Schlüssel**: Die `NEXT_PUBLIC_*` Variablen sind für den Browser (CMS Dashboard) erforderlich!

3. **Wo finden Sie die richtigen Werte?**
   - Gehen Sie zu https://app.supabase.com
   - Wählen Sie Ihr Projekt
   - Gehen Sie zu "Settings" → "API"
   - Kopieren Sie:
     - "Project URL" → als SUPABASE_URL
     - "anon public" Key → als SUPABASE_PUBLISHABLE_KEY

4. **Wichtig: Umgebungen aktivieren**
   
   Stellen Sie sicher, dass die Variablen für ALLE Umgebungen aktiviert sind:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

5. **Neu deployen**
   - Gehen Sie zu "Deployments" Tab in Vercel
   - Klicken Sie auf das letzte Deployment
   - Klicken Sie auf "Redeploy"
   - Warten Sie, bis das Deployment abgeschlossen ist

6. **Testen**
   - Öffnen Sie Ihre Website
   - Gehen Sie zum CMS Dashboard
   - Versuchen Sie, einen neuen Beitrag zu speichern
   - Es sollte jetzt funktionieren! ✅

## Wichtige Hinweise

### ⚠️ Was Sie NICHT verwenden sollten:
- `SUPABASE_SECRET_KEY` oder `SUPABASE_SERVICE_ROLE_KEY` → Nur für Server, NICHT für den Browser!
- `SUPABASE_JWT_SECRET` → Normalerweise nicht erforderlich

### ✅ Was Sie verwenden sollten:
- Die "anon public" Key von Supabase (sicher für Browser)
- Die "Project URL" von Supabase

## Noch Probleme?

### Fehler im Browser überprüfen:
1. Drücken Sie F12 in Ihrem Browser
2. Gehen Sie zum "Console" Tab
3. Versuchen Sie, etwas im CMS zu speichern
4. Schauen Sie nach Fehlermeldungen

### Häufige Fehler:

**"Missing Supabase environment variables"**
- Lösung: Umgebungsvariablen sind nicht gesetzt → Schritt 2-5 wiederholen

**"Invalid API key"**
- Lösung: Falscher Key → Stellen Sie sicher, Sie verwenden den "anon public" Key, NICHT den "service_role" Key

**"Not authenticated"**
- Lösung: Sie sind nicht eingeloggt → Loggen Sie sich im CMS ein

### Vercel Deployment Logs überprüfen:
1. Gehen Sie zu Vercel → Deployments
2. Klicken Sie auf das letzte Deployment
3. Schauen Sie nach Fehlern in den Logs
4. Suchen Sie nach "Supabase" oder "environment"

## Detaillierte Hilfe

Wenn es immer noch nicht funktioniert, lesen Sie:
- [CMS Troubleshooting Guide](CMS_TROUBLESHOOTING.md) (Englisch, aber sehr detailliert)
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment Anleitung

## Zusammenfassung der Änderungen

Die Anwendung wurde aktualisiert und unterstützt jetzt automatisch:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` UND `SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` UND `SUPABASE_PUBLISHABLE_KEY`
- ✅ Bessere Fehlermeldungen
- ✅ Automatische Fallback-Logik

**Sie müssen NUR Ihre Umgebungsvariablen in Vercel überprüfen und neu deployen!**

## Support

Falls Sie weitere Hilfe benötigen:
1. Exportieren Sie die Browser Console Fehler (F12 → Console → Screenshot)
2. Exportieren Sie die Vercel Deployment Logs
3. Überprüfen Sie die Supabase API Logs im Supabase Dashboard
