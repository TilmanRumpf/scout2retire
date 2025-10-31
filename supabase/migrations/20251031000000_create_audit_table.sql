-- Create town_field_audits table to store AI confidence assessments
CREATE TABLE IF NOT EXISTS town_field_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'limited', 'low', 'unknown', 'not_editable')),
  audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  audited_by UUID REFERENCES auth.users(id),

  -- Prevent duplicate entries for same town+field
  UNIQUE(town_id, field_name)
);

-- Index for fast lookups by town
CREATE INDEX idx_town_field_audits_town_id ON town_field_audits(town_id);

-- Index for finding recently audited fields
CREATE INDEX idx_town_field_audits_audited_at ON town_field_audits(audited_at DESC);

-- Enable RLS
ALTER TABLE town_field_audits ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read audit results
CREATE POLICY "Anyone can view audit results"
  ON town_field_audits
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert/update audit results
CREATE POLICY "Authenticated users can audit"
  ON town_field_audits
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE town_field_audits IS 'Stores AI confidence assessments for each field in each town. Updated when user clicks Audit button.';
