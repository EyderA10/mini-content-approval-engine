import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Apply rate limiting for reads
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.READ)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    )
  }

  try {
    const { token } = await params
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('content_pieces')
      .select('*')
      .eq('share_token', token)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const response = NextResponse.json(data)
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  } catch (_error) {
    console.error('[API] Error fetching content:')
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}