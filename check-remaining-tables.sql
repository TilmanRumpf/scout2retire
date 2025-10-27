-- CHECK COLUMNS FOR PROBLEMATIC TABLES
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'category_limits',
    'group_bans',
    'group_role_audit',
    'query_logs',
    'user_interactions',
    'retention_metrics',
    'audit_log',
    'feature_definitions',
    'user_categories',
    'towns_hobbies',
    'retirement_tips',
    'regional_inspirations'
)
ORDER BY table_name, ordinal_position;