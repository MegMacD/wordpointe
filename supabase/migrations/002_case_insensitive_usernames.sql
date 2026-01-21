-- Migration: Case-insensitive unique usernames
-- This prevents duplicate usernames with different capitalizations (e.g., "Admin" vs "admin")

-- Create a case-insensitive unique index on the name column
-- This uses LOWER() to ensure uniqueness regardless of capitalization
CREATE UNIQUE INDEX IF NOT EXISTS users_name_lower_unique 
ON users (LOWER(name));

-- Note: This will fail if you already have duplicate names with different cases
-- If the migration fails, you'll need to manually clean up duplicates first:
--
-- To find duplicates:
-- SELECT LOWER(name) as lower_name, COUNT(*) 
-- FROM users 
-- GROUP BY LOWER(name) 
-- HAVING COUNT(*) > 1;
--
-- Then delete or rename the duplicates before running this migration again
