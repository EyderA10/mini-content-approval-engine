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

  // Handle non-object errors (including null)
  if (error === null) return 'An error occurred'
  if (typeof error !== 'object') return 'An error occurred'

  const err = error as ApiErrorResponse

  // Check for field-specific validation errors (Zod format) - works with both Axios and plain objects
  if (err.clientEmail && Array.isArray(err.clientEmail)) {
    return (err.clientEmail[0] as string) || 'Invalid email'
  }
  if (err.clientName && Array.isArray(err.clientName)) {
    return (err.clientName[0] as string) || 'Invalid name'
  }
  if (err.feedback && Array.isArray(err.feedback)) {
    return (err.feedback[0] as string) || 'Feedback is required'
  }
  if (err.action && Array.isArray(err.action)) {
    return (err.action[0] as string) || 'Invalid action'
  }
  if (err.title && Array.isArray(err.title)) {
    return (err.title[0] as string) || 'Invalid title'
  }
  if (err.videoUrl && Array.isArray(err.videoUrl)) {
    return (err.videoUrl[0] as string) || 'Invalid video URL'
  }

  // Handle axios error with response data
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as ApiErrorResponse
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