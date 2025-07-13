-- Fix ALL foreign key constraints to CASCADE DELETE when user is deleted
-- This prevents "foreign key constraint" errors when deleting users

-- 1. Fix onboarding_responses
ALTER TABLE onboarding_responses 
DROP CONSTRAINT IF EXISTS onboarding_responses_user_id_fkey;

ALTER TABLE onboarding_responses
ADD CONSTRAINT onboarding_responses_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 2. Fix favorites
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

ALTER TABLE favorites
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 3. Fix user_preferences
ALTER TABLE user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 4. Fix chat_messages
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;