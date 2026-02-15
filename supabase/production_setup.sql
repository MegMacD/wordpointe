-- Production Setup Script for Word Pointe
-- 
-- This script helps you prepare the database for production rollout
-- Run each section carefully in Supabase SQL Editor
--
-- IMPORTANT: Review each section before running!

-- ============================================================================
-- SECTION 1: VERIFY MIGRATIONS
-- ============================================================================
-- Check that all required tables and columns exist

SELECT 'Checking tables...' as status;

SELECT 
  CASE 
    WHEN COUNT(*) = 6 THEN 'OK: All tables exist'
    ELSE 'ERROR: Missing tables! Expected 6, found ' || COUNT(*)
  END as table_check
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'memory_items', 'verse_records', 'spend_records', 'bonus_records', 'settings');

SELECT 'Checking emojiIcon column...' as status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'emojiIcon'
    ) THEN 'OK: emojiIcon column exists'
    ELSE 'ERROR: emojiIcon column missing! Run migration 007_add_emoji_icon.sql'
  END as emoji_check;

SELECT 'Checking user_points_summary view...' as status;

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_points_summary'
ORDER BY ordinal_position;

-- Expected columns: id, name, is_leader, emojiIcon, total_earned, current_points

-- ============================================================================
-- SECTION 2: BACKUP CURRENT DATA (Optional)
-- ============================================================================
-- Uncomment and run if you want to review test data before deletion

-- SELECT 'Current Users:' as backup_section;
-- SELECT * FROM users ORDER BY name;

-- SELECT 'Current Points Summary:' as backup_section;
-- SELECT * FROM user_points_summary ORDER BY current_points DESC;

-- SELECT 'Verse Records:' as backup_section;
-- SELECT 
--   vr.*,
--   u.name as user_name,
--   mi.reference as verse_reference
-- FROM verse_records vr
-- LEFT JOIN users u ON u.id = vr.user_id
-- LEFT JOIN memory_items mi ON mi.id = vr.memory_item_id
-- ORDER BY vr.recorded_at DESC;

-- ============================================================================
-- SECTION 3: CLEAN TEST DATA
-- ============================================================================
-- ⚠️ WARNING: This deletes ALL user data!
-- Uncomment ONLY when you're ready to clean everything

-- BEGIN;

-- -- Delete all users (CASCADE will remove related records)
-- DELETE FROM users;

-- -- Optionally delete test memory items
-- -- DELETE FROM memory_items WHERE reference LIKE '%TEST%';

-- -- Verify cleanup
-- SELECT 
--   (SELECT COUNT(*) FROM users) as users_count,
--   (SELECT COUNT(*) FROM verse_records) as verse_records_count,
--   (SELECT COUNT(*) FROM spend_records) as spend_records_count,
--   (SELECT COUNT(*) FROM bonus_records) as bonus_records_count;
-- -- All should be 0

-- COMMIT;

-- ============================================================================
-- SECTION 4: CLEAN MEMORY ITEMS (VERSES)
-- ============================================================================
-- ⚠️ Remove all test verses to start fresh with correct data
-- Uncomment when ready to clean

-- BEGIN;

-- -- Delete all memory items (verses)
-- DELETE FROM memory_items;

-- -- Verify cleanup
-- SELECT COUNT(*) as memory_items_count FROM memory_items;
-- -- Should be 0

-- COMMIT;

-- ============================================================================
-- SECTION 5: CONFIGURE SETTINGS (Do this BEFORE importing verses)
-- ============================================================================
-- Set correct default values for points and Bible version
-- This ensures verses imported will have consistent settings

SELECT 'Current Settings (before update):' as settings_section;
SELECT * FROM settings;

-- Update settings to production values
-- Adjust these values to match your church's preferences
UPDATE settings 
SET 
  default_points_first = 10,  -- Points for first-time recitation
  default_points_repeat = 5,  -- Points for repeat recitation
  bible_version = 'NIV'       -- Default Bible version (ESV, NIV, KJV, NKJV, NLT, NASB)
WHERE id IS NOT NULL;

-- If no settings exist, create them
INSERT INTO settings (default_points_first, default_points_repeat, bible_version)
SELECT 10, 5, 'NIV'
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- Verify settings updated
SELECT 'Settings after update:' as settings_section;
SELECT 
  default_points_first,
  default_points_repeat,
  bible_version,
  created_at
FROM settings;

-- Expected: default_points_first = 10, default_points_repeat = 5, bible_version = 'NIV'
-- (or whatever values you set above)

-- ============================================================================
-- SECTION 6: IMPORT CLEAN VERSE LIBRARY
-- ============================================================================
-- Replace with your actual student and leader names

-- BEGIN;

-- -- Create students (is_leader = false)
-- INSERT INTO users (name, is_leader, "emojiIcon", notes) VALUES
-- ('Student Name 1', false, '🦁', 'Grade/Notes'),
-- ('Student Name 2', false, '🌟', 'Grade/Notes'),
-- ('Student Name 3', false, '🚀', 'Grade/Notes');
-- -- Add more students here

-- -- Create leaders (is_leader = true)
-- INSERT INTO users (name, is_leader, "emojiIcon", notes) VALUES
-- ('Leader Name 1', true, '📚', 'Lead teacher'),
-- ('Leader Name 2', true, '🎯', 'Assistant');
-- -- Add more leaders here

-- -- Verify users created
-- SELECT name, is_leader, "emojiIcon", notes FROM users ORDER BY is_leader DESC, name;

-- COMMIT;

-- ============================================================================
-- SECTION 6: IMPORT CLEAN VERSE LIBRARY
-- ============================================================================
-- After configuring settings, reimport verses with correct data
-- Settings MUST be configured first (Section 5) to ensure consistency

-- Option 1: Run seed_common_verses.sql (47 common verses) - RECOMMENDED
-- Option 2: Run verse_library.sql (100+ comprehensive library)
-- Option 3: Add verses manually through the admin interface

-- To use seed files, copy and run them separately in SQL Editor:
-- - supabase/seed_common_verses.sql (recommended for most churches)
-- - supabase/verse_library.sql (if you want a larger library)

-- After importing, verify verses are loaded:
SELECT 'Verse Library Status:' as verification;
SELECT COUNT(*) as verse_count FROM memory_items;
SELECT reference, points_first, points_repeat, active, bible_version FROM memory_items ORDER BY reference LIMIT 10;

-- ============================================================================
-- SECTION 7: CREATE PRODUCTION USERS
-- ============================================================================
-- Add points from previous tracking system

-- BEGIN;

-- -- Add legacy points for specific users
-- INSERT INTO bonus_records (user_id, points_awarded, reason, category)
-- VALUES
--   ((SELECT id FROM users WHERE name = 'Student Name 1'), 50, 'Legacy points from previous system', 'legacy'),
--   ((SELECT id FROM users WHERE name = 'Student Name 2'), 30, 'Legacy points from previous system', 'legacy');
--   -- Add more legacy records here

-- -- Verify points are applied
-- SELECT 
--   name,
--   current_points,
--   is_leader
-- FROM user_points_summary
-- ORDER BY name;

-- COMMIT;

-- ============================================================================
-- SECTION 8: VERIFY PRODUCTION SETUP
-- ============================================================================
-- Run this to verify everything is set up correctly

SELECT 'Production Setup Verification' as verification_section;

-- Count users by type
SELECT 
  CASE WHEN is_leader THEN 'Leaders' ELSE 'Students' END as user_type,
  COUNT(*) as count,
  STRING_AGG(name, ', ' ORDER BY name) as names
FROM users
GROUP BY is_leader
ORDER BY is_leader DESC;

-- Show points distribution
SELECT 
  name,
  is_leader,
  "emojiIcon",
  current_points
FROM user_points_summary
ORDER BY current_points DESC, name;

-- Show any existing records (should be none or only test records)
SELECT 
  'Verse Records' as record_type,
  COUNT(*) as count
FROM verse_records
UNION ALL
SELECT 
  'Spend Records',
  COUNT(*)
FROM spend_records
UNION ALL
SELECT 
  'Bonus Records',
  COUNT(*)
FROM bonus_records;

-- ============================================================================
-- SECTION 10: FINAL VERIFICATION
-- ============================================================================
-- Run this to confirm everything is set up correctly

SELECT '=== FINAL PRODUCTION SETUP VERIFICATION ===' as status;

-- Settings
SELECT 'Settings:' as section;
SELECT 
  default_points_first,
  default_points_repeat,
  bible_version
FROM settings;

-- Verse count
SELECT 'Verses:' as section;
SELECT COUNT(*) as total_verses FROM memory_items;

-- ============================================================================
-- QUICK REFERENCE: Useful Queries
-- ============================================================================

-- View all users with their current stats
-- SELECT 
--   u.name,
--   u.is_leader,
--   u."emojiIcon",
--   ups.current_points,
--   (SELECT COUNT(*) FROM verse_records WHERE user_id = u.id) as verses_recorded,
--   (SELECT COUNT(*) FROM spend_records WHERE user_id = u.id AND undone = false) as times_spent
-- FROM users u
-- LEFT JOIN user_points_summary ups ON ups.id = u.id
-- ORDER BY u.is_leader DESC, u.name;

-- Find users with points but no records (might indicate legacy points)
-- SELECT 
--   ups.name,
--   ups.current_points,
--   (SELECT COUNT(*) FROM verse_records WHERE user_id = ups.id) as verse_count
-- FROM user_points_summary ups
-- WHERE ups.current_points > 0
--   AND (SELECT COUNT(*) FROM verse_records WHERE user_id = ups.id) = 0
-- ORDER BY ups.current_points DESC;

-- ============================================================================
-- EMERGENCY: Reset Specific User
-- ============================================================================
-- Use this if you need to reset a single user's data

-- BEGIN;
-- DELETE FROM verse_records WHERE user_id = (SELECT id FROM users WHERE name = 'User Name');
-- DELETE FROM spend_records WHERE user_id = (SELECT id FROM users WHERE name = 'User Name');
-- DELETE FROM bonus_records WHERE user_id = (SELECT id FROM users WHERE name = 'User Name');
-- COMMIT;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================

SELECT 'Production setup script loaded. Review and uncomment sections as needed.' as status;
