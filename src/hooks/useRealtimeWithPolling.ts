import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { RealtimeEventType, SubscriptionStatus, DBSchema } from '@/lib/enums'

/**
 * Payload from a Supabase Realtime change event.
 * @template T - The data type of the changed record
 */
export type RealtimeEvent<T> = {
  eventType: RealtimeEventType
  new?: T
  old?: T
}

type UseRealtimeWithPollingReturn = {
  /** Call to unsubscribe from realtime channel. */
  unsubscribe: () => void
  /** Current subscription status. */
  status: SubscriptionStatus
  /** True when subscription is actively connected. */
  isSubscribed: boolean
}

/**
 * Subscribes to database changes via Supabase Realtime.
 * Uses real-time events only (no polling).
 */
export function useRealtimeWithPolling<T>({
  table,
  filter,
  channelName,
  onEvent,
}: {
  table: string
  filter?: string
  channelName?: string
  onEvent: (event: RealtimeEvent<T>) => void
}): UseRealtimeWithPollingReturn {
  const [status, setStatus] = useState(SubscriptionStatus.Closed)
  const isActiveRef = useRef(true)
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    isActiveRef.current = true
    const supabase = createClient()

    const channel = supabase
      .channel(channelName || `realtime-${table}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: DBSchema.Public, table, filter },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (!isActiveRef.current) return

          const eventType = payload.eventType as RealtimeEventType
          onEventRef.current({
            eventType,
            new: payload.new as T | undefined,
            old: payload.old as T | undefined,
          })
        }
      )
      .subscribe((status: string) => {
        if (!isActiveRef.current) return

        if (status === SubscriptionStatus.Subscribed) {
          setStatus(SubscriptionStatus.Subscribed)
        } else if (status === SubscriptionStatus.ChannelError) {
          logger.error(`[Realtime] Channel error for table: ${table}`)
          setStatus(SubscriptionStatus.ChannelError)
        } else if (status === SubscriptionStatus.TimedOut) {
          logger.warn('[Realtime] Subscription timed out for table:', table)
          setStatus(SubscriptionStatus.TimedOut)
        } else if (status === SubscriptionStatus.Closed) {
          setStatus(SubscriptionStatus.Closed)
        }
      })

    return () => {
      isActiveRef.current = false
      supabase.removeChannel(channel)
    }
  }, [table, filter, channelName])

  const unsubscribe = useCallback(() => {
    isActiveRef.current = false
  }, [])

  return {
    unsubscribe,
    status,
    isSubscribed: status === SubscriptionStatus.Subscribed,
  }
}