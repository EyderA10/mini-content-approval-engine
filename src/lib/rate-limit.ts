/**
 * Simple in-memory rate limiter using a Map.
 * Note: This won't work across multiple instances but is sufficient for demo purposes.
 */

import { NextResponse } from 'next/server'
import { logger } from './logger'

type RateLimitEntry = {
  count: number
  resetAt: number
}

const stores: Map<string, RateLimitEntry> = new Map()

/** Maximum number of entries allowed in the rate limit store */
const MAX_STORES = 10000

/** Run deterministic cleanup every N requests */
const CLEANUP_INTERVAL = 100
let requestCounter = 0

/**
 * Deterministic cleanup: removes expired entries and enforces MAX_STORES cap.
 */
function cleanupStores(): void {
  const now = Date.now()

  // Remove expired entries
  for (const [key, value] of stores.entries()) {
    if (value.resetAt < now) {
      stores.delete(key)
    }
  }

  // Evict oldest entries if over capacity
  if (stores.size > MAX_STORES) {
    const excess = stores.size - MAX_STORES
    const keys = Array.from(stores.keys())
    // Delete the oldest entries (first inserted)
    for (let i = 0; i < excess && i < keys.length; i++) {
      stores.delete(keys[i])
    }
  }
}

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

  // Deterministic cleanup every N requests
  requestCounter++
  if (requestCounter % CLEANUP_INTERVAL === 0) {
    cleanupStores()
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
 * Checks common headers used by proxies and load balancers,
 * then falls back to request.ip, and finally a scoped UUID.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers

  // Check x-forwarded-for (comma-separated list; take the first)
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // Check x-real-ip
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Check Cloudflare connecting IP
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Next.js provides request.ip on NextRequest instances
  const nextIp = (request as { ip?: string }).ip
  if (nextIp) {
    return nextIp
  }

  // Last resort: generate a request-scoped UUID
  logger.warn(
    '[RateLimit] Unable to determine client IP, using request-scoped identifier'
  )
  return `anon-${crypto.randomUUID()}`
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

/**
 * Creates a 429 rate limit response with the given headers.
 * @param headers - Rate limit headers to include in the response
 * @returns A NextResponse with 429 status
 */
export function createRateLimitResponse(headers: Record<string, string>): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers }
  )
}

/**
 * Applies rate limit headers to an existing response.
 * @param response - The NextResponse to modify
 * @param headers - Headers to set on the response
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  headers: Record<string, string>
): void {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
}
