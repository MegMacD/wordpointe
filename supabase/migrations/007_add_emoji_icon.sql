-- Add emoji icon support to users table
-- This allows users to select an emoji as their profile icon

-- Add emojiIcon column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emojiIcon" text;

-- Update the user_points_summary view to include emojiIcon
DROP VIEW IF EXISTS user_points_summary;

CREATE VIEW user_points_summary AS
SELECT
  u.id,
  u.name,
  u.is_leader,
  u."emojiIcon",
  -- Total points earned (not reduced by spending)
  (SELECT COALESCE(SUM(points_awarded), 0) FROM verse_records WHERE user_id = u.id)
    + (SELECT COALESCE(SUM(points_awarded), 0) FROM bonus_records WHERE user_id = u.id)
    AS total_earned,
  -- Current spendable balance (earned minus spent)
  (SELECT COALESCE(SUM(points_awarded), 0) FROM verse_records WHERE user_id = u.id)
    + (SELECT COALESCE(SUM(points_awarded), 0) FROM bonus_records WHERE user_id = u.id)
    - (SELECT COALESCE(SUM(points_spent), 0) FROM spend_records WHERE user_id = u.id AND undone = false)
    AS current_points
FROM users u;

COMMENT ON VIEW user_points_summary IS 'User points with emojiIcon, total_earned (lifetime) and current_points (spendable balance)';
