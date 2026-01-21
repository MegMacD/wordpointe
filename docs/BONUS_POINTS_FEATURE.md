# Bonus Points Feature

## Overview
The bonus points feature allows administrators to grant arbitrary points to users outside of the normal verse memorization workflow. This is useful for:
- **Legacy Points**: Migrating points from a previous system when creating new users
- **Bonus Points**: Rewarding special achievements, participation, or encouragement
- **Corrections**: Fixing errors in point tracking or restoring lost points
- **Deductions**: Removing points if necessary (rare, but available)

## Database Schema

### New Table: `bonus_records`
```sql
CREATE TABLE bonus_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  points_awarded int NOT NULL,  -- Can be negative for deductions
  reason text NOT NULL,          -- Required explanation for audit trail
  category text CHECK (category IN ('legacy', 'bonus', 'correction', 'other')) DEFAULT 'bonus',
  awarded_by text,               -- Optional: track which admin granted it
  awarded_at timestamptz DEFAULT now()
);
```

### Updated View: `user_points_summary`
The view now includes bonus records in the point calculation:
```sql
current_points = 
  SUM(verse_records.points_awarded) 
  + SUM(bonus_records.points_awarded) 
  - SUM(spend_records.points_spent WHERE undone=false)
```

## Features

### 1. Legacy Points on User Creation
When creating a new user through the user form:
- An optional "Legacy Points" field is available
- Enter the user's points from a previous system
- Points are automatically added as a bonus record with category='legacy'
- Reason is set to "Legacy points from previous system"

**Location**: 
- UI: `/users` page (Add User form)
- Code: [UserForm.tsx](../web/src/components/UserForm.tsx) and [UserFormFields.tsx](../web/src/components/UserFormFields.tsx)

### 2. Admin Bonus Points Page
Dedicated admin page for granting bonus/correction points:
- Select user from dropdown (shows current points)
- Choose category: Bonus, Correction, or Other
- Enter points (positive to add, negative to deduct)
- Provide detailed reason (required for audit trail)
- Preview shows final point total before submission

**Location**: `/admin/bonus-points`

**Navigation**: Available in the admin menu for admin users only

### 3. API Endpoints

#### POST `/api/bonus`
Create a new bonus record
```json
{
  "user_id": "uuid",
  "points_awarded": 50,        // Can be negative
  "reason": "Excellent participation in class",
  "category": "bonus",         // or 'legacy', 'correction', 'other'
  "awarded_by": "Admin Name"   // Optional
}
```

#### GET `/api/bonus?user_id=uuid`
Retrieve bonus records for a specific user

### 4. Updated POST `/api/users`
User creation endpoint now accepts optional `legacy_points`:
```json
{
  "name": "John Doe",
  "is_leader": false,
  "notes": "New student",
  "legacy_points": 100         // Optional
}
```

## Reports & Export

### Updated CSV Exports
Both CSV export reports now include bonus points:

1. **All Users Report** (`/admin/reports`)
   - New column: "Bonus/Adjustment Points"
   - Shows breakdown: Memory Work Points + Bonus Points - Spent = Current

2. **Individual User History** (`/admin/reports`)
   - Bonus records shown with type: "Bonus (category)"
   - Includes reason and point change
   - Sorted chronologically with all other transactions

## Use Cases

### Scenario 1: New User with Previous Points
```
1. Go to /users
2. Click "Add New User"
3. Enter name and details
4. In "Legacy Points" field, enter their previous balance (e.g., 150)
5. Click "Add User"
```
Result: User starts with 150 points from a bonus record labeled "Legacy points from previous system"

### Scenario 2: Special Achievement Bonus
```
1. Go to /admin/bonus-points
2. Select the user
3. Category: Bonus
4. Points: 25
5. Reason: "Perfect attendance for 3 months"
6. Click "Grant Points"
```
Result: User receives 25 bonus points

### Scenario 3: Error Correction
```
1. Go to /admin/bonus-points
2. Select the user
3. Category: Correction
4. Points: 10
5. Reason: "System error - lost points from John 3:16 on 1/15/2026"
6. Click "Grant Points"
```
Result: User's points are corrected

### Scenario 4: Point Deduction (Rare)
```
1. Go to /admin/bonus-points
2. Select the user
3. Category: Correction
4. Points: -20 (negative number)
5. Reason: "Duplicate entry - removing incorrect points"
6. Click "Grant Points"
```
Result: 20 points are deducted from the user

## Security & Permissions
- Only authenticated admin users can grant bonus points
- All bonus records require a reason for audit trail
- Bonus records are permanent (no undo, but corrections can be made with offsetting entries)
- All bonus transactions appear in user history exports

## Migration Instructions

### Existing Database
Run the migration file:
```bash
# In Supabase SQL Editor
supabase/migrations/004_bonus_records.sql
```

This will:
1. Create the `bonus_records` table
2. Update the `user_points_summary` view to include bonus points
3. Add necessary indexes

### New Database
The migration will run automatically with other migrations

## Code Files Changed/Added

### Database
- ✅ `supabase/migrations/004_bonus_records.sql` (new)

### Types
- ✅ `web/src/lib/types.ts` - Added `BonusRecord` interface

### API Routes
- ✅ `web/src/app/api/bonus/route.ts` (new)
- ✅ `web/src/app/api/users/route.ts` - Added legacy_points support
- ✅ `web/src/app/api/reports/users-csv/route.ts` - Include bonus in export
- ✅ `web/src/app/api/reports/user-history-csv/[id]/route.ts` - Include bonus records

### UI Components
- ✅ `web/src/components/UserForm.tsx` - Added legacy_points field
- ✅ `web/src/components/UserFormFields.tsx` - Added legacy_points field
- ✅ `web/src/components/Nav.tsx` - Added Bonus Points link for admins
- ✅ `web/src/app/admin/bonus-points/page.tsx` (new)

## Future Enhancements
- [ ] View bonus history on individual user detail pages
- [ ] Bulk bonus point operations
- [ ] Bonus point templates/presets
- [ ] Admin notification system for bonus grants
- [ ] Undo functionality for bonus records (with audit trail)
