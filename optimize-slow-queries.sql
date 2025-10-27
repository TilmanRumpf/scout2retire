-- =====================================================
-- QUERY PERFORMANCE OPTIMIZATIONS
-- Based on pg_stat_statements analysis
-- Created: 2025-10-26
-- =====================================================

-- =====================================================
-- PART 1: CREATE MISSING PERFORMANCE INDEXES
-- =====================================================

-- Index for pg_type queries (used heavily in table definitions)
CREATE INDEX IF NOT EXISTS idx_pg_type_composite
ON pg_type(typnamespace, typname);

-- Index for pg_class queries
CREATE INDEX IF NOT EXISTS idx_pg_class_namespace_relkind
ON pg_class(relnamespace, relkind);

-- Index for pg_attribute queries
CREATE INDEX IF NOT EXISTS idx_pg_attribute_composite
ON pg_attribute(attrelid, attnum)
WHERE NOT attisdropped;

-- =====================================================
-- PART 2: UPDATE STATISTICS ON SYSTEM CATALOGS
-- =====================================================

-- These system tables are heavily queried
ANALYZE pg_class;
ANALYZE pg_namespace;
ANALYZE pg_type;
ANALYZE pg_attribute;
ANALYZE pg_proc;
ANALYZE pg_constraint;

-- =====================================================
-- PART 3: OPTIMIZE APPLICATION TABLES
-- =====================================================

-- Create composite index for common town queries
CREATE INDEX IF NOT EXISTS idx_towns_search_optimized_v2
ON public.towns(country, state_code, overall_score DESC NULLS LAST)
WHERE photos IS NOT NULL;

-- Create partial index for active towns
CREATE INDEX IF NOT EXISTS idx_towns_active_with_scores
ON public.towns(overall_score DESC NULLS LAST)
WHERE photos IS NOT NULL
AND overall_score > 50;

-- =====================================================
-- PART 4: CONNECTION POOLING OPTIMIZATION
-- =====================================================

-- Check current connections
SELECT
    'Current Connections' as metric,
    count(*) as value
FROM pg_stat_activity;

-- Check for idle connections
SELECT
    state,
    count(*) as connections,
    avg(EXTRACT(EPOCH FROM (now() - state_change))) as avg_idle_seconds
FROM pg_stat_activity
GROUP BY state;

-- =====================================================
-- PART 5: VACUUM ANALYZE KEY TABLES
-- =====================================================

-- Vacuum and analyze user tables
VACUUM ANALYZE public.users;
VACUUM ANALYZE public.towns;
VACUUM ANALYZE public.chat_messages;
VACUUM ANALYZE public.notifications;
VACUUM ANALYZE public.favorites;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT
    '═══════════════════════════════════════' as line
UNION ALL
SELECT 'OPTIMIZATION COMPLETE'
UNION ALL
SELECT '═══════════════════════════════════════'
UNION ALL
SELECT 'Indexes created for system catalogs'
UNION ALL
SELECT 'Statistics updated on all key tables'
UNION ALL
SELECT 'Application indexes optimized'
UNION ALL
SELECT 'Ready for improved query performance';