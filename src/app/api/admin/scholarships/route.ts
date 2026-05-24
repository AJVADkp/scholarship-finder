import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'

// GET all scholarships
export async function GET() {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: scholarships, error } = await supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scholarships })
}

// POST create scholarship
export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Only allow known scholarship fields
  const allowedFields = [
    'name', 'description', 'provider', 'amount', 'currency', 'deadline',
    'eligibility', 'category', 'url', 'state', 'academic_level',
    'income_limit', 'gender', 'is_active'
  ]
  const sanitized: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) sanitized[key] = body[key]
  }

  if (!sanitized.name) {
    return NextResponse.json({ error: 'Scholarship name is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('scholarships')
    .insert(sanitized)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scholarship: data })
}
