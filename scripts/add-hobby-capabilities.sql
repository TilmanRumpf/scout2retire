-- Add lean hobby capabilities columns to towns table
-- This enables efficient hobby matching without complex joins

-- Add columns for lean hobby storage
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS hobby_capabilities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hobby_count INTEGER DEFAULT 0;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_towns_hobby_count ON towns(hobby_count);
CREATE INDEX IF NOT EXISTS idx_towns_hobby_capabilities ON towns USING GIN(hobby_capabilities);

-- Add comment explaining the columns
COMMENT ON COLUMN towns.hobby_capabilities IS 'Array of hobby keywords this town supports (e.g. swimming, golf, hiking)';
COMMENT ON COLUMN towns.hobby_count IS 'Number of hobbies available in this town for quick filtering';

-- Example query to use these columns efficiently:
-- SELECT name, hobby_capabilities, hobby_count 
-- FROM towns 
-- WHERE hobby_capabilities @> ARRAY['swimming', 'golf']  -- Has both swimming AND golf
-- ORDER BY hobby_count DESC;

-- Example query for ANY match:
-- SELECT name, hobby_capabilities
-- FROM towns
-- WHERE hobby_capabilities && ARRAY['swimming', 'golf']  -- Has swimming OR golf

-- After running this SQL, run the migration script:
-- node scripts/migrate-hobbies-lean.js