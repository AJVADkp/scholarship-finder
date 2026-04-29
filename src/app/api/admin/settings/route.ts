import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const supabase = createAdminClient()

  if (body.type === 'username') {
    const { username } = body
    if (!username) return NextResponse.json({ error: 'Username is required' }, { status: 400 })

    const { error } = await supabase
      .from('admin_credentials')
      .update({ username })
      .eq('id', 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (body.type === 'password') {
    const { current_password, new_password } = body

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
