import { z } from 'zod'

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const VIMEO_REGEX = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
const MP4_REGEX = /\.mp4$/i

export type VideoType = 'youtube' | 'vimeo' | 'mp4'

export function getVideoType(url: string): VideoType | null {
  if (YOUTUBE_REGEX.test(url)) return 'youtube'
  if (VIMEO_REGEX.test(url)) return 'vimeo'
  if (MP4_REGEX.test(url)) return 'mp4'
  return null
}

export function isValidVideoUrl(url: string): boolean {
  return getVideoType(url) !== null
}

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

export const videoUrlSchema = z.string().refine(isValidVideoUrl, {
  message: 'Invalid video URL. Use YouTube, Vimeo, or direct MP4 link.',
})