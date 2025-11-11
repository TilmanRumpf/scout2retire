# ✅ Post-Migration Testing Guide

**Migration Status:** ✅ COMPLETE
**Verification:** ✅ PASSED (columns exist, timestamps backfilled)

---

## 🧪 Browser Testing Steps

### Test 1: Verify Hash Updates on Preference Save (5 min)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools Console** (Cmd+Option+J / F12)

3. **Navigate to onboarding or profile settings**

4. **Update any preference** (e.g., change climate from "warm" to "hot")

5. **Look for console log:**
   ```
   ✅ Preference hash updated: a3b2c1d4 for step: climate
   ```

6. **Verify in database:**
   - Open Supabase Dashboard → Table Editor → user_preferences
   - Find your user record
   - `preferences_hash` should NOT be `00000000`
   - Should be 8-character hex like `a3b2c1d4`

**Expected:** ✅ Hash changes from `00000000` to actual hash

---

### Test 2: Verify Cache Key Includes Hash (5 min)

1. **Open DevTools → Application → Session Storage**

2. **Navigate to Favorites page**

3. **Look for cache keys** with pattern:
   ```
   personalized_{userId}_{HASH}_{options}
   ```
   Example: `personalized_abc-123-def_a3b2c1d4_{...}`

4. **Update a preference** in another tab

5. **Return to Favorites**

6. **Check Session Storage again:**
   - Should see NEW cache key with DIFFERENT hash
   - Old cache key still there but orphaned

**Expected:** ✅ Cache key changes when preferences change

---

### Test 3: Algorithm Manager Freshness Detection (10 min)

1. **Navigate to:** `/admin/algorithm`

2. **Select test user:** `tobiasrumpf@gmx.de`

3. **Look for banner above test controls:**
   ```
   ✅ Testing with current preferences
   Last updated: [timestamp]
   ```

4. **In another browser tab, update that user's preferences**
   (Login as the user, change climate setting)

5. **Return to Algorithm Manager**

6. **Should see yellow banner:**
   ```
   ⚠️ Preferences may have changed
   Last updated: [old timestamp]
   [Refresh button]
   ```

7. **Click "Refresh" button**

8. **Banner should turn green again**

**Expected:** ✅ Freshness detection works, refresh updates

---

### Test 4: Scoring Consistency (15 min) - THE BIG TEST

This tests the original problem: Do Admin and User UI show same scores?

1. **Open Algorithm Manager** (`/admin/algorithm`)

2. **Select user:** `tobiasrumpf@gmx.de`

3. **Select town:** "Lemmer, Netherlands"

4. **Click "Test Scoring"**

5. **Note the category scores:**
   - Region: ____%
   - Climate: ____%
   - Culture: ____%
   - Hobbies: ____%
   - Admin: ____%
   - Cost: ____%

6. **In another browser/tab, login as that user**

7. **Navigate to Favorites** (`/favorites`)

8. **Find "Lemmer, Netherlands"**

9. **Compare category scores:**
   - Should MATCH Algorithm Manager EXACTLY

10. **Check console logs in both tabs:**
    ```
    [getPersonalizedTowns] Cache key: userId=..., prefHash=a3b2c1d4, ...
    ```
    **The `prefHash` should be IDENTICAL in both tabs**

**Expected:** ✅ Scores match exactly between Admin and User UI

---

### Test 5: Hash Timestamp Sync (2 min)

Verify the database trigger is syncing timestamps.

1. **Run in Supabase SQL Editor:**
   ```sql
   SELECT
     up.user_id,
     up.preferences_updated_at as prefs_timestamp,
     u.preferences_updated_at as user_timestamp,
     up.preferences_hash
   FROM user_preferences up
   JOIN users u ON u.id = up.user_id
   LIMIT 10;
   ```

2. **Check results:**
   - `prefs_timestamp` and `user_timestamp` should match for each user
   - If they don't match, trigger may not be working

**Expected:** ✅ Timestamps match between tables

---

## 🐛 Troubleshooting

### Problem: Hash stays `00000000` after preference update

**Diagnosis:**
```javascript
// Check browser console for errors
// Should see: "✅ Preference hash updated: ..."
// If not, check for errors in updatePreferenceHash call
```

**Fix:**
1. Check console for JavaScript errors
2. Verify `updatePreferenceHash` is imported in save function
3. Check network tab for failed database queries

---

### Problem: Scores still don't match between Admin/User

**Diagnosis:**
```javascript
// In both browser tabs, run:
sessionStorage.getItem('personalized_' + userId + '_' + prefHash + '_...')
// The keys should be IDENTICAL
```

**Fix:**
1. Clear all browser caches (DevTools → Application → Clear Storage)
2. Hard refresh both pages (Cmd+Shift+R)
3. Verify both are loading same user preferences
4. Check console logs for hash values in cache keys

---

### Problem: Algorithm Manager always shows yellow warning

**Diagnosis:**
Check if `validatePreferenceHash` is working:
```javascript
// In browser console:
import { validatePreferenceHash } from './src/utils/preferenceUtils';
// Won't work - need to check in React DevTools instead
```

**Fix:**
1. Click "Refresh" button in Algorithm Manager
2. Re-select the user from dropdown
3. Check browser console for validation errors

---

### Problem: Trigger not syncing timestamps

**Diagnosis:**
```sql
-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'sync_preference_timestamp_trigger';
```

**Fix:**
If trigger missing, re-run this part of migration:
```sql
CREATE OR REPLACE FUNCTION sync_preference_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET preferences_updated_at = NEW.preferences_updated_at
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_preference_timestamp_trigger
  AFTER UPDATE OF preferences_updated_at ON user_preferences
  FOR EACH ROW
  WHEN (OLD.preferences_updated_at IS DISTINCT FROM NEW.preferences_updated_at)
  EXECUTE FUNCTION sync_preference_timestamp();
```

---

## ✅ Success Checklist

Mark each as complete when verified:

- [ ] Hash updates when preference saved (see console log)
- [ ] Hash appears in database (not `00000000`)
- [ ] Cache keys include hash in Session Storage
- [ ] Cache key changes when preferences change
- [ ] Algorithm Manager shows green freshness banner
- [ ] Algorithm Manager detects stale preferences (yellow banner)
- [ ] Refresh button reloads preferences
- [ ] **Scores match between Admin and User UI** ← MAIN GOAL
- [ ] Timestamps sync between user_preferences and users tables
- [ ] No JavaScript errors in console

---

## 📊 Expected Console Logs

When everything is working, you should see:

```javascript
// On preference save:
✅ Preference hash updated: a3b2c1d4 for step: climate

// On loading favorites:
[getPersonalizedTowns] Cache key: userId=abc-123, prefHash=a3b2c1d4, options={...}
[getPersonalizedTowns] Using cached results
// OR
[getPersonalizedTowns] Calculating fresh scores (cache miss or skipCache=true)

// In Algorithm Manager:
[AlgorithmManager] Loaded users for testing: 27
[AlgorithmManager] Restored saved user: tobiasrumpf@gmx.de
✅ Loaded preferences for test user: tobiasrumpf@gmx.de
[AlgorithmManager] Using consistent column selection for scoring accuracy
[AlgorithmManager] Town being scored: Lemmer
[AlgorithmManager] Score result: 72%
```

---

## 🎯 Final Verification

If ALL tests pass, you've successfully solved the scoring discrepancy problem!

**Before:**
- Admin saw Climate: 0% for Lemmer
- User saw Climate: 97% for Lemmer
- No way to debug why they differed

**After:**
- Admin and User see IDENTICAL scores
- Hash ensures cache invalidates on preference change
- Freshness indicator shows data currency
- System is production-ready

---

**Next Step:** Run these tests and report results!

**If any test fails:** See troubleshooting section or check `IMPLEMENTATION_SUMMARY_PREFERENCE_VERSIONING.md` for detailed debugging.
