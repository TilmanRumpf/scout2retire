-- =============================================================================
-- FIX: Add 'name' column back as computed alias for 'town_name'
-- =============================================================================
-- Problem: Frontend code expects town.name but database was changed to town_name
-- Solution: Add generated column 'name' that mirrors 'town_name'
-- Date: 2025-11-04
-- =============================================================================

-- Add 'name' as a generated column that always equals 'town_name'
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS name TEXT
GENERATED ALWAYS AS (town_name) STORED;

-- Create index on the generated column for query performance
CREATE INDEX IF NOT EXISTS idx_towns_name ON towns(name);

-- Verify the column was added
SELECT column_name, data_type, is_generated
FROM information_schema.columns
WHERE table_name = 'towns'
AND column_name IN ('name', 'town_name');