# UI Map & Flows (Text Wireframes)

## Navigation
- Record
- Spend
- Users
- Memory Items (Admin)
- Reports (Admin)
- Settings (Admin)

## Record (primary)
Header: "Record Memory"
Search/Add User:
- [Search box] -> results list (name, current points)
- [Add new user] modal: name, is_leader, notes

Pick Item:
- [Search box] [Type filter: verse/custom] [Active only toggle]
- Item row: reference • type • points (first/repeat)
- Optional: expand to show verse text

Record:
- Radio: first | repeat (default: first if no prior first record exists)
- Button: Record → toast "+10 points"
- After save: quick actions: [Record another] [Go to user] [Undo]

## Spend
Header: "Spend Points"
Select User:
- [Search box] -> user card with current points
Spend Form:
- [Amount] [Note]
- Preview: "Remaining: current - amount"
- Button: Spend (disabled if amount > current)
- List of recent spends: each with [Undo]

## Users
Header: "Users"
- [Search] [Add]
- Table/list: Name • Points • Actions [View]

User Detail
- Summary: name, leader badge, current points
- History tabs: Records | Spends
- Actions: Add Record (prefill user), Spend

## Memory Items (Admin)
Header: "Memory Items"
- [Search] [Filter: type] [Active]
- Table: Reference • Type • Points (first/repeat) • Active • [Edit]
- Edit modal: reference, text, points, active
- [Add Item]

## Reports (Admin)
- Current Points: list/table, [Print] [Export CSV]
- Per-User History: select user -> list of records/spends

## Settings (Admin)
- Default points: first, repeat
- Admin Secret (display hint only)

## Mobile Considerations
- Large tap targets, sticky action buttons, minimal typing
- Keep lists virtualized if needed; debounce search

