import { z } from 'zod'

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const VIMEO_REGEX = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
const MP4_REGEX = /\.mp4$/i

/** Supported video platforms. */
export type VideoType = 'youtube' | 'vimeo' | 'mp4'

/**
 * Detects the video platform from a URL.
 * @param url - The video URL to check
 * @returns The video type or null if unsupported
 */
export function getVideoType(url: string): VideoType | null {
  if (YOUTUBE_REGEX.test(url)) return 'youtube'
  if (VIMEO_REGEX.test(url)) return 'vimeo'
  if (MP4_REGEX.test(url)) return 'mp4'
  return null
}

/**
 * Validates if a URL is a supported video platform.
 * @param url - The URL to validate
 * @returns True if the URL is a valid YouTube, Vimeo, or MP4 link
 */
export function isValidVideoUrl(url: string): boolean {
  return getVideoType(url) !== null
}

/**
 * Extracts the video ID from a URL based on its type.
 * @param url - The original video URL
 * @param type - The detected video type
 * @returns The video ID or the full URL for MP4
 */
export function getVideoId(url: string, type: VideoType): string | null {
  switch (type) {
    case 'youtube': {
      const match = url.match(YOUTUBE_REGEX)
      return match ? match[1] : null
    }
    case 'vimeo': {
      const match = url.match(VIMEO_REGEX)
      return match ? match[1] : null
    }
    case 'mp4':
      return url
    default:
      return null
  }
}

/**
 * Generates an embeddable URL for the video player.
 * @param url - The original video URL
 * @returns Embed URL for YouTube/Vimeo, or original URL for MP4
 */
export function getEmbedUrl(url: string): string | null {
  const type = getVideoType(url)
  if (!type) return null

  const id = getVideoId(url, type)
  if (!id) return null

  switch (type) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${id}`
    case 'vimeo':
      return `https://player.vimeo.com/video/${id}`
    case 'mp4':
      return url
  }
}

/** Zod schema for validating video URLs (YouTube, Vimeo, or direct MP4). */
export const videoUrlSchema = z.string().refine(isValidVideoUrl, {
  message: 'Invalid video URL. Use YouTube, Vimeo, or direct MP4 link.',
})