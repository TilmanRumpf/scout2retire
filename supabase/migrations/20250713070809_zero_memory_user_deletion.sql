-- ZERO MEMORY USER DELETION SETUP
-- When user is deleted, ALL traces vanish, email can be reused immediately

-- Update all foreign keys to CASCADE DELETE for complete cleanup

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
    RETURN 'User ' || COALESCE(deleted_email, 'unknown') || ' and ALL associated data completely deleted. Email can be reused immediately like a fresh bird.';
END;
$$ LANGUAGE plpgsql;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION complete_user_deletion TO authenticated;