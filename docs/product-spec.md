# Word Pointe – Product Spec (MVP)

## Purpose
Help leaders at North Pointe quickly record kids' memory work, award points automatically, and manage simple spending of points, shared across multiple leaders on phones/tablets.

## Personas
- Leader: records verses, views/adjusts points, spends points, adds kids on the fly.
- Admin Leader: everything a Leader does, plus manages memory items, default point values, and simple reports/exports.

## Scope (MVP)
- Users: unified `users` table with `is_leader` flag (leaders can also memorize).
- Memory Items: curated list of accepted items (verses and custom items like “Books of the NT”).
- Recording: record a memory item for a user as `first` or `repeat`; auto-award points per configured values.
- Spending: deduct points via a dedicated spend flow; cannot spend more than available; support undo.
- Points View: show current points per user (using view `user_points_summary`).
- Management: simple admin screens to edit memory items and default point settings.
- Reporting (MVP): printable/exportable current points list; per-user history view.

## Non-Goals (Future/Stretch)
- Full auth with identities (start with shared admin password; add auth later).
- Multi-class/organizations.
- Rich audit trails beyond basic who/when and undo.
- Live Bible API integration; start with static references or manual entries.
- Visual analytics/charts beyond simple aggregates/exports.

## Success Criteria
- A leader can add a new kid and record 1–3 items in under 30 seconds on mobile.
- Points are computed consistently (first vs repeat) without manual math.
- Spending flow prevents overdrafts and supports undo.
- Admin can export/print a current points list at any time.
- Data persists in Supabase and is visible to all leaders.

## Key Screens (MVP)
1) Record Memory
- Select user (search/add quick add)
- Pick memory item (search/filter by reference)
- Choose `first` or `repeat`
- Show reference text when available (optional)
- Save and show awarded points; allow quick add of another item

2) Spend Points
- Select user -> show current points
- Enter amount -> show resulting balance -> confirm
- Prevent overspend; allow undo of last spend entries

3) Users
- List/search users with current points
- Add user (name, optional notes, is_leader)

4) Memory Items (Admin)
- List/search items; toggle active; edit points; add new custom items

5) Reports/Export (Admin)
- Current points list (printable/CSV)
- Per-user history (records and spends)

## Constraints & Principles
- Keep clicks and typing minimal; optimized for mobile.
- Favor deterministic, auditable records over computed totals; totals come from records.
- Keep costs minimal (Supabase + Vercel free tiers).
- Accessibility: high-contrast, large tap targets.

## Risks & Mitigations
- Accidental duplicate users: show likely duplicates on add (same/similar name).
- Incorrect points from manual entry: prefer server-side computation or DB trigger.
- Shared admin password: acceptable for MVP; plan for real auth later.

## Metrics
- Task completion time (record 1 item, spend points).
- Number of daily active leaders.
- Error/undo rate for spends.

