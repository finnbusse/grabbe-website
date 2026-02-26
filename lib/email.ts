import { Resend } from "resend"

const FROM_EMAIL = "noreply@push.grabbe.site"
const FROM_ADDRESS = `Grabbe-Gymnasium Detmold <${FROM_EMAIL}>`

let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

/**
 * Strip HTML tags and decode common HTML entities to produce a plain-text
 * fallback for email clients that don't render HTML.
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<hr[^>]*>/gi, "---\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&rarr;/g, "\u2192")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  headers?: Record<string, string>
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getResendClient()
  if (!resend) {
    console.error("[Email] RESEND_API_KEY is not configured")
    return { success: false, error: "RESEND_API_KEY ist nicht konfiguriert" }
  }

  const recipients = Array.isArray(options.to) ? options.to : [options.to]
  console.log(`[Email] Sending to ${recipients.join(", ")} — Subject: ${options.subject}`)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: htmlToPlainText(options.html),
      replyTo: options.replyTo,
      headers: {
        "List-Unsubscribe": `<mailto:${FROM_EMAIL}?subject=unsubscribe>`,
        ...options.headers,
      },
    })

    if (error) {
      console.error("[Email] Resend API error:", error.message)
      return { success: false, error: error.message }
    }

    console.log(`[Email] Sent successfully — ID: ${data?.id}`)
    return { success: true, messageId: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler beim E-Mail-Versand"
    console.error("[Email] Unexpected error:", message)
    return { success: false, error: message }
  }
}
