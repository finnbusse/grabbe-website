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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Josefin+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:'Geist','Segoe UI',Arial,Helvetica,sans-serif;color:#1a2332;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dfe5ec;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#2563b0;padding:22px 28px;">
              <p style="margin:0;font-family:'Instrument Serif',Georgia,serif;font-size:26px;line-height:1.1;font-weight:400;color:#f5f7fa;letter-spacing:0.01em;">
                Grabbe-Gymnasium Detmold
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background-color:#f8fafc;border-top:1px solid #dfe5ec;">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#667085;text-align:center;">
                Grabbe-Gymnasium Detmold · Küster-Meyer-Platz 2 · 32756 Detmold
              </p>
              <p style="margin:0;font-size:11px;line-height:1.6;color:#667085;text-align:center;">
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
