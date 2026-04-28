import { getEmbedUrl, getVideoType } from '@/lib/video'

type VideoPlayerProps = {
  /** The video URL to embed (YouTube, Vimeo, or MP4). */
  url: string
}

/**
 * Embeds a video from YouTube, Vimeo, or direct MP4 URL.
 * Renders an iframe for YouTube/Vimeo, or a video element for MP4.
 */
export function VideoPlayer({ url }: VideoPlayerProps) {
  const videoType = getVideoType(url)
  const embedUrl = getEmbedUrl(url)

  if (!videoType || !embedUrl) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl bg-background-warm border border-border">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-error-subtle">
            <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-foreground-muted">Invalid video URL</p>
        </div>
      </div>
    )
  }

  if (videoType === 'mp4') {
    return (
      <div className="relative overflow-hidden rounded-xl shadow-lg shadow-black/10">
        <video
          src={embedUrl}
          controls
          className="w-full"
          style={{ maxHeight: '70vh' }}
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg shadow-black/10">
      <div className="absolute inset-0 bg-background-warm" />
      <iframe
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="relative w-full aspect-video"
        style={{ maxHeight: '70vh' }}
      />
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-xl" />
    </div>
  )
}