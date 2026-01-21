# API Contract (Next.js App Router)

Notes
- Server-only routes; protect admin actions via a shared header secret (MVP) or Supabase RLS + auth later.
- All responses are JSON unless noted. Error responses: { error: string } with appropriate status.

## Security (MVP)
- Header: X-Admin-Secret: <secret> required for admin routes (create/update/delete, spending).
- Read-only routes may be open or gated; start simple and tighten later with RLS.

## Users
GET /api/users
- Query: q (optional search by name), page, pageSize
- 200: { items: UserSummary[], total: number }

POST /api/users  (admin)
- Body: { name: string, is_leader?: boolean, notes?: string }
- 201: User

GET /api/users/:id
- 200: UserWithPoints { user, current_points, history?: optional }

PATCH /api/users/:id  (admin)
- Body: partial User
- 200: User

## Memory Items
GET /api/memory-items
- Query: active?: boolean, type?: 'verse'|'custom', q?: string
- 200: { items: MemoryItem[], total: number }

POST /api/memory-items  (admin)
- Body: { type, reference, text?, points_first?, points_repeat?, active? }
- 201: MemoryItem

PATCH /api/memory-items/:id  (admin)
- Body: partial MemoryItem
- 200: MemoryItem

## Verse Records
POST /api/records  (admin)
- Body: { user_id: uuid, memory_item_id: uuid, record_type: 'first'|'repeat' }
- 201: VerseRecord (server/DB computes points_awarded if trigger enabled; else backend sets from memory_items)

GET /api/records
- Query: user_id?: uuid, memory_item_id?: uuid, since?: ISO date
- 200: { items: VerseRecord[], total: number }

## Spend Records
POST /api/spend  (admin)
- Body: { user_id: uuid, points_spent: number, note?: string }
- 201: SpendRecord (reject if points_spent > current_points)

POST /api/spend/:id/undo  (admin)
- 200: SpendRecord { undone: true }

GET /api/spend
- Query: user_id?: uuid, since?: ISO date, undone?: boolean
- 200: { items: SpendRecord[], total: number }

## Settings
GET /api/settings
- 200: Settings

PATCH /api/settings  (admin)
- Body: partial Settings
- 200: Settings

## Types (shape)
User { id, name, is_leader, notes, created_at, updated_at }
UserSummary { id, name, is_leader, current_points }
MemoryItem { id, type, reference, text?, points_first, points_repeat, active, created_at, updated_at }
VerseRecord { id, user_id, memory_item_id, record_type, points_awarded, recorded_at }
SpendRecord { id, user_id, points_spent, note?, spent_at, undone }
Settings { default_points_first, default_points_repeat }

## Errors
- 400: validation (missing fields, overspend)
- 401/403: missing/invalid admin secret
- 404: not found
- 409: conflict (duplicate first record)
- 500: unexpected

## Notes
- Prefer server-side computation for points_awarded to avoid client mistakes.
- Pagination default: pageSize=20; cap at 100.
- Export endpoints can return CSV with text/csv content-type (future).

