import { describe, it, expect } from 'vitest'
import { getVideoType, isValidVideoUrl, getVideoId, getEmbedUrl } from '@/lib/video'
import { VideoType } from '@/lib/enums'
import { faker } from '@faker-js/faker'

describe('getVideoType', () => {
  describe('YouTube URLs', () => {
    it('should detect standard YouTube watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      expect(getVideoType(url)).toBe('youtube')
    })

    it('should detect YouTube short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      expect(getVideoType(url)).toBe('youtube')
    })

    it('should detect YouTube embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      expect(getVideoType(url)).toBe('youtube')
    })

    it('should detect YouTube URL with additional parameters', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s'
      expect(getVideoType(url)).toBe('youtube')
    })

    it('should return null for invalid YouTube URL', () => {
      const url = 'https://www.youtube.com/invalid'
      expect(getVideoType(url)).toBeNull()
    })

    it('should return null for URL with invalid video ID length', () => {
      const url = 'https://www.youtube.com/watch?v=short'
      expect(getVideoType(url)).toBeNull()
    })
  })

  describe('Vimeo URLs', () => {
    it('should detect standard Vimeo URL', () => {
      const url = 'https://vimeo.com/123456789'
      expect(getVideoType(url)).toBe('vimeo')
    })

    it('should detect Vimeo player URL', () => {
      const url = 'https://player.vimeo.com/video/123456789'
      expect(getVideoType(url)).toBe('vimeo')
    })

    it('should return null for invalid Vimeo URL', () => {
      const url = 'https://vimeo.com/invalid'
      expect(getVideoType(url)).toBeNull()
    })

    it('should detect Vimeo URL with string ID (invalid but matches pattern)', () => {
      // Note: The regex \d+ requires digits, so this should be null
      const url = 'https://vimeo.com/abcdef'
      expect(getVideoType(url)).toBeNull()
    })
  })

  describe('MP4 URLs', () => {
    it('should detect MP4 URL with .mp4 extension', () => {
      const url = 'https://example.com/video.mp4'
      expect(getVideoType(url)).toBe('mp4')
    })

    it('should detect MP4 URL with query parameters', () => {
      const url = 'https://example.com/video.mp4?token=abc123'
      expect(getVideoType(url)).toBe('mp4')
    })

    it('should detect MP4 URL with fragments', () => {
      const url = 'https://example.com/video.mp4#t=10'
      expect(getVideoType(url)).toBe('mp4')
    })

    it('should return null for non-MP4 video file', () => {
      const url = 'https://example.com/video.avi'
      expect(getVideoType(url)).toBeNull()
    })

    it('should be case insensitive for .mp4 extension', () => {
      const url = 'https://example.com/video.MP4'
      expect(getVideoType(url)).toBe('mp4')
    })
  })

  describe('Unsupported URLs', () => {
    it('should return null for random HTTP URL', () => {
      const url = faker.internet.url()
      // Only return null if it's not a YouTube, Vimeo, or MP4 URL
      if (!url.includes('youtube') && !url.includes('vimeo') && !url.endsWith('.mp4')) {
        expect(getVideoType(url)).toBeNull()
      }
    })

    it('should return null for invalid URL', () => {
      const url = 'not-a-url'
      expect(getVideoType(url)).toBeNull()
    })
  })
})

describe('isValidVideoUrl', () => {
  it('should return true for valid YouTube URL', () => {
    expect(isValidVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
  })

  it('should return true for valid Vimeo URL', () => {
    expect(isValidVideoUrl('https://vimeo.com/123456789')).toBe(true)
  })

  it('should return true for valid MP4 URL', () => {
    expect(isValidVideoUrl('https://example.com/video.mp4')).toBe(true)
  })

  it('should return false for invalid URL', () => {
    expect(isValidVideoUrl('https://example.com/not-a-video')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isValidVideoUrl('')).toBe(false)
  })
})

describe('getVideoId', () => {
  describe('YouTube', () => {
    it('should extract ID from standard watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      expect(getVideoId(url, VideoType.YouTube)).toBe('dQw4w9WgXcQ')
    })

    it('should extract ID from short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      expect(getVideoId(url, VideoType.YouTube)).toBe('dQw4w9WgXcQ')
    })

    it('should extract ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      expect(getVideoId(url, VideoType.YouTube)).toBe('dQw4w9WgXcQ')
    })

    it('should return null for invalid YouTube URL with correct type', () => {
      const url = 'https://www.youtube.com/invalid'
      expect(getVideoId(url, VideoType.YouTube)).toBeNull()
    })
  })

  describe('Vimeo', () => {
    it('should extract ID from standard URL', () => {
      const url = 'https://vimeo.com/123456789'
      expect(getVideoId(url, VideoType.Vimeo)).toBe('123456789')
    })

    it('should extract ID from player URL', () => {
      const url = 'https://player.vimeo.com/video/123456789'
      expect(getVideoId(url, VideoType.Vimeo)).toBe('123456789')
    })
  })

  describe('MP4', () => {
    it('should return the full URL as ID', () => {
      const url = 'https://example.com/video.mp4'
      expect(getVideoId(url, VideoType.MP4)).toBe(url)
    })
  })

  describe('Invalid type', () => {
    it('should return null for unknown type', () => {
      const url = 'https://example.com/video.mp4'
      expect(getVideoId(url, 'invalid' as VideoType)).toBeNull()
    })
  })
})

describe('getEmbedUrl', () => {
  describe('YouTube', () => {
    it('should generate correct embed URL from watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      expect(getEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    })

    it('should generate correct embed URL from short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      expect(getEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    })

    it('should generate correct embed URL from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      expect(getEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    })
  })

  describe('Vimeo', () => {
    it('should generate correct embed URL', () => {
      const url = 'https://vimeo.com/123456789'
      expect(getEmbedUrl(url)).toBe('https://player.vimeo.com/video/123456789')
    })

    it('should generate correct embed URL from player URL', () => {
      const url = 'https://player.vimeo.com/video/123456789'
      expect(getEmbedUrl(url)).toBe('https://player.vimeo.com/video/123456789')
    })
  })

  describe('MP4', () => {
    it('should return URL for http MP4', () => {
      const url = 'http://example.com/video.mp4'
      expect(getEmbedUrl(url)).toBe(url)
    })

    it('should return URL for https MP4', () => {
      const url = 'https://example.com/video.mp4'
      expect(getEmbedUrl(url)).toBe(url)
    })

    it('should return null for javascript: protocol', () => {
      const url = 'javascript:alert("xss")'
      expect(getEmbedUrl(url)).toBeNull()
    })

    it('should return null for invalid URL', () => {
      const url = 'not-a-valid-url'
      expect(getEmbedUrl(url)).toBeNull()
    })
  })

  describe('Invalid URLs', () => {
    it('should return null for unsupported URL', () => {
      const url = 'https://example.com/not-a-video'
      expect(getEmbedUrl(url)).toBeNull()
    })
  })
})
