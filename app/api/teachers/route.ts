/**
 * /api/teachers — CRUD API for the teachers table.
 *
 * GET    → list all teachers (with subject_ids)
 * POST   → create a new teacher
 * PUT    → update an existing teacher
 * DELETE → delete a teacher (by ?id=…)
 */

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// GET — list all teachers
// ---------------------------------------------------------------------------

export async function GET() {
  const supabase = await createClient()

  // Fetch teachers
  const { data: teachers, error } = await supabase
    .from("teachers")
    .select("*")
    .order("last_name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch all teacher_subjects in one query
  const teacherIds = (teachers || []).map((t: { id: string }) => t.id)
  let subjectMap: Record<string, string[]> = {}

  if (teacherIds.length > 0) {
    const { data: subjects } = await supabase
      .from("teacher_subjects")
      .select("teacher_id, subject_id")
      .in("teacher_id", teacherIds)

    if (subjects) {
      subjectMap = {}
      for (const row of subjects as Array<{ teacher_id: string; subject_id: string }>) {
        if (!subjectMap[row.teacher_id]) subjectMap[row.teacher_id] = []
        subjectMap[row.teacher_id].push(row.subject_id)
      }
    }
  }

  // Merge subject_ids into teacher objects
  const result = (teachers || []).map((t: { id: string }) => ({
    ...t,
    subject_ids: subjectMap[t.id] || [],
  }))

  return NextResponse.json(result)
}

// ---------------------------------------------------------------------------
// POST — create teacher
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await request.json()
  const { gender, first_name, last_name, email, abbreviation, image_url, user_id, is_active, subject_ids } = body

  if (!first_name || !last_name || !abbreviation) {
    return NextResponse.json(
      { error: "Vorname, Nachname und Kürzel sind erforderlich" },
      { status: 400 }
    )
  }

  // Insert teacher
  const { data, error } = await supabase
    .from("teachers")
    .insert({
      gender: gender || "",
      first_name,
      last_name,
      email: email || null,
      abbreviation: abbreviation.toLowerCase().trim(),
      image_url: image_url || null,
      user_id: user_id || null,
      is_active: is_active !== false,
    })
    .select()
    .single()

  if (error) {
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Das Kürzel ist bereits vergeben" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert subjects
  if (Array.isArray(subject_ids) && subject_ids.length > 0) {
    await supabase.from("teacher_subjects").insert(
      subject_ids.map((subject_id: string) => ({
        teacher_id: data.id,
        subject_id,
      }))
    )
  }

  revalidateTag("teachers")
  return NextResponse.json({ ...data, subject_ids: subject_ids || [] })
}

// ---------------------------------------------------------------------------
// PUT — update teacher
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await request.json()
  const { id, gender, first_name, last_name, email, abbreviation, image_url, user_id, is_active, subject_ids } = body

  if (!id) {
    return NextResponse.json({ error: "ID ist erforderlich" }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {}
  if (gender !== undefined) updatePayload.gender = gender
  if (first_name !== undefined) updatePayload.first_name = first_name
  if (last_name !== undefined) updatePayload.last_name = last_name
  if (email !== undefined) updatePayload.email = email || null
  if (abbreviation !== undefined) updatePayload.abbreviation = abbreviation.toLowerCase().trim()
  if (image_url !== undefined) updatePayload.image_url = image_url || null
  if (user_id !== undefined) updatePayload.user_id = user_id || null
  if (is_active !== undefined) updatePayload.is_active = is_active

  const { data, error } = await supabase
    .from("teachers")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Das Kürzel ist bereits vergeben" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update subjects if provided
  if (Array.isArray(subject_ids)) {
    await supabase.from("teacher_subjects").delete().eq("teacher_id", id)
    if (subject_ids.length > 0) {
      await supabase.from("teacher_subjects").insert(
        subject_ids.map((subject_id: string) => ({
          teacher_id: id,
          subject_id,
        }))
      )
    }
  }

  revalidateTag("teachers")
  return NextResponse.json({ ...data, subject_ids: subject_ids || [] })
}

// ---------------------------------------------------------------------------
// DELETE — delete teacher
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID erforderlich" }, { status: 400 })
  }

  const { error } = await supabase.from("teachers").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateTag("teachers")
  return NextResponse.json({ success: true })
}
