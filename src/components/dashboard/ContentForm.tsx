'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createContentSchema, CreateContentInput } from '@/lib/validators'
import { Loader2, Plus, Film } from 'lucide-react'

export function ContentForm({
  onSuccess,
}: {
  onSuccess?: (data: CreateContentInput & { id: string; shareToken: string }) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateContentInput>({
    resolver: zodResolver(createContentSchema),
  })

  const onSubmit = async (data: CreateContentInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error?.videoUrl?.[0] || result.error?.title?.[0] || 'Failed to create content')
        return
      }

      reset()
      if (onSuccess) {
        onSuccess({
          ...data,
          id: result.id,
          shareToken: result.share_token,
        })
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label 
          htmlFor="title" 
          className="block text-sm font-medium text-foreground-muted"
        >
          Video Title
        </label>
        <input
          {...register('title')}
          id="title"
          placeholder="Enter a title for your content"
          className="input"
        />
        {errors.title && (
          <p className="text-sm text-error">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label 
          htmlFor="videoUrl" 
          className="block text-sm font-medium text-foreground-muted"
        >
          Video URL
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Film className="h-4 w-4 text-foreground-muted" />
          </div>
          <input
            {...register('videoUrl')}
            id="videoUrl"
            placeholder="YouTube, Vimeo, or direct MP4 link"
            className="input pl-11"
          />
        </div>
        {errors.videoUrl && (
          <p className="text-sm text-error">{errors.videoUrl.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-error-subtle border border-error/20 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/25"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create Content Piece
          </>
        )}
      </button>
    </form>
  )
}