-- Drop redundant tax_rates column from towns table
-- Created: 2025-08-26

ALTER TABLE towns DROP COLUMN IF EXISTS tax_rates;