-- Fix favorites table foreign key relationship to towns table
-- This will enable the towns:town_id(*) syntax in Supabase queries

-- First, check current structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- Check if foreign key already exists
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    a.attname AS column_name,
    confrelid::regclass AS foreign_table_name,
    af.attname AS foreign_column_name
FROM pg_constraint
JOIN pg_attribute a ON a.attnum = ANY(conkey) AND a.attrelid = conrelid
JOIN pg_attribute af ON af.attnum = ANY(confkey) AND af.attrelid = confrelid
WHERE conrelid = 'favorites'::regclass
AND contype = 'f';

-- Add the foreign key constraint if it doesn't exist
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'favorites_town_id_fkey' 
        AND conrelid = 'favorites'::regclass
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE favorites
        ADD CONSTRAINT favorites_town_id_fkey 
        FOREIGN KEY (town_id) 
        REFERENCES towns(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Verify the constraint was added
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS references_table
FROM pg_constraint
WHERE conrelid = 'favorites'::regclass
AND contype = 'f';

-- Also add primary key if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE contype = 'p' 
        AND conrelid = 'favorites'::regclass
    ) THEN
        ALTER TABLE favorites
        ADD PRIMARY KEY (user_id, town_id);
        
        RAISE NOTICE 'Primary key added successfully';
    ELSE
        RAISE NOTICE 'Primary key already exists';
    END IF;
END $$;

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_town_id ON favorites(town_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Final check
SELECT 
    'Table structure fixed' AS status,
    COUNT(*) AS total_favorites
FROM favorites;