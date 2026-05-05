/**
 * Application-wide constants
 */

import { DBColumn } from "./enums"

export const POLL_INTERVAL = 3000 // Polling interval in milliseconds

export const REALTIME_CHANNEL_NAME = 'content-updates' as const

export const SELECT_CONTENT_ALL = `${DBColumn.Id}, ${DBColumn.Title}, ${DBColumn.VideoUrl}, ${DBColumn.Status}, ${DBColumn.CreatedAt}, ${DBColumn.ShareToken}, ${DBColumn.ClientName}, ${DBColumn.ClientEmail}, ${DBColumn.ClientFeedback}`

export const SELECT_CONTENT_STATUS = `${DBColumn.Id}, ${DBColumn.Status}`