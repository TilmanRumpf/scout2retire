# Towns RLS Fix - Executive Summary

**Date:** November 11, 2025
**Issue:** Town searches return 0 results
**Root Cause:** RLS policies block `anon` role from reading towns table
**Fix:** Single SQL file to enable public read access
**Time to Fix:** 2 minutes

---

## The Problem

Users (both logged in and logged out) cannot search for towns. All searches return 0 results despite 351 towns in the database.

**Test Results:**
```javascript
// Service role (bypasses RLS): 351 towns ✅
// Anon key (frontend uses this): 0 towns ❌
// Authenticated user: 0 towns ❌ (still uses anon role until session attached)
```

---

## Root Cause

The `towns` table has RLS enabled with policies that restrict SELECT to `authenticated` role only:

```sql
-- Current (BROKEN) policy
CREATE POLICY "towns_unified_select"
ON towns FOR SELECT
TO authenticated  -- ❌ Blocks anon role
USING (true);
```

**Why this breaks search:**
1. Frontend uses `VITE_SUPABASE_ANON_KEY`
2. Anon key uses `anon` role, not `authenticated` role
3. Policy says `TO authenticated` → anon role blocked
4. Result: 0 towns returned

**Why onboarding_responses works:**
- Admin is logged in (has authenticated session)
- Policy checks `auth.uid() = user_id OR is_admin = true`
- Admin check succeeds → returns data
- This is CORRECT behavior (private data should require auth)

**Why towns should work differently:**
- Towns are PUBLIC data (anyone should browse)
- Blocking anon role is wrong for public content
- Standard pattern: `TO anon, authenticated` for public data

---

## The Fix

**File:** `/Users/tilmanrumpf/Desktop/scout2retire/fix-towns-anon-access.sql`

**What it does:**
1. Drops all existing SELECT policies on towns
2. Creates new policy allowing BOTH `anon` and `authenticated` roles
3. Preserves admin-only INSERT/UPDATE/DELETE policies

**Before:**
```sql
CREATE POLICY "towns_unified_select"
ON towns FOR SELECT
TO authenticated  -- ❌ Blocks anon
USING (true);
```

**After:**
```sql
CREATE POLICY "towns_public_read"
ON towns FOR SELECT
TO anon, authenticated  -- ✅ Allows both
USING (true);
```

---

## Why This is Correct

### Supabase Best Practice (Nov 2025)

From official Supabase documentation:

> **For public-facing content like blogs or open product listings:**
> ```sql
> CREATE POLICY "Allow public read" ON my_table
> FOR SELECT USING (true);
> ```
> This allows read access to everyone, but no inserts, updates, or deletes.
> Use this cautiously and only for safe, public data.

**Recommended pattern for public data:**
```sql
-- Public read
CREATE POLICY "public_read"
ON public_data_table
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin write (protected)
CREATE POLICY "admin_write"
ON public_data_table
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);
```

### Performance Benefits

From Supabase documentation:

> **Always add 'authenticated' to the approved roles instead of nothing or public.**
> Although this does not improve the query performance for the signed in user
> it does eliminate 'anon' users without taxing the database to process the
> rest of the RLS.

**Translation:** For PRIVATE data, use `TO authenticated` to block anon early.
For PUBLIC data, use `TO anon, authenticated` to allow everyone.

---

## Security Analysis

**Is it safe to allow anon role to read towns?**

✅ **YES** - Towns table contains only public data:
- Town names, descriptions, coordinates
- Quality of life scores (publicly displayed)
- Climate data, cost of living estimates
- Photos (publicly hosted)

**No sensitive data exposed:**
- ❌ No user data
- ❌ No private preferences
- ❌ No financial information
- ❌ No personal information

**Write protection maintained:**
- Only authenticated admins can INSERT/UPDATE/DELETE
- Anon users are read-only
- No data integrity risk

**This is exactly what public data tables are designed for.**

---

## Deployment Steps

### 1. Apply SQL Fix (2 minutes)
```bash
# Option A: Via Supabase SQL Editor
# 1. Open Supabase Dashboard
# 2. Go to SQL Editor
# 3. Copy contents of fix-towns-anon-access.sql
# 4. Run query
# 5. Verify output shows "✅ Towns table RLS policies configured correctly"

# Option B: Via psql (if configured)
psql $DATABASE_URL < fix-towns-anon-access.sql
```

### 2. Test Fix (1 minute)
```javascript
// Test 1: Anon access (logged out)
const anonClient = createClient(SUPABASE_URL, ANON_KEY);
const { data } = await anonClient.from('towns').select('id, town_name').limit(5);
console.log('Anon access:', data.length); // Should be 5

// Test 2: Authenticated access (logged in)
const authedClient = createClient(SUPABASE_URL, ANON_KEY);
await authedClient.auth.signInWithPassword({ email, password });
const { data: authData } = await authedClient.from('towns').select('id, town_name').limit(5);
console.log('Authed access:', authData.length); // Should be 5

// Test 3: Frontend search
// Open app, search for "Valencia" → should show results
```

### 3. Create Migration (1 minute)
```bash
# Copy fix to migrations folder with timestamp
cp fix-towns-anon-access.sql \
   supabase/migrations/20251111120000_fix_towns_anon_access.sql

# Commit
git add supabase/migrations/20251111120000_fix_towns_anon_access.sql
git commit -m "🔒 FIX: Allow anon role to read towns table (public data)"
```

### 4. Create Database Snapshot (30 seconds)
```bash
node create-database-snapshot.js
```

---

## Verification Checklist

After deploying fix, verify:

- [ ] Anon key can query towns: `SELECT count(*) FROM towns` → 351
- [ ] Authenticated users can query towns → 351
- [ ] Frontend search while logged out shows results
- [ ] Frontend search while logged in shows results
- [ ] Admin can still update towns (admin panel works)
- [ ] Database snapshot created
- [ ] Migration file committed to git

---

## Related Tables to Review

**Other public data tables that should allow anon access:**
1. `towns_hobbies` - Town-hobby relationships (public data)
2. `category_limits` - Scoring category metadata (public data)
3. `feature_definitions` - Feature metadata (public data)

**Private data tables (correctly restrict to authenticated):**
1. `user_preferences` - User settings ✅
2. `onboarding_responses` - User onboarding data ✅
3. `user_likes` - User favorites ✅
4. `chat_messages` - Private messages ✅

---

## Key Takeaways

### What We Learned
1. **Service role testing is misleading** - It bypasses RLS, making tables look accessible
2. **Always test with anon key** - Frontend uses anon key, so that's the real test
3. **`TO authenticated` is a hidden blocker** - Easy to overlook in policy definitions
4. **Public data should be public** - Don't force login for browsing

### RLS Policy Patterns
```sql
-- Pattern 1: Public data (towns, blog posts, products)
TO anon, authenticated

-- Pattern 2: Private user data (preferences, messages)
TO authenticated
USING (auth.uid() = user_id OR is_admin)

-- Pattern 3: Admin-only data (audit logs, system config)
TO authenticated
USING (is_admin = true)
```

### Testing Protocol
Always test with THREE scenarios:
1. Service role (admin operations)
2. Anon key (public access)
3. Authenticated session (logged-in users)

---

## Files Created

1. **`fix-towns-anon-access.sql`** - SQL fix (ready to deploy)
2. **`RLS_ROOT_CAUSE_ANALYSIS.md`** - Detailed investigation report
3. **`TOWNS_RLS_FIX_EXECUTIVE_SUMMARY.md`** - This file (quick reference)

---

## Next Actions

**Immediate (Required):**
1. ✅ Run fix-towns-anon-access.sql in Supabase
2. ✅ Test search functionality
3. ✅ Create migration file
4. ✅ Create database snapshot

**Follow-up (Recommended):**
1. Review other public tables (towns_hobbies, category_limits)
2. Update RLS documentation with these patterns
3. Add RLS testing to test suite
4. Document in LESSONS_LEARNED.md

**Long-term (Nice to have):**
1. Create RLS policy generator script
2. Add pre-deployment RLS checks
3. Set up automated RLS testing

---

## Confidence Level

**95%** - This fix addresses the root cause with high certainty.

**Evidence:**
- ✅ Reproduced issue with anon key (0 results)
- ✅ Service role works (351 results) → data exists
- ✅ Policy analysis shows `TO authenticated` blocker
- ✅ Supabase docs confirm pattern
- ✅ Fix follows official best practices

**Risk:** Low
- Read-only access to public data
- Write operations still protected
- No schema changes
- Easily reversible

---

**Status:** READY TO DEPLOY
**Estimated Time:** 5 minutes total
**Rollback:** Drop new policy, restore previous policy from snapshot
