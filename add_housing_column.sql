-- Add housing_preference column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name = 'housing_preference';