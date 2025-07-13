-- COMPLETE USER DELETION - ZERO MEMORY LEFT
-- This ensures when a user is deleted, ALL traces are removed from database
-- User can re-register with same email like a fresh start

-- First, let's see what tables reference users
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'users';

-- Update ALL foreign keys to CASCADE DELETE for complete cleanup
-- This ensures when a user is deleted, EVERYTHING related to them is deleted

-- 1. Chat messages
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 2. Onboarding responses  
ALTER TABLE onboarding_responses 
DROP CONSTRAINT IF EXISTS onboarding_responses_user_id_fkey;

ALTER TABLE onboarding_responses
ADD CONSTRAINT onboarding_responses_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 3. User preferences
ALTER TABLE user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 4. Favorites
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

ALTER TABLE favorites
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 5. Any other user-related tables (add more as needed)
-- Check for any other foreign key references and add them here

-- Create a function to completely delete a user and all traces
CREATE OR REPLACE FUNCTION complete_user_deletion(target_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    deleted_email TEXT;
BEGIN
    -- Get the email before deletion for confirmation
    SELECT email INTO deleted_email FROM auth.users WHERE id = target_user_id;
    
    -- Delete from auth.users (this will cascade to all related tables)
    DELETE FROM auth.users WHERE id = target_user_id;
    
    -- Delete from public.users (this will cascade to all related tables)
    DELETE FROM public.users WHERE id = target_user_id;
    
    -- Return confirmation
    RETURN 'User ' || COALESCE(deleted_email, 'unknown') || ' and ALL associated data completely deleted. Email can be reused immediately.';
END;
$$ LANGUAGE plpgsql;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION complete_user_deletion TO authenticated;

-- Test the function (uncomment to test with a specific user)
-- SELECT complete_user_deletion('user-id-here');

-- Verify all foreign keys are set to CASCADE
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND kcu.column_name = 'user_id'
ORDER BY tc.table_name;