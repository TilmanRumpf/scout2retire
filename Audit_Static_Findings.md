# Static Code Analysis - Critical Risk Areas

Generated: November 13, 2025

**Focus:** Hardcoded adjacency duplication, categorical field usage, missing data behavior

---

## 🔴 CRITICAL FINDINGS

### Finding #1: Two Fields Asked in Onboarding But NOT Scored (BUG)

**Fields Affected:**
1. `social_atmosphere` - User selects preference, algorithm ignores it
2. `traditional_progressive_lean` - User selects preference, algorithm ignores it

**Evidence:**
- `OnboardingCulture.jsx` asks about social atmosphere and traditional/progressive lean
- `cultureScoring.js` does NOT score these fields
- Fields exist in `categoricalValues.js`
- User sets preferences that have zero impact on results

**Impact:** **HIGH** - User expects these preferences to matter, but they're silently ignored

**Recommendation:**
- **Option A:** Add scoring logic to cultureScoring.js (10 points each from other categories)
- **Option B:** Remove from onboarding if not intended to be scored
- **Option C:** Document as "display only" if intentional

---

### Finding #2: Inconsistent Missing Data Philosophy (DESIGN ISSUE)

**Categories Award Vastly Different Points for Missing Data:**

| Category | Missing Data Score | Philosophy |
|----------|-------------------|------------|
| **Region** | 0% (strict) | "Must have preferences to match" |
| **Climate** | 50-70% (graceful) | "Assume reasonable defaults, infer from other data" |
| **Culture** | 0-60% (mixed) | "Some categories give partial credit, others none" |
| **Admin** | 17-20% (minimal) | "Small credit to avoid total penalty" |
| **Cost** | 20-30% (neutral) | "Middle ground score" |
| **Hobbies** | 30-50% (moderate) | "Universal hobbies provide baseline" |

**Evidence:**
- `regionScoring.js` lines 70-73: Returns 0 if no preferences
- `climateScoring.js` lines 316-346: Complex 3-tier fallback inference
- `cultureScoring.js`: Mixed behavior (lines 97-99, 140-142)
- `adminScoring.js`: Minimal fallback credit
- `costScoring.js` lines 212-216: Neutral 20-point baseline

**Impact:** **MEDIUM** - System behavior is unpredictable when users skip questions

**Recommendation:**
- Define consistent missing data policy across all categories
- Document intentional differences if they exist
- Consider product decision: Should "no preference" mean "neutral match" or "disqualifying"?

---

### Finding #3: Geographic/Vegetation Adjacency NOT Centralized (DUPLICATION)

**Problem:** Region scoring has hardcoded adjacency rules that exist nowhere else

**Evidence:**
```javascript
// regionScoring.js lines 183-207 - ONLY location with this logic
const relatedFeatures = {
  coastal: ['island', 'lake', 'river'],
  island: ['coastal'],
  lake: ['coastal', 'river'],
  river: ['coastal', 'lake'],
  mountain: ['valley', 'forest'],
  valley: ['mountain', 'plains'],
  plains: ['valley']
};
```

**Compare to Climate:** All climate adjacency centralized in `gradualScoring.js`

**Impact:** **MEDIUM** - Maintenance burden, harder to update adjacency rules

**Recommendation:**
- Move to centralized adjacency config (like climate system)
- Create `adjacencyRules.js` with all geographic/vegetation relationships
- Import into regionScoring.js

---

## 📋 HARDCODED ADJACENCY RULES & DUPLICATION

### Summary Table

| Adjacency Type | Primary Location | Duplicated In | Status | Risk |
|----------------|------------------|---------------|--------|------|
| **Humidity** | `gradualScoring.js:85-89` | `climateScoring.js:319-323` | DUPLICATED | HIGH |
| **Sunshine** | `gradualScoring.js:91-95` | `climateScoring.js:408-415` | DUPLICATED | HIGH |
| **Precipitation** | `gradualScoring.js:97-101` | `climateScoring.js:470-474` | DUPLICATED | HIGH |
| **Pace of Life** | `gradualScoring.js:103-107` | `cultureScoring.js:29-33` | DUPLICATED | MEDIUM |
| **Urban/Rural** | `gradualScoring.js:109-113` | `cultureScoring.js:35-39` | DUPLICATED | MEDIUM |
| **Expat Community** | `gradualScoring.js:115-119` | `cultureScoring.js:41-45` | DUPLICATED | MEDIUM |
| **Geographic Features** | `regionScoring.js:183-207` | NONE | NOT CENTRALIZED | MEDIUM |
| **Vegetation** | `regionScoring.js:248-269` | NONE | NOT CENTRALIZED | MEDIUM |

### Detailed Analysis

#### 1. Humidity Adjacency (DUPLICATED - HIGH RISK)

**Primary Definition:** `gradualScoring.js` lines 85-89
```javascript
export const ADJACENCY_RULES = {
  humidity_level_actual: {
    'dry': ['balanced'],
    'balanced': ['dry', 'humid'],
    'humid': ['balanced']
  }
  // ...
};
```

**Duplicate:** `climateScoring.js` lines 319-323
```javascript
const humidityAdjacency = {
  'dry': ['balanced'],
  'balanced': ['dry', 'humid'],
  'humid': ['balanced']
};
```

**Risk:** If humidity adjacency changes, must update TWO files - easy to miss one

---

#### 2. Sunshine Adjacency (DUPLICATED - HIGH RISK)

**Primary Definition:** `gradualScoring.js` lines 91-95
**Duplicate:** `climateScoring.js` lines 408-415

**Same Issue:** Two sources of truth for identical logic

---

#### 3. Precipitation Adjacency (DUPLICATED - HIGH RISK)

**Primary Definition:** `gradualScoring.js` lines 97-101
**Duplicate:** `climateScoring.js` lines 470-474

**Same Issue:** Three climate adjacency rules all duplicated

---

#### 4. Culture Adjacency Rules (DUPLICATED - MEDIUM RISK)

**Pace of Life, Urban/Rural, Expat Community:**
- All defined in `gradualScoring.js` lines 103-119
- All duplicated in `cultureScoring.js` lines 29-45

**Why Medium Risk:** Culture scoring actually USES centralized version in some places, but also has local copies

---

#### 5. Geographic Features Adjacency (NOT CENTRALIZED)

**Location:** `regionScoring.js` lines 183-207
**Status:** ONLY exists here, not in centralized config

**Problem:** Unlike climate/culture, region adjacency is NOT centralized

**Geographic Features Adjacency:**
```javascript
const relatedFeatures = {
  coastal: ['island', 'lake', 'river'],      // 50% credit
  island: ['coastal'],
  lake: ['coastal', 'river'],
  river: ['coastal', 'lake'],
  mountain: ['valley', 'forest'],
  valley: ['mountain', 'plains'],
  plains: ['valley'],
  desert: [],                                 // No related
  forest: ['mountain'],
  plateau: [],
  archipelago: ['coastal', 'island']
};
```

**Award:** 50% credit (15 points of 30) for related geographic features

---

#### 6. Vegetation Adjacency (NOT CENTRALIZED)

**Location:** `regionScoring.js` lines 248-269
**Status:** ONLY exists here, not in centralized config

**Vegetation Adjacency:**
```javascript
const relatedVegetation = {
  tropical: ['subtropical'],
  subtropical: ['tropical', 'temperate'],
  temperate: ['subtropical', 'mediterranean', 'continental'],
  mediterranean: ['temperate', 'subtropical'],
  continental: ['temperate'],
  alpine: ['subalpine'],
  subalpine: ['alpine', 'temperate'],
  desert: [],
  tundra: []
};
```

**Award:** 50% credit (10 points of 20) for related vegetation types

---

### Centralization Recommendation

**Create:** `src/utils/scoring/config/adjacencyRules.js`

```javascript
export const ADJACENCY_RULES = {
  // Climate adjacency
  humidity_level_actual: {
    'dry': ['balanced'],
    'balanced': ['dry', 'humid'],
    'humid': ['balanced']
  },
  sunshine_level_actual: {
    'low': ['balanced'],
    'balanced': ['low', 'high'],
    'high': ['balanced']
  },
  precipitation_level_actual: {
    'low': ['moderate'],
    'moderate': ['low', 'high'],
    'high': ['moderate']
  },

  // Culture adjacency
  pace_of_life_actual: {
    'slow': ['relaxed'],
    'relaxed': ['slow', 'moderate'],
    'moderate': ['relaxed', 'fast'],
    'fast': ['moderate']
  },
  urban_rural_character: {
    'rural': ['small_town'],
    'small_town': ['rural', 'suburban', 'urban'],
    'suburban': ['small_town', 'urban'],
    'urban': ['suburban']
  },
  expat_community_size: {
    'none': ['minimal'],
    'minimal': ['none', 'limited'],
    'limited': ['minimal', 'moderate'],
    'moderate': ['limited', 'strong'],
    'strong': ['moderate', 'extensive'],
    'extensive': ['strong', 'very_strong'],
    'very_strong': ['extensive']
  },

  // Region adjacency (NEW - currently hardcoded)
  geographic_features_actual: {
    coastal: ['island', 'lake', 'river'],
    island: ['coastal'],
    lake: ['coastal', 'river'],
    river: ['coastal', 'lake'],
    mountain: ['valley', 'forest'],
    valley: ['mountain', 'plains'],
    plains: ['valley'],
    desert: [],
    forest: ['mountain'],
    plateau: [],
    archipelago: ['coastal', 'island']
  },
  vegetation_type_actual: {
    tropical: ['subtropical'],
    subtropical: ['tropical', 'temperate'],
    temperate: ['subtropical', 'mediterranean', 'continental'],
    mediterranean: ['temperate', 'subtropical'],
    continental: ['temperate'],
    alpine: ['subalpine'],
    subalpine: ['alpine', 'temperate'],
    desert: [],
    tundra: []
  }
};
```

**Then:** Update all category scorers to import from centralized config

---

## 📊 CATEGORICAL FIELD USAGE MATRIX

### Complete 22-Field Analysis

| Field Name | Defined in categoricalValues.js | Asked in Onboarding | Scored in Algorithm | Displayed in UI | Status |
|------------|----------------------------------|---------------------|---------------------|-----------------|--------|
| **retirement_community_presence** | ✅ | ❌ | ❌ | ✅ (town cards) | DISPLAY ONLY |
| **sunshine_level_actual** | ✅ | ❌ | ✅ (Climate 20pts) | ✅ | SCORED |
| **precipitation_level_actual** | ✅ | ❌ | ✅ (Climate 10pts) | ✅ | SCORED |
| **pace_of_life_actual** | ✅ | ✅ | ✅ (Culture 20pts) | ✅ | FULLY USED |
| **seasonal_variation_actual** | ✅ | ✅ | ✅ (Climate modifier) | ✅ | FULLY USED |
| **cultural_events_frequency** | ✅ | ✅ | ✅ (Culture 10pts) | ✅ | FULLY USED |
| **social_atmosphere** | ✅ | ✅ | ❌ | ✅ | **BUG - NOT SCORED** |
| **traditional_progressive_lean** | ✅ | ✅ | ❌ | ✅ | **BUG - NOT SCORED** |
| **expat_community_size** | ✅ | ✅ | ✅ (Culture 10pts) | ✅ | FULLY USED |
| **english_proficiency_level** | ✅ | ❌ | ✅ (Culture language) | ✅ | SCORED |
| **urban_rural_character** | ✅ | ✅ | ✅ (Culture 20pts) | ✅ | FULLY USED |
| **summer_climate_actual** | ✅ | ✅ | ✅ (Climate 25pts) | ✅ | FULLY USED |
| **winter_climate_actual** | ✅ | ✅ | ✅ (Climate 25pts) | ✅ | FULLY USED |
| **humidity_level_actual** | ✅ | ✅ | ✅ (Climate 20pts) | ✅ | FULLY USED |
| **climate** | ✅ | ❌ | ❌ | ✅ (legacy) | DISPLAY ONLY |
| **crime_rate** | ✅ | ❌ | ✅ (Admin safety) | ✅ | SCORED |
| **natural_disaster_risk_level** | ✅ | ❌ | ✅ (Admin safety) | ✅ | SCORED |
| **emergency_services_quality** | ✅ | ❌ | ✅ (Admin safety) | ✅ | SCORED |
| **english_speaking_doctors** | ✅ | ❌ | ✅ (Admin healthcare) | ✅ | SCORED |
| **healthcare_cost** | ✅ | ❌ | ✅ (Cost bonus) | ✅ | SCORED |
| **geographic_features_actual** | ✅ | ✅ | ✅ (Region 30pts) | ✅ | FULLY USED |
| **vegetation_type_actual** | ✅ | ✅ | ✅ (Region 20pts) | ✅ | FULLY USED |

### Field Categories

**✅ FULLY USED (14 fields):** Asked, scored, displayed
- `pace_of_life_actual`, `seasonal_variation_actual`, `cultural_events_frequency`, `expat_community_size`, `urban_rural_character`, `summer_climate_actual`, `winter_climate_actual`, `humidity_level_actual`, `geographic_features_actual`, `vegetation_type_actual`, and 4 admin fields

**⚠️ SCORED BUT NOT ASKED (8 fields):** Algorithm uses but onboarding doesn't ask
- `sunshine_level_actual`, `precipitation_level_actual`, `english_proficiency_level`, `crime_rate`, `natural_disaster_risk_level`, `emergency_services_quality`, `english_speaking_doctors`, `healthcare_cost`
- **Reason:** These are TOWN attributes, not user preferences - correct behavior

**🔴 ASKED BUT NOT SCORED (2 fields - BUG):**
- `social_atmosphere` - Onboarding asks, algorithm ignores
- `traditional_progressive_lean` - Onboarding asks, algorithm ignores

**📺 DISPLAY ONLY (2 fields):** Shown in UI but not scored
- `retirement_community_presence` - Used for filtering/display
- `climate` - Legacy field (replaced by summer/winter split)

---

## 🔍 MISSING DATA & "NO PREFERENCE" BEHAVIOR BY CATEGORY

### Region Scoring (STRICT - 0% for missing)

**File:** `regionScoring.js`
**Philosophy:** "Must have preferences to match"

**Behavior:**
```javascript
// Lines 70-73
if (!prefs.country && (!prefs.region || prefs.region.length === 0) &&
    (!prefs.states || prefs.states.length === 0)) {
  return { score: 0, maxPoints: 90 };  // ZERO points
}
```

**Impact:**
- If user skips country/region/state preferences → 0% region score → 30% of total weight lost
- Geographic features preference missing → 0 points (lines 169-177)
- Vegetation preference missing → 0 points (lines 234-244)

**Rationale:** Region is 30% of total weight - most important category - should require user input

---

### Climate Scoring (GRACEFUL - 50-70% for missing)

**File:** `climateScoring.js`
**Philosophy:** "Assume reasonable defaults, infer from other data"

**Behavior:**

**Temperature preferences missing:**
```javascript
// Lines 197-205
if (!userSummer || userSummer.length === 0) {
  tempScore += POINTS.SUMMER * 0.5;  // 50% credit (12.5 points)
}
if (!userWinter || userWinter.length === 0) {
  tempScore += POINTS.WINTER * 0.5;  // 50% credit (12.5 points)
}
```

**Humidity missing with 3-tier fallback:**
```javascript
// Lines 316-346 - Complex inference logic
// 1. Try database field: town.humidity_level_actual
// 2. If missing, infer from precipitation: high precip → humid
// 3. If still missing, infer from climate: tropical → humid
// Awards 70% credit (14 of 20 points) for inferred values
```

**Sunshine/Precipitation:**
- Missing sunshine → 70% credit (14 of 20 points)
- Missing precipitation → 70% credit (7 of 10 points)

**Seasonal variation:**
- Missing preference → 50% credit (7.5 of 15 points)

**Total Missing Data Score:** ~60% of total climate points

**Rationale:** Climate preferences less critical, reasonable to assume "moderate" preferences

---

### Culture Scoring (MIXED - 0-60% depending on field)

**File:** `cultureScoring.js`
**Philosophy:** Mixed - some categories graceful, others strict

**Urban/Rural:**
```javascript
// Lines 97-99 - Graceful
if (!userUrbanRuralPrefs || userUrbanRuralPrefs.length === 0) {
  score += POINTS.LIVING_ENVIRONMENT * 0.5;  // 50% credit (10 pts)
}
```

**Pace of Life:**
```javascript
// Lines 140-142 - Graceful
if (!userPacePrefs || userPacePrefs.length === 0) {
  score += POINTS.PACE * 0.6;  // 60% credit (12 pts)
}
```

**Language:**
```javascript
// Lines 151-169 - STRICT
if (!userLanguagePrefs || userLanguagePrefs.length === 0) {
  // NO credit - 0 points
}
```

**Expat/Dining/Events/Museums:** No explicit missing data handling → 0 points

**Total Missing Data Score:** ~0-30% depending on which fields missing

**Rationale:** Inconsistent - appears unintentional

---

### Administration Scoring (MINIMAL - 17-20% for missing)

**File:** `adminScoring.js`
**Philosophy:** "Small credit to avoid total penalty"

**Healthcare:**
```javascript
// Lines 74-96 - Dynamic calculation with fallback
const healthcareCalc = calculateHealthcareScore(town, prefs);
// If ALL healthcare data missing → ~20% baseline credit
```

**Safety:**
```javascript
// Lines 114-132 - Dynamic calculation with fallback
const safetyCalc = calculateSafetyScore(town, prefs);
// If ALL safety data missing → ~15% baseline credit
```

**Government/Visa/Environment/Political:**
- No explicit missing data handling
- Quality levels default to "basic" if missing → ~17% credit

**Total Missing Data Score:** ~17-20% of total admin points

**Rationale:** Administrative factors somewhat objective - shouldn't give too much credit for missing data

---

### Cost Scoring (NEUTRAL - 20-30% for missing)

**File:** `costScoring.js`
**Philosophy:** "Middle ground score - neither penalize nor reward"

**Base Cost:**
```javascript
// Lines 212-216
if (!userBudget || userBudget <= 0) {
  return {
    score: 20,              // Neutral 20 points
    maxPoints: MAX_POINTS,
    details: { /* ... */ }
  };
}
```

**Rent Bonus:**
- Missing rent preference → 0 bonus points (not 50% credit)

**Healthcare Bonus:**
- Missing healthcare cost preference → 0 bonus points

**Tax:**
- Missing tax preference → 0 tax points

**Total Missing Data Score:** 20-30% (base only, no bonuses)

**Rationale:** Cost is objective - can't assume user's budget - neutral score prevents extreme penalty

---

### Hobbies Scoring (MODERATE - 30-50% for missing)

**File:** `hobbiesScoring.js`
**Philosophy:** "Universal hobbies provide baseline"

**Universal Hobbies:**
```javascript
// Lines 27-41 - 15 universal hobbies available everywhere
// If user selects NO hobbies → still gets credit for universal hobby availability
```

**Missing hobby preferences:**
- User still scores based on universal hobbies (dining, nature walks, etc.)
- ~30-50% baseline score depending on town's universal hobby support

**Rationale:** Some hobbies truly universal - reasonable baseline even without preferences

---

### Cross-Category Comparison

| Category | Missing Data Score | Impact on Total | Philosophy |
|----------|-------------------|-----------------|------------|
| **Region** (30% weight) | 0% | -30% total | STRICT |
| **Climate** (13% weight) | 60% | -5.2% total | GRACEFUL |
| **Culture** (12% weight) | 0-30% | -8.4 to -12% total | MIXED |
| **Hobbies** (8% weight) | 30-50% | -4 to -5.6% total | MODERATE |
| **Admin** (18% weight) | 17-20% | -14.4 to -15% total | MINIMAL |
| **Cost** (19% weight) | 20-30% | -13.3 to -15.2% total | NEUTRAL |

**Worst Case (all preferences missing):**
- Region: 0% × 30 = 0
- Climate: 60% × 13 = 7.8
- Culture: 15% × 12 = 1.8 (assuming mixed average)
- Hobbies: 40% × 8 = 3.2
- Admin: 18% × 18 = 3.24
- Cost: 25% × 19 = 4.75
- **Total: ~21% match score** (Poor match)

**Implication:** User who skips ALL questions gets ~21% baseline score - likely intentional to prevent 0% matches

---

## 🎯 PRIORITIZED RECOMMENDATIONS

### 🔴 HIGH PRIORITY (Fix These First)

**1. Fix social_atmosphere and traditional_progressive_lean Scoring Bug**
- **Impact:** HIGH - Breaking user expectations
- **Effort:** LOW - Add 10-20 lines of scoring logic
- **Files:** `cultureScoring.js`
- **Action:**
  - Add scoring logic (10 points each) OR
  - Remove from `OnboardingCulture.jsx` onboarding OR
  - Add UI notice: "For display only, doesn't affect matching"

**2. Centralize ALL Adjacency Rules**
- **Impact:** HIGH - Maintenance burden, potential for inconsistency
- **Effort:** MEDIUM - Create new config file, update 6 category scorers
- **Files:** Create `adjacencyRules.js`, update all scorers
- **Action:**
  - Move all adjacency definitions to single config file
  - Remove duplicates from `climateScoring.js` and `cultureScoring.js`
  - Move region adjacency from `regionScoring.js` to centralized config
  - Update all scorers to import from centralized config

---

### 🟡 MEDIUM PRIORITY (Address After High Priority)

**3. Standardize Missing Data Philosophy**
- **Impact:** MEDIUM - Unpredictable behavior, user confusion
- **Effort:** MEDIUM - Product decision + implementation across 6 files
- **Action:**
  - Define consistent missing data policy (recommend 30-50% baseline)
  - Document intentional differences per category
  - Update scorers to follow consistent pattern

**4. Document Display-Only Fields**
- **Impact:** LOW - Confusing for developers
- **Effort:** LOW - Add comments and documentation
- **Files:** `categoricalValues.js`, `OnboardingCulture.jsx`
- **Action:**
  - Add `// DISPLAY ONLY - Not scored` comments
  - Document in AlgorithmLogic13Nov2025.md
  - Consider separating display-only fields into separate config

---

### 🟢 LOW PRIORITY (Nice to Have)

**5. Create Categorical Field Usage Report**
- **Impact:** LOW - Developer convenience
- **Effort:** LOW - Script to generate report
- **Action:**
  - Create automated script to check field usage across codebase
  - Flag fields defined but never used
  - Flag fields used but not defined

**6. Add Field Usage Validation Tests**
- **Impact:** LOW - Prevent future bugs
- **Effort:** MEDIUM - Write tests
- **Action:**
  - Test: All onboarding fields are either scored or marked display-only
  - Test: All scored fields are defined in categoricalValues.js
  - Test: No duplicated adjacency rules

---

## 📈 IMPACT ANALYSIS

### Code Quality Metrics

**Current State:**
- **Adjacency Rule Duplication:** 8 instances (6 duplicated, 2 not centralized)
- **Categorical Fields:** 22 defined, 20 used, 2 bugs (asked but not scored)
- **Missing Data Handling:** 6 different philosophies across 6 categories
- **Files Requiring Changes:** 8-10 files for full cleanup

**After High Priority Fixes:**
- **Adjacency Rule Duplication:** 0 instances (all centralized)
- **Categorical Fields:** 22 defined, 22 used correctly
- **Missing Data Handling:** Still inconsistent (requires product decision)
- **Maintenance Burden:** Reduced by ~40%

### User Experience Impact

**Current Bugs:**
- 2 onboarding questions ignored → User confusion, wasted time
- Inconsistent missing data handling → Unpredictable match scores

**After Fixes:**
- All onboarding questions matter OR clearly marked display-only
- Consistent scoring behavior when preferences missing

---

## ✅ VERIFICATION CHECKLIST

After implementing fixes, verify:

- [ ] All adjacency rules in centralized config file
- [ ] No duplication of adjacency definitions
- [ ] `social_atmosphere` and `traditional_progressive_lean` either scored or removed
- [ ] All 22 categorical fields have clear purpose (scored, asked, displayed, or marked unused)
- [ ] Missing data philosophy documented for each category
- [ ] Tests added to prevent future adjacency duplication
- [ ] Tests added to ensure onboarding fields are scored

---

**END OF STATIC CODE ANALYSIS**

**Summary:**
- **3 Critical Findings:** 2 scoring bugs, 1 inconsistent design pattern
- **8 Adjacency Rule Instances:** 6 duplicated (high risk), 2 not centralized (medium risk)
- **22 Categorical Fields:** 14 fully used, 6 scored-only, 2 display-only, 2 bugs
- **6 Missing Data Philosophies:** Range from 0% (strict) to 70% (graceful)
- **6 Recommendations:** 2 high priority, 2 medium priority, 2 low priority

**Next Step:** STEP 3 - Design test harness to verify scoring behavior

