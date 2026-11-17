import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'
import { scholarshipCreateSchema } from '@/lib/validations/scholarship'
import { logAdminAudit } from '@/lib/audit'
import { getClientIp } from '@/lib/request-utils'

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

  if (error) {
    console.error('[Admin Scholarships GET] Database error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch scholarships' }, { status: 500 })
  }

  return NextResponse.json({ scholarships })
}

// POST create scholarship
export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = scholarshipCreateSchema.safeParse(body)
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
    .insert(validation.data)
    .select()
    .single()

  if (error) {
    console.error('[Admin Scholarships POST] Database insert error:', error.message)
    return NextResponse.json({ error: 'Failed to create scholarship' }, { status: 500 })
  }

  const clientIp = getClientIp(request)
  await logAdminAudit({
    adminUsername: admin.username,
    action: 'scholarship_create',
    targetType: 'scholarship',
    targetId: data.id,
    details: { title: data.title },
    ipAddress: clientIp,
  })

  return NextResponse.json({ scholarship: data }, { status: 201 })
}
