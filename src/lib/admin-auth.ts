import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

/**
 * Verifies the admin JWT token from the request cookies.
 * Call this at the top of every admin API route handler.
 * Returns the decoded payload on success, or null on failure.
 */
export async function verifyAdminToken(): Promise<{ role: string; username: string } | null> {
  const jwtSecret = process.env.ADMIN_JWT_SECRET
  if (!jwtSecret) {
    console.error('[Admin Auth] ADMIN_JWT_SECRET is not set')
    return null
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token) return null

  try {
    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as { role: string; username: string }
  } catch {
    return null
  }
}

/**
 * Helper to get the JWT secret, throwing a clear error if it's missing.
 * Used in middleware and login route where we need the raw secret.
 */
export function getAdminJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET environment variable is not set. Admin authentication is disabled.')
  }
  return new TextEncoder().encode(secret)
}
