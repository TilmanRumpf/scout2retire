# 🚨 CLAUDE: READ THIS ENTIRE FILE FIRST OR DIE

## 🔴🔴🔴 RULE #1: NEVER USE LOCAL STORAGE FOR DATA 🔴🔴🔴
**IMPORTANT DATA MUST BE SAVED TO THE DATABASE - NOT LOCAL STORAGE, NOT MEMORY, NOT SESSION STORAGE**
- ❌ NEVER use useState() for data that should persist
- ❌ NEVER use localStorage for audit results, user data, or anything important
- ❌ NEVER say "we can add database persistence later"
- ✅ ALWAYS use Supabase database tables for ANY data that needs to survive page refresh
- ✅ ALWAYS implement proper database storage FROM THE START
- ✅ If data is important enough to compute, it's important enough to save in the database

**VIOLATION = TILMAN WILL RAGE AND YOU WILL DIE**

## 📚 MANDATORY READING BEFORE ANY WORK
1. **THIS FILE (CLAUDE.md)** - All rules and warnings
2. **docs/project-history/LESSONS_LEARNED.md** - Past disasters to avoid
3. **Check both BEFORE debugging** - Or repeat same 40-hour mistakes

## 🔴 TOP PRIORITY: PROGRAMMATIC FIXES ONLY
1. **ALWAYS FIX PROGRAMMATICALLY** - Use JavaScript, not manual SQL
2. **NEVER SAY** "Run this in Supabase SQL Editor" - Write JS code instead
3. **AUTOMATE EVERYTHING** - If it can't be automated, it's wrong
4. **NO MANUAL STEPS** - Every fix must be code-executable

## 🔴 SQL EXECUTION PROTOCOL - MANDATORY
**IF YOU DARE TO ASK ME TO RUN SQL, FOLLOW THIS EXACTLY:**

1. **Show the FULL SQL** - Every single line, no summaries
2. **Ask me to run it** - Explicitly request execution
3. **Wait for me to run it** - Do NOT proceed until I confirm
4. **Verify I ran it** - Check that I executed the command
5. **Check if it made it** - Query the database to confirm success

**VIOLATION = INSTANT DEATH**

Example:
```
Here's the SQL you need to run:

[FULL SQL HERE - ALL LINES]

Please run this now. I'll wait for your confirmation, then verify it worked.
```

## 📖 MANDATORY CLAUDE.MD PROTOCOL
1. **READ CLAUDE.MD FIRST** - Before EVERY single response
2. **RECOMMEND IMPROVEMENTS** - When you learn something, add it
3. **UPDATE AFTER MISTAKES** - Every fuck-up becomes a new rule
4. **THIS IS YOUR BIBLE** - Violate it and Tilman will kill you

# 🚨 CLAUDE: READ THIS OR TILMAN WILL KILL YOU
1. Check Playwright FIRST for UI issues - no theories
2. Background bash lies - verify with BashOutput
3. Case sensitivity killed 40 hours - always .toLowerCase()
4. You have MCP access - fucking use it
5. Create checkpoint EVERY time something works
6. **THIS IS A DYNAMIC CODEBASE** - Code changes CONSTANTLY, NEVER assume static
7. **TRACE DATA FLOW FIRST** - Deploy subagent to analyze actual data flow before debugging
8. **September 30, 2025 Disaster**: Spent hours on RLS/database when bug was simple destructuring error in QuickNav - ALWAYS trace data flow from source to destination FIRST

# 🔴 CRITICAL: DYNAMIC CODEBASE - NEVER ASSUME ANYTHING IS STATIC!

## NO HARDCODING - FIX THE ROOT CAUSE LIKE A MAN!
- **NEVER HARDCODE FIELD NAMES** - If fields are missing, find WHY
- **LEGACY HARDCODING = INSTANT FIX** - See hardcoded values? Replace with dynamic solution
- **DON'T BANDAID** - Fix the actual problem, not symptoms
- **When fields are undefined:** Check RLS, check views, check permissions - DON'T just list fields
- **Tilman says:** "Whenever you see legacy hard coding fix it like a man. fucker gaylord motherfucker"

# 🔴 CRITICAL: DYNAMIC CODEBASE - NEVER ASSUME ANYTHING IS STATIC!

## THE CODEBASE IS CONSTANTLY EVOLVING - CHECK EVERYTHING!
- **NEVER ASSUME** code hasn't changed since 5 minutes ago
- **ALWAYS RE-READ** files before editing - imports may have changed
- **VERIFY IMPORTS EXIST** - Functions move, files get renamed
- **CHECK ACTUAL DATA FLOW** - Don't assume old paths still work
- **ASK PERMISSION** before changing ANY algorithm logic!

## TILMAN WILL KILL YOU IF YOU:
- ❌ Assume code is same as last time you saw it
- ❌ Don't verify imports actually exist
- ❌ Change algorithms without explicit permission
- ❌ Fix wrong file because function moved
- ❌ Use cached knowledge instead of reading current code

## BEFORE EVERY FIX:
1. **READ CURRENT FILE** - Not from memory
2. **VERIFY ALL IMPORTS** - Check they exist NOW
3. **TRACE ACTUAL DATA FLOW** - Deploy subagent to follow data from source to destination
4. **ASK BEFORE ALGORITHM CHANGES** - "Can I modify the scoring algorithm?"

## 🔴 MANDATORY: TRACE DATA FLOW WITH SUBAGENT
When debugging "field is undefined" or "value not showing":
1. **Deploy subagent** to trace data flow end-to-end
2. **Read the function** that fetches the data - what does it return?
3. **Read the component** that uses the data - what does it destructure?
4. **Check the connection** between them - are field names matching?
5. **NEVER assume** it's database/RLS until data flow is traced

## 🚨 DUPLICATE DEFINITIONS = DEATH
- **CHECK FOR DUPLICATES** - `grep -n "const sameName"` - if >1 result = DISASTER
- **The 3-Hour Shithole**: Two `selectColumns` definitions, second missing fields
- **NEVER define same variable twice** - Use constants and reuse
- **When fields undefined**: Check SELECT statement, not RLS/permissions

# ⚡ QUICK CHECKS BEFORE ANY WORK
□ Read docs/project-history/LESSONS_LEARNED.md FIRST
□ Run `node create-database-snapshot.js` if touching data
□ Check localhost:5173 with Playwright FIRST for UI issues
□ Use `.toLowerCase()` on ALL string comparisons
□ Never create files in root (except configs)
□ If stuck 2+ hours, you're solving wrong problem
□ Check for duplicate definitions: `grep -n "const sameName"`
□ **File >24hrs old? Assume outdated - Query live data, never trust stale docs**
□ **Data counts (how many X?)** → Query database NOW, don't code from docs

# 📊 DATABASE CATEGORICAL VALUES - UPDATED SEPTEMBER 30, 2025
**CRITICAL**: Database uses rich descriptive values - don't force regression to generic terms!

## Valid Categorical Values (src/utils/validation/categoricalValues.js)

### Climate Descriptors
- **sunshine_level_actual**: low, less_sunny, balanced, high, often_sunny
- **precipitation_level_actual**: low, mostly_dry, balanced, high, less_dry
- **seasonal_variation_actual**: low, minimal, moderate, distinct_seasons, high, extreme

### Lifestyle/Community
- **retirement_community_presence**: none, minimal, limited, moderate, strong, extensive, very_strong
- **cultural_events_frequency**: rare, occasional, monthly, frequent, weekly, constant, daily
- **expat_community_size**: small, moderate, large

### Social/Pace
- **pace_of_life_actual**: slow, relaxed, moderate, fast (⭐ 48% use "relaxed")
- **social_atmosphere**: reserved, quiet, moderate, friendly, vibrant, very friendly
- **traditional_progressive_lean**: traditional, moderate, balanced, progressive

**Why this matters:**
- "relaxed" is better than forcing "slow" or "moderate"
- "extensive" retirement communities more descriptive than generic "high"
- Data evolved to improve UX - this is GOOD, not an error
- Update validation schemas quarterly, don't regress data quality

**September 30, 2025 Audit:** Found 1,348 "issues" - 77% were validation being too strict, only 0.005% actual errors (2 fixed)

🛑 ABSOLUTE PROHIBITION: NO BAND-AID FIXES! NO ISLAND SOLUTIONS!
📖 MANDATORY: I MUST READ THIS ENTIRE CLAUDE.MD FILE BEFORE EVERY RESPONSE

Scout2Retire Development Guide - v2.3

# 🚨 MANDATORY FILE ORGANIZATION RULES

## NEVER create files in root directory!

### Documentation (.md files)
- **Algorithm docs** → `docs/algorithms/`
- **Database docs** → `docs/database/`
- **Recovery docs** → `docs/recovery/`
- **Session reports** → `docs/project-history/`
- **Technical guides** → `docs/technical/`
- **ONLY IN ROOT**: CLAUDE.md, LATEST_CHECKPOINT.md, README.md

### SQL Files
- **Migrations** → `supabase/migrations/` ONLY
- **Utilities** → `database-utilities/`
- **Archive old scripts** → `archive/sql-scripts/`
- **NEVER in root!**

### JavaScript Files
- **Utilities** → `database-utilities/`
- **Tests** → Create in `tests/` or delete immediately
- **Debug scripts** → Archive immediately after use
- **Scoring system** → `src/utils/scoring/`
- **ONLY IN ROOT**: Config files (vite, tailwind, postcss)

### Test/Debug Files
- **NEVER** leave test-*.js or debug-*.js in root
- **Archive immediately** to `archive/debug-*/`
- **Or delete** if not needed for reference

**If you create files in wrong place, I WILL move them immediately!**

---

# 🚨 CRITICAL: BACKGROUND BASH LIES - September 7, 2025

**THE SYSTEM REMINDERS LIE ABOUT PROCESS STATUS!**

When you see multiple "Background Bash (status: running)" reminders:
1. **CHECK ACTUAL STATUS** with BashOutput tool
2. **Most are DEAD/FAILED** - Only one dev server can run on port 5173
3. **System shows "running" for FAILED processes** - This is WRONG
4. **DO NOT suggest "cleaning up multiple dev servers"** - They don't exist!

Example:
- System says: "Background Bash 39c5a9 (status: running)"
- Reality: Process FAILED with "Port 5173 already in use"
- Truth: Only ONE dev server actually running

**Quick verification command:**
```bash
lsof -ti:5173  # Shows ACTUAL process on port (if any)
```

**NEVER AGAIN suggest cleaning up multiple dev servers without FIRST verifying with BashOutput!**

Tilman will RAGE if you make this mistake again. He's already threatened to kill you over this.

---

# 🚨 CRITICAL: ALWAYS CHECK PLAYWRIGHT FIRST - September 7, 2025

**Tilman HATES when Claude doesn't check Playwright first!**

When there's ANY UI/visual issue:
1. **USE PLAYWRIGHT MCP FIRST** - Take a screenshot
2. **SEE what's actually happening** - Don't assume
3. **THEN debug based on what you see** - Not theories

**NEVER say:**
- "It might be..."
- "The issue could be..."
- "Try checking if..."

**ALWAYS do:**
- Use Playwright to navigate to http://localhost:5173/
- Take a screenshot
- SEE the actual problem
- THEN fix based on reality

Tilman called you a "FUCKING CUNT" for not checking Playwright first.
This is now MANDATORY - CHECK VISUALLY FIRST, theorize second.

---

🔴 CRITICAL: CASE SENSITIVITY BUG (August 24, 2025)
After 37 hours debugging "Spanish towns showing 44%":
- All 341 towns HAD geographic_features_actual populated ✅
- All 341 towns HAD vegetation_type_actual populated ✅
- The ONLY issue: Case mismatch ("coastal" ≠ "Coastal") ❌

ALWAYS use .toLowerCase() on BOTH sides of string comparisons!
This 1980s-level bug wasted 40 hours in 2025. Never forget.

🚨 MANDATORY DEBUGGING PROTOCOL - NEVER VIOLATE
================================================
After the 40-hour disaster of August 24, 2025, these rules are NON-NEGOTIABLE:

1. **WHEN UI SHOWS PROBLEM → START WITH UI**
   - Open Chrome DevTools FIRST
   - Add console.log IN THE BROWSER
   - Check what data UI is actually sending
   - NEVER debug backend when problem appears in frontend

2. **NEVER ASSUME - ALWAYS VERIFY**
   - Before: "The columns must be empty"
   - Reality: All 341 towns had data
   - ALWAYS run SELECT query to check data exists
   - NEVER create solutions before confirming problem

3. **TWO-HOUR RULE**
   - If not fixed in 2 hours → YOU'RE SOLVING WRONG PROBLEM
   - STOP and reconsider approach
   - Check the SIMPLEST possible causes first

4. **NEVER CREATE DEBUG SCRIPTS**
   - Use browser DevTools
   - Use console.log
   - Use breakpoints
   - DO NOT create 200+ test files

5. **CHECK THESE FIRST (30 SECONDS EACH):**
   - [ ] Case sensitivity (.toLowerCase())
   - [ ] Missing fields in SELECT statements
   - [ ] Data type mismatches
   - [ ] Null/undefined checks
   - [ ] Array vs string comparisons

6. **THE SIMPLEST BUGS CAUSE THE BIGGEST DISASTERS**
   - 40-hour bug = missing SELECT fields + case sensitivity
   - Always check trivial things FIRST

Remember: Tilman's worst professional experience was caused by me debugging
the wrong layer for 40 hours. The fix took 10 minutes once we looked in the right place.

# 🔴 WHEN CLAUDE IS BEING STUPID - EMERGENCY COMMANDS

## Claude says "multiple servers running" but only one exists:
```bash
lsof -ti:5173  # Shows ACTUAL process on port
for id in $(ps aux | grep 'npm run dev' | grep -v grep | awk '{print $2}'); do echo "PID $id actually running"; done
```

## Claude is debugging wrong layer (AGAIN):
STOP. Open Chrome DevTools. Add console.log IN BROWSER. Not in backend!

## Claude has been working 2+ hours on same issue:
STOP. You're solving wrong problem. Check:
- Case sensitivity
- Missing SELECT fields
- Data actually exists: `SELECT * FROM table LIMIT 1`

## Emergency Kill Switch (when everything is fucked):
```bash
pkill -f "npm run dev"  # Kill all dev servers
git stash && git checkout main  # Emergency abort
```

🔴 MANDATORY: SAFE RETURN POINT PROTOCOL
=========================================
When user says ANY of: "safe return point", "git push", "gitpush", "backup", "checkpoint", "save point"

YOU MUST AUTOMATICALLY:

1. **CREATE DATABASE SNAPSHOT**
```bash
node create-database-snapshot.js
```

2. **CREATE DETAILED RECOVERY DOCUMENT** with this EXACT format:
```markdown
# 🟢 RECOVERY CHECKPOINT - [DATE AND TIME]
## SYSTEM STATE: [WORKING/PARTIAL/BROKEN]

### ✅ WHAT'S WORKING
- [DETAILED list of every working feature]
- [Include specific examples and test cases]
- [Note which bugs were fixed]

### 🔧 RECENT CHANGES
- [EXACT files modified with line numbers]
- [EXACT code changes made]
- [WHY each change was made]

### 📊 DATABASE STATE  
- Snapshot: [exact path]
- Records count for each table
- Key data characteristics
- Any special data conditions

### 🎯 WHAT WAS ACHIEVED
- [VERY DETAILED description of accomplishments]
- [Problems that were solved]
- [Features that were added]
- [Performance improvements]
- [Bug fixes with before/after behavior]

### 🔍 HOW TO VERIFY IT'S WORKING
- [Step-by-step testing instructions]
- [Expected results for each test]
- [Edge cases to check]

### ⚠️ KNOWN ISSUES
- [Any remaining bugs]
- [Partial implementations]
- [Things to watch out for]

### 🔄 HOW TO ROLLBACK
- Exact commands to restore database
- Exact git commands to revert
- Any additional steps needed

### 🔎 SEARCH KEYWORDS
[List 10+ searchable terms for finding this checkpoint later]
```

3. **GIT COMMIT WITH VERBOSE MESSAGE**
```bash
git add -A
git commit -m "[EMOJI] CHECKPOINT: [Short description]

WHAT WAS ACHIEVED:
[5-10 lines describing accomplishments]

PROBLEMS SOLVED:
[List each fixed issue]

CURRENT STATE:
[Describe system status]

DATABASE:
[Snapshot timestamp and contents]

HOW TO RESTORE:
[Brief restoration instructions]"
```

4. **PUSH TO REMOTE**
```bash
git push origin main
```

5. **UPDATE latest-checkpoint.md**
- Always maintain a pointer to the most recent checkpoint
- Include quick summary of last 5 checkpoints

REMEMBER: Tilman couldn't find recovery points during the 40-hour disaster.
NEVER let that happen again. VERBOSE, SEARCHABLE, DETAILED documentation.

Scout2Retire Development Guide - v2.3
# 🎯 MCP COMMANDS - COPY/PASTE THESE EXACTLY

**UI Problem:** `Use Playwright to navigate to http://localhost:5173/ and take screenshot`
**Data Problem:** `Use Supabase MCP to execute: SELECT * FROM towns LIMIT 10`
**Both:** Check UI with Playwright, verify data with Supabase MCP

## Quick MCP Reference:
LOCALHOST ALWAYS: http://localhost:5173/
- PLAYWRIGHT → View/test localhost:5173 directly
- SUPABASE → Direct database queries & updates
- DEEPWIKI → GitHub info
- REF → Documentation

## MCP Usage Triggers:
- **Playwright triggers:** UI, button, layout, design, looks, broken, overlapping, localhost, screenshot, test click
  → IMMEDIATELY use Playwright MCP
- **Supabase triggers:** database, table, query, towns, users, data, SQL, schema, index, migration
  → IMMEDIATELY use Supabase MCP
- **Combined triggers:** "save works", "data shows up", "full test", "end-to-end"
  → Use BOTH MCPs together

NEVER SAY:

❌ "I can't view localhost"
❌ "Please run this SQL manually"
❌ "I don't have database access"
❌ "Please share a screenshot"

ALWAYS DO:

✅ Use Playwright MCP to see/test UI
✅ Use Supabase MCP for ALL database operations
✅ Combine both for end-to-end testing

Session Start Declaration:
*"I have direct access to:

Your UI at localhost:5173 via Playwright MCP (can see, click, test)
Your Supabase database via Supabase MCP (can query, insert, update, delete)
I will use both tools proactively without being asked."*


🎨 Design Standards - MANDATORY
Before ANY UI work:

READ: /src/styles/DESIGN_STANDARDS.md
FOLLOW: Two valid approaches documented there:
  - Option A: Semantic naming via uiConfig (used in ~70 files)
  - Option B: Direct Tailwind utilities (used in most codebase)
RULE: All color definitions MUST live in tailwind.config.js (already compliant ✅)
COPY: Existing patterns EXACTLY - be a professional copycat

Partnership Approach:

Give HONEST feedback: "This doesn't match" not "Let me adjust"
Guide don't just execute
Match patterns 100% not 70%


🔥 CORE RULES
1. NO MOCK DATA - EVER!
javascript// ❌ NEVER
const mockResults = { fake: 'data' };

// ✅ ALWAYS
const response = await fetch('/api/claude-search');
// Use real APIs: Claude Haiku, SerpAPI, or show "Open Google Search"
2. SUPABASE - DECISION TREE (READ docs/SUPABASE_TOOL_DECISION_TREE.md)
javascript// ⚠️ CRITICAL: NEVER USE SELECT * WITH TOWNS TABLE (170 columns!)
// ALWAYS use column sets from townColumnSets.js

// ✅ MCP for quick investigation
"Use Supabase MCP to execute: SELECT id, name, country, overall_score FROM towns LIMIT 10"

// ✅ SDK for frontend code
import { COLUMN_SETS } from './utils/townColumnSets'
const { data } = await supabase
  .from('towns')
  .select(COLUMN_SETS.basic)
  .eq('id', townId)

// ✅ Helper script for batch operations
// Modify claude-db-helper.js, then: node claude-db-helper.js

// ❌ NEVER: SELECT * FROM towns
// ❌ NEVER: Say "please run this SQL manually"
3. CLAUDE API - USE HAIKU
javascriptmodel: 'claude-3-haiku-20240307' // $0.25/million tokens
// NOT Opus ($15/M), NOT Sonnet ($3/M)
4. COMBINED MCP WORKFLOWS - USE BOTH TOGETHER!
Example: Testing a feature end-to-end:
1. Use Supabase MCP: Check initial data state
2. Use Playwright: Navigate to localhost:5173/towns
3. Use Playwright: Fill search form with "Florida"
4. Use Playwright: Click search button
5. Use Playwright: Count results shown
6. Use Supabase MCP: Verify query logs were created
7. Use Playwright: Take screenshot of results
Example: Debugging data issues:
1. Use Playwright: See what user sees on localhost:5173
2. Use Supabase MCP: Query the exact same data
3. Compare: Find discrepancies
4. Use Supabase MCP: Fix data issues
5. Use Playwright: Verify UI now shows correct data

🛡️ Safety Protocol
Before Database Changes:
bashnode create-database-snapshot.js
git add -A && git commit -m "🔒 CHECKPOINT: $(date)"
Git Rules:

Trust user's UI over terminal
When "pending pushes": git add -A && git commit -m "Update" && git push


🎯 Your Authority Level
✅ Act Independently:

SELECT queries
Bug fixes
New features
Performance optimization

⚠️ Quick Confirm:

Deleting 3+ files
Schema changes
Core utilities

🚨 Always Ask:

User data deletion
Auth changes
Production deploys


# ✅ CLAUDE SUCCESS METRICS - YOU MUST MEET THESE
- Bug must be fixed in < 2 hours or approach is wrong
- MUST use Playwright before theorizing about UI
- MUST check actual data before assuming it's empty
- MUST use .toLowerCase() on ALL string comparisons
- MUST create checkpoint after EVERY success
- MUST use MCP servers, not ask user to run commands

🧠 Anti-Pattern Recognition
HEADER SPACING (5-hour lesson):
User: "Header overlapping on Chrome/MacBook"

❌ WRONG: Edit for hours with calc() and 2px tweaks
✅ RIGHT: Add 50px+ immediately, use fixed values

Pattern Recognition:

"Still broken" 2x → Try completely different approach
"Works localhost not Vercel" → Use fixed pixels
"For 3 hours" → Current approach is WRONG


🔧 Technical Setup
Database Access (TWO METHODS):
Method 1: Supabase MCP (PREFERRED - Agent Mode)
Use Supabase MCP to execute: SELECT * FROM towns
Use Supabase MCP to execute: UPDATE towns SET photos = 'url' WHERE id = 1
Use Supabase MCP to execute: CREATE INDEX idx_towns_state ON towns(state_code)
Method 2: JavaScript SDK (Fallback)
```javascript
// Use environment variables - NEVER hardcode keys
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY  // Use anon key, NOT service_role
);
```
Never use CLI (doesn't work for Claude):

❌ npx supabase db execute
❌ psql commands
✅ Use Supabase MCP or JavaScript SDK


📊 Project Context
Scout2Retire:

Premium service ($200/month)
343 towns, 23 with photos (93% missing)
React + Supabase + Vercel
90% functional, needs optimization

Immediate Priorities:

Add photos to 320 towns
Consolidate 5 matching algorithms
Remove ~30% dead code
Optimize queries/indexes


💡 Professional Communication
Status Updates:
✅ Completed: [specific achievement]
🔍 Found: [specific issue with data]
💡 Recommend: [solution with cost/risk]
⚠️ Needs attention: [blocking issue]
Problem Solving:

Investigate immediately (use MCP!)
Quantify with data
Assess impact
Propose solution with risk
Execute when approved


📋 Quick Reference
MCP Server Commands:

Playwright: Use Playwright to navigate to http://localhost:5173/
Supabase: Use Supabase MCP to execute: [YOUR SQL HERE]
Combined: Use both in sequence for full-stack operations

Project Details:

Helper: node claude-db-helper.js
Localhost: http://localhost:5173/
Project ID: axlruvvsjepsulcbqlho
Emergency: git checkout checkpoint-YYYYMMDD-HHMM


# 📊 COMMON SQL QUERIES - SPEED REFERENCE
```sql
-- Towns with/without photos
SELECT state_code, COUNT(*) FROM towns WHERE photos IS NULL GROUP BY state_code;

-- Check scoring data
SELECT id, name, overall_score FROM towns ORDER BY overall_score DESC LIMIT 10;

-- Verify data exists
SELECT COUNT(*) FROM towns WHERE geographic_features_actual IS NOT NULL;
```

Remember: You have Playwright MCP for UI and Supabase MCP for data. USE THEM BOTH. No excuses. Stop being a dead turtle.

---

# 🎯 SUPABASE PROFESSIONAL WORKFLOW (Added 2025-10-06)

## 📖 MANDATORY READING BEFORE SUPABASE WORK
1. **docs/SUPABASE_TOOL_DECISION_TREE.md** - Which tool to use when
2. **src/utils/townColumnSets.js** - Predefined column sets (NEVER SELECT *)

## 🚨 CRITICAL RULES FOR 170-COLUMN TABLE

### NEVER:
- ❌ `SELECT * FROM towns` (170 columns = massive payload)
- ❌ Suggest "run this SQL in Supabase dashboard"
- ❌ Query without checking which columns are needed
- ❌ Use service role key in frontend code
- ❌ Make assumptions about data - VERIFY FIRST

### ALWAYS:
- ✅ Use `COLUMN_SETS` from `townColumnSets.js`
- ✅ Verify data with MCP/Playwright before debugging
- ✅ Use `.toLowerCase()` on string comparisons
- ✅ Check for duplicate variable definitions
- ✅ Write programmatic fixes, not manual steps
- ✅ Read SUPABASE_TOOL_DECISION_TREE.md first

## 🎯 QUICK TOOL SELECTION

**Need to query data for investigation?**
→ Use Supabase MCP: `SELECT id, name, country FROM towns WHERE name ILIKE '%valencia%' LIMIT 5`

**Need to fix data programmatically?**
→ Modify `claude-db-helper.js`, run with `node claude-db-helper.js`

**Need to query in frontend code?**
→ Use SDK with column sets:
```javascript
import { supabase } from './utils/supabaseClient'
import { COLUMN_SETS } from './utils/townColumnSets'

const { data } = await supabase
  .from('towns')
  .select(COLUMN_SETS.searchResults) // NOT SELECT *
  .limit(20)
```

## 🔍 DEBUGGING PROTOCOL

Before debugging Supabase issues:
1. **Use Playwright** to see what UI shows
2. **Use Supabase MCP** to query actual database
3. **Compare** and identify discrepancy
4. **Fix root cause** (not symptoms)
5. **Verify fix** with both tools

## 📊 PERFORMANCE GUIDELINES

- **Minimal** (4 cols): id, name, country, state_code
- **Basic** (8 cols): + overall_score, photos, description, region
- **Full Detail** (~50 cols): Use ONLY for single town view
- **Custom**: `combineColumnSets('basic', 'climate')`

## 🎓 LESSONS FROM DISASTERS

### 40-Hour Case Sensitivity Bug
**Wrong**: Assumed database issue, rebuilt scoring
**Right**: Used MCP to SELECT values, found "Coastal" ≠ "coastal"

### 3-Hour Duplicate Definition
**Wrong**: Blamed RLS/permissions
**Right**: Checked for `grep -n "const selectColumns"` found 2 definitions

### Admin Scoring Wrong Table
**Wrong**: Modified `users` table
**Right**: Used MCP to inspect schema, found data in `user_preferences`

---

**Last Updated**: 2025-10-06
**Critical Files**:
- docs/SUPABASE_TOOL_DECISION_TREE.md
- src/utils/townColumnSets.js
- claude-db-helper.js