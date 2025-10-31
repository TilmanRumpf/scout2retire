-- ============================================================================
-- PERMISSION SYSTEM AUDIT
-- Run this in Supabase SQL Editor to analyze the three overlapping systems
-- ============================================================================

-- Show total users
SELECT 'Total users:' as metric, COUNT(*)::text as value FROM users;

-- ============================================================================
-- ADMIN_ROLE DISTRIBUTION
-- ============================================================================
SELECT
  '=== admin_role distribution ===' as section,
  admin_role,
  COUNT(*) as count
FROM users
GROUP BY admin_role
ORDER BY count DESC;

-- ============================================================================
-- ACCOUNT_TIER DISTRIBUTION
-- ============================================================================
SELECT
  '=== account_tier distribution ===' as section,
  account_tier::text as tier,
  COUNT(*) as count
FROM users
GROUP BY account_tier
ORDER BY count DESC;

-- ============================================================================
-- CATEGORY_ID DISTRIBUTION
-- ============================================================================
SELECT
  '=== category_id distribution ===' as section,
  CASE
    WHEN category_id IS NULL THEN 'null'
    ELSE 'has_category_id'
  END as status,
  COUNT(*) as count
FROM users
GROUP BY category_id IS NULL;

-- ============================================================================
-- IS_ADMIN BOOLEAN
-- ============================================================================
SELECT
  '=== is_admin boolean ===' as section,
  is_admin,
  COUNT(*) as count
FROM users
GROUP BY is_admin
ORDER BY count DESC;

-- ============================================================================
-- MISMATCHES: admin_role vs account_tier
-- ============================================================================
SELECT
  '=== MISMATCHES (admin_role vs account_tier) ===' as section,
  email,
  admin_role,
  account_tier::text as account_tier
FROM users
WHERE
  -- execadmin in account_tier but not in admin_role
  (account_tier = 'execadmin' AND admin_role != 'executive_admin')
  OR
  -- executive_admin in admin_role but not in account_tier
  (admin_role = 'executive_admin' AND account_tier != 'execadmin')
  OR
  -- assistant_admin in account_tier but not reflected in admin_role
  (account_tier = 'assistant_admin' AND admin_role != 'admin')
  OR
  -- town_manager in account_tier but no admin_role
  (account_tier = 'town_manager' AND (admin_role IS NULL OR admin_role = 'user'));

-- ============================================================================
-- EXECUTIVE ADMINS (from both columns)
-- ============================================================================
SELECT
  '=== EXECUTIVE ADMINS ===' as section,
  email,
  admin_role,
  account_tier::text as account_tier,
  category_id,
  is_admin
FROM users
WHERE admin_role = 'executive_admin'
   OR account_tier = 'execadmin'
ORDER BY email;

-- ============================================================================
-- DETAILED ANALYSIS: All permission columns for each user
-- ============================================================================
SELECT
  '=== FULL USER PERMISSION DETAILS ===' as section,
  email,
  admin_role,
  account_tier::text as account_tier,
  category_id,
  is_admin,
  community_role,
  created_at::date as created_date
FROM users
WHERE (admin_role IS NOT NULL AND admin_role != 'user')
   OR (account_tier IS NOT NULL AND account_tier != 'free')
   OR category_id IS NOT NULL
   OR is_admin = true
ORDER BY admin_role DESC NULLS LAST, account_tier;

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================
SELECT '=== RECOMMENDATIONS ===' as section;
SELECT '1. Migrate account_tier admin values to admin_role' as recommendation
UNION ALL SELECT '2. Use account_tier ONLY for subscription tiers (free/freemium/premium/enterprise)'
UNION ALL SELECT '3. Use admin_role for ALL admin hierarchy (user/moderator/admin/executive_admin)'
UNION ALL SELECT '4. Deprecate account_tier enum values: town_manager, assistant_admin, execadmin'
UNION ALL SELECT '5. Use category_id FK for subscription tier features'
UNION ALL SELECT '6. Consider removing is_admin boolean (redundant with admin_role)';

-- ============================================================================
-- MIGRATION PREVIEW: What the fix would do
-- ============================================================================
SELECT
  '=== MIGRATION PREVIEW ===' as section,
  email,
  admin_role as current_admin_role,
  account_tier::text as current_account_tier,
  CASE
    WHEN account_tier = 'execadmin' THEN 'executive_admin'
    WHEN account_tier = 'assistant_admin' THEN 'admin'
    WHEN account_tier = 'town_manager' THEN 'moderator'
    ELSE COALESCE(admin_role, 'user')
  END as proposed_admin_role,
  CASE
    WHEN account_tier IN ('execadmin', 'assistant_admin', 'town_manager') THEN 'free'
    ELSE COALESCE(account_tier::text, 'free')
  END as proposed_account_tier
FROM users
WHERE (account_tier IS NOT NULL AND account_tier IN ('execadmin', 'assistant_admin', 'town_manager'))
   OR (admin_role IS NOT NULL AND admin_role IN ('executive_admin', 'admin', 'moderator'));
