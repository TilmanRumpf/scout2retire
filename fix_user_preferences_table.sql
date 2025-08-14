-- Fix user_preferences table to support hobbies properly
-- Run this in Supabase SQL Editor

-- Add the missing custom_activities column
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS custom_activities JSONB;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name IN ('activities', 'interests', 'custom_activities', 'travel_frequency')
ORDER BY column_name;

-- The result should show:
-- activities         | jsonb
-- custom_activities  | jsonb
-- interests          | jsonb
-- travel_frequency   | text