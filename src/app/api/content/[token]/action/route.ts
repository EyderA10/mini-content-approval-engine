import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { actionSchema } from '@/lib/validators'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const result = actionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from('content_pieces')
      .select('id, status')
      .eq('share_token', token)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Content has already been reviewed' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      status: result.data.action === 'approve' ? 'approved' : 'rejected',
      client_name: result.data.clientName || null,
      client_email: result.data.clientEmail || null,
      client_feedback:
        result.data.action === 'reject' ? result.data.feedback || null : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('content_pieces')
      .update(updateData)
      .eq('share_token', token)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message:
        result.data.action === 'approve'
          ? 'Content approved'
          : 'Content rejected with feedback',
    })
  } catch (error) {
    console.error('[API] Error processing action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}