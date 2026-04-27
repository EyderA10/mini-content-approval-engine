import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { createContentSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    // @ts-ignore - Supabase client typing
    const { data, error } = await supabase
      .from('content_pieces')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = createContentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    // @ts-ignore - Supabase client typing
    const { data, error } = await supabase
      .from('content_pieces')
      .insert({
        title: result.data.title,
        video_url: result.data.videoUrl,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}