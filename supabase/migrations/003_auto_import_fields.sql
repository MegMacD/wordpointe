-- Add bible_version field and unique constraint on reference
-- Supports auto-creation of verses on-demand

ALTER TABLE memory_items
ADD COLUMN IF NOT EXISTS bible_version text DEFAULT 'ESV';

-- Add unique constraint on reference to prevent duplicates
ALTER TABLE memory_items
ADD CONSTRAINT memory_items_reference_unique UNIQUE (reference);

-- Add comment for documentation
COMMENT ON COLUMN memory_items.bible_version IS 'Bible version used for this verse (ESV, KJV, NIV, etc)';
