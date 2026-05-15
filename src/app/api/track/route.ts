import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page, referrer, device, os, browser, screen_width, screen_height, user_name } = body

    // Extract IP and geo data from Vercel headers
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const country = request.headers.get('x-vercel-ip-country') || null
    const city = request.headers.get('x-vercel-ip-city') || null
    const region = request.headers.get('x-vercel-ip-region') || null

    const supabase = createAdminClient()

    await supabase.from('page_visits').insert({
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
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
