import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { actionSchema } from '@/lib/validators'
import { rateLimit, getClientIp, RATE_LIMITS, createRateLimitResponse, applyRateLimitHeaders } from '@/lib/rate-limit'
import { auditLog, AuditLogEntry } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { ContentStatus, DBTable, DBColumn, DBErrorCode } from '@/lib/enums'
import { SELECT_CONTENT_STATUS } from '@/lib/constants'

/**
 * Handles database update errors with appropriate responses and audit logging.
 * Uses early returns to avoid nested conditionals.
 */
async function handleUpdateError(
  error: { code?: string },
  preAuditEntry: Omit<AuditLogEntry, 'errorMessage'>,
  token: string
): Promise<NextResponse> {
  // If PGRST116 (no rows returned), status was not pending — already reviewed
  if (error.code === DBErrorCode.NoRowsFound) {
    return handleAlreadyReviewed(preAuditEntry, token)
  }

  auditLog({
    ...preAuditEntry,
    errorMessage: 'Database update failed',
  })
  logger.error('[API] Error processing action:', error)
  return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
}

/**
 * Checks if content exists and returns appropriate error response.
 */
async function handleAlreadyReviewed(
  preAuditEntry: Omit<AuditLogEntry, 'errorMessage'>,
  token: string
): Promise<NextResponse> {
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from(DBTable.ContentPieces)
    .select(SELECT_CONTENT_STATUS)
    .eq(DBColumn.ShareToken, token)
    .single()

  const alreadyReviewed = !!existing
  auditLog({
    ...preAuditEntry,
    errorMessage: alreadyReviewed ? 'Content already reviewed' : 'Content not found',
  })
  return NextResponse.json(
    {
      error: alreadyReviewed
        ? 'Content has already been reviewed'
        : 'Content not found',
    },
    { status: alreadyReviewed ? 409 : 404 }
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Rate Limiting for actions
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.ACTION)

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.headers)
  }

  try {
    const { token } = await params
    const body = await request.json()
    const result = actionSchema.safeParse(body)

    // Audit log - BEFORE processing (even if validation fails)
    const preAuditEntry: Omit<AuditLogEntry, 'errorMessage'> = {
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

    // Atomic conditional update: only update if status is 'pending'
    // This prevents double-approval/rejection under concurrent requests
    const updateData: Record<string, unknown> = {
      status: result.data.action,
      client_name: result.data.clientName || null,
      client_email: result.data.clientEmail || null,
      client_feedback:
        result.data.action === ContentStatus.Rejected ? result.data.feedback || null : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from(DBTable.ContentPieces)
      .update(updateData)
      .eq(DBColumn.ShareToken, token)
      .eq(DBColumn.Status, ContentStatus.Pending)
      .select()
      .single()

    if (error) {
      return handleUpdateError(error, preAuditEntry, token)
    }

    // Success audit log (reuse preAuditEntry via spread)
    auditLog({
      ...preAuditEntry,
      action: result.data.action,
      clientName: result.data.clientName,
      clientEmail: result.data.clientEmail,
      success: true,
    })

    const response = NextResponse.json({
      success: true,
      message:
        result.data.action === ContentStatus.Approved
          ? 'Content approved'
          : 'Content rejected with feedback',
    })
    applyRateLimitHeaders(response, rateLimitResult.headers)
    return response
  } catch (error) {
    logger.error('[API] Error processing action:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
