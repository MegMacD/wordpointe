-- Fix user_points_summary view to include total_earned and legacy points
-- This fixes the leaderboard and ensures legacy points from users.total_points are included

DROP VIEW IF EXISTS user_points_summary;

CREATE VIEW user_points_summary AS
SELECT
  u.id,
  u.name,
  u.is_leader,
  u.notes,
  u.display_accommodation_note,
  u."emojiIcon",
  -- Total points earned (lifetime, not reduced by spending) - used for leaderboard
  -- Includes legacy points from users.total_points column
  COALESCE(u.total_points, 0)
    + COALESCE(SUM(v.points_awarded), 0) 
    + COALESCE(SUM(b.points_awarded), 0) AS total_earned,
  -- Current spendable balance (earned minus spent) - used for reports
  -- Includes legacy points from users.total_points column
  COALESCE(u.total_points, 0)
    + COALESCE(SUM(v.points_awarded), 0) 
    + COALESCE(SUM(b.points_awarded), 0) 
    - COALESCE(SUM(s.points_spent), 0) AS current_points
FROM users u
LEFT JOIN verse_records v ON v.user_id = u.id
LEFT JOIN bonus_records b ON b.user_id = u.id
LEFT JOIN spend_records s ON s.user_id = u.id AND s.undone = false
GROUP BY u.id, u.name, u.is_leader, u.notes, u.display_accommodation_note, u."emojiIcon", u.total_points;

COMMENT ON VIEW user_points_summary IS 'User points with total_earned (lifetime) and current_points (spendable balance), including legacy points from users.total_points';

-- Verify the fix
SELECT name, total_earned, current_points 
FROM user_points_summary 
WHERE total_earned > 0 OR current_points > 0
ORDER BY total_earned DESC 
LIMIT 10;
