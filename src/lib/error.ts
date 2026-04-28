import axios from 'axios'

type ApiErrorResponse = Record<string, unknown>

/**
 * Extracts a human-readable error message from Axios errors, Zod validation errors, or generic errors.
 * @param error - The error object to extract message from
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown): string {
  // Handle string errors
  if (typeof error === 'string') return error

  // Handle undefined
  if (error === undefined) return 'An error occurred'

  // Handle non-object errors
  if (typeof error !== 'object') return 'An error occurred'

  const err = error as ApiErrorResponse

  // Handle axios error with response data
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as ApiErrorResponse

    // Check for field-specific validation errors (Zod format)
    if (data.clientEmail && Array.isArray(data.clientEmail)) {
      return (data.clientEmail[0] as string) || 'Invalid email'
    }
    if (data.clientName && Array.isArray(data.clientName)) {
      return (data.clientName[0] as string) || 'Invalid name'
    }
    if (data.feedback && Array.isArray(data.feedback)) {
      return (data.feedback[0] as string) || 'Feedback is required'
    }
    if (data.action && Array.isArray(data.action)) {
      return (data.action[0] as string) || 'Invalid action'
    }
    if (data.title && Array.isArray(data.title)) {
      return (data.title[0] as string) || 'Invalid title'
    }
    if (data.videoUrl && Array.isArray(data.videoUrl)) {
      return (data.videoUrl[0] as string) || 'Invalid video URL'
    }

    // Check for generic error message
    if (data.error && typeof data.error === 'string') {
      return data.error
    }
  }

  // Handle generic error messages
  if (err.message && typeof err.message === 'string') {
    return err.message
  }

  return 'An error occurred'
}