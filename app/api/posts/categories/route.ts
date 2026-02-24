import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("posts")
      .select("category")

    if (error) {
      return NextResponse.json({ categories: [] })
    }

    const typedData = data as Array<{ category: string | null }>
    const categories = [
      ...new Set(
        typedData
          .map((p) => p.category)
          .filter((c): c is string => Boolean(c)),
      ),
    ].sort()

    return NextResponse.json({ categories })
  } catch {
    return NextResponse.json({ categories: [] })
  }
}
