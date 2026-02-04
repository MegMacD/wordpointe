-- Add total_earned column to user_points_summary view
-- This tracks total points earned (verses + bonuses) separate from current spendable balance

DROP VIEW IF EXISTS user_points_summary;

CREATE VIEW user_points_summary AS
SELECT
  u.id,
  u.name,
  u.is_leader,
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

COMMENT ON VIEW user_points_summary IS 'User points with total_earned (lifetime) and current_points (spendable balance)';
