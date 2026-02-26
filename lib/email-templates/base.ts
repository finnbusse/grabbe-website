/**
 * Base email layout wrapper.
 * Uses inline CSS only — email clients do not support external stylesheets.
 */
export function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Grabbe-Gymnasium Detmold</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e3a5f;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                Grabbe-Gymnasium Detmold
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f4f5;padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-align:center;">
                Grabbe-Gymnasium Detmold · Küster-Meyer-Platz 2 · 32756 Detmold
              </p>
              <p style="margin:0;font-size:11px;color:#a1a1aa;text-align:center;">
                Diese E-Mail wurde automatisch versendet. Bitte antworten Sie nicht auf diese Nachricht.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
