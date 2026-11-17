import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { trackEventSchema } from '@/lib/validations/track'
import { getClientIp, anonymizeIp } from '@/lib/request-utils'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rawIp = getClientIp(request)

    // Rate limit: 60 tracking hits per minute per IP
    const rateLimit = await checkRateLimit(`track:${rawIp}`, 60, 60)
    if (!rateLimit.success) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 })
    }

    const validation = trackEventSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ ok: false, error: 'Validation failed' }, { status: 400 })
    }

    const { page, referrer, device, os, browser, screen_width, screen_height } = validation.data
    const anonymizedIp = anonymizeIp(rawIp)

    // Resolve user identity strictly server-side from session cookies
    let authenticatedUserId: string | null = null
    let authenticatedUserName: string | null = null

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
              // Read-only context
            },
          },
        }
      )

      const {
        data: { user },
      } = await supabaseUser.auth.getUser()
      if (user) {
        authenticatedUserId = user.id
        const metaName =
          (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string)
        authenticatedUserName = metaName || user.email || 'Authenticated Student'
      }
    } catch (authErr) {
      // Non-fatal: unauthenticated visit
      console.warn('[Track] Session resolution warning:', authErr)
    }

    // Extract optional geo headers from Edge/Vercel platform if available
    const country = request.headers.get('x-vercel-ip-country') || null
    const city = request.headers.get('x-vercel-ip-city') || null
    const region = request.headers.get('x-vercel-ip-region') || null
    const userAgent = request.headers.get('user-agent')?.slice(0, 500) || null

    const supabase = createAdminClient()
    const { error } = await supabase.from('page_visits').insert({
      page,
      referrer: referrer || null,
      ip_address: anonymizedIp,
      country,
      city,
      region,
      device: device || null,
      os: os || null,
      browser: browser || null,
      screen_width: screen_width || null,
      screen_height: screen_height || null,
      user_agent: userAgent,
      user_name: authenticatedUserName,
      user_id: authenticatedUserId,
    })

    if (error) {
      console.error('[Track] Database insert error:', error.message)
      return NextResponse.json({ ok: false, error: 'Failed to record visit' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Track] Unexpected exception:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
