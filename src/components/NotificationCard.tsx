/**
 * NotificationCard.tsx
 *
 * Renders a single prioritised notification with:
 *  - Colour-coded left border per type
 *  - Priority weight badge
 *  - Human-readable timestamp
 */

import React from 'react';
import type { RankedNotification, NotificationType } from '../types/notification';

//  Colour palette per notification type 
const TYPE_CONFIG: Record<
  NotificationType,
  { border: string; badge: string; badgeText: string; dot: string }
> = {
  Placement: {
    border: 'border-l-[#10B981]',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    badgeText: 'Placement',
    dot: 'bg-[#10B981]',
  },
  Result: {
    border: 'border-l-[#3B82F6]',
    badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    badgeText: 'Result',
    dot: 'bg-[#3B82F6]',
  },
  Event: {
    border: 'border-l-[#8B5CF6]',
    badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    badgeText: 'Event',
    dot: 'bg-[#8B5CF6]',
  },
};

/** Format ISO timestamp to a friendly local string */
function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Colour the weight badge based on urgency */
function weightBadgeClass(weight: number): string {
  if (weight >= 3.5) return 'bg-red-100 text-red-700';
  if (weight >= 2.5) return 'bg-orange-100 text-orange-700';
  if (weight >= 1.5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
}

interface NotificationCardProps {
  notification: RankedNotification;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
  const { ID: id, Type: notification_type, Message: message, Timestamp: createdAt, weight } = notification;
  const cfg = TYPE_CONFIG[notification_type] ?? TYPE_CONFIG.Event;

  return (
    <article
      id={`notification-${id}`}
      className={`
        relative flex flex-col gap-3
        bg-white rounded-xl
        border border-gray-100 border-l-4 ${cfg.border}
        px-5 py-4
        shadow-sm hover:shadow-md
        transition-shadow duration-200
      `}
    >
      {/*  Header row  */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Type badge */}
        <span
          className={`
            inline-flex items-center gap-1.5
            rounded-full px-2.5 py-0.5
            text-xs font-medium ring-1 ring-inset
            ${cfg.badge}
          `}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.badgeText}
        </span>

        {/* Priority weight badge */}
        <span
          title={`Priority weight: ${weight.toFixed(2)}`}
          className={`
            inline-flex items-center gap-1
            rounded-full px-2.5 py-0.5
            text-xs font-semibold
            ${weightBadgeClass(weight)}
          `}
        >
           {weight.toFixed(2)}
        </span>
      </div>

      {/*  Message  */}
      <p className="text-sm text-gray-800 leading-relaxed">{message}</p>

      {/*  Footer row  */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-mono">ID: {id}</span>
        <time dateTime={createdAt}>{formatDate(createdAt)}</time>
      </div>
    </article>
  );
};

