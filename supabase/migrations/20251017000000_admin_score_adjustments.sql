-- ADMIN SCORE ADJUSTMENTS TABLE
-- Created: 2025-10-17
-- Purpose: Store manual basis point adjustments to calculated admin scores
-- Enables exec admins to override algorithm calculations with documented reasons

-- Create the adjustments table
CREATE TABLE IF NOT EXISTS admin_score_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Town reference (nullable for system-wide adjustments)
  town_id UUID REFERENCES towns(id) ON DELETE CASCADE,

  -- Scoring category and subcategory
  category TEXT NOT NULL CHECK (category IN ('healthcare', 'safety', 'government', 'visa', 'environmental', 'political')),
  subcategory TEXT, -- e.g., 'Healthcare Quality', 'Safety', etc.

  -- Adjustment details
  adjustment_value DECIMAL(5,2) NOT NULL CHECK (adjustment_value BETWEEN -5.0 AND 5.0), -- basis points
  reason TEXT NOT NULL CHECK (LENGTH(reason) >= 10), -- minimum 10 chars for audit trail

  -- Scope of adjustment
  applies_to TEXT NOT NULL DEFAULT 'this_town' CHECK (applies_to IN ('this_town', 'all_islands', 'all_towns', 'custom_filter')),
  filter_criteria JSONB, -- for custom filters (e.g., {"geographic_features_actual": ["island"]})

  -- Audit trail
  created_by TEXT NOT NULL, -- user email or ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT true, -- soft delete support

  -- Notes for future reference
  notes TEXT
);

-- Add indexes for performance
CREATE INDEX idx_admin_score_adjustments_town_id ON admin_score_adjustments(town_id) WHERE active = true;
CREATE INDEX idx_admin_score_adjustments_category ON admin_score_adjustments(category) WHERE active = true;
CREATE INDEX idx_admin_score_adjustments_applies_to ON admin_score_adjustments(applies_to) WHERE active = true;
CREATE INDEX idx_admin_score_adjustments_created_by ON admin_score_adjustments(created_by);
CREATE INDEX idx_admin_score_adjustments_created_at ON admin_score_adjustments(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_score_adjustments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_score_adjustments_updated_at
  BEFORE UPDATE ON admin_score_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_score_adjustments_updated_at();

-- Enable RLS
ALTER TABLE admin_score_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users (will be restricted to admins in app logic)
CREATE POLICY "Authenticated users can view adjustments"
  ON admin_score_adjustments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert adjustments"
  ON admin_score_adjustments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update adjustments"
  ON admin_score_adjustments
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete adjustments"
  ON admin_score_adjustments
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Add helpful comments
COMMENT ON TABLE admin_score_adjustments IS 'Manual basis point adjustments to calculated admin scores with full audit trail';
COMMENT ON COLUMN admin_score_adjustments.adjustment_value IS 'Basis points to add/subtract from calculated score (-5.0 to +5.0)';
COMMENT ON COLUMN admin_score_adjustments.applies_to IS 'Scope: this_town (single), all_islands (all island towns), all_towns (global), custom_filter (JSONB criteria)';
COMMENT ON COLUMN admin_score_adjustments.filter_criteria IS 'JSONB filter for custom_filter scope, e.g., {"geographic_features_actual": ["island"]}';
COMMENT ON COLUMN admin_score_adjustments.reason IS 'Required explanation for adjustment (min 10 chars) - critical for audit trail';
