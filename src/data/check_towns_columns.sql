-- Check what columns exist in the towns table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'towns'
ORDER BY ordinal_position;