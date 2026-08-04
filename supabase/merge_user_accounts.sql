-- Merge two user accounts into one canonical account.
--
-- This script is intended for a one-time cleanup when a child has duplicate
-- accounts. It reassigns verse records, bonus records, spend records, and
-- sessions to the keeper account, then deletes the source account.
--
-- Safe usage:
-- 1. Review the preview query below.
-- 2. Confirm the keeper and source names are correct.
-- 3. Run the script inside Supabase SQL Editor.
-- 4. Keep a backup before running any merge.

-- Preview the accounts before merging:
-- SELECT id, name, is_leader, role, password_hash IS NOT NULL AS has_login_access,
--        notes, "emojiIcon", display_accommodation_note
-- FROM users
-- WHERE LOWER(name) IN (LOWER('keepername'), LOWER('sourcename'))
-- ORDER BY name;

BEGIN;

DO $$
DECLARE
  keeper_name text := 'keepername';
  source_name text := 'sourcename';

  keeper_count int;
  source_count int;

  keeper_id uuid;
  source_id uuid;

  keeper_password_hash text;
  source_password_hash text;
  keeper_role text;
  source_role text;
  keeper_is_leader boolean;
  source_is_leader boolean;
  keeper_notes text;
  source_notes text;
  keeper_emoji text;
  source_emoji text;
  keeper_display_accommodation_note boolean;
  source_display_accommodation_note boolean;

  merged_password_hash text;
  merged_role text;
  merged_is_leader boolean;
  merged_notes text;
  merged_emoji text;
  merged_display_accommodation_note boolean;

  transferred_verse_records int := 0;
  transferred_bonus_records int := 0;
  transferred_spend_records int := 0;
  transferred_sessions int := 0;
  adjusted_first_to_repeat int := 0;
BEGIN
  SELECT COUNT(*) INTO keeper_count
  FROM users
  WHERE LOWER(name) = LOWER(keeper_name);

  SELECT COUNT(*) INTO source_count
  FROM users
  WHERE LOWER(name) = LOWER(source_name);

  IF keeper_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one keeper account named "%"; found %', keeper_name, keeper_count;
  END IF;

  IF source_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one source account named "%"; found %', source_name, source_count;
  END IF;

  SELECT id, password_hash, role, is_leader, notes, "emojiIcon", display_accommodation_note
  INTO keeper_id, keeper_password_hash, keeper_role, keeper_is_leader, keeper_notes, keeper_emoji, keeper_display_accommodation_note
  FROM users
  WHERE LOWER(name) = LOWER(keeper_name)
  LIMIT 1;

  SELECT id, password_hash, role, is_leader, notes, "emojiIcon", display_accommodation_note
  INTO source_id, source_password_hash, source_role, source_is_leader, source_notes, source_emoji, source_display_accommodation_note
  FROM users
  WHERE LOWER(name) = LOWER(source_name)
  LIMIT 1;

  IF keeper_id = source_id THEN
    RAISE EXCEPTION 'Keeper and source accounts are the same user';
  END IF;

  merged_password_hash := COALESCE(keeper_password_hash, source_password_hash);

  merged_role := CASE
    WHEN keeper_role = 'admin' OR source_role = 'admin' THEN 'admin'
    WHEN keeper_role = 'leader' OR source_role = 'leader' THEN 'leader'
    ELSE COALESCE(keeper_role, source_role, 'leader')
  END;

  merged_is_leader := COALESCE(keeper_is_leader, false) OR COALESCE(source_is_leader, false);
  merged_notes := COALESCE(NULLIF(keeper_notes, ''), source_notes);
  merged_emoji := COALESCE(NULLIF(keeper_emoji, ''), source_emoji);
  merged_display_accommodation_note := COALESCE(keeper_display_accommodation_note, false) OR COALESCE(source_display_accommodation_note, false);

  UPDATE users
  SET
    password_hash = merged_password_hash,
    role = merged_role,
    is_leader = merged_is_leader,
    notes = merged_notes,
    "emojiIcon" = merged_emoji,
    display_accommodation_note = merged_display_accommodation_note,
    updated_at = now()
  WHERE id = keeper_id;

  -- Handle potential unique-index conflicts on "first" records before reassigning.
  -- Constraint: only one 'first' record per (user_id, memory_item_id).
  -- If both users have a 'first' for the same item, downgrade source record(s)
  -- to 'repeat' and align points to repeat points where available.
  WITH conflicting_source_firsts AS (
    SELECT src.id, src.memory_item_id
    FROM verse_records src
    INNER JOIN verse_records keep
      ON keep.user_id = keeper_id
     AND keep.memory_item_id = src.memory_item_id
     AND keep.record_type = 'first'
    WHERE src.user_id = source_id
      AND src.record_type = 'first'
  )
  UPDATE verse_records src
  SET
    record_type = 'repeat',
    points_awarded = COALESCE(mi.points_repeat, src.points_awarded)
  FROM conflicting_source_firsts c
  LEFT JOIN memory_items mi ON mi.id = c.memory_item_id
  WHERE src.id = c.id;
  GET DIAGNOSTICS adjusted_first_to_repeat = ROW_COUNT;

  UPDATE verse_records
  SET user_id = keeper_id
  WHERE user_id = source_id;
  GET DIAGNOSTICS transferred_verse_records = ROW_COUNT;

  UPDATE bonus_records
  SET user_id = keeper_id
  WHERE user_id = source_id;
  GET DIAGNOSTICS transferred_bonus_records = ROW_COUNT;

  UPDATE spend_records
  SET user_id = keeper_id
  WHERE user_id = source_id;
  GET DIAGNOSTICS transferred_spend_records = ROW_COUNT;

  UPDATE sessions
  SET user_id = keeper_id
  WHERE user_id = source_id;
  GET DIAGNOSTICS transferred_sessions = ROW_COUNT;

  DELETE FROM users
  WHERE id = source_id;

  RAISE NOTICE 'Merged account "%" into "%".', source_name, keeper_name;
  RAISE NOTICE 'Transferred verse_records: %', transferred_verse_records;
  RAISE NOTICE 'Adjusted conflicting first->repeat records: %', adjusted_first_to_repeat;
  RAISE NOTICE 'Transferred bonus_records: %', transferred_bonus_records;
  RAISE NOTICE 'Transferred spend_records: %', transferred_spend_records;
  RAISE NOTICE 'Transferred sessions: %', transferred_sessions;
  RAISE NOTICE 'Keeper account kept name "%" and now owns the merged history.', keeper_name;
END $$;

COMMIT;

-- Verification query after merge:
-- SELECT name, is_leader, role, password_hash IS NOT NULL AS has_login_access,
--        notes, "emojiIcon", display_accommodation_note
-- FROM users
-- WHERE LOWER(name) = LOWER('keepername');

-- Optional sanity check for point totals after merge:
-- SELECT
--   u.name,
--   COALESCE((SELECT SUM(v.points_awarded) FROM verse_records v WHERE v.user_id = u.id), 0)
--   + COALESCE((SELECT SUM(b.points_awarded) FROM bonus_records b WHERE b.user_id = u.id), 0)
--   - COALESCE((SELECT SUM(s.points_spent) FROM spend_records s WHERE s.user_id = u.id AND s.undone = false), 0)
--     AS current_points
-- FROM users u
-- WHERE LOWER(u.name) = LOWER('keepername');
