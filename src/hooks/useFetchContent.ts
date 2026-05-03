import { useEffect, useState, Dispatch, SetStateAction } from 'react'
import axios from 'axios'
import { ContentPiece } from '@/lib/validators'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

/**
 * Fetches content pieces from the API on mount.
 * Uses the ignore flag pattern to prevent race conditions.
 * @returns Object containing items, isLoading state, and setItems dispatcher
 */
export function useFetchContent(): {
  items: ContentPiece[]
  isLoading: boolean
  setItems: Dispatch<SetStateAction<ContentPiece[]>>
} {
  const [items, setItems] = useState<ContentPiece[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    const fetchContent = async () => {
      try {
        const response = await axios.get('/api/content')
        if (!ignore) {
          setItems(response.data)
        }
      } catch (error) {
        logger.error('[Dashboard] Failed to fetch content:', error)
        toast.error('Failed to load content')
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchContent()

    return () => {
      ignore = true
    }
  }, [])

  return { items, isLoading, setItems }
}
