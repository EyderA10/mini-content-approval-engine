/**
 * Simple in-memory rate limiter using a Map.
 * Note: This won't work across multiple instances but is sufficient for demo purposes.
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

const stores: Map<string, RateLimitEntry> = new Map()

/**
 * Rate limit configuration.
 */
type RateLimitConfig = {
  /** Maximum number of requests allowed within the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

/**
 * Checks if a request from a given IP should be rate limited.
 * Returns the rate limit result with headers to set on the response.
 *
 * @param ip - The IP address to check
 * @param config - Rate limit configuration
 * @returns Object with allowed boolean and headers to set
 */
export function rateLimit(ip: string, config: RateLimitConfig): {
  allowed: boolean
  headers: Record<string, string>
} {
  const now = Date.now()
  const entry = stores.get(ip)

  // Clean up expired entries periodically (simple cleanup)
  if (Math.random() < 0.01) {
    for (const [key, value] of stores.entries()) {
      if (value.resetAt < now) {
        stores.delete(key)
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    // First request or window expired
    stores.set(ip, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': String(config.maxRequests),
        'X-RateLimit-Remaining': String(config.maxRequests - 1),
        'X-RateLimit-Reset': String(Math.ceil((now + config.windowMs) / 1000)),
      },
    }
  }

  // Increment count
  entry.count++

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const headers = {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
  }

  if (entry.count > config.maxRequests) {
    return { allowed: false, headers }
  }

  return { allowed: true, headers }
}

/**
 * Gets the client IP address from a NextRequest.
 * Checks common headers used by proxies and load balancers.
 */
export function getClientIp(request: Request): string {
  // Check various headers that might contain the real IP
  const headers = request.headers
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list; take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback
  return 'unknown'
}

/** Rate limit configs for different endpoints */
export const RATE_LIMITS = {
  /** Content creation - 10 requests per minute */
  CREATE: { maxRequests: 10, windowMs: 60 * 1000 },
  /** Content reads - 60 requests per minute */
  READ: { maxRequests: 60, windowMs: 60 * 1000 },
  /** Actions (approve/reject) - 30 requests per minute */
  ACTION: { maxRequests: 30, windowMs: 60 * 1000 },
}
