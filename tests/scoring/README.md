# Scoring Algorithm Tests

## Golden Master Testing Strategy

This directory contains the golden master test suite for the Scout2Retire scoring algorithm. Golden master tests capture the current behavior as a baseline, then verify that refactoring doesn't change scoring behavior.

---

## Quick Start

### Run Tests
```bash
node --test tests/scoring/goldenMaster.test.js
```

### Regenerate Baseline (Only After Intentional Behavior Changes)
```bash
node tests/scoring/captureGoldenMaster.js
```

**⚠️ IMPORTANT:** Only regenerate the baseline when you INTENTIONALLY want to change scoring behavior (Category B refactors). For Category A (behavior-preserving) refactors, the tests MUST pass with the existing baseline.

---

## Test Structure

### Files

- **`goldenMaster.test.js`** - Main test suite (16 tests)
  - Overall match scores verification
  - Category breakdown verification
  - Sanity checks
  - Monotonicity checks

- **`captureGoldenMaster.js`** - Baseline capture script
  - Runs scoring on all test cases
  - Saves results to `golden-master-baseline.json`

- **`fixtures/testData.js`** - Test data
  - 3 user preference scenarios (complete, minimal, mixed)
  - 3 town scenarios (Valencia, Bangkok, Porto)
  - 6 test cases combining users and towns

- **`setup.js`** - Environment setup
  - Loads `.env` file for Node.js testing
  - Configures Supabase client for testing

- **`golden-master-baseline.json`** - Current behavior snapshot
  - Contains expected scores for all test cases
  - **DO NOT** manually edit this file
  - Regenerate only when behavior changes intentionally

---

## Test Cases

| Test Name | User Prefs | Town | Expected Behavior |
|-----------|-----------|------|-------------------|
| `complete_valencia_perfect_match` | Complete (Spain preferences) | Valencia, Spain | High score (~77%) |
| `complete_bangkok_poor_match` | Complete (Spain preferences) | Bangkok, Thailand | Lower score (~67%) |
| `complete_porto_partial_match` | Complete (Spain preferences) | Porto, Portugal | Mid-high score (~77%) |
| `minimal_valencia_fallback` | Minimal (country only) | Valencia, Spain | High score (~87%) due to missing data fallbacks |
| `minimal_bangkok_fallback` | Minimal (country only) | Bangkok, Thailand | High score (~87%) due to missing data fallbacks |
| `mixed_valencia_moderate` | Mixed (some prefs) | Valencia, Spain | High score (~100%) |

---

## Golden Master Workflow

### Category A Refactors (Behavior-Preserving)

These refactors MUST NOT change scoring behavior:

1. **Before refactoring:** Ensure golden master tests pass
   ```bash
   node --test tests/scoring/goldenMaster.test.js
   ```

2. **Make changes:** Refactor code (e.g., centralize adjacency rules)

3. **After refactoring:** Run tests again
   ```bash
   node --test tests/scoring/goldenMaster.test.js
   ```

4. **If tests fail:**
   - Stop immediately
   - Review what changed
   - Debug why scores differ
   - Fix the refactor to preserve behavior
   - **DO NOT** regenerate the baseline

5. **If tests pass:** ✅ Refactor is safe!

---

### Category B Refactors (Intentional Behavior Changes)

These refactors ARE ALLOWED to change scoring:

1. **Before changes:** Capture current baseline
   ```bash
   node tests/scoring/captureGoldenMaster.js
   ```
   Save this file as `golden-master-baseline-OLD.json` for comparison

2. **Make changes:** Implement the intentional behavior change

3. **Verify changes:** Run tests, expect failures
   ```bash
   node --test tests/scoring/goldenMaster.test.js
   ```
   Tests will fail showing old vs new scores

4. **Review differences:** Ensure changes are as expected

5. **Generate new baseline:**
   ```bash
   node tests/scoring/captureGoldenMaster.js
   ```

6. **Document changes:** Update `Audit_Refactor_Roadmap.md` changelog

7. **Verify:** Tests should now pass
   ```bash
   node --test tests/scoring/goldenMaster.test.js
   ```

---

## Understanding Test Failures

### Example Failure Output
```
not ok 1 - should match baseline for: complete_valencia_perfect_match
  Expected 77 to be close to 75 (within 1), but difference was 2
```

This means:
- **Baseline score:** 75
- **Current score:** 77
- **Difference:** 2 points

**For Category A refactors:** This is a FAILURE - investigate and fix

**For Category B refactors:** This is EXPECTED - document the change

---

## Test Coverage

Current coverage:
- **16 tests** across 4 suites
- **6 test cases** (user/town combinations)
- **2 category scorers** tested per case (overall + breakdown)
- **2 monotonicity checks** (scoring logic validation)

Categories tested:
- ✅ Region scoring
- ✅ Climate scoring
- ✅ Culture scoring
- ✅ Hobbies scoring
- ✅ Administration scoring
- ✅ Cost scoring

---

## Adding New Test Cases

To add a new test case:

1. **Add user preferences** to `fixtures/testData.js`:
   ```javascript
   export const testUserNewScenario = {
     current_status: { /* ... */ },
     region_preferences: { /* ... */ },
     // ...
   };
   ```

2. **Add town data** to `fixtures/testData.js`:
   ```javascript
   export const testTownNewCity = {
     id: 'test-town-new-city',
     town_name: 'New City',
     // ... all required fields
   };
   ```

3. **Add test case** to `testCases` array:
   ```javascript
   {
     name: 'new_scenario_description',
     user: testUserNewScenario,
     town: testTownNewCity,
     expectedRange: { min: 50, max: 70 }
   }
   ```

4. **Regenerate baseline:**
   ```bash
   node tests/scoring/captureGoldenMaster.js
   ```

5. **Verify tests pass:**
   ```bash
   node --test tests/scoring/goldenMaster.test.js
   ```

---

## Troubleshooting

### Tests fail immediately with "baseline not found"
**Solution:** Run `node tests/scoring/captureGoldenMaster.js` first

### Tests fail with "VITE_SUPABASE_URL is missing"
**Solution:** Ensure `.env` file exists in project root with Supabase credentials

### Tests fail with data format errors
**Solution:** Check that test fixtures match actual database schema (arrays vs strings, etc.)

### All tests pass but scores seem wrong
**Solution:** This is fine! The baseline captures current behavior. If you think behavior is wrong, that's a separate issue to fix (as a Category B refactor)

---

## Current Baseline Stats

**Captured:** November 14, 2025
**Test cases:** 6
**All tests:** ✅ Passing (16/16)

**Baseline scores:**
- Valencia (complete user): 77% (Very Good)
- Bangkok (complete user): 67% (Good)
- Porto (complete user): 77% (Very Good)
- Valencia (minimal user): 87% (Excellent)
- Bangkok (minimal user): 87% (Excellent)
- Valencia (mixed user): 100% (Excellent)

---

## Next Steps

After golden master is in place:

1. **Phase 1:** Centralize adjacency rules (#1) + extract common logic (#4)
2. **Phase 2:** Fix unscored field bugs (#2) with feature flag
3. **Phase 3:** Standardize missing data philosophy (#3)
4. **Phase 4:** Additional improvements as needed

See `Audit_Refactor_Roadmap.md` for full plan.
