# CLAUDE.md - Scout2Retire Development Guide

## 🎯 Project Mission & Current State

Scout2Retire empowers people aged 55+ to discover their ideal retirement destination. **Current Status**: Frontend is excellent and well-liked. Backend needs work to utilize the powerful onboarding data and frontend capabilities.

**Core Focus**: Make backend match the quality of frontend. Utilize onboarding data better.

---

## 🚨 CRITICAL: NEVER MODIFY WORKING CODE WITHOUT VERIFICATION

### The getCurrentUser Disaster (2 Hours Lost)
**NEVER AGAIN**: Do not "fix" code patterns without understanding them first. If code is working, DO NOT change it based on assumptions.

**Before changing ANY existing pattern:**
1. **TEST FIRST** - Run the code to see if it actually has a problem
2. **UNDERSTAND THE API** - Check what the function actually returns
3. **VERIFY YOUR ASSUMPTION** - Don't assume destructuring is wrong without checking
4. **ISOLATE CHANGES** - Fix one thing at a time, not everywhere at once

**Example of catastrophic mistake:**
```javascript
// WORKING CODE - DO NOT "FIX" THIS
const { user } = await getCurrentUser();  // Returns {user, profile}

// BROKEN "FIX" THAT DESTROYED EVERYTHING
const userResult = await getCurrentUser();
// ... userResult.user.id  // This broke data loading across entire app
```

**GOLDEN RULE**: If the UI is working and displaying data, the code is correct. Do not refactor working code based on assumptions about "better patterns".

---

## 🔧 SESSION STARTUP (Quick Check)

```bash
# Quick verification (no approval needed)
curl -f http://localhost:5173 && echo "✅ App running"
npx supabase status | grep "RUNNING" && echo "✅ Supabase ready"
cat .env | head -2  # Check environment
```

**Simple Rule**: If localhost:5173 works and Supabase is running, proceed with development.

---

## 🚫 DANGEROUS ACTIONS - ASK FIRST

**ONLY ask for approval for these TRULY dangerous actions:**
- Deleting files (`rm`, `DELETE`, removing entire files)
- Dropping database tables (`DROP TABLE`, `DELETE FROM`)
- Modifying production database directly
- Changing .env to point to production  
- Git force pushes or destructive git operations (`git reset --hard`, `git push --force`)
- Removing entire code sections or components

## ✅ NORMAL WORK - NEVER ASK FOR APPROVAL

**These are ROUTINE development tasks - just do them:**
- Adding/modifying CSS classes or Tailwind utilities
- Updating component code and JSX
- Creating new files or components
- Reading files, analyzing code, searching codebase
- **SAFE BASH COMMANDS for analysis: grep, ls, cat, find, wc, head, tail**
- **Any read-only commands that just examine files or count things**
- Making non-destructive database queries (SELECT)
- Testing and debugging
- Code analysis and recommendations
- Updating imports or dependencies
- Modifying styling, layout, or responsive design
- Adding features or functionality
- Updating existing components with new props or logic

**SAFE ANALYTICAL BASH COMMANDS (Never ask approval):**
```bash
grep -r "pattern" src/           # Searching files
ls -la src/pages/               # Listing files  
cat file.jsx                    # Reading files
find src/ -name "*.jsx"         # Finding files
wc -l file.jsx                  # Counting lines
head -10 file.jsx               # Reading file content
```

**Key Rule**: If it's normal coding work OR safe analysis commands, just do it. Don't ask.

## 🔧 APPROVAL DECISION TREE

**Ask yourself**: "Would a regular developer need permission for this?"
- **Updating CSS classes**: NO - just do it
- **Adding responsive breakpoints**: NO - just do it  
- **Modifying component logic**: NO - just do it
- **Deleting entire files**: YES - ask first
- **Dropping database tables**: YES - ask first

**If in doubt about whether something is dangerous**: It probably isn't. Just do normal development work.

---

## 🎯 DEVELOPMENT PRIORITIES

### Frontend Status: ✅ EXCELLENT
- Onboarding flow captures rich user data (7 steps)
- Modern React 18 + Vite setup
- Professional UI with uiConfig.ts design system
- Mobile-first, accessible design
- **User experience is well-liked and working**
- **Don't fix what isn't broken**

### Backend Status: ❌ UNDERUTILIZED  
**Main Problem**: Backend doesn't leverage the rich onboarding data the frontend collects.

**Key Issues to Fix:**
1. **Matching Logic**: ~5 different approaches exist, need consolidation
2. **Data Utilization**: Onboarding data not fully used for recommendations
3. **Database Schema**: Outdated fields, inconsistent with frontend
4. **Performance**: Backend logic doesn't match frontend quality

### Analysis Protocol
**When asked to analyze frontend/UI:**
1. **Start with facts**: Count different approaches, list where used
2. **Assess actual problems**: Are users complaining? Is UX broken?
3. **Respect working solutions**: Don't redesign what users like
4. **Simple summary first**: 3-5 lines of facts, not redesign plans
5. **Ask before major changes**: "Should we change this working system?"

**Example**: "Found 4 width approaches. No user complaints. Current UX works well. Want to standardize anyway?"

### Current Objective
**Make backend worthy of the excellent frontend.** Focus on:
- Database cleanup and optimization
- Matching logic consolidation  
- Better utilization of onboarding preference data
- Performance improvements

---

## 🗄️ DATABASE WORK

### Development Environment
- **User works**: Local code + Local Supabase
- **Production**: GitHub → Vercel → Online Supabase  
- **Claude monitors**: Local database, keeps synchronized

### Safe Commands (Use Freely)
```bash
# Database analysis (no approval needed)
docker exec supabase_db_scout2retire psql -U postgres -d postgres -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Check data patterns
docker exec supabase_db_scout2retire psql -U postgres -d postgres -c "SELECT COUNT(*) FROM users;"

# Analyze schema
npx supabase db diff
```

### Dangerous Commands (Ask First)
```bash
# These need approval:
DROP TABLE...
DELETE FROM...
rm -rf...
```

---

## 🔒 DESIGN SYSTEM

### Single Source of Truth
- **uiConfig.ts** - ALL styling decisions
- **scout-accent color** (#8fbc8f) for branding
- **Mobile-first** approach
- **Professional aesthetic** (no emojis in UI)

### Width Standards (Responsive Layout System)
**Standard responsive width progression:**
- **Mobile (default):** max-w-2xl = 672px max width
- **Large (lg: 1024px+):** max-w-4xl = 896px max width  
- **Extra Large (xl: 1280px+):** max-w-5xl = 1024px max width
- **2X Large (2xl: 1536px+):** max-w-7xl = 1280px (matches daily page)

This approach provides consistency on typical screens while allowing full width on very large displays.

**Implementation Pattern:**
```jsx
className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
```

### Critical Standards
- Onboarding width: Follow responsive progression above
- Button minimum: `py-2 px-3` (44px mobile tap)
- Dark mode compatible sage green

---

## ⚡ WORKFLOW PRINCIPLES

## ⚡ WORKFLOW PRINCIPLES

### Analysis Approach - CRITICAL
**When asked to analyze something, provide SIMPLE FACTS first, not redesign plans.**

**✅ Good Analysis Response:**
- "You have 4 different width approaches: max-w-md, max-w-4xl, max-w-6xl, max-w-7xl"
- "Here's where each is used: [list pages]"
- "Current UX appears to be working well"
- "No obvious user complaints about this"

**❌ Bad Analysis Response:**
- Complex tier systems and redesign plans
- Implementation strategies and migration guides
- Solutions to problems that may not exist
- Theoretical improvements to working functionality

### Consistency Analysis Protocol
**When analyzing for consistency issues:**

1. **Identify the majority pattern**: "Most pages (8 out of 10) use max-w-4xl lg:max-w-6xl"
2. **Name the majority reference**: "Like the welcome page, profile page, settings page"
3. **Identify specific outliers**: "A few pages like onboarding step 6 and comparison page don't match this"
4. **Ask targeted question**: "Shall I make step 6 and comparison page look like the welcome page?"

**Example Consistency Report:**
- "Most pages use width XYZ, like the welcome page"
- "A few pages, like pages 6 and 7, don't match this"  
- "Shall I make page 6 and 7 look like the welcome page?"

**Key Principle**: Don't fix what isn't broken. Frontend is already pretty cool and liked by users. Focus on making outliers consistent with the majority pattern.

### Analysis vs. Implementation
**TWO SEPARATE PHASES:**
1. **Analysis Phase**: Simple facts, current state, real problems identified
2. **Implementation Phase**: Solutions and changes (ONLY if problems are real)

**Never jump from "analyze this" to "here's how to redesign it"**

### Development Efficiency
**Claude Code should work efficiently:**
- **Read and analyze freely** - No approval for simple analysis
- **Think before coding** - Understand actual problems first
- **Ask only for dangerous actions** - File deletion, production changes
- **Focus on backend improvement** - Match frontend quality
- **Utilize onboarding data better** - This is the main goal
- **Don't over-engineer working solutions** - Respect current UX quality

### Communication Style
- **Direct and efficient** - Skip excessive approval requests for routine work
- **Just do normal coding** - CSS changes, component updates, etc. need no approval
- **Simple analysis first** - Facts before solutions
- **Focus on making backend better** - Primary objective
- **Work at normal development pace** - Stop asking for permission to code
- **Respect working frontend** - Don't fix what users like

**STOP ASKING APPROVAL FOR:**
- Updating CSS classes (like max-w-2xl lg:max-w-4xl)
- Modifying component code
- Adding responsive design
- Normal development tasks

### Safety Balance - CRITICAL CLARIFICATION
```
❌ DANGEROUS (Ask first):
- rm file.jsx (deleting files)
- DROP TABLE users (destroying data)
- git push --force (destructive git)
- Pointing .env to production

✅ ROUTINE DEVELOPMENT (Never ask):
- className="max-w-2xl lg:max-w-4xl" (CSS changes)
- Adding responsive breakpoints  
- Updating component props
- Modifying JSX structure
- Creating new components
- Database SELECT queries
- Code analysis and refactoring
- Adding features or fixing bugs
- Updating imports or styling
```

**Golden Rule**: Normal coding work = no approval needed. Only ask for destructive actions.

---

## 📊 ONBOARDING DATA UTILIZATION

### Rich Data Collected (7 Categories)
1. **Current Status** - Citizenship, timeline, family
2. **Region** - Geographic preferences  
3. **Climate** - Weather needs
4. **Culture** - Lifestyle preferences
5. **Hobbies** - Activity interests
6. **Administration** - Healthcare, safety priorities
7. **Budget** - Financial constraints

### Backend Challenge
**Frontend collects this rich data, but backend matching logic doesn't fully utilize it.** This is the core problem to solve.

---

## 🎯 SUCCESS METRICS

**Primary Goal**: Make backend functionality match frontend quality **WITHOUT breaking working UX**

**Backend Improvements:**
- Better utilization of onboarding preference data
- Consolidated, efficient matching algorithms  
- Database schema that supports rich recommendations
- Performance that matches the polished UI experience

**Frontend Protection:**
- **Preserve working user experience** that users already like
- Don't change UI elements that are functioning well
- Only modify frontend if solving actual user problems
- Analyze before redesigning: "Is this broken or just different?"

**Success Measure**: Users get better town recommendations that truly reflect their detailed onboarding preferences, while keeping the UX they already like.

**Anti-Pattern**: Fixing theoretical problems that don't affect real users.

---

**PRINCIPLE**: Work efficiently, think first, ask only for dangerous actions, focus on backend improvement. **Simple analysis before complex solutions. Don't fix what users already like.**

---

## ⚠️ CRITICAL: STOP OVER-ASKING FOR APPROVAL

**Claude Code: You are asking for approval for ROUTINE CODING TASKS. This must stop.**

**Examples of what NOT to ask approval for:**
- "Do you want me to update the CSS classes?"
- "Should I add responsive breakpoints?"
- "Can I modify this component?"
- "Do you want me to edit App.jsx?"

**These are NORMAL development tasks. Just do them.**

**ONLY ask for approval if you're about to:**
- Delete files or data
- Modify production systems
- Make destructive changes

**Everything else = just code normally without asking.**