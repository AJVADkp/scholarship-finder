import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '7d'

  const supabase = createAdminClient()

  let query = supabase
    .from('page_visits')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply time filter
  if (range !== 'all') {
    const now = new Date()
    let from: Date
    if (range === '24h') {
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    } else if (range === '7d') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    query = query.gte('created_at', from.toISOString())
  }

  // Limit to 5000 to avoid huge payloads
  query = query.limit(5000)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ visits: [], error: error.message }, { status: 500 })
  }

  return NextResponse.json({ visits: data })
}
