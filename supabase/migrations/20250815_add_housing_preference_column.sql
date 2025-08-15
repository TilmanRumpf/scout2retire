-- Migration: Add housing_preference column to user_preferences table
-- Date: 2025-08-15
-- Description: Adds housing_preference column to track user preference for rent/buy/both

-- Add housing_preference column to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS housing_preference text DEFAULT 'both';

-- Add comment explaining the values
COMMENT ON COLUMN user_preferences.housing_preference IS 'User housing preference: rent, buy, or both. Default is both.';

-- Add check constraint to ensure valid values
ALTER TABLE user_preferences
ADD CONSTRAINT check_housing_preference 
CHECK (housing_preference IN ('rent', 'buy', 'both'));

-- Update any existing NULL values to default
UPDATE user_preferences 
SET housing_preference = 'both' 
WHERE housing_preference IS NULL;