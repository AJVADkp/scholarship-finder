import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { z } from 'zod'
import { getAdminJwtSecret } from '@/lib/admin-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-utils'
import { logAdminAudit } from '@/lib/audit'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(100),
  password: z.string().min(1, 'Password is required').max(200),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // Durable rate limit: 5 attempts per 15 minutes per IP
  const rateLimit = await checkRateLimit(`login:${ip}`, 5, 15 * 60)
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)),
        },
      }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid credentials format', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { username, password } = parsed.data

  let secret: Uint8Array
  try {
    secret = getAdminJwtSecret()
  } catch (err) {
    console.error('[Admin Login] Configuration error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Authentication service temporarily unavailable' }, { status: 500 })
  }

  const supabase = createAdminClient()
  const { data: creds, error } = await supabase
    .from('admin_credentials')
    .select('username, password_hash')
    .eq('id', 1)
    .maybeSingle()

  if (error || !creds) {
    console.error('[Admin Login] Database query error:', error?.message)
    return NextResponse.json({ error: 'Authentication service temporarily unavailable' }, { status: 500 })
  }

  // Constant-time comparison prevents username enumeration
  const passwordMatch = await bcrypt.compare(password, creds.password_hash)
  if (creds.username !== username || !passwordMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const jti = crypto.randomUUID()

  // Sign JWT with jti and 8h expiry
  const token = await new SignJWT({ role: 'admin', username })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)

  // Audit log login event
  await logAdminAudit({
    adminUsername: username,
    action: 'admin_login',
    details: { jti },
    ipAddress: ip,
  })

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60, // 8 hours
    path: '/',
  })

  return response
}
