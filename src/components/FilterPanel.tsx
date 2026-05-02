/**
 * FilterPanel.tsx
 *
 * Provides controls for:
 *  - notification_type filter (All | Event | Result | Placement)
 *  - limit (top-n) input
 *  - page selector
 *  - Apply / Clear buttons
 *
 * Calls onApply with the new FilterState when the user presses "Apply".
 * Logs filter actions via the logging middleware.
 */

import React, { useState } from 'react';
import type { FilterState, NotificationType } from '../types/notification';
import { Log } from '../services/logger';

const TYPE_OPTIONS: { label: string; value: NotificationType | '' }[] = [
  { label: 'All Types', value: '' },
  { label: 'Placement', value: 'Placement' },
  { label: 'Result', value: 'Result' },
  { label: 'Event', value: 'Event' },
];

interface FilterPanelProps {
  filters: FilterState;
  totalPages: number;
  onApply: (filters: FilterState) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  totalPages,
  onApply,
}) => {
  // Local draft  only committed on "Apply"
  const [draft, setDraft] = useState<FilterState>(filters);

  const handleApply = () => {
    Log('frontend', 'debug', 'FilterPanel', `Applied filters: ${JSON.stringify(draft)}`);
    onApply(draft);
  };

  const handleClear = () => {
    const defaultFilters: FilterState = { limit: 10, page: 1, notification_type: '' };
    setDraft(defaultFilters);
    Log('frontend', 'debug', 'FilterPanel', 'Cleared filters');
    onApply(defaultFilters);
  };

  const inputCls = `
    w-full rounded-lg border border-gray-200
    bg-white px-3 py-2
    text-sm text-gray-800 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
    transition
  `;

  return (
    <aside
      aria-label="Filter panel"
      className="
        bg-white border border-gray-100 rounded-2xl
        shadow-sm p-5 flex flex-col gap-5
      "
    >
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">
        Filters
      </h2>

      {/*  Type filter  */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-type" className="text-xs font-medium text-gray-500">
          Notification Type
        </label>
        <select
          id="filter-type"
          value={draft.notification_type}
          onChange={e =>
            setDraft(d => ({
              ...d,
              notification_type: e.target.value as NotificationType | '',
              page: 1,
            }))
          }
          className={inputCls}
        >
          {TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/*  Limit (top-n)  */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-limit" className="text-xs font-medium text-gray-500">
          Show top N
        </label>
        <input
          id="filter-limit"
          type="number"
          min={1}
          max={100}
          value={draft.limit}
          onChange={e =>
            setDraft(d => ({ ...d, limit: Math.max(1, Number(e.target.value)), page: 1 }))
          }
          className={inputCls}
        />
      </div>

      {/*  Pagination  */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Page</span>
        <div className="flex items-center gap-2">
          <button
            id="page-prev"
            disabled={draft.page <= 1}
            onClick={() => setDraft(d => ({ ...d, page: Math.max(1, d.page - 1) }))}
            className="
              flex-1 rounded-lg border border-gray-200
              py-2 text-sm font-medium text-gray-600
              hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
             Prev
          </button>
          <span className="min-w-[3rem] text-center text-sm font-semibold text-gray-800">
            {draft.page}{totalPages > 0 ? `/${totalPages}` : ''}
          </span>
          <button
            id="page-next"
            disabled={totalPages > 0 && draft.page >= totalPages}
            onClick={() => setDraft(d => ({ ...d, page: d.page + 1 }))}
            className="
              flex-1 rounded-lg border border-gray-200
              py-2 text-sm font-medium text-gray-600
              hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            Next 
          </button>
        </div>
      </div>

      {/*  Actions  */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          id="apply-filters"
          onClick={handleApply}
          className="
            w-full rounded-lg bg-indigo-600 px-4 py-2.5
            text-sm font-semibold text-white
            hover:bg-indigo-700 active:scale-[0.98]
            transition-all duration-150
          "
        >
          Apply Filters
        </button>
        <button
          id="clear-filters"
          onClick={handleClear}
          className="
            w-full rounded-lg border border-gray-200 px-4 py-2.5
            text-sm font-medium text-gray-600
            hover:bg-gray-50 active:scale-[0.98]
            transition-all duration-150
          "
        >
          Clear Filters
        </button>
      </div>
    </aside>
  );
};

