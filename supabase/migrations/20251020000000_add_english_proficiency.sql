-- Add English proficiency column - CRITICAL for retirees to know if they can communicate
-- This was missing from ALL 352 towns!

ALTER TABLE towns
ADD COLUMN IF NOT EXISTS english_proficiency INTEGER;

-- Add comment explaining the data
COMMENT ON COLUMN towns.english_proficiency IS 'Percentage of population that speaks English (0-100). Based on EF English Proficiency Index and local expat community data. Critical for retirement planning.';