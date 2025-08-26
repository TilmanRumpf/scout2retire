-- Comprehensive fix for ALL foreign key constraints to allow user deletion
-- This will update ALL tables that reference users to CASCADE DELETE

-- 1. Drop and recreate foreign key for onboarding_responses
ALTER TABLE onboarding_responses 
DROP CONSTRAINT IF EXISTS onboarding_responses_user_id_fkey;

ALTER TABLE onboarding_responses
ADD CONSTRAINT onboarding_responses_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 2. Drop and recreate foreign key for favorites
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

ALTER TABLE favorites
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 3. Drop and recreate foreign key for user_preferences
ALTER TABLE user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 4. Drop and recreate foreign key for chat_messages (NEW!)
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 5. Check for any other tables that might reference users
-- This query will show all foreign keys that reference the users table
SELECT 
    tc.table_name, 
    tc.constraint_name,
    ccu.column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'users'
ORDER BY tc.table_name;

-- Now you can delete users without any foreign key issues
-- Example: DELETE FROM users WHERE id = 'some-user-id';