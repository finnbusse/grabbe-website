import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, E-Mail und Nachricht sind erforderlich." }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Bitte geben Sie eine gueltige E-Mail-Adresse ein." }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("contact_submissions").insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
    })

    if (error) {
      console.error("Contact submission error:", error)
      return NextResponse.json({ error: "Fehler beim Speichern der Nachricht." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Ungueltiger Request." }, { status: 400 })
  }
}
