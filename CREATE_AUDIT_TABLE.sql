-- CREATE AUDIT TABLE FOR STORING FIELD CONFIDENCE ASSESSMENTS
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS town_field_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'limited', 'low', 'unknown', 'not_editable')),
  audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  audited_by UUID,
  UNIQUE(town_id, field_name)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_town_field_audits_town_id ON town_field_audits(town_id);
CREATE INDEX IF NOT EXISTS idx_town_field_audits_audited_at ON town_field_audits(audited_at DESC);

-- Enable RLS
ALTER TABLE town_field_audits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view audit results" ON town_field_audits;
DROP POLICY IF EXISTS "Authenticated users can audit" ON town_field_audits;

-- Policy: Anyone can read audit results
CREATE POLICY "Anyone can view audit results"
  ON town_field_audits
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert/update
CREATE POLICY "Authenticated users can audit"
  ON town_field_audits
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Verify table was created
SELECT 'town_field_audits table created successfully!' AS status;
