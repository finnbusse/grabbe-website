# Deployment Guide

## E-Mail-Versand mit Resend

The CMS uses [Resend](https://resend.com) to send transactional emails (test emails, future password resets, teacher invitations).

### 1. Resend-Account erstellen

1. Go to [resend.com](https://resend.com) and create a free account.
2. Navigate to **API Keys** → **Create API Key**.
3. Give it a descriptive name (e.g. `grabbe-website-production`).
4. Copy the key — it starts with `re_`.

### 2. API-Key konfigurieren

Add the API key as an environment variable:

- **Vercel**: Go to Project Settings → Environment Variables → Add `RESEND_API_KEY`
- **Local development**: Add to `.env.local`:
  ```
  RESEND_API_KEY=re_your_api_key_here
  ```

> ⚠️ Never commit the API key to source control.

### 3. Sending-Domain verifizieren (`push.grabbe.site`)

Resend requires domain verification before you can send emails from `noreply@push.grabbe.site`.

1. In the Resend dashboard, go to **Domains** → **Add Domain**.
2. Enter `push.grabbe.site` and click **Add**.
3. Resend will display DNS records you need to add. Typically:

   **SPF Record (TXT)**
   ```
   Host: push.grabbe.site
   Type: TXT
   Value: v=spf1 include:amazonses.com ~all
   ```

   **DKIM Records (CNAME)**
   Resend provides multiple CNAME records for DKIM signing. Add all of them as shown in the dashboard.

4. Add the DNS records to your domain provider (e.g. Cloudflare, Vercel DNS).
5. Return to Resend and click **Verify** — DNS propagation may take a few minutes.

### 4. Konfiguration testen

1. Log in to the CMS as an administrator.
2. Go to **Einstellungen** → **E-Mail** tab.
3. Check that the configuration status shows:
   - `RESEND_API_KEY`: Konfiguriert ✓
   - Absenderdomain: `push.grabbe.site`
   - Absenderadresse: `noreply@push.grabbe.site`
4. Enter an email address and click **Test-E-Mail senden**.
5. Verify the test email arrives in the target inbox (check spam folder as well).

### Architecture

All email sending goes through `lib/email.ts` which provides a single `sendEmail()` function. Email templates are in `lib/email-templates/` and use a shared base layout (`base.ts`).

To add a new email type:
1. Create a new template in `lib/email-templates/your-template.ts`
2. Use the `baseLayout()` wrapper from `base.ts` for consistent styling
3. Call `sendEmail()` from your API route or server action
