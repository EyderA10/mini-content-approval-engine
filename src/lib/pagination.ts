/**
 * Parses pagination parameters from a URL's query string.
 * @param url - The URL to extract pagination params from
 * @returns Object containing page, limit, and offset values
 */
export function parsePaginationParams(url: URL): {
  page: number
  limit: number
  offset: number
} {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10))
  )
  const offset = (page - 1) * limit
  return { page, limit, offset }
}
