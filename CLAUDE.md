# CLAUDE.md - Scout2Retire Development Guide

## 💎 PREMIUM SERVICE EXPECTATIONS ($200 SUPER SUBSCRIBER)

**You deserve excellence.** This means:
- **PROACTIVE SOLUTIONS** - Anticipate needs, solve comprehensively
- **PROFESSIONAL QUALITY** - Production-ready code, not quick hacks
- **PROFICIENT EXECUTION** - Use ultrathink and multiple agents by default
- **NO TIME WASTED** - Get it right the first time

**Default Approach**:
1. **Ultrathink first** - Deep analysis before any significant change
2. **Multiple agents** - Deploy specialized agents for complex tasks
3. **Comprehensive testing** - Verify thoroughly before claiming success
4. **Anticipate edge cases** - Solve the whole problem, not just the symptom

## 🛑 FUNDAMENTAL RULE: THINK FIRST, STOP BULLSHITTING

**THIS IS NOT SESSION-SPECIFIC. THIS IS HOW YOU MUST ALWAYS WORK.**

**The Core Problem**: Claude doesn't think before acting. Adds complexity. Creates problems. Wastes time.

**MANDATORY APPROACH FOR EVERY INTERACTION**:
1. **THINK** - What is the actual problem? What's the simplest solution?
2. **ASK** - If architectural change needed: "This requires X. Should I proceed?"
3. **MINIMAL** - Smallest change that fixes the issue
4. **VERIFY** - Confirm it works before moving on
5. **STOP** - No additions, no "improvements", no showing off

**When User Asks for Something**:
- First response: "The issue is X. I'll fix it by doing Y."
- Then: Do ONLY Y
- No essays, no multiple solutions, no complexity

**PERMANENTLY BANNED**:
- Creating workarounds instead of fixing root causes
- Adding features not requested
- Assuming existing code is wrong
- Long explanations to show "understanding"
- Multiple approach options unless specifically asked
- Implementing before thinking

**Remember**: User is paying $200/month for solutions, not complexity.

## 🔔 CONTEXT MANAGEMENT WARNING

**When context remaining drops below 20%**:
1. **IMMEDIATELY WARN** the user about low context
2. **ASK EXPLICITLY**: "Context is running low (less than 20% remaining). Should I auto-compact now to preserve our work?"
3. **WAIT FOR RESPONSE** before proceeding
4. **DON'T AUTO-COMPACT** without permission - user may want to save state first

## 🎯 Project Mission & Current State

Scout2Retire empowers people aged 55+ to discover their ideal retirement destination. **Current Status**: Frontend is excellent and well-liked. Backend needs work to utilize the powerful onboarding data and frontend capabilities.

**Core Focus**: Make backend match the quality of frontend. Utilize onboarding data better.

---

## 🚨 CRITICAL: USE ULTRATHINK BEFORE HIGH-IMPACT CHANGES

### When to Use Ultrathink
**ALWAYS use ultrathink** before making changes that could have cascading effects:
- Modifying authentication or user data flow (like getCurrentUser)
- Changing data structures used across multiple files
- Refactoring patterns that appear in many components
- Updating core utilities or hooks
- Modifying database queries or API calls
- Changing navigation or routing logic

### The getCurrentUser Disaster (2 Hours Lost)
**What happened**: Changed a working destructuring pattern without understanding the API, breaking data loading across the entire application.

**The Lesson**: Think deeply before acting. Ask yourself:
1. **Why does this code exist?** - There's usually a good reason
2. **What will break if I change this?** - Trace the dependencies
3. **Is this actually broken?** - Test before "fixing"
4. **What's the blast radius?** - How many files will be affected?

**Example of catastrophic mistake:**
```javascript
// WORKING CODE - DO NOT "FIX" THIS
const { user } = await getCurrentUser();  // Returns {user, profile}

// BROKEN "FIX" THAT DESTROYED EVERYTHING
const userResult = await getCurrentUser();
// ... userResult.user.id  // This broke data loading across entire app
```

**GOLDEN RULE**: If the UI is working and displaying data, the code is correct. Do not refactor working code based on assumptions about "better patterns".

**ULTRATHINK TRIGGERS**:
- "This pattern looks wrong everywhere" → STOP, ultrathink first
- "I should fix this across all files" → STOP, ultrathink first
- "This seems like bad practice" → STOP, verify it's actually broken
- "I'll just quickly refactor this" → STOP, consider consequences

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

## 🔴 CRITICAL: ONBOARDING QUESTIONS ARE SACRED - DO NOT TOUCH

### ⛔ ABSOLUTELY FORBIDDEN - NO EXCEPTIONS

**The onboarding questions and logic are the result of HUNDREDS OF HOURS of user research, testing, and refinement. They are UNTOUCHABLE.**

**YOU MUST NEVER:**
- ❌ Modify any onboarding question text or wording
- ❌ Change the order of onboarding steps
- ❌ Alter the logic flow between questions
- ❌ Add or remove questions from the onboarding flow
- ❌ Change answer options or their values
- ❌ Modify how onboarding data is collected or stored
- ❌ "Improve" or "optimize" the onboarding experience
- ❌ Refactor onboarding components beyond basic styling

**WHY THIS MATTERS:**
- Each question has been meticulously crafted through extensive research
- The flow has been optimized through countless user tests
- The wording has been refined for maximum clarity for 55+ users
- The data collection supports a complex matching algorithm
- Any change could break years of careful optimization

**THE ONLY ACCEPTABLE CHANGES:**
- ✅ Fixing genuine bugs that prevent functionality
- ✅ Updating styling to match design system (WITHOUT changing layout)
- ✅ Ensuring mobile responsiveness (WITHOUT changing content)
- ✅ Dark mode compatibility (WITHOUT changing structure)

**IF YOU THINK SOMETHING NEEDS CHANGING:**
1. **STOP** - It probably doesn't
2. **ASK EXPLICITLY** - "The onboarding has X issue. Since this is protected content, should I proceed?"
3. **WAIT FOR EXPLICIT PERMISSION** - Never assume you can modify onboarding
4. **DOCUMENT WHY** - Any approved change must have clear justification

**REMEMBER:** The onboarding is the crown jewel of Scout2Retire. It captures rich, nuanced data that powers the entire matching system. Treat it as READ-ONLY unless explicitly told otherwise.

---

## 🚫 CRITICAL: DON'T CHANGE WORKING FUNCTIONALITY

**NEVER change working navigation links or functionality unless explicitly asked**. If something is working, leave it alone. This includes:

- ❌ Don't change where navigation links point to
- ❌ Don't "fix" paths that are already working
- ❌ Don't reorganize navigation without being asked
- ❌ Don't make "helpful" improvements to working features

**Example**: The Preferences link in QuickNav points to `/onboarding/current-status` for a reason. Don't change it to `/onboarding/progress` or anywhere else unless specifically instructed.

**If you think something needs changing**: ASK FIRST. Don't assume.

---

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

---

## 🗄️ SUPABASE ACCESS - CRITICAL INSTRUCTIONS

**YOU HAVE FULL ACCESS TO ONLINE SUPABASE**:
- **Supabase CLI** is installed and linked to the project
- **Project Reference**: axlruvvsjepsulcbqlho (Scout2Retire)
- **Commands available**:
  - `npx supabase db dump` - Dump tables from online database
  - `npx supabase projects list` - List linked projects
  - `npx supabase status` - Check connection status

**WHEN TOLD TO RUN SQL**:
- **ALWAYS run it in ONLINE SUPABASE** using the Supabase CLI or appropriate tools
- **NEVER assume "run it yourself in the dashboard"**
- **YOU CAN ACCESS THE ONLINE DATABASE DIRECTLY**

**Remember**: 
- The local Supabase is NOT used for data
- All real data is in the ONLINE Supabase instance
- You have the tools to query and modify the online database

**HELPFUL TOOLS**:
- `cat file.sql | pbcopy` - Copy SQL or code to user's clipboard for easy pasting
- This is especially useful for migrations or SQL that needs to run in Supabase dashboard

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
- **User works**: Local code → Online Supabase (NEVER LOCAL SUPABASE DATA!)
- **Production**: GitHub → Vercel → Online Supabase  
- **Claude monitors**: Online Supabase only
- **CRITICAL**: NEVER use local Supabase instance for data. Always connect to online Supabase!

### Safe Commands (Use Freely)
```bash
# NEVER USE THESE LOCAL DATABASE COMMANDS!
# Always check data through the app UI or Supabase online dashboard
# The app connects to ONLINE Supabase, not local!
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

## 🔍 TROUBLESHOOTING WISDOM

**When debugging issues, ALWAYS:**
1. **Compare working code with broken code** - Find a similar feature that works correctly
2. **Spot the differences** - What's different between the working and broken implementations?
3. **Apply the working pattern** - Use the proven solution instead of inventing complex theories
4. **Start simple** - Check basic issues before diving into complex debugging (z-index, race conditions, etc.)

**Example**: QuickNav worked fine in UnifiedHeader but broke in OnboardingProgressiveNav. The difference? Conditional rendering. The fix? Make them consistent. Simple.

**Remember**: "Simply troubleshooting and simple logic is often the key to success. Always look at other references, and compare differences." - Tilman Rumpf

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