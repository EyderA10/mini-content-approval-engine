import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { createContentSchema } from '@/lib/validators'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
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
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('content_pieces')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Error:', error)
      return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }

    const response = NextResponse.json(data)
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  } catch (_error) {
    console.error('[API] Error:')
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
      .from('content_pieces')
      .insert({
        title: result.data.title,
        video_url: result.data.videoUrl,
      })
      .select()
      .single()

    if (error) {
      console.error('[API] Error creating content:', error)
      return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }

    const response = NextResponse.json(data, { status: 201 })
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  } catch (_error) {
    console.error('[API] Error creating content:')
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}