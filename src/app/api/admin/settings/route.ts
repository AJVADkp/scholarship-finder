import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'
import { logAdminAudit } from '@/lib/audit'
import { getClientIp } from '@/lib/request-utils'

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const clientIp = getClientIp(request)
  const supabase = createAdminClient()

  if (body.type === 'username') {
    const { username } = body
    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    const { error } = await supabase
      .from('admin_credentials')
      .update({ username: username.trim(), updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) {
      console.error('[Admin Settings] Database error updating username:', error.message)
      return NextResponse.json({ error: 'Failed to update admin settings' }, { status: 500 })
    }

    await logAdminAudit({
      adminUsername: admin.username,
      action: 'admin_username_update',
      details: { newUsername: username.trim() },
      ipAddress: clientIp,
    })

    return NextResponse.json({ success: true })
  }

  if (body.type === 'password') {
    const { current_password, new_password } = body

    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Verify current password
    const { data: creds, error: fetchErr } = await supabase
      .from('admin_credentials')
      .select('password_hash')
      .eq('id', 1)
      .maybeSingle()

    if (fetchErr || !creds) {
      console.error('[Admin Settings] Database error retrieving credentials:', fetchErr?.message)
      return NextResponse.json({ error: 'Failed to verify admin credentials' }, { status: 500 })
    }

    const valid = await bcrypt.compare(current_password, creds.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const newHash = await bcrypt.hash(new_password, 12)
    const { error: updateErr } = await supabase
      .from('admin_credentials')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (updateErr) {
      console.error('[Admin Settings] Database error updating password:', updateErr.message)
      return NextResponse.json({ error: 'Failed to update admin password' }, { status: 500 })
    }

    await logAdminAudit({
      adminUsername: admin.username,
      action: 'admin_password_update',
      ipAddress: clientIp,
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
}
