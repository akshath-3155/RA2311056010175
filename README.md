# Campus Notification Priority Inbox

A React 18 + TypeScript + Vite + Tailwind CSS application that fetches campus notifications from an evaluation service, ranks them by a weighted priority algorithm, and displays them in a clean, responsive Priority Inbox.

---

## ✨ Features

- **Priority Algorithm** — notifications ranked by type weight (Placement 3 > Result 2 > Event 1) + recency score
- **Filter Panel** — filter by type, limit top-N, paginate
- **Logging Middleware** — structured logs sent to `/logs` API and mirrored to browser console
- **Loading Skeletons** — polished loading state with animated placeholders
- **Error Handling** — user-friendly error card with retry
- **Responsive** — mobile → tablet → desktop (sidebar layout on large screens)

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
npm install
npm run dev          # opens http://localhost:3000 automatically
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── NotificationCard.tsx   # Single notification with type badge & weight badge
│   ├── FilterPanel.tsx        # Sidebar filters (type, limit, pagination)
│   └── PriorityInbox.tsx      # Main container — fetch, rank, render
├── services/
│   ├── api.ts                 # fetchNotifications() + priority weight algorithm
│   └── logger.ts              # Log(stack, level, pkg, message) middleware
├── types/
│   └── notification.ts        # TypeScript interfaces
├── App.tsx                    # Root layout (header, hero, main, footer)
├── main.tsx                   # ReactDOM entry point
└── index.css                  # Tailwind CSS v4 import + global resets
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_API_BASE_URL=http://20.207.122.201/evaluation-service
VITE_CLIENT_ID=<your_client_id>
VITE_CLIENT_SECRET=<your_client_secret>
VITE_ACCESS_TOKEN=<your_access_token>
```

---

## ⚖️ Priority Algorithm

```
weight = (3 × is_placement) + (2 × is_result) + (1 × is_event) + recency_score
```

Where `recency_score ∈ [0, 1]` is normalised across the fetched batch (newest = 1).

See **notification_system_design.md** for detailed examples.

---

## 🪵 Logging Middleware

`logger.ts` exports a single function:

```ts
Log(stack: 'frontend', level: LogLevel, pkg: string, message: string): Promise<void>
```

- Mirrors to `console` immediately
- POSTs to `POST /logs` (fire-and-forget, never throws)
- Integrated at: fetch start, fetch success, fetch error, filter apply, mount/unmount

---

## 🎨 Colour Guide

| Type      | Colour    |
|-----------|-----------|
| Placement | `#10B981` |
| Result    | `#3B82F6` |
| Event     | `#8B5CF6` |
