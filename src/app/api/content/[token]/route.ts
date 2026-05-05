import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS, createRateLimitResponse, applyRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { DBTable, DBColumn, DBErrorCode } from '@/lib/enums'
import { SELECT_CONTENT_ALL } from '@/lib/constants'

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
      .from(DBTable.ContentPieces)
      .select(SELECT_CONTENT_ALL)
      .eq(DBColumn.ShareToken, token)
      .single()

    if (error) {
      // PGRST116 = no rows found (404), anything else is a DB error (500)
      if (error.code === DBErrorCode.NoRowsFound) {
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