import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { actionSchema } from '@/lib/validators'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

/**
 * Simple audit logger - logs to console in development.
 * In production, this would write to an audit_logs table or external service.
 */
function auditLog(entry: {
  action: string
  token: string
  clientName?: string | null
  clientEmail?: string | null
  ip: string
  userAgent: string | null
  timestamp: string
  success: boolean
  errorMessage?: string
}) {
  const logEntry = {
    ...entry,
    // Mask email for privacy in logs
    clientEmail: entry.clientEmail ? `${entry.clientEmail.split('@')[0]}***@***` : undefined,
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(logEntry, null, 2))
  }

  // In production, write to audit_logs table:
  // await supabase.from('audit_logs').insert({ ... })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // 1. CSRF Protection - check origin
  const origin = request.headers.get('origin')
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  if (origin && origin !== allowedOrigin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Rate Limiting for actions
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.ACTION)

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
    const body = await request.json()
    const result = actionSchema.safeParse(body)

    // Audit log - BEFORE processing (even if validation fails)
    const preAuditEntry = {
      action: body?.action || 'unknown',
      token,
      clientName: body?.clientName,
      clientEmail: body?.clientEmail,
      ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      success: false,
    }

    if (!result.success) {
      auditLog({
        ...preAuditEntry,
        errorMessage: 'Validation failed',
      })
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
      auditLog({
        ...preAuditEntry,
        errorMessage: 'Content not found',
      })
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (existing.status !== 'pending') {
      auditLog({
        ...preAuditEntry,
        errorMessage: 'Content already reviewed',
      })
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
      auditLog({
        ...preAuditEntry,
        errorMessage: 'Database update failed',
      })
      console.error('[API] Error processing action:', error)
      return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }

    // Success audit log
    auditLog({
      action: result.data.action,
      token,
      clientName: result.data.clientName,
      clientEmail: result.data.clientEmail,
      ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      success: true,
    })

    const response = NextResponse.json({
      success: true,
      message:
        result.data.action === 'approve'
          ? 'Content approved'
          : 'Content rejected with feedback',
    })
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  } catch (_error) {
    console.error('[API] Error processing action:')
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}