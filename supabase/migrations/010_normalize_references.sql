-- Normalize existing verse references to ensure consistency
-- This migration identifies and fixes any non-normalized references

-- Create a temporary function to normalize references
-- This will be used to update existing data
CREATE OR REPLACE FUNCTION normalize_reference(ref text) RETURNS text AS $$
DECLARE
  book_part text;
  chapter_verse text;
BEGIN
  -- Extract book and chapter:verse parts
  -- For example: "john 3:16" -> "John 3:16"
  -- This is a simple normalization - proper capitalization
  -- More complex normalization should be done in application code
  
  -- Just capitalize first letter of each word for now
  RETURN initcap(ref);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Find potential duplicate references (case-insensitive)
-- This will help identify issues before we fix them
DO $$
DECLARE
  dup_count int;
BEGIN
  SELECT COUNT(*) INTO dup_count
  FROM (
    SELECT LOWER(reference) as lower_ref, COUNT(*) as cnt
    FROM memory_items
    GROUP BY LOWER(reference)
    HAVING COUNT(*) > 1
  ) dups;
  
  IF dup_count > 0 THEN
    RAISE NOTICE 'Found % potential duplicate references (case variations)', dup_count;
  ELSE
    RAISE NOTICE 'No duplicate references found';
  END IF;
END $$;

-- Report on references that would be normalized differently
DO $$
DECLARE
  rec RECORD;
  diff_count int := 0;
BEGIN
  FOR rec IN 
    SELECT id, reference, normalize_reference(reference) as normalized
    FROM memory_items
    WHERE reference != normalize_reference(reference)
  LOOP
    diff_count := diff_count + 1;
    RAISE NOTICE 'Would normalize: "%" -> "%"', rec.reference, rec.normalized;
  END LOOP;
  
  IF diff_count > 0 THEN
    RAISE NOTICE 'Total references to normalize: %', diff_count;
  ELSE
    RAISE NOTICE 'All references already normalized';
  END IF;
END $$;

-- Clean up the temporary function
DROP FUNCTION normalize_reference(text);

-- Add comment to remind future developers
COMMENT ON CONSTRAINT memory_items_reference_unique ON memory_items 
IS 'References must be unique. Use validateBibleReference() to normalize before storing.';

-- Note: Actual normalization is handled by application code via validateBibleReference()
-- This migration serves as a check and documentation of the requirement
