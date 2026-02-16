# Production Rollout Plan - Word Pointe

This guide walks you through launching Word Pointe for real use with actual students and leaders.

---

## 📋 Overview

This rollout plan helps you:
1. Clean all test data from the database
2. Create real user accounts (students, leaders, admins)
3. Configure production settings
4. Verify everything works before go-live

---

## Phase 1: Pre-Rollout Preparation

### 1.1 Verify All Migrations Are Applied

Run this in Supabase SQL Editor to check:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'memory_items', 'verse_records', 'spend_records', 'bonus_records', 'settings');

-- Check if emojiIcon column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'emojiIcon';

-- Check if user_points_summary view includes all fields
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_points_summary';

-- Should include: id, name, is_leader, notes, display_accommodation_note, emojiIcon, total_earned, current_points
```

**Expected Results:**
- All 6 tables should be listed
- `emojiIcon` column should exist
- View should include: `id`, `name`, `is_leader`, `emojiIcon`, `total_earned`, `current_points`

If anything is missing, run the missing migrations from `supabase/migrations/` folder.

### 1.2 Backup Current Data (Optional)

If you want to keep test data for reference:

```sql
-- Export current users for reference
SELECT * FROM users;

-- Export test verse records
SELECT 
  vr.*,
  u.name as user_name,
  mi.reference as verse_reference
FROM verse_records vr
LEFT JOIN users u ON u.id = vr.user_id
LEFT JOIN memory_items mi ON mi.id = vr.memory_item_id
ORDER BY vr.recorded_at DESC;
```

Save these results as CSV files before proceeding.

---

## Phase 2: Clean Test Data

### 2.1 Clean All User Data

**⚠️ WARNING: This will delete ALL user data. Make sure you've backed up anything you need!**

Run this SQL in Supabase SQL Editor:

```sql
-- Step 1: Delete all user-related records
-- (CASCADE will automatically delete verse_records, spend_records, bonus_records)
DELETE FROM users;

-- Step 2: Verify everything is clean
SELECT COUNT(*) as user_count FROM users; -- Should be 0
SELECT COUNT(*) as verse_records_count FROM verse_records; -- Should be 0
SELECT COUNT(*) as spend_records_count FROM spend_records; -- Should be 0
SELECT COUNT(*) as bonus_records_count FROM bonus_records; -- Should be 0
```

### 2.2 Clean All Memory Items (Verses)

**⚠️ IMPORTANT: Clean and reimport verses to ensure correct data and point settings**

Many test verses may have:
- Incorrect or incomplete text
- Wrong point values
- Missing information

Run this SQL to clean all verses:

```sql
-- Delete all test verses
DELETE FROM memory_items;

-- Verify cleanup
SELECT COUNT(*) as memory_items_count FROM memory_items; -- Should be 0
```

**Next step:** You'll reimport clean verses in Phase 4 below.

### 2.3 Verify Complete Cleanup

```sql
-- Everything should be 0
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM memory_items) as verses,
  (SELECT COUNT(*) FROM verse_records) as records,
  (SELECT COUNT(*) FROM spend_records) as spending,
  (SELECT COUNT(*) FROM bonus_records) as bonuses;
```

### 2.4 Reset Settings (Optional)

If you want to reset default point values:

```sql
-- Update settings to your desired defaults
UPDATE settings 
SET 
  default_points_first = 10,
  default_points_repeat = 5,
  bible_version = 'NIV'
WHERE id IS NOT NULL;
```

---

## Phase 3: Configure Default Settings

### 3.1 Set Point Values and Bible Version

**⚠️ CRITICAL: Do this BEFORE importing verses!**

This ensures all verses will use consistent default values.

```sql
-- View current settings
SELECT * FROM settings;

-- Update to your church's preferences
UPDATE settings 
SET 
  default_points_first = 10,  -- Points for first-time recitation
  default_points_repeat = 5,  -- Points for repeat recitation
  bible_version = 'NIV'       -- Default Bible version
WHERE id IS NOT NULL;

-- If no settings exist, create them
INSERT INTO settings (default_points_first, default_points_repeat, bible_version)
SELECT 10, 5, 'NIV'
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- Verify settings
SELECT 
  default_points_first,
  default_points_repeat,
  bible_version
FROM settings;
```

**Available Bible Versions:**
- `NIV` - New International Version (default)
- `ESV` - English Standard Version
- `KJV` - King James Version
- `NKJV` - New King James Version
- `NLT` - New Living Translation
- `NASB` - New American Standard Bible

### 3.2 Recommended Point Values

**Standard (Recommended):**
- First time: 10 points
- Repeat: 5 points

**Alternative Options:**
- **More generous**: First 20, Repeat 10
- **Length-based**: Adjust in verse library after import
- **Consistent**: Same value for first and repeat

---

## Phase 4: Import Clean Verse Library

### 4.1 Choose Your Verse Library

You have three options for loading verses:

**Option A: Common Verses (Recommended)**
- 47 popular memory verses
- Good starting point for most churches
- File: `supabase/seed_common_verses.sql`

**Option B: Comprehensive Library**
- 100+ verses organized by category
- More extensive selection
- File: `supabase/verse_library.sql`

**Option C: Add Manually**
- Use the admin interface after rollout
- Admin → Memory Items → Add New
- Best for custom verse lists

### 4.2 Import Verse Library

For Options A or B:

1. Open the appropriate SQL file in your editor
2. Copy the entire contents
3. Go to Supabase SQL Editor
4. Paste and run

**For Common Verses (Option A):**
```bash
# Copy this file:
supabase/seed_common_verses.sql
```

**For Comprehensive Library (Option B):**
```bash
# Copy this file:
supabase/verse_library.sql
```

### 4.3 Verify Verses Imported

```sql
-- Check verse count
SELECT COUNT(*) as total_verses FROM memory_items;

-- View all verses
SELECT 
  reference,
  type,
  points_first,
  points_repeat,
  active,
  LEFT(text, 50) as text_preview
FROM memory_items
ORDER BY reference;

-- Check for any verses with incorrect settings
SELECT 
  reference,
  points_first,
  points_repeat
FROM memory_items
WHERE points_first < 1 OR points_repeat < 1 OR points_first IS NULL;
-- Should return no rows
```

### 4.4 Adjust Point Values (If Needed)

If you want different default point values:

```sql
-- Set all verses to 10 points first, 5 points repeat
UPDATE memory_items 
SET 
  points_first = 10,
  points_repeat = 5
WHERE type = 'verse';

-- Or customize by verse length
UPDATE memory_items
SET points_first = 20
WHERE LENGTH(text) > 200; -- Longer verses worth more
```

---

## Phase 5: Create Production Users

### 5.1 Prepare User List

Create a spreadsheet or list with:
- Student names
- Leader names
- Who should have admin access

**User Types:**
- **Students**: Regular kids (is_leader = false)
- **Leaders**: Teachers/helpers (is_leader = true, can add verses)
- **Admins**: Full access (share the admin secret)

### 5.2 Use the Application to Add Users

**Option A: Use the Web Interface (Recommended)**

1. Log in to the app with your admin secret
2. Go to `/users` page
3. Click "Add User" for each student/leader
4. Select emoji icon for each user
5. Check "Leader" checkbox for leaders
6. For users with legacy points from old system:
   - Add the user first
   - Then go to Admin → Adjust Points
   - Add legacy points with category "legacy"

**Option B: Bulk Create via SQL**

If you have many users, use this SQL template:

```sql
-- Create students
INSERT INTO users (name, is_leader, "emojiIcon", notes) VALUES
('John Smith', false, '🦁', 'Grade 5'),
('Sarah Johnson', false, '🌟', 'Grade 4'),
('Mike Davis', false, '🚀', 'Grade 6'),
-- Add more students here
('Emma Wilson', false, '🎨', 'Grade 5');

-- Create leaders
INSERT INTO users (name, is_leader, "emojiIcon", notes) VALUES
('Mrs. Anderson', true, '📚', 'Lead teacher'),
('Mr. Roberts', true, '🎯', 'Assistant teacher');

-- Verify
SELECT name, is_leader, "emojiIcon" FROM users ORDER BY is_leader DESC, name;
```

### 5.3 Add Legacy Points (If Needed)

If migrating from an old points system:

```sql
-- Add legacy points for users
-- Replace user names and point amounts with your actual data
INSERT INTO bonus_records (user_id, points_awarded, reason, category)
SELECT 
  u.id,
  50, -- Points amount
  'Legacy points from previous system',
  'legacy'
FROM users u
WHERE u.name = 'John Smith';

-- Repeat for each user with legacy points
-- Or use a batch approach if you have many:

INSERT INTO bonus_records (user_id, points_awarded, reason, category)
VALUES
  ((SELECT id FROM users WHERE name = 'John Smith'), 50, 'Legacy points from previous system', 'legacy'),
  ((SELECT id FROM users WHERE name = 'Sarah Johnson'), 30, 'Legacy points from previous system', 'legacy'),
  ((SELECT id FROM users WHERE name = 'Mike Davis'), 75, 'Legacy points from previous system', 'legacy');

-- Verify points are applied
SELECT 
  name,
  current_points
FROM user_points_summary
ORDER BY name;
```

### 5.4 Configure Admin Access

**Setup Admin Logins:**

Your admin secret (in environment variable `ADMIN_SHARED_SECRET`) is how you access admin features.

**To give someone admin access:**
1. Share the admin secret password with them
2. They log in at `/login` using the shared secret
3. They'll see admin menu options

**Security Tips:**
- Use a strong, random admin secret (32+ characters)
- Only share with trusted leaders
- Can change it anytime by updating the environment variable in Vercel

---

## Phase 6: Production Configuration

### 6.1 Update Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set correctly:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your service role key)
ADMIN_SHARED_SECRET=<strong-random-password>
```

3. **Set Production Admin Secret:**
   - Generate a new strong password for production
   - Update `ADMIN_SHARED_SECRET` in Vercel
   - Redeploy the app (Vercel → Deployments → Redeploy)

### 6.2 Test Admin Login

1. Go to your app URL `/login`
2. Enter the new production admin secret
3. Verify you see admin menu options
4. Test creating a test user and deleting it

---

## Phase 6: Go-Live Checklist

### Pre-Launch Verification

- [ ] All test data cleaned from database
- [ ] Real students added with correct names
- [ ] Leaders added and marked as `is_leader = true`
- [ ] Emoji icons assigned to each user
- [ ] Legacy points imported (if applicable)
- [ ] Common verses added to memory items
- [ ] Admin secret updated to production password
- [ ] Admin login tested and working
- [ ] Test recording a verse with a real student
- [ ] Test spending points
- [ ] Check leaderboard displays correctly
- [ ] Verify points calculations are accurate
- [ ] Mobile view tested on actual phone
- [ ] Leaders notified of admin password

### User Training

Before going live, brief your leaders on:

1. **How to log in as admin** (share the admin secret)
2. **How to record verses** (/record page)
3. **How to handle spending points** (/spend page)
4. **How to add new students** (/users page)
5. **How to add new verses** (Admin → Memory Items)
6. **How to view reports** (Admin → Reports)

### Communication Plan

1. **Announce to students:**
   - Show them how to view their points
   - Explain the leaderboard
   - Show them their emoji icon
   - Link: `your-app-url.vercel.app`

2. **Announce to leaders:**
   - Provide admin login credentials
   - Share quick reference guide
   - Set expectations for recording verses

---

## Phase 7: Post-Launch Monitoring

### First Week Checklist

- [ ] Check daily that points are being recorded
- [ ] Monitor leaderboard for accuracy
- [ ] Ask leaders for feedback on usability
- [ ] Ask students if they can see their points
- [ ] Verify no duplicate records being created
- [ ] Check that spending works correctly

### Weekly Exports

Set up a routine to export data weekly:

1. Go to Admin → Reports
2. Export All User History (CSV)
3. Save to backup location
4. Review for any anomalies

---

## Phase 8: Ongoing Maintenance

### Regular Tasks

**Weekly:**
- Export user history for backup
- Review leaderboard for accuracy
- Check for any user issues

**Monthly:**
- Review and archive old spend records if needed
- Add new verses to memory items as requested
- Check Bible API quota usage

**As Needed:**
- Add bonus points for special achievements
- Adjust points for corrections
- Add new users as students join

### Troubleshooting

**If points aren't calculating correctly:**
```sql
-- Check the view calculation
SELECT * FROM user_points_summary WHERE name = 'Student Name';

-- Manually verify points
SELECT 
  u.name,
  COALESCE(SUM(v.points_awarded), 0) as earned,
  COALESCE(SUM(b.points_awarded), 0) as bonus,
  COALESCE(SUM(s.points_spent), 0) as spent
FROM users u
LEFT JOIN verse_records v ON v.user_id = u.id
LEFT JOIN bonus_records b ON b.user_id = u.id
LEFT JOIN spend_records s ON s.user_id = u.id AND s.undone = false
WHERE u.name = 'Student Name'
GROUP BY u.id, u.name;
```

**If a user needs to be reset:**
```sql
-- Delete all records for a specific user
BEGIN;
DELETE FROM verse_records WHERE user_id = (SELECT id FROM users WHERE name = 'Student Name');
DELETE FROM spend_records WHERE user_id = (SELECT id FROM users WHERE name = 'Student Name');
DELETE FROM bonus_records WHERE user_id = (SELECT id FROM users WHERE name = 'Student Name');
COMMIT;
```

---

## Quick Reference: SQL Cleanup Commands

```sql
-- DANGER: Full database reset
DELETE FROM users CASCADE;
DELETE FROM memory_items;
DELETE FROM settings;

-- Safe: Remove specific user
DELETE FROM users WHERE name = 'Test User';

-- Safe: Remove test verses
DELETE FROM memory_items WHERE reference LIKE 'TEST%';

-- Safe: View all current users
SELECT name, is_leader, "emojiIcon", current_points 
FROM user_points_summary 
ORDER BY is_leader DESC, name;
```

---

## Support

**Need help?**
- Review [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for deployment issues
- Review [`USER_CREATION_GUIDE.md`](USER_CREATION_GUIDE.md) for user management
- Check Supabase logs for database errors
- Check Vercel logs for application errors

---

**Ready to launch? Start with Phase 1 and work through each section systematically. Good luck! 🚀**
