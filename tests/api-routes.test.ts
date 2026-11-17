import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as healthHandler } from '@/app/api/health/route'
import { GET as adminScholarshipsGet, POST as adminScholarshipsPost } from '@/app/api/admin/scholarships/route'
import { PUT as adminScholarshipPut, DELETE as adminScholarshipDelete } from '@/app/api/admin/scholarships/[id]/route'
import { POST as adminLogoutPost } from '@/app/api/admin/logout/route'
import { GET as adminUsersGet } from '@/app/api/admin/users/route'
import { GET as adminAnalyticsGet } from '@/app/api/admin/analytics/route'
import { POST as contactPost } from '@/app/api/contact/route'
import { POST as trackPost } from '@/app/api/track/route'

// Mock Supabase admin client and auth helpers
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'scholarships') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [{ id: '1', title: 'Test' }], error: null })),
            limit: vi.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null })),
          })),
          insert: vi.fn((payload) => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { id: 'new-id', ...payload }, error: null })),
            })),
          })),
          update: vi.fn((payload) => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: { id: 'upd-id', ...payload }, error: null })),
              })),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        }
      }
      if (table === 'contact_messages' || table === 'page_visits' || table === 'admin_audit_log') {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
        }
      }
      return {
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null })),
      }
    }),
  })),
}))

// Mock admin auth
const mockVerifyAdminToken = vi.fn()
vi.mock('@/lib/admin-auth', () => ({
  verifyAdminToken: () => mockVerifyAdminToken(),
  getAdminJwtSecret: () => new TextEncoder().encode('dummy-test-secret-at-least-32-bytes-long!'),
  isTokenRevoked: vi.fn(() => Promise.resolve(false)),
}))

// Mock rate limiting to always pass in test suite
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 })),
}))

describe('/api/health route handler', () => {
  it('returns healthy status with system telemetry', async () => {
    const res = await healthHandler()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('healthy')
    expect(json.version).toBe('1.0.0')
    expect(json.services.database.status).toBe('healthy')
  })
})

describe('/api/admin/scholarships route handler', () => {
  beforeEach(() => {
    mockVerifyAdminToken.mockReset()
  })

  it('rejects unauthenticated GET requests with 401', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce(null)
    const res = await adminScholarshipsGet()
    expect(res.status).toBe(401)
  })

  it('allows authenticated GET requests with 200', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce({ username: 'admin', role: 'admin' })
    const res = await adminScholarshipsGet()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.scholarships).toBeDefined()
  })

  it('rejects POST with invalid body format (400)', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce({ username: 'admin', role: 'admin' })
    const req = new NextRequest('http://localhost:3000/api/admin/scholarships', {
      method: 'POST',
      body: JSON.stringify({ amount: 50000 }), // missing title
    })
    const res = await adminScholarshipsPost(req)
    expect(res.status).toBe(400)
  })

  it('successfully creates a scholarship with 201 when valid', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce({ username: 'admin', role: 'admin' })
    const req = new NextRequest('http://localhost:3000/api/admin/scholarships', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Fellowship 2026',
        category: 'Merit',
        amount: 80000,
        academic_levels: ['Undergraduate'],
      }),
    })
    const res = await adminScholarshipsPost(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.scholarship.title).toBe('New Fellowship 2026')
  })
})

describe('/api/admin/scholarships/[id] route handler', () => {
  beforeEach(() => {
    mockVerifyAdminToken.mockReset()
  })

  it('rejects unauthenticated PUT with 401', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce(null)
    const req = new NextRequest('http://localhost:3000/api/admin/scholarships/123', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated' }),
    })
    const res = await adminScholarshipPut(req, { params: Promise.resolve({ id: '123' }) })
    expect(res.status).toBe(401)
  })

  it('updates scholarship when authenticated', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce({ username: 'admin', role: 'admin' })
    const req = new NextRequest('http://localhost:3000/api/admin/scholarships/123', {
      method: 'PUT',
      body: JSON.stringify({ amount: 95000 }),
    })
    const res = await adminScholarshipPut(req, { params: Promise.resolve({ id: '123' }) })
    expect(res.status).toBe(200)
  })

  it('deletes scholarship when authenticated', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce({ username: 'admin', role: 'admin' })
    const req = new NextRequest('http://localhost:3000/api/admin/scholarships/123', { method: 'DELETE' })
    const res = await adminScholarshipDelete(req, { params: Promise.resolve({ id: '123' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})

describe('/api/admin/logout route handler', () => {
  it('clears session cookie on logout', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce({ username: 'admin', jti: 'test-jti', exp: Date.now() / 1000 + 3600 })
    const req = new NextRequest('http://localhost:3000/api/admin/logout', { method: 'POST' })
    const res = await adminLogoutPost(req)
    expect(res.status).toBe(200)
  })
})

describe('/api/admin protected routes', () => {
  it('rejects unauthenticated users and analytics queries', async () => {
    mockVerifyAdminToken.mockResolvedValueOnce(null)
    const usersRes = await adminUsersGet()
    expect(usersRes.status).toBe(401)

    mockVerifyAdminToken.mockResolvedValueOnce(null)
    const analyticsReq = new NextRequest('http://localhost:3000/api/admin/analytics')
    const analyticsRes = await adminAnalyticsGet(analyticsReq)
    expect(analyticsRes.status).toBe(401)
  })
})

describe('/api/contact route handler', () => {
  it('validates required fields and email formats', async () => {
    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: 'bad-email', message: 'hi' }),
    })
    const res = await contactPost(req)
    expect(res.status).toBe(400)
  })

  it('accepts valid contact submission', async () => {
    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'I have a question about NSP eligibility criteria.',
      }),
    })
    const res = await contactPost(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('silently ignores automated submissions triggering honeypot field', async () => {
    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Spam Bot',
        email: 'bot@spam.com',
        message: 'Buy cheap watches online now!',
        website_url: 'http://spam-link.com',
      }),
    })
    const res = await contactPost(req)
    expect(res.status).toBe(200)
  })
})

describe('/api/track route handler', () => {
  it('validates tracking payloads', async () => {
    const req = new NextRequest('http://localhost:3000/api/track', {
      method: 'POST',
      body: JSON.stringify({ page: '' }),
    })
    const res = await trackPost(req)
    expect(res.status).toBe(400)
  })

  it('records page visits with valid page path', async () => {
    const req = new NextRequest('http://localhost:3000/api/track', {
      method: 'POST',
      body: JSON.stringify({ page: '/scholarships', device: 'Desktop', os: 'Windows' }),
    })
    const res = await trackPost(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })
})
