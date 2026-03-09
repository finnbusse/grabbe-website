import { baseLayout, escapeHtml } from "./base"

interface PasswordResetEmailOptions {
  resetUrl: string
}

export function passwordResetEmailTemplate(options: PasswordResetEmailOptions): { subject: string; html: string } {
  const safeUrl = escapeHtml(options.resetUrl)
  const content = `
    <h2 style="margin:0 0 10px;font-family:'Instrument Serif',Georgia,serif;font-size:30px;line-height:1.15;font-weight:400;color:#1a2332;">Passwort zurücksetzen</h2>
    <p style="margin:0 0 18px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.7;color:#364152;">
      Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für das CMS des Grabbe-Gymnasiums erhalten.
      Klicken Sie auf den Button unten, um ein neues Passwort festzulegen.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
      <tr>
        <td align="center">
          <a href="${safeUrl}" style="display:inline-block;background-color:#2563b0;color:#f5f7fa;text-decoration:none;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">
            Neues Passwort festlegen
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#667085;text-align:center;">
      Dieser Link ist 1 Stunde gültig und kann nur einmal verwendet werden.
    </p>
    <p style="margin:0 0 12px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#667085;">
      Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.
    </p>
    <p style="margin:0;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#667085;">
      Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br />
      <a href="${safeUrl}" style="color:#2563b0;word-break:break-all;">${safeUrl}</a>
    </p>
  `

  return {
    subject: "Passwort zurücksetzen – Grabbe-Gymnasium CMS",
    html: baseLayout(content),
  }
}
