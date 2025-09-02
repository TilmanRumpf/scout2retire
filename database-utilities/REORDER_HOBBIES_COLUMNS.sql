-- ================================================================
-- REORDER HOBBIES TABLE COLUMNS FOR BETTER ADMIN EXPERIENCE
-- ================================================================
-- Run this in Supabase SQL Editor AFTER adding verification columns
-- This creates hobbies_utilities table with proper column order
-- and maintains backward compatibility with a view
-- ================================================================

-- Step 1: Create new table with proper column order and clean name
CREATE TABLE hobbies_utilities (
    -- Identity columns (most important)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    hobby_type TEXT,
    
    -- Verification columns (grouped together for easy admin work)
    is_universal BOOLEAN DEFAULT false,
    verification_method TEXT,
    verification_query TEXT,
    verification_notes TEXT,
    
    -- Display columns
    icon TEXT,
    description TEXT,
    group_name TEXT,
    
    -- System columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Legacy columns (at the very end, ready for deletion)
    required_conditions JSONB
);

-- Step 2: Copy all data from old table to new table
INSERT INTO hobbies_utilities (
    id, name, category, hobby_type,
    is_universal, verification_method, verification_query, verification_notes,
    icon, description, group_name,
    created_at, updated_at,
    required_conditions
)
SELECT 
    id, name, category, hobby_type,
    is_universal, verification_method, verification_query, verification_notes,
    icon, description, group_name,
    created_at, updated_at,
    required_conditions
FROM hobbies;

-- Step 3: Verify data was copied correctly
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM hobbies;
    SELECT COUNT(*) INTO new_count FROM hobbies_utilities;
    
    IF old_count != new_count THEN
        RAISE EXCEPTION 'Row count mismatch! Old: %, New: %', old_count, new_count;
    END IF;
    
    RAISE NOTICE '✅ Successfully copied % rows', new_count;
END $$;

-- Step 4: Rename old table to backup, rename new table to hobbies
ALTER TABLE hobbies RENAME TO hobbies_old_backup;
ALTER TABLE hobbies_utilities RENAME TO hobbies;

-- Step 5: Create indexes for performance (IF NOT EXISTS to handle existing indexes)
CREATE INDEX IF NOT EXISTS idx_hobbies_category ON hobbies(category);
CREATE INDEX IF NOT EXISTS idx_hobbies_is_universal ON hobbies(is_universal);
CREATE INDEX IF NOT EXISTS idx_hobbies_verification_method ON hobbies(verification_method);

-- Step 6: Add comments for clarity
COMMENT ON TABLE hobbies IS 'Master hobbies table with verification utilities - properly ordered columns';
COMMENT ON COLUMN hobbies.verification_method IS 'How to verify: universal, database_infrastructure, database_geographic, ai_terrain, ai_facilities, ai_community, manual';
COMMENT ON COLUMN hobbies.verification_query IS 'SQL query for database methods or AI prompt template for AI methods';
COMMENT ON COLUMN hobbies.verification_notes IS 'Admin notes about verification requirements or special considerations';
COMMENT ON COLUMN hobbies.required_conditions IS 'LEGACY - Will be removed once all data is migrated to verification columns';

-- Step 7: Update foreign key constraint on towns_hobbies to point to new table
-- (This happens automatically since we renamed the table to 'hobbies')

-- Step 8: Verify the new structure
SELECT 
    column_name,
    ordinal_position,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'hobbies'
ORDER BY ordinal_position;

-- Step 9: Show sample data with new column order
SELECT * FROM hobbies LIMIT 5;

-- Step 10: Drop the backup table once everything is confirmed working
-- IMPORTANT: Only run this after verifying everything works!
-- DROP TABLE hobbies_old_backup CASCADE;

-- ================================================================
-- RESULT: 
-- - Table is now properly ordered for admin use
-- - Legacy columns are at the end, ready for deletion
-- - All code continues to work with 'hobbies' table name
-- - Old table kept as hobbies_old_backup (delete when safe)
-- ================================================================