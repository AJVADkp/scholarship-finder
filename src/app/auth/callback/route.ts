import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Auto-create user profile row on first sign-in
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        await supabase.from('users').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          email: user.email || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        })
      }

      return NextResponse.redirect(`${origin}/dashboard?welcome=1`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}
