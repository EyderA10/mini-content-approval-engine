import { logger } from './logger'

export type AuditLogEntry = {
  action: string
  token: string
  clientName?: string | null
  clientEmail?: string | null
  ip: string
  userAgent: string | null
  timestamp: string
  success: boolean
  errorMessage?: string
}

/**
 * Audit logger for content approval actions.
 * Masks email for privacy. In production, write to audit_logs table
 * or external service.
 */
export function auditLog(entry: AuditLogEntry): void {
  const logEntry: Record<string, unknown> = {
    ...entry,
    // Mask email for privacy in logs
    clientEmail: entry.clientEmail
      ? `${entry.clientEmail.split('@')[0]}***@***`
      : undefined,
  }

  if (process.env.NODE_ENV === 'development') {
    logger.log('[AUDIT]', JSON.stringify(logEntry, null, 2))
  }

  // In production, write to audit_logs table:
  // await supabase.from('audit_logs').insert({ ... })
}
