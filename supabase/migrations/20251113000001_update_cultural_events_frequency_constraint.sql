-- Update cultural_events_frequency constraint to new 3-value system
-- Migration from 7 possible values to 3 descriptive values
-- Previous: rare, occasional, monthly, frequent, weekly, constant, daily (only 3 used)
-- New: occasional, regular, frequent

-- Drop existing constraint
ALTER TABLE towns
DROP CONSTRAINT IF EXISTS towns_cultural_events_frequency_check;

-- Add new constraint with 3 allowed values
ALTER TABLE towns
ADD CONSTRAINT towns_cultural_events_frequency_check
CHECK (cultural_events_frequency IN ('occasional', 'regular', 'frequent'));

-- Add comment explaining the values
COMMENT ON COLUMN towns.cultural_events_frequency IS 'Cultural events frequency: occasional (monthly), regular (weekly), frequent (daily)';
