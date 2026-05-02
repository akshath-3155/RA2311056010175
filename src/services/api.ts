/**
 * api.ts — Notification API Service
 *
 * Provides fetchNotifications() which:
 *   1. Obtains a valid Bearer token (auto-refreshes if expired)
 *   2. Calls GET /notifications with query params
 *   3. Computes priority weight for each notification
 *   4. Returns notifications sorted by weight (descending)
 *
 * Priority Algorithm:
 *   weight = (placement_weight × is_placement)
 *          + (result_weight    × is_result)
 *          + (event_weight     × is_event)
 *          + recency_score
 *
 * Weights:  Placement = 3 | Result = 2 | Event = 1
 * Recency:  Normalised score in [0, 1] — newest notification = 1
 */

import axios from 'axios';
import type {
  Notification,
  RankedNotification,
  FetchNotificationsParams,
  NotificationsResponse,
} from '../types/notification';
import { Log } from './logger';
import { getToken } from './tokenManager';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ── Priority constants ───────────────────────────────────────────────────────
const PLACEMENT_WEIGHT = 3;
const RESULT_WEIGHT = 2;
const EVENT_WEIGHT = 1;

/**
 * Calculate a recency score in [0, 1].
 * The newest item in the array receives 1.0; the oldest receives 0.0.
 * When there is only one notification, the score is 1.0.
 */
function computeRecencyScores(notifications: Notification[]): Map<string, number> {
  if (notifications.length === 0) return new Map();

  const timestamps = notifications.map(n => new Date(n.Timestamp).getTime());
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);
  const range = maxTs - minTs || 1; // avoid division by zero

  const scores = new Map<string, number>();
  notifications.forEach(n => {
    const ts = new Date(n.Timestamp).getTime();
    scores.set(n.ID, (ts - minTs) / range);
  });
  return scores;
}

/**
 * Compute the final priority weight for a single notification.
 */
function computeWeight(n: Notification, recency: number): number {
  const isPlacement = n.Type === 'Placement' ? 1 : 0;
  const isResult    = n.Type === 'Result'    ? 1 : 0;
  const isEvent     = n.Type === 'Event'     ? 1 : 0;

  return (
    PLACEMENT_WEIGHT * isPlacement +
    RESULT_WEIGHT    * isResult    +
    EVENT_WEIGHT     * isEvent     +
    recency
  );
}

/**
 * Fetch and rank notifications from the evaluation service.
 * Automatically refreshes the Bearer token when needed.
 */
export async function fetchNotifications(
  params: FetchNotificationsParams,
): Promise<RankedNotification[]> {
  await Log('frontend', 'info', 'api', `Fetching notifications with params: ${JSON.stringify(params)}`);

  // Build query string — omit empty notification_type
  const query: Record<string, string | number> = {
    limit: params.limit,
    page: params.page,
  };
  if (params.notification_type) {
    query.notification_type = params.notification_type;
  }

  try {
    // Auto-refresh token if expired
    const token = await getToken();

    const response = await axios.get<NotificationsResponse>(`${BASE_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: query,
      timeout: 10000,
    });

    const raw: Notification[] = response.data.notifications || [];
    await Log('frontend', 'info', 'api', `Received ${raw.length} notifications`);

    // Compute recency scores across the full result set
    const recencyMap = computeRecencyScores(raw);

    // Enrich with weight and sort descending
    const ranked: RankedNotification[] = raw
      .map(n => ({
        ...n,
        weight: computeWeight(n, recencyMap.get(n.ID) ?? 0),
      }))
      .sort((a, b) => b.weight - a.weight);

    return ranked;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await Log('frontend', 'error', 'api', `API error: ${msg}`);
    throw err;
  }
}
