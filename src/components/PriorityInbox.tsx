/**
 * PriorityInbox.tsx
 *
 * Main container component that:
 *  - Fetches notifications on mount and on filter change
 *  - Computes total pages for pagination
 *  - Renders loading skeletons, error state, empty state, or the card list
 *  - Integrates FilterPanel on the side
 */

import React, { useCallback, useEffect, useState } from 'react';
import type { RankedNotification, FilterState } from '../types/notification';
import { fetchNotifications } from '../services/api';
import { Log } from '../services/logger';
import { NotificationCard } from './NotificationCard';
import { FilterPanel } from './FilterPanel';

// ── Loading skeleton ─────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-5 w-24 bg-gray-200 rounded-full" />
      <div className="h-5 w-16 bg-gray-200 rounded-full" />
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
    <div className="flex justify-between">
      <div className="h-3 w-28 bg-gray-200 rounded" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
    </div>
  </div>
);

// ── Legend chips ─────────────────────────────────────────────────────────────
const LEGEND = [
  { label: 'Placement', color: 'bg-[#10B981]' },
  { label: 'Result', color: 'bg-[#3B82F6]' },
  { label: 'Event', color: 'bg-[#8B5CF6]' },
];

export const PriorityInbox: React.FC = () => {
  const [notifications, setNotifications] = useState<RankedNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    limit: 10,
    page: 1,
    notification_type: '',
  });

  // We track total notifications fetched (before pagination slice) to derive pages
  // The API may return fewer items than limit on the last page.
  const [totalCount, setTotalCount] = useState<number>(0);
  const totalPages = filters.limit > 0 ? Math.ceil(totalCount / filters.limit) : 1;

  const load = useCallback(async (f: FilterState) => {
    Log('frontend', 'debug', 'PriorityInbox', 'Component fetch triggered');
    setLoading(true);
    setError(null);

    try {
      const data = await fetchNotifications(f);
      setNotifications(data);

      // Heuristic: if we got a full page, there may be more
      setTotalCount(data.length < f.limit ? (f.page - 1) * f.limit + data.length : f.page * f.limit + 1);
      Log('frontend', 'info', 'PriorityInbox', `Rendered ${data.length} ranked notifications`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load notifications: ${msg}`);
      Log('frontend', 'error', 'PriorityInbox', `Fetch failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    Log('frontend', 'debug', 'PriorityInbox', 'Component mounted');
    load(filters);
    return () => {
      Log('frontend', 'debug', 'PriorityInbox', 'Component unmounted');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = (newFilters: FilterState) => {
    setFilters(newFilters);
    load(newFilters);
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* ── Page description row ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {LEGEND.map(l => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`inline-block h-2 w-2 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400">
          Sorted by priority weight ↓
        </span>
      </div>

      {/* ── Main grid: filter sidebar + notification list ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

        {/* Sidebar */}
        <div className="lg:sticky lg:top-6 self-start">
          <FilterPanel
            filters={filters}
            totalPages={totalPages}
            onApply={handleApply}
          />
        </div>

        {/* Notification list */}
        <div className="flex flex-col gap-4">

          {/* ── Loading skeletons ── */}
          {loading && (
            <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading notifications">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && error && (
            <div
              role="alert"
              className="
                flex items-start gap-3 rounded-xl
                border border-red-200 bg-red-50
                px-5 py-4 text-sm text-red-700
              "
            >
              <span className="text-lg leading-none">⚠️</span>
              <div>
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1 text-xs text-red-600">{error}</p>
                <button
                  onClick={() => load(filters)}
                  className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <span className="text-5xl">📭</span>
              <p className="text-base font-semibold text-gray-600">No notifications found</p>
              <p className="text-sm text-gray-400">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )}

          {/* ── Notification cards ── */}
          {!loading && !error && notifications.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-medium">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
              {notifications.map(n => (
                <NotificationCard key={n.id} notification={n} />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
