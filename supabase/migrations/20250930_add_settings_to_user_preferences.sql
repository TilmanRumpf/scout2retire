-- Add notification and privacy settings to existing user_preferences table
-- NO new tables - expand existing good table

-- Add notification preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{
  "email_notifications": true,
  "push_notifications": false,
  "weekly_digest": true,
  "friend_requests": true
}'::jsonb;

-- Add privacy preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS privacy JSONB DEFAULT '{
  "profile_visibility": "friends",
  "show_email": false,
  "show_location": true
}'::jsonb;

-- Initialize for existing users (set defaults for rows that have NULL)
UPDATE public.user_preferences
SET notifications = '{
  "email_notifications": true,
  "push_notifications": false,
  "weekly_digest": true,
  "friend_requests": true
}'::jsonb
WHERE notifications IS NULL;

UPDATE public.user_preferences
SET privacy = '{
  "profile_visibility": "friends",
  "show_email": false,
  "show_location": true
}'::jsonb
WHERE privacy IS NULL;

-- Add helpful comment
COMMENT ON COLUMN public.user_preferences.notifications IS 'User notification preferences - email, push, digest settings';
COMMENT ON COLUMN public.user_preferences.privacy IS 'User privacy settings - profile visibility, email/location sharing';