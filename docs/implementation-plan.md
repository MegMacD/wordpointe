# Implementation Plan

## Milestones
1) Database & Seed (Supabase)
- Create schema, indexes, triggers as per docs
- Load seed data (SQL via Supabase CLI)

2) Next.js App Skeleton
- App Router, Tailwind, basic layout and nav
- Server-only env config for Supabase client (service key not exposed)

3) API Routes (server)
- Implement endpoints from api-contract.md
- Add simple header-secret check for admin routes
- Compute points_awarded server-side (or enable DB trigger)

4) Core Screens
- Record page: user picker, item picker, first/repeat, submit; toasts
- Spend page: user picker, balance, amount, validation, undo
- Users list/detail

5) Admin Screens
- Memory items CRUD (toggle active)
- Settings: default points
- Reports: current points list with print/CSV export

6) Polish & QA
- Mobile optimizations, empty states, errors
- Basic accessibility, keyboard nav
- Loading states and optimistic updates where safe

## Tickets (suggested)
- DB: apply schema.sql and seed.sql
- DB: add partial unique index for first-only records
- API: users list/search
- API: create user
- API: memory items list/search
- API: create/update memory item
- API: record memory (first/repeat)
- API: list records
- API: spend points (with overspend guard)
- API: undo spend
- API: settings get/update
- UI: layout + nav
- UI: record page
- UI: spend page
- UI: users list/detail
- UI: memory items admin
- UI: settings admin
- UI: reports (current points + export)
- QA: mobile pass; accessibility; error handling

## Tech Notes
- Use Supabase JS on the server (route handlers) with service role key; use anon key on client for read-only as needed (or keep all write actions server-side).
- Prefer server actions or route handlers that call Supabase; do not expose secrets to the browser.
- Consider SWR/React Query for client data fetching; keep mutations as server POSTs.

