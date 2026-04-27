'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X, User, Mail, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

type ActionPanelProps = {
  token: string
  currentStatus: 'pending' | 'approved' | 'rejected'
}

export function ActionPanel({ token, currentStatus }: ActionPanelProps) {
  const router = useRouter()
  const [showFeedback, setShowFeedback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/content/${token}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          clientName: clientName || undefined,
          clientEmail: clientEmail || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to approve')
        return
      }

      toast.success('Content approved successfully!')
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast.error('Feedback is required when rejecting')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/content/${token}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          feedback,
          clientName: clientName || undefined,
          clientEmail: clientEmail || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to reject')
        return
      }

      toast.success('Feedback submitted')
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStatus !== 'pending') {
    return (
      <div className="rounded-xl border bg-background-warm p-8 text-center">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
          currentStatus === 'approved' 
            ? 'bg-success-subtle text-success' 
            : 'bg-error-subtle text-error'
        }`}>
          {currentStatus === 'approved' ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : (
            <XCircle className="h-8 w-8" />
          )}
        </div>
        <div className={`inline-block rounded-full px-6 py-2 text-lg font-semibold ${
          currentStatus === 'approved' 
            ? 'bg-success-subtle text-success border border-success/20' 
            : 'bg-error-subtle text-error border border-error/20'
        }`}>
          {currentStatus === 'approved' ? 'Approved' : 'Rejected'}
        </div>
        {currentStatus === 'rejected' && (
          <p className="mt-4 text-foreground-muted">
            Thank you for your feedback. The team will review your notes.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Optional Client Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground-muted">
            <User className="h-4 w-4" />
            Your Name
          </label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Optional"
            className="input"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground-muted">
            <Mail className="h-4 w-4" />
            Email
          </label>
          <input
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            type="email"
            placeholder="Optional"
            className="input"
          />
        </div>
      </div>

      {!showFeedback ? (
        <div className="flex gap-4 pt-2">
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-success px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-success/25 transition-all hover:bg-success/90 hover:shadow-xl hover:shadow-success/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="h-5 w-5" />
                Approve
              </>
            )}
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-error px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-error/25 transition-all hover:bg-error/90 hover:shadow-xl hover:shadow-error/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <X className="h-5 w-5" />
            Request Changes
          </button>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-error/20 bg-error-subtle/30 p-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-error">
              <MessageSquare className="h-4 w-4" />
              Feedback (required)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please describe the changes you'd like to see..."
              rows={4}
              className="input resize-none border-error/30 focus:border-error focus:ring-error/20"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={isLoading || !feedback.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-error px-5 py-3 text-white shadow-lg shadow-error/20 transition-all hover:bg-error/90 hover:shadow-error/30 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </button>
            <button
              onClick={() => setShowFeedback(false)}
              disabled={isLoading}
              className="btn btn-secondary px-5 py-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}