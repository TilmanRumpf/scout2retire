-- RUN THIS IN SUPABASE SQL EDITOR TO CHECK USERS TABLE POLICIES

-- Check if RLS is enabled
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- List all policies on users table
SELECT
  policyname,
  cmd,
  permissive,
  roles::text[] AS applies_to_roles,
  pg_get_expr(qual, polrelid) AS using_expression,
  pg_get_expr(with_check, polrelid) AS with_check_expression
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pn.nspname = 'public'
  AND pc.relname = 'users'
ORDER BY policyname;

-- Test the is_user_admin function for Tilman
SELECT is_user_admin('83d285b2-b21b-4d13-a1a1-6d51b6733d52'::uuid) AS tilman_is_admin;

-- Check Tilman's actual data
SELECT
  id,
  email,
  admin_role,
  is_admin
FROM users
WHERE email = 'tilman.rumpf@gmail.com';
