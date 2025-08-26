-- Check RLS status and policies for onboarding_responses table

-- First, check if RLS is enabled on the table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'onboarding_responses';

-- Check all policies on the onboarding_responses table
SELECT 
    pol.polname AS policy_name,
    pol.polcmd AS command,
    pol.polroles AS roles,
    pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression,
    pol.polpermissive AS is_permissive
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'onboarding_responses'
ORDER BY pol.polname;

-- Also check table permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'onboarding_responses'
ORDER BY grantee, privilege_type;

-- Check if authenticated role has necessary permissions
SELECT has_table_privilege('authenticated', 'onboarding_responses', 'SELECT') AS can_select,
       has_table_privilege('authenticated', 'onboarding_responses', 'INSERT') AS can_insert,
       has_table_privilege('authenticated', 'onboarding_responses', 'UPDATE') AS can_update,
       has_table_privilege('authenticated', 'onboarding_responses', 'DELETE') AS can_delete;