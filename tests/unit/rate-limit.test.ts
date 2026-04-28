import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    // Clear the internal store between tests
    vi.resetModules()
  })

  it('should allow requests within the limit', () => {
    const ip = '192.168.1.1'
    const config = { maxRequests: 5, windowMs: 60000 }

    const result = rateLimit(ip, config)

    expect(result.allowed).toBe(true)
    expect(result.headers['X-RateLimit-Limit']).toBe('5')
    expect(result.headers['X-RateLimit-Remaining']).toBe('4')
  })

  it('should set correct rate limit headers on first request', () => {
    const ip = '192.168.1.2'
    const config = { maxRequests: 10, windowMs: 60000 }

    const result = rateLimit(ip, config)

    expect(result.headers['X-RateLimit-Limit']).toBe('10')
    expect(result.headers['X-RateLimit-Remaining']).toBe('9')
    expect(result.headers['X-RateLimit-Reset']).toBeDefined()
    expect(Number(result.headers['X-RateLimit-Reset'])).toBeGreaterThan(0)
  })

  it('should decrement remaining count on subsequent requests', () => {
    const ip = '192.168.1.3'
    const config = { maxRequests: 5, windowMs: 60000 }

    const result1 = rateLimit(ip, config)
    expect(result1.headers['X-RateLimit-Remaining']).toBe('4')

    const result2 = rateLimit(ip, config)
    expect(result2.headers['X-RateLimit-Remaining']).toBe('3')

    const result3 = rateLimit(ip, config)
    expect(result3.headers['X-RateLimit-Remaining']).toBe('2')
  })

  it('should block requests after exceeding limit', () => {
    const ip = '192.168.1.4'
    const config = { maxRequests: 3, windowMs: 60000 }

    // Make 3 requests (all should be allowed)
    rateLimit(ip, config)
    rateLimit(ip, config)
    rateLimit(ip, config)

    // 4th request should be blocked
    const result = rateLimit(ip, config)
    expect(result.allowed).toBe(false)
    expect(result.headers['X-RateLimit-Remaining']).toBe('0')
  })

  it('should reset after window expires', () => {
    const ip = '192.168.1.5'
    const config = { maxRequests: 2, windowMs: 100 } // 100ms window

    // Use up the limit
    rateLimit(ip, config)
    rateLimit(ip, config)
    const blocked = rateLimit(ip, config)
    expect(blocked.allowed).toBe(false)

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = rateLimit(ip, config)
        expect(result.allowed).toBe(true)
        resolve()
      }, 150)
    })
  })

  it('should track different IPs separately', () => {
    const config = { maxRequests: 2, windowMs: 60000 }

    // IP1 uses up its limit
    rateLimit('10.0.0.1', config)
    rateLimit('10.0.0.1', config)
    const blocked = rateLimit('10.0.0.1', config)
    expect(blocked.allowed).toBe(false)

    // IP2 should still be allowed
    const allowed = rateLimit('10.0.0.2', config)
    expect(allowed.allowed).toBe(true)
  })

  it('should handle edge case of exactly at the limit', () => {
    const ip = '192.168.1.6'
    const config = { maxRequests: 3, windowMs: 60000 }

    // Make exactly 3 requests
    const r1 = rateLimit(ip, config)
    const r2 = rateLimit(ip, config)
    const r3 = rateLimit(ip, config)

    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
    expect(r3.allowed).toBe(true)

    // 4th should be blocked
    const r4 = rateLimit(ip, config)
    expect(r4.allowed).toBe(false)
  })

  it('should set remaining to 0 when at limit', () => {
    const ip = '192.168.1.7'
    const config = { maxRequests: 2, windowMs: 60000 }

    rateLimit(ip, config)
    rateLimit(ip, config)

    const result = rateLimit(ip, config)
    expect(result.allowed).toBe(false)
    expect(result.headers['X-RateLimit-Remaining']).toBe('0')
  })
})

describe('getClientIp', () => {
  it('should return x-forwarded-for header value', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '203.0.113.50, 70.41.3.18',
      },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('203.0.113.50')
  })

  it('should return first IP from x-forwarded-for with multiple IPs', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '203.0.113.50, 70.41.3.18, 150.172.238.178',
      },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('203.0.113.50')
  })

  it('should return x-real-ip header when x-forwarded-for is not present', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-real-ip': '203.0.113.50',
      },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('203.0.113.50')
  })

  it('should return cf-connecting-ip header when others not present', () => {
    const request = new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '203.0.113.50',
      },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('203.0.113.50')
  })

  it('should prioritize x-forwarded-for over x-real-ip', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '203.0.113.50',
        'x-real-ip': '192.168.1.1',
      },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('203.0.113.50')
  })

  it('should return "unknown" when no headers are present', () => {
    const request = new Request('http://localhost')

    const ip = getClientIp(request)
    expect(ip).toBe('unknown')
  })

  it('should handle empty x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '',
      },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('unknown')
  })
})

describe('RATE_LIMITS', () => {
  it('should have correct CREATE config', () => {
    expect(RATE_LIMITS.CREATE.maxRequests).toBe(10)
    expect(RATE_LIMITS.CREATE.windowMs).toBe(60 * 1000)
  })

  it('should have correct READ config', () => {
    expect(RATE_LIMITS.READ.maxRequests).toBe(60)
    expect(RATE_LIMITS.READ.windowMs).toBe(60 * 1000)
  })

  it('should have correct ACTION config', () => {
    expect(RATE_LIMITS.ACTION.maxRequests).toBe(30)
    expect(RATE_LIMITS.ACTION.windowMs).toBe(60 * 1000)
  })
})
