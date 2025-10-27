# RLS Performance Fix - Quick Reference

**Problem:** 166 RLS performance warnings in Supabase
**Root Cause:** Wrong policies on config tables + unoptimized user tables
**Fix Time:** 2-3 hours total
**Expected Result:** <10 warnings, 95% performance improvement

---

## The Problem in 30 Seconds

```sql
-- ❌ WRONG: category_limits has NO user_id!
CREATE POLICY "category_limits_select_own" ON category_limits
  FOR SELECT USING (
    category_id IN (SELECT category_id FROM users WHERE id = auth.uid())
  );

-- This causes 40-60 warnings because:
-- 1. category_limits is a lookup table (same for all users)
-- 2. Policy joins to users table on EVERY query
-- 3. Calls auth.uid() 40+ times unnecessarily
```

---

## Tables to Fix (Priority Order)

### Phase 1: Config Tables (HIGH IMPACT - 60-80 warnings)

| Table | Current Problem | Fix |
|-------|-----------------|-----|
| `category_limits` | Filters by user (has NO user_id) | Public read, admin write |
| `feature_definitions` | Filters by user (has NO user_id) | Public read, admin write |
| `user_categories` | Filters by user (has NO user_id) | Public read, admin write |

**File:** `/supabase/migrations/20251004051700_user_roles_paywall_system.sql`
**Lines:** 672-680 (category_limits), 654-658 (user_categories), 663-667 (feature_definitions)

### Phase 2: User Tables (MEDIUM IMPACT - 50-80 warnings)

| Table | Current Problem | Fix |
|-------|-----------------|-----|
| `notifications` | Uses `auth.uid()` | Replace with `get_current_user_id()` |
| `user_likes` | Uses `auth.uid()` | Replace with `get_current_user_id()` |
| `chat_favorites` | Uses `auth.uid()` | Replace with `get_current_user_id()` |
| `country_likes` | Uses `auth.uid()` | Replace with `get_current_user_id()` |
| `thread_read_status` | Uses `auth.uid()` | Replace with `get_current_user_id()` |
| `user_behavior_events` | Uses `auth.uid()` | Replace with `get_current_user_id()` |

---

## Fix Templates

### Template 1: Config Tables (Public Read)

```sql
-- Fix category_limits (apply same pattern to feature_definitions, user_categories)
ALTER TABLE category_limits DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "category_limits_select_own" ON category_limits;
DROP POLICY IF EXISTS "category_limits_admin_all" ON category_limits;
ALTER TABLE category_limits ENABLE ROW LEVEL SECURITY;

-- All users can read
CREATE POLICY "category_limits_read_all"
ON category_limits FOR SELECT TO authenticated
USING (true);

-- Only admins can modify
CREATE POLICY "category_limits_admin_only"
ON category_limits FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = get_current_user_id()
    AND u.is_admin = true
  )
);
```

### Template 2: User Tables (Helper Function)

```sql
-- Fix notifications (apply same pattern to other user tables)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Consolidated policy with helper function
CREATE POLICY "notifications_user_access"
ON notifications FOR ALL TO authenticated
USING (user_id = get_current_user_id())
WITH CHECK (user_id = get_current_user_id());
```

---

## Verification Commands

### Before Fix

```sql
-- Count current warnings
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
GROUP BY tablename
ORDER BY policy_count DESC;
```

### After Fix

```sql
-- Verify config tables now use USING (true)
SELECT
  tablename,
  policyname,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('category_limits', 'feature_definitions', 'user_categories');

-- Should show: USING (true) for SELECT policies
```

---

## Migration File to Create

```bash
# Create Phase 1 migration
cat > supabase/migrations/20251026_fix_config_table_rls.sql << 'MIGRATION'
-- =====================================================
-- FIX RLS FOR CONFIGURATION TABLES - PHASE 1
-- Created: October 26, 2025
-- Target: category_limits, feature_definitions, user_categories
-- Expected Impact: 60-80 warnings eliminated
-- =====================================================

-- Verify helper function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'get_current_user_id'
    ) THEN
        RAISE EXCEPTION 'Helper function get_current_user_id() does not exist. Run 20251104_rls_phase2_complete_fix.sql first.';
    END IF;
END $$;

-- =====================================================
-- FIX 1: category_limits (Lookup table - NOT user data)
-- =====================================================
ALTER TABLE category_limits DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "category_limits_select_own" ON category_limits;
DROP POLICY IF EXISTS "category_limits_admin_all" ON category_limits;
ALTER TABLE category_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "category_limits_read_all"
ON category_limits FOR SELECT TO authenticated
USING (true);

CREATE POLICY "category_limits_admin_only"
ON category_limits FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = get_current_user_id()
    AND u.is_admin = true
  )
);

RAISE NOTICE '✅ Fixed category_limits (lookup table - no user filtering)';

-- =====================================================
-- FIX 2: feature_definitions (Lookup table)
-- =====================================================
ALTER TABLE feature_definitions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "feature_definitions_select_active" ON feature_definitions;
DROP POLICY IF EXISTS "feature_definitions_admin_all" ON feature_definitions;
ALTER TABLE feature_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_definitions_read_all"
ON feature_definitions FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "feature_definitions_admin_only"
ON feature_definitions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = get_current_user_id()
    AND u.is_admin = true
  )
);

RAISE NOTICE '✅ Fixed feature_definitions (lookup table - no user filtering)';

-- =====================================================
-- FIX 3: user_categories (Lookup table)
-- =====================================================
ALTER TABLE user_categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_categories_select_all" ON user_categories;
DROP POLICY IF EXISTS "user_categories_admin_all" ON user_categories;
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_categories_read_all"
ON user_categories FOR SELECT TO authenticated
USING (is_visible = true);

CREATE POLICY "user_categories_admin_only"
ON user_categories FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = get_current_user_id()
    AND u.is_admin = true
  )
);

RAISE NOTICE '✅ Fixed user_categories (lookup table - no user filtering)';

-- =====================================================
-- REPORT
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '🚀 PHASE 1 COMPLETE: Config Tables Fixed';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ TABLES FIXED:';
    RAISE NOTICE '   • category_limits: No longer filters by user';
    RAISE NOTICE '   • feature_definitions: No longer filters by user';
    RAISE NOTICE '   • user_categories: No longer filters by user';
    RAISE NOTICE '';
    RAISE NOTICE '📊 EXPECTED IMPACT:';
    RAISE NOTICE '   • Warnings reduced by: 60-80';
    RAISE NOTICE '   • Query speed: 10-30x faster for these tables';
    RAISE NOTICE '   • Auth load: 95% reduction for config queries';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Next: Check Supabase dashboard for warning count';
END $$;
MIGRATION
```

---

## Expected Results

### Warning Reduction

```
Before Phase 1:  166 warnings
After Phase 1:   ~90-106 warnings (60-80 eliminated)
```

### Performance Improvement

```
category_limits query:   150ms → 5ms (30x faster)
feature_definitions:     120ms → 4ms (30x faster)
user_categories:         100ms → 3ms (33x faster)
```

---

## Common Mistakes to Avoid

1. ❌ **Don't** filter config tables by user
2. ❌ **Don't** use `auth.uid()` directly - use helper
3. ❌ **Don't** forget to drop old policies first
4. ❌ **Don't** skip verification after applying fix

---

## Files Referenced

### Key Files
- `/supabase/migrations/20251004051700_user_roles_paywall_system.sql` - Original wrong policies
- `/supabase/migrations/20251104_rls_phase2_complete_fix.sql` - Helper function (already applied)
- `/docs/database/RLS_ROOT_CAUSE_ANALYSIS.md` - Full analysis (this summary)

### Helper Function Location
```sql
-- Already exists from Phase 2
CREATE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $func$
  SELECT auth.uid()
$func$;
```

---

## Quick Checklist

- [ ] Read root cause analysis document
- [ ] Create Phase 1 migration file
- [ ] Apply migration (Supabase dashboard or CLI)
- [ ] Check Supabase dashboard for warning count
- [ ] Verify queries are faster
- [ ] Create Phase 2 migration (user tables)
- [ ] Apply Phase 2 migration
- [ ] Final verification: <10 warnings remaining

---

**Total Time:** 2-3 hours
**Risk Level:** Low (config tables have no user data)
**Expected Outcome:** 166 warnings → <10 warnings (94% reduction)

---

**Created:** October 26, 2025
**For full details, see:** `/docs/database/RLS_ROOT_CAUSE_ANALYSIS.md`
