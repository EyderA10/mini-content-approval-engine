'use client'

import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { Copy, ExternalLink, Loader2, Play, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

const supabase = createClient()
const POLL_INTERVAL = 3000

type ContentPiece = {
  id: string
  title: string
  video_url: string
  status: 'pending' | 'approved' | 'rejected'
  share_token: string
  client_feedback: string | null
  created_at: string
}

export function ContentList() {
  const [items, setItems] = useState<ContentPiece[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const lastUpdateRef = useRef<number>(0)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isActive = true

    const fetchContent = async () => {
      try {
        const response = await axios.get('/api/content')
        if (isActive && response.status === 200) {
          const newItems = response.data
          
          setItems(newItems)
          
          if (lastUpdateRef.current > 0) {
            const addedItem = newItems.find((n: ContentPiece) => 
              !items.some((o) => o.id === n.id)
            )
            if (addedItem) {
              toast.success(`New content: ${addedItem.title}`)
            }
          }
          
          lastUpdateRef.current = Date.now()
        }
      } catch (error) {
        console.error('[Dashboard] Failed to fetch content:', error)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    const handleRealtimeEvent = (payload: { eventType: string; new?: ContentPiece; old?: ContentPiece }) => {
      console.log('[Dashboard] Realtime event:', payload.eventType, payload)
      
      if (payload.eventType === 'INSERT' && payload.new) {
        setItems((prev) => {
          if (prev.some((item) => item.id === payload.new!.id)) return prev
          return [payload.new!, ...prev]
        })
        toast.success(`New content: ${payload.new.title}`)
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === payload.new!.id ? payload.new! : item
          )
        )
        toast.success(`Updated: ${payload.new.title}`)
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setItems((prev) =>
          prev.filter((item) => item.id !== payload.old!.id)
        )
        toast.info(`Removed: ${payload.old.id}`)
      }
      
      lastUpdateRef.current = Date.now()
    }

    fetchContent()

    const channel = supabase
      .channel('content-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_pieces' },
        handleRealtimeEvent as never
      )
      .subscribe((status) => {
        console.log('[Dashboard] Subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('[Dashboard] Realtime connected - polling disabled')
        } else if (status === 'CLOSED' && !pollIntervalRef.current) {
          console.log('[Dashboard] Realtime unavailable - starting polling')
          
          pollIntervalRef.current = setInterval(() => {
            if (document.visibilityState === 'visible') {
              fetchContent()
            }
          }, POLL_INTERVAL)
        }
      })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Dashboard] Tab visible - refetching')
        fetchContent()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isActive = false
      channel.unsubscribe()
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const copyLink = (token: string) => {
    const url = `${globalThis.location.origin}/approve/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Share link copied')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
        </div>
        <p className="mt-4 text-sm text-foreground-muted">Loading content...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-warm">
          <Play className="h-8 w-8 text-foreground-muted" />
        </div>
        <p className="text-foreground-muted">No content pieces yet</p>
        <p className="mt-1 text-sm text-foreground-muted/70">
          Create your first piece above
        </p>
      </div>
    )
  }

  return (
    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
      {items.map((item, index) => (
        <Card
          key={item.id}
          className="relative overflow-hidden p-4 opacity-0 animate-slide-up"
          style={{
            animationDelay: `${index * 0.05}s`,
            animationFillMode: 'forwards',
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background-warm text-foreground-muted transition-colors group-hover:bg-accent group-hover:text-white">
              <Play className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground group-hover:text-accent transition-colors">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    Created{' '}
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              {item.client_feedback && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-error-subtle/50 border border-error/10 p-3">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                  <p className="text-sm text-error">{item.client_feedback}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 transition-opacity duration-200 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyLink(item.share_token)}
                title="Copy share link"
              >
                <Copy className="h-4 w-4 text-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  globalThis.open(`/approve/${item.share_token}`, '_blank')
                }}
                title="Open review page"
              >
                <ExternalLink className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}