-- Force Supabase to refresh its schema cache
-- Run this in the Supabase SQL editor

-- 1. First verify the favorites table structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'favorites' 
ORDER BY ordinal_position;

-- 2. If town_country column is missing, add it
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS town_country TEXT NOT NULL DEFAULT '';

-- 3. Force a schema cache refresh by creating and dropping a temporary function
CREATE OR REPLACE FUNCTION refresh_schema_cache_temp()
RETURNS void AS $$
BEGIN
    -- This forces Supabase to refresh its schema cache
    RAISE NOTICE 'Schema cache refresh triggered';
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION refresh_schema_cache_temp();

-- 4. Verify the column now exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'favorites' 
AND column_name = 'town_country';