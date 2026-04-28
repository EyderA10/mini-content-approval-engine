'use client'

import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createContentSchema, CreateContentInput } from '@/lib/validators'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Film } from 'lucide-react'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/error'

/**
 * Form for creating new content pieces with title and video URL.
 * @param onSuccess - Callback fired after successful creation with id and shareToken
 */
export function ContentForm({
  onSuccess,
}: {
  /** Callback fired on successful creation with { id, shareToken, title, videoUrl }. */
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
      const response = await axios.post('/api/content', data)

      reset()
      toast.success('Content piece created successfully')
      if (onSuccess) {
        onSuccess({
          ...data,
          id: response.data.id,
          shareToken: response.data.share_token,
        })
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(extractErrorMessage(err.response.data.error))
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label 
          htmlFor="title" 
        >
          Video Title
        </Label>
        <Input
          {...register('title')}
          id="title"
          placeholder="Enter a title for your content"
        />
        {errors.title && (
          <p className="text-sm text-error">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="videoUrl" 
        >
          Video URL
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Film className="h-4 w-4 text-foreground-muted" />
          </div>
          <Input
            {...register('videoUrl')}
            id="videoUrl"
            placeholder="YouTube, Vimeo, or direct MP4 link"
            className="pl-11"
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

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create Content Piece
          </>
        )}
      </Button>
    </form>
  )
}