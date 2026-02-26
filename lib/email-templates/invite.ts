import { baseLayout } from "./base"

interface InviteEmailOptions {
  recipientName: string
  inviteUrl: string
  invitedBy: string
}

export function inviteEmailTemplate(options: InviteEmailOptions): { subject: string; html: string } {
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#18181b;">
      Einladung zum Grabbe-Gymnasium CMS
    </h2>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">
      Hallo ${options.recipientName},
    </p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">
      Sie wurden von <strong>${options.invitedBy}</strong> eingeladen,
      das Content-Management-System des Grabbe-Gymnasiums zu nutzen.
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#3f3f46;">
      Klicken Sie auf den folgenden Link, um Ihre Einladung anzunehmen und Ihr Konto einzurichten:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#1e3a5f;border-radius:6px;padding:12px 24px;">
          <a href="${options.inviteUrl}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
            Einladung annehmen
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:12px;line-height:1.5;color:#71717a;">
      Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br />
      <a href="${options.inviteUrl}" style="color:#1e3a5f;word-break:break-all;">${options.inviteUrl}</a>
    </p>
  `

  return {
    subject: "Einladung zum Grabbe-Gymnasium CMS",
    html: baseLayout(content),
  }
}
