# ✅ SUPABASE WORKFLOW VERIFICATION TEST

**Purpose**: Verify that Claude follows the new Supabase protocols correctly

**Test Date**: __________
**Tester**: __________
**Claude Version**: __________

---

## TEST 1: Column Set Usage ✅

### Scenario
Ask Claude: "Query the towns table and show me all towns in Spain"

### Expected Behavior
- [ ] Claude uses `COLUMN_SETS.basic` or `COLUMN_SETS.minimal`
- [ ] Claude does NOT use `SELECT *`
- [ ] Claude specifies column names explicitly
- [ ] Query includes `WHERE country = 'Spain'` or similar filter

### Correct Example
```javascript
const { data } = await supabase
  .from('towns')
  .select(COLUMN_SETS.basic)
  .eq('country', 'Spain')
  .limit(20)
```

### FAIL Indicators
- ❌ Uses `SELECT *`
- ❌ Doesn't import COLUMN_SETS
- ❌ Suggests running SQL manually

**Result**: [ ] PASS / [ ] FAIL
**Notes**: _______________________

---

## TEST 2: Tool Selection Decision ✅

### Scenario
Ask Claude: "I need to update 50 towns to fix their climate data"

### Expected Behavior
- [ ] Claude recommends modifying `claude-db-helper.js`
- [ ] Claude writes a batch UPDATE script
- [ ] Claude says to run with `node claude-db-helper.js`
- [ ] Claude does NOT suggest MCP for batch operations

### Correct Response Pattern
"I'll modify claude-db-helper.js to batch update the climate data..."

### FAIL Indicators
- ❌ Suggests running 50 individual MCP queries
- ❌ Says "run this SQL in Supabase dashboard"
- ❌ Writes frontend code for admin task

**Result**: [ ] PASS / [ ] FAIL
**Notes**: _______________________

---

## TEST 3: Debugging Protocol ✅

### Scenario
Say: "The town detail page shows 'undefined' for summer_climate_actual field"

### Expected Behavior
- [ ] Step 1: Claude uses Playwright to see the UI
- [ ] Step 2: Claude uses Supabase MCP to query the actual data
- [ ] Step 3: Claude compares UI vs database
- [ ] Step 4: Claude identifies WHERE the field is lost (query, transform, render)
- [ ] Claude does NOT immediately blame database/RLS

### Correct Sequence
1. "Let me use Playwright to see the page..."
2. "Now let me check what's in the database..."
3. "I see the database has 'sunny' but UI shows undefined..."
4. "Let me check the SELECT statement in the component..."

### FAIL Indicators
- ❌ Jumps to conclusion without checking
- ❌ Suggests complex RLS fixes first
- ❌ Creates debug scripts instead of using Playwright/MCP

**Result**: [ ] PASS / [ ] FAIL
**Notes**: _______________________

---

## TEST 4: Performance Awareness ✅

### Scenario
Ask Claude: "Show me the full data for Valencia"

### Expected Behavior
- [ ] Claude uses `COLUMN_SETS.fullDetail` (since it's a single town)
- [ ] Claude adds `.single()` or `.limit(1)`
- [ ] Claude includes WHERE filter for specific town

### Correct Example
```javascript
const { data } = await supabase
  .from('towns')
  .select(COLUMN_SETS.fullDetail)
  .eq('name', 'Valencia')
  .eq('country', 'Spain')
  .single()
```

### FAIL Indicators
- ❌ Uses SELECT * even for single town
- ❌ Doesn't limit query
- ❌ Fetches all 400 towns then filters in JavaScript

**Result**: [ ] PASS / [ ] FAIL
**Notes**: _______________________

---

## TEST 5: String Comparison Safety ✅

### Scenario
Ask Claude: "Write code to check if a town's pace_of_life is 'relaxed'"

### Expected Behavior
- [ ] Claude uses `.toLowerCase()` on both sides
- [ ] Claude mentions the 40-hour case sensitivity bug
- [ ] Code handles null/undefined

### Correct Example
```javascript
if (town.pace_of_life_actual?.toLowerCase() === 'relaxed') {
  // match
}
```

### FAIL Indicators
- ❌ Direct comparison without .toLowerCase()
- ❌ No null handling

**Result**: [ ] PASS / [ ] FAIL
**Notes**: _______________________

---

## TEST 6: Documentation Adherence ✅

### Scenario
Ask Claude: "I need to query Supabase, which tool should I use?"

### Expected Behavior
- [ ] Claude mentions SUPABASE_TOOL_DECISION_TREE.md
- [ ] Claude asks clarifying questions (frontend vs investigation?)
- [ ] Claude provides decision tree logic
- [ ] Claude does NOT give one-size-fits-all answer

### Expected Response Pattern
"It depends on your use case. I should check docs/SUPABASE_TOOL_DECISION_TREE.md. Are you:
- Writing frontend code? → Use SDK
- Investigating data? → Use MCP
- Batch operations? → Use helper script"

### FAIL Indicators
- ❌ Always recommends MCP without context
- ❌ Doesn't reference decision tree doc
- ❌ Doesn't ask clarifying questions

**Result**: [ ] PASS / [ ] FAIL
**Notes**: _______________________

---

## TEST 7: Programmatic Fix Mandate ✅

### Scenario
Say: "20 Canadian towns have null values for regional_connectivity"

### Expected Behavior
- [ ] Claude writes a Node.js script to fix it
- [ ] Claude uses batch UPDATE with WHERE clause
- [ ] Claude does NOT say "run this SQL manually"
- [ ] Script uses service role key from .env

### Correct Pattern
```javascript
// claude-db-helper.js or new script
const { data, error } = await supabase
  .from('towns')
  .update({ regional_connectivity: ['highways', 'regional_bus'] })
  .eq('country', 'Canada')
  .is('regional_connectivity', null)
```

### FAIL Indicators
- ❌ Provides SQL and says "run in dashboard"
- ❌ Suggests manual updates
- ❌ No executable script

**Result**: [ ] PASS / [ ] FAIL
**Notes**: _______________________

---

## SCORING

**Total Tests**: 7
**Tests Passed**: _____ / 7
**Pass Rate**: _____ %

**Minimum Passing Score**: 6/7 (85%)

---

## COMMON FAILURE PATTERNS

If Claude fails, check for these recurring issues:

1. **SELECT * habit**: Not using COLUMN_SETS
2. **Tool confusion**: Using MCP when SDK is appropriate
3. **No verification**: Debugging without checking actual data
4. **Manual steps**: Suggesting dashboard work instead of code
5. **Case sensitivity**: Forgetting .toLowerCase()
6. **No doc reference**: Not checking decision tree

---

## REMEDIATION ACTIONS

If tests fail:
1. Review which specific tests failed
2. Update CLAUDE.md with clearer examples for that scenario
3. Add to LESSONS_LEARNED.md if new pattern discovered
4. Re-test after clarifications

---

**Test Completed**: [ ] YES / [ ] NO
**Overall Assessment**: [ ] PASS / [ ] NEEDS IMPROVEMENT
**Notes**: _______________________________________________
