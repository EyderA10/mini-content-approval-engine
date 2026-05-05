/** Unified enum for content status (also serves as action type) */
export enum ContentStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

/** Video platform types */
export enum VideoType {
  YouTube = 'youtube',
  Vimeo = 'vimeo',
  MP4 = 'mp4',
}

/** Supabase Realtime event types */
export enum RealtimeEventType {
  Insert = 'INSERT',
  Update = 'UPDATE',
  Delete = 'DELETE',
}

/** Realtime subscription status */
export enum SubscriptionStatus {
  Subscribed = 'SUBSCRIBED',
  ChannelError = 'CHANNEL_ERROR',
  TimedOut = 'TIMED_OUT',
  Closed = 'CLOSED',
}

/** Supabase database identifiers */
export enum DBTable {
  ContentPieces = 'content_pieces',
}

export enum DBColumn {
  Id = 'id',
  Title = 'title',
  VideoUrl = 'video_url',
  Status = 'status',
  CreatedAt = 'created_at',
  ShareToken = 'share_token',
  ClientName = 'client_name',
  ClientEmail = 'client_email',
  ClientFeedback = 'client_feedback',
  UpdatedAt = 'updated_at',
}

export enum DBSchema {
  Public = 'public',
}

export enum DBErrorCode {
  NoRowsFound = 'PGRST116',
}
