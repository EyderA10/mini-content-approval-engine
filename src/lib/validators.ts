import { z } from 'zod'
import { videoUrlSchema } from './video'

export const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  videoUrl: videoUrlSchema,
})

export const actionSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
    clientName: z.string().optional(),
    clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    feedback: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === 'reject' && (!data.feedback || data.feedback.trim() === '')) {
        return false
      }
      return true
    },
    {
      message: 'Feedback is required when rejecting',
      path: ['feedback'],
    }
  )

export type CreateContentInput = z.infer<typeof createContentSchema>
export type ActionInput = z.infer<typeof actionSchema>