# 🔧 REMAINING ARCHITECTURE FIXES

**Date:** September 30, 2025
**Status:** High-priority fixes completed, medium-priority fixes pending

---

## ✅ COMPLETED FIXES (September 30, 2025)

### 1. **Fake Notification/Privacy Settings** - FIXED ✅
- **Problem:** Toggles only updated React state, never saved to database
- **Solution:** Added `notifications` and `privacy` JSONB columns to `user_preferences` table
- **Files Changed:**
  - `ProfileUnified.jsx` - Added save handlers
  - `migrations/20250930_add_settings_to_user_preferences.sql` - Database schema
- **Impact:** Users can now actually save their settings

### 2. **Route Guards Using Wrong Table** - FIXED ✅
- **Problem:** App.jsx and Login.jsx checked `users.onboarding_completed` instead of `user_preferences.onboarding_completed`
- **Solution:** Updated route guards to check `user_preferences` first, fallback to `users`
- **Files Changed:**
  - `App.jsx` lines 141-168
  - `Login.jsx` lines 124-159
- **Impact:** Correct onboarding routing decisions

### 3. **Scotty Context Using Wrong Table** - FIXED ✅ (Earlier)
- **Problem:** `getUserContext()` queried `users` table first (empty), then fell back to `user_preferences`
- **Solution:** Always check `user_preferences` FIRST
- **Files Changed:**
  - `scottyContext.js` lines 33-61
- **Impact:** Scotty now correctly sees user family status, citizenship, etc.

### 4. **Field Name Mismatch (family_status vs family_situation)** - PARTIALLY FIXED ✅
- **Problem:** Database uses `family_status`, code uses `family_situation`
- **Solution:** Added transformation in `onboardingUtils.js` line 252 to check `.situation` field
- **Files Changed:**
  - `onboardingUtils.js` line 252
- **Impact:** Family status loads correctly now
- **Note:** Still need to standardize the naming (see below)

---

## ⚠️ MEDIUM PRIORITY FIXES (TODO)

### 5. **authUtils.getCurrentUser() Doesn't Fetch user_preferences**
**Priority:** HIGH
**File:** `src/utils/authUtils.js`
**Lines:** 264-268, 41-45

**Problem:**
```javascript
// Line 264-268: Only queries users table
const { data: userData, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single();
```

**Impact:**
- Authentication context missing onboarding data
- Profile page can't display citizenship, family status, preferences
- Forces every component to query `user_preferences` separately

**Recommended Fix:**
```javascript
// Fetch from BOTH tables and merge
const { data: userData } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single();

const { data: prefsData } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', session.user.id)
  .single();

return {
  user: session.user,
  profile: userData,
  preferences: prefsData  // ADD THIS
};
```

**Files to Update After Fix:**
- All files calling `getCurrentUser()` need to use `result.preferences`

---

### 6. **ProfileUnified Page Doesn't Show Onboarding Data**
**Priority:** MEDIUM
**File:** `src/pages/ProfileUnified.jsx`
**Lines:** 95-130

**Problem:**
- Profile page only shows: name, email, avatar, username
- Missing: citizenship, family status, retirement timeline, all preferences

**Impact:**
- Users can't see their own onboarding answers
- Have to go back through onboarding to remember what they selected

**Recommended Fix:**
Add a new "My Preferences" section to ProfileUnified.jsx that displays:
- Citizenship (primary, secondary if dual)
- Family status (solo/couple)
- Partner citizenship (if couple)
- Retirement timeline
- Budget preferences
- Top 3 preferred regions/countries

**Implementation:**
1. Load preferences in `loadUser()` function (already done - lines 114-128)
2. Add new tab or section to display this data
3. Add "Edit" button that navigates to `/onboarding/current-status` to modify

---

### 7. **Standardize Field Names: family_status vs family_situation**
**Priority:** MEDIUM
**Files:** Multiple (see below)

**Problem:**
Database uses `family_status`, but code uses both names inconsistently:
- `user_preferences.family_status` (database column)
- `family_situation` (used in code after transformation)

**Current Workaround:**
`onboardingUtils.js` line 252 transforms `family_status` → `family_situation`

**Recommended Fix (Pick ONE approach):**

**Option A: Rename Database Column (BREAKING)**
```sql
ALTER TABLE user_preferences
RENAME COLUMN family_status TO family_situation;
```
Then update all saves to use `family_situation`

**Option B: Update All Code to Use family_status (SAFER)**
- Search/replace `family_situation` → `family_status` in:
  - `scottyContext.js`
  - `onboardingUtils.js`
  - All `Onboarding*.jsx` files
- Remove transformation layer in `onboardingUtils.js` line 252

**Recommendation:** Option B (safer, no DB migration needed)

---

### 8. **Remove Dual-Table Saves**
**Priority:** LOW
**Files:** `OnboardingCurrentStatus.jsx`, `OnboardingCosts.jsx`, `OnboardingRegion.jsx`

**Problem:**
All onboarding pages save to BOTH tables:
1. `onboarding_responses` (legacy)
2. `user_preferences` (current)

**Impact:**
- Data duplication
- Potential for inconsistency
- Extra database writes

**Recommended Fix:**
1. Remove all `saveOnboardingStep()` calls
2. Keep only `saveUserPreferences()` calls
3. Consider dropping `onboarding_responses` table after confirming all users migrated

**Files to Update:**
- `OnboardingCurrentStatus.jsx` lines 414-473
- `OnboardingCosts.jsx` lines 398-420
- `OnboardingRegion.jsx` lines 661-688

---

### 9. **Add Warning Logs for Missing Data**
**Priority:** LOW
**File:** `src/utils/userpreferences/onboardingUtils.js`
**Lines:** 251-253

**Problem:**
Silent fallbacks hide missing data:
```javascript
family_situation: typeof data.family_status === 'object'
  ? (data.family_status?.situation || 'solo')  // Silently defaults
  : (data.family_status || 'solo')
```

**Impact:**
- If `family_status` is NULL, code silently returns 'solo'
- No way to detect missing data
- Scoring algorithms receive wrong defaults

**Recommended Fix:**
```javascript
family_situation: (() => {
  if (!data.family_status) {
    console.warn(`⚠️ Missing family_status for user ${userId}`);
    return 'solo'; // explicit default
  }
  return typeof data.family_status === 'object'
    ? (data.family_status?.situation || 'solo')
    : data.family_status;
})()
```

**Impact:** Better debugging, can identify users with incomplete onboarding

---

### 10. **Remove Duplicate Query in enhancedMatchingAlgorithm.js**
**Priority:** LOW
**File:** `src/utils/scoring/enhancedMatchingAlgorithm.js`
**Lines:** 1889-1892

**Problem:**
Two separate functions fetch user preferences:
1. `matchingAlgorithm.js` → `getPersonalizedTowns()` → calls `getOnboardingProgress()`
2. `enhancedMatchingAlgorithm.js` → `getTopMatches()` → queries `user_preferences` directly

**Impact:**
- Duplicate database queries
- Performance penalty
- Inconsistent data access patterns

**Recommended Fix:**
Delete `getTopMatches()` function entirely, use `getPersonalizedTowns()` from `matchingAlgorithm.js` instead

---

## 📊 PRIORITY SUMMARY

| Priority | Issue | Effort | Impact | Status |
|----------|-------|--------|--------|--------|
| CRITICAL | Fake notification/privacy toggles | 2 hours | HIGH | ✅ FIXED |
| CRITICAL | Route guards wrong table | 1 hour | HIGH | ✅ FIXED |
| CRITICAL | Scotty context wrong table | 1 hour | HIGH | ✅ FIXED |
| HIGH | authUtils missing preferences | 2 hours | MEDIUM | ⚠️ TODO |
| MEDIUM | ProfileUnified no onboarding data | 3 hours | MEDIUM | ⚠️ TODO |
| MEDIUM | Standardize field names | 2 hours | LOW | ⚠️ TODO |
| LOW | Remove dual-table saves | 1 hour | LOW | ⚠️ TODO |
| LOW | Add warning logs | 30 min | LOW | ⚠️ TODO |
| LOW | Remove duplicate query | 30 min | LOW | ⚠️ TODO |

**Total Remaining Effort:** ~10 hours

---

## 🎯 RECOMMENDED ORDER

1. **Fix authUtils.getCurrentUser()** (2 hours) - Unlocks better data flow
2. **Standardize field names** (2 hours) - Prevents future confusion
3. **Add ProfileUnified preferences display** (3 hours) - User-facing improvement
4. **Remove dual-table saves** (1 hour) - Cleanup
5. **Add warning logs** (30 min) - Better debugging
6. **Remove duplicate query** (30 min) - Performance

---

## 📝 LESSONS LEARNED

1. **Always expand existing tables** instead of creating new ones
2. **Check data source FIRST** before debugging logic
3. **Field name consistency matters** - pick one name and stick with it
4. **Transformation layers are fragile** - standardize at the source
5. **Silent fallbacks hide bugs** - always log when defaulting

---

## 🔍 SEARCH KEYWORDS

architecture, data-source, table-mismatch, user_preferences, users, onboarding_responses, family_status, family_situation, authUtils, getCurrentUser, ProfileUnified, scottyContext, route-guards, fake-ui, settings, notifications, privacy, dual-saves, transformation-layer, field-names

---

**Last Updated:** September 30, 2025
**Next Review:** After completing fixes #5-6 (authUtils + ProfileUnified)