/**
 * App.tsx — Root component
 *
 * Renders the global layout:
 *  - Sticky header with branding
 *  - PriorityInbox main content
 *  - Minimal footer
 */

import React from 'react';
import { PriorityInbox } from './components/PriorityInbox';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] font-[Inter,sans-serif]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Campus Notifications
              </h1>
              <p className="text-xs text-gray-500 font-medium leading-tight">
                Priority Inbox
              </p>
            </div>
          </div>

          {/* Legend / status chips */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20">
              Placement
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20">
              Result
            </span>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-600/20">
              Event
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-2xl font-bold">Your Priority Inbox</p>
          <p className="mt-1 text-sm text-indigo-100">
            Notifications ranked by urgency — Placements first, then Results, then Events.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <main>
        <PriorityInbox />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
          Campus Notification Priority Inbox &mdash; Powered by Afford Medical Technologies
        </div>
      </footer>
    </div>
  );
};

export default App;
