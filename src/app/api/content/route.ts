import { createAdminClient } from '@/lib/supabase-admin'
import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { createContentSchema } from '@/lib/validators'
import { rateLimit, getClientIp, RATE_LIMITS, createRateLimitResponse, applyRateLimitHeaders } from '@/lib/rate-limit'
import { parsePaginationParams } from '@/lib/pagination'
import { logger } from '@/lib/logger'
import { DBTable, DBColumn } from '@/lib/enums'
import { SELECT_CONTENT_ALL } from '@/lib/constants'

export async function GET(request: NextRequest) {
  // Apply rate limiting for reads
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.READ)

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.headers)
  }

  try {
    // Use anon-key server client for read-only queries (respects RLS)
    const supabase = createServerClient()

    const { page, limit, offset } = parsePaginationParams(new URL(request.url))

    const { data, error, count } = await supabase
      .from(DBTable.ContentPieces)
      .select(
        SELECT_CONTENT_ALL,
        { count: 'exact' }
      )
      .order(DBColumn.CreatedAt, { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('[API] Error fetching content:', error)
      return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }

    const total = count ?? 0
    const response = NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        hasMore: total > offset + limit,
      },
    })
    applyRateLimitHeaders(response, rateLimitResult.headers)
    return response
  } catch (error) {
    logger.error('[API] Error fetching content:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for content creation (stricter)
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.CREATE)

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
    const body = await request.json()
    const result = createContentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(DBTable.ContentPieces)
      .insert({
        [DBColumn.Title]: result.data.title,
        [DBColumn.VideoUrl]: result.data.videoUrl,
      })
      .select()
      .single()

    if (error) {
      logger.error('[API] Error creating content:', error)
      return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }

    const response = NextResponse.json(data, { status: 201 })
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  } catch (error) {
    logger.error('[API] Error creating content:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}