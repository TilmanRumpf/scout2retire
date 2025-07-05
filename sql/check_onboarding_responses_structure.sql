-- Check the structure of onboarding_responses table
-- This query shows all columns, their data types, and constraints

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'onboarding_responses'
ORDER BY ordinal_position;

-- Also check for any CHECK constraints
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'onboarding_responses'::regclass
AND contype = 'c';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'onboarding_responses';

-- Sample a row to see JSONB structure (if any exists)
SELECT * FROM onboarding_responses LIMIT 1;