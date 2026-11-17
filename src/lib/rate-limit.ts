import { createAdminClient } from '@/lib/supabase/admin'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// In-memory fallback / cache to reduce DB load
const memoryFallback = new Map<string, { count: number; resetAt: number }>()

function checkMemoryRateLimit(key: string, maxRequests: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const entry = memoryFallback.get(key)

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowSeconds * 1000
    memoryFallback.set(key, { count: 1, resetAt })
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: resetAt }
  }

  if (entry.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, reset: entry.resetAt }
  }

  entry.count++
  return { success: true, limit: maxRequests, remaining: maxRequests - entry.count, reset: entry.resetAt }
}

/**
 * Checks rate limit against Upstash Redis (if configured) or Postgres table `rate_limit_counters`.
 * Falls back safely to in-memory windowing if database is unreachable.
 *
 * @param key Unique identifier (e.g. `login:203.0.113.1`, `track:203.0.113.0`, `contact:203.0.113.1`)
 * @param maxRequests Maximum allowed requests in window
 * @param windowSeconds Window length in seconds
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  // 1. If Upstash Redis is configured, use it
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit')
      const { Redis } = await import('@upstash/redis')

      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })

      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      })

      const res = await ratelimit.limit(key)
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      }
    } catch (err) {
      console.error('[RateLimit] Upstash Redis failed, falling back to Postgres:', err)
    }
  }

  // 2. Postgres durable rate limit
  try {
    const supabase = createAdminClient()
    const now = Date.now()
    const resetTime = new Date(now + windowSeconds * 1000).toISOString()

    const { data, error } = await supabase
      .from('rate_limit_counters')
      .select('count, reset_at')
      .eq('key', key)
      .maybeSingle()

    if (error) {
      console.error('[RateLimit] Postgres query failed, falling back to memory:', error.message)
      return checkMemoryRateLimit(key, maxRequests, windowSeconds)
    }

    if (!data || new Date(data.reset_at).getTime() < now) {
      await supabase
        .from('rate_limit_counters')
        .upsert({ key, count: 1, reset_at: resetTime })
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: now + windowSeconds * 1000,
      }
    }

    if (data.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: new Date(data.reset_at).getTime(),
      }
    }

    const nextCount = data.count + 1
    await supabase
      .from('rate_limit_counters')
      .update({ count: nextCount })
      .eq('key', key)

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - nextCount,
      reset: new Date(data.reset_at).getTime(),
    }
  } catch (err) {
    console.error('[RateLimit] Unexpected error in Postgres rate limit:', err)
    return checkMemoryRateLimit(key, maxRequests, windowSeconds)
  }
}
