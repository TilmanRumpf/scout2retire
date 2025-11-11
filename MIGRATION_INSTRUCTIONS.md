# 🔧 Preference Versioning Migration - Execution Guide

**Created:** November 11, 2025
**Purpose:** Add preference hash and timestamp tracking for automatic cache invalidation
**Estimated Time:** 5 minutes
**Risk Level:** LOW (adds columns, doesn't modify existing data)

---

## 📋 What This Migration Does

This migration adds preference version tracking to ensure Algorithm Manager and User UI always show identical match scores.

### Problem Being Solved:
- Admin sees different scores than users for the same town
- Cached scores don't invalidate when user updates preferences
- No way to detect if preferences changed since cache was created

### Solution:
- Add `preferences_hash` column (SHA-256 hash of preference values)
- Add `preferences_updated_at` timestamp
- When preferences change → hash changes → cache key changes → stale cache bypassed

---

## 🚀 Quick Start (Recommended Method)

### Option A: Supabase Dashboard SQL Editor

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: scout2retire
   - Navigate to: **SQL Editor**

2. **Copy Migration SQL**
   - Open file: `supabase/migrations/20251111000000_add_preference_versioning.sql`
   - Copy entire contents (Cmd+A, Cmd+C)

3. **Execute Migration**
   - Paste into SQL Editor
   - Click **"Run"** button
   - Wait for success message

4. **Verify Success**
   - You should see: "✅ Preference versioning migration completed successfully"
   - Check output for column confirmation messages

---

## 🔍 Verification Steps

After running the migration, verify it worked:

### Check 1: Columns Exist

```sql
-- Verify user_preferences columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_preferences'
  AND column_name IN ('preferences_hash', 'preferences_updated_at');

-- Should return 2 rows:
-- preferences_hash | text | '00000000'
-- preferences_updated_at | timestamp with time zone | now()
```

### Check 2: Data Populated

```sql
-- Check sample data
SELECT
  user_id,
  preferences_hash,
  preferences_updated_at,
  onboarding_completed
FROM user_preferences
LIMIT 5;

-- All rows should have:
-- - preferences_hash: '00000000' (default)
-- - preferences_updated_at: <timestamp>
```

### Check 3: Trigger Exists

```sql
-- Verify auto-sync trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'sync_preference_timestamp_trigger';

-- Should return 1 row showing UPDATE trigger on user_preferences
```

---

## ⚙️ What Happens Next

Once migration is complete:

1. **Code Changes Activate**
   - All preference save functions now update hash
   - Cache keys include preference version
   - Algorithm Manager validates freshness

2. **Automatic Cache Invalidation**
   - User updates climate preference
   - Hash changes: `a1b2c3d4` → `x9y8z7w6`
   - Old cache key: `personalized_user123_a1b2c3d4_towns`
   - New cache key: `personalized_user123_x9y8z7w6_towns`
   - Old cache bypassed automatically

3. **Admin Tool Enhancement**
   - Algorithm Manager shows preference timestamp
   - Warns if testing with stale preferences
   - One-click refresh to reload latest

---

## 🔄 Rollback (If Needed)

If you need to undo this migration:

```sql
-- Emergency rollback script
DROP TRIGGER IF EXISTS sync_preference_timestamp_trigger ON user_preferences;
DROP FUNCTION IF EXISTS sync_preference_timestamp();
DROP INDEX IF EXISTS idx_user_preferences_hash;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS preferences_hash;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS preferences_updated_at;
ALTER TABLE users DROP COLUMN IF EXISTS preferences_updated_at;
```

**Note:** Rollback is safe - these columns are new and not required by existing code.

---

## 📊 Migration Impact Analysis

### Tables Modified:
- ✅ `user_preferences` - 2 columns added
- ✅ `users` - 1 column added

### Performance Impact:
- **Minimal** - Index added for fast lookups
- **No** existing queries affected
- **No** RLS policies changed

### Data Changes:
- **None** - Only adds columns
- **Backfill** - Sets timestamps to existing `updated_at` values
- **Default** - New rows get `'00000000'` hash (updated on first save)

### Breaking Changes:
- **None** - Fully backward compatible
- **Code** works with or without migration
- **Hash** updates are non-critical (wrapped in try/catch)

---

## 🐛 Troubleshooting

### Error: "column already exists"
**Cause:** Migration was partially run before
**Fix:** This is OK! The migration uses `IF NOT EXISTS` clauses

### Error: "permission denied"
**Cause:** Not using service role key
**Fix:** Run in Supabase SQL Editor (auto-uses service role)

### Error: "function exec_sql does not exist"
**Cause:** Trying to use Node script without RPC function
**Fix:** Use Supabase SQL Editor instead (recommended)

---

## 📞 Support

If migration fails:

1. **Check Supabase Logs**
   - Dashboard → Logs → Database
   - Look for ERROR level messages

2. **Manual Column Creation**
   ```sql
   -- Add columns one by one
   ALTER TABLE user_preferences ADD COLUMN preferences_hash TEXT DEFAULT '00000000';
   ALTER TABLE user_preferences ADD COLUMN preferences_updated_at TIMESTAMPTZ DEFAULT NOW();
   ALTER TABLE users ADD COLUMN preferences_updated_at TIMESTAMPTZ DEFAULT NOW();
   ```

3. **Contact Support**
   - Include error message
   - Include Supabase project ID
   - Include migration file name

---

## ✅ Post-Migration Checklist

After running migration:

- [ ] Verified columns exist in user_preferences table
- [ ] Verified column exists in users table
- [ ] Verified trigger was created successfully
- [ ] Checked that existing data has timestamps backfilled
- [ ] Restarted development server (`npm run dev`)
- [ ] Tested preference update in onboarding
- [ ] Verified hash appears in database after update
- [ ] Tested Algorithm Manager shows freshness indicator
- [ ] Confirmed cache invalidates when preferences change

---

## 🎯 Success Criteria

Migration is successful when:

1. ✅ All SQL statements execute without errors
2. ✅ Verification queries return expected results
3. ✅ Console logs show hash updates when preferences saved
4. ✅ Algorithm Manager displays preference timestamp
5. ✅ Cache keys include hash value in browser DevTools

---

**Next Step:** Run the migration in Supabase Dashboard SQL Editor, then proceed to testing!
