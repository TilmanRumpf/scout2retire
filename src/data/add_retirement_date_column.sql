-- Add retirement_date column to users table
-- This stores the full retirement date (not just year)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS retirement_date DATE;

-- Update existing records to use January 1st of their retirement year
UPDATE users 
SET retirement_date = make_date(retirement_year_estimate, 1, 1)
WHERE retirement_date IS NULL 
  AND retirement_year_estimate IS NOT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN users.retirement_date IS 'Full retirement date (month, day, year)';
COMMENT ON COLUMN users.retirement_year_estimate IS 'Legacy column - kept for backwards compatibility';