import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'
import { logAdminAudit } from '@/lib/audit'
import { getClientIp } from '@/lib/request-utils'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: NextRequest, { params }: Params) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone, avatar_url, dob, gender, academic_level, state, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[Admin Users GET ID] Database error:', error.message)
    return NextResponse.json({ error: 'Failed to retrieve user details' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user: data })
}

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Only allow valid user fields to be updated
  const allowedFields = [
    'full_name', 'email', 'phone', 'avatar_url', 'dob',
    'gender', 'academic_level', 'state'
  ]
  const sanitized: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) sanitized[key] = body[key]
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .update(sanitized)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[Admin Users PUT] Database error:', error.message)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }

  const clientIp = getClientIp(request)
  await logAdminAudit({
    adminUsername: admin.username,
    action: 'user_update',
    targetType: 'user',
    targetId: id,
    details: sanitized,
    ipAddress: clientIp,
  })

  return NextResponse.json({ user: data })
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('users').delete().eq('id', id)

  if (error) {
    console.error('[Admin Users DELETE] Database error:', error.message)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }

  const clientIp = getClientIp(request)
  await logAdminAudit({
    adminUsername: admin.username,
    action: 'user_delete',
    targetType: 'user',
    targetId: id,
    ipAddress: clientIp,
  })

  return NextResponse.json({ success: true })
}
