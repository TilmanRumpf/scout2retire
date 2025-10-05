-- Add expanded hobby columns to user_preferences table
-- These store ALL hobbies from selected compound buttons for matching

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS expanded_activities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expanded_interests text[] DEFAULT '{}';

COMMENT ON COLUMN user_preferences.expanded_activities IS 'All hobbies expanded from activity compound buttons for matching';
COMMENT ON COLUMN user_preferences.expanded_interests IS 'All hobbies expanded from interest compound buttons for matching';

-- The original activities/interests columns keep the button IDs for UI state
-- The expanded columns have all the hobbies for matching algorithm