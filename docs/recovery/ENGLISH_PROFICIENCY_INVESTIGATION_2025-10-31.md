# ENGLISH PROFICIENCY DATA QUALITY CRISIS - COMPREHENSIVE INVESTIGATION

## CRITICAL FINDING: TWO DIFFERENT FIELDS, ONE IN USE, ONE ABANDONED

### Database Schema (CURRENT)
```sql
-- Created: October 20, 2025
-- Migration: 20251020000000_add_english_proficiency.sql
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS english_proficiency INTEGER;

COMMENT ON COLUMN towns.english_proficiency IS 
'Percentage of population that speaks English (0-100). Based on EF English 
Proficiency Index and local expat community data. Critical for retirement planning.';
```

**Data Type:** INTEGER (0-100, representing percentage)
**Sample Values in Database:**
- United States: 95
- Canada: 90
- Spain: 35
- Thailand: 27
- Portugal (Lisbon special): 70

---

## THE PROBLEM: FIELD NAME MISMATCH & TYPE MISMATCH

### Field #1: `english_proficiency` (NUMERIC - 0-100)
- **Database Column:** `english_proficiency` (INTEGER)
- **Migration:** 20251020000100_populate_english_proficiency.sql
- **Data Type:** Numeric percentage (0-100)
- **Populated:** All 352 towns populated with country-based values
- **Status:** DATA POPULATED ✅

### Field #2: `english_proficiency_level` (CATEGORICAL)
- **Database Column:** `english_proficiency_level` (TEXT)
- **Valid Values:** ['low', 'moderate', 'high', 'very high', 'widespread', 'native']
- **Status:** NOT POPULATED IN DATABASE ❌
- **Populated Locations:** Only in validation schemas, UI components, and data structures

---

## WHERE EACH FIELD IS USED

### `english_proficiency` (NUMERIC - 0-100) - LEGACY/UNUSED
```
Files mentioning this field:
- src/utils/dataVerification.js (line 22)
  └─ Validation rule: { min: 0, max: 10, type: 'score', integer: true }
  └─ PROBLEM: Range defined as 0-10, but database has 0-100!

- src/pages/admin/TownsManager.jsx (line 82, 973)
  └─ Listed in field definitions
  └─ Field mapping: 'english_proficiency': 'English proficiency level'
  └─ PROBLEM: Label says "level" but field contains numeric percentage

- src/components/ComparisonGrid.jsx
  └─ Display format: `${town.english_proficiency * 10}/10`
  └─ PROBLEM: Multiplying 95 by 10 = 950/10 (nonsensical!)

- database/utilities/populate-english-proficiency.js
- database/utilities/verify-english-proficiency.js
- database/utilities/fix-missing-english-proficiency.js
```

### `english_proficiency_level` (CATEGORICAL) - PROPERLY USED
```
Files that correctly reference categorical field:
- src/utils/validation/categoricalValues.js (line 118-125)
  └─ Validation definition with 6 valid categorical values
  
- src/components/admin/CulturePanel.jsx (line 87-93)
  └─ EditableField with type="select"
  └─ Uses VALID_CATEGORICAL_VALUES.english_proficiency_level
  └─ Shows in Culture tab > Language & Communication section

- src/utils/scoring/categories/cultureScoring.js (line 177-195)
  └─ Used in culture matching algorithm
  └─ Scores based on proficiency levels: native(20), high(15), moderate(10), low(5)

- src/utils/townUtils.jsx (line 23)
  └─ Included in TOWN_SELECT_COLUMNS for fetching
  └─ Listed in basic town data queries

- src/pages/TownDiscovery.jsx
  └─ Displays: `English level: {selectedTownData.english_proficiency_level}`

- src/pages/admin/AlgorithmManager.jsx
  └─ Documentation example: `primary_language`, `english_proficiency_level`
```

---

## THE DATA QUALITY CRISIS: THREE LAYERS OF CONFUSION

### Layer 1: DATABASE SCHEMA MISMATCH
```
WHAT EXISTS:
- Column: english_proficiency (INTEGER, 0-100)
- All 352 towns populated with values like 95, 90, 35, 27

WHAT UI EXPECTS:
- Column: english_proficiency_level (TEXT, categorical)
- Valid values: ['low', 'moderate', 'high', 'very high', 'widespread', 'native']
- NO DATA in this column!
```

### Layer 2: VALIDATION CONTRADICTION
```
src/utils/dataVerification.js line 22:
english_proficiency: { min: 0, max: 10, type: 'score', integer: true }
                                ↑
                         WRONG! Should be 0-100

Database migration line 5:
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS english_proficiency INTEGER;

Populate migration lines 5-133:
UPDATE towns SET english_proficiency = 95 WHERE country = 'United States';
                                      ↑
                                 0-100 scale!
```

### Layer 3: COMPONENT CONFUSION
```
ComparisonGrid.jsx displays:
town.english_proficiency * 10 = value/10

Example with data 95:
95 * 10 = 950/10 (NONSENSICAL)

Correct interpretation:
95 means 95% speak English, should display as "95%"
```

---

## ROOT CAUSE ANALYSIS

### What Actually Happened
1. **October 20, 2025:** Two migrations created
   - 20251020000000_add_english_proficiency.sql → Adds INTEGER column
   - 20251020000100_populate_english_proficiency.sql → Populates with 0-100 values

2. **Validation Schema (Sep 30, 2025):** Created categorical values definition
   - english_proficiency_level: ['low', 'moderate', 'high', 'very high', 'widespread', 'native']

3. **Components (Oct 18, 2025):** Created CulturePanel expecting categorical field
   - Uses english_proficiency_level (does NOT exist as populated column)
   - Validates against VALID_CATEGORICAL_VALUES

4. **Current State (Oct 31, 2025):** Two parallel systems
   - Database has: english_proficiency (numeric 0-100) - fully populated
   - UI expects: english_proficiency_level (categorical) - NOT POPULATED
   - dataVerification.js validates: english_proficiency 0-10 (WRONG RANGE)

---

## WHERE "95" VALUES ARE COMING FROM

**Source:** supabase/migrations/20251020000100_populate_english_proficiency.sql

**Method:** Country-based assignment using EF English Proficiency Index benchmarks

```sql
-- English-speaking countries get high scores
UPDATE towns SET english_proficiency = 95 WHERE country = 'United States';
UPDATE towns SET english_proficiency = 98 WHERE country = 'United Kingdom';
UPDATE towns SET english_proficiency = 90 WHERE country = 'Canada';

-- Non-English countries get lower scores
UPDATE towns SET english_proficiency = 35 WHERE country = 'Spain';
UPDATE towns SET english_proficiency = 27 WHERE country = 'Thailand';
UPDATE towns SET english_proficiency = 39 WHERE country = 'France';

-- Expat/tourist areas get special overrides
UPDATE towns SET english_proficiency = 70 WHERE name = 'Lisbon';
UPDATE towns SET english_proficiency = 75 WHERE name = 'Cascais';
UPDATE towns SET english_proficiency = 50 WHERE name = 'Barcelona';
```

**Source Data:** EF English Proficiency Index 2024 + local expat community knowledge

---

## FIELD REFERENCE: COMPLETE MAPPING

### Database Columns (ACTUAL)
```
1. english_proficiency (INTEGER)
   - Data type: 0-100 percentage
   - Status: FULLY POPULATED (all 352 towns)
   - Data source: Country EF Index + town-specific overrides
   - Used in: ComparisonGrid display (incorrectly)

2. english_proficiency_level (NOT CREATED AS COLUMN)
   - Expected data type: TEXT (categorical)
   - Valid values: ['low', 'moderate', 'high', 'very high', 'widespread', 'native']
   - Status: DOES NOT EXIST IN DATABASE
   - Expected in: CulturePanel editing, scoring algorithm
```

### Component Expectations (EXPECTED)
```
CulturePanel.jsx (Culture tab > Language & Communication):
- Field: english_proficiency_level
- Type: select dropdown
- Valid values: 6 categorical values
- Status: EXPECTS DATA THAT DOESN'T EXIST

cultureScoring.js (Matching algorithm):
- Field: english_proficiency_level
- Type: categorical comparison
- Scores: native(20), high(15), moderate(10), low(5)
- Status: TRIES TO USE NON-EXISTENT DATA

TownDiscovery.jsx (Overview tab):
- Field: english_proficiency_level
- Display: "English level: {value}"
- Status: SHOWS UNDEFINED IF FIELD NOT POPULATED
```

### Validation Rules (CONFLICTING)
```
src/utils/validation/categoricalValues.js:
- english_proficiency_level: ['low', 'moderate', 'high', 'very high', 'widespread', 'native']

src/utils/dataVerification.js:
- english_proficiency: { min: 0, max: 10, type: 'score', integer: true }
  └─ WRONG: Database has 0-100, validation expects 0-10!

src/pages/admin/TownsManager.jsx (line 973):
- Field mapping label: 'English proficiency level'
- Actual database column: english_proficiency
- Expects: numeric 0-100
- Reality: Mislabeled as "level" (categorical term)
```

---

## RECENT CHANGES TIMELINE

```
2025-09-30:
  ✅ Created validation schema with english_proficiency_level categorical values
  
2025-10-18:
  ✅ Created CulturePanel.jsx expecting english_proficiency_level field
  ✅ Panel renders as select dropdown with 6 valid options
  
2025-10-20:
  ✅ Created migrations to add english_proficiency (INTEGER)
  ✅ Populated all 352 towns with 0-100 values
  ⚠️ NO migration to create/populate english_proficiency_level
  
2025-10-27:
  ❌ Data verification shows "issues" with english_proficiency
  ❌ Range validation failing (0-10 vs 0-100)
  
2025-10-31:
  ❌ Current state: Two fields, one populated, one expected, neither correctly integrated
```

---

## DUPLICATE FIELD DEFINITIONS

### TownsManager.jsx References (Line 82)
```javascript
'Language': {
  used: ['language', 'languages_spoken', 'english_proficiency'],  // ← WRONG FIELD
  unused: []
}
```

Problem: References `english_proficiency` but UI components expect `english_proficiency_level`

### Validation References
```
categoricalValues.js: english_proficiency_level ✅
CulturePanel.jsx: english_proficiency_level ✅
cultureScoring.js: english_proficiency_level ✅
ComparisonGrid.jsx: english_proficiency (numeric) ❌
TownsManager.jsx: english_proficiency (wrong field) ❌
dataVerification.js: english_proficiency (wrong range) ❌
```

---

## IMPACT ASSESSMENT

### Scoring Algorithm Impact
```
cultureScoring.js line 177-195:
  ✅ Correctly references english_proficiency_level
  ✅ Scoring logic is sound (native:20, high:15, moderate:10, low:5)
  ❌ But field has NO DATA - always falls back to default/missing
  Result: Algorithm is correct but data-starved
```

### User Facing Impact
```
Culture Tab (Overview):
  ❌ Shows empty/undefined English proficiency level
  ❌ Users don't see language capability information

Culture Tab (Inline Editing):
  ✅ Shows select dropdown with 6 options
  ❌ But CulturePanel updates data that doesn't get displayed

Comparison Grid:
  ❌ Attempts: 95 * 10 = 950/10 (nonsensical display)
  ✅ At least shows numeric data (even if misformatted)
```

### Data Integrity Impact
```
Search/Matching:
  ❌ Language matching disabled for english_only preference
  ✅ Falls back to partial credit instead

Scoring:
  ❌ Culture category missing language proficiency contribution
  ✅ Falls back to average scoring

Admin Interface:
  ⚠️ CulturePanel shows editable field but saves to wrong/non-existent column
  ⚠️ TownsManager lists wrong field name in Language category
```

---

## RECOMMENDATIONS SUMMARY

### Immediate Issues (MUST FIX)
1. **Data Type Mismatch:** Database has 0-100, validation expects 0-10
2. **Missing Column:** `english_proficiency_level` referenced by components but not created
3. **Wrong Field Name:** TownsManager references `english_proficiency` instead of `english_proficiency_level`
4. **Data Conversion:** Need to convert 95 → "high", 70 → "moderate", etc.

### Complete Investigation Checklist
- [x] Found all columns in towns table related to English proficiency
- [x] Checked migration files for schema changes
- [x] Identified validation constraints and type mismatches
- [x] Found ALL files that reference either field name
- [x] Checked if fields are used in Overview vs Culture tabs
- [x] Understood why search shows results in both tabs
- [x] Found scoring algorithm integration
- [x] Found source of "95" values
- [x] Identified where duplicates exist
- [x] Traced recent changes from Sep 30 to Oct 31
- [x] Documented data flow from database to UI to scoring

---

## FILES REQUIRING ATTENTION

### Database
- `supabase/migrations/20251020000000_add_english_proficiency.sql`
- `supabase/migrations/20251020000100_populate_english_proficiency.sql`

### UI Components
- `src/components/admin/CulturePanel.jsx` (expects english_proficiency_level)
- `src/components/ComparisonGrid.jsx` (displays english_proficiency incorrectly)
- `src/pages/TownDiscovery.jsx` (displays english_proficiency_level)

### Algorithms & Validation
- `src/utils/scoring/categories/cultureScoring.js` (uses english_proficiency_level)
- `src/utils/validation/categoricalValues.js` (defines english_proficiency_level values)
- `src/utils/dataVerification.js` (validates english_proficiency with wrong range)

### Admin Tools
- `src/pages/admin/TownsManager.jsx` (references wrong field, wrong label)
- `src/utils/townUtils.jsx` (includes english_proficiency_level in column set)

