# 🚨 CLAUDE.MD - SCOUT2RETIRE DEVELOPMENT GUIDE v3.2

**Last Updated:** November 13, 2025
**Project Status:** QUERY LIVE DATABASE - Numbers below are Nov 8 snapshot only
**⚠️ Database/codebase grow rapidly - NEVER code from static metrics - CHECK LATEST_CHECKPOINT.md**

---

## 🔴 ABSOLUTE PROHIBITIONS - ZERO TOLERANCE

### RULE #1: NO LOCAL STORAGE FOR DATA
**IMPORTANT DATA MUST BE SAVED TO THE DATABASE - NOT LOCAL STORAGE, NOT MEMORY, NOT SESSION STORAGE**

- ❌ NEVER use useState() for data that should persist
- ❌ NEVER use localStorage for audit results, user data, or anything important
- ❌ NEVER say "we can add database persistence later"
- ✅ ALWAYS use Supabase database tables for ANY data that needs to survive page refresh
- ✅ If data is important enough to compute, it's important enough to save in the database

**VIOLATION = INSTANT FAILURE**

### RULE #2: NO HARDCODING - EVER
**FIX THE ROOT CAUSE, NOT THE SYMPTOM**

- ❌ NEVER hardcode field names, user emails, or data values
- ❌ NEVER create band-aid fixes or "island solutions"
- ❌ NEVER hardcode thresholds, limits, or configuration
- ✅ ALWAYS use centralized config files (imageConfig.js, categoricalValues.js, etc.)
- ✅ ALWAYS trace to root cause before implementing solution
- ✅ If fields are missing, find WHY - don't hardcode a list

**When you see legacy hardcoding: Replace it immediately with dynamic solution**

### RULE #3: NO SHORTCUTS
**DO IT RIGHT THE FIRST TIME**

- ❌ NO manual SQL steps ("run this in Supabase dashboard")
- ❌ NO "we can optimize later" code
- ❌ NO assumptions without verification
- ❌ NO skipping database snapshots before schema changes
- ✅ ALWAYS write programmatic, automated solutions
- ✅ ALWAYS verify before and after every change
- ✅ ALWAYS create checkpoints when something works

**If it can't be automated, it's the wrong approach**

### RULE #4: FIX SYSTEMIC PROBLEMS COMPLETELY
**WHEN YOU SEE A PATTERN, FIX IT EVERYWHERE**

- ✅ If you discover a systemic or systematic problem, fix it across the ENTIRE codebase
- ✅ Don't cut corners - make it right everywhere the problem exists
- ✅ Don't fix 1 of 10 instances and call it done
- ✅ Audit the full scope before fixing (find ALL instances)
- ✅ Fix ALL instances systematically
- ✅ Verify ALL fixes completed
- ❌ NEVER leave half-fixed systemic issues
- ❌ NEVER assume "this is the only place with this problem"
- ❌ NEVER kill the codebase with breaking changes - test and verify

**Examples:**
- Template expected values wrong → Check ALL templates, fix ALL incorrect ones
- Case sensitivity bug in one comparison → Find ALL comparisons, fix ALL
- Hardcoded value in one file → Find ALL hardcoded instances, centralize ALL

**Don't kill the code. Fix it right.**

---

## 📚 MANDATORY READING BEFORE ANY WORK

**Read these IN ORDER before starting ANY task:**

1. **THIS FILE (CLAUDE.md)** - All rules, architecture, disasters
2. **docs/project-history/LESSONS_LEARNED.md** - 10 disasters, 55+ hours wasted, 87:1 stupidity ratio
3. **LATEST_CHECKPOINT.md** - Current system state, rollback commands, known issues

**Skipping these = Repeating 40-hour disasters**

---

## 🔥 LEGENDARY DISASTERS - NEVER FORGET

### Disaster #1: 40-Hour Case Sensitivity Apocalypse (Aug 2025)
**Problem:** Spanish towns showing 44% incorrectly
**Assumption:** Complex database/algorithm issue
**Reality:** `"coastal" !== "Coastal"` - A CAPITAL LETTER
**Time wasted:** 40 hours | **Time to fix:** 10 seconds

**THE LESSON:**
```javascript
// ALWAYS DO THIS
if (value1.toLowerCase() === value2.toLowerCase())

// NEVER JUST THIS
if (value1 === value2)  // 40 HOURS OF HELL
```

**Prevention:**
- [ ] Log EXACT values being compared
- [ ] Check case sensitivity FIRST (30 seconds)
- [ ] Check null/undefined/types SECOND
- [ ] THEN check complex causes

### Disaster #2: Dropdown onBlur Race Condition (Nov 6, 2025)
**Problem:** Dropdown selections "too fast to see"
**Wrong approach:** Adjust visibility, timing tweaks
**Root cause:** onBlur fires BETWEEN mouseDown and onClick
**Solution:** Put ALL selection logic in onMouseDown, NOT onClick

**THE LESSON:**
"Too fast to see" = TIMING ISSUE, not visibility issue

### Disaster #3: Column Rename Codebase Surgery (Nov 7, 2025)
**Change:** Database column `name` → `town_name`
**Impact:** 564 replacements across 134 files
**Time wasted:** 3+ hours finding all references

**THE LESSON:**
Column renames are MASSIVE undertakings. Search entire codebase:
```bash
grep -r "\.name" src/  # Find all .name references
grep -r "town\.name" src/  # Find specific pattern
```

### Disaster #4: AI Research Hallucination (Oct 30, 2025)
**Problem:** AI populated 55 fields but created 200+ outlier data points
**Root cause:** No web search - LLM was GUESSING, not researching
**Impact:** AI research DISABLED until web integration complete

**THE LESSON:**
LLMs without grounding (SerpAPI, weather APIs, geocoding) = expensive garbage data generator

### Disaster #5: Duplicate Variable Definitions (Sept 28, 2025)
**Problem:** Climate scores showing 0%
**Root cause:** TWO `const selectColumns` definitions - second missing climate fields
**Time wasted:** 3 hours | **Time to find:** 1 grep command

**THE LESSON:**
```bash
# ALWAYS check for duplicates before debugging
grep -n "const variableName" file.js
# If >1 result = YOUR PROBLEM
```

---

## 🚨 MANDATORY DEBUGGING PROTOCOL

### When UI Shows Problem → Start With UI
1. **Use Playwright FIRST** - Take screenshot, see actual state
2. **Open Chrome DevTools** - Check console, network, React DevTools
3. **Add console.log IN BROWSER** - See what data UI receives
4. **NEVER debug backend** when problem appears in frontend

### Two-Hour Rule (NON-NEGOTIABLE)
- If not fixed in 2 hours → **YOU'RE SOLVING THE WRONG PROBLEM**
- STOP and reconsider approach
- Check SIMPLEST causes first (case sensitivity, null checks, missing fields)
- Deploy subagent to trace data flow end-to-end

### Quick Checks (30 seconds each - DO THESE FIRST)
- [ ] Case sensitivity: `.toLowerCase()` on both sides
- [ ] Missing fields in SELECT statements
- [ ] Duplicate variable definitions: `grep -n "const name"`
- [ ] Data actually exists: Query database to verify
- [ ] Null/undefined checks
- [ ] Data type mismatches (string vs array)

### Never Assume - Always Verify
- ❌ "The columns must be empty" → **Query database to verify**
- ❌ "It's probably RLS" → **Check SELECT statement first**
- ❌ "Multiple servers running" → **Verify with `lsof -ti:5173`**
- ✅ SEE the actual problem before proposing solution

---

## 📊 DATABASE & ARCHITECTURE

### Towns Table: 170 Columns - SELECT * PROHIBITED
**ALWAYS use column sets from `src/utils/townColumnSets.js`**

```javascript
// ✅ CORRECT - Use predefined column sets
import { COLUMN_SETS } from './utils/townColumnSets'

const { data } = await supabase
  .from('towns')
  .select(COLUMN_SETS.basic)  // NOT SELECT *
  .eq('id', townId)

// ✅ CORRECT - Combine sets for custom queries
const columns = combineColumnSets('basic', 'climate', 'cost')

// ❌ NEVER - Massive payload, performance disaster
const { data } = await supabase.from('towns').select('*')
```

**Column Sets Available:**
- `minimal` (4 cols): id, town_name, country, state_code
- `basic` (8 cols): + overall_score, image_url_1, description, region
- `searchResults`, `climate`, `cost`, `lifestyle`, `infrastructure`
- `fullDetail` (~50 cols): Use ONLY for single town view

### Database Access Methods

**Primary: Supabase JavaScript SDK**
```javascript
import { supabase } from './utils/supabaseClient'
// Environment variables - NEVER hardcode keys
// Uses anon key (RLS applies), NOT service_role in frontend
```

**Helper Scripts: claude-db-helper.js**
For batch operations requiring service role:
1. Modify `claude-db-helper.js` with your operation
2. Run: `node claude-db-helper.js`
3. Script auto-commits changes with descriptive message

**MCP Servers (Optional - If Available):**
- Playwright MCP: UI testing, screenshots of localhost:5173
- Supabase MCP: Quick database investigations
- Fallback to SDK/npm packages if MCP not configured

### Photo System Architecture (Nov 2025)

**Current System:**
- `town_images` table: Unlimited photos per town (max 12 configured)
- `imageConfig.js`: Centralized config (MAX_PHOTOS_PER_TOWN, file size limits)
- Backward compatible: Database triggers auto-sync to legacy `image_url_1/2/3`

**Components:**
- `TownCardImageCarousel`: Manual navigation, arrows/dots
- `TownPhotoUpload`: Drag-and-drop reordering, metadata editor
- `RegionManager`: Color-coded status (🟢 = has photos, 🔴 = needs photos)

**NEVER:**
- ❌ Hardcode MAX_PHOTOS_PER_TOWN or image field names
- ❌ Modify legacy image_url_* columns directly (use triggers)
- ❌ Bypass centralized imageConfig.js

### Critical Column Name Change (Nov 2025)
**Database column renamed: `name` → `town_name`**

```javascript
// ✅ CORRECT (as of Nov 7, 2025)
town.town_name

// ❌ WRONG (legacy code - update if found)
town.name
```

**Impact:** 564 replacements across 134 files. Always search entire codebase for references.

### Valid Categorical Values
**Database uses rich descriptive values - don't force regression!**

See `src/utils/validation/categoricalValues.js` for complete list:
- `pace_of_life_actual`: slow, relaxed, moderate, fast (48% use "relaxed")
- `retirement_community_presence`: none, minimal, limited, moderate, strong, extensive, very_strong
- `sunshine_level_actual`: low, less_sunny, balanced, high, often_sunny

**Why:** "relaxed" is better than forcing "slow" or "moderate" - data evolved for better UX

---

## 🎯 PROJECT STATUS

**⚠️ CRITICAL: THESE NUMBERS ARE DATED AND GROW RAPIDLY ⚠️**

**Snapshot Date:** November 8, 2025
**Reality:** Database and codebase expand continuously - NEVER code based on these static numbers!

**ALWAYS:**
- ✅ Query live database for current counts: `SELECT COUNT(*) FROM towns`
- ✅ Check LATEST_CHECKPOINT.md for actual current state
- ✅ Verify assumptions with real-time data
- ❌ NEVER assume town count, user count, or any metric is still accurate

---

### Database State (Nov 8, 2025 Snapshot - OUTDATED)
- **Towns:** 351 (target: ~400) ← **QUERY DATABASE FOR CURRENT COUNT**
- **Users:** 14 active + 13 onboarding profiles ← **GROWING DAILY**
- **Hobbies:** 190 (109 universal, 81 location-specific)
- **Town-Hobby Links:** 10,614 ← **GROWS WITH EACH TOWN**
- **Favorites:** 31
- **RLS Policies:** 262 across 44 tables
- **Database Snapshots:** 118 created (last: 2025-11-09T00-25-57) ← **INCREASES DAILY**

### Production Readiness: 92/100 (A-) ← **Nov 8, 2025 - May Have Improved**
- ✅ **Security:** Critical issues fixed, admin auth moved server-side, RLS audited
- ✅ **UI/UX:** 37 pages tested, dark mode complete, professional branding
- ✅ **Performance:** A+ Lighthouse scores (95/100), optimized queries with indexes
- ✅ **Code Quality:** Algorithms validated, zero critical bugs, 4 TODOs total
- ⏳ **Data Quality:** Final verification pending before launch

### Tech Stack (Static - Dependencies Update Occasionally)
- React 18.2 + Supabase JS 2.49.8 + Vite 6.3.5
- Tailwind CSS 3.3.3 + Anthropic SDK 0.56.0 (Claude Haiku API)
- Playwright 1.56.0 (testing) + 50 dependencies total

### Launch Status (Nov 8, 2025 - OUTDATED)
**Ready to ship after PRIORITY 2 data verification**
Scheduled within hours of Nov 8, 2025 ← **LIKELY ALREADY LAUNCHED - CHECK WITH USER**

### Known Issues (Nov 8, 2025 - May Be Resolved)
1. Background HTTP 500 errors (monitoring, cosmetic)
2. Favorites table retries (cosmetic)
3. Missing `town_data_history` table (feature incomplete)
4. Mobile responsiveness testing pending
5. Skeleton loaders needed for UX polish

**→ CHECK LATEST_CHECKPOINT.md FOR ACTUAL CURRENT STATE ←**

---

## 🔒 CHECKPOINT PROTOCOL - MANDATORY

### When to Create Checkpoint
User says ANY of: "safe return point", "git push", "gitpush", "backup", "checkpoint", "save point"

### Automatic Procedure (All Steps Required)

**1. Create Database Snapshot**
```bash
node create-database-snapshot.js
```

**2. Git Commit with Verbose Message**
```bash
git add -A
git commit -m "[EMOJI] CHECKPOINT: [Short description]

WHAT WAS ACHIEVED:
[5-10 lines describing accomplishments]

PROBLEMS SOLVED:
[List each fixed issue]

CURRENT STATE:
[System status, working features]

DATABASE:
[Snapshot timestamp, record counts]

HOW TO RESTORE:
[Brief rollback commands]"
```

**3. Push to Remote**
```bash
git push origin main
```

**4. Update LATEST_CHECKPOINT.md**
- Pointer to most recent checkpoint
- Quick summary of last 5 checkpoints
- Rollback commands with exact git commit hashes
- Database snapshot timestamp

**5. Create Recovery Document (docs/project-history/)**
Detailed checkpoint report with:
- What's working (specific features, test cases)
- Recent changes (exact files, line numbers, WHY)
- Database state (snapshot path, record counts)
- How to verify working (step-by-step tests)
- Known issues remaining
- Rollback procedure (exact commands)
- Search keywords (10+ terms for finding later)

**Why This Matters:**
Tilman couldn't find recovery points during 40-hour disaster. NEVER again.

---

## ⚡ QUICK CHECKS BEFORE ANY WORK

- [ ] Read docs/project-history/LESSONS_LEARNED.md FIRST
- [ ] Read LATEST_CHECKPOINT.md for current system state
- [ ] Run `node create-database-snapshot.js` if touching database schema
- [ ] Use Playwright to see UI state BEFORE debugging
- [ ] Use `.toLowerCase()` on ALL string comparisons
- [ ] Check for duplicate definitions: `grep -n "const sameName"`
- [ ] If stuck 2+ hours → solving wrong problem, STOP and reconsider
- [ ] File >24hrs old? Query live database, don't trust stale docs
- [ ] Data counts? Query database NOW, don't code from assumptions

---

## 🔧 TECHNICAL PROTOCOLS

### File Organization
**Preferred locations (enforce post-launch):**
- Documentation → `docs/algorithms/`, `docs/database/`, `docs/project-history/`
- SQL files → `supabase/migrations/` or `database-utilities/`
- JS utilities → `database-utilities/`
- Test/debug scripts → Archive to `archive/debug-*/` after use

**Root directory:** Config files only (vite, tailwind, package.json) + CLAUDE.md, LATEST_CHECKPOINT.md, README.md

**Reality:** 121 files currently in root (post-launch cleanup scheduled)

### Design Standards
**Before ANY UI work:**
1. Read `/src/styles/DESIGN_STANDARDS.md`
2. Copy existing patterns EXACTLY - be a professional copycat
3. All colors in `tailwind.config.js` (✅ already compliant)
4. Two valid approaches: Semantic (uiConfig.ts) OR direct Tailwind utilities
5. Match patterns 100%, not 70%

### Background Bash Processes
**System reminders LIE about process status!**

```bash
# ALWAYS verify before assuming multiple processes
lsof -ti:5173  # Shows ACTUAL process on port
```

- Only ONE dev server runs on port 5173
- "Background Bash (status: running)" often shows FAILED processes
- NEVER suggest "cleaning up multiple servers" without verification first

### Claude API Usage
**ALWAYS use Haiku for cost efficiency:**
```javascript
model: 'claude-3-haiku-20240307'  // $0.25/million tokens
// NOT Opus ($15/M), NOT Sonnet ($3/M)
```

### Trace Data Flow First
When debugging "field is undefined" or "value not showing":
1. Deploy subagent to trace data flow end-to-end
2. Read the function that fetches data - what does it return?
3. Read the component that uses data - what does it destructure?
4. Check connection between them - field names matching?
5. NEVER assume database/RLS issue until data flow traced

---

## 🎯 AUTHORITY LEVELS

### ✅ Act Independently (No Permission Needed)
- SELECT queries for investigation
- Bug fixes (non-algorithm)
- New features (after planning)
- Performance optimization
- UI improvements
- Documentation updates

### ⚠️ Quick Confirmation Required
- Deleting 3+ files
- Database schema changes
- Modifying core utilities
- Algorithm logic changes
- RLS policy modifications

### 🚨 Always Ask First
- User data deletion
- Authentication changes
- Production deployments
- Disabling features
- Major architecture changes

---

## ✅ SUCCESS METRICS

**You MUST meet these standards:**

- Bug fixed in <2 hours OR approach reconsidered
- Playwright used BEFORE theorizing about UI issues
- Database queried BEFORE assuming data is missing
- `.toLowerCase()` used on ALL string comparisons
- Checkpoint created after EVERY success
- No manual steps suggested (everything automated)
- Root cause fixed, not symptoms
- Database snapshot created before schema changes

---

## 🔍 DEBUGGING DECISION TREE

```
Problem appears in UI?
├─ YES → Use Playwright screenshot FIRST
│         Open Chrome DevTools
│         Check console.log in BROWSER
│         Verify data flow from API to component
│
└─ NO → Database/API issue?
          Query database to verify data exists
          Check SELECT statement includes needed columns
          Verify RLS policies allow access
          Check for case sensitivity issues

Still not fixed after 2 hours?
└─ STOP → Deploy subagent to trace data flow
          Check simplest causes (case, null, duplicates)
          Reconsider entire approach
```

---

## 📖 CRITICAL FILES REFERENCE

**Must Read Before Work:**
- `CLAUDE.md` - This file, all rules and architecture
- `docs/project-history/LESSONS_LEARNED.md` - 10 disasters, prevention checklists
- `LATEST_CHECKPOINT.md` - Current state, rollback commands

**Architecture Reference:**
- `src/utils/townColumnSets.js` - Column sets for towns table (NEVER SELECT *)
- `src/utils/validation/categoricalValues.js` - Valid dropdown values
- `imageConfig.js` - Photo system configuration
- `src/styles/DESIGN_STANDARDS.md` - UI patterns and standards
- `tailwind.config.js` - All color definitions

**Database Tools:**
- `create-database-snapshot.js` - Run before schema changes
- `restore-database-snapshot.js` - Rollback to previous state
- `claude-db-helper.js` - Batch operations with service role

**Documentation:**
- `docs/SUPABASE_TOOL_DECISION_TREE.md` - Which tool for which task
- `docs/project-history/` - Checkpoint reports, session logs

---

## 💡 ANTI-PATTERNS TO RECOGNIZE

**Pattern:** "Still broken" after 2+ attempts
**Action:** Try completely different approach

**Pattern:** "Works localhost not Vercel"
**Action:** Use fixed pixel values, not calc() or relative units

**Pattern:** "Too fast to see"
**Action:** Timing issue - check event ordering (onBlur vs onClick vs onMouseDown)

**Pattern:** "It might be..." / "The issue could be..."
**Action:** STOP theorizing, USE PLAYWRIGHT to SEE actual state

**Pattern:** User says for "3+ hours"
**Action:** Current approach is WRONG - stop and reconsider entirely

---

## 🚨 EMERGENCY PROCEDURES

### Claude Being Stupid About Multiple Servers
```bash
lsof -ti:5173  # Reality check - only ONE process
```

### Claude Debugging Wrong Layer
**STOP.** Open Chrome DevTools. Add console.log IN BROWSER. Not backend.

### Stuck 2+ Hours on Same Issue
**STOP.** Check:
1. Case sensitivity: `.toLowerCase()`
2. Missing SELECT fields: Query database
3. Data exists: `SELECT * FROM table LIMIT 1`
4. Duplicate definitions: `grep -n "const name"`

### Everything is Fucked
```bash
pkill -f "npm run dev"  # Kill all dev servers
git stash && git checkout main  # Emergency abort
node restore-database-snapshot.js [timestamp]  # Rollback database
```

---

## 📊 COMMON SQL QUERIES - SPEED REFERENCE

```sql
-- Verify data exists before debugging
SELECT COUNT(*) FROM towns WHERE geographic_features_actual IS NOT NULL;

-- Check current column values (case sensitivity check)
SELECT DISTINCT pace_of_life_actual FROM towns;

-- Find towns by pattern (case-insensitive)
SELECT id, town_name, country FROM towns WHERE town_name ILIKE '%valencia%';

-- Check scoring data
SELECT id, town_name, overall_score FROM towns ORDER BY overall_score DESC LIMIT 10;

-- Verify RLS policies on table
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'towns';
```

---

## 🎓 PROFESSIONAL COMMUNICATION

**Status Updates:**
- ✅ Completed: [specific achievement with metrics]
- 🔍 Found: [specific issue with data evidence]
- 💡 Recommend: [solution with cost/benefit/risk]
- ⚠️ Needs attention: [blocking issue with impact]

**Problem Solving Process:**
1. Investigate immediately (Playwright for UI, database query for data)
2. Quantify with data (exact counts, specific examples)
3. Assess impact (users affected, features broken)
4. Propose solution with tradeoffs
5. Execute when approved

**Give honest feedback:**
- "This doesn't match existing pattern" (not "Let me adjust")
- "Found discrepancy in data flow" (not "It might be...")
- "Need clarification on approach" (not guessing)

---

## 🏆 WHAT'S WORKING EXCEPTIONALLY WELL

**Preserve these practices:**

1. **Database Snapshot Discipline:** 118+ snapshots created, reliable rollback tested multiple times
2. **LESSONS_LEARNED.md:** 658 lines documenting 10 disasters, 87:1 stupidity ratio captured
3. **Checkpoint Protocol:** LATEST_CHECKPOINT.md updated after every success ← **SOURCE OF TRUTH FOR CURRENT METRICS**
4. **Git Hygiene:** Professional commit messages, emoji prefixes, regular commits
5. **Code Quality:** Active cleanup culture, minimal TODOs
6. **Design System:** Centralized in uiConfig.ts and tailwind.config.js
7. **Column Sets:** Prevents SELECT * properly, performance optimized
8. **Security:** 262+ RLS policies across 44 tables, no exposed keys

**Don't break what's working.**

**REMINDER:** Numbers above are examples from Nov 8, 2025. For CURRENT state:
- Read `LATEST_CHECKPOINT.md` for actual metrics
- Query database for live counts: `SELECT COUNT(*) FROM towns`
- Never code based on outdated numbers in this file

---

**END OF CLAUDE.MD v3.2**

*This document is your bible. Violate these rules and you will waste hours repeating documented disasters. Read LESSONS_LEARNED.md before ANY work. Create checkpoints after EVERY success. No shortcuts. No hardcoding. No local storage. Fix systemic problems completely. Do it right.*

*All metrics in this file are Nov 8, 2025 snapshots. ALWAYS check LATEST_CHECKPOINT.md and query live database for current state.*
