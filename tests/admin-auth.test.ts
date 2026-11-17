import { describe, it, expect, afterEach } from 'vitest'
import { getAdminJwtSecret, MIN_ADMIN_JWT_SECRET_LENGTH } from '@/lib/admin-auth'

describe('admin-auth secret validation', () => {
  const originalSecret = process.env.ADMIN_JWT_SECRET

  afterEach(() => {
    process.env.ADMIN_JWT_SECRET = originalSecret
  })

  it('throws an informative error if ADMIN_JWT_SECRET is missing', () => {
    delete process.env.ADMIN_JWT_SECRET
    expect(() => getAdminJwtSecret()).toThrow(/ADMIN_JWT_SECRET environment variable is missing/)
  })

  it('throws an error if ADMIN_JWT_SECRET is shorter than 32 characters', () => {
    process.env.ADMIN_JWT_SECRET = 'short-secret-under-32-chars'
    expect(() => getAdminJwtSecret()).toThrow(
      new RegExp(`ADMIN_JWT_SECRET must be at least ${MIN_ADMIN_JWT_SECRET_LENGTH} characters long`)
    )
  })

  it('returns encoded Uint8Array if ADMIN_JWT_SECRET is at least 32 characters', () => {
    process.env.ADMIN_JWT_SECRET = 'a-very-long-production-grade-admin-secret-at-least-32-chars'
    const secret = getAdminJwtSecret()
    expect(secret).toBeInstanceOf(Uint8Array)
    expect(secret.length).toBeGreaterThanOrEqual(32)
  })
})
