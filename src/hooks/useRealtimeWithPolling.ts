import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

const POLL_INTERVAL = 3000

/** Types of database changes detected by Supabase Realtime. */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

/**
 * Payload from a Supabase Realtime change event.
 * @template T - The data type of the changed record
 */
export type RealtimeEvent<T> = {
  eventType: RealtimeEventType
  new?: T
  old?: T
}

type RealtimeOptions<T> = {
  /** The database table to subscribe to. */
  table: string
  /** Optional filter expression (e.g., 'id=eq.123'). */
  filter?: string
  /** Callback fired on database changes. */
  onEvent: (event: RealtimeEvent<T>) => void
  /** Enable polling fallback if realtime unavailable (default: true). */
  shouldPoll?: boolean
}

type UseRealtimeWithPollingReturn = {
  /** Call to immediately stop subscriptions and polling. */
  unsubscribe: () => void
}

/**
 * Subscribes to database changes with Supabase Realtime, falling back to polling if unavailable.
 * @template T - The data type of the table records
 * @param options - Configuration for the subscription
 * @returns Object with unsubscribe function
 */
export function useRealtimeWithPolling<T>({
  table,
  filter,
  onEvent,
  shouldPoll = true,
}: RealtimeOptions<T>): UseRealtimeWithPollingReturn {
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)
  const onEventRef = useRef(onEvent)

  // Keep callback ref up to date
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    // Create client inside effect to ensure it's created in browser context
    const supabase = createClient()

    const channel = supabase
      .channel(`realtime-${table}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => {
          if (!isActiveRef.current) return

          const eventType = payload.eventType as RealtimeEventType
          onEventRef.current({
            eventType,
            new: payload.new as T,
            old: payload.old as T,
          })
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] ${table} subscription status:`, status)

        if (status === 'CLOSED' && shouldPoll && !pollIntervalRef.current) {
          console.log(`[Realtime] ${table} unavailable - starting polling`)

          pollIntervalRef.current = setInterval(() => {
            if (document.visibilityState === 'visible' && isActiveRef.current) {
              onEventRef.current({ eventType: 'UPDATE' })
            }
          }, POLL_INTERVAL)
        }
      })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActiveRef.current) {
        console.log(`[Realtime] ${table} tab visible`)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isActiveRef.current = false
      channel.unsubscribe()
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [table, filter, shouldPoll])

  const unsubscribe = () => {
    isActiveRef.current = false
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  return { unsubscribe }
}

export { POLL_INTERVAL }