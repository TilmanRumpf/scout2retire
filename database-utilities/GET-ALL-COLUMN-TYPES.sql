-- Get EVERY column type for the towns table
SELECT
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'towns'
ORDER BY column_name;
