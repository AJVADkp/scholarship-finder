import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'

interface Params { params: Promise<{ id: string }> }

// PUT update scholarship
export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

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

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('scholarships')
    .update(sanitized)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scholarship: data })
}

// DELETE scholarship
export async function DELETE(_: NextRequest, { params }: Params) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase.from('scholarships').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
