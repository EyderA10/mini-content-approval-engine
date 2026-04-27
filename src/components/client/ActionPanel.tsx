'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
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
            variant="destructive"
            className="flex flex-1 items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold shadow-lg shadow-error/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
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
              variant="destructive"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 shadow-lg shadow-error/20 transition-all hover:shadow-error/30 disabled:opacity-50"
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