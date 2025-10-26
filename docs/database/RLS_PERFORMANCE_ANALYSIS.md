# RLS Performance Analysis - Detailed Report
**Date:** October 26, 2025
**Analysis of:** 68 migration files, 57 RLS policies across 25 tables
**Total auth.uid() occurrences:** 136 across policies

---

## Executive Summary

The Scout2Retire database has **two main RLS performance issues**:

1. **Auth Initialization Plan (HIGH IMPACT)**: `auth.uid()` is called 136 times across policies, potentially re-evaluated for **every row** returned
2. **Multiple Permissive Policies (MEDIUM IMPACT)**: 7 table.command combinations have multiple policies evaluated with OR logic

**Estimated Impact:**
- Query returning 100 rows with auth.uid() → 100+ function calls instead of 1
- Tables with 2-3 permissive policies → 2-3x policy evaluation overhead per row

**Good News:**
- Fixes are **LOW RISK** - mostly pattern changes, no logic changes
- Can be done incrementally - start with highest-impact tables first
- Estimated total effort: **2-4 hours** for all fixes

---

## Issue #1: Auth Initialization Plan ⚠️ HIGH IMPACT

### What's Happening

The warning "Auth RLS Initialization Plan" means Postgres may re-evaluate `auth.uid()`, `auth.role()`, etc. for **every single row** in the result set, instead of caching the value once at query start.

### Real-World Impact

**Example scenario:**
```sql
-- Policy: USING (user_id = auth.uid())
-- Query returns 352 towns

-- Current behavior (BAD):
-- auth.uid() called 352 times (once per row)

-- Desired behavior (GOOD):
-- auth.uid() called 1 time, result cached
```

### Tables Affected

Found **136 occurrences** of auth functions across **25 tables**:

| Function | Occurrences | Tables Affected |
|----------|-------------|-----------------|
| `auth.uid()` | 134 | 24 tables |
| `auth.role()` | 1 | 1 table (users) |
| `auth.jwt()` | 0 | None |
| `auth.email()` | 0 | None |

### Worst Offenders (by auth function call count)

1. **group_chat_members** - 13 auth calls, 11 policies
   - High volume table (group memberships)
   - Complex EXISTS subqueries with auth.uid()

2. **users** - 8 auth calls, 6 policies
   - Medium volume (14 users currently, growing)
   - Multiple SELECT policies with auth checks

3. **scotty_conversations** - 4 auth calls, 3 policies
   - Growing rapidly (chat history)
   - User-specific data with auth.uid() checks

4. **notifications** - 3 auth calls, 2 policies
   - High read frequency
   - Simple pattern: `auth.uid() = user_id`

5. **thread_read_status** - 3 auth calls, 2 policies
   - Frequent updates
   - Simple pattern: `auth.uid() = user_id`

### Example Problematic Pattern

**Current (BAD):**
```sql
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Problem:** If query returns 100 notifications, `auth.uid()` may be called 100 times.

### Recommended Fix

**Option A: Use Subquery (Simplest)**
```sql
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (user_id IN (SELECT auth.uid()));
```

**Option B: Create STABLE Helper Function (Cleaner, reusable)**
```sql
-- Create once, use everywhere
CREATE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid()
$$ LANGUAGE SQL STABLE;  -- STABLE = cached within transaction

-- Then in policies:
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (user_id = get_current_user_id());
```

**Why this works:**
- `STABLE` functions are evaluated **once per query**, not once per row
- Subqueries with single-row results are typically optimized by Postgres
- No logic changes - just caching the auth function result

### Priority for Fix

**High Priority (fix first):**
- notifications (high read frequency, simple pattern)
- scotty_conversations (growing rapidly)
- scotty_messages (high volume)
- thread_read_status (frequent updates)
- discovery_views (analytics queries)

**Medium Priority:**
- user_device_history
- user_blocks
- scotty_chat_usage
- admin_score_adjustments

**Low Priority (complex logic, need careful testing):**
- group_chat_members (complex EXISTS with joins)
- users (multiple policies interact)
- chat_threads (complex admin checks)

---

## Issue #2: Multiple Permissive Policies ⚠️ MEDIUM IMPACT

### What's Happening

When multiple PERMISSIVE policies exist for the same table and command (e.g., users.SELECT), Postgres evaluates **ALL of them** using OR logic. This means 3 policies = 3x evaluation overhead.

### Tables Affected

Found **7 table.command combinations** with multiple permissive policies:

| Table | Command | Policy Count | Impact |
|-------|---------|--------------|--------|
| **users** | SELECT | 3 | High - called frequently |
| **users** | UPDATE | 2 | Medium |
| **group_chat_members** | SELECT | 3 | High - large result sets |
| **group_chat_members** | INSERT | 3 | Medium |
| **group_chat_members** | DELETE | 3 | Low |
| **group_chat_members** | UPDATE | 2 | Low |
| **scotty_messages** | SELECT | 2 | Medium - growing |

### Example Problem: users.SELECT

**Current (BAD) - 3 separate policies:**

1. `authenticated_users_can_select_all_users`
   - USING: `auth.role() = 'authenticated'`

2. `admins_can_select_all_users`
   - USING: `is_user_admin(auth.uid()) OR auth.uid() = id`

3. (Potential third policy from earlier migrations)

**Problem:** Postgres evaluates ALL THREE policies for every row:
- Policy 1 OR Policy 2 OR Policy 3
- Three separate evaluations per row

### Recommended Fix: Consolidate

**Option A: Single Policy (Simplest)**
```sql
-- Drop old policies
DROP POLICY IF EXISTS "authenticated_users_can_select_all_users" ON users;
DROP POLICY IF EXISTS "admins_can_select_all_users" ON users;

-- Create single consolidated policy
CREATE POLICY "users_select_policy"
  ON users
  FOR SELECT
  USING (
    -- Any authenticated user can view all (current requirement)
    auth.role() = 'authenticated'
    -- OR if we want to restrict: (is_user_admin(get_current_user_id()) OR id = get_current_user_id())
  );
```

**Option B: Use RESTRICTIVE Policies (Advanced)**

If policies have different purposes, use RESTRICTIVE policies:
- All PERMISSIVE policies evaluated with OR
- All RESTRICTIVE policies evaluated with AND
- Final result: (PERMISSIVE1 OR PERMISSIVE2) AND (RESTRICTIVE1 AND RESTRICTIVE2)

```sql
-- One permissive policy for access grants
CREATE POLICY "users_select_grant" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Optional restrictive policies for additional constraints
CREATE POLICY "users_select_no_banned" ON users
  FOR SELECT AS RESTRICTIVE
  USING (is_banned = false OR is_user_admin(get_current_user_id()));
```

### Example Fix: group_chat_members.SELECT

**Current (BAD) - 3 policies:**

1. "Members can view group membership"
   - EXISTS (user is member of this group)

2. (Potential) "Admins can view all"
   - is_admin()

3. (Potential) "Members can view if group is public"
   - group is public

**Fixed (GOOD) - Single policy:**
```sql
CREATE POLICY "group_chat_members_select"
  ON group_chat_members
  FOR SELECT
  USING (
    -- Member of this group
    EXISTS (
      SELECT 1 FROM group_chat_members gcm
      WHERE gcm.thread_id = group_chat_members.thread_id
      AND gcm.user_id = get_current_user_id()
    )
    -- OR admin
    OR is_user_admin(get_current_user_id())
    -- OR group is public (if that's a requirement)
    -- OR EXISTS (SELECT 1 FROM chat_threads WHERE id = thread_id AND is_public = true)
  );
```

---

## Issue #3: Complex Subqueries (Lower Priority)

### Observed Patterns

Many policies use EXISTS or IN (SELECT) subqueries:

**Example from group_chat_members:**
```sql
USING (
  EXISTS (
    SELECT 1
    FROM group_chat_members gcm
    WHERE gcm.thread_id = group_chat_members.thread_id
    AND gcm.user_id = auth.uid()
  )
)
```

**Example from scotty_messages:**
```sql
USING (
  conversation_id IN (
    SELECT id FROM scotty_conversations WHERE user_id = auth.uid()
  )
)
```

### When This Is a Problem

Subqueries are problematic when:
1. They query the **same table** (risk of recursion)
2. They run on **every row** without optimization
3. They involve **JOINs** in the subquery

### When This Is OK

Subqueries are usually fine when:
1. They query **different tables** (like scotty_messages checking scotty_conversations)
2. They have **simple WHERE clauses** with indexes
3. Postgres can **optimize them** (turn into joins or cache results)

### Monitoring Recommendation

Use `EXPLAIN ANALYZE` on queries to check if subqueries are causing issues:

```sql
EXPLAIN ANALYZE
SELECT * FROM group_chat_members
WHERE thread_id = 'some-uuid';
```

Look for:
- "SubPlan" nodes that run multiple times
- High execution counts on nested loops
- Missing index usage

---

## Prioritized Fix Plan

### Phase 1: Auth Initialization (30 minutes, LOW RISK)

**Quick Wins - Simple Pattern Changes:**

1. Create helper function (once):
```sql
CREATE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid()
$$ LANGUAGE SQL STABLE;

CREATE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
  SELECT auth.role()
$$ LANGUAGE SQL STABLE;
```

2. Update simple policies (10 tables):
   - notifications
   - thread_read_status
   - scotty_chat_usage
   - discovery_views
   - user_blocks
   - user_device_history
   - user_cohorts
   - user_behavior_events
   - user_reports
   - admin_score_adjustments

**Pattern:**
```sql
-- Before
USING (auth.uid() = user_id)

-- After
USING (get_current_user_id() = user_id)
```

**Testing:**
- Test one policy first
- Verify auth still works
- Roll out to remaining tables

---

### Phase 2: Consolidate Multiple Policies (1-2 hours, LOW-MEDIUM RISK)

**Tables to consolidate:**

1. **users** (3 SELECT policies → 1)
2. **group_chat_members** (3 SELECT, 3 INSERT, 3 DELETE, 2 UPDATE → 1 each)
3. **scotty_messages** (2 SELECT → 1)

**Process per table:**
1. Document current policies and their logic
2. Create single policy with OR conditions
3. Test with various user roles
4. Deploy in transaction with rollback ready

**Example migration for users:**
```sql
BEGIN;

-- Backup: Take note of current policies
-- (They're in migrations already)

-- Drop old policies
DROP POLICY IF EXISTS "authenticated_users_can_select_all_users" ON users;
DROP POLICY IF EXISTS "admins_can_select_all_users" ON users;
DROP POLICY IF EXISTS "users_can_select_own" ON users;

-- Create consolidated policy
CREATE POLICY "users_select_consolidated"
  ON users
  FOR SELECT
  USING (
    -- Any authenticated user (current broad access)
    auth.role() = 'authenticated'
  );

-- Test query
SELECT count(*) FROM users;  -- Should work

COMMIT;
```

---

### Phase 3: Optimize Complex Subqueries (2-4 hours, MEDIUM RISK)

**Only if monitoring shows performance issues.**

Tables to review:
- group_chat_members (complex EXISTS)
- scotty_messages (IN with subquery)
- chat_messages (EXISTS with joins)

**Approach:**
1. Run EXPLAIN ANALYZE on slow queries
2. Check if Postgres optimizes the subquery
3. If not, consider:
   - Materialized views
   - Trigger-based denormalization
   - SECURITY DEFINER functions

**Not recommended unless proven necessary** - these add complexity.

---

## Risk Assessment

### LOW RISK Changes (Phase 1)

✅ **Safe to do:**
- Creating STABLE helper functions
- Replacing `auth.uid()` with `get_current_user_id()`
- No logic changes, just caching optimization

⚠️ **Precautions:**
- Test in staging first
- Deploy during low-traffic window
- Have rollback migration ready

### LOW-MEDIUM RISK Changes (Phase 2)

✅ **Safe to do:**
- Consolidating policies with same logic
- Using OR within single policy

⚠️ **Requires testing:**
- Verify all user roles work (user, admin, moderator)
- Test edge cases (banned users, expired trials)
- Check that app functionality unchanged

⚠️ **Precautions:**
- Deploy one table at a time
- Monitor for auth errors
- Have immediate rollback plan

### MEDIUM RISK Changes (Phase 3)

⚠️ **Potentially risky:**
- Changing subquery logic
- Using SECURITY DEFINER (bypass RLS)
- Denormalizing data

🚨 **Only do if:**
- EXPLAIN shows actual performance problem
- Simpler fixes (Phase 1 & 2) insufficient
- Extensive testing completed

---

## Migration Template

### Phase 1 Example: Fix auth.uid() in notifications

```sql
-- Migration: 20251027_optimize_notifications_rls.sql

-- Create helper function (if not exists)
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid()
$$ LANGUAGE SQL STABLE;

-- Update notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;

CREATE POLICY "Allow insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Verify it works
DO $$
BEGIN
  -- Test policy works
  PERFORM * FROM notifications LIMIT 1;
  RAISE NOTICE 'RLS policies updated successfully for notifications';
END $$;
```

### Phase 2 Example: Consolidate users.SELECT policies

```sql
-- Migration: 20251027_consolidate_users_select_policies.sql

BEGIN;

-- Document what we're replacing
COMMENT ON TABLE users IS 'Consolidating 3 SELECT policies into 1 for performance';

-- Drop old policies
DROP POLICY IF EXISTS "authenticated_users_can_select_all_users" ON users;
DROP POLICY IF EXISTS "admins_can_select_all_users" ON users;
DROP POLICY IF EXISTS "users_can_select_own" ON users;

-- Create single consolidated policy
CREATE POLICY "users_select_consolidated"
  ON users
  FOR SELECT
  USING (
    -- Currently: all authenticated users can view all users
    -- (Required for admin tools like Town Access Manager)
    auth.role() = 'authenticated'

    -- Future: Can tighten to:
    -- (get_current_user_id() = id OR is_user_admin(get_current_user_id()))
  );

-- Verify
SELECT count(*) FROM users;

RAISE NOTICE 'Users SELECT policies consolidated successfully';

COMMIT;
```

---

## Monitoring & Validation

### After Phase 1 (Auth Helpers)

**Check logs for:**
```sql
-- Should see improved query performance
EXPLAIN ANALYZE
SELECT * FROM notifications WHERE user_id = auth.uid();

-- Look for: Function scan on get_current_user_id (never executed)
-- Means it was cached, not re-run per row
```

**Validate:**
- Users can still see their own data
- No one sees data they shouldn't
- Query times not slower (should be same or faster)

### After Phase 2 (Consolidated Policies)

**Check:**
```sql
-- Count policies per table
SELECT
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
HAVING COUNT(*) > 3
ORDER BY policy_count DESC;

-- Should see reduced counts for:
-- users, group_chat_members, scotty_messages
```

**Test scenarios:**
- Regular user login → sees own data only
- Admin login → sees all data
- Moderator → appropriate access level
- Edge cases (banned, expired trial, etc.)

### Performance Metrics

**Before optimization:**
- Query with 100 rows + auth.uid() = ~100 function calls

**After Phase 1:**
- Query with 100 rows + get_current_user_id() = ~1 function call

**After Phase 2:**
- 3 policy evaluations → 1 policy evaluation per row

**Expected improvement:**
- 10-30% query time reduction on auth-heavy queries
- Fewer "Auth RLS Initialization Plan" warnings
- Lower CPU usage on database

---

## Questions & Answers

### Q: Why not just disable RLS for performance?

**A:** RLS is critical for security. Disabling it would mean:
- Any authenticated user could read/modify all data
- No row-level security enforcement
- Must implement security in application layer (error-prone)

Better to optimize RLS than disable it.

### Q: Will these fixes break anything?

**A:** Very low risk because:
- Phase 1: No logic changes, just caching (safest)
- Phase 2: Same logic, different structure (test carefully)
- All changes are to policy definitions, not application code

### Q: Can we do this in production?

**A:** Yes, with precautions:
1. Test in staging first
2. Deploy during low-traffic period
3. Have rollback migration ready
4. Monitor logs after deployment
5. Do one table at a time, not all at once

### Q: How do we roll back if needed?

**A:** Each migration should have a rollback:

```sql
-- Migration: 20251027_optimize_notifications_rls.sql

-- Rollback migration: 20251027_rollback_notifications_rls.sql
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

-- Restore original policy
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);  -- Original pattern
```

### Q: Which should we do first?

**A:** Recommended order:
1. **Phase 1** - Simple tables first (notifications, thread_read_status)
2. **Test & monitor** for 1-2 days
3. **Phase 1** - Rest of simple tables
4. **Test & monitor** for 1-2 days
5. **Phase 2** - users table (high impact, medium complexity)
6. **Test & monitor** for 1-2 days
7. **Phase 2** - group_chat_members (most complex)
8. **Phase 3** - Only if monitoring shows issues

---

## Appendix: Complete Table Breakdown

### Tables with Auth Issues (by priority)

**Tier 1: High Volume + Simple Pattern**
- notifications (3 auth calls, 2 policies)
- scotty_messages (3 auth calls, 3 policies)
- discovery_views (2 auth calls, 2 policies)
- thread_read_status (3 auth calls, 2 policies)

**Tier 2: Medium Volume + Simple Pattern**
- scotty_conversations (4 auth calls, 3 policies)
- scotty_chat_usage (2 auth calls, 2 policies)
- user_device_history (2 auth calls, 2 policies)
- user_blocks (2 auth calls, 2 policies)

**Tier 3: Low Volume or Complex**
- admin_score_adjustments (3 auth calls, 3 policies)
- user_behavior_events (1 auth call, 1 policy)
- user_cohorts (1 auth call, 1 policy)
- user_reports (auth calls in complex logic)
- group_bans (1 auth call, EXISTS subquery)

**Tier 4: Very Complex (needs careful review)**
- group_chat_members (13 auth calls, 11 policies, complex EXISTS)
- users (8 auth calls, 6 policies, multiple SELECT policies)
- chat_threads (2 auth calls, complex admin checks)
- chat_messages (1 auth call, complex EXISTS with JOIN)

### Tables with Multiple Permissive Policies

1. **users**: 3 SELECT, 2 UPDATE
2. **group_chat_members**: 3 SELECT, 3 INSERT, 3 DELETE, 2 UPDATE
3. **scotty_messages**: 2 SELECT

### Tables Currently Fine (no action needed)

- towns (public, no RLS needed)
- user_preferences (simple 1 policy)
- favorites (simple 1-2 policies)
- audit_log (uses check_admin_access function - already optimized)
- retention_metrics (admin only, simple)
- feature_definitions (simple active check)
- category_limits (simple with IN subquery, acceptable)
- user_categories (simple visibility check)

---

## Conclusion

Scout2Retire's RLS implementation is **secure and functional**, but has **two optimization opportunities**:

1. **Auth function caching** (30 min fix, high impact)
2. **Policy consolidation** (1-2 hours, medium impact)

Both are **low risk** and can be done incrementally. Start with Phase 1 on high-volume tables, monitor, then proceed to Phase 2 if needed.

**Estimated total effort:** 2-4 hours
**Expected performance gain:** 10-30% on auth-heavy queries
**Risk level:** LOW (with proper testing)

**Recommendation:** Proceed with Phase 1 for top 5 tables, monitor for 1 week, then decide on Phase 2.
