-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'onboarding_responses';

-- Check existing policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'onboarding_responses';

-- Fix RLS policies for onboarding_responses
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own onboarding responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can insert own onboarding responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can update own onboarding responses" ON onboarding_responses;

-- Create proper policies
CREATE POLICY "Users can view own onboarding responses" 
ON onboarding_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding responses" 
ON onboarding_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding responses" 
ON onboarding_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Verify the policies are created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'onboarding_responses';