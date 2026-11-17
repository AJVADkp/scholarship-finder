import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { getClientIp, anonymizeIp } from '@/lib/request-utils'

describe('getClientIp', () => {
  it('extracts the first hop from a comma-separated x-forwarded-for header', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178' },
    })
    expect(getClientIp(req)).toBe('203.0.113.195')
  })

  it('handles single IP in x-forwarded-for with whitespace', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { 'x-forwarded-for': '  198.51.100.42  ' },
    })
    expect(getClientIp(req)).toBe('198.51.100.42')
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { 'x-real-ip': '192.0.2.1' },
    })
    expect(getClientIp(req)).toBe('192.0.2.1')
  })

  it('falls back to 127.0.0.1 when headers are missing', () => {
    const req = new NextRequest('http://localhost:3000')
    expect(getClientIp(req)).toBe('127.0.0.1')
  })
})

describe('anonymizeIp', () => {
  it('truncates standard IPv4 addresses to a /24 subnet mask', () => {
    expect(anonymizeIp('192.168.1.45')).toBe('192.168.1.0/24')
    expect(anonymizeIp('203.0.113.195')).toBe('203.0.113.0/24')
  })

  it('hashes IPv6 addresses or non-standard IPs with salt', () => {
    const hashed = anonymizeIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    expect(hashed).toHaveLength(16)
    expect(hashed).not.toContain('2001')
  })

  it('returns unknown for null or unknown strings', () => {
    expect(anonymizeIp('unknown')).toBe('unknown')
    expect(anonymizeIp('')).toBe('unknown')
  })
})
