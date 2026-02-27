# Codebase Audit – Grabbe Concept Website (2026-02-27)

## Scope
- Full repository static review focused on security, authorization, reliability, maintainability, and operational risk.
- Quick runtime checks with local project scripts.

## Priority Issues (ready for GitHub/Linear)

### 1) [Critical] Unzureichende Autorisierung im User-Management API
**Problem**
- `GET/POST/DELETE /api/users` prüfen nur, ob ein User eingeloggt ist.
- Es fehlt eine Rollen-/Permission-Prüfung (z. B. Admin-only), obwohl Admin-Funktionen aufgerufen werden (`auth.admin.listUsers`, `auth.admin.createUser`, `auth.admin.deleteUser`).

**Risiko**
- Jeder authentifizierte CMS-User kann Benutzer auflisten, erstellen und löschen.
- Vollständige Account-Kompromittierung des CMS-Bestands möglich.

**Empfehlung**
- Harte Rollenprüfung (mind. `administrator`) vor allen drei Methoden.
- Audit-Logging für User-Erstellung/Löschung.

**Evidence**
- `app/api/users/route.ts`

---

### 2) [Critical] Settings-Write-Endpoints erlauben jedem eingeloggten User Service-Role-Änderungen
**Problem**
- `PUT/POST /api/settings` prüfen nur Authentifizierung, nicht Berechtigung.
- Änderungen laufen über `createAdminClient()` (Service Role).

**Risiko**
- Jeder eingeloggte User kann globale Website- und CMS-Settings überschreiben.

**Empfehlung**
- Nur Admin/Schulleitung zulassen.
- Zusätzlich erlaubte Key-Whitelist (serverseitig) einführen.

**Evidence**
- `app/api/settings/route.ts`

---

### 3) [High] Mehrere CMS-Mutations-APIs ohne Rollenprüfung (nur Login)
**Problem**
- Endpunkte wie `navigation`, `tags`, `page-content` erlauben Schreibzugriffe für jeden authentifizierten Nutzer.

**Risiko**
- Berechtigungsmodell wird ausgehebelt; Content-Manipulation durch Low-Privilege-User.

**Empfehlung**
- Einheitliches RBAC-Guard-Middleware/Helper für alle Mutations-Endpoints.

**Evidence**
- `app/api/navigation/route.ts`
- `app/api/tags/route.ts`
- `app/api/page-content/route.ts`

---

### 4) [High] Informationsleck bei User-Page-Permissions
**Problem**
- `GET /api/user-page-permissions` erlaubt jedem eingeloggten User die Abfrage beliebiger `userId`-Berechtigungen.

**Risiko**
- Internes Rechteschema kann von Nicht-Admins ausgelesen werden (Reconnaissance).

**Empfehlung**
- Nur Admin/Schulleitung erlauben oder auf `user.id === userId` begrenzen.

**Evidence**
- `app/api/user-page-permissions/route.ts`

---

### 5) [High] Revalidate-Path-Allowlist ist effektiv wirkungslos
**Problem**
- `ALLOWED_PATH_PREFIXES` enthält `"/"`; damit akzeptiert `startsWith("/")` nahezu jeden absoluten Pfad.

**Risiko**
- Unbeabsichtigte Revalidierung beliebiger Routen durch eingeloggte User; Cache-/Last-Risiko.

**Empfehlung**
- Root-Sonderfall separat behandeln (`path === "/"`), ansonsten nur explizite Prefixe ohne `"/"`.

**Evidence**
- `app/api/revalidate/route.ts`

---

### 6) [High] Invitation-Onboarding ohne Transaktion/Atomizität
**Problem**
- `POST /api/onboarding` erstellt User, Profil, Rolle und markiert Einladung in separaten Calls.
- Fehler in Zwischenschritten führen zu Inkonsistenz (z. B. User erstellt, Einladung nicht als akzeptiert markiert).

**Risiko**
- Dateninkonsistenz, schwer recoverbare Teilzustände.

**Empfehlung**
- Serverseitige RPC/Transaktion (SQL function) für atomaren Ablauf + idempotente Fehlerbehandlung.

**Evidence**
- `app/api/onboarding/route.ts`

---

### 7) [Medium] Rate Limiting wird komplett deaktiviert, wenn Salt fehlt
**Problem**
- Ohne `IP_HASH_SALT` liefert Rate Limiter `allowed: true` und protokolliert nichts.

**Risiko**
- Bruteforce-Schutz fällt unbemerkt aus (Fail-open).

**Empfehlung**
- Fail-closed für Login-Route (503 + klare Ops-Fehlermeldung) oder mindestens Startup-Healthcheck, der Deploy blockiert.

**Evidence**
- `lib/rate-limiter.ts`

---

### 8) [Medium] Öffentliche Form-Endpoints ohne Spam-/Abuse-Schutz
**Problem**
- `POST /api/contact` und `POST /api/anmeldung` haben keine Rate-Limits, CAPTCHA/Honeypot oder IP-Throttling.

**Risiko**
- Spam-Flut, Storage-Kosten, Operative Belastung.

**Empfehlung**
- Rate-Limit + Honeypot + optional Turnstile/Recaptcha.

**Evidence**
- `app/api/contact/route.ts`
- `app/api/anmeldung/route.ts`

---

### 9) [Medium] Upload akzeptiert riskante Dateitypen und nutzt öffentliche Blob-URLs
**Problem**
- Upload prüft primär Größe, aber keine serverseitige MIME-/Extension-Allowlist für gefährliche Typen.
- `access: "public"` für alle Uploads.

**Risiko**
- Potenzielle Verteilung schädlicher Dateien oder SVG-basiertes Content-Risiko.

**Empfehlung**
- Strikte Allowlist (z. B. PDF/JPG/PNG/WebP), MIME-Sniffing, optional Malware-Scan-Queue.

**Evidence**
- `app/api/upload/route.ts`

---

### 10) [Medium] Build/Lint-Tooling inkonsistent (Qualitäts-Gates brechen)
**Problem**
- `npm run lint` schlägt fehl (`next lint` mit Next 16 nicht mehr kompatibel wie konfiguriert).
- Build hängt von externen Google-Fonts ab; fehlende Erreichbarkeit bricht den Build.

**Risiko**
- CI/CD-Instabilität, fehlende zuverlässige Qualitätsprüfung.

**Empfehlung**
- Lint auf ESLint CLI migrieren.
- Fonts self-hosten oder Build-freundliche Fallback-Strategie.

**Evidence**
- `package.json`
- `app/layout.tsx`

---

### 11) [Low] Doppelte Hook-Dateien (Wartungsrisiko)
**Problem**
- `hooks/use-mobile.tsx` und `components/ui/use-mobile.tsx` sind dupliziert.
- `hooks/use-toast.ts` und `components/ui/use-toast.ts` ebenfalls.

**Risiko**
- Divergenz bei zukünftigen Änderungen, schwerere Wartung.

**Empfehlung**
- Eine Quelle pro Hook, zweite Datei als Re-export oder entfernen.

**Evidence**
- `hooks/use-mobile.tsx`
- `components/ui/use-mobile.tsx`
- `hooks/use-toast.ts`
- `components/ui/use-toast.ts`

---

### 12) [Low] Legacy-Migrations mit überlappender Funktionalität erhöhen Fehlkonfigurationen
**Problem**
- `001_create_cms_tables.sql` und `002_create_cms_tables.sql` überlappen/abweichen; README weist zwar auf `complete_schema.sql` hin, aber Legacy-Dateien bleiben direkt ausführbar.

**Risiko**
- Falsche Migration im Betrieb → inkonsistente RLS/Tabellenstruktur.

**Empfehlung**
- Legacy-Skripte archivieren/deaktivieren oder mit klarer Warnung versehen (`DO NOT APPLY`).

**Evidence**
- `scripts/001_create_cms_tables.sql`
- `scripts/002_create_cms_tables.sql`
- `scripts/README.md`

## Zusätzlich beobachtete Punkte
- `middleware.ts` nutzt deprecated Middleware-Konvention (Next.js weist auf `proxy` hin).
- Nutzung von `process.env.SUPABASE_SERVICE_ROLE_KEY` als Fallback-HMAC-Secret koppelt Einladungs-Token-Sicherheit an ein Hochrisiko-Secret.
