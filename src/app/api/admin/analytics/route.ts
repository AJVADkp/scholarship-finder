import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  // Cap to 5000 to prevent payload exhaustion
  query = query.limit(5000)

  const { data, error } = await query

  if (error) {
    console.error('[Admin Analytics GET] Database query error:', error.message)
    return NextResponse.json({ visits: [], error: 'Failed to fetch analytics' }, { status: 500 })
  }

  return NextResponse.json({ visits: data })
}
