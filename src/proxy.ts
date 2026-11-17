import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { jwtVerify } from 'jose'
import { getAdminJwtSecret, isTokenRevoked } from '@/lib/admin-auth'

/**
 * Next.js 16 Proxy convention for request interception and route guarding.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ============================================================
  // ADMIN ROUTES — Custom JWT cookie auth
  // ============================================================
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session')?.value

    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = getAdminJwtSecret()
      const { payload } = await jwtVerify(adminSession, secret)

      if (payload.jti && typeof payload.jti === 'string') {
        const revoked = await isTokenRevoked(payload.jti)
        if (revoked) {
          const response = NextResponse.redirect(new URL('/admin/login', request.url))
          response.cookies.delete('admin_session')
          return response
        }
      }

      return NextResponse.next()
    } catch {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_session')
      return response
    }
  }

  // ============================================================
  // USER DASHBOARD ROUTES — Supabase session auth
  // ============================================================
  if (pathname.startsWith('/dashboard')) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
  }

  return NextResponse.next()
}

// Next 16 backward compatibility export
export const middleware = proxy

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
