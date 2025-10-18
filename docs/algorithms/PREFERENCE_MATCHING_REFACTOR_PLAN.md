# Preference Matching Refactor Plan

**Created**: 2025-10-17
**Status**: Planning Phase
**Goal**: Apply component-based architecture to preference-matching scoring categories

---

## Overview

We have 5 preference-matching categories (0-100% compatibility) that need refactoring:

1. **Climate Scoring** (699 lines) - Most complex
2. **Cost Scoring** (336 lines) - Tax calculations duplicated with Admin
3. **Culture Scoring** (347 lines) - Social/lifestyle preferences
4. **Region Scoring** (294 lines) - Geographic preferences
5. **Hobbies Scoring** (23 lines) - Very simple, minimal

---

## Key Distinction from Healthcare/Safety

**Healthcare/Safety = Quality Scores (0-10.0)**
- Absolute measurement of town quality
- Independent of user preferences
- Example: "This town has excellent healthcare (8.3/10.0)"

**Climate/Cost/Culture/Region/Hobbies = Preference Matching (0-100%)**
- Relative compatibility with user preferences
- Requires both user input AND town data
- Example: "This town matches your climate preferences (85/100)"

---

## Current State Analysis

### Climate Scoring (Already Component-Based!)

**Current Components** (lines 157-400+):
- Summer Temperature (25 pts)
- Winter Temperature (25 pts)
- Humidity (20 pts)
- Sunshine (20 pts)
- Precipitation (10 pts)
- Seasonal Preference Bonus (15 pts)
- **Total**: 115 pts → capped at 100

**Issues**:
- Not formally structured as separate functions
- 699 lines in one file (hard to maintain)
- Duplicate logic for temperature calculations
- Fallback logic scattered throughout

**Refactoring Opportunity**:
```javascript
// BEFORE: All in one function
export function calculateClimateScore(preferences, town) {
  // 699 lines of mixed logic
}

// AFTER: Component-based
function calculateTemperatureMatch(userPrefs, town) {
  const summer = calculateSummerMatch(userPrefs.summer, town.avg_temp_summer);
  const winter = calculateWinterMatch(userPrefs.winter, town.avg_temp_winter);
  return { summer, winter, total: summer + winter, maxPoints: 50 };
}

function calculateWeatherConditionsMatch(userPrefs, town) {
  const humidity = calculateHumidityMatch(userPrefs.humidity, town.humidity_level_actual);
  const sunshine = calculateSunshineMatch(userPrefs.sunshine, town.sunshine_level_actual);
  const precipitation = calculatePrecipitationMatch(userPrefs.precipitation, town.precipitation_level_actual);
  return { humidity, sunshine, precipitation, total: ..., maxPoints: 50 };
}

function calculateSeasonalPreferenceBonus(userPrefs, town) {
  // 15 point bonus for seasonal alignment
}

export function calculateClimateScore(preferences, town) {
  const temp = calculateTemperatureMatch(parsed.climate, town);
  const weather = calculateWeatherConditionsMatch(parsed.climate, town);
  const seasonal = calculateSeasonalPreferenceBonus(parsed.climate, town);

  const total = Math.min(temp.total + weather.total + seasonal, 100);

  return {
    score: total,
    factors: [...],
    category: 'Climate',
    breakdown: { temp, weather, seasonal }
  };
}
```

---

### Cost Scoring

**Current Components** (lines 143-336):
- Base Budget Fit (70 pts) - Town cost vs user budget
- Rent Match Bonus (20 pts) - If user sets rent budget
- Healthcare Budget Bonus (10 pts) - If user sets healthcare budget
- Tax Scoring (15 pts) - Tax sensitivity
- **Total**: 115 pts → capped at 100

**Issues**:
- `calculateTaxScore()` duplicated from `adminScoring.js`
- `calculateGradualTaxScore()` also duplicated
- Complex power-user penalty logic (fixed Oct 17, but still complex)

**Refactoring Opportunity**:
```javascript
// Extract shared tax utilities
// src/utils/scoring/helpers/taxScoring.js
export function calculateTaxScore(preferences, town, maxPoints = 15) { ... }
export function calculateGradualTaxScore(taxRate, taxType) { ... }

// Component-based cost scoring
function calculateBudgetMatch(userBudget, townCost) { ... }
function calculateRentMatch(userRent, townRent) { ... }
function calculateHealthcareCostMatch(userBudget, townCost) { ... }

export function calculateCostScore(preferences, town) {
  const budget = calculateBudgetMatch(...);
  const rent = calculateRentMatch(...);
  const healthcare = calculateHealthcareCostMatch(...);
  const tax = calculateTaxScore(...); // imported from shared helper

  return {
    score: Math.min(budget + rent + healthcare + tax, 100),
    breakdown: { budget, rent, healthcare, tax }
  };
}
```

---

### Culture Scoring

**Current Components** (lines 95-347):
- Pace of Life (20 pts)
- Social Atmosphere (20 pts)
- Traditional/Progressive (15 pts)
- Cultural Events (15 pts)
- Expat Community (10 pts)
- Language Preference (10 pts)
- LGBT Friendliness (10 pts)
- **Total**: 100 pts

**Issues**:
- Uses `calculateGradualClimateScore()` for non-climate attributes (name mismatch)
- Adjacency maps defined inline (could be extracted)
- String matching logic scattered

**Refactoring Opportunity**:
```javascript
// Rename and extract shared gradual scoring
// src/utils/scoring/helpers/gradualScoring.js
export function calculateGradualMatch(userPref, townActual, maxPoints, adjacencyMap) {
  // Generic gradual scoring logic
}

// Component-based culture scoring
function calculateLifestyleMatch(userPrefs, town) {
  const pace = calculateGradualMatch(userPrefs.pace, town.pace_of_life_actual, 20, PACE_ADJACENCY);
  const social = calculateGradualMatch(userPrefs.social, town.social_atmosphere, 20, SOCIAL_ADJACENCY);
  const traditional = calculateGradualMatch(userPrefs.traditional, town.traditional_progressive_lean, 15, TRAD_ADJACENCY);
  return { pace, social, traditional, total: ..., maxPoints: 55 };
}

function calculateCommunityMatch(userPrefs, town) {
  const events = calculateEventsMatch(...);
  const expat = calculateExpatMatch(...);
  const language = calculateLanguageMatch(...);
  return { events, expat, language, total: ..., maxPoints: 35 };
}

function calculateInclusivityMatch(userPrefs, town) {
  const lgbt = calculateLGBTMatch(...);
  return { lgbt, total: lgbt, maxPoints: 10 };
}
```

---

### Region Scoring

**Current Components** (lines 50-294):
- Country Match (30 pts)
- Region Match (20 pts)
- Province Match (15 pts)
- Geographic Features (20 pts)
- Vegetation Types (15 pts)
- **Total**: 100 pts

**Issues**:
- DEBUG flags still present (lines 65, 284)
- Case sensitivity issues noted (fixed but commented)
- Array overlap calculation could be extracted

**Refactoring Opportunity**:
```javascript
// Extract shared array matching
// src/utils/scoring/helpers/arrayMatching.js
export function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  // Reusable array overlap logic with case-insensitive matching
}

// Component-based region scoring
function calculateLocationMatch(userPrefs, town) {
  const country = calculateCountryMatch(...);
  const region = calculateRegionMatch(...);
  const province = calculateProvinceMatch(...);
  return { country, region, province, total: ..., maxPoints: 65 };
}

function calculateEnvironmentMatch(userPrefs, town) {
  const geographic = calculateArrayOverlap(userPrefs.geographic_features, town.geographic_features_actual, 20);
  const vegetation = calculateArrayOverlap(userPrefs.vegetation_types, town.vegetation_type_actual, 15);
  return { geographic, vegetation, total: ..., maxPoints: 35 };
}
```

---

### Hobbies Scoring

**Current State**: Only 23 lines!

```javascript
export function calculateHobbiesScore(preferences, town) {
  // Ultra-simple: just imports from hobbiesMatching.js
  const parsed = parsePreferences(preferences)
  const { score, matchedActivities, totalActivities } = calculateHobbiesMatch(parsed.hobbies, town)

  return {
    score: Math.round(score),
    factors: [{
      factor: `${matchedActivities} of ${totalActivities} preferred activities available`,
      score: Math.round(score)
    }],
    category: 'Hobbies'
  }
}
```

**Refactoring**: Minimal - already very clean. Maybe add breakdown for matched vs unmatched activities.

---

## Shared Utilities to Extract

### 1. Gradual Scoring Helper
**Currently**: `calculateGradualClimateScore` used in climate AND culture (wrong name)

**Extract to**: `src/utils/scoring/helpers/gradualScoring.js`
```javascript
export function calculateGradualMatch(userPref, townActual, maxPoints, adjacencyMap) {
  if (!userPref || !townActual) return { score: 0, description: null };

  // Exact match
  if (userPref === townActual) {
    return { score: maxPoints, description: 'Perfect' };
  }

  // Adjacent match
  if (adjacencyMap[userPref]?.includes(townActual)) {
    return { score: Math.round(maxPoints * 0.7), description: 'Good compatibility' };
  }

  // No match
  return { score: 0, description: 'Preference mismatch' };
}
```

### 2. Array Overlap Helper
**Currently**: `calculateArrayOverlap` in regionScoring.js only

**Extract to**: `src/utils/scoring/helpers/arrayMatching.js`
```javascript
export function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  if (!userArray?.length) return maxScore; // No preference = perfect score
  if (!townArray?.length) return 0; // Town has nothing

  const matches = userArray.filter(item =>
    arrayIncludesIgnoreCase(townArray, item)
  ).length;

  return Math.round((matches / userArray.length) * maxScore);
}
```

### 3. Tax Scoring Helper
**Currently**: Duplicated in adminScoring.js AND costScoring.js

**Extract to**: `src/utils/scoring/helpers/taxScoring.js`
```javascript
export function calculateTaxScore(preferences, town, maxPoints = 15) { ... }
export function calculateGradualTaxScore(taxRate, taxType) { ... }
```

---

## Refactoring Benefits

### Code Quality
- **Reduce duplication**: 2 copies of tax scoring → 1 shared utility
- **Improve naming**: `calculateGradualClimateScore` → `calculateGradualMatch`
- **Extract complexity**: 699-line climateScoring.js → 6 smaller component functions
- **Remove DEBUG code**: Clean up region scoring

### Transparency
- **Breakdown functions**: Like `getHealthcareBonusBreakdown()` for each category
- **Component visibility**: Users/admins can see which components contributed to score
- **Debugging**: Easier to identify which component is causing unexpected scores

### Maintainability
- **Smaller functions**: Easier to understand and modify
- **Testable units**: Can test temperature matching independently of climate scoring
- **Consistent patterns**: All categories follow same component-based structure

---

## Implementation Plan

### Phase 1: Extract Shared Utilities (Foundation)
1. Create `src/utils/scoring/helpers/gradualScoring.js`
2. Create `src/utils/scoring/helpers/arrayMatching.js`
3. Create `src/utils/scoring/helpers/taxScoring.js`
4. Update all categories to use shared utilities

### Phase 2: Refactor Climate Scoring (Largest)
1. Extract temperature matching components
2. Extract weather conditions components
3. Extract seasonal preference bonus
4. Create `getClimateMatchBreakdown()` function
5. Test with real data

### Phase 3: Refactor Cost Scoring
1. Extract budget matching components
2. Use shared tax scoring utility
3. Create `getCostMatchBreakdown()` function
4. Test with real data

### Phase 4: Refactor Culture Scoring
1. Extract lifestyle matching components
2. Extract community matching components
3. Use shared gradual matching utility
4. Create `getCultureMatchBreakdown()` function
5. Test with real data

### Phase 5: Refactor Region Scoring
1. Extract location matching components
2. Extract environment matching components
3. Use shared array overlap utility
4. Create `getRegionMatchBreakdown()` function
5. Remove DEBUG code
6. Test with real data

### Phase 6: Enhance Hobbies Scoring
1. Add breakdown for matched/unmatched activities
2. Create `getHobbiesMatchBreakdown()` function
3. Test with real data

### Phase 7: Documentation & Testing
1. Update `COMPONENT_BASED_SCORING.md` to include preference matching
2. Create comprehensive test suite
3. Verify all 6 categories with real database data
4. Create checkpoint

---

## Success Metrics

- **Code Reduction**: Eliminate ~100-200 lines of duplication
- **Function Size**: No function over 100 lines (climate currently 699!)
- **Shared Utilities**: 3 new reusable helpers
- **Transparency**: All 6 categories have breakdown functions
- **Test Coverage**: 100% of components tested with real data
- **No Regressions**: All existing scores remain the same

---

## Timeline Estimate

- Phase 1 (Shared Utilities): 1 hour
- Phase 2 (Climate): 2 hours (most complex)
- Phase 3 (Cost): 1 hour
- Phase 4 (Culture): 1 hour
- Phase 5 (Region): 45 minutes
- Phase 6 (Hobbies): 15 minutes
- Phase 7 (Documentation): 1 hour

**Total**: ~7 hours

---

**Next Steps**: Start with Phase 1 - Extract shared utilities as foundation for all other refactoring.
