import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Keine Datei angegeben" }, { status: 400 })
    }

    const blob = await put(`schulwebsite/${file.name}`, file, {
      access: "public",
    })

    // Also save to documents table
    const docTitle = formData.get("title") as string
    const docCategory = formData.get("category") as string

    if (docTitle) {
      await supabase.from("documents").insert({
        title: docTitle || file.name,
        file_url: blob.url,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        category: docCategory || "allgemein",
        user_id: user.id,
      })
    }

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 })
  }
}
