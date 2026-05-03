'use client'

import { useState, useRef } from 'react'
import { ContentPiece } from '@/lib/validators'
import axios from 'axios'
import { logger } from '@/lib/logger'
import { useRealtimeWithPolling, RealtimeEvent } from '@/hooks/useRealtimeWithPolling'
import { VideoPlayer } from '@/components/client/VideoPlayer'
import { ActionPanel } from '@/components/client/ActionPanel'

type ClientApprovalViewProps = {
  content: ContentPiece
  token: string
}

export function ClientApprovalView({ content, token }: ClientApprovalViewProps) {
  const [currentContent, setCurrentContent] = useState<ContentPiece>(content)
  const prevStatusRef = useRef(content.status)

  const handleActionComplete = () => {
    logger.log('[Client] Action completed, refetching...')
    axios.get(`/api/content/${token}`).then((res) => {
      if (res.status === 200) {
        setCurrentContent(res.data)
        prevStatusRef.current = res.data.status
      }
    }).catch((error) => {
      logger.error('[Client] Failed to refetch content:', error)
    })
  }

  const handleRealtimeEvent = (event: RealtimeEvent<ContentPiece>) => {
    if (event.eventType === 'UPDATE' && event.new) {
      setCurrentContent(event.new)
      prevStatusRef.current = event.new.status
    }
  }

  useRealtimeWithPolling<ContentPiece>({
    table: 'content_pieces',
    filter: `share_token=eq.${token}`,
    channelName: `client-${token}`,
    onEvent: handleRealtimeEvent,
  })

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background-warm to-background">
      <div className="container mx-auto max-w-4xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
            <span>Review Request</span>
            <span>•</span>
            <span>{new Date(currentContent.created_at).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground lg:text-5xl">
            {currentContent.title}
          </h1>
        </div>

        {/* Video Player - Cinematic */}
        <div className="mb-10 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
          <VideoPlayer url={currentContent.video_url} />
        </div>

        {/* Decision Panel */}
        <div className="opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: 'forwards' }}>
          <div className="card p-6 lg:p-8">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
              Your Decision
            </h2>
            <ActionPanel
              token={token}
              currentStatus={currentContent.status}
              onActionComplete={handleActionComplete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
