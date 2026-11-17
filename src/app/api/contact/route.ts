import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { contactMessageSchema } from '@/lib/validations/contact'
import { getClientIp } from '@/lib/request-utils'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)

    // Rate limit: 5 contact messages per 5 minutes per IP
    const rateLimit = await checkRateLimit(`contact:${ip}`, 5, 5 * 60)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait a few minutes before trying again.' },
        { status: 429 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 })
    }

    const validation = contactMessageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, email, message, website_url } = validation.data

    // Bot detection via honeypot field: silently swallow automated spam
    if (website_url && website_url.trim().length > 0) {
      console.warn(`[Contact API] Honeypot triggered from IP ${ip}`)
      return NextResponse.json({ success: true })
    }

    // Associate with authenticated session if present
    let authenticatedUserId: string | null = null
    try {
      const supabaseUser = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll() {
              // Read-only
            },
          },
        }
      )
      const { data: { user } } = await supabaseUser.auth.getUser()
      if (user) {
        authenticatedUserId = user.id
      }
    } catch {
      // Unauthenticated submission is permissible
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('contact_messages').insert({
      user_id: authenticatedUserId,
      name,
      email,
      message,
    })

    if (error) {
      console.error('[Contact API] Database insert error:', error.message)
      return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Contact API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
