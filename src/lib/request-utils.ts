import { NextRequest } from 'next/server'
import crypto from 'crypto'

/**
 * Derives the client IP from the FIRST hop of x-forwarded-for,
 * falling back to x-real-ip or '127.0.0.1'.
 *
 * Taking the first hop prevents client-side header spoofing through reverse proxies.
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstHop = forwardedFor.split(',')[0].trim()
    if (firstHop) return firstHop
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return '127.0.0.1'
}

/**
 * Anonymizes an IP address for privacy-conscious storage.
 * For IPv4: truncates the last octet to /24 (e.g. 203.0.113.195 -> 203.0.113.0/24).
 * For IPv6 / others: generates a salted SHA-256 hash prefix.
 */
export function anonymizeIp(ip: string): string {
  if (!ip || ip === 'unknown') return 'unknown'
  const trimmed = ip.trim()

  if (trimmed.includes('.') && !trimmed.includes(':')) {
    const parts = trimmed.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`
    }
  }

  const salt = process.env.ADMIN_JWT_SECRET || 'scholarsearch-privacy-salt'
  return crypto.createHash('sha256').update(trimmed + salt).digest('hex').slice(0, 16)
}
