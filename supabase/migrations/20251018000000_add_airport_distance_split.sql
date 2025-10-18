-- ADD SPLIT AIRPORT DISTANCE FIELDS
-- Created: 2025-10-18
-- Purpose: Split airport_distance into regional and international for better admin transparency
-- Context: Exec admins need to distinguish between regional vs international airport access

-- Add new columns for split airport distances
ALTER TABLE towns
  ADD COLUMN IF NOT EXISTS regional_airport_distance integer,
  ADD COLUMN IF NOT EXISTS international_airport_distance integer;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_towns_regional_airport_distance ON towns(regional_airport_distance) WHERE regional_airport_distance IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_towns_international_airport_distance ON towns(international_airport_distance) WHERE international_airport_distance IS NOT NULL;

-- Add comments
COMMENT ON COLUMN towns.regional_airport_distance IS 'Distance in km to nearest regional airport (domestic flights only)';
COMMENT ON COLUMN towns.international_airport_distance IS 'Distance in km to nearest international airport (direct international flights)';
COMMENT ON COLUMN towns.airport_distance IS 'Distance in km to nearest airport of any type (fallback/legacy field)';

-- Backfill strategy notes:
-- 1. Parse nearest_airport field to determine type
-- 2. Check international_access field for "regional_airport" vs "connecting_international_flights"
-- 3. Manual review of ~50 ambiguous cases where town has both regional AND international
