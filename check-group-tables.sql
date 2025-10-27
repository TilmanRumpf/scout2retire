-- Check columns for group_role_audit and group_bans tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('group_role_audit', 'group_bans')
ORDER BY table_name, ordinal_position;