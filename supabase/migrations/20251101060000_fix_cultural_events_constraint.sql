-- Fix cultural_events_frequency constraint to allow all expected values
-- Issue: Database was rejecting "occasional", "frequent", "constant" but allowing "rare", "monthly", "weekly", "daily"
-- This migration drops the old constraint and creates a new one with all valid values

-- Drop existing constraint
ALTER TABLE towns
DROP CONSTRAINT IF EXISTS towns_cultural_events_frequency_check;

-- Add new constraint with ALL expected values
ALTER TABLE towns
ADD CONSTRAINT towns_cultural_events_frequency_check
CHECK (
  cultural_events_frequency IS NULL OR
  cultural_events_frequency IN (
    'rare',
    'occasional',
    'monthly',
    'frequent',
    'weekly',
    'constant',
    'daily'
  )
);
