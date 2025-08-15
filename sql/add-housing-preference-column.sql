-- Add housing_preference column to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';

-- Add comment explaining the values
COMMENT ON COLUMN user_preferences.housing_preference IS 'User housing preference: rent, buy, or both';