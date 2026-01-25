-- Fix the user_points_summary view to prevent cartesian product
-- The previous view using JOINs caused point totals to be multiplied incorrectly
-- when users had multiple verse records combined with spend records

DROP VIEW IF EXISTS user_points_summary;

CREATE VIEW user_points_summary AS
SELECT
  u.id,
  u.name,
  u.is_leader,
  (SELECT COALESCE(SUM(points_awarded), 0) FROM verse_records WHERE user_id = u.id)
    + (SELECT COALESCE(SUM(points_awarded), 0) FROM bonus_records WHERE user_id = u.id)
    - (SELECT COALESCE(SUM(points_spent), 0) FROM spend_records WHERE user_id = u.id AND undone = false)
    AS current_points
FROM users u;

COMMENT ON VIEW user_points_summary IS 'Calculates current points using subqueries to avoid cartesian product from JOINs';
