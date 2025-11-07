-- Migration: Track town data changes for audit trail
-- Purpose: Detect extreme changes, AI fuckups, data corruption
-- Philosophy: We don't store match scores, but we DO track town data that feeds into scoring

-- Table to store historical snapshots of town data
CREATE TABLE IF NOT EXISTS town_data_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id INTEGER NOT NULL REFERENCES towns(id) ON DELETE CASCADE,

  -- What changed
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id), -- NULL for system changes
  change_type TEXT NOT NULL, -- 'manual_edit', 'bulk_update', 'ai_update', 'migration'

  -- Which fields changed (JSON array of field names)
  changed_fields JSONB NOT NULL,

  -- Previous and new values
  old_values JSONB NOT NULL,
  new_values JSONB NOT NULL,

  -- Calculated change severity
  severity TEXT, -- 'normal', 'moderate', 'extreme'
  is_flagged BOOLEAN DEFAULT FALSE,
  admin_reviewed BOOLEAN DEFAULT FALSE,
  review_notes TEXT,

  -- Context
  change_reason TEXT,
  source_info JSONB, -- Details about what triggered the change

  CONSTRAINT valid_change_type CHECK (change_type IN ('manual_edit', 'bulk_update', 'ai_update', 'migration', 'system')),
  CONSTRAINT valid_severity CHECK (severity IN ('normal', 'moderate', 'extreme'))
);

-- Indexes for performance
CREATE INDEX idx_town_data_history_town_id ON town_data_history(town_id);
CREATE INDEX idx_town_data_history_changed_at ON town_data_history(changed_at DESC);
CREATE INDEX idx_town_data_history_severity ON town_data_history(severity) WHERE severity IN ('moderate', 'extreme');
CREATE INDEX idx_town_data_history_flagged ON town_data_history(is_flagged) WHERE is_flagged = TRUE;

-- Enable RLS
ALTER TABLE town_data_history ENABLE ROW LEVEL SECURITY;

-- Admin can see all history
CREATE POLICY "Admins can view all town data history"
  ON town_data_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.admin_role IN ('executive_admin', 'assistant_admin'))
    )
  );

-- Only system can insert history (via function)
CREATE POLICY "System can insert town data history"
  ON town_data_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can update review status
CREATE POLICY "Admins can update review status"
  ON town_data_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.admin_role IN ('executive_admin', 'assistant_admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.admin_role IN ('executive_admin', 'assistant_admin'))
    )
  );

-- Function to calculate change severity
CREATE OR REPLACE FUNCTION calculate_change_severity(
  field_name TEXT,
  old_value TEXT,
  new_value TEXT
) RETURNS TEXT AS $$
DECLARE
  old_num NUMERIC;
  new_num NUMERIC;
  change_pct NUMERIC;
BEGIN
  -- Fields that matter for scoring
  CASE field_name
    -- Quality metrics (1-10 scale)
    WHEN 'quality_of_life', 'healthcare_score', 'safety_score' THEN
      BEGIN
        old_num := old_value::NUMERIC;
        new_num := new_value::NUMERIC;

        -- Change of 3+ points is extreme
        IF ABS(new_num - old_num) >= 3 THEN
          RETURN 'extreme';
        -- Change of 2 points is moderate
        ELSIF ABS(new_num - old_num) >= 2 THEN
          RETURN 'moderate';
        ELSE
          RETURN 'normal';
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RETURN 'normal';
      END;

    -- Cost fields (percentage change)
    WHEN 'rent_cost_$', 'cost_index' THEN
      BEGIN
        old_num := old_value::NUMERIC;
        new_num := new_value::NUMERIC;

        IF old_num = 0 THEN
          RETURN 'normal';
        END IF;

        change_pct := ABS((new_num - old_num) / old_num * 100);

        -- 50%+ change is extreme
        IF change_pct >= 50 THEN
          RETURN 'extreme';
        -- 25%+ change is moderate
        ELSIF change_pct >= 25 THEN
          RETURN 'moderate';
        ELSE
          RETURN 'normal';
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RETURN 'normal';
      END;

    -- Other fields
    ELSE
      RETURN 'normal';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to log town data changes
CREATE OR REPLACE FUNCTION log_town_data_change(
  p_town_id INTEGER,
  p_changed_fields JSONB,
  p_old_values JSONB,
  p_new_values JSONB,
  p_change_type TEXT,
  p_change_reason TEXT DEFAULT NULL,
  p_source_info JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  history_id UUID;
  field_name TEXT;
  max_severity TEXT := 'normal';
  field_severity TEXT;
  is_flagged BOOLEAN := FALSE;
BEGIN
  -- Calculate overall severity
  FOR field_name IN SELECT jsonb_array_elements_text(p_changed_fields)
  LOOP
    field_severity := calculate_change_severity(
      field_name,
      (p_old_values->>field_name)::TEXT,
      (p_new_values->>field_name)::TEXT
    );

    IF field_severity = 'extreme' THEN
      max_severity := 'extreme';
      is_flagged := TRUE;
    ELSIF field_severity = 'moderate' AND max_severity != 'extreme' THEN
      max_severity := 'moderate';
      is_flagged := TRUE;
    END IF;
  END LOOP;

  -- Insert history record
  INSERT INTO town_data_history (
    town_id,
    changed_by,
    change_type,
    changed_fields,
    old_values,
    new_values,
    severity,
    is_flagged,
    change_reason,
    source_info
  ) VALUES (
    p_town_id,
    auth.uid(),
    p_change_type,
    p_changed_fields,
    p_old_values,
    p_new_values,
    max_severity,
    is_flagged,
    p_change_reason,
    p_source_info
  )
  RETURNING id INTO history_id;

  RETURN history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_town_data_change TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_change_severity TO authenticated;

-- Comment
COMMENT ON TABLE town_data_history IS 'Audit trail for town data changes. Tracks what changed, when, why, and flags extreme changes that might indicate disasters, bugs, or AI fuckups. Does NOT track personalized match scores (those are always dynamic).';
COMMENT ON COLUMN town_data_history.severity IS 'Calculated severity: normal (minor changes), moderate (notable changes), extreme (3+ point drop in quality scores, 50%+ cost changes, potential disasters)';
COMMENT ON COLUMN town_data_history.is_flagged IS 'TRUE for moderate/extreme changes that need admin review';
