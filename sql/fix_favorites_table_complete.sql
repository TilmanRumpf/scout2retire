-- Complete fix for favorites table foreign key issue
-- This script will fix the foreign key constraint error when favoriting towns

-- 1. First, check if favorites table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites') THEN
        RAISE NOTICE 'Favorites table exists. Checking structure...';
    ELSE
        RAISE NOTICE 'Favorites table does not exist. Will create it.';
    END IF;
END $$;

-- 2. Check current foreign key constraints
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'favorites'::regclass
AND contype = 'f';

-- 3. Drop the existing favorites table (if it exists with wrong structure)
DROP TABLE IF EXISTS favorites CASCADE;

-- 4. Create favorites table with correct structure
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    town_id UUID NOT NULL,
    town_name TEXT NOT NULL,
    town_country TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, town_id)
);

-- 5. Create indexes for performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_town_id ON favorites(town_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- 6. Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Users can see their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Grant permissions
GRANT ALL ON favorites TO authenticated;
GRANT ALL ON favorites TO service_role;

-- 9. Check if saved_locations table exists (alternative name)
-- and migrate data if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_locations') THEN
        RAISE NOTICE 'Found saved_locations table. Migrating data to favorites...';
        
        -- Copy data from saved_locations to favorites
        INSERT INTO favorites (user_id, town_id, town_name, town_country, created_at)
        SELECT user_id, location_id, location_name, country, created_at
        FROM saved_locations
        WHERE user_id IN (SELECT id FROM auth.users)
        ON CONFLICT (user_id, town_id) DO NOTHING;
        
        RAISE NOTICE 'Data migration complete.';
    END IF;
END $$;

-- 10. Verify the fix
SELECT 
    'Favorites table created successfully' AS status,
    COUNT(*) AS total_favorites
FROM favorites;

-- 11. Test with a sample user (optional)
-- SELECT id, email FROM auth.users LIMIT 5;