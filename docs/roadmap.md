# Roadmap & Backlog

## MVP (v0.1)
- Record memory (first/repeat, auto points)
- Spend points with undo, overdraft guard
- Users list/detail; add user
- Memory items admin; settings
- Current points report (print/CSV)

## v0.2 – Usability
- Show verse text on record screen
- Duplicate user warning on add
- Search and filters polish; mobile optimizations
- CSV export for per-user history

## v0.3 – Reliability & Audit
- Basic audit: who/when did actions (paired with light auth)
- Improved undo/soft-delete flows
- Error monitoring and logs surfacing

## v0.4 – Content & Catalog
- ✅ Bible API integration with auto-creation (ESV)
- ✅ On-demand verse fetching and storage

## v0.5 – Accounts & RLS
- ✅ Real auth for leaders (simple password-based auth)
- ✅ Role-based access (leader vs admin)
- ✅ Login-only access (no public pages)
- Admin UI for creating new users (leaders/admins)
- Password reset functionality
- Enable RLS with leader policies

## v0.6 – Enhanced Security
- First-login password change requirement
- Password strength requirements
- Session management UI (view/revoke sessions)
- Audit log for user creation/modification
- Two-factor authentication for admins
- Account lockout after failed attempts

## v0.7 – Engagement & Gamification
- **Leaderboard Page**
  - Show top users by verse count and total points
  - All-time and current month views
  - Available to all leaders (not admin-only)
  - Consistent styling with existing pages
- **User Avatar System**
  - Emoji-based avatars (kid-friendly subset only)
  - Exclude objectionable emojis (💩, etc.)
  - Random selection on quick user creation
  - User-selectable during creation/editing
  - Display on user list and leaderboard
  - Leader editing capability

## Stretch / Future
- Quick-add multi-item entry flow
- Prize store UX (compose multiple items, subtotal preview)
- Multi-class/organizations with scoping
- Charts/visual dashboards
- Offline-capable PWA mode
- **Junior Kids Simplified Verses**
  - Add optional simplified/shorter text column for verses
  - Target younger kids who need easier versions
  - Functions same as regular verse (same points structure)
  - Wait and evaluate actual need before implementation

## Backlog (prioritized)
1) **Fix Bible API verse text fetching (BLOCKED)**
   - API.Bible NIV authorization issue (401 Unauthorized)
   - Valid API key works in Swagger but fails in app
   - May require special licensing for NIV access
   - Currently using ESV text in seed files as fallback
   - Scripts ready: seed-common-verses.js, seed-custom-verses.js
2) **Update help page once API is fixed**
   - Document ability to quickly add a verse on-the-fly during recording
   - Explain auto-creation with appropriate points
   - Update UI flows documentation
3) Duplicate detection on user add (string similarity)
4) CSV export endpoints (server-generated)
5) Verse text cache and display
6) Admin secret rotation & management UX
7) Print styles for reports
8) Keyboard shortcuts for record flow
9) Class/org scoping (schema changes)
10) PWA install and offline cache for static assets

