# Tiered Hobby Scoring System
**Implementation Date:** September 7, 2025  
**Author:** Claude (with Tilman)  
**Status:** ✅ IMPLEMENTED & WORKING

## Overview
The tiered hobby scoring system gives **2x weight** to specific hobby selections made through "Explore More" buttons compared to generic compound button selections.

## The Problem We Solved
Previously, all hobby selections were weighted equally whether they came from:
- Generic compound buttons (e.g., "Water Sports" → expands to 5 activities)
- Specific "Explore More" selections (e.g., individually selecting "Scuba Diving")

This meant users who took time to specify exact hobbies weren't rewarded with better matching scores.

## The Solution Architecture

### Data Flow
```
User Interface (OnboardingHobbies.jsx)
├── Compound Buttons → activities[] array
├── "Explore More" → custom_physical[] array  
└── Both merged → activities[] for matching

Database Storage
├── activities: ["swimming", "snorkeling", ...] (merged list)
├── custom_physical: ["scuba diving"] (Explore More only)
└── custom_hobbies: ["painting"] (Explore More for interests)
```

### Scoring Implementation

#### File: `/src/utils/scoring/helpers/hobbiesMatching.js`

**Lines 166-167:** Create Sets for fast lookup
```javascript
const customPhysicalSet = new Set(userHobbies.custom_physical || []);
```

**Lines 169-186:** Assign tiers to activities
```javascript
if (userHobbies.activities?.length) {
  userHobbies.activities.forEach(activity => {
    // Check if from Explore More (Tier 2) or compound button (Tier 1)
    hobbyTiers[h] = customPhysicalSet.has(h) ? 2 : 1;
  });
}
```

**Lines 189-208:** Same for interests with custom_hobbies
```javascript
const customHobbiesSet = new Set(userHobbies.custom_hobbies || []);
// Similar tier assignment for interests
```

**Lines 227-257:** Apply weighted scoring
```javascript
// Count weighted matches
matchedHobbies.forEach(hobby => {
  const tier = hobbyTiers[hobby] || 1;
  const weight = tier === 2 ? 2 : 1; // Tier 2 gets 2x weight
  weightedMatches += weight;
});
```

#### File: `/src/utils/scoring/unifiedScoring.js`

**Lines 135-137:** Pass custom_physical through to scoring
```javascript
if (userPreferences.custom_physical !== undefined && userPreferences.custom_physical !== null) {
  hobbiesPrefs.custom_physical = userPreferences.custom_physical;
}
```

### UI Implementation

#### File: `/src/pages/onboarding/OnboardingHobbies.jsx`

**Lines 940-946:** Smart data saving
```javascript
const dataToSave = {
  // Merged list for matching algorithm
  activities: [...new Set([...expandedActivities, ...formData.custom_physical])],
  // Preserve Explore More selections separately
  custom_physical: formData.custom_physical,
  custom_hobbies: formData.custom_hobbies,
};
```

## How It Works

### Example 1: Generic Selection Only
```
User clicks: "Water Sports" button
Saved as:
  - activities: ["swimming", "snorkeling", "water_skiing", "swimming_laps", "water_aerobics"]
  - custom_physical: []

Scoring:
  - All 5 activities get Tier 1 (1x weight)
  - If 5 match in town: 5/5 = 100%
```

### Example 2: Mixed Selection
```
User clicks: "Water Sports" + "Explore More" → selects "Scuba Diving", "Kitesurfing"
Saved as:
  - activities: ["swimming", "snorkeling", ..., "scuba_diving", "kitesurfing"]
  - custom_physical: ["scuba_diving", "kitesurfing"]

Scoring:
  - 5 activities from Water Sports: Tier 1 (1x weight each = 5)
  - 2 activities from Explore More: Tier 2 (2x weight each = 4)
  - Total weight: 9
  - If all match: 9/9 = 100%
  - If only Explore More match: 4/9 = 44% (vs 2/7 = 28% without tiering)
```

## Important Notes

### Historical Data Limitation
- **Cannot retroactively apply** tiered scoring to existing users
- Old data doesn't track HOW activities were selected
- Only works for NEW selections going forward

### Current User State (Tilman)
```javascript
activities: ["snorkeling", "swimming", "swimming_laps", "water_aerobics", "water_skiing"]
custom_physical: [] // Empty - no Explore More selections
```
Result: All activities are Tier 1, scoring remains at 59% for coastal towns

### Testing Commands
```bash
# Test the implementation
node database-utilities/test-tiered-scoring-fixed.js

# Check user's current data
node claude-db-helper.js "SELECT activities, custom_physical FROM user_preferences WHERE user_id = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8'"
```

## Files Modified

1. **`/src/utils/scoring/helpers/hobbiesMatching.js`**
   - Lines 166-214: Tier assignment logic
   - Lines 227-257: Weighted scoring calculation

2. **`/src/utils/scoring/unifiedScoring.js`**
   - Lines 135-137: Added custom_physical pass-through

3. **`/src/pages/onboarding/OnboardingHobbies.jsx`**
   - Lines 940-946: Already correctly saving data (no changes needed)

## Verification

The system is verified working by:
1. ✅ Code review shows correct implementation
2. ✅ Test script demonstrates tiered weighting
3. ✅ UI correctly saves to separate arrays
4. ✅ Scoring algorithm applies correct weights

## Future Improvements

1. **UI Indication**: Show users that Explore More selections get priority
2. **Migration Tool**: Allow users to re-select hobbies to benefit from tiering
3. **Analytics**: Track how much tiering improves match satisfaction

## Related Documentation
- `/docs/algorithms/geographic-inference-hobbies.md` - How hobbies are inferred from geography
- `/docs/project-history/2025-09-05-towns-data-improvements.md` - Debugging session that led to this
- `/src/utils/scoring/README.md` - Overview of all scoring algorithms

---

## Summary for Tilman

**What we built:** A system that rewards users who take time to specify exact hobbies through "Explore More" by giving those selections 2x weight in scoring.

**Why it matters:** Users who say "I specifically want scuba diving" should match better with coastal towns than users who just clicked "Water Sports".

**Current limitation:** Your existing data can't benefit because we don't know which activities came from compound buttons vs Explore More.

**Going forward:** All new users (and you if you re-do hobbies) will benefit from better matching when using Explore More.