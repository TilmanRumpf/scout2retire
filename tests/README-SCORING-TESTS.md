# Scoring Snapshot Tests

## Purpose

Capture current scoring behavior BEFORE refactoring to ensure no unintended changes after integration.

## Problem

The tests cannot currently run because:
1. `enhancedMatchingAlgorithm.js` imports `supabaseClient.js` (line 4)
2. `supabaseClient.js` imports `authUtils` without `.js` extension (line 248)
3. ES modules in Node.js require explicit `.js` extensions

## Solution Options

### Option 1: Fix the import (Recommended)
Edit `/Users/tilmanrumpf/Desktop/scout2retire/src/utils/supabaseClient.js` line 248:
```javascript
// BEFORE:
} from './authUtils';

// AFTER:
} from './authUtils.js';
```

### Option 2: Mock supabaseClient for tests
Create a mock version that doesn't require the full import chain.

### Option 3: Manual testing
Run the application and manually verify scoring results match expectations before/after refactoring.

## Test File

Location: `/Users/tilmanrumpf/Desktop/scout2retire/tests/scoring-snapshot.test.js`

## Running Tests

```bash
# Once imports are fixed:
node tests/scoring-snapshot.test.js

# To compare against baseline:
node tests/scoring-snapshot.test.js --compare
```

## Test Coverage

The test file includes 8 scenarios covering:

1. **Perfect matches:**
   - Beach budget seeker → Puerto de la Cruz
   - Mountain enthusiast → Granada
   - Urban culture lover → Lisbon

2. **Mismatches:**
   - Mountain lover seeing coastal town
   - Beach lover seeing mountain town

3. **Budget constraints:**
   - Low budget user seeing expensive city

4. **Feature mismatches:**
   - Urban lover seeing suburban town
   - Language/expat community fit

## Baseline Snapshot

Once tests run successfully, a baseline snapshot will be saved to:
`/Users/tilmanrumpf/Desktop/scout2retire/tests/scoring-baseline-snapshot.json`

This snapshot captures:
- Overall match scores
- Category-level scores (Region, Climate, Culture, Hobbies, Administration, Cost)
- Top matching factors
- Warnings

## Usage After Refactoring

```bash
# Run tests and compare with baseline
node tests/scoring-snapshot.test.js --compare
```

Any score differences > 2% will be flagged, indicating potential behavioral changes.

## Next Steps

1. Fix the import issue in `supabaseClient.js`
2. Run tests to create baseline snapshot
3. Perform refactoring
4. Re-run tests with `--compare` flag to verify no unintended changes
