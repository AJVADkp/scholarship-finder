import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAdminAudit } from '@/lib/audit'
import { getClientIp } from '@/lib/request-utils'

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken()

  if (admin && admin.jti) {
    try {
      const supabase = createAdminClient()
      const expiry = admin.exp
        ? new Date(admin.exp * 1000).toISOString()
        : new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()

      await supabase.from('revoked_tokens').upsert({
        jti: admin.jti,
        revoked_at: new Date().toISOString(),
        expires_at: expiry,
      })

      const clientIp = getClientIp(request)
      await logAdminAudit({
        adminUsername: admin.username,
        action: 'admin_logout',
        details: { jti: admin.jti },
        ipAddress: clientIp,
      })
    } catch (err) {
      console.error('[Admin Logout] Error revoking session token:', err)
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return response
}
