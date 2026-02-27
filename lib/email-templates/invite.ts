import { baseLayout } from "./base"

interface InviteEmailOptions {
  recipientName: string
  inviteUrl: string
  invitedBy: string
}

export function inviteEmailTemplate(options: InviteEmailOptions): { subject: string; html: string } {
  const content = `
    <h2 style="margin:0 0 12px;font-family:'Instrument Serif',Georgia,serif;font-size:32px;line-height:1.15;font-weight:400;color:#1a2332;">Einladung zum Grabbe-Gymnasium CMS</h2>
    <p style="margin:0 0 12px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:14px;line-height:1.7;color:#364152;">Hallo ${options.recipientName},</p>
    <p style="margin:0 0 20px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:14px;line-height:1.7;color:#364152;">${options.invitedBy} hat dich eingeladen, das CMS des Grabbe-Gymnasiums zu nutzen.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
      <tr>
        <td align="center">
          <a href="${options.inviteUrl}" style="display:inline-block;background-color:#2563b0;color:#f5f7fa;text-decoration:none;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">Einladung annehmen</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Josefin Sans','Trebuchet MS',Arial,sans-serif;font-size:12px;line-height:1.6;letter-spacing:0.01em;color:#667085;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br /><a href="${options.inviteUrl}" style="color:#2563b0;word-break:break-all;">${options.inviteUrl}</a></p>
  `

  return {
    subject: "Einladung zum Grabbe-Gymnasium CMS",
    html: baseLayout(content),
  }
}
