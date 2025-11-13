# Dining & Nightlife Matching Algorithm Fix

**Fixed:** 2025-11-13
**File:** `src/utils/scoring/categories/cultureScoring.js`
**Bug Type:** Semantic mismatch between user importance and town quality scales

---

## Problem Discovered

During comprehensive orphan audit, user reported: "i cannot recall to have a dining & nighlife. this is really, really important for retirees."

Investigation revealed dining_nightlife was **NOT orphaned** - town data exists with 100% coverage (351/352 towns). However, the matching algorithm had a **critical bug** comparing incompatible scales.

---

## The Bug

**Broken Logic:**
```javascript
// WRONG: Compared importance (1-5) directly to quality (1-10)
const townDiningNightlife = Math.round((town.restaurants_rating + town.nightlife_rating) / 2)
const difference = Math.abs(diningImportance - townDiningNightlife)
// This treated importance and quality as if they were the same concept!
```

**Real-World Failure Example:**
- User: "Very Important" (5) ← wants excellent dining/nightlife
- Town: Paris restaurants=10, nightlife=8 → average=9 ← actually has excellent dining
- Algorithm: |5 - 9| = 4 → **0 POINTS (mismatch)** ❌
- **Should be: 10 POINTS (perfect match)** ✓

**Why This Was Wrong:**
- User **IMPORTANCE**: "How much do I care about dining?" (1-5 scale)
- Town **QUALITY**: "How good is the dining?" (1-10 scale)
- Comparing these directly is like comparing "How hungry are you?" to "How many calories in the meal?" - related but not directly comparable!

---

## The Fix

**Correct Logic:**
```javascript
// RIGHT: Map importance to quality THRESHOLDS
if (diningImportance === 5) {
  // Very Important → wants excellent quality (8-10)
  if (avgQuality >= 8) score += 10      // Excellent match
  else if (avgQuality >= 6) score += 5  // Acceptable
  else score += 0                        // Below expectations
} else if (diningImportance === 3) {
  // Nice to Have → wants decent quality (5-10)
  if (avgQuality >= 7) score += 10      // Great match
  else if (avgQuality >= 5) score += 7  // Good match
  else if (avgQuality >= 3) score += 3  // Acceptable
  else score += 0                        // Below expectations
}
```

**Now Correct:**
- User: "Very Important" (5)
- Town: Paris R=10, N=8 → Avg=9
- Algorithm: avgQuality(9) >= 8 → **10 POINTS (excellent match)** ✓

---

## Validation

**Tests Passed:** 17/17 ✓

**Key Test Cases:**
1. Very Important + Paris (R=10, N=8, Avg=9) → 10/10 points ✅
2. Very Important + Poor town (R=3, N=3, Avg=3) → 0/10 points ✅
3. Nice to Have + Good town (R=7, N=7, Avg=7) → 10/10 points ✅
4. Nice to Have + Poor town (R=3, N=3, Avg=3) → 3/10 points ✅
5. Not Important + Any quality → 10/10 points ✅

---

## Data Coverage

```
✅ restaurants_rating: 351/352 towns (100%)
✅ nightlife_rating: 351/352 towns (100%)
✅ Both fields populated: 351/352 towns (100%)

Average Quality (for towns with data):
  restaurants_rating: 5.86/10
  nightlife_rating: 4.38/10
  Combined average: 5.12/10

Value Distribution:
  Restaurants: Mostly 7-8 (good to excellent)
  Nightlife: Mostly 2 (poor), some 5-7 (decent)
```

**NOT an orphan** - 100% data coverage. Algorithm bug only.

---

## Impact

**Critical for Retirees:**
Dining and nightlife are major lifestyle factors for retirement decisions. This bug was producing incorrect match scores for all users who cared about dining/nightlife quality.

**Before Fix:** Users who wanted excellent dining were getting penalized for high-quality towns (Paris got 0 points instead of 10).

**After Fix:** Importance now correctly maps to quality thresholds, rewarding high-quality towns for users who care.

---

## Migration Required

**None** - This was a pure algorithm fix. No database or user data migration needed.

- ✅ Town data unchanged (351 towns with 1-10 quality ratings)
- ✅ User preferences unchanged (8 users with 1-5 importance ratings)
- ✅ UI unchanged (onboarding still asks importance)
- ✅ One file changed: `cultureScoring.js`

---

## Lessons Learned

1. **Semantic validation matters:** Just because two fields use numbers doesn't mean they're comparable
2. **"Orphan" investigation reveals hidden bugs:** What appeared to be missing data was actually broken logic
3. **Quality > Importance:** When user cares MORE, they want HIGHER quality - not numerical equality
4. **Test with real examples:** Paris (10,8) vs Honiara (3,2) revealed the bug immediately

---

**Status:** ✅ FIXED - Validated with 17 test cases
**Next:** Continue orphan audit for travel_frequency
