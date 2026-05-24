import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

// Simple in-memory rate limiter: 5 attempts / IP / 15 min
const attempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }

  if (entry.count >= 5) return false

  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  let username: string, password: string
  try {
    const body = await request.json()
    username = body.username
    password = body.password
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: creds, error } = await supabase
    .from('admin_credentials')
    .select('username, password_hash')
    .eq('id', 1)
    .single()

  if (error || !creds) {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 })
  }

  // Always compare password to prevent timing-based username enumeration
  const passwordMatch = await bcrypt.compare(password, creds.password_hash)
  if (creds.username !== username || !passwordMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Clear rate limit on success
  attempts.delete(ip)

  // Sign JWT
  const jwtSecret = process.env.ADMIN_JWT_SECRET
  if (!jwtSecret) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const secret = new TextEncoder().encode(jwtSecret)
  const token = await new SignJWT({ role: 'admin', username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)

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
