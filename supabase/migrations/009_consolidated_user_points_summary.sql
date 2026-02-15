-- Consolidated migration: user_points_summary view with all current fields
DROP VIEW IF EXISTS user_points_summary;

CREATE VIEW user_points_summary AS
SELECT
  u.id,
  u.name,
  u.is_leader,
  u.notes,
  u.display_accommodation_note,
  u."emojiIcon",
  COALESCE(SUM(v.points_awarded), 0) 
    + COALESCE(SUM(b.points_awarded), 0) 
    - COALESCE(SUM(s.points_spent), 0) AS current_points
FROM users u
LEFT JOIN verse_records v ON v.user_id = u.id
LEFT JOIN bonus_records b ON b.user_id = u.id
LEFT JOIN spend_records s ON s.user_id = u.id AND s.undone = false
GROUP BY u.id, u.name, u.is_leader, u.notes, u.display_accommodation_note, u."emojiIcon";
