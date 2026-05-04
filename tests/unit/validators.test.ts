import { describe, it, expect } from 'vitest'
import { createContentSchema, actionSchema } from '@/lib/validators'
import { faker } from '@faker-js/faker'

describe('createContentSchema', () => {
  describe('valid inputs', () => {
    it('should validate valid YouTube URL with title', () => {
      const input = {
        title: faker.lorem.sentence(),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe(input.title)
        expect(result.data.videoUrl).toBe(input.videoUrl)
      }
    })

    it('should validate valid Vimeo URL with title', () => {
      const input = {
        title: faker.lorem.sentence(),
        videoUrl: 'https://vimeo.com/123456789',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should validate valid MP4 URL with title', () => {
      const input = {
        title: faker.lorem.sentence(),
        videoUrl: 'https://example.com/video.mp4',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should validate YouTube short URL format', () => {
      const input = {
        title: faker.lorem.sentence(),
        videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should validate YouTube embed URL format', () => {
      const input = {
        title: faker.lorem.sentence(),
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should trim whitespace from title', () => {
      const input = {
        title: `  ${faker.lorem.sentence()}  `,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe(input.title.trim())
      }
    })
  })

  describe('invalid inputs', () => {
    it('should reject empty title', () => {
      const input = {
        title: '',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toBeDefined()
      }
    })

    it('should reject title that is too long', () => {
      const input = {
        title: 'a'.repeat(201),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toBeDefined()
      }
    })

    it('should reject invalid video URL', () => {
      const input = {
        title: faker.lorem.sentence(),
        videoUrl: 'https://example.com/not-a-video',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.videoUrl).toBeDefined()
      }
    })

    it('should reject missing title', () => {
      const input = {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject missing videoUrl', () => {
      const input = {
        title: faker.lorem.sentence(),
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject non-string title', () => {
      const input = {
        title: 123,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject invalid Vimeo URL format', () => {
      const input = {
        title: faker.lorem.sentence(),
        videoUrl: 'https://vimeo.com/invalid',
      }

      const result = createContentSchema.safeParse(input)

      expect(result.success).toBe(false)
    })
  })
})

describe('actionSchema', () => {
  describe('approve action', () => {
    it('should validate approve with no optional fields', () => {
      const input = {
        action: 'approved',
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should validate approve with client name', () => {
      const input = {
        action: 'approved',
        clientName: faker.person.fullName(),
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should validate approve with client email', () => {
      const input = {
        action: 'approved',
        clientEmail: faker.internet.email(),
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should validate approve with client name and email', () => {
      const input = {
        action: 'approved',
        clientName: faker.person.fullName(),
        clientEmail: faker.internet.email(),
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should validate approve with empty string email', () => {
      const input = {
        action: 'approved',
        clientEmail: '',
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(true)
    })
  })

  describe('reject action', () => {
    it('should validate reject with feedback', () => {
      const input = {
        action: 'rejected',
        feedback: faker.lorem.paragraph(),
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should reject reject without feedback', () => {
      const input = {
        action: 'rejected',
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.feedback).toBeDefined()
      }
    })

    it('should reject reject with empty feedback', () => {
      const input = {
        action: 'rejected',
        feedback: '',
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject reject with whitespace-only feedback', () => {
      const input = {
        action: 'rejected',
        feedback: '   ',
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should validate reject with feedback and client info', () => {
      const input = {
        action: 'rejected',
        feedback: faker.lorem.paragraph(),
        clientName: faker.person.fullName(),
        clientEmail: faker.internet.email(),
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should reject feedback that is too long', () => {
      const input = {
        action: 'rejected',
        feedback: 'a'.repeat(2001),
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.feedback).toBeDefined()
      }
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid action value', () => {
      const input = {
        action: 'invalid',
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject missing action', () => {
      const input = {
        feedback: 'Some feedback',
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
      const input = {
        action: 'approved',
        clientEmail: 'not-an-email',
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.clientEmail).toBeDefined()
      }
    })

    it('should reject client name that is too long', () => {
      const input = {
        action: 'approved',
        clientName: 'a'.repeat(101),
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.clientName).toBeDefined()
      }
    })

    it('should reject client email that is too long', () => {
      const input = {
        action: 'approved',
        clientEmail: `${'a'.repeat(100)}@example.com`,
      }

      const result = actionSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.clientEmail).toBeDefined()
      }
    })
  })
})
