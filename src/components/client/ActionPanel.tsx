'use client'

import { useState } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Check, X, User, Mail, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/error'

type ActionPanelProps = {
  /** The unique share token for the content piece. */
  token: string
  /** Current approval status of the content. */
  currentStatus: 'pending' | 'approved' | 'rejected'
  /** Callback fired after an action is submitted. */
  onActionComplete?: () => void
}

/**
 * Client-facing panel for approving or rejecting content.
 * Shows different UI based on current status (pending/approved/rejected).
 */
export function ActionPanel({ token, currentStatus, onActionComplete }: ActionPanelProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await axios.post(`/api/content/${token}/action`, {
        action: 'approve',
        clientName: clientName || undefined,
        clientEmail: clientEmail || undefined,
      })

      toast.success('Content approved successfully!')
      onActionComplete?.()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        toast.error(extractErrorMessage(err.response.data.error) || 'Failed to approve')
      } else {
        toast.error('An unexpected error occurred')
      }
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
      await axios.post(`/api/content/${token}/action`, {
        action: 'reject',
        feedback,
        clientName: clientName || undefined,
        clientEmail: clientEmail || undefined,
      })

      toast.success('Feedback submitted')
      onActionComplete?.()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        toast.error(extractErrorMessage(err.response.data.error) || 'Failed to reject')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStatus !== 'pending') {
    return (
      <Card className="p-8 text-center">
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
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Optional Client Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Your Name
          </Label>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            type="email"
            placeholder="Optional"
          />
        </div>
      </div>

      {!showFeedback ? (
        <div className="flex gap-4 pt-2">
          <Button
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
          </Button>
          <Button
            onClick={() => setShowFeedback(true)}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-error-subtle px-6 py-4 text-lg font-semibold text-error border border-error/20 shadow-lg shadow-error/10 transition-all hover:bg-error/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <X className="h-5 w-5" />
            Request Changes
          </Button>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-error/20 bg-error-subtle/30 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-error">
              <MessageSquare className="h-4 w-4" />
              Feedback (required)
            </Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please describe the changes you'd like to see..."
              rows={4}
              className="resize-none border-error/30 focus:border-error focus:ring-error/20"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              disabled={isLoading || !feedback.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 bg-error-subtle text-error border border-error/20 shadow-lg shadow-error/10 transition-all hover:bg-error/20 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowFeedback(false)}
              disabled={isLoading}
              variant="secondary"
              className="px-5 py-3"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}