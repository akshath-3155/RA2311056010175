// Notification type definitions for the Campus Priority Inbox

export type NotificationType = 'Event' | 'Result' | 'Placement';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Raw notification shape returned by the API (PascalCase fields) */
export interface Notification {
  /** Unique identifier */
  ID: string;
  /** Category of notification */
  Type: NotificationType;
  /** The notification body text */
  Message: string;
  /** Timestamp string e.g. "2026-05-02 06:40:21" */
  Timestamp: string;
}

/** Wrapped response envelope from GET /notifications */
export interface NotificationsResponse {
  notifications: Notification[];
}

/** Notification enriched with a computed priority weight */
export interface RankedNotification extends Notification {
  /** Computed priority score (higher = more urgent) */
  weight: number;
}

/** Query params for the GET /notifications endpoint */
export interface FetchNotificationsParams {
  limit: number;   // must be >= 5 per API validation
  page: number;
  notification_type?: NotificationType | '';
}

/** State held by the FilterPanel */
export interface FilterState {
  limit: number;
  page: number;
  notification_type: NotificationType | '';
}
