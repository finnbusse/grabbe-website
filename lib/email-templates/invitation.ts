import { baseLayout } from "./base"

interface InvitationEmailOptions {
  recipientEmail: string
  recipientFirstName: string | null
  inviterName: string
  roleName: string
  personalMessage: string | null
  onboardingUrl: string
}

export function invitationEmailTemplate(options: InvitationEmailOptions): { subject: string; html: string } {
  const greeting = options.recipientFirstName
    ? `Willkommen im Team, ${options.recipientFirstName}!`
    : "Willkommen im Team!"

  const inviterFirstName = options.inviterName.split(" ")[0] || options.inviterName

  const personalMessageBlock = options.personalMessage
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
        <tr>
          <td style="padding:14px 16px;border:1px solid #dfe5ec;background-color:#f8fafc;border-radius:10px;">
            <p style="margin:0 0 6px;font-family:'Josefin Sans','Trebuchet MS',Arial,sans-serif;font-size:12px;line-height:1.5;letter-spacing:0.03em;color:#667085;">Persönliche Nachricht von ${options.inviterName}:</p>
            <p style="margin:0;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a2332;">„${options.personalMessage}“</p>
          </td>
        </tr>
      </table>`
    : ""

  const content = `
    <h2 style="margin:0 0 10px;font-family:'Instrument Serif',Georgia,serif;font-size:34px;line-height:1.15;font-weight:400;color:#1a2332;">${greeting}</h2>
    <p style="margin:0 0 18px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.7;color:#364152;">
      ${inviterFirstName} lädt dich ein, im CMS des Grabbe-Gymnasiums Inhalte zu verwalten und die Schulwebsite mitzugestalten.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 18px;">
      <tr>
        <td style="padding:14px 16px;border:1px solid #dfe5ec;border-radius:10px;background-color:#ffffff;">
          <p style="margin:0 0 8px;font-family:'Josefin Sans','Trebuchet MS',Arial,sans-serif;font-size:12px;letter-spacing:0.04em;color:#667085;">Einladung für</p>
          <p style="margin:0 0 10px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:14px;color:#1a2332;font-weight:600;">${options.recipientEmail}</p>
          <p style="margin:0;font-family:'Josefin Sans','Trebuchet MS',Arial,sans-serif;font-size:13px;letter-spacing:0.03em;color:#2563b0;font-weight:600;display:inline-block;background-color:#edf4ff;padding:4px 10px;border-radius:999px;">Rolle: ${options.roleName}</p>
        </td>
      </tr>
    </table>
    ${personalMessageBlock}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
      <tr>
        <td align="center">
          <a href="${options.onboardingUrl}" style="display:inline-block;background-color:#2563b0;color:#f5f7fa;text-decoration:none;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">
            Konto einrichten
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#667085;text-align:center;">Der Link ist 72 Stunden gültig und kann nur einmal verwendet werden.</p>
    <p style="margin:0;font-family:'Geist','Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#667085;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br /><a href="${options.onboardingUrl}" style="color:#2563b0;word-break:break-all;">${options.onboardingUrl}</a></p>
  `

  return {
    subject: "Einladung: Zugang zum Grabbe-Gymnasium CMS",
    html: baseLayout(content),
  }
}
