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
  -- Total earned: sum of all points ever awarded (lifetime)
  COALESCE(
    (SELECT SUM(vr.points_awarded) FROM verse_records vr WHERE vr.user_id = u.id), 0
  ) + COALESCE(
    (SELECT SUM(br.points_awarded) FROM bonus_records br WHERE br.user_id = u.id), 0
  ) AS total_earned,
  -- Current points: lifetime earned minus spent
  COALESCE(
    (SELECT SUM(vr.points_awarded) FROM verse_records vr WHERE vr.user_id = u.id), 0
  ) + COALESCE(
    (SELECT SUM(br.points_awarded) FROM bonus_records br WHERE br.user_id = u.id), 0
  ) - COALESCE(
    (SELECT SUM(sr.points_spent) FROM spend_records sr WHERE sr.user_id = u.id AND sr.undone = false), 0
  ) AS current_points
FROM users u;
