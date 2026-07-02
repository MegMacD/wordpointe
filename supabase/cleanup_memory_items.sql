-- Data Cleanup Script for Memory Items
-- WARNING: Review the output of data_quality_check.sql before running this!
-- This script makes actual changes to your data

-- STEP 1: Backup your data first!
-- You can create a backup table like this:
-- CREATE TABLE memory_items_backup AS SELECT * FROM memory_items;

-- STEP 2: Fix references with leading/trailing whitespace
UPDATE memory_items
SET reference = TRIM(reference)
WHERE reference ~ '^\s|\s$';

-- STEP 3: Fix double spaces in references
UPDATE memory_items
SET reference = REGEXP_REPLACE(reference, '\s+', ' ', 'g')
WHERE reference ~ '\s\s';

-- STEP 4: Handle case-insensitive duplicates
-- This is tricky - we'll keep the active one, or the most recently updated one
-- First, let's just report what would happen:

DO $$
DECLARE
  dup_group RECORD;
  keeper_id uuid;
  delete_ids uuid[];
BEGIN
  -- For each group of duplicates (case-insensitive)
  FOR dup_group IN 
    SELECT LOWER(reference) as lower_ref
    FROM memory_items
    GROUP BY LOWER(reference)
    HAVING COUNT(*) > 1
  LOOP
    -- Find which one to keep (prefer active, then most recent)
    SELECT id INTO keeper_id
    FROM memory_items
    WHERE LOWER(reference) = dup_group.lower_ref
    ORDER BY active DESC, updated_at DESC
    LIMIT 1;
    
    -- Get IDs of duplicates to remove
    SELECT array_agg(id) INTO delete_ids
    FROM memory_items
    WHERE LOWER(reference) = dup_group.lower_ref
      AND id != keeper_id;
    
    RAISE NOTICE 'Duplicate group "%": Keeping % (will remove %)', 
      dup_group.lower_ref, 
      keeper_id, 
      delete_ids;
      
    -- NOTE: Actual deletion is commented out for safety
    -- Uncomment the following lines after verifying the output:
    
    -- First, update any verse_records to point to the keeper
    -- UPDATE verse_records 
    -- SET memory_item_id = keeper_id
    -- WHERE memory_item_id = ANY(delete_ids);
    
    -- Then delete the duplicates
    -- DELETE FROM memory_items WHERE id = ANY(delete_ids);
  END LOOP;
END $$;

-- STEP 5: Ensure all verse items have a bible_version
UPDATE memory_items
SET bible_version = 'NIV'
WHERE type = 'verse' 
  AND (bible_version IS NULL OR bible_version = '');

-- STEP 6: Report on cleanup actions taken
DO $$
BEGIN
  RAISE NOTICE '=== Cleanup Complete ===';
  RAISE NOTICE 'Total memory items: %', (SELECT COUNT(*) FROM memory_items);
  RAISE NOTICE 'Active items: %', (SELECT COUNT(*) FROM memory_items WHERE active);
  RAISE NOTICE 'Inactive items: %', (SELECT COUNT(*) FROM memory_items WHERE NOT active);
  RAISE NOTICE '';
  RAISE NOTICE 'Run data_quality_check.sql again to verify the cleanup.';
END $$;
