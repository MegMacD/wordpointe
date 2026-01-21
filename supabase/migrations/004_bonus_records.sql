-- Bonus/Adjustment Records Table
-- This allows admins to grant arbitrary points to users
-- Use cases:
--   - Legacy points from previous system when adding a new user
--   - Bonus points for special occasions/achievements
--   - Correction points if there's an error or missing points
--   - Can also be negative for point deductions (though less common)

CREATE TABLE bonus_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  points_awarded int NOT NULL, -- Can be negative for deductions
  reason text NOT NULL, -- Required explanation for audit trail
  category text CHECK (category IN ('legacy', 'bonus', 'correction', 'other')) DEFAULT 'bonus',
  awarded_by text, -- Optional: track which admin granted it
  awarded_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX bonus_records_user_id_idx ON bonus_records(user_id);
CREATE INDEX bonus_records_awarded_at_idx ON bonus_records(awarded_at);

-- Update the user_points_summary view to include bonus points
DROP VIEW IF EXISTS user_points_summary;

CREATE VIEW user_points_summary AS
SELECT
  u.id,
  u.name,
  u.is_leader,
  COALESCE(SUM(v.points_awarded), 0) 
    + COALESCE(SUM(b.points_awarded), 0) 
    - COALESCE(SUM(s.points_spent), 0) AS current_points
FROM users u
LEFT JOIN verse_records v ON v.user_id = u.id
LEFT JOIN bonus_records b ON b.user_id = u.id
LEFT JOIN spend_records s ON s.user_id = u.id AND s.undone = false
GROUP BY u.id, u.name, u.is_leader;

-- Add comment for documentation
COMMENT ON TABLE bonus_records IS 'Tracks admin-granted bonus points, legacy points, corrections, and other adjustments';
COMMENT ON COLUMN bonus_records.points_awarded IS 'Points to add (positive) or deduct (negative)';
COMMENT ON COLUMN bonus_records.reason IS 'Required explanation for audit trail';
COMMENT ON COLUMN bonus_records.category IS 'Type of bonus: legacy, bonus, correction, or other';
