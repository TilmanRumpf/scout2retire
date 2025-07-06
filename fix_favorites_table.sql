-- Check current favorites table structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'favorites' 
ORDER BY ordinal_position;

-- Add town_country column if it doesn't exist
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS town_country TEXT;

-- Verify the column was added
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'favorites'
AND column_name = 'town_country';