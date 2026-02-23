import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await request.json()
  const { name, color } = body

  if (!name || !color) {
    return NextResponse.json({ error: "Name und Farbe sind erforderlich" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({ name, color })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  revalidateTag("posts", "max")
  revalidateTag("events", "max")
  revalidateTag("documents", "max")
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, color } = body

  if (!id || !name || !color) {
    return NextResponse.json({ error: "ID, Name und Farbe sind erforderlich" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("tags")
    .update({ name, color })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  revalidateTag("posts", "max")
  revalidateTag("events", "max")
  revalidateTag("documents", "max")
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID erforderlich" }, { status: 400 })
  }

  const { error } = await supabase.from("tags").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  revalidateTag("posts", "max")
  revalidateTag("events", "max")
  revalidateTag("documents", "max")
  return NextResponse.json({ success: true })
}
