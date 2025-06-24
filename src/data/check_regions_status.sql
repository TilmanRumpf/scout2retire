-- Check what regions infrastructure already exists

-- 1. Check if regions table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'regions'
) as regions_table_exists;

-- 2. Check if country_regions table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'country_regions'
) as country_regions_table_exists;

-- 3. Check if towns has regions column
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'towns' 
    AND column_name = 'regions'
) as towns_regions_column_exists;

-- 4. List existing regions
SELECT * FROM regions ORDER BY type, name;

-- 5. Count country-region mappings
SELECT COUNT(*) as mapping_count FROM country_regions;

-- 6. Check sample of towns with regions
SELECT id, name, country, regions 
FROM towns 
WHERE regions IS NOT NULL AND array_length(regions, 1) > 0
LIMIT 10;

-- 7. Check towns without regions
SELECT COUNT(*) as towns_without_regions 
FROM towns 
WHERE regions IS NULL OR array_length(regions, 1) = 0;