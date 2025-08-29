-- Migration: Rename town_hobbies to towns_hobbies for consistent naming convention
-- Date: 2025-08-29
-- Purpose: Fix inconsistent table naming (town_hobbies -> towns_hobbies)

-- Step 1: Rename the table
ALTER TABLE IF EXISTS town_hobbies RENAME TO towns_hobbies;

-- Step 2: Rename the indexes
ALTER INDEX IF EXISTS idx_town_hobbies_town_id RENAME TO idx_towns_hobbies_town_id;
ALTER INDEX IF EXISTS idx_town_hobbies_hobby_id RENAME TO idx_towns_hobbies_hobby_id;

-- Step 3: Update any RLS policies (they reference the new table name automatically)
-- No action needed - policies follow the table rename

-- Step 4: Update any functions that might reference the old table name
-- Note: If you have stored procedures or functions using 'town_hobbies', 
-- they will need to be updated separately

-- Verification query (run manually to confirm):
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('town_hobbies', 'towns_hobbies');