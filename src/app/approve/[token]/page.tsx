'use client'

import { VideoPlayer } from '@/components/client/VideoPlayer'
import { ActionPanel } from '@/components/client/ActionPanel'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

type ContentPiece = {
  id: string
  title: string
  video_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type Props = {
  params: Promise<{ token: string }>
}

export default function ClientPage({ params }: Props) {
  const [content, setContent] = useState<ContentPiece | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    params.then((p) => {
      setToken(p.token)
      fetchContent(p.token)
    })
  }, [params])

  const fetchContent = async (token: string) => {
    try {
      const response = await fetch(`/api/content/${token}`)
      const data = await response.json()
      if (response.ok) {
        setContent(data)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background-warm to-background">
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
            <ActionPanel token={token} currentStatus={content.status} />
          </div>
        </div>
      </div>
    </div>
  )
}