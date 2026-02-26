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
    : "Hallo!"

  // Derive inviter first name for body copy
  const inviterFirstName = options.inviterName.split(" ")[0] || options.inviterName

  const personalMessageBlock = options.personalMessage
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="border-left:3px solid #2563b0;padding:12px 16px;background-color:#f0f5ff;border-radius:0 6px 6px 0;">
            <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-style:italic;">Persönliche Nachricht von ${options.inviterName}:</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#1e3a5f;">&ldquo;${options.personalMessage}&rdquo;</p>
          </td>
        </tr>
      </table>`
    : ""

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e3a5f;">
      ${greeting}
    </h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
      ${inviterFirstName} lädt dich ein, an der offiziellen Website des Grabbe-Gymnasiums Detmold mitzuwirken &mdash; Inhalte zu gestalten, Neuigkeiten zu veröffentlichen und die Schulgemeinschaft digital zu bereichern.
    </p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#6b7280;">
      Deine Rolle: <span style="display:inline-block;background-color:#e0edff;color:#1e3a5f;padding:2px 10px;border-radius:12px;font-size:13px;font-weight:600;">${options.roleName}</span>
    </p>
    ${personalMessageBlock}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color:#1e3a5f;border-radius:8px;padding:14px 32px;">
                <a href="${options.onboardingUrl}" style="color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                  Konto einrichten &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;font-size:12px;line-height:1.5;color:#9ca3af;text-align:center;">
      Dieser Link ist 72 Stunden gültig und kann nur einmal verwendet werden.
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#9ca3af;">
      Diese Einladung wurde von ${options.inviterName} versendet.
    </p>
    <p style="margin:0;font-size:11px;line-height:1.5;color:#9ca3af;">
      Falls du keine Einladung erwartest, kannst du diese E-Mail ignorieren.
    </p>
  `

  return {
    subject: `Einladung: Werde Teil des Grabbe-Gymnasium CMS`,
    html: baseLayout(content),
  }
}
