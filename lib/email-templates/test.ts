import { baseLayout } from "./base"

export function testEmailTemplate(): { subject: string; html: string } {
  const now = new Date().toLocaleString("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  })

  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#18181b;">
      Test-E-Mail
    </h2>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">
      Dies ist eine Test-E-Mail vom Grabbe-Gymnasium CMS.
      Wenn Sie diese Nachricht lesen können, ist die E-Mail-Konfiguration korrekt eingerichtet.
    </p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">
      <strong>Gesendet am:</strong> ${now}
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46;">
      <strong>Absender:</strong> noreply@push.grabbe.site
    </p>
  `

  return {
    subject: "Test-E-Mail — Grabbe-Gymnasium CMS",
    html: baseLayout(content),
  }
}
