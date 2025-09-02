-- ================================================================
-- MANUAL SQL TO ADD VERIFICATION COLUMNS TO HOBBIES TABLE
-- ================================================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/editor
-- ================================================================

-- Step 1: Add the three verification columns
ALTER TABLE hobbies ADD COLUMN IF NOT EXISTS verification_method TEXT;
ALTER TABLE hobbies ADD COLUMN IF NOT EXISTS verification_query TEXT;  
ALTER TABLE hobbies ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Step 2: Add helpful comments for administrators
COMMENT ON COLUMN hobbies.verification_method IS 'How to verify this hobby: universal, database_infrastructure, database_geographic, ai_terrain, ai_facilities, ai_community, manual';
COMMENT ON COLUMN hobbies.verification_query IS 'SQL query for database methods or AI prompt template for AI methods';
COMMENT ON COLUMN hobbies.verification_notes IS 'Admin notes about verification requirements or special considerations';

-- Step 3: Migrate existing verification data from required_conditions JSONB
UPDATE hobbies
SET 
  verification_method = required_conditions->'verification'->>'method',
  verification_query = COALESCE(
    required_conditions->'verification'->>'query',
    required_conditions->'verification'->>'verification_query',
    required_conditions->'verification'->>'ai_prompt'
  ),
  verification_notes = required_conditions->'verification'->>'notes'
WHERE required_conditions->'verification' IS NOT NULL;

-- Step 4: Verify the migration
SELECT 
  name,
  verification_method,
  verification_query,
  verification_notes
FROM hobbies
WHERE verification_method IS NOT NULL
ORDER BY name
LIMIT 10;

-- ================================================================
-- VERIFICATION METHODS REFERENCE:
-- ================================================================
-- universal: Available everywhere, no verification needed
-- database_infrastructure: Check columns like golf_courses_count > 0
-- database_geographic: Check columns like distance_to_ocean_km < 10
-- ai_terrain: AI verifies natural features (cliffs, caves, rivers)
-- ai_facilities: AI checks local businesses (studios, shops, centers)
-- ai_community: AI verifies local culture/scene (wine culture, surf community)
-- manual: Too complex for automated verification
-- ================================================================