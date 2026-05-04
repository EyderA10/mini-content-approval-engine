import { describe, it, expect } from 'vitest'
import { extractErrorMessage } from '@/lib/error'

describe('extractErrorMessage', () => {
  describe('string errors', () => {
    it('should return string error as-is', () => {
      const error = 'Something went wrong'
      expect(extractErrorMessage(error)).toBe('Something went wrong')
    })

    it('should return empty string', () => {
      const error = ''
      expect(extractErrorMessage(error)).toBe('')
    })
  })

  describe('undefined errors', () => {
    it('should return default message for undefined', () => {
      const error = undefined
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })
  })

  describe('non-object errors', () => {
    it('should return default message for number', () => {
      const error = 123
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })

    it('should return default message for boolean', () => {
      const error = true
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })

    it('should return default message for null', () => {
      const error = null
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })
  })

  describe('Error objects', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Network error')
      expect(extractErrorMessage(error)).toBe('Network error')
    })

    it('should extract message from custom error', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)
        }
      }
      const error = new CustomError('Custom error message')
      expect(extractErrorMessage(error)).toBe('Custom error message')
    })
  })

  describe('axios-like errors', () => {
    it('should extract field-specific error for clientEmail', () => {
      const error = {
        response: {
          data: {
            clientEmail: ['Invalid email format'],
          },
        },
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Invalid email format')
    })

    it('should extract field-specific error for clientName', () => {
      const error = {
        response: {
          data: {
            clientName: ['Name is too long'],
          },
        },
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Name is too long')
    })

    it('should extract field-specific error for feedback', () => {
      const error = {
        response: {
          data: {
            feedback: ['Feedback is required'],
          },
        },
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Feedback is required')
    })

    it('should extract field-specific error for action', () => {
      const error = {
        response: {
          data: {
            action: ['Invalid action'],
          },
        },
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Invalid action')
    })

    it('should extract field-specific error for title', () => {
      const error = {
        response: {
          data: {
            title: ['Title is required'],
          },
        },
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Title is required')
    })

    it('should extract field-specific error for videoUrl', () => {
      const error = {
        response: {
          data: {
            videoUrl: ['Invalid video URL'],
          },
        },
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Invalid video URL')
    })

    it('should extract generic error message from axios response', () => {
      const error = {
        response: {
          data: {
            error: 'Content not found',
          },
        },
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Content not found')
    })

    it('should handle axios error without response data', () => {
      const error = {
        response: null,
        message: 'Network Error',
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Network Error')
    })

    it('should return first error in array for field with multiple errors', () => {
      const error = {
        response: {
          data: {
            clientEmail: ['Required', 'Must be valid email'],
          },
        },
        isAxiosError: true,
      }

      const result = extractErrorMessage(error)
      expect(result).toBe('Required')
    })
  })

  describe('generic errors with message property', () => {
    it('should extract message from object with message', () => {
      const error = { message: 'Something went wrong' }
      expect(extractErrorMessage(error)).toBe('Something went wrong')
    })

    it('should handle nested message property', () => {
      const error = { data: { message: 'Nested error' } }
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const error = {}
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })

    it('should handle object with null message', () => {
      const error = { message: null }
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })

    it('should handle object with undefined message', () => {
      const error = { message: undefined }
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })

    it('should handle array errors', () => {
      const error = ['error1', 'error2']
      expect(extractErrorMessage(error)).toBe('An error occurred')
    })
  })
})
