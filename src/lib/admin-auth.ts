import { jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export const MIN_ADMIN_JWT_SECRET_LENGTH = 32

export interface AdminSessionPayload extends JWTPayload {
  role: string
  username: string
  jti?: string
}

/**
 * Helper to get the JWT secret, throwing a fast and clear error if it's missing or insecure (< 32 chars).
 * Single source of truth used across admin authentication, proxy/middleware, login, and token verification.
 */
export function getAdminJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    throw new Error(
      'ADMIN_JWT_SECRET environment variable is missing. Admin authentication cannot start.'
    )
  }
  if (secret.length < MIN_ADMIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `ADMIN_JWT_SECRET must be at least ${MIN_ADMIN_JWT_SECRET_LENGTH} characters long (got ${secret.length}).`
    )
  }
  return new TextEncoder().encode(secret)
}

/**
 * Checks whether an admin JWT `jti` has been added to the revocation list upon logout.
 */
export async function isTokenRevoked(jti?: string): Promise<boolean> {
  if (!jti) return false
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('revoked_tokens')
      .select('jti')
      .eq('jti', jti)
      .maybeSingle()

    if (error) {
      console.error('[Admin Auth] Error checking token revocation:', error.message)
      return false
    }

    return Boolean(data)
  } catch (err) {
    console.error('[Admin Auth] Unexpected error checking revocation:', err)
    return false
  }
}

/**
 * Verifies the admin JWT token from the request cookies.
 * Returns the decoded payload on success, or null on failure/revocation.
 */
export async function verifyAdminToken(): Promise<AdminSessionPayload | null> {
  let secret: Uint8Array
  try {
    secret = getAdminJwtSecret()
  } catch (err) {
    console.error(
      '[Admin Auth] Token verification rejected:',
      err instanceof Error ? err.message : err
    )
    return null
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    const adminPayload = payload as unknown as AdminSessionPayload

    if (adminPayload.jti) {
      const revoked = await isTokenRevoked(adminPayload.jti)
      if (revoked) return null
    }

    return adminPayload
  } catch {
    return null
  }
}
