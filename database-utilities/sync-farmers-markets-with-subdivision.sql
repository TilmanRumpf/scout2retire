-- SYNC FARMERS_MARKETS COLUMN DESCRIPTION
-- Adds {subdivision} placeholder and Expected format in query
-- Run this in Supabase SQL Editor NOW

COMMENT ON COLUMN public.towns.farmers_markets IS 'Whether the town has regular farmers markets (weekly/monthly). Include details in notes if available.

SEARCH: Does {town_name}, {subdivision}, {country} have a farmers market? Expected: Yes or No
EXPECTED: Yes or No';

-- Verify the update
SELECT
  column_name,
  col_description('public.towns'::regclass, ordinal_position::int) as full_description
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'towns'
  AND column_name = 'farmers_markets';
