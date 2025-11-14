# Missing Data & No-Preference Behavior – Cross-Category Analysis

**Generated:** November 14, 2025
**Purpose:** Document how each scoring category handles missing data and no-preference cases
**Status:** Analysis for future refactoring (likely behind feature flag)

---

## Executive Summary

### Critical Finding: Extreme Inconsistency Across Categories

**The scoring system has 3 completely different philosophies for handling missing data:**

1. **Ultra-Generous (4 categories):** Region, Culture, Administration, Cost
   - **No preferences + No data = 100%**
   - Users with zero preferences get perfect scores
   - Creates the "87% minimal preferences" anomaly

2. **Ultra-Strict (1 category):** Climate
   - **No preferences + No data = 0%**
   - Opposite extreme from other categories
   - Heavily penalizes users who skip climate questions

3. **Broken (1 category):** Hobbies
   - **No preferences + No data = undefined%**
   - Appears to have an error condition
   - May crash or return NaN in production

### Impact on "Minimal Preferences = 87%" Anomaly

**Scenario:** User selects only country (Spain), skips everything else

**Category Scores:**
- Region: **100%** (generous - "open to any location")
- Climate: **0%** (strict - "no preferences available")
- Culture: **100%** (generous - "open to any culture")
- Hobbies: **undefined** (broken)
- Administration: **100%** (generous - "open to any administrative situation")
- Cost: **100%** (generous - "open to any cost situation")

**Weighted Average (with 12% weights):**
```
(30% × 100) + (13% × 0) + (12% × 100) + (8% × ?) + (18% × 100) + (19% × 100)
= 30 + 0 + 12 + ? + 18 + 19
= 79-87% depending on hobbies handling
```

**This explains the 87% score** - five categories give 100%, one gives 0%, resulting in high overall score with minimal effort.

---

## Cross-Category Behavior Matrix

| Category | No Prefs, No Data | No Prefs, Has Data | Has Prefs, No Data | Fallback Philosophy | Concerning? |
|----------|-------------------|--------------------|--------------------|---------------------|-------------|
| **Region** | **100%** | **100%** | 0% (no match) | "Open to any location" | ⚠️ Too generous |
| **Climate** | **0%** | **0%** | 50-70% partial | "No prefs = no score" | ⚠️ Too strict |
| **Culture** | **100%** | **100%** | 50-60% partial | "Open to any culture" | ⚠️ Too generous |
| **Hobbies** | **undefined** | **undefined** | 30-50% partial | ERROR CONDITION | 🚨 BROKEN |
| **Administration** | **100%** | **100%** | 17-20% partial | "Open to any situation" | ⚠️ Too generous |
| **Cost** | **100%** | **100%** | 20-30% partial | "Open to any cost" | ⚠️ Too generous |

---

## Detailed Category Analysis

### 1. REGION SCORING ⚠️ Ultra-Generous

**No Preferences Behavior:**
```javascript
if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
  score = 100
  factors.push({ factor: 'Open to any location', score: 100 })
  return { score, factors, category: 'Region' }
}
```

**Result:** User gets **100%** if they don't specify ANY region preferences.

**Missing Data Behavior:**
- If user has country preference but town missing data: 0% (no match)
- If user has geo features preference but town missing data: 0% (no match)

**Philosophy:** "No preference = open to anything = perfect match"

**Concerns:**
- ⚠️ **Very generous** - rewards users who skip onboarding
- Contradicts product goal of encouraging detailed preferences
- Creates perverse incentive: "Don't answer questions = high score"

**Recommendation:** Change to 40-50% fallback instead of 100%

---

### 2. CLIMATE SCORING 🚨 Ultra-Strict

**No Preferences Behavior:**
```javascript
const hasAnyPreferences = /* check all climate fields */
if (!hasAnyPreferences) {
  return {
    score: 0,
    factors: [{ factor: 'No climate preferences available', score: 0 }],
    category: 'Climate'
  }
}
```

**Result:** User gets **0%** if they don't specify ANY climate preferences.

**Missing Data Behavior:**
- If user has summer preference but town missing data: 50-70% fallback (generous)
- If user has humidity preference but town missing data: 50-70% fallback (generous)

**Philosophy:** "No preference = no score" BUT "Missing town data = generous fallback"

**Concerns:**
- ⚠️ **Opposite extreme** from other categories (they give 100%, climate gives 0%)
- Heavily penalizes users who skip climate questions
- Inconsistent with region/culture/admin/cost philosophy
- BUT: More honest about lack of preference alignment

**Recommendation:** Change to 50% fallback to match other categories' generosity

---

### 3. CULTURE SCORING ⚠️ Ultra-Generous

**No Preferences Behavior:**
```javascript
if (!parsed.culture.hasAnyPreferences) {
  score = 100
  factors.push({ factor: 'Open to any culture', score: 100 })
  return { score, factors, category: 'Culture' }
}
```

**Result:** User gets **100%** if they don't specify ANY culture preferences.

**Missing Data Behavior:**
- If user has urban/rural preference but town missing data: 60% fallback (12 of 20 points)
- If user has pace preference but town missing data: 60% fallback (12 of 20 points)
- If user has language preference but town missing data: 0% fallback (strict)

**Philosophy:** "No preference = open to anything = perfect match"

**Concerns:**
- ⚠️ **Very generous** like region
- Inconsistent fallbacks within category (some fields 60%, some 0%)
- Contradicts product goal of encouraging engagement

**Recommendation:**
- Change no-preference handling to 50% fallback
- Standardize missing-data fallbacks to 50% across all fields

---

### 4. HOBBIES SCORING 🚨 BROKEN

**No Preferences Behavior:**
```
Result: undefined%
```

**This appears to be an error condition** - the scorer may:
1. Return `undefined` instead of a number
2. Return `NaN` in some edge cases
3. Not handle the no-preferences case at all

**Missing Data Behavior:**
- Unknown (can't test without preferences)

**Philosophy:** Unclear - appears broken

**Concerns:**
- 🚨 **CRITICAL BUG** - may crash in production
- May return `undefined` which breaks weighted average calculation
- May silently fail and skew overall scores

**Recommendation:**
- **FIX IMMEDIATELY** - add no-preference handling
- Return 50% fallback when user has no hobbies
- Add defensive checks for undefined/NaN

---

### 5. ADMINISTRATION SCORING ⚠️ Ultra-Generous

**No Preferences Behavior:**
```javascript
if (!hasAnyPreferences) {
  return {
    score: 100,
    factors: [{ factor: 'Open to any administrative situation', score: 100 }],
    category: 'Administration'
  }
}
```

**Result:** User gets **100%** if they don't specify ANY administration preferences.

**Missing Data Behavior:**
- If user has healthcare preference but town missing data: 17-20% fallback
- If user has safety preference but town missing data: 17-20% fallback

**Philosophy:** "No preference = open to anything = perfect match"

**Concerns:**
- ⚠️ **Very generous** like region and culture
- Creates same perverse incentive (skip questions = high score)
- Missing data fallbacks (17-20%) are relatively low compared to no-preference fallback (100%)

**Recommendation:** Change to 50% fallback for consistency

---

### 6. COST SCORING ⚠️ Ultra-Generous

**No Preferences Behavior:**
```javascript
if (!hasAnyPreferences) {
  return {
    score: 100,
    factors: [{ factor: 'Open to any cost situation', score: 100 }],
    category: 'Cost'
  }
}
```

**Result:** User gets **100%** if they don't specify ANY cost preferences.

**Missing Data Behavior:**
- If user has budget preference but town missing data: 20-30% fallback
- If user has rent preference but town missing data: 20-30% fallback

**Philosophy:** "No preference = open to anything = perfect match"

**Concerns:**
- ⚠️ **Very generous** like region, culture, admin
- Encourages skipping cost questions (important for retirement planning!)
- Missing data fallbacks (20-30%) much lower than no-preference fallback (100%)

**Recommendation:** Change to 50% fallback for consistency

---

## Generosity Spectrum Analysis

### No-Preference Fallback Scores (Current State)

```
Ultra-Generous (100%)          Strict (0%)           Broken (undefined)
│                              │                     │
Region ────┐                   │                     │
Culture ───┤                   │                     │
Admin ─────┤                   Climate               Hobbies
Cost ──────┘                   │                     │
           └─────────────────┬─┘                     │
                             │                       │
                          87% overall                │
                    (weighted average)               │
                                                     │
```

### Recommended Standardized Fallback

```
All Categories: 50%
│
Region ───┐
Climate ──┤
Culture ──┤
Hobbies ──┤
Admin ────┤
Cost ─────┘
    │
    └─── 50% overall (consistent, fair)
```

---

## Impact on User Experience

### Current Behavior Creates Perverse Incentives

**Scenario 1: Engaged User**
- Completes all onboarding questions
- Provides detailed preferences
- Gets penalized if town doesn't match perfectly
- **Result:** 60-80% typical scores

**Scenario 2: Lazy User**
- Skips most questions
- Only selects country
- Gets 100% in 5 of 6 categories (generous fallback)
- **Result:** 87% score with minimal effort!

**Conclusion:** Current system rewards skipping questions, punishes engagement.

---

## Missing Data vs No Preference: Double Standard

### The Inconsistency

**When USER has no preference:**
- Region/Culture/Admin/Cost: **100%** ("open to anything")
- Climate: **0%** ("no score")

**When TOWN has no data:**
- Region: **0%** (no match possible)
- Climate: **50-70%** (generous fallback)
- Culture: **50-60%** (generous fallback)
- Admin: **17-20%** (low fallback)
- Cost: **20-30%** (low fallback)

**This is backwards!** We're generous to users who don't engage, but penalize towns with missing data.

---

## Recommended Changes

### Priority 1: Fix Hobbies Undefined Bug 🚨 CRITICAL

```javascript
// hobbiesScoring.js - Add no-preference handling
if (!hasAnyPreferences) {
  return {
    score: 50,  // Fair fallback
    factors: [{ factor: 'Open to any activities', score: 50 }],
    category: 'Hobbies'
  }
}
```

**Impact:** Fixes undefined bug, prevents crashes

---

### Priority 2: Standardize No-Preference Handling ⚠️ HIGH

**Proposed change for ALL categories:**

```javascript
if (!hasAnyPreferences) {
  return {
    score: 50,  // Consistent across all categories
    factors: [{ factor: 'No specific preferences - baseline score', score: 50 }],
    category: categoryName
  }
}
```

**Before → After:**
- Region: 100% → **50%**
- Climate: 0% → **50%**
- Culture: 100% → **50%**
- Hobbies: undefined → **50%**
- Admin: 100% → **50%**
- Cost: 100% → **50%**

**Impact on "Minimal Preferences" Score:**
- Before: 87% (perverse)
- After: 50% (honest - "we don't know enough to match you")

**User Experience:**
- Encourages completing onboarding (can't game the system)
- Honest about lack of information
- Still fair (50% = "could be fine, could be not")

---

### Priority 3: Standardize Missing Data Handling 🟡 MEDIUM

**Current missing data fallbacks are inconsistent:**
- Climate: 50-70% (generous)
- Culture: 0-60% (inconsistent within category)
- Admin: 17-20% (low)
- Cost: 20-30% (low)

**Proposed standardized fallback: 40%**

**Rationale:**
- Lower than no-preference (50%) - missing data is worse than no preference
- Higher than current admin/cost (17-30%) - towns shouldn't be heavily penalized for missing 1-2 fields
- Creates clear hierarchy:
  - Perfect match: 100%
  - Adjacent match: 50-70% (depending on category)
  - No preference: 50%
  - Missing data: 40%
  - No match: 0%

---

## Implementation Strategy

### Behind Feature Flag: `ENABLE_STANDARDIZED_FALLBACKS`

```javascript
// config.js
export const FEATURE_FLAGS = {
  ENABLE_CULTURE_V2_SCORING: false,
  ENABLE_STANDARDIZED_FALLBACKS: false  // NEW
};

export const FALLBACK_SETTINGS = {
  NO_PREFERENCE_FALLBACK: 0.50,      // 50% when user has no preference
  MISSING_DATA_FALLBACK: 0.40,       // 40% when town missing data
  ADJACENT_MATCH_CLIMATE: 0.70,      // 70% for adjacent climate match
  ADJACENT_MATCH_CULTURE: 0.50,      // 50% for adjacent culture match
  ADJACENT_MATCH_REGION: 0.50        // 50% for adjacent region match
};
```

### Incremental Rollout

**Phase 1: Fix Hobbies Bug**
- Can deploy immediately (critical bug)
- No feature flag needed
- Set hobbies no-preference = 50%

**Phase 2: Standardize No-Preference (Flag OFF by Default)**
- Implement behind `ENABLE_STANDARDIZED_FALLBACKS` flag
- Test with real users
- Compare V1 (current) vs V2 (standardized) scores
- Measure impact on user engagement

**Phase 3: Standardize Missing Data (Same Flag)**
- Add missing data standardization to same flag
- Test combined impact
- Review with product team

**Phase 4: Promote to Default (If Approved)**
- Set flag to `true`
- Regenerate golden master with new baseline
- Deploy to production
- Monitor user satisfaction

---

## Risks & Mitigations

### Risk 1: Lower Scores May Frustrate Users

**Current:** Users see 87% with minimal effort
**After:** Users see 50% with minimal effort

**Mitigation:**
- Add messaging: "Complete your preferences to see better matches"
- Show progress bar: "Your profile is 20% complete"
- Nudge users to complete sections with low scores

### Risk 2: Towns with Missing Data May Score Lower

**Current:** Some towns get 50-70% fallback (generous)
**After:** Towns get 40% fallback (less generous)

**Mitigation:**
- Run data audit: Which towns have most missing fields?
- Prioritize data collection for popular towns
- Add "Data completeness" indicator to admin panel

### Risk 3: Existing Users May See Score Changes

**Current:** User matched at 87% with Town A
**After:** Same user matched at 65% with Town A

**Mitigation:**
- Don't show score changes to existing users (grandfather old scores)
- Only apply new logic to new matches
- Add version field to match records

---

## Testing Plan

### Synthetic Test Cases

**Test 1: No Preferences, No Data**
- User: Empty profile
- Town: Empty data
- Expected V1: 87% (current)
- Expected V2: 50% (standardized)

**Test 2: No Preferences, Complete Data**
- User: Empty profile
- Town: Complete data
- Expected V1: 87% (current)
- Expected V2: 50% (standardized)

**Test 3: Complete Preferences, No Data**
- User: Full profile
- Town: Empty data
- Expected V1: ~20% (mix of 0% and partials)
- Expected V2: ~40% (standardized fallback)

**Test 4: Complete Preferences, Complete Data, Perfect Match**
- User: Full profile
- Town: Matches perfectly
- Expected V1: 95-100%
- Expected V2: 95-100% (unchanged)

### Real Data Analysis

**Query to run before changes:**
```sql
SELECT
  AVG(overall_score) as avg_score,
  AVG(region_score) as avg_region,
  AVG(climate_score) as avg_climate,
  AVG(culture_score) as avg_culture,
  AVG(hobbies_score) as avg_hobbies,
  AVG(admin_score) as avg_admin,
  AVG(cost_score) as avg_cost,
  COUNT(*) as total_matches
FROM user_town_matches
WHERE user_preferences_complete = false;  -- Users with minimal preferences
```

**Expected impact:**
- Overall scores for minimal-preference users will drop from ~85-90% to ~50%
- This is **desired behavior** - honest scoring

---

## Conclusion

### Current State: Fundamentally Inconsistent

The scoring system has **3 different philosophies** for the same situation (no preferences):
1. Ultra-generous: 100% (region, culture, admin, cost)
2. Ultra-strict: 0% (climate)
3. Broken: undefined (hobbies)

This creates:
- **Perverse incentives** (skip questions = high score)
- **User confusion** (why do I score 87% when I didn't answer anything?)
- **Unfair comparisons** (engaged users score lower than lazy users)

### Recommended State: Standardized & Honest

**All categories should use the same fallback:**
- No preference: **50%** (honest - "we don't know if this is a good match")
- Missing data: **40%** (slightly lower - missing data is worse)
- Adjacent match: **50-70%** (depends on category)
- Perfect match: **100%**
- No match: **0%**

**Benefits:**
- **Consistent** across all categories
- **Honest** about lack of information
- **Encourages** user engagement
- **Fair** to both users and towns

**Implementation:** Behind feature flag, with careful testing and user communication.

---

**Report Generated:** November 14, 2025
**Analysis Tool:** `tests/scoring/analyzeMissingData.js`
**Next Steps:** Implement behind `ENABLE_STANDARDIZED_FALLBACKS` feature flag
