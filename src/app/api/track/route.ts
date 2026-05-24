import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page, referrer, device, os, browser, screen_width, screen_height, user_name, user_id } = body

    // Extract IP and geo data from Vercel headers
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const country = request.headers.get('x-vercel-ip-country') || null
    const city = request.headers.get('x-vercel-ip-city') || null
    const region = request.headers.get('x-vercel-ip-region') || null

    const supabase = createAdminClient()

    const { error } = await supabase.from('page_visits').insert({
      page,
      referrer: referrer || null,
      ip_address: ip,
      country,
      city,
      region,
      device: device || null,
      os: os || null,
      browser: browser || null,
      screen_width: screen_width || null,
      screen_height: screen_height || null,
      user_agent: request.headers.get('user-agent') || null,
      user_name: user_name || null,
      user_id: user_id || null,
    })

    if (error) {
      console.error('[Track] Insert failed:', error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('[Track] Error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
