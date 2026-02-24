import { list, put } from "@vercel/blob"
import { revalidatePath, revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeFilter = searchParams.get("type") // e.g. "image"
    const cursor = searchParams.get("cursor") || undefined
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 100) : 50
    const filenameFilter = searchParams.get("filename")
    const sizeFilter = searchParams.get("size")

    // Try documents table first (unified media library)
    const supabase = await createClient()

    // Deduplication check: if filename and size provided, return matching documents
    if (filenameFilter && sizeFilter) {
      const { data: dupes } = await supabase
        .from("documents")
        .select("id, title, file_url, file_name, file_size, file_type, created_at")
        .eq("file_name", filenameFilter)
        .eq("file_size", parseInt(sizeFilter, 10))
        .limit(1)
      const typedDupes = (dupes || []) as Array<{
        id: string; title: string; file_url: string; file_name: string
        file_size: number; file_type: string | null; created_at: string
      }>
      return NextResponse.json({
        duplicates: typedDupes.map((d) => ({
          id: d.id, url: d.file_url, title: d.title,
          filename: d.file_name, size: d.file_size,
        })),
      })
    }

    let query = supabase
      .from("documents")
      .select("id, title, file_url, file_name, file_size, file_type, created_at")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (typeFilter === "image") {
      query = query.like("file_type", "image/%")
    }

    const { data: docs, error: docsError } = await query

    if (!docsError && docs && docs.length > 0) {
      const typedDocs = docs as Array<{
        id: string
        title: string
        file_url: string
        file_name: string
        file_size: number
        file_type: string | null
        created_at: string
      }>
      return NextResponse.json({
        blobs: typedDocs.map((d) => ({
          id: d.id,
          url: d.file_url,
          pathname: d.file_name || d.title,
          size: d.file_size,
          uploadedAt: d.created_at,
        })),
        cursor: undefined,
        hasMore: false,
      })
    }

    // Fallback to Vercel Blob storage if documents table is empty or unavailable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ blobs: [] })
    }

    const result = await list({
      prefix: "schulwebsite/",
      limit,
      cursor,
    })

    // Filter to images only for the media library
    const imageBlobs = result.blobs.filter((blob) => {
      const ext = blob.pathname.split(".").pop()?.toLowerCase() || ""
      return SUPPORTED_IMAGE_EXTENSIONS.includes(ext)
    })

    return NextResponse.json({
      blobs: imageBlobs.map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
      })),
      cursor: result.cursor,
      hasMore: result.hasMore,
    })
  } catch (error: unknown) {
    console.error("Blob list error:", error)
    return NextResponse.json({ blobs: [], error: "Mediathek konnte nicht geladen werden" })
  }
}

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

    // Always create a document record for every uploaded file
    const docTitle = formData.get("title") as string
    const docCategory = formData.get("category") as string

    const { data: insertedDoc } = await supabase.from("documents").insert({
      title: docTitle || file.name,
      file_url: blob.url,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      category: docCategory || "allgemein",
      user_id: user.id,
    } as never).select("id").single()
    revalidateTag("documents", "max")

    const docId = (insertedDoc as unknown as { id: string } | null)?.id

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      documentId: docId || null,
    })
  } catch (error: unknown) {
    console.error("Upload error:", error)
    
    // Provide specific error messages
    let errorMessage = "Upload fehlgeschlagen"
    const errMsg = error instanceof Error ? error.message : ""
    if (errMsg.includes("BLOB_READ_WRITE_TOKEN")) {
      errorMessage = "Vercel Blob Storage Token fehlt oder ist ungültig"
    } else if (errMsg) {
      errorMessage = errMsg
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errMsg : undefined
    }, { status: 500 })
  }
}
