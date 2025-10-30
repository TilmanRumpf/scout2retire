-- Update farmers_markets column description with search template
-- This demonstrates the new format for column descriptions

COMMENT ON COLUMN public.towns.farmers_markets IS 'Whether the town has regular farmers markets (weekly/monthly). Include details in notes if available.

SEARCH: Does {town_name}, {subdivision}, {country} have a farmers market?
EXPECTED: Yes or No';

-- Verify the update
SELECT
  column_name,
  SUBSTRING(col_description('public.towns'::regclass, ordinal_position::int), 1, 150) as description_preview
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'towns'
  AND column_name = 'farmers_markets';
