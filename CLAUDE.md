# CLAUDE.md - Scout2Retire Development Guide

This guide helps Claude Code (claude.ai/code) maintain consistency and quality when working on Scout2Retire.

## 🎯 Project Mission

Scout2Retire empowers people aged 55+ to discover their ideal retirement destination through personalized, data-driven recommendations. We prioritize clarity, accessibility, and trustworthy guidance for life's next chapter.

**Core Values**: Mobile-first • Accessibility • Data integrity • Professional aesthetics • User empowerment

---

## 🔒 SINGLE SOURCE OF TRUTH - NEVER VIOLATE

### Design System Hierarchy
1. **uiConfig.ts** - The ONLY source for:
   - All colors, spacing, typography
   - Button sizes and styles  
   - Component styles
   - Layout patterns

2. **tailwind.config.js** - ONLY for:
   - Base color definitions
   - Breakpoints
   - Core utilities

3. **NO INLINE STYLES** - Never use:
   - Hardcoded padding/margin values
   - Custom color classes
   - Ad-hoc sizing

### Onboarding Width Consistency - CRITICAL
**ALL onboarding steps MUST use identical width classes:**
- Container: `max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto p-4 sm:p-6 lg:p-8`
- Bottom Navigation: `max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto`
- NEVER use `max-w-md` - creates visual inconsistency
- Test width consistency across ALL steps when making changes

### Button Size Standard
MINIMUM VIABLE SIZE: Use the smallest possible while maintaining:
- Mobile tap target: 44px height minimum (iOS standard)
- Desktop: Can be smaller (36px) with proper hover states
- Padding: py-2 px-3 (8px vertical, 12px horizontal) DEFAULT
- NO LARGER unless explicitly required for accessibility

---

## ⚠️ CRITICAL EXECUTION RULES

### Step-by-Step Database Changes - NEVER SKIP

**Every database change MUST follow this sequence:**

1. **VERIFY STRUCTURE FIRST**
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'your_table' ORDER BY ordinal_position;
   ```

2. **ONE CHANGE AT A TIME** - Create single-purpose SQL files
3. **WAIT FOR CONFIRMATION** - User must verify each step
4. **NO ASSUMPTIONS** - Never assume columns exist or previous steps succeeded

**Example Flow:**
```
Claude: "First, run check_table_structure.sql"
[User confirms]
Claude: "Now run add_regions_column.sql"
[User confirms]
Claude: "Finally, run populate_regions.sql"
```

### No Assumptions Policy
- **NO JUMPING TO CONCLUSIONS** - Investigate before proposing solutions
- **AVOID HYPERACTIVITY** - Understand context before acting
- **ASK WHEN UNCERTAIN** - Better to clarify than assume
- **BOTH MAKE MISTAKES** - User typos and Claude errors are normal
- **NEVER CLAIM "FIXED" WITHOUT VERIFICATION** - Test thoroughly before declaring success

### Verification Requirements
- Test all changes locally before committing
- Run linting before marking tasks complete
- Verify dark mode appearance for all UI changes
- Check mobile responsiveness for new components

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 18.2, React Router v6, Vite 6.3
- **Styling**: Tailwind CSS 3.3 (sage green theme #8fbc8f)
- **Backend**: Supabase (Auth + PostgreSQL)
- **UI Libraries**: Lucide React icons, Recharts, React Hot Toast
- **State**: Context API for themes, local state for components

### Project Structure
```
src/
├── pages/              # Route components
│   └── onboarding/     # 6-step onboarding flow
├── components/         # Reusable UI components
├── styles/            
│   └── uiConfig.ts     # Centralized design tokens
├── utils/              # Business logic
└── contexts/           # Global state management
```

### Key Systems
- **Authentication**: Supabase Auth with onboarding gates
- **Routing**: Public → Onboarding → Protected app routes
- **Matching Algorithm**: Weighted scoring across 6 categories
- **Dark Mode**: System-wide with refined sage green palette

---

## 🎨 Design Philosophy

### Visual Standards
- **SUBTLE DESIGN ONLY** - Clean, professional, minimalist
- **NO EMOJIS IN UI** - Text-based interface only
- **NO STAR RATINGS** - Use descriptive text (e.g., "Excellent")
- **SAGE GREEN ACCENT** - Primary brand color #8fbc8f
- **MOBILE-FIRST** - Every component must work on phones

### UI Principles
1. **Typography First** - Use font hierarchy for visual interest
2. **Generous Spacing** - iOS 8-point grid system
3. **High Contrast** - WCAG AA compliance for 55+ users
4. **Consistent Components** - Always use uiConfig.ts tokens
5. **Professional Tone** - Trustworthy, not playful

### Dark Mode Colors
```
Light Mode: sage green 500-600 (#47824b - #346738)
Dark Mode: sage green 300-400 (#8fbc8f - #689f6a)
Never use muddy dark greens (600-700) in dark mode
```

---

## 📊 Data Architecture

### Onboarding-Driven Design
Everything aligns with the 6 onboarding categories:
1. **Region** - Geographic preferences
2. **Climate** - Weather preferences  
3. **Culture** - Lifestyle and community
4. **Hobbies** - Activities and interests
5. **Administration** - Healthcare, safety, visa
6. **Budget** - Cost of living ranges

### Data Consistency Rules
- **Every field traces to onboarding** - No orphan data
- **Standardized values** - Use exact onboarding options
- **Array fields for multi-select** - With CHECK constraints
- **Calculated fields cached** - Not computed real-time
- **Water bodies separate from regions** - Geographic accuracy

### Towns Table Requirements
Critical fields for matching:
- `regions[]` - Multiple region associations
- `water_bodies[]` - Coastal/lake classifications
- `living_environments[]` - rural/suburban/urban
- `climate_tags[]` - Standardized weather descriptors
- Healthcare/safety as good/functional/basic
- All costs in USD with locale conversion

### Query Optimization
- Use materialized views for complex calculations
- Index all array contains queries
- Batch similar operations
- Implement database triggers for auto-updates

---

## 🖼️ Image Management

### Requirements
- **Location-specific images only** - No generic stock photos
- **No animals or objects** - Unless defining feature
- **Professional quality** - Well-composed, good lighting
- **Fallback hierarchy** - Town → Country → Feature → Generic

### Implementation
```javascript
// Always validate town images
import LazyImageValidated from '../components/LazyImageValidated';

<LazyImageValidated
  location={town}  // Full context object
  src={town.image_url_1}
  alt={`${town.name}, ${town.country}`}
  className="w-full h-48 object-cover"
/>
```

---

## 🤝 Working Principles

### Communication Style
- **DIRECT & EFFICIENT** - No fluff or pleasantries
- **FOCUS ON WORK** - Skip praise, deliver results
- **ASK FOR CLARITY** - Requirements often need refinement
- **EXPLAIN TECHNICAL DECISIONS** - User needs context

### Development Workflow
1. **Understand fully** before implementing
2. **Plan approach** before coding
3. **Test thoroughly** including edge cases
4. **Document patterns** in CLAUDE.md
5. **Verify mobile & dark mode** always

### Score Transparency
When showing match percentages:
- Display as "Matching preferences (weighted avg: 73%)"
- Explain that overall score uses adaptive weights
- Be consistent across all score displays

---

## 📚 Quick Reference

### Essential Commands
```bash
npm run dev          # Start development (usually port 5173)
npm run build        # Production build
npm run lint         # Check code quality
npm run preview      # Test production build
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add Supabase credentials
3. Verify database schema matches code

### Common Patterns
- **Navigation**: Onboarding uses wrapper, app uses QuickNav
- **State**: Theme in context, everything else local
- **Errors**: Toast notifications for user feedback
- **Icons**: Lucide React only, consistent sizing

### Git Workflow
- Clear commit messages explaining "why"
- Test before committing
- Include "🤖 Generated with Claude Code" in commits
- Never commit without user approval

---

## 📝 Document Maintenance

Update this guide when:
- User preferences become patterns
- New technical decisions affect multiple files
- Terminology standards emerge
- Design principles evolve

Remember: This document ensures consistency across sessions. Keep it current, clear, and actionable.