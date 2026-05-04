import { z } from 'zod'
import { videoUrlSchema } from './video'

/**
 * Schema for creating a new content piece (title + video URL).
 * @see {CreateContentInput}
 */
export const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim(),
  videoUrl: videoUrlSchema,
})

/**
 * Schema for client approval/rejection action.
 * Requires feedback when action is 'reject'.
 * @see {ActionInput}
 */
export const actionSchema = z
  .object({
    action: z.enum(['approved', 'rejected']),
    clientName: z.string().max(100, 'Name must be under 100 characters').optional(),
    clientEmail: z.email('Invalid email').max(100, 'Email must be under 100 characters').optional().or(z.literal('')),
    feedback: z.string().max(2000, 'Feedback must be under 2000 characters').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === 'rejected' && (!data.feedback || data.feedback.trim() === '')) {
      ctx.addIssue({
        code: 'custom',
        message: 'Feedback is required when rejecting',
        path: ['feedback'],
      })
    }
  })

export type CreateContentInput = z.infer<typeof createContentSchema>

/** Input type for client action (approve/reject). */
export type ActionInput = z.infer<typeof actionSchema>

/** Content piece data from Supabase database. */
export type ContentPiece = {
  id: string
  title: string
  video_url: string
  status: 'pending' | 'approved' | 'rejected'
  share_token?: string
  client_feedback?: string | null
  created_at: string
}