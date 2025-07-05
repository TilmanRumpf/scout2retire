-- Check if favorites table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- Check foreign key constraints on favorites table
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'favorites';

-- Check if auth.users table exists (common issue with Supabase)
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
);

-- Check the exact constraint definition
SELECT 
    pgc.conname AS constraint_name,
    ccu.table_schema AS table_schema,
    ccu.table_name AS table_name,
    ccu.column_name AS column_name,
    pg_get_constraintdef(pgc.oid) AS constraint_definition
FROM pg_constraint pgc
JOIN pg_namespace nsp ON nsp.oid = pgc.connamespace
JOIN information_schema.constraint_column_usage ccu
    ON pgc.conname = ccu.constraint_name
    AND nsp.nspname = ccu.constraint_schema
WHERE pgc.conname = 'favorites_user_id_fkey';