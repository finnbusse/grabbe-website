import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Check if Blob storage is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { 
          error: "Vercel Blob Storage ist nicht konfiguriert. Bitte BLOB_READ_WRITE_TOKEN in Vercel Umgebungsvariablen hinzufügen.",
          hint: "Gehen Sie zu Vercel Dashboard → Projekt → Settings → Environment Variables → Storage → Add Vercel Blob Store"
        }, 
        { status: 503 }
      )
    }

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

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Datei zu groß. Maximum: ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400 })
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
  } catch (error: any) {
    console.error("Upload error:", error)
    
    // Provide specific error messages
    let errorMessage = "Upload fehlgeschlagen"
    if (error.message?.includes("BLOB_READ_WRITE_TOKEN")) {
      errorMessage = "Vercel Blob Storage Token fehlt oder ist ungültig"
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
