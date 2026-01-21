# Deployment Checklist: Bonus Points Feature

## Database Migration Required ✅

### Step 1: Run Database Migration
Execute the migration file in your Supabase SQL Editor:

**File**: `supabase/migrations/004_bonus_records.sql`

This migration will:
- Create the `bonus_records` table
- Update the `user_points_summary` view to include bonus points in calculations
- Add necessary indexes for performance

### Step 2: Verify Migration
After running the migration, verify:
```sql
-- Check table exists
SELECT * FROM bonus_records LIMIT 1;

-- Check view includes bonus records
SELECT * FROM user_points_summary LIMIT 5;
```

## Code Changes Summary

### New Files Created
1. `supabase/migrations/004_bonus_records.sql` - Database schema
2. `web/src/app/api/bonus/route.ts` - API endpoint for bonus records
3. `web/src/app/admin/bonus-points/page.tsx` - Admin UI for granting points
4. `docs/BONUS_POINTS_FEATURE.md` - Feature documentation

### Modified Files
1. `web/src/lib/types.ts` - Added BonusRecord type
2. `web/src/components/UserForm.tsx` - Added legacy points field
3. `web/src/components/UserFormFields.tsx` - Added legacy points field
4. `web/src/components/Nav.tsx` - Added admin menu link
5. `web/src/app/api/users/route.ts` - Support for legacy_points on user creation
6. `web/src/app/api/reports/users-csv/route.ts` - Include bonus in CSV export
7. `web/src/app/api/reports/user-history-csv/[id]/route.ts` - Include bonus in user history

## Deployment Steps

### 1. Database First
```bash
# Run the migration in Supabase SQL Editor
# Copy contents of: supabase/migrations/004_bonus_records.sql
# Execute in Supabase
```

### 2. Deploy Code
```bash
cd web
npm install    # Ensure all dependencies are installed
npm run build  # Build the application
npm run deploy # Or your deployment command
```

### 3. Test in Production
After deployment, test:

**Test 1: Create user with legacy points**
1. Go to `/users`
2. Create new user with legacy points (e.g., 100)
3. Verify user shows 100 points on users list
4. Check user history CSV includes legacy bonus record

**Test 2: Grant bonus points**
1. Go to `/admin/bonus-points`
2. Select a user
3. Grant 25 bonus points with reason
4. Verify user's point total increased
5. Export user history and verify bonus appears

**Test 3: CSV Exports**
1. Export all users CSV - should show bonus points column
2. Export individual user history - should include bonus records

## Rollback Plan

If issues occur, you can rollback:

### Database Rollback
```sql
-- Restore original view
DROP VIEW IF EXISTS user_points_summary;
CREATE VIEW user_points_summary AS
SELECT
  u.id,
  u.name,
  u.is_leader,
  COALESCE(SUM(v.points_awarded), 0) - COALESCE(SUM(s.points_spent), 0) AS current_points
FROM users u
LEFT JOIN verse_records v ON v.user_id = u.id
LEFT JOIN spend_records s ON s.user_id = u.id AND s.undone = false
GROUP BY u.id, u.name, u.is_leader;

-- Optionally drop bonus_records table
DROP TABLE IF EXISTS bonus_records;
```

### Code Rollback
Revert to previous git commit before the bonus points changes.

## Notes
- The feature is backward compatible - existing users not affected
- Bonus records table can be empty with no issues
- Legacy points are optional when creating users
- All admin functionality is properly permission-gated

## Success Criteria
✅ Migration runs without errors
✅ Existing user points remain unchanged
✅ New users can be created with legacy points
✅ Admin can grant/deduct bonus points
✅ CSV exports include bonus point data
✅ All admin features work only for authenticated admins
