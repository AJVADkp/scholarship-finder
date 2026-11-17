import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'
import { scholarshipUpdateSchema } from '@/lib/validations/scholarship'
import { logAdminAudit } from '@/lib/audit'
import { getClientIp } from '@/lib/request-utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT update scholarship
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing scholarship ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = scholarshipUpdateSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('scholarships')
    .update(validation.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[Admin Scholarships PUT] Database update error:', error.message)
    return NextResponse.json({ error: 'Failed to update scholarship' }, { status: 500 })
  }

  const clientIp = getClientIp(request)
  await logAdminAudit({
    adminUsername: admin.username,
    action: 'scholarship_update',
    targetType: 'scholarship',
    targetId: id,
    details: validation.data as Record<string, unknown>,
    ipAddress: clientIp,
  })

  return NextResponse.json({ scholarship: data })
}

// DELETE scholarship
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing scholarship ID' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('scholarships').delete().eq('id', id)

  if (error) {
    console.error('[Admin Scholarships DELETE] Database error:', error.message)
    return NextResponse.json({ error: 'Failed to delete scholarship' }, { status: 500 })
  }

  const clientIp = getClientIp(request)
  await logAdminAudit({
    adminUsername: admin.username,
    action: 'scholarship_delete',
    targetType: 'scholarship',
    targetId: id,
    ipAddress: clientIp,
  })

  return NextResponse.json({ success: true })
}
