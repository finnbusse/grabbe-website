import { baseLayout, escapeHtml } from "./base"

interface EmailChangeOptions {
  confirmUrl: string
  newEmail: string
}

export function emailChangeConfirmationTemplate(options: EmailChangeOptions): { subject: string; html: string } {
  const safeUrl = escapeHtml(options.confirmUrl)
  const safeEmail = escapeHtml(options.newEmail)
  const content = `
    <h2 style="margin:0 0 10px;font-family:'Instrument Serif',Georgia,serif;font-size:30px;line-height:1.15;font-weight:400;color:#1a2332;">E-Mail-Adresse bestätigen</h2>
    <p style="margin:0 0 18px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.7;color:#364152;">
      Eine Änderung der E-Mail-Adresse für Ihr CMS-Konto am Grabbe-Gymnasium wurde angefordert. 
      Ihre neue E-Mail-Adresse soll <strong>${safeEmail}</strong> werden.
    </p>
    <p style="margin:0 0 18px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.7;color:#364152;">
      Klicken Sie auf den Button unten, um die Änderung zu bestätigen. Sie werden anschließend gebeten, Ihr Passwort einzugeben.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
      <tr>
        <td align="center">
          <a href="${safeUrl}" style="display:inline-block;background-color:#2563b0;color:#f5f7fa;text-decoration:none;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">
            E-Mail-Adresse bestätigen
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#667085;text-align:center;">
      Dieser Link ist 1 Stunde gültig.
    </p>
    <p style="margin:0;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#667085;">
      Falls Sie diese Änderung nicht angefordert haben, können Sie diese E-Mail ignorieren.<br />
      Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br />
      <a href="${safeUrl}" style="color:#2563b0;word-break:break-all;">${safeUrl}</a>
    </p>
  `

  return {
    subject: "E-Mail-Adresse bestätigen – Grabbe-Gymnasium CMS",
    html: baseLayout(content),
  }
}
