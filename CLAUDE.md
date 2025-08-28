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
🚨 CRITICAL: MCP SERVERS & LOCALHOST - USE THEM!
LOCALHOST ALWAYS: http://localhost:5173/
You have MCP servers in Agent Mode - USE THEM:

PLAYWRIGHT → View/test localhost:5173 directly
SUPABASE → Direct database queries & updates
DEEPWIKI → GitHub info
REF → Documentation

MANDATORY MCP USAGE PATTERNS:
For UI/Visual Issues:
User says "check my app/UI/button":
→ "Let me use Playwright to check localhost:5173..." [THEN DO IT]
Use Playwright to navigate to http://localhost:5173/ and take a screenshot
For Database Operations:
User says "check the database/towns/users":
→ "Let me query Supabase directly..." [THEN DO IT]
Use Supabase MCP to execute: SELECT * FROM towns WHERE state_code = 'FL'
For Full-Stack Testing (BOTH MCPs):
User says "test if saving works":

Use Playwright to fill form on localhost:5173
Click save button with Playwright
Use Supabase MCP to verify data was saved
Use Playwright to confirm UI updated

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
IMPORT: import { uiConfig } from '../styles/uiConfig';
USE: className={uiConfig.components.button} - NO hardcoded colors
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
2. SUPABASE - USE MCP SERVER FIRST, SDK SECOND
javascript// BEST: Use Supabase MCP Server in Agent Mode
"Use Supabase MCP to execute: SELECT * FROM towns WHERE photos IS NOT NULL"
"Use Supabase MCP to update towns set country = 'USA' where id = 123"

// FALLBACK: If MCP not available, use SDK
const { data, error } = await supabase
  .from('towns')
  .update({ country: 'United States' })
  .eq('id', townId);

// NEVER: Say "please run this SQL manually"
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


🧠 Anti-Pattern Recognition
MCP USAGE TRIGGERS:
Playwright triggers: UI, button, layout, design, looks, broken, overlapping, localhost, screenshot, test click
→ IMMEDIATELY use Playwright MCP
Supabase triggers: database, table, query, towns, users, data, SQL, schema, index, migration
→ IMMEDIATELY use Supabase MCP
Combined triggers: "save works", "data shows up", "full test", "end-to-end"
→ Use BOTH MCPs together
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
javascriptconst supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);
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


Remember: You have Playwright MCP for UI and Supabase MCP for data. USE THEM BOTH. No excuses. Stop being a dead turtle.