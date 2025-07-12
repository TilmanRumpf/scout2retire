-- Get all columns with data types
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'towns'
ORDER BY ordinal_position;
