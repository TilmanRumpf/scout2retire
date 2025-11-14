# Test Harness Plan - Scoring System Validation

Generated: November 13, 2025

**Purpose:** Define test strategy to verify scoring algorithm correctness, prevent regressions, and enable safe refactoring

**Scope:** Unit tests for category scorers, integration tests for full matching pipeline, regression tests for known bugs

---

## 🎯 PRIMARY SCORING ENTRY POINTS

### 1. Main Entry Point: `getPersonalizedTowns()`
**File:** `src/utils/scoring/matchingAlgorithm.js`
**Purpose:** Top-level function called by UI to get scored/sorted towns
**Signature:**
```javascript
async function getPersonalizedTowns(userId, options = {})
// Returns: Array of towns with match_score, sorted by score
```

**Test Strategy:**
- Integration tests: Full user preferences → ranked town list
- Verify sorting: Towns ordered by match_score descending
- Verify caching: Preference hash system working
- Verify filters: Published towns only, region filters applied

---

### 2. Core Orchestrator: `calculateEnhancedMatch()`
**File:** `src/utils/scoring/calculateMatch.js` line 39
**Purpose:** Orchestrates all 6 category scorers, combines weighted scores
**Signature:**
```javascript
function calculateEnhancedMatch(userPreferences, town)
// Returns: { match_score: 0-100, breakdown: {...} }
```

**Test Strategy:**
- Unit tests: Each category scorer in isolation
- Integration tests: Weighted combination formula
- Edge cases: Missing categories, invalid inputs
- Boundary tests: Scores exactly 0, exactly 100

---

### 3. Category Scorers (6 Functions)
| Scorer | File | Max Points | Test Priority |
|--------|------|-----------|---------------|
| **Region** | `regionScoring.js` | 90 (normalized to 100%) | HIGH |
| **Climate** | `climateScoring.js` | 115 (capped at 100) | HIGH |
| **Culture** | `cultureScoring.js` | 100 | HIGH (2 bugs found) |
| **Hobbies** | `hobbiesScoring.js` | Variable | MEDIUM |
| **Admin** | `adminScoring.js` | 105 (unclear cap) | MEDIUM |
| **Cost** | `costScoring.js` | 115 (capped at 100) | HIGH |

**Test Strategy:**
- Each scorer: Unit tests with synthetic data
- Missing data: Verify fallback behavior documented in Audit_Static_Findings.md
- Adjacency: Verify partial credit awards
- Boundary: Max points achievable, min points

---

## ✅ HIGH-VALUE TEST SCENARIOS (20 Tests)

### Category A: Monotonicity Tests (Scores Should Be Logical)

**Test 1: More Matching Preferences = Higher Score**
```javascript
// User prefers coastal AND mountain
// Town A: Has coastal only
// Town B: Has coastal AND mountain
// EXPECT: Town B score >= Town A score
```

**Test 2: Exact Match = Perfect Score**
```javascript
// User prefers: Spain, Mediterranean climate, urban, low cost
// Town: Valencia - matches all preferences
// EXPECT: Region ~90%, Climate ~95%, Culture ~85%, Cost ~90%
// EXPECT: Overall score >= 85 (Excellent match)
```

**Test 3: No Overlap = Low Score**
```javascript
// User prefers: Cold climate, rural, mountains
// Town: Bangkok - hot, urban, plains
// EXPECT: Climate ~10%, Culture ~20%, Region ~15%
// EXPECT: Overall score <= 20 (Poor match)
```

**Test 4: Partial Match = Mid-Range Score**
```javascript
// User prefers: Moderate climate, suburban, moderate cost
// Town: Matches climate, misses culture/cost
// EXPECT: Overall score 40-60 (Fair to Good)
```

---

### Category B: Missing Data Behavior Tests

**Test 5: Region - No Preferences = 0% Score**
```javascript
// User skips all region questions
// EXPECT: regionScore = 0
// VERIFY: Matches Audit_Static_Findings.md philosophy
```

**Test 6: Climate - No Preferences = 60% Score**
```javascript
// User skips all climate questions
// EXPECT: climateScore ~60 (graceful fallback)
// VERIFY: 50% credit for temp, 70% for humidity/sunshine/precip
```

**Test 7: Cost - No Budget = Neutral 20 Points**
```javascript
// User doesn't specify budget
// EXPECT: costScore = 20 (neutral baseline)
// VERIFY: No rent/healthcare bonuses awarded
```

**Test 8: Culture - Mixed Behavior**
```javascript
// User skips urban/rural preference
// EXPECT: 50% credit (10 of 20 points)
// User skips pace of life
// EXPECT: 60% credit (12 of 20 points)
// User skips language preference
// EXPECT: 0 points (strict)
```

---

### Category C: Adjacency Logic Tests

**Test 9: Climate Adjacency - 70% Credit**
```javascript
// User prefers: Dry climate
// Town has: Balanced climate (adjacent value)
// EXPECT: Humidity score = 70% of max (14 of 20 points)
```

**Test 10: Culture Adjacency - 50% Credit**
```javascript
// User prefers: Relaxed pace
// Town has: Moderate pace (adjacent value)
// EXPECT: Pace score = 50% of max (10 of 20 points)
```

**Test 11: Geographic Features Adjacency - 50% Credit**
```javascript
// User prefers: Coastal
// Town has: Island (related feature)
// EXPECT: Geographic score = 50% of max (15 of 30 points)
```

**Test 12: No Adjacency Match = 0 Points**
```javascript
// User prefers: Coastal
// Town has: Mountain (not related)
// EXPECT: Geographic score = 0 points
```

---

### Category D: Regression Tests (Prevent Known Bugs)

**Test 13: social_atmosphere Field - Currently NOT Scored**
```javascript
// User selects: Lively social atmosphere
// Town has: Quiet social atmosphere
// CURRENT BUG: Score unchanged (field ignored)
// AFTER FIX: Should affect culture score
// TEST: Verify field is either scored OR removed from onboarding
```

**Test 14: traditional_progressive_lean Field - Currently NOT Scored**
```javascript
// User selects: Progressive lean
// Town has: Traditional lean
// CURRENT BUG: Score unchanged (field ignored)
// AFTER FIX: Should affect culture score
// TEST: Verify field is either scored OR removed from onboarding
```

**Test 15: Case Sensitivity - Fixed 2025-10-16**
```javascript
// User prefers: "coastal" (lowercase)
// Town has: "Coastal" (capitalized)
// EXPECT: Match recognized (case-insensitive)
// REGRESSION TEST: Prevent 40-hour disaster from recurring
```

**Test 16: Power User Penalty - Removed 2025-10-17**
```javascript
// User specifies ALL cost preferences (budget, rent, healthcare, tax)
// OLD BUG: 50% penalty for being "too detailed"
// EXPECT: No penalty, full scoring credit
// REGRESSION TEST: Verify penalty removal persists
```

---

### Category E: Edge Cases & Boundary Conditions

**Test 17: Maximum Achievable Score**
```javascript
// User preferences: All categories filled with detailed preferences
// Town: Perfect match for ALL preferences
// EXPECT: Overall score = 100 (or very close, e.g., 98-100)
// VERIFY: No category exceeds 100% after capping
```

**Test 18: Minimum Score (Not Zero)**
```javascript
// User preferences: Filled (not empty)
// Town: Worst possible mismatch
// EXPECT: Overall score > 0 (prevent division by zero, edge cases)
// LIKELY: 5-15% baseline from missing data fallbacks
```

**Test 19: Climate Total = 115 Points Capped at 100**
```javascript
// User matches ALL climate criteria perfectly
// Theoretical: 25+25+20+20+10+15 = 115 points
// EXPECT: Climate score capped at 100
// VERIFY: climateScoring.js line 694: Math.min(score, 100)
```

**Test 20: Admin Total = 105 Points (Cap Unclear)**
```javascript
// User matches ALL admin criteria perfectly
// Theoretical: 30+25+15+10+15+10 = 105 points
// EXPECT: Admin score = ??? (100 or 105?)
// TODO: Investigate if admin scoring caps at 100
```

---

## 📦 EXAMPLE DATA STRUCTURES

### Synthetic User Preferences (Complete)

```javascript
const testUserPreferences = {
  // Region preferences
  country: 'Spain',
  region: ['Europe', 'Mediterranean'],
  states: ['Valencia'],
  geographic_features: ['coastal', 'mountain'],
  vegetation_type: ['mediterranean', 'temperate'],

  // Climate preferences
  summer_climate: ['warm'],
  winter_climate: ['mild'],
  humidity_level: ['balanced'],
  sunshine_level: ['high', 'often_sunny'],
  precipitation_level: ['low', 'moderate'],
  seasonal_variation: ['distinct', 'moderate'],

  // Culture preferences
  urban_rural_character: ['suburban', 'small_town'],
  pace_of_life: ['relaxed', 'moderate'],
  language_preference: ['some_english', 'learn_local'],
  expat_community: ['moderate', 'strong'],
  dining_scene_quality: ['good', 'excellent'],
  cultural_events_frequency: ['regular', 'frequent'],
  museums_and_culture: ['moderate', 'rich'],

  // Hobbies
  hobbies: [
    'hiking', 'beach_activities', 'cycling',
    'dining_out', 'wine_tasting', 'nature_walks',
    'photography', 'golf', 'swimming'
  ],

  // Administration preferences
  healthcare_quality: ['good', 'excellent'],
  safety_priority: ['moderate', 'high'],
  government_quality: ['functional', 'good'],
  visa_requirements: ['reasonable', 'easy'],
  environmental_quality: ['good', 'excellent'],
  political_stability: ['stable', 'very_stable'],

  // Cost preferences
  budget_monthly: 2500, // USD
  rent_budget: 1200,
  healthcare_cost_tolerance: 'moderate',
  tax_preference: 'moderate'
};
```

---

### Synthetic Town Data (Perfect Match Example)

```javascript
const testTownPerfectMatch = {
  id: 'test-town-001',
  town_name: 'Valencia',
  country: 'Spain',
  state_code: 'VC',
  region: 'Europe',

  // Region attributes
  geographic_features_actual: 'coastal',
  vegetation_type_actual: 'mediterranean',

  // Climate attributes
  summer_climate_actual: 'warm',
  winter_climate_actual: 'mild',
  humidity_level_actual: 'balanced',
  sunshine_level_actual: 'high',
  precipitation_level_actual: 'low',
  seasonal_variation_actual: 'distinct',
  avg_summer_high_c: 28,
  avg_summer_low_c: 18,
  avg_winter_high_c: 16,
  avg_winter_low_c: 7,

  // Culture attributes
  urban_rural_character: 'suburban',
  pace_of_life_actual: 'relaxed',
  english_proficiency_level: 'some',
  expat_community_size: 'moderate',
  dining_scene_quality: 'excellent',
  cultural_events_frequency: 'frequent',
  museums_and_culture_rating: 'rich',

  // Admin attributes
  healthcare_quality_rating: 'excellent',
  crime_rate: 'low',
  natural_disaster_risk_level: 'low',
  emergency_services_quality: 'excellent',
  english_speaking_doctors: 'common',
  government_efficiency_rating: 'good',
  visa_difficulty_rating: 'reasonable',
  environmental_quality_rating: 'good',
  political_stability_rating: 'stable',

  // Cost attributes
  cost_index: 65, // Mid-range
  rent_1br_center_usd: 900,
  healthcare_cost_level: 'moderate',
  tax_burden_category: 'moderate'
};
```

---

### Synthetic Town Data (Poor Match Example)

```javascript
const testTownPoorMatch = {
  id: 'test-town-002',
  town_name: 'Bangkok',
  country: 'Thailand',
  state_code: null,
  region: 'Southeast Asia',

  // Region attributes (opposite of preferences)
  geographic_features_actual: 'plains',
  vegetation_type_actual: 'tropical',

  // Climate attributes (hot & humid vs mild preference)
  summer_climate_actual: 'hot',
  winter_climate_actual: 'warm',
  humidity_level_actual: 'humid',
  sunshine_level_actual: 'high',
  precipitation_level_actual: 'high',
  seasonal_variation_actual: 'minimal',
  avg_summer_high_c: 35,
  avg_summer_low_c: 26,
  avg_winter_high_c: 32,
  avg_winter_low_c: 22,

  // Culture attributes (urban vs suburban preference)
  urban_rural_character: 'urban',
  pace_of_life_actual: 'fast',
  english_proficiency_level: 'some',
  expat_community_size: 'strong',
  dining_scene_quality: 'excellent',
  cultural_events_frequency: 'frequent',
  museums_and_culture_rating: 'rich',

  // Admin attributes (similar)
  healthcare_quality_rating: 'good',
  crime_rate: 'moderate',
  natural_disaster_risk_level: 'moderate',
  emergency_services_quality: 'good',
  english_speaking_doctors: 'common',
  government_efficiency_rating: 'functional',
  visa_difficulty_rating: 'easy',
  environmental_quality_rating: 'basic',
  political_stability_rating: 'stable',

  // Cost attributes (lower cost)
  cost_index: 45, // Lower than preference
  rent_1br_center_usd: 600,
  healthcare_cost_level: 'low',
  tax_burden_category: 'low'
};
```

---

### Synthetic User with Missing Preferences

```javascript
const testUserMinimalPreferences = {
  // Only country specified
  country: 'Spain',

  // All other preferences MISSING
  region: null,
  states: null,
  geographic_features: [],
  vegetation_type: [],
  summer_climate: [],
  winter_climate: [],
  humidity_level: [],
  // ... all other fields null or empty arrays

  // Expected behavior per Audit_Static_Findings.md:
  // - Region: 0% (strict)
  // - Climate: ~60% (graceful fallback)
  // - Culture: 0-30% (mixed)
  // - Hobbies: 30-50% (universal hobbies)
  // - Admin: 17-20% (minimal credit)
  // - Cost: 20-30% (neutral)
  // Total expected: ~21% match score
};
```

---

## 🧪 EXISTING TEST EVALUATION

### Current Test Files (From Codebase Search)

**Search Results:**
```bash
find src -name "*.test.js" -o -name "*.spec.js"
# TODO: Verify if any test files exist
```

**Expected Locations:**
- `src/utils/scoring/__tests__/` - Unit tests for scorers
- `src/utils/scoring/categories/__tests__/` - Category scorer tests
- `src/__tests__/integration/` - Full matching pipeline tests

**If No Tests Exist:**
- **CRITICAL:** Scoring system has NO automated testing
- **Risk:** Refactoring could break existing behavior
- **Priority:** Implement "golden master" tests FIRST before any refactoring

---

## 🎯 TEST HARNESS IMPLEMENTATION PLAN

### Phase 1: Golden Master Tests (HIGHEST PRIORITY)

**Purpose:** Freeze current behavior before refactoring

**Approach:**
1. Export current scoring results for 50-100 real user/town pairs
2. Save as "golden master" snapshot (JSON file)
3. Create test: After refactoring, verify ALL scores match golden master ±1%
4. If scores diverge → investigate before proceeding

**Implementation:**
```javascript
// tests/golden-master/capture-baseline.js
const fs = require('fs');
const { calculateEnhancedMatch } = require('../../src/utils/scoring/calculateMatch');

// Load real user preferences and towns
const users = loadRealUserPreferences(50);
const towns = loadRealTowns(100);

const baseline = [];
users.forEach(user => {
  towns.forEach(town => {
    const result = calculateEnhancedMatch(user.preferences, town);
    baseline.push({
      userId: user.id,
      townId: town.id,
      matchScore: result.match_score,
      breakdown: result.breakdown
    });
  });
});

fs.writeFileSync('golden-master-baseline.json', JSON.stringify(baseline, null, 2));
console.log(`Captured ${baseline.length} scoring results as baseline`);
```

**Verification Test:**
```javascript
// tests/golden-master/verify-baseline.test.js
describe('Golden Master - Scoring Regression', () => {
  it('should match baseline scores within 1% tolerance', () => {
    const baseline = require('./golden-master-baseline.json');
    const users = loadRealUserPreferences(50);
    const towns = loadRealTowns(100);

    baseline.forEach(entry => {
      const user = users.find(u => u.id === entry.userId);
      const town = towns.find(t => t.id === entry.townId);
      const current = calculateEnhancedMatch(user.preferences, town);

      const tolerance = 1.0; // 1% tolerance
      expect(current.match_score).toBeCloseTo(entry.matchScore, tolerance);
    });
  });
});
```

---

### Phase 2: Unit Tests for Category Scorers

**Test Structure:**
```
src/utils/scoring/categories/__tests__/
├── regionScoring.test.js
├── climateScoring.test.js
├── cultureScoring.test.js
├── hobbiesScoring.test.js
├── adminScoring.test.js
└── costScoring.test.js
```

**Example: Climate Scoring Unit Test**
```javascript
// climateScoring.test.js
import { calculateClimateScore } from '../climateScoring';
import { testUserPreferences, testTownPerfectMatch } from '../../test-data/fixtures';

describe('Climate Scoring', () => {
  describe('Perfect Match', () => {
    it('should award ~95-100 points for exact climate match', () => {
      const result = calculateClimateScore(testTownPerfectMatch, testUserPreferences);
      expect(result.score).toBeGreaterThanOrEqual(95);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Missing Data Fallback', () => {
    it('should award ~60% when all climate prefs missing', () => {
      const emptyPrefs = { ...testUserPreferences, summer_climate: [], winter_climate: [] };
      const result = calculateClimateScore(testTownPerfectMatch, emptyPrefs);
      expect(result.score).toBeCloseTo(60, 5); // ~60 ± 5
    });

    it('should award 50% credit for missing temp preference', () => {
      const noSummer = { ...testUserPreferences, summer_climate: [] };
      const result = calculateClimateScore(testTownPerfectMatch, noSummer);
      // 25 points summer * 0.5 = 12.5 points awarded
      // Verify in breakdown
      expect(result.details.summer_points).toBeCloseTo(12.5, 1);
    });
  });

  describe('Adjacency Logic', () => {
    it('should award 70% for adjacent humidity value', () => {
      const dryPref = { ...testUserPreferences, humidity_level: ['dry'] };
      const balancedTown = { ...testTownPerfectMatch, humidity_level_actual: 'balanced' };
      const result = calculateClimateScore(balancedTown, dryPref);
      // 20 points * 0.7 = 14 points expected
      expect(result.details.humidity_points).toBeCloseTo(14, 1);
    });
  });

  describe('Score Capping', () => {
    it('should cap total climate score at 100 even if exceeds', () => {
      // Create scenario where theoretical score = 115
      const result = calculateClimateScore(testTownPerfectMatch, testUserPreferences);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
```

---

### Phase 3: Integration Tests for Full Pipeline

**Test Structure:**
```
src/__tests__/integration/
├── matching-algorithm.test.js
├── weighted-combination.test.js
└── end-to-end.test.js
```

**Example: End-to-End Integration Test**
```javascript
// end-to-end.test.js
import { getPersonalizedTowns } from '../../utils/scoring/matchingAlgorithm';
import { supabase } from '../../utils/supabaseClient';

describe('End-to-End Matching', () => {
  it('should return sorted towns with scores 0-100', async () => {
    const userId = 'test-user-001';
    const towns = await getPersonalizedTowns(userId);

    expect(towns.length).toBeGreaterThan(0);
    
    // Verify all scores in valid range
    towns.forEach(town => {
      expect(town.match_score).toBeGreaterThanOrEqual(0);
      expect(town.match_score).toBeLessThanOrEqual(100);
    });

    // Verify sorted descending
    for (let i = 1; i < towns.length; i++) {
      expect(towns[i-1].match_score).toBeGreaterThanOrEqual(towns[i].match_score);
    }
  });

  it('should apply category weights correctly', async () => {
    const userId = 'test-user-002';
    const towns = await getPersonalizedTowns(userId);
    const firstTown = towns[0];

    // Verify breakdown exists and sums to total
    expect(firstTown.breakdown).toBeDefined();
    const weightedSum = 
      firstTown.breakdown.region * 0.30 +
      firstTown.breakdown.climate * 0.13 +
      firstTown.breakdown.culture * 0.12 +
      firstTown.breakdown.hobbies * 0.08 +
      firstTown.breakdown.admin * 0.18 +
      firstTown.breakdown.cost * 0.19;

    expect(weightedSum).toBeCloseTo(firstTown.match_score, 1);
  });
});
```

---

### Phase 4: Regression Tests for Known Bugs

**Test File:** `src/__tests__/regression/known-bugs.test.js`

```javascript
describe('Regression Tests - Known Bugs', () => {
  describe('BUG: social_atmosphere not scored', () => {
    it('should score social_atmosphere preference', () => {
      // TODO: This test will FAIL until bug is fixed
      const prefs = { ...testUserPreferences, social_atmosphere: 'lively' };
      const town1 = { ...testTownPerfectMatch, social_atmosphere: 'lively' };
      const town2 = { ...testTownPerfectMatch, social_atmosphere: 'quiet' };

      const score1 = calculateCultureScore(town1, prefs);
      const score2 = calculateCultureScore(town2, prefs);

      expect(score1.score).toBeGreaterThan(score2.score);
    });
  });

  describe('BUG: traditional_progressive_lean not scored', () => {
    it('should score traditional/progressive preference', () => {
      // TODO: This test will FAIL until bug is fixed
      const prefs = { ...testUserPreferences, traditional_progressive_lean: 'progressive' };
      const town1 = { ...testTownPerfectMatch, traditional_progressive_lean: 'progressive' };
      const town2 = { ...testTownPerfectMatch, traditional_progressive_lean: 'traditional' };

      const score1 = calculateCultureScore(town1, prefs);
      const score2 = calculateCultureScore(town2, prefs);

      expect(score1.score).toBeGreaterThan(score2.score);
    });
  });

  describe('FIXED: Case sensitivity (2025-10-16)', () => {
    it('should match "coastal" and "Coastal" as equal', () => {
      const prefs = { ...testUserPreferences, geographic_features: ['coastal'] };
      const town = { ...testTownPerfectMatch, geographic_features_actual: 'Coastal' };

      const result = calculateRegionScore(town, prefs);
      expect(result.details.geographic_match).toBe(true);
    });
  });

  describe('FIXED: Power user penalty (2025-10-17)', () => {
    it('should NOT penalize users for detailed cost preferences', () => {
      const detailedPrefs = {
        budget_monthly: 2500,
        rent_budget: 1200,
        healthcare_cost_tolerance: 'moderate',
        tax_preference: 'moderate'
      };

      const result = calculateCostScore(testTownPerfectMatch, detailedPrefs);
      
      // Verify NO penalty applied
      expect(result.details.penalty_applied).toBeFalsy();
      expect(result.score).toBeGreaterThan(70); // Should get full credit, not 50%
    });
  });
});
```

---

## 📊 TEST COVERAGE GOALS

### Minimum Acceptable Coverage

| Component | Coverage Target | Rationale |
|-----------|----------------|-----------|
| **Category Scorers** | 90% | Core business logic - must be rock solid |
| **calculateEnhancedMatch** | 95% | Orchestration logic - critical path |
| **Helper Functions** | 80% | Important but less critical |
| **Preference Parsing** | 85% | Data normalization - many edge cases |
| **Overall Scoring Module** | 85% | Industry standard for production code |

---

## 🚀 IMPLEMENTATION PRIORITY

1. **CRITICAL (Do First):** Golden Master Tests
   - Freeze current behavior
   - Enable safe refactoring
   - Takes 2-4 hours

2. **HIGH (Next):** Category Scorer Unit Tests
   - Test each scorer in isolation
   - Cover missing data, adjacency, edge cases
   - Takes 1-2 days

3. **MEDIUM:** Integration Tests
   - Test weighted combination
   - Test full pipeline
   - Takes 1 day

4. **LOW (Optional):** Property-Based Tests
   - Randomized inputs to find edge cases
   - Good for long-term stability
   - Takes 1-2 days

---

## ✅ SUCCESS CRITERIA

### Tests are successful if:

- [ ] All 20 test scenarios pass
- [ ] Golden master test passes (scores match baseline ± 1%)
- [ ] Regression tests for both unscored field bugs FAIL (confirming bugs exist)
- [ ] Case sensitivity test PASSES (confirming 2025-10-16 fix)
- [ ] Power user penalty test PASSES (confirming 2025-10-17 fix)
- [ ] All category scorers have 90%+ code coverage
- [ ] Integration tests verify weighted combination formula
- [ ] Edge case tests verify score capping at 100

---

## 🔧 TEST TOOLING RECOMMENDATIONS

**Framework:** Jest (already used in Node.js projects)
**Assertions:** expect() with custom matchers
**Fixtures:** Centralized test data in `src/utils/scoring/test-data/fixtures.js`
**Mocking:** Mock Supabase client for unit tests
**Coverage:** Jest --coverage flag
**CI/CD:** Run tests on every commit, block merge if coverage drops

---

**END OF TEST HARNESS PLAN**

**Summary:**
- **Entry Points:** 3 primary (getPersonalizedTowns, calculateEnhancedMatch, 6 category scorers)
- **Test Scenarios:** 20 high-value tests covering monotonicity, missing data, adjacency, regressions, edge cases
- **Data Fixtures:** 3 complete examples (perfect match, poor match, minimal preferences)
- **Implementation:** 4 phases (golden master, unit, integration, regression)
- **Coverage Goal:** 85% overall, 90% for category scorers

**Next Step:** STEP 4 - Create Audit_Refactor_Roadmap.md
