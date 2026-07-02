-- Data Quality Check for Memory Items
-- Run this to audit verse data quality
-- This should be run periodically to ensure data integrity

-- 1. Check for duplicate references (case-insensitive)
SELECT 
  'Duplicate References (Case-Insensitive)' as check_type,
  LOWER(reference) as reference_normalized,
  COUNT(*) as count,
  array_agg(reference) as variations,
  array_agg(id::text) as item_ids,
  array_agg(active) as active_states
FROM memory_items
GROUP BY LOWER(reference)
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Check for references with unusual formatting
SELECT 
  'Unusual Formatting' as check_type,
  reference,
  id,
  active,
  type,
  CASE 
    WHEN reference ~ '^[a-z]' THEN 'Lowercase start'
    WHEN reference ~ '  ' THEN 'Double spaces'
    WHEN reference ~ '^\s|\s$' THEN 'Leading/trailing spaces'
    ELSE 'Other'
  END as issue
FROM memory_items
WHERE 
  reference ~ '^[a-z]' OR  -- Starts with lowercase
  reference ~ '  ' OR       -- Has double spaces
  reference ~ '^\s|\s$'     -- Has leading/trailing whitespace
ORDER BY reference;

-- 3. Check for verse-type items without Bible version
SELECT 
  'Missing Bible Version' as check_type,
  reference,
  id,
  active,
  type,
  bible_version
FROM memory_items
WHERE type = 'verse' 
  AND (bible_version IS NULL OR bible_version = '')
ORDER BY reference;

-- 4. Check for inactive items that should potentially be removed
SELECT 
  'Inactive Items' as check_type,
  reference,
  id,
  active,
  type,
  bible_version,
  created_at,
  updated_at,
  -- Check if there are any verse_records for this item
  (SELECT COUNT(*) FROM verse_records WHERE memory_item_id = memory_items.id) as record_count
FROM memory_items
WHERE active = false
ORDER BY updated_at DESC;

-- 5. Summary statistics
SELECT 
  'Summary' as report_type,
  COUNT(*) as total_items,
  SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_items,
  SUM(CASE WHEN NOT active THEN 1 ELSE 0 END) as inactive_items,
  SUM(CASE WHEN type = 'verse' THEN 1 ELSE 0 END) as verse_items,
  SUM(CASE WHEN type = 'custom' THEN 1 ELSE 0 END) as custom_items,
  COUNT(DISTINCT bible_version) as unique_versions
FROM memory_items;

-- 6. Bible version distribution
SELECT 
  'Version Distribution' as report_type,
  bible_version,
  COUNT(*) as count,
  SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_count
FROM memory_items
WHERE type = 'verse'
GROUP BY bible_version
ORDER BY count DESC;
