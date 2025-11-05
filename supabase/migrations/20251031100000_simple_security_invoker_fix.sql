-- =====================================================
-- FIX VIEW SECURITY: Apply security_invoker to all views
-- Created: October 31, 2025
-- Purpose: Fix SECURITY DEFINER warnings using PostgreSQL 15+ security_invoker
-- =====================================================

-- PostgreSQL 15+ provides security_invoker option for views.
-- When set to true, the view uses the privileges of the user calling it,
-- not the privileges of the view owner (which is supabase_admin by default).

-- Apply security_invoker to all analytics views
ALTER VIEW public.scotty_conversation_analytics SET (security_invoker = true);
ALTER VIEW public.scotty_town_analytics SET (security_invoker = true);
ALTER VIEW public.scotty_usage_analytics SET (security_invoker = true);
ALTER VIEW public.user_favorites_with_towns SET (security_invoker = true);
ALTER VIEW public.town_summaries SET (security_invoker = true);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Update comments to reflect the security model
COMMENT ON VIEW public.scotty_conversation_analytics IS
'Analytics for Scotty conversations. Uses security_invoker=true to respect RLS.';

COMMENT ON VIEW public.scotty_town_analytics IS
'Analytics for towns discussed in Scotty. Uses security_invoker=true to respect RLS.';

COMMENT ON VIEW public.scotty_usage_analytics IS
'Monthly Scotty usage analytics. Uses security_invoker=true to respect RLS.';

COMMENT ON VIEW public.user_favorites_with_towns IS
'User favorites with town data. Uses security_invoker=true to respect RLS.';

COMMENT ON VIEW public.town_summaries IS
'Town summary data. Uses security_invoker=true to respect RLS.';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ security_invoker=true applied to all views';
  RAISE NOTICE '🔒 Views now use the privileges of the calling user';
  RAISE NOTICE '📊 RLS policies are properly respected';
  RAISE NOTICE '✅ SECURITY DEFINER warnings should be resolved';
END $$;