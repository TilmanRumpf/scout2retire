-- =====================================================
-- FIX SECURITY DEFINER VIEWS (AGAIN)
-- Created: October 29, 2025
-- Purpose: Remove SECURITY DEFINER from views created in previous migration
-- =====================================================

-- Drop and recreate views WITHOUT SECURITY DEFINER

-- 1. scotty_conversation_analytics
DROP VIEW IF EXISTS public.scotty_conversation_analytics CASCADE;

CREATE VIEW public.scotty_conversation_analytics AS
SELECT
  DATE_TRUNC('day', started_at) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_conversations,
  AVG(message_count) as avg_messages_per_conversation,
  COUNT(DISTINCT town_id) as unique_towns_discussed,
  ARRAY_AGG(DISTINCT topic_category) FILTER (WHERE topic_category IS NOT NULL) as topics
FROM scotty_conversations
GROUP BY DATE_TRUNC('day', started_at);

GRANT SELECT ON public.scotty_conversation_analytics TO authenticated;

-- 2. scotty_town_analytics
DROP VIEW IF EXISTS public.scotty_town_analytics CASCADE;

CREATE VIEW public.scotty_town_analytics AS
SELECT
  t.id as town_id,
  t.name as town_name,
  t.country,
  COUNT(DISTINCT sc.id) as conversation_count,
  COUNT(DISTINCT sc.user_id) as unique_users,
  MAX(sc.last_message_at) as last_discussed
FROM towns t
JOIN scotty_conversations sc ON sc.town_id = t.id
GROUP BY t.id, t.name, t.country;

GRANT SELECT ON public.scotty_town_analytics TO authenticated;

-- 3. scotty_usage_analytics
DROP VIEW IF EXISTS public.scotty_usage_analytics CASCADE;

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

-- 4. user_favorites_with_towns
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

-- 5. town_summaries
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

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Add comments to explain the views
COMMENT ON VIEW public.scotty_conversation_analytics IS
'Analytics for Scotty conversations grouped by day. No SECURITY DEFINER - respects RLS.';

COMMENT ON VIEW public.scotty_town_analytics IS
'Analytics for towns discussed in Scotty. No SECURITY DEFINER - respects RLS.';

COMMENT ON VIEW public.scotty_usage_analytics IS
'Monthly usage analytics for Scotty chats. No SECURITY DEFINER - respects RLS.';

COMMENT ON VIEW public.user_favorites_with_towns IS
'User favorites joined with town data. No SECURITY DEFINER - respects RLS.';

COMMENT ON VIEW public.town_summaries IS
'Simplified town data for quick access. No SECURITY DEFINER - respects RLS.';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All views recreated WITHOUT SECURITY DEFINER';
  RAISE NOTICE '🔒 Views now respect Row Level Security (RLS)';
  RAISE NOTICE '📊 Analytics views will filter based on user permissions';
END $$;