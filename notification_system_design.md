# Campus Notification Priority Inbox — System Design Document

## 1. System Architecture Overview

### 1.1 Frontend Components Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Header (sticky) — branding + type legend           │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  Hero Strip — gradient banner                       │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                 PriorityInbox.tsx                   │    │
│  │  ┌──────────────────┐  ┌───────────────────────┐    │    │
│  │  │  FilterPanel.tsx │  │  NotificationCard.tsx  │   │    │
│  │  │  - Type select   │  │  (rendered N times)    │   │    │
│  │  │  - Limit input   │  │  - Type badge          │   │    │
│  │  │  - Pagination    │  │  - Weight badge        │   │    │
│  │  │  - Apply/Clear   │  │  - Message body        │   │    │
│  │  └──────────────────┘  │  - Timestamp footer    │   │    │
│  │                        └───────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Footer                                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 API Integration Flow

```
User Action (page load / Apply button)
        │
        ▼
PriorityInbox.load()
        │
        ▼
services/api.ts :: fetchNotifications(params)
        │  ── Log("info", "Fetching notifications with params: {...}")
        │
        ├── GET /notifications?limit=N&page=P[&notification_type=T]
        │       Authorization: Bearer <ACCESS_TOKEN>
        │
        ▼
Raw Notification[] from API
        │
        ├── computeRecencyScores()  — normalise timestamps → [0,1]
        ├── computeWeight()         — type weight + recency
        └── .sort((a,b) => b.weight - a.weight)
        │
        ▼
        │  ── Log("info", "Received X notifications")
        ▼
RankedNotification[] → React state → render NotificationCard × N
```

### 1.3 Logging Middleware Flow

```
Any component / service
        │
        ▼
Log(stack="frontend", level, pkg, message)
        │
        ├──▶ console.[debug|info|warn|error]()   (always, instant)
        │
        └──▶ POST /logs
                { stack, level, package, message }
                Authorization: Bearer <token>
                (fire-and-forget — errors swallowed silently)
```

---

## 2. Priority Algorithm Explanation

### 2.1 Weight Calculation Formula

```
weight = (placement_weight × is_placement)
       + (result_weight    × is_result)
       + (event_weight     × is_event)
       + recency_score
```

| Parameter          | Value |
|--------------------|-------|
| `placement_weight` | **3** |
| `result_weight`    | **2** |
| `event_weight`     | **1** |
| `recency_score`    | [0, 1] |

### 2.2 Recency Scoring Logic

Given a batch of N notifications with timestamps `t₁ … tₙ`:

```
range     = max(tᵢ) − min(tᵢ)          (milliseconds)
recency_i = (tᵢ − min(tᵢ)) / range     ∈ [0, 1]
```

- The **newest** notification receives `recency = 1.0`
- The **oldest** notification receives `recency = 0.0`
- When only one notification exists, `recency = 1.0` (degenerate case handled)

### 2.3 Example Calculations

| ID | Type      | Timestamp (offset from oldest) | Recency | Type Weight | **Weight** |
|----|-----------|--------------------------------|---------|-------------|------------|
| A  | Placement | +0 min (oldest)                | 0.00    | 3           | **3.00**   |
| B  | Result    | +30 min                        | 0.50    | 2           | **2.50**   |
| C  | Placement | +60 min (newest)               | 1.00    | 3           | **4.00**   |
| D  | Event     | +45 min                        | 0.75    | 1           | **1.75**   |

Sorted order: **C (4.00) → A (3.00) → B (2.50) → D (1.75)**

Observation: A recent Result can outrank an old Placement once recency is factored in.

---

## 3. Component Hierarchy

```
App
└── PriorityInbox
    ├── FilterPanel
    │   ├── <select> notification_type
    │   ├── <input>  limit
    │   ├── Pagination controls (Prev / Page / Next)
    │   └── Apply / Clear buttons
    └── NotificationCard × N
        ├── Type badge (coloured pill)
        ├── Weight badge (score)
        ├── Message paragraph
        └── Footer (ID + timestamp)
```

---

## 4. API Endpoints Used

| Method | Endpoint                     | Purpose                       |
|--------|------------------------------|-------------------------------|
| GET    | `/notifications`             | Fetch paginated notifications |
| POST   | `/logs`                      | Send structured log entries   |

### GET `/notifications` Query Parameters

| Param               | Default | Description                            |
|---------------------|---------|----------------------------------------|
| `limit`             | 10      | Max notifications to return            |
| `page`              | 1       | Page index (1-based)                   |
| `notification_type` | (all)   | Filter: `Event`, `Result`, `Placement` |

### POST `/logs` Request Body

```json
{
  "stack":   "frontend",
  "level":   "info",
  "package": "PriorityInbox",
  "message": "Rendered 8 ranked notifications"
}
```

---

## 5. State Management Strategy

This application uses **local React state only** (no Redux / Zustand / Context) because:

- The data dependency graph is simple and linear.
- A single top-level `PriorityInbox` owns `notifications`, `loading`, `error`, and `filters`.
- `FilterPanel` receives a draft copy and calls `onApply` — avoiding unnecessary re-renders during typing.
- No cross-cutting state is needed between unrelated subtrees.

### State Shape (PriorityInbox)

```ts
notifications : RankedNotification[]   // sorted result set
loading       : boolean                // controls skeleton visibility
error         : string | null          // user-facing error message
filters       : FilterState            // active query params
totalCount    : number                 // heuristic for page count
```

---

## 6. Error Handling Approach

| Layer             | Strategy                                                           |
|-------------------|--------------------------------------------------------------------|
| **Network**       | Axios `timeout: 10000`. Non-2xx → exception thrown.                |
| **API service**   | `try/catch` logs the error then re-throws to caller.               |
| **PriorityInbox** | Sets `error` state → renders a friendly error card with **Retry**. |
| **Logger**        | `try/catch` around POST /logs; swallowed silently (never breaks UI).|
| **Token missing** | Guard in `api.ts`; logs `fatal` and throws immediately.            |

---

## 7. Colour System

| Type       | Accent Colour | Tailwind Class        |
|------------|---------------|-----------------------|
| Placement  | `#10B981`     | `border-l-[#10B981]`  |
| Result     | `#3B82F6`     | `border-l-[#3B82F6]`  |
| Event      | `#8B5CF6`     | `border-l-[#8B5CF6]`  |

Weight badge colours escalate with urgency:
- `weight ≥ 3.5` → red
- `weight ≥ 2.5` → orange
- `weight ≥ 1.5` → yellow
- otherwise → gray
