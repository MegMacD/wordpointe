# Auth And User Role Cleanup Checklist

## Current Meaning (Canonical)
- `users.is_leader`: Program classification for labels, filters, reports, and leaderboard display.
- `users.role`: Authorization role for authenticated accounts (`leader` or `admin`).
- `users.password_hash`: Login enablement switch. `NULL` means cannot log in.

## Why Both Exist
- `is_leader` came from the original points domain model (student vs leader classification).
- `role` and `password_hash` were added later for login and permission tiers.
- Because `role` only allows `leader|admin`, non-login/student rows often still show `role='leader'`.

## Non-Breaking Cleanup Applied
- Session auth now requires `password_hash` to still be present, so disabling login immediately invalidates session access.
- Generic user profile update endpoint only allows profile fields (name, is_leader, notes, emojiIcon, displayAccommodationNote), not auth fields.
- Data model docs now define the canonical semantics above.

## Verification Checklist
- [ ] Confirm admin pages are still admin-only via `role='admin'` checks.
- [ ] Confirm leader login still works for users with `password_hash` and `role='leader'`.
- [ ] Confirm disabling `password_hash` immediately blocks existing sessions.
- [ ] Confirm user profile edits cannot modify `role` or `password_hash` via `/api/users/[id]`.
- [ ] Confirm record/spend/bonus routes remain authenticated-only as before.
- [ ] Confirm leader can add a new verse from Record page (`+ Enter New Verse Reference`) and it auto-creates a `memory_items` row through `/api/records`.
- [ ] Confirm direct POST to `/api/memory-items` remains admin-only.

## Next Optional Step (Future Schema Cleanup)
- Add `account_enabled boolean` and `access_role` naming (or separate auth account table), then deprecate ambiguous use of `role` in non-auth contexts.