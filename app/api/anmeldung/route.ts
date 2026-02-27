import { createClient } from "@/lib/supabase/server"
import { getRequestIp, isRateLimited } from "@/lib/request-throttle"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { child_name, child_birthday, parent_name, parent_email, parent_phone, grundschule, anmeldung_type, wunschpartner, profilprojekt, message, website } = body

    if (website) {
      return NextResponse.json({ success: true })
    }

    const ip = getRequestIp(request.headers)
    if (isRateLimited(`anmeldung:${ip}`, 3, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Zu viele Anfragen. Bitte später erneut versuchen." }, { status: 429 })
    }

    if (!child_name || !parent_name || !parent_email) {
      return NextResponse.json({ error: "Name des Kindes, Name und E-Mail des Erziehungsberechtigten sind erforderlich." }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent_email)) {
      return NextResponse.json({ error: "Bitte geben Sie eine gueltige E-Mail-Adresse ein." }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("anmeldung_submissions").insert({
      child_name: child_name.trim(),
      child_birthday: child_birthday || null,
      parent_name: parent_name.trim(),
      parent_email: parent_email.trim(),
      parent_phone: parent_phone?.trim() || null,
      grundschule: grundschule?.trim() || null,
      anmeldung_type: anmeldung_type || "klasse5",
      wunschpartner: wunschpartner?.trim() || null,
      profilprojekt: profilprojekt?.trim() || null,
      message: message?.trim() || null,
    })

    if (error) {
      console.error("Anmeldung submission error:", error)
      return NextResponse.json({ error: "Fehler beim Speichern der Anmeldung." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Ungueltiger Request." }, { status: 400 })
  }
}
