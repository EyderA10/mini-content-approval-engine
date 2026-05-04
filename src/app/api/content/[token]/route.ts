import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS, createRateLimitResponse, applyRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Apply rate limiting for reads
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.READ)

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.headers)
  }

  try {
    const { token } = await params
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('content_pieces')
      .select('id, title, video_url, status, created_at, share_token, client_name, client_email, client_feedback')
      .eq('share_token', token)
      .single()

    if (error) {
      // PGRST116 = no rows found (404), anything else is a DB error (500)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 })
      }
      logger.error('[API] Error fetching content by token:', error)
      return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }

    const response = NextResponse.json(data)
    applyRateLimitHeaders(response, rateLimitResult.headers)
    return response
  } catch (error) {
    logger.error('[API] Error fetching content:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}