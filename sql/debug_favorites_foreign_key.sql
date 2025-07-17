-- Check the current user's ID format
SELECT 
    auth.uid() AS current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'No authenticated user'
        ELSE 'User ID: ' || auth.uid()::text
    END AS user_status;

-- Check if the favorites table exists
SELECT 
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'favorites'
    ) AS favorites_table_exists;

-- If favorites table exists, check its foreign key constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'favorites_user_id_fkey';

-- Check what table the user_id foreign key references
SELECT
    tc.constraint_name,
    tc.table_name AS source_table,
    kcu.column_name AS source_column,
    ccu.table_schema AS referenced_schema,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'favorites_user_id_fkey';

-- Check if there's a public.users table (common Supabase pattern)
SELECT 
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_name = 'users'
ORDER BY table_schema;

-- Get sample user IDs from auth.users to see the format
SELECT 
    id,
    email,
    created_at
FROM auth.users
LIMIT 5;