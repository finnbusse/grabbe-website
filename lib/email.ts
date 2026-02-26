import { Resend } from "resend"

const FROM_ADDRESS = "noreply@push.grabbe.site"

let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
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
      replyTo: options.replyTo,
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
