-- Simplified migration to test on Supabase
-- Run this in the SQL editor

-- First, just add the citizenship columns
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS primary_citizenship text,
  ADD COLUMN IF NOT EXISTS dual_citizenship boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS secondary_citizenship text;

-- Check if it worked
SELECT 
  id,
  email,
  nationality,
  primary_citizenship,
  dual_citizenship,
  secondary_citizenship
FROM users
LIMIT 5;