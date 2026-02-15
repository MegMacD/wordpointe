-- Migration: Add display_accommodation_note flag to users table
ALTER TABLE users ADD COLUMN display_accommodation_note boolean DEFAULT false;
-- Optionally, update existing rows if needed
UPDATE users SET display_accommodation_note = false WHERE display_accommodation_note IS NULL;
