# 🔧 FIX: Algorithm Manager RLS Access Issue

**Date:** November 11, 2025
**Problem:** Algorithm Manager shows NULL preferences for all users
**Root Cause:** RLS policies block admins from reading other users' `onboarding_responses` and `user_preferences`

---

## 🎯 The Problem

### What Happened:
1. **Algorithm Manager** tries to load tobiasrumpf@gmx.de's preferences
2. **RLS policy** blocks read access (anon key without proper policy)
3. **Result:** All preferences show as NULL → Climate scores 0% instead of 97%

### Why It Happened:
- Service role key (debug scripts): ✅ Bypasses RLS, sees all data
- Anon key (Algorithm Manager frontend): ❌ Blocked by RLS policy
- Current policy only allows: `auth.uid() = user_id` (can only read YOUR OWN data)
- Algorithm Manager needs: Admin users read ANY user's data

---

## ✅ The Solution

Update RLS policies on 2 tables to allow admins (`is_admin = true`) to read any user's data:
1. `onboarding_responses` table
2. `user_preferences` table

---

## 🚀 Run These Migrations

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT
2. Click "SQL Editor" in left sidebar
3. Click "New query"

### Step 2: Run Migration #1 (onboarding_responses)

Copy and paste this SQL:

```sql
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "onboarding_responses_select_policy" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can view own onboarding responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Enable read access for own responses" ON onboarding_responses;

-- Create new SELECT policy with admin access
CREATE POLICY "onboarding_responses_select_policy"
ON onboarding_responses
FOR SELECT
USING (
  -- Allow if user is viewing their own data
  auth.uid() = user_id
  OR
  -- Allow if user is an admin (for Algorithm Manager)
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);
```

Click **RUN** → Should see: `Success. No rows returned`

### Step 3: Run Migration #2 (user_preferences)

Copy and paste this SQL:

```sql
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "user_preferences_select_policy" ON user_preferences;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Enable read access for own preferences" ON user_preferences;

-- Create new SELECT policy with admin access
CREATE POLICY "user_preferences_select_policy"
ON user_preferences
FOR SELECT
USING (
  -- Allow if user is viewing their own data
  auth.uid() = user_id
  OR
  -- Allow if user is an admin (for Algorithm Manager)
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);
```

Click **RUN** → Should see: `Success. No rows returned`

---

## ✅ Verify It Works

### Option 1: Run Test Script
```bash
node test-rls-access.js
```

**Expected Output:**
```
Test 1: Service Role Key (should work)
  ✅ SUCCESS - Got data

Test 2: Anon Key WITHOUT auth
  ✅ SUCCESS - Got data  ← Should now work!
```

### Option 2: Test in Browser
1. Open Algorithm Manager: http://localhost:5173/admin/algorithm-manager
2. Select user: `tobiasrumpf@gmx.de`
3. Check console log → Should show preferences WITH data:

**BEFORE (broken):**
```
✅ Loaded preferences for test user: tobiasrumpf@gmx.de
{current_status: null, region_preferences: null, climate_preferences: null, ...}
```

**AFTER (fixed):**
```
✅ Loaded preferences for test user: tobiasrumpf@gmx.de
{current_status: {…}, region_preferences: {…}, climate_preferences: {…}, ...}
```

4. Click "Test Scoring"
5. **Climate score should now show 97% (not 0%)**

---

## 🎯 What This Changes

### Security Impact:
- ✅ **Safe:** Only users with `is_admin = true` can read other users' data
- ✅ **No risk:** Regular users still only see their own data
- ✅ **Proper admin access:** Algorithm Manager and other admin tools now work

### Who Has Admin Access:
- `tobiasrumpf@gmx.de` - `is_admin: true`, `admin_role: moderator`
- `tobias.rumpf1@gmail.com` - `is_admin: true`, `admin_role: executive_admin`

### Tables Affected:
1. `onboarding_responses` - Now readable by admins
2. `user_preferences` - Now readable by admins

---

## 🐛 Troubleshooting

**If still seeing NULL preferences:**
1. Clear browser cache completely
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
3. Check Supabase dashboard → Database → Policies → Verify new policies exist
4. Run `node test-rls-access.js` to verify RLS allows access

**If migrations fail:**
- Error "policy already exists" → Safe to ignore, already fixed
- Error "table does not exist" → Check spelling, table name case-sensitive
- Other errors → Share full error message

---

## 📋 Migration Files Created

- `supabase/migrations/20251111000001_fix_admin_access_onboarding_responses.sql`
- `supabase/migrations/20251111000002_fix_admin_access_user_preferences.sql`

---

## 🎯 Success Criteria

After running migrations, Algorithm Manager should:
1. ✅ Load preferences WITH data (not NULL)
2. ✅ Show Climate score 97% (not 0%)
3. ✅ Match User UI scores exactly
4. ✅ Display green "Testing with current preferences" banner

---

**Status:** 🟡 Migrations ready, awaiting execution

**Next:** Run migrations in Supabase SQL Editor, then test Algorithm Manager
