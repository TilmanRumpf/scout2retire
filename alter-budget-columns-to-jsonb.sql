-- Convert budget columns from integer to JSONB to support multi-select arrays
-- Run this in your Supabase SQL Editor

-- First, backup existing data into temporary columns
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS total_monthly_budget_temp integer,
ADD COLUMN IF NOT EXISTS max_monthly_rent_temp integer,
ADD COLUMN IF NOT EXISTS max_home_price_temp integer;

-- Copy existing data to temp columns
UPDATE user_preferences 
SET 
  total_monthly_budget_temp = total_monthly_budget,
  max_monthly_rent_temp = max_monthly_rent,
  max_home_price_temp = max_home_price;

-- Drop the old integer columns
ALTER TABLE user_preferences 
DROP COLUMN IF EXISTS total_monthly_budget,
DROP COLUMN IF EXISTS max_monthly_rent,
DROP COLUMN IF EXISTS max_home_price;

-- Create new JSONB columns
ALTER TABLE user_preferences 
ADD COLUMN total_monthly_budget jsonb DEFAULT '[]'::jsonb,
ADD COLUMN max_monthly_rent jsonb DEFAULT '[]'::jsonb,
ADD COLUMN max_home_price jsonb DEFAULT '[]'::jsonb;

-- Migrate data from temp columns to new JSONB columns (converting single values to arrays)
UPDATE user_preferences 
SET 
  total_monthly_budget = CASE 
    WHEN total_monthly_budget_temp IS NOT NULL THEN jsonb_build_array(total_monthly_budget_temp)
    ELSE '[]'::jsonb
  END,
  max_monthly_rent = CASE 
    WHEN max_monthly_rent_temp IS NOT NULL THEN jsonb_build_array(max_monthly_rent_temp)
    ELSE '[]'::jsonb
  END,
  max_home_price = CASE 
    WHEN max_home_price_temp IS NOT NULL THEN jsonb_build_array(max_home_price_temp)
    ELSE '[]'::jsonb
  END;

-- Drop the temporary columns
ALTER TABLE user_preferences 
DROP COLUMN IF EXISTS total_monthly_budget_temp,
DROP COLUMN IF EXISTS max_monthly_rent_temp,
DROP COLUMN IF EXISTS max_home_price_temp;

-- Verify the changes
SELECT 
  user_id,
  total_monthly_budget,
  max_monthly_rent,
  max_home_price
FROM user_preferences
LIMIT 5;