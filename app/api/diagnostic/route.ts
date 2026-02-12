import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Diagnostic endpoint to check database setup and RLS policies
 * Access: /api/diagnostic
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
  }

  try {
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    results.checks.authentication = {
      status: user ? 'SUCCESS' : 'FAILED',
      user_id: user?.id || null,
      email: user?.email || null,
      error: authError?.message || null,
    }

    if (!user) {
      results.errors.push('Not authenticated - please log in to CMS first')
      return NextResponse.json(results, { status: 401 })
    }

    // 2. Check if tables exist by trying to query them
    const tables = ['posts', 'pages', 'events', 'documents', 'navigation_items', 'site_settings', 'contact_submissions', 'anmeldung_submissions']
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        results.checks[`table_${table}`] = {
          exists: !error,
          count: count || 0,
          error: error?.message || null,
        }

        if (error) {
          results.errors.push(`Table '${table}': ${error.message}`)
        }
      } catch (e: any) {
        results.checks[`table_${table}`] = {
          exists: false,
          error: e.message,
        }
        results.errors.push(`Table '${table}': ${e.message}`)
      }
    }

    // 3. Test INSERT permission on posts (most common issue)
    try {
      const testPost = {
        title: 'Test Post (will be deleted)',
        slug: 'test-diagnostic-' + Date.now(),
        content: 'This is a diagnostic test post',
        user_id: user.id,
        published: false,
      }

      const { data: insertData, error: insertError } = await supabase
        .from('posts')
        .insert(testPost)
        .select()
        .single()

      if (insertError) {
        results.checks.posts_insert = {
          status: 'FAILED',
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        }
        results.errors.push(`Cannot insert posts: ${insertError.message}`)
      } else {
        results.checks.posts_insert = {
          status: 'SUCCESS',
          id: insertData?.id,
        }

        // Clean up test post
        if (insertData?.id) {
          await supabase.from('posts').delete().eq('id', insertData.id)
        }
      }
    } catch (e: any) {
      results.checks.posts_insert = {
        status: 'EXCEPTION',
        error: e.message,
      }
      results.errors.push(`Posts insert exception: ${e.message}`)
    }

    // 4. Test INSERT permission on pages
    try {
      const testPage = {
        title: 'Test Page (will be deleted)',
        slug: 'test-diagnostic-' + Date.now(),
        content: 'This is a diagnostic test page',
        user_id: user.id,
        published: false,
      }

      const { data: insertData, error: insertError } = await supabase
        .from('pages')
        .insert(testPage)
        .select()
        .single()

      if (insertError) {
        results.checks.pages_insert = {
          status: 'FAILED',
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        }
        results.errors.push(`Cannot insert pages: ${insertError.message}`)
      } else {
        results.checks.pages_insert = {
          status: 'SUCCESS',
          id: insertData?.id,
        }

        // Clean up test page
        if (insertData?.id) {
          await supabase.from('pages').delete().eq('id', insertData.id)
        }
      }
    } catch (e: any) {
      results.checks.pages_insert = {
        status: 'EXCEPTION',
        error: e.message,
      }
      results.errors.push(`Pages insert exception: ${e.message}`)
    }

    // 5. Test INSERT permission on events
    try {
      const testEvent = {
        title: 'Test Event (will be deleted)',
        description: 'This is a diagnostic test event',
        event_date: new Date().toISOString().split('T')[0],
        user_id: user.id,
        published: false,
      }

      const { data: insertData, error: insertError } = await supabase
        .from('events')
        .insert(testEvent)
        .select()
        .single()

      if (insertError) {
        results.checks.events_insert = {
          status: 'FAILED',
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        }
        results.errors.push(`Cannot insert events: ${insertError.message}`)
      } else {
        results.checks.events_insert = {
          status: 'SUCCESS',
          id: insertData?.id,
        }

        // Clean up test event
        if (insertData?.id) {
          await supabase.from('events').delete().eq('id', insertData.id)
        }
      }
    } catch (e: any) {
      results.checks.events_insert = {
        status: 'EXCEPTION',
        error: e.message,
      }
      results.errors.push(`Events insert exception: ${e.message}`)
    }

    // 6. Check Vercel Blob Storage configuration
    results.checks.blob_storage = {
      configured: !!process.env.BLOB_READ_WRITE_TOKEN,
      status: process.env.BLOB_READ_WRITE_TOKEN ? 'SUCCESS' : 'WARNING',
      message: process.env.BLOB_READ_WRITE_TOKEN 
        ? 'Vercel Blob Storage ist konfiguriert'
        : 'Vercel Blob Storage nicht konfiguriert - Dokument-Upload wird nicht funktionieren',
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      results.errors.push('BLOB_READ_WRITE_TOKEN fehlt - Dokument-Upload funktioniert nicht. Bitte Vercel Blob Store in Vercel Dashboard hinzufügen.')
    }

    // Summary
    results.summary = {
      total_checks: Object.keys(results.checks).length,
      errors_count: results.errors.length,
      status: results.errors.length === 0 ? 'ALL_CHECKS_PASSED' : 'ISSUES_FOUND',
    }

    if (results.errors.length > 0) {
      const actions = []
      
      // Check if database issues
      if (results.errors.some(e => e.includes('Table') || e.includes('relation'))) {
        actions.push('Run the database schema: scripts/complete_schema.sql in Supabase SQL Editor')
      }
      
      // Check if blob storage issue
      if (results.errors.some(e => e.includes('BLOB'))) {
        actions.push('Configure Vercel Blob Storage: Vercel Dashboard → Storage → Add Blob Store')
      }
      
      results.recommended_action = actions.join(' | ')
    }

    return NextResponse.json(results, { 
      status: results.errors.length === 0 ? 200 : 500 
    })

  } catch (error: any) {
    results.checks.global_error = {
      status: 'EXCEPTION',
      error: error.message,
      stack: error.stack,
    }
    results.errors.push(`Global error: ${error.message}`)
    
    return NextResponse.json(results, { status: 500 })
  }
}
