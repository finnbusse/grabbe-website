/**
 * /api/subjects — Read-only API for the canonical subjects list.
 *
 * GET → returns the full list of subjects from the app constants.
 * No database table needed — subjects are defined in code.
 */

import { NextResponse } from "next/server"
import { SUBJECTS } from "@/lib/constants/subjects"

export async function GET() {
  return NextResponse.json(SUBJECTS)
}
