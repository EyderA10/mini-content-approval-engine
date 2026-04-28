'use client'

import { useState } from 'react'
import { ContentForm } from '@/components/dashboard/ContentForm'
import { ContentList } from '@/components/dashboard/ContentList'

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleContentCreated = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-linear-to-b from-background via-background-warm to-background">
      <div className="container mx-auto max-w-6xl px-6 py-12 lg:px-8">
        {/* Hero section */}
        <div className="mb-12 max-w-2xl opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground lg:text-5xl">
            Agency Dashboard
          </h1>
          <p className="mt-4 text-lg text-foreground-muted">
            Create and manage video content pieces for client approval. 
            Share review links and track responses in real-time.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Create Content */}
          <div className="lg:col-span-5 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
            <div className="card p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  New Content Piece
                </h2>
                <p className="mt-1 text-sm text-foreground-muted">
                  Add a video for client review
                </p>
              </div>
              <ContentForm onSuccess={handleContentCreated} />
            </div>
          </div>

          {/* Content List */}
          <div className="lg:col-span-7 opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: 'forwards' }}>
            <div className="card p-6 lg:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  Content List
                </h2>
                <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold text-accent">
                  Live
                </span>
              </div>
              <ContentList key={refreshKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}