# 🎯 SUPABASE TOOL DECISION TREE

## When Claude Needs to Interact with Supabase

This document answers: **"Which tool should I use?"**

---

## 🔧 AVAILABLE TOOLS

### 1. **MCP Server (Supabase Management API)**
- **Location**: Configured in `.vscode/mcp.json`
- **Authentication**: Personal Access Token
- **Capabilities**:
  - Project management (create/list projects)
  - Schema inspection
  - Generate TypeScript types
  - Run SQL queries
  - Manage branches
- **Best for**: Management tasks, schema exploration, ad-hoc queries

### 2. **JavaScript SDK (@supabase/supabase-js)**
- **Location**: `src/utils/supabaseClient.js`
- **Authentication**: Anon key (RLS applies) or Service Role key (bypass RLS)
- **Capabilities**:
  - CRUD operations
  - Realtime subscriptions
  - Auth operations
  - Storage operations
- **Best for**: Frontend code, automated scripts with Node.js

### 3. **Helper Scripts (Node.js with Service Role)**
- **Location**: `claude-db-helper.js`, `database-utilities/*.js`
- **Authentication**: Service Role key from `.env`
- **Capabilities**:
  - Run complex queries
  - Batch operations
  - Data migrations
  - Bypass RLS for admin tasks
- **Best for**: One-off investigations, data fixes, migrations

### 4. **Supabase CLI**
- **Location**: `npx supabase` commands
- **Authentication**: Project-linked via `supabase link`
- **Capabilities**:
  - Push migrations (`npx supabase db push`)
  - Generate types
  - Local development (not used in this project)
- **Best for**: Migration deployment

---

## 🎯 DECISION TREE

```
┌─ Need to query/inspect data?
│
├─ Yes → Is it for USER in the app?
│  │
│  ├─ Yes → Use **JavaScript SDK** (anon key, RLS applies)
│  │         File: src/utils/supabaseClient.js
│  │         Example: await supabase.from('towns').select(COLUMN_SETS.basic)
│  │
│  └─ No → Is it for CLAUDE to investigate/debug?
│     │
│     ├─ One-off query → Use **MCP Server**
│     │                   Say: "Use Supabase MCP to execute: SELECT id, name FROM towns LIMIT 10"
│     │
│     └─ Complex/batch operation → Use **Helper Script**
│                                    Modify: claude-db-helper.js
│                                    Run: node claude-db-helper.js
│
└─ No → Need to manage schema/migrations?
   │
   ├─ Deploy migration → Use **Supabase CLI**
   │                      Command: npx supabase db push
   │
   ├─ Inspect schema → Use **MCP Server**
   │                     Say: "Use Supabase MCP to get table schema for towns"
   │
   └─ Generate types → Use **Supabase CLI** or **MCP Server**

```

---

## 📋 COMMON SCENARIOS

### Scenario 1: "Check what data exists for town X"
**Tool**: MCP Server
**Command**: "Use Supabase MCP to execute: SELECT id, name, country, overall_score FROM towns WHERE name ILIKE '%valencia%' LIMIT 5"
**Why**: Quick one-off query, no code needed

### Scenario 2: "Fix 50 towns with wrong values"
**Tool**: Helper Script
**Steps**:
1. Modify `claude-db-helper.js` with batch UPDATE
2. Run: `node claude-db-helper.js`
**Why**: Batch operation with service role key, programmatic

### Scenario 3: "User searches for towns"
**Tool**: JavaScript SDK
**File**: src/components/TownSearch.jsx
**Code**:
```javascript
import { supabase } from '../utils/supabaseClient'
import { COLUMN_SETS } from '../utils/townColumnSets'

const { data } = await supabase
  .from('towns')
  .select(COLUMN_SETS.searchResults)
  .ilike('name', `%${searchTerm}%`)
  .limit(20)
```
**Why**: Frontend operation, RLS applies

### Scenario 4: "Deploy new migration"
**Tool**: Supabase CLI
**Command**: `npx supabase db push`
**Why**: Official migration workflow

### Scenario 5: "Investigate why field is undefined"
**Tool**: MCP Server (data check) + Playwright (UI check)
**Steps**:
1. Use Playwright to see what UI shows
2. Use Supabase MCP to query actual database values
3. Compare and find discrepancy
**Why**: End-to-end debugging across layers

---

## ⚠️ CRITICAL RULES

### NEVER:
- ❌ Use `SELECT *` with 170-column table
- ❌ Suggest "run this SQL in Supabase dashboard"
- ❌ Use service role key in frontend code
- ❌ Query without specifying column subset
- ❌ Make assumptions without checking actual data

### ALWAYS:
- ✅ Use column sets from `townColumnSets.js`
- ✅ Verify data with MCP/Playwright before debugging
- ✅ Use `.toLowerCase()` on string comparisons
- ✅ Check for duplicate variable definitions
- ✅ Write programmatic fixes, not manual steps

---

## 🔍 VERIFICATION CHECKLIST

Before ANY Supabase operation:
- [ ] Which tool is appropriate? (see decision tree)
- [ ] Which columns do I need? (use COLUMN_SETS)
- [ ] Is this frontend (anon key) or backend (service role)?
- [ ] Have I verified the actual data first?
- [ ] Am I debugging the correct layer (UI vs backend vs database)?

---

## 📊 PERFORMANCE GUIDELINES

### Large Table (400 rows, 170 columns)
- **Minimal queries**: Use `COLUMN_SETS.minimal` (4 columns)
- **List views**: Use `COLUMN_SETS.basic` (8 columns)
- **Detail views**: Use `COLUMN_SETS.fullDetail` (~50 columns) - sparingly!
- **Custom needs**: Use `combineColumnSets('basic', 'climate')`

### Query Limits
- **Search/browse**: LIMIT 20-50
- **Debugging**: LIMIT 5-10
- **Single town**: .eq('id', townId) .single()

---

## 🎓 EXAMPLES FROM LESSONS_LEARNED.MD

### Case Sensitivity Disaster (40 hours wasted)
**Wrong**: Assumed database issue, rebuilt scoring system
**Right**: Use Supabase MCP to SELECT actual values, compare with `.toLowerCase()`

### Duplicate Definition (3 hours wasted)
**Wrong**: Blamed RLS/permissions
**Right**: Use Supabase MCP to verify SELECT returns data, then check frontend code

### Admin Scoring (3 hours wasted)
**Wrong**: Modified wrong table
**Right**: Use Supabase MCP to inspect both `users` and `user_preferences` schemas first

---

**Last Updated**: 2025-10-06
**Maintainer**: Tilman Rumpf
**Claude**: Read this BEFORE every Supabase interaction
