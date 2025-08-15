Scout2Retire Development Guide - v2.2
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