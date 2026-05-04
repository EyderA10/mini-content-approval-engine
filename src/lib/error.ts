type ApiErrorResponse = Record<string, unknown>

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  clientEmail: 'Invalid email',
  clientName: 'Invalid name',
  feedback: 'Feedback is required',
  action: 'Invalid action',
  title: 'Invalid title',
  videoUrl: 'Invalid video URL',
}

/**
 * Extracts the first field-specific validation error from an error data object.
 * @param data - The error data object to check for field arrays
 * @returns The first error message or null if no field errors found
 */
function extractFieldError(data: ApiErrorResponse): string | null {
  for (const field of Object.keys(FIELD_ERROR_MESSAGES)) {
    if (data[field] && Array.isArray(data[field])) {
      return (data[field][0] as string) || FIELD_ERROR_MESSAGES[field]
    }
  }
  return null
}

/**
 * Extracts a human-readable error message from Axios errors, Zod validation errors, or generic errors.
 * @param error - The error object to extract message from
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error == null) return 'An error occurred'
  if (typeof error !== 'object') return 'An error occurred'

  const err = error as ApiErrorResponse

  // Check for field-specific validation errors directly on error object
  const directFieldError = extractFieldError(err)
  if (directFieldError) return directFieldError

  // Check axios-like error response (structural check)
  if (typeof err.response === 'object' && err.response !== null) {
    const data = (err.response as { data?: ApiErrorResponse }).data
    if (data && typeof data === 'object') {
      const responseFieldError = extractFieldError(data)
      if (responseFieldError) return responseFieldError

      if (typeof data.error === 'string') return data.error
    }
  }

  // Handle generic error messages
  if (typeof err.message === 'string') return err.message

  return 'An error occurred'
}
