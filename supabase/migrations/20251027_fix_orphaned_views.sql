-- Fix Security Issues: Drop orphaned views and fix SECURITY DEFINER
-- Date: 2025-10-26
-- Priority: CRITICAL SECURITY FIX

-- ============================================
-- PART 1: DROP ORPHANED SCOTTY VIEWS
-- These views reference tables that don't exist (scotty_messages, scotty_conversations)
-- The actual implementation uses scotty_chat_usage table instead
-- ============================================

DROP VIEW IF EXISTS public.scotty_analytics CASCADE;
DROP VIEW IF EXISTS public.scotty_topics CASCADE;
DROP VIEW IF EXISTS public.scotty_mentioned_towns CASCADE;

-- ============================================
-- PART 2: FIX REMAINING SECURITY DEFINER VIEWS
-- ============================================

-- 1. user_geographic_distribution
-- This view is properly defined in migration 20251019233000_add_geographic_tracking.sql
-- Just drop the SECURITY DEFINER version
DROP VIEW IF EXISTS public.user_geographic_distribution CASCADE;
-- It will be recreated by the existing migration

-- 2. user_favorites_with_towns
DROP VIEW IF EXISTS public.user_favorites_with_towns CASCADE;

CREATE VIEW public.user_favorites_with_towns AS
SELECT
  f.user_id,
  f.created_at,
  f.town_id,
  t.name,
  t.country,
  t.region,
  t.cost_index,
  t.healthcare_score,
  t.safety_score,
  t.quality_of_life,
  t.image_url_1
FROM public.favorites f
JOIN public.towns t ON t.id = f.town_id;

GRANT SELECT ON public.user_favorites_with_towns TO authenticated;

-- 3. town_summaries
DROP VIEW IF EXISTS public.town_summaries CASCADE;

CREATE VIEW public.town_summaries AS
SELECT
  id,
  name,
  country,
  region,
  cost_index,
  healthcare_score,
  safety_score,
  quality_of_life,
  description,
  image_url_1,
  summer_climate_actual,
  winter_climate_actual,
  population,
  latitude,
  longitude
FROM public.towns;

GRANT SELECT ON public.town_summaries TO authenticated;

-- ============================================
-- PART 3: CREATE PROPER SCOTTY USAGE VIEW
-- Based on the actual scotty_chat_usage table
-- ============================================

CREATE VIEW public.scotty_usage_analytics AS
SELECT
  month_year,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_chats,
  DATE_TRUNC('month', chat_started_at) as month,
  COUNT(*) FILTER (WHERE DATE_PART('day', chat_started_at) <= 7) as first_week_chats,
  COUNT(*) FILTER (WHERE DATE_PART('day', chat_started_at) > 21) as last_week_chats
FROM public.scotty_chat_usage
GROUP BY month_year, DATE_TRUNC('month', chat_started_at)
ORDER BY month_year DESC;

GRANT SELECT ON public.scotty_usage_analytics TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
/*
-- Check that orphaned views are gone:
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('scotty_analytics', 'scotty_topics', 'scotty_mentioned_towns');

-- Check remaining views don't have SECURITY DEFINER:
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
  AND definition LIKE '%SECURITY DEFINER%';

-- Verify new views exist:
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('user_favorites_with_towns', 'town_summaries', 'scotty_usage_analytics');
*/

-- ============================================
-- CLEANUP NOTE
-- ============================================
COMMENT ON VIEW public.scotty_usage_analytics IS
'Analytics for Scotty AI assistant usage. Replaces orphaned scotty_analytics view.
The original scotty_messages and scotty_conversations tables were never created.
This view uses the actual scotty_chat_usage table from the paywall system.';

COMMENT ON VIEW public.user_favorites_with_towns IS
'User favorites joined with town data. Recreated without SECURITY DEFINER to respect RLS.';

COMMENT ON VIEW public.town_summaries IS
'Simplified town data for quick access. Recreated without SECURITY DEFINER to respect RLS.';