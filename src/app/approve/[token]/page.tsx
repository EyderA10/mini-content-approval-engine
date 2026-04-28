'use client'

import { VideoPlayer } from '@/components/client/VideoPlayer'
import { ActionPanel } from '@/components/client/ActionPanel'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { createClient } from '@/lib/supabase'
import { ContentPiece } from '@/lib/validators'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { POLL_INTERVAL } from '@/lib/constants'
import { logger } from '@/lib/logger'

const supabase = createClient()

type Props = {
  params: Promise<{ token: string }>
}

export default function ClientPage({ params }: Props) {
  const [content, setContent] = useState<ContentPiece | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string>('')
  const isMountedRef = useRef(true)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const prevStatusRef = useRef<string>('pending')

  const fetchContent = async (t: string) => {
    try {
      const response = await axios.get(`/api/content/${t}`)
      if (isMountedRef.current && response.status === 200) {
        const newContent = response.data
        setContent(newContent)
        
        if (prevStatusRef.current === 'pending' && newContent.status !== 'pending') {
          logger.log('[Client] Status changed via polling:', newContent.status)
          if (newContent.status === 'approved') {
            toast.success('Content approved!')
          } else if (newContent.status === 'rejected') {
            toast.success('Feedback submitted')
          }
        }
        
        prevStatusRef.current = newContent.status
      }
    } catch (error) {
      logger.error('[Client] Failed to fetch content:', error)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }
  
  const handleActionComplete = () => {
    logger.log('[Client] Action completed, refetching...')
    if (token) {
      fetchContent(token)
    }
  }

  useEffect(() => {
    params.then((p) => {
      setToken(p.token)
      fetchContent(p.token)
    })
  }, [params])

  useEffect(() => {
    if (!token || !isMountedRef.current) return

    logger.log('[Client] Setting up realtime for token:', token)

    const channel = supabase
      .channel('content-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'content_pieces', filter: `share_token=eq.${token}` },
        (payload) => {
          if (!isMountedRef.current) return
          
          logger.log('[Client] UPDATE received:', payload)
          logger.log('[Client] New status:', payload.new?.status)
          
          if (payload.new) {
            const updatedContent = payload.new as ContentPiece
            setContent(updatedContent)
            prevStatusRef.current = updatedContent.status
            
            if (updatedContent.status === 'approved') {
              toast.success('Content approved!')
            } else if (updatedContent.status === 'rejected') {
              toast.success('Feedback submitted')
            }
          }
        }
      )
      .subscribe((status) => {
        logger.log('[Client] Subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          logger.log('[Client] Realtime connected - polling disabled')
        } else if (status === 'CLOSED' && !pollIntervalRef.current) {
          logger.log('[Client] Realtime unavailable - starting polling')
          
          pollIntervalRef.current = setInterval(() => {
            if (document.visibilityState === 'visible' && token) {
              fetchContent(token)
            }
          }, POLL_INTERVAL)
        }
      })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && token) {
        logger.log('[Client] Tab visible - refetching')
        fetchContent(token)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      logger.log('[Client] Cleanup - unsubscribing from channel')
      channel.unsubscribe()
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [token])

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="mt-4 text-sm text-foreground-muted">Loading content...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-background-warm">
            <svg className="h-10 w-10 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Content Not Found</h1>
          <p className="mt-2 text-foreground-muted">This link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background-warm to-background">
      <div className="container mx-auto max-w-4xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
            <span>Review Request</span>
            <span>•</span>
            <span>{new Date(content.created_at).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground lg:text-5xl">
            {content.title}
          </h1>
        </div>

        {/* Video Player - Cinematic */}
        <div className="mb-10 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
          <VideoPlayer url={content.video_url} />
        </div>

        {/* Decision Panel */}
        <div className="opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: 'forwards' }}>
          <div className="card p-6 lg:p-8">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
              Your Decision
            </h2>
            <ActionPanel token={token} currentStatus={content.status} onActionComplete={handleActionComplete} />
          </div>
        </div>
      </div>
    </div>
  )
}