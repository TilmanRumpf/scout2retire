-- Fix RLS policies for onboarding_responses table
-- This ensures users can insert and update their own onboarding responses

-- First, enable RLS on the table if not already enabled
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view own onboarding responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can insert own onboarding responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can update own onboarding responses" ON onboarding_responses;

-- Create policy for users to view their own responses
CREATE POLICY "Users can view own onboarding responses"
ON onboarding_responses
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own responses
CREATE POLICY "Users can insert own onboarding responses"
ON onboarding_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own responses
CREATE POLICY "Users can update own onboarding responses"
ON onboarding_responses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON onboarding_responses TO authenticated;

-- Verify the policies were created
SELECT 
    pol.polname AS policy_name,
    pol.polcmd AS command,
    pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'onboarding_responses'
ORDER BY pol.polname;