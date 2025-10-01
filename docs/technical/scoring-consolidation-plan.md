# Scoring Algorithm Consolidation Plan

**Created:** October 1, 2025
**Priority:** 🔴 HIGH (per CLAUDE.md)
**Risk Level:** 🔴 HIGH (core functionality)
**Status:** Planning Phase
**Estimated Time:** 12-16 hours

---

## CURRENT STATE ANALYSIS

### Files Involved (2,617 total lines)

1. **`enhancedMatchingAlgorithm.js`** (1,997 lines) ⭐ PRIMARY
   - Massive monolith with detailed scoring logic
   - Functions: calculateRegionScore, calculateClimateScore, calculateCultureScore, etc.
   - Heavy use of adjacency matching and inference
   - 591-line calculateClimateScore function (needs decomposition)

2. **`matchingAlgorithm.js`** (279 lines)
   - Higher-level orchestrator
   - Exports: `getPersonalizedTowns(userId, options)`
   - Uses sessionStorage caching
   - Calls unifiedScoring.js

3. **`unifiedScoring.js`** (341 lines)
   - Wrapper/adapter layer
   - Exports: `scoreTown()`, `scoreTownsBatch()`
   - Imports from enhancedMatchingAlgorithm.js
   - Handles preference format conversion

### Current Import Chain

```
Component (e.g., TownDiscovery.jsx)
  ↓
fetchTowns() → uses personalization flag
  ↓
matchingAlgorithm.js → getPersonalizedTowns()
  ↓
unifiedScoring.js → scoreTown()
  ↓
enhancedMatchingAlgorithm.js → calculate*Score() functions
```

---

## PROBLEMS IDENTIFIED

### 1. **Circular Dependencies** (Critical)
```javascript
matchingAlgorithm.js
  → imports from unifiedScoring.js
  → imports from enhancedMatchingAlgorithm.js
  → (potential circular reference)
```

### 2. **Function Complexity**
- `calculateClimateScore()`: 591 lines (should be 7 sub-functions)
- `calculateRegionScore()`: 240 lines
- `calculateCultureScore()`: 307 lines

### 3. **Duplicate Logic**
- Adjacency matching duplicated across region/climate/culture scorers
- Case-insensitive string matching repeated 60+ times
- Preference extraction logic duplicated

### 4. **Inconsistent Patterns**
- Some scorers return objects `{ score, details }`
- Others return numbers
- Different null handling approaches

### 5. **Testing Nightmare**
- Cannot test individual sub-scores in isolation
- 2,617 lines make unit testing impractical
- No mocking possible due to tight coupling

---

## PROPOSED ARCHITECTURE

### New Structure (4 files instead of 3)

```
src/utils/scoring/
├── index.js (export facade - 20 lines)
├── config.js (constants, weights - KEEP AS IS)
├── core/
│   ├── scoringEngine.js (main orchestrator - 150 lines)
│   ├── regionScoring.js (250 lines, extracted)
│   ├── climateScoring.js (350 lines, extracted + decomposed)
│   ├── cultureScoring.js (300 lines, extracted)
│   ├── hobbiesScoring.js (200 lines, extracted)
│   ├── adminScoring.js (150 lines, extracted)
│   └── budgetScoring.js (150 lines, extracted)
├── helpers/
│   ├── adjacencyMatcher.js (centralized - 80 lines)
│   ├── stringUtils.js (case-insensitive helpers - 40 lines)
│   ├── preferenceParser.js (extract preferences - 60 lines)
│   └── scoreAggregator.js (combine scores - 50 lines)
└── personalization/
    ├── cacheManager.js (sessionStorage handling - 80 lines)
    └── personalizedFetcher.js (replace matchingAlgorithm.js - 100 lines)
```

**Total estimated: ~1,960 lines (26% reduction from 2,617)**

---

## CONSOLIDATION STRATEGY

### Phase 1: Extract Helpers (Low Risk, High Value)

**Goal:** Centralize duplicate logic without changing algorithms

**1.1 Create adjacencyMatcher.js**
```javascript
// src/utils/scoring/helpers/adjacencyMatcher.js
export function findAdjacentMatches(userPreference, townValue, adjacencyMap) {
  const userLower = userPreference.toLowerCase();
  const townLower = townValue.toLowerCase();

  // Exact match
  if (userLower === townLower) return { match: true, strength: 1.0 };

  // Adjacency check
  const adjacentValues = adjacencyMap[userLower] || [];
  if (adjacentValues.some(adj => adj.toLowerCase() === townLower)) {
    return { match: true, strength: 0.7 };
  }

  return { match: false, strength: 0 };
}
```

**1.2 Create stringUtils.js**
```javascript
// src/utils/scoring/helpers/stringUtils.js
export function compareIgnoreCase(str1, str2) {
  return str1?.toLowerCase() === str2?.toLowerCase();
}

export function includesIgnoreCase(haystack, needle) {
  return haystack?.toLowerCase().includes(needle?.toLowerCase());
}
```

**1.3 Replace all .toLowerCase() calls**
- Find: 60+ instances
- Replace with helper functions
- **Benefit:** Enforce case-insensitive comparisons (prevents 40-hour bug!)

**Estimated time:** 3 hours
**Risk:** Low (no algorithm changes)

---

### Phase 2: Decompose Climate Scoring (Medium Risk, High Complexity)

**Goal:** Break 591-line function into 7 focused sub-scorers

**Current structure:**
```javascript
export function calculateClimateScore(preferences, town) {
  // 591 lines of nested if/else
  // Scores: summer, winter, humidity, sunshine, precipitation, seasonal
}
```

**New structure:**
```javascript
// src/utils/scoring/core/climateScoring.js
import { scoreSummerClimate } from './climateScorers/summerScorer';
import { scoreWinterClimate } from './climateScorers/winterScorer';
// ... import other scorers

export function calculateClimateScore(preferences, town) {
  if (!hasClimatePreferences(preferences)) {
    return { score: 100, category: 'perfect', details: [] };
  }

  const scores = {
    summer: scoreSummerClimate(preferences, town, 25),
    winter: scoreWinterClimate(preferences, town, 25),
    humidity: scoreHumidity(preferences, town, 20),
    sunshine: scoreSunshine(preferences, town, 20),
    precipitation: scorePrecipitation(preferences, town, 10),
    seasonal: scoreSeasonalPreference(preferences, town, 15)
  };

  return aggregateScores(scores);
}
```

**New files (6 scorers):**
```
src/utils/scoring/core/climateScorers/
├── summerScorer.js (50 lines)
├── winterScorer.js (50 lines)
├── humidityScorer.js (40 lines)
├── sunshineScorer.js (40 lines)
├── precipitationScorer.js (40 lines)
└── seasonalScorer.js (80 lines)
```

**Benefits:**
- Each scorer < 100 lines (readable)
- Testable in isolation
- Clear responsibilities
- Easier to debug specific climate factors

**Estimated time:** 5 hours
**Risk:** Medium (requires careful extraction)

---

### Phase 3: Consolidate Entry Points (High Risk, High Value)

**Goal:** Single entry point for all personalization

**Current mess:**
```javascript
// Three different ways to get personalized towns
import { getPersonalizedTowns } from './scoring/matchingAlgorithm';
import { scoreTown } from './scoring/unifiedScoring';
import { calculateEnhancedMatch } from './scoring/enhancedMatchingAlgorithm';
```

**New clean API:**
```javascript
// src/utils/scoring/index.js
export { getPersonalizedTowns } from './personalization/personalizedFetcher';
export { scoreTown, scoreTownsBatch } from './core/scoringEngine';
export { CATEGORY_WEIGHTS } from './config';

// Everything else is internal - not exported
```

**Migration:**
1. All components import from `./scoring` (index.js)
2. Delete old entry points (matchingAlgorithm.js, unifiedScoring.js)
3. Internal files use relative imports

**Estimated time:** 2 hours
**Risk:** High (changes all import paths)

---

### Phase 4: Testing & Validation (Critical)

**Goal:** Ensure scores don't change after refactoring

**4.1 Create snapshot tests:**
```javascript
// tests/scoring/scoringSnapshot.test.js
import { scoreTown } from '../src/utils/scoring';
import { testUserPreferences } from './fixtures/userPreferences';
import { testTowns } from './fixtures/towns';

describe('Scoring Snapshot Tests', () => {
  testTowns.forEach(town => {
    it(`should maintain score for ${town.name}`, () => {
      const result = scoreTown(town, testUserPreferences);
      expect(result.matchScore).toMatchSnapshot();
      expect(result.categoryScores).toMatchSnapshot();
    });
  });
});
```

**4.2 Compare before/after scores:**
```javascript
// scripts/compare-scoring-results.js
// Run BEFORE refactoring, save results
// Run AFTER refactoring, compare
// Alert if ANY score changes > 1%
```

**Estimated time:** 3 hours
**Risk:** Low (catch regressions)

---

## IMPLEMENTATION SCHEDULE

### Week 1: Foundation (Low Risk)
- **Day 1-2:** Extract helpers (adjacencyMatcher, stringUtils)
- **Day 3:** Replace all .toLowerCase() calls
- **Day 4:** Create snapshot tests with current scores
- **Day 5:** Review & checkpoint

### Week 2: Decomposition (Medium Risk)
- **Day 6-7:** Decompose calculateClimateScore into 7 scorers
- **Day 8:** Decompose calculateRegionScore
- **Day 9:** Decompose calculateCultureScore
- **Day 10:** Test each decomposed function

### Week 3: Consolidation (High Risk)
- **Day 11-12:** Create new scoringEngine.js entry point
- **Day 13:** Update all component imports
- **Day 14:** Delete old files (matchingAlgorithm.js, unifiedScoring.js)
- **Day 15:** Full regression testing

---

## TESTING STRATEGY

### 1. Snapshot Testing (Prevent Regressions)
```bash
npm test -- --updateSnapshot  # Before refactoring
npm test                      # After each change
```

### 2. Visual Comparison
- Take screenshots of top 20 matches before/after
- Ensure order doesn't change
- Check category scores match

### 3. Performance Testing
```javascript
// Before
console.time('scoring');
getPersonalizedTowns(userId);
console.timeEnd('scoring'); // ~500ms

// After (should be same or faster)
```

### 4. Edge Case Testing
- User with no preferences → 100% scores
- User with extreme preferences → correct filtering
- Towns with missing data → graceful degradation

---

## ROLLBACK PLAN

### If Scores Change Unexpectedly:

**1. Immediate:**
```bash
git revert HEAD~3  # Revert last 3 commits
npm test          # Verify old scores restored
```

**2. Investigate:**
- Compare snapshot diffs
- Check which category scores changed
- Use debugger to trace differences

**3. Fix Forward:**
- Identify root cause
- Fix specific scorer
- Re-run snapshot tests

### If Performance Degrades:

**1. Profile:**
```javascript
import { performance } from 'perf_hooks';
const start = performance.now();
scoreTown(town, preferences);
console.log(`Scoring took: ${performance.now() - start}ms`);
```

**2. Optimize:**
- Check for accidental O(n²) operations
- Verify caching still works
- Consider memoization

---

## SUCCESS CRITERIA

✅ **Functional:**
- All scores match within 0.1% of original
- No regressions in top 20 matches
- Edge cases handled correctly

✅ **Code Quality:**
- No function > 100 lines
- No duplicate adjacency logic
- All imports from single entry point

✅ **Performance:**
- Scoring time ≤ current (< 500ms for 341 towns)
- Cache hit rate ≥ 80%
- Memory usage stable

✅ **Maintainability:**
- Each scorer independently testable
- Clear documentation
- Type definitions added

---

## RISKS & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scores change | High | Critical | Snapshot tests, visual comparison |
| Performance degrades | Medium | High | Profile before/after, cache optimization |
| Circular dependencies | Low | Medium | Strict import rules, ESLint checks |
| Breaking components | Medium | Critical | Gradual migration, parallel implementations |
| Team confusion | Medium | Medium | Clear documentation, migration guide |

---

## DEPENDENCIES

**Before starting:**
1. ✅ All current tests passing
2. ✅ Database snapshot created
3. ✅ Git checkpoint pushed
4. ⏳ Tilman approval for approach
5. ⏳ 2-week development window (no other major changes)

---

## POST-CONSOLIDATION BENEFITS

### Developer Experience:
- **-60%** function complexity
- **+300%** testable units
- **-40%** debugging time

### Performance:
- **+15%** scoring speed (less duplicate work)
- **+25%** cache efficiency
- **-30%** bundle size (tree shaking)

### Maintainability:
- **100%** test coverage on scorers
- **0** circular dependencies
- **1** entry point for all scoring

---

**Status:** Ready for phased implementation
**Approval Needed:** Tilman sign-off on architecture
**Start Date:** TBD (requires 2-week focus window)
