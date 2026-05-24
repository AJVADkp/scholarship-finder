import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

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

  const supabase = createAdminClient()

  if (body.type === 'username') {
    const { username } = body
    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    const { error } = await supabase
      .from('admin_credentials')
      .update({ username: username.trim() })
      .eq('id', 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (body.type === 'password') {
    const { current_password, new_password } = body

    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }

    if (new_password.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    // Verify current password
    const { data: creds } = await supabase
      .from('admin_credentials')
      .select('password_hash')
      .eq('id', 1)
      .single()

    if (!creds) return NextResponse.json({ error: 'Credentials not found' }, { status: 404 })

    const valid = await bcrypt.compare(current_password, creds.password_hash)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })

    const newHash = await bcrypt.hash(new_password, 12)
    const { error } = await supabase
      .from('admin_credentials')
      .update({ password_hash: newHash })
      .eq('id', 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
