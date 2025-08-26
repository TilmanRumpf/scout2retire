-- Fix foreign key constraint to allow cascading deletes
-- This will make child records automatically delete when the parent user is deleted

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE onboarding_responses 
DROP CONSTRAINT IF EXISTS onboarding_responses_user_id_fkey;

-- Step 2: Re-add the foreign key with CASCADE DELETE behavior
ALTER TABLE onboarding_responses
ADD CONSTRAINT onboarding_responses_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Do the same for other tables that might reference users
-- Favorites table
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

ALTER TABLE favorites
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- User preferences table (if it exists)
ALTER TABLE user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Now you can delete the user and all related data will be automatically deleted
DELETE FROM users WHERE id = '2441b980-2f30-4986-a86d-c32c18c781ea';

-- Verify the user and related data are gone
SELECT 'Users table:' as table_name, COUNT(*) as count FROM users WHERE id = '2441b980-2f30-4986-a86d-c32c18c781ea'
UNION ALL
SELECT 'Onboarding responses:', COUNT(*) FROM onboarding_responses WHERE user_id = '2441b980-2f30-4986-a86d-c32c18c781ea'
UNION ALL
SELECT 'Favorites:', COUNT(*) FROM favorites WHERE user_id = '2441b980-2f30-4986-a86d-c32c18c781ea';