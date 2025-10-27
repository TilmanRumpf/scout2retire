-- Check what admin-related columns exist in users table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
AND (
    column_name LIKE '%admin%' OR
    column_name LIKE '%role%' OR
    column_name = 'category_id'
)
ORDER BY ordinal_position;