-- Debug queries for onboarding_completed issue

-- 1. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('id', 'onboarding_completed', 'retirement_year_estimate', 'retirement_date');

-- 2. Check constraints on users table
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE 
    tc.table_name = 'users'
    AND tc.table_schema = 'public';

-- 3. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    tablename = 'users';

-- 4. Check if there are any triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'users';

-- 5. Sample query to test update (replace with actual user ID)
-- UPDATE users 
-- SET onboarding_completed = true 
-- WHERE id = 'YOUR_USER_ID_HERE'
-- RETURNING id, email, onboarding_completed;