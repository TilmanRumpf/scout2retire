# PHASE 2: Towns Manager / Smart Update System - Refactoring Prompt

**Date:** November 14, 2025
**Purpose:** Complete refactoring instructions for Towns Manager / Smart Update system
**Prerequisites:** Read PHASE1_ANALYSIS.md first

---

## 🎯 MISSION: UNFUCK THE TOWNS MANAGER / SMART UPDATE SYSTEM

You are refactoring a working but messy admin system. The goal is to **consolidate duplicated code, reduce file sizes, and add tests** WITHOUT breaking existing functionality.

**Success Criteria:**
- ✅ ARRAY_FIELDS defined in exactly ONE place
- ✅ Normalization logic consolidated into single function
- ✅ TownsManager.jsx reduced from 2,590 to <1,500 lines
- ✅ Unit tests cover all normalization functions
- ✅ All existing functionality still works
- ✅ Zero regressions (run full manual test after refactor)

---

## 📋 PRE-FLIGHT CHECKLIST

Before starting refactoring:

1. **Read Phase 1 Analysis**
   - [ ] Read `/docs/refactoring/PHASE1_ANALYSIS.md` completely
   - [ ] Understand the 3 critical issues
   - [ ] Review the data flow diagrams

2. **Create Database Snapshot**
   ```bash
   node create-database-snapshot.js
   ```
   - [ ] Snapshot created successfully
   - [ ] Note snapshot timestamp for rollback

3. **Create Git Checkpoint**
   ```bash
   git add -A
   git commit -m "🔖 CHECKPOINT: Pre-refactor snapshot (before Towns Manager cleanup)

   Creating safe restore point before major refactoring:
   - ARRAY_FIELDS consolidation
   - Normalization function unification
   - TownsManager size reduction

   Database snapshot: [INSERT TIMESTAMP]

   If refactor fails, rollback with:
   git reset --hard [THIS COMMIT HASH]
   node restore-database-snapshot.js [TIMESTAMP]"
   ```
   - [ ] Git commit created
   - [ ] Note commit hash for rollback

4. **Test Current System**
   - [ ] Open http://localhost:5173/admin/towns-manager
   - [ ] Select a town, click "Smart Update"
   - [ ] Verify modal opens with suggestions
   - [ ] Edit a field, set audit status, click "Update This Field"
   - [ ] Verify field updates and shows green checkmark
   - [ ] Close and reopen modal - verify hydration works
   - [ ] Test water_bodies field specifically (recent bug)

5. **Install Testing Framework (if not present)**
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
   ```

---

## 🔧 REFACTORING TASKS

### TASK 1: Consolidate ARRAY_FIELDS (P0 - CRITICAL)

**Problem:** ARRAY_FIELDS defined in 2 places → risk of divergence

**Files to modify:**
1. Create new config file
2. Update bulkUpdateTown.js
3. Update UpdateTownModal.jsx

#### Step 1.1: Create Central Config File

**Create:** `/src/utils/config/arrayFields.js`

```javascript
/**
 * Array Fields Configuration
 * Defines which database columns are text[] (PostgreSQL array type)
 *
 * CRITICAL: This is the SINGLE SOURCE OF TRUTH for array field definitions
 * Import from this file - NEVER redefine ARRAY_FIELDS elsewhere
 *
 * Created: November 14, 2025 - Consolidation refactor
 */

/**
 * Fields that are stored as text[] (array) in PostgreSQL
 * These fields require special normalization:
 * - UI: Display as comma-separated strings for editing
 * - DB: Store as JavaScript arrays (Supabase converts to Postgres arrays)
 * - Comparison: Lowercase, sort, then compare
 */
export const ARRAY_FIELDS = new Set([
  'geographic_features_actual',  // Geographic features (coastal, mountainous, etc.)
  'vegetation_type_actual',      // Vegetation types (forest, grassland, etc.)
  'water_bodies',                // Nearby water bodies (ocean, lake, river)
  'regions',                     // Multi-region classification
  'geo_region'                   // Geographic region codes
]);

/**
 * Check if a field is an array field
 * @param {string} fieldName - Database field name
 * @returns {boolean} True if field is array type
 */
export function isArrayField(fieldName) {
  return ARRAY_FIELDS.has(fieldName);
}

/**
 * Get all array field names
 * @returns {string[]} Array of field names
 */
export function getArrayFields() {
  return Array.from(ARRAY_FIELDS);
}

/**
 * Validate that a field name is in the array fields list
 * Useful for defensive programming
 * @param {string} fieldName - Field to check
 * @throws {Error} If field is not in ARRAY_FIELDS
 */
export function assertArrayField(fieldName) {
  if (!ARRAY_FIELDS.has(fieldName)) {
    throw new Error(`Field "${fieldName}" is not an array field. Known array fields: ${getArrayFields().join(', ')}`);
  }
}
```

**Verification:**
```bash
# File should exist and have no syntax errors
node -c src/utils/config/arrayFields.js
```

#### Step 1.2: Update bulkUpdateTown.js

**File:** `/src/utils/admin/bulkUpdateTown.js`

**Change line 12-18 FROM:**
```javascript
const ARRAY_FIELDS = new Set([
  'geographic_features_actual',
  'vegetation_type_actual',
  'water_bodies',
  'regions',
  'geo_region'
]);
```

**TO:**
```javascript
import { ARRAY_FIELDS, isArrayField } from '../config/arrayFields.js';
```

**Move to top of file (after other imports, around line 8-9)**

**Verification:**
- [ ] No duplicate ARRAY_FIELDS definition in file
- [ ] Import statement added at top
- [ ] normalizeFieldValueForDb() still works (uses ARRAY_FIELDS)

#### Step 1.3: Update UpdateTownModal.jsx

**File:** `/src/components/admin/UpdateTownModal.jsx`

**Delete line 184:** (ARRAY_FIELDS array definition for multi-select)
**Delete line 488-491:** (ARRAY_FIELDS Set definition for normalization)

**Add import at top (around line 1-17):**
```javascript
import { ARRAY_FIELDS, isArrayField } from '../../utils/config/arrayFields.js';
```

**Find all uses of ARRAY_FIELDS in file and verify they still work:**
- Line ~184: Multi-select field check → use isArrayField() or ARRAY_FIELDS.has()
- Line ~499: normalizeForAuditComparison() → uses ARRAY_FIELDS.has()

**Verification:**
- [ ] No duplicate ARRAY_FIELDS definition in file
- [ ] Import statement added
- [ ] All references to ARRAY_FIELDS work correctly

#### Step 1.4: Test ARRAY_FIELDS Consolidation

**Manual Test:**
1. Open http://localhost:5173/admin/towns-manager
2. Select a town with water_bodies data
3. Click "Smart Update"
4. Find water_bodies field in modal
5. Verify it shows as multi-select (not plain textarea)
6. Edit value: "Atlantic Ocean"
7. Set audit status: "Approved"
8. Click "Update This Field"
9. Verify update succeeds
10. Close and reopen modal
11. Verify water_bodies hydrates correctly (value matches, status matches)
12. Verify field does NOT appear in "Update All Approved" button (isChanged should be false)

**Expected Result:** Everything works exactly as before

**Rollback if broken:**
```bash
git checkout src/utils/admin/bulkUpdateTown.js
git checkout src/components/admin/UpdateTownModal.jsx
rm src/utils/config/arrayFields.js
```

---

### TASK 2: Consolidate Normalization Functions (P0 - CRITICAL)

**Problem:** 4 functions doing similar work → hard to maintain, easy to introduce bugs

**Current Functions:**
1. `normalizeFieldValueForDb()` - bulkUpdateTown.js (DB storage)
2. `toEditableString()` - UpdateTownModal.jsx (UI editing)
3. `normalizeForAuditComparison()` - UpdateTownModal.jsx (Comparison)
4. `normalizeCategoricalValue()` - categoricalValues.js (Validation)

**Goal:** Single function with modes

#### Step 2.1: Create Unified Normalization Utility

**Create:** `/src/utils/fieldNormalization.js`

```javascript
/**
 * Field Normalization Utilities
 * Consolidated normalization logic for all field types
 *
 * Replaces 4 scattered normalization functions:
 * - normalizeFieldValueForDb() (bulkUpdateTown.js)
 * - toEditableString() (UpdateTownModal.jsx)
 * - normalizeForAuditComparison() (UpdateTownModal.jsx)
 * - normalizeCategoricalValue() (categoricalValues.js)
 *
 * Created: November 14, 2025 - Normalization consolidation refactor
 */

import { ARRAY_FIELDS } from './config/arrayFields.js';

/**
 * Normalize field value based on mode
 *
 * @param {string} fieldName - Database field name
 * @param {any} value - Raw value (could be string, array, null, etc.)
 * @param {string} mode - Normalization mode:
 *   - 'db': For database storage (string → array for array fields)
 *   - 'display': For UI editing (array → comma-separated string)
 *   - 'compare': For equality checks (lowercase, sort, join)
 *   - 'categorical': For validation (lowercase, trim)
 * @returns {any} Normalized value
 */
export function normalizeFieldValue(fieldName, value, mode = 'db') {
  switch (mode) {
    case 'db':
      return normalizeForDb(fieldName, value);
    case 'display':
      return normalizeForDisplay(value);
    case 'compare':
      return normalizeForComparison(fieldName, value);
    case 'categorical':
      return normalizeForCategorical(value);
    default:
      throw new Error(`Invalid normalization mode: ${mode}. Use 'db', 'display', 'compare', or 'categorical'.`);
  }
}

/**
 * MODE: 'db' - Normalize for database storage
 * Converts comma-separated strings to arrays for text[] columns
 *
 * @param {string} fieldName - Field name
 * @param {any} rawValue - Raw value from UI
 * @returns {any} Value ready for DB (array for array fields, original for others)
 */
function normalizeForDb(fieldName, rawValue) {
  // Non-array fields: return as-is
  if (!ARRAY_FIELDS.has(fieldName)) {
    return rawValue;
  }

  // Array field normalization

  // 1. Already an array: clean and lowercase each element
  if (Array.isArray(rawValue)) {
    return rawValue
      .map(v => String(v).trim().toLowerCase())
      .filter(v => v.length > 0);
  }

  // 2. String value
  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();

    // Empty string → empty array
    if (trimmed === '') {
      return [];
    }

    // Postgres array literal: {"coastal","mountainous"}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map(v => v.replace(/"/g, '').trim().toLowerCase())
        .filter(v => v.length > 0);
    }

    // Comma-separated string: "coastal, mountainous, rivers"
    return trimmed
      .split(',')
      .map(v => v.trim().toLowerCase())
      .filter(v => v.length > 0);
  }

  // 3. Null/undefined → empty array
  if (rawValue === null || rawValue === undefined) {
    return [];
  }

  // 4. Fallback
  return [];
}

/**
 * MODE: 'display' - Normalize for UI editing
 * Converts arrays to comma-separated strings for textarea editing
 *
 * @param {any} value - Value to display
 * @returns {string} Editable string
 */
function normalizeForDisplay(value) {
  // Null/undefined → empty string
  if (!value && value !== 0) {
    return '';
  }

  // JavaScript array: ["coastal", "mountain"] → "coastal, mountain"
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Postgres array literal: {"coastal","mountain"} → "coastal, mountain"
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return value
      .slice(1, -1)
      .split(',')
      .map(v => v.replace(/"/g, '').trim())
      .join(', ');
  }

  // Already a string (or other type) - return as-is
  return String(value);
}

/**
 * MODE: 'compare' - Normalize for equality checks
 * Ensures consistent comparison (lowercase, sorted, joined)
 *
 * @param {string} fieldName - Field name
 * @param {any} value - Value to normalize
 * @returns {string} Normalized string for comparison
 */
function normalizeForComparison(fieldName, value) {
  // Array fields need special handling
  if (ARRAY_FIELDS.has(fieldName)) {
    // 1. Already an array
    if (Array.isArray(value)) {
      return value
        .map(v => String(v).trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join(', ');
    }

    // 2. Postgres array literal: {"coastal","mountainous"}
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      return value
        .slice(1, -1)
        .split(',')
        .map(v => v.replace(/"/g, '').trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join(', ');
    }

    // 3. Comma-separated string: "coastal, mountainous"
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(v => v.trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join(', ');
    }

    // 4. Fallback
    if (value == null) return '';
    return String(value).trim().toLowerCase();
  }

  // Non-array fields: just trim (preserve case for some fields)
  if (value == null) return '';
  return String(value).trim();
}

/**
 * MODE: 'categorical' - Normalize for validation
 * Simple lowercase + trim for categorical field validation
 *
 * @param {any} value - Value to normalize
 * @returns {string} Normalized string
 */
function normalizeForCategorical(value) {
  if (value == null) return '';
  return String(value).trim().toLowerCase();
}

/**
 * Legacy function names for backward compatibility
 * Use normalizeFieldValue() with modes instead
 */

export function normalizeFieldValueForDb(fieldName, rawValue) {
  console.warn('DEPRECATED: Use normalizeFieldValue(fieldName, value, "db") instead');
  return normalizeFieldValue(fieldName, rawValue, 'db');
}

export function toEditableString(value) {
  console.warn('DEPRECATED: Use normalizeFieldValue(null, value, "display") instead');
  return normalizeFieldValue(null, value, 'display');
}

export function normalizeForAuditComparison(fieldName, value) {
  console.warn('DEPRECATED: Use normalizeFieldValue(fieldName, value, "compare") instead');
  return normalizeFieldValue(fieldName, value, 'compare');
}

export function normalizeCategoricalValue(value) {
  console.warn('DEPRECATED: Use normalizeFieldValue(null, value, "categorical") instead');
  return normalizeFieldValue(null, value, 'categorical');
}
```

**Verification:**
```bash
node -c src/utils/fieldNormalization.js
```

#### Step 2.2: Update bulkUpdateTown.js to Use New Function

**File:** `/src/utils/admin/bulkUpdateTown.js`

**Add import (around line 8-9):**
```javascript
import { normalizeFieldValue } from '../fieldNormalization.js';
```

**Replace normalizeFieldValueForDb function (lines 28-73) with:**
```javascript
/**
 * Normalize field value for database storage
 * NOW USING CONSOLIDATED NORMALIZATION - November 14, 2025
 *
 * @param {string} fieldName - Field name
 * @param {any} rawValue - Raw value from UI
 * @returns {any} Normalized value ready for DB
 */
function normalizeFieldValueForDb(fieldName, rawValue) {
  return normalizeFieldValue(fieldName, rawValue, 'db');
}
```

**Verification:**
- [ ] normalizeFieldValueForDb still exists (other code calls it)
- [ ] Now delegates to normalizeFieldValue()
- [ ] No duplicate logic

#### Step 2.3: Update UpdateTownModal.jsx to Use New Function

**File:** `/src/components/admin/UpdateTownModal.jsx`

**Add import (around line 1-17):**
```javascript
import { normalizeFieldValue } from '../../utils/fieldNormalization.js';
```

**Replace toEditableString function (lines 46-65) with:**
```javascript
/**
 * Convert array or Postgres array literal to editable string
 * NOW USING CONSOLIDATED NORMALIZATION - November 14, 2025
 */
function toEditableString(value) {
  return normalizeFieldValue(null, value, 'display');
}
```

**Replace normalizeForAuditComparison function (lines 497-538) with:**
```javascript
/**
 * Normalize values for audit status comparison
 * NOW USING CONSOLIDATED NORMALIZATION - November 14, 2025
 */
const normalizeForAuditComparison = (fieldName, value) => {
  return normalizeFieldValue(fieldName, value, 'compare');
};
```

**Verification:**
- [ ] Both functions still exist (backward compatibility)
- [ ] Now delegate to normalizeFieldValue()
- [ ] No duplicate logic

#### Step 2.4: Update categoricalValues.js to Use New Function

**File:** `/src/utils/validation/categoricalValues.js`

**Add import at top:**
```javascript
import { normalizeFieldValue } from '../fieldNormalization.js';
```

**Replace normalizeCategoricalValue function (around line 258-262) with:**
```javascript
/**
 * Normalize categorical value for comparison
 * NOW USING CONSOLIDATED NORMALIZATION - November 14, 2025
 */
export function normalizeCategoricalValue(value) {
  return normalizeFieldValue(null, value, 'categorical');
}
```

**Verification:**
- [ ] Function still exported
- [ ] Now delegates to normalizeFieldValue()
- [ ] No duplicate logic

#### Step 2.5: Test Normalization Consolidation

**Manual Test:**
1. Test array field editing (water_bodies):
   - [ ] Edit "Atlantic Ocean, Mediterranean Sea"
   - [ ] Update field
   - [ ] Verify saves as ["atlantic ocean", "mediterranean sea"]
   - [ ] Reopen modal
   - [ ] Verify displays as "atlantic ocean, mediterranean sea"

2. Test comparison logic:
   - [ ] Set water_bodies to "Ocean, Lake"
   - [ ] Save and close
   - [ ] Reopen - verify NOT in bulk update list (equal after normalization)

3. Test categorical validation:
   - [ ] Edit climate field
   - [ ] Enter "  Tropical  " (with spaces, mixed case)
   - [ ] Verify validation works

**Expected Result:** All normalization works exactly as before

---

### TASK 3: Write Unit Tests (P0 - CRITICAL)

**Problem:** No tests for critical normalization logic

#### Step 3.1: Create Test File

**Create:** `/src/utils/__tests__/fieldNormalization.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import { normalizeFieldValue } from '../fieldNormalization.js';

describe('fieldNormalization', () => {
  describe('MODE: db (database storage)', () => {
    it('should convert comma-separated string to lowercase array for array fields', () => {
      const result = normalizeFieldValue('water_bodies', 'Atlantic Ocean, Mediterranean Sea', 'db');
      expect(result).toEqual(['atlantic ocean', 'mediterranean sea']);
    });

    it('should handle Postgres array literal', () => {
      const result = normalizeFieldValue('geographic_features_actual', '{"Coastal","Mountain"}', 'db');
      expect(result).toEqual(['coastal', 'mountain']);
    });

    it('should clean and lowercase existing array', () => {
      const result = normalizeFieldValue('vegetation_type_actual', ['Forest', '  Grassland  '], 'db');
      expect(result).toEqual(['forest', 'grassland']);
    });

    it('should return empty array for null/undefined array field', () => {
      expect(normalizeFieldValue('water_bodies', null, 'db')).toEqual([]);
      expect(normalizeFieldValue('water_bodies', undefined, 'db')).toEqual([]);
      expect(normalizeFieldValue('water_bodies', '', 'db')).toEqual([]);
    });

    it('should return non-array fields as-is', () => {
      expect(normalizeFieldValue('climate', 'Tropical', 'db')).toBe('Tropical');
      expect(normalizeFieldValue('population', 50000, 'db')).toBe(50000);
    });
  });

  describe('MODE: display (UI editing)', () => {
    it('should convert array to comma-separated string', () => {
      const result = normalizeFieldValue(null, ['coastal', 'mountain'], 'display');
      expect(result).toBe('coastal, mountain');
    });

    it('should convert Postgres literal to comma-separated string', () => {
      const result = normalizeFieldValue(null, '{"coastal","mountain"}', 'display');
      expect(result).toBe('coastal, mountain');
    });

    it('should return string as-is', () => {
      const result = normalizeFieldValue(null, 'tropical', 'display');
      expect(result).toBe('tropical');
    });

    it('should return empty string for null/undefined', () => {
      expect(normalizeFieldValue(null, null, 'display')).toBe('');
      expect(normalizeFieldValue(null, undefined, 'display')).toBe('');
    });
  });

  describe('MODE: compare (equality checks)', () => {
    it('should normalize array fields to lowercase sorted string', () => {
      const result1 = normalizeFieldValue('water_bodies', ['Ocean', 'Lake'], 'compare');
      const result2 = normalizeFieldValue('water_bodies', ['lake', 'ocean'], 'compare');
      expect(result1).toBe('lake, ocean'); // sorted
      expect(result2).toBe('lake, ocean');
      expect(result1).toBe(result2); // equal after normalization
    });

    it('should handle different input formats equivalently', () => {
      const array = normalizeFieldValue('geographic_features_actual', ['Mountain', 'Coastal'], 'compare');
      const string = normalizeFieldValue('geographic_features_actual', 'Coastal, Mountain', 'compare');
      const postgres = normalizeFieldValue('geographic_features_actual', '{"Mountain","Coastal"}', 'compare');

      expect(array).toBe('coastal, mountain');
      expect(string).toBe('coastal, mountain');
      expect(postgres).toBe('coastal, mountain');
    });

    it('should just trim non-array fields', () => {
      const result = normalizeFieldValue('climate', '  Tropical  ', 'compare');
      expect(result).toBe('Tropical'); // trimmed but case preserved
    });
  });

  describe('MODE: categorical (validation)', () => {
    it('should lowercase and trim', () => {
      const result = normalizeFieldValue(null, '  Tropical  ', 'categorical');
      expect(result).toBe('tropical');
    });

    it('should handle null/undefined', () => {
      expect(normalizeFieldValue(null, null, 'categorical')).toBe('');
      expect(normalizeFieldValue(null, undefined, 'categorical')).toBe('');
    });
  });

  describe('Edge cases', () => {
    it('should filter out empty array elements', () => {
      const result = normalizeFieldValue('water_bodies', 'ocean, , lake, ', 'db');
      expect(result).toEqual(['ocean', 'lake']);
    });

    it('should throw error for invalid mode', () => {
      expect(() => {
        normalizeFieldValue('climate', 'tropical', 'invalid');
      }).toThrow('Invalid normalization mode');
    });
  });

  describe('water_bodies bug regression test', () => {
    it('should compare "Atlantic Ocean" and "atlantic ocean" as equal', () => {
      const userInput = normalizeFieldValue('water_bodies', 'Atlantic Ocean', 'compare');
      const dbValue = normalizeFieldValue('water_bodies', ['atlantic ocean'], 'compare');

      expect(userInput).toBe('atlantic ocean');
      expect(dbValue).toBe('atlantic ocean');
      expect(userInput).toBe(dbValue); // THIS WAS THE BUG
    });
  });
});
```

#### Step 3.2: Add Test Script to package.json

**File:** `package.json`

**Add to "scripts" section:**
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:run": "vitest run"
```

#### Step 3.3: Run Tests

```bash
npm run test:run
```

**Expected Output:**
```
✓ src/utils/__tests__/fieldNormalization.test.js (23 tests)
  ✓ MODE: db (database storage) (5)
  ✓ MODE: display (UI editing) (4)
  ✓ MODE: compare (equality checks) (3)
  ✓ MODE: categorical (validation) (2)
  ✓ Edge cases (2)
  ✓ water_bodies bug regression test (1)

Test Files  1 passed (1)
Tests  23 passed (23)
```

**If tests fail:**
- Fix normalization logic in fieldNormalization.js
- Re-run tests until all pass
- Do NOT proceed to Task 4 until tests pass

---

### TASK 4: Rename dataVerification CRITICAL_FIELDS (P1 - HIGH)

**Problem:** Name collision causing confusion

#### Step 4.1: Update dataVerification.js

**File:** `/src/utils/dataVerification.js`

**Change line ~50-53 FROM:**
```javascript
const CRITICAL_FIELDS = [
  'town_name', 'country', 'region',
  'cost_of_living_usd', 'healthcare_score', 'safety_score'
];
```

**TO:**
```javascript
/**
 * Fields required for data quality validation
 *
 * NOTE: This is DIFFERENT from CRITICAL_FIELDS in bulkUpdateTown.js
 * - bulkUpdateTown CRITICAL_FIELDS (14 fields): Algorithm-blocking fields for Smart Update
 * - dataVerification VALIDATION_REQUIRED_FIELDS (6 fields): Data quality check
 *
 * Renamed November 14, 2025 to avoid confusion
 */
const VALIDATION_REQUIRED_FIELDS = [
  'town_name', 'country', 'region',
  'cost_of_living_usd', 'healthcare_score', 'safety_score'
];
```

**Find all references to CRITICAL_FIELDS in this file and rename to VALIDATION_REQUIRED_FIELDS**

**Verification:**
```bash
# Search for any remaining CRITICAL_FIELDS references
grep -n "CRITICAL_FIELDS" src/utils/dataVerification.js
# Should return 0 results
```

#### Step 4.2: Test Data Verification

- [ ] Open data verification page (if exists)
- [ ] Verify quality checks still work
- [ ] No errors in console

---

### TASK 5: Extract TownsManager Logic to Hooks (P1 - HIGH)

**Problem:** TownsManager.jsx is 2,590 lines (target: <1,500)

**Strategy:** Extract audit logic, filter logic, and Smart Update logic to custom hooks

#### Step 5.1: Create useAuditManagement Hook

**Create:** `/src/hooks/useAuditManagement.js`

```javascript
/**
 * Audit Management Hook
 * Extracted from TownsManager.jsx to reduce component size
 *
 * Handles:
 * - Loading audit results from database
 * - Running AI audits
 * - Managing audit state
 *
 * Created: November 14, 2025 - TownsManager refactor
 */

import { useState } from 'react';
import { auditTownData, loadAuditResults } from '../utils/auditTown';

export function useAuditManagement(supabase) {
  const [auditResults, setAuditResults] = useState({});
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditedFields, setAuditedFields] = useState({});

  /**
   * Load audit results for a town
   */
  const loadAudits = async (townId) => {
    try {
      const results = await loadAuditResults(townId, supabase);
      setAuditResults(results);
      return results;
    } catch (error) {
      console.error('Error loading audits:', error);
      return {};
    }
  };

  /**
   * Run AI audit on a town
   */
  const runAudit = async (townData) => {
    setAuditLoading(true);
    try {
      const result = await auditTownData(townData, supabase);
      if (result.success) {
        setAuditResults(result.fieldConfidence);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Audit error:', error);
      return { success: false, error: error.message };
    } finally {
      setAuditLoading(false);
    }
  };

  return {
    auditResults,
    auditLoading,
    auditedFields,
    setAuditedFields,
    loadAudits,
    runAudit
  };
}
```

#### Step 5.2: Create useSmartUpdate Hook

**Create:** `/src/hooks/useSmartUpdate.js`

```javascript
/**
 * Smart Update Hook
 * Extracted from TownsManager.jsx to reduce component size
 *
 * Handles:
 * - Generating update suggestions
 * - Managing update modal state
 * - Progress tracking
 *
 * Created: November 14, 2025 - TownsManager refactor
 */

import { useState } from 'react';
import { analyzeTownCompleteness, generateUpdateSuggestions } from '../utils/admin/bulkUpdateTown';

export function useSmartUpdate() {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateSuggestions, setUpdateSuggestions] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [updateMode, setUpdateMode] = useState('critical'); // 'critical' or 'supplemental'
  const [currentTabFilter, setCurrentTabFilter] = useState(null);

  /**
   * Generate smart update suggestions for a town
   */
  const generateSuggestions = async (town, auditResults, mode = 'critical', tabFilter = null) => {
    setUpdateLoading(true);
    setGenerationProgress(null);
    setUpdateMode(mode);
    setCurrentTabFilter(tabFilter);

    try {
      // Analyze which fields need attention
      const analysis = analyzeTownCompleteness(town, auditResults, mode, tabFilter);
      const fieldsToUpdate = analysis.priorityFields || [];

      if (fieldsToUpdate.length === 0) {
        setUpdateLoading(false);
        return { success: true, count: 0 };
      }

      // Generate AI suggestions
      const suggestions = await generateUpdateSuggestions(
        town,
        fieldsToUpdate,
        (progress) => setGenerationProgress(progress)
      );

      setUpdateSuggestions(suggestions);
      setUpdateModalOpen(true);
      setUpdateLoading(false);

      return { success: true, count: suggestions.length };
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setUpdateLoading(false);
      return { success: false, error: error.message };
    }
  };

  /**
   * Close update modal and reset state
   */
  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setUpdateSuggestions([]);
    setGenerationProgress(null);
  };

  return {
    updateModalOpen,
    updateSuggestions,
    updateLoading,
    generationProgress,
    updateMode,
    currentTabFilter,
    generateSuggestions,
    closeUpdateModal,
    setUpdateModalOpen
  };
}
```

#### Step 5.3: Update TownsManager.jsx to Use Hooks

**File:** `/src/pages/admin/TownsManager.jsx`

**Add imports (around line 30-37):**
```javascript
import { useAuditManagement } from '../../hooks/useAuditManagement';
import { useSmartUpdate } from '../../hooks/useSmartUpdate';
```

**Replace audit state (around line 248-254) with:**
```javascript
// Audit management (extracted to hook)
const {
  auditResults,
  auditLoading,
  auditedFields,
  setAuditedFields,
  loadAudits,
  runAudit
} = useAuditManagement(supabase);
```

**Replace Smart Update state (around line 252-256) with:**
```javascript
// Smart Update management (extracted to hook)
const {
  updateModalOpen,
  updateSuggestions,
  updateLoading,
  generationProgress,
  updateMode,
  currentTabFilter,
  generateSuggestions,
  closeUpdateModal,
  setUpdateModalOpen
} = useSmartUpdate();
```

**Delete old useState declarations for these variables**

**Update function calls:**
- Replace manual audit logic with `runAudit(townData)`
- Replace manual suggestion generation with `generateSuggestions(town, auditResults, mode, tabFilter)`

**Verification:**
```bash
wc -l src/pages/admin/TownsManager.jsx
# Should be <2,000 lines now
```

---

### TASK 6: Add JSDoc Documentation (P2 - MEDIUM)

**Problem:** Functions lack comprehensive documentation

#### Step 6.1: Document fieldNormalization.js

Already done in Step 2.1 (comprehensive JSDoc comments)

#### Step 6.2: Document arrayFields.js

Already done in Step 1.1 (comprehensive JSDoc comments)

#### Step 6.3: Add README to utils/config/

**Create:** `/src/utils/config/README.md`

```markdown
# Configuration Files

Centralized configuration for the Scout2Retire admin system.

## arrayFields.js

**Purpose:** Single source of truth for PostgreSQL text[] (array) columns

**Usage:**
\`\`\`javascript
import { ARRAY_FIELDS, isArrayField } from './config/arrayFields.js';

if (isArrayField('water_bodies')) {
  // Handle as array field
}
\`\`\`

**Critical:** NEVER redefine ARRAY_FIELDS elsewhere. Always import from this file.

**Array Fields:**
- \`geographic_features_actual\` - Geographic features
- \`vegetation_type_actual\` - Vegetation types
- \`water_bodies\` - Nearby water bodies
- \`regions\` - Multi-region classification
- \`geo_region\` - Geographic region codes

## Adding New Array Fields

1. Add to \`ARRAY_FIELDS\` Set in arrayFields.js
2. Add validation rules to \`categoricalValues.js\` (if categorical)
3. Add to \`FIELD_CATEGORIES\` in fieldCategories.js (for tab mapping)
4. Update tests in \`__tests__/fieldNormalization.test.js\`
```

---

## 🧪 COMPREHENSIVE TESTING PROTOCOL

After completing all refactoring tasks, run this full test suite:

### Automated Tests

```bash
# Run unit tests
npm run test:run

# Expected: All tests pass
```

### Manual Test Suite

#### Test 1: Array Field Editing (water_bodies)

1. Open http://localhost:5173/admin/towns-manager
2. Select town: "Valencia, Spain"
3. Click "Smart Update" → "Session 1: Fix Critical Fields"
4. Find water_bodies field
5. Edit: "Atlantic Ocean"
6. Audit status: "Approved"
7. Click "Update This Field"
8. ✅ Verify: Green checkmark appears
9. ✅ Verify: Console shows `[WaterBodies] DB update result: { success: true }`
10. Close modal
11. Reopen Smart Update
12. ✅ Verify: water_bodies shows "atlantic ocean" (normalized)
13. ✅ Verify: Audit status is "Approved"
14. ✅ Verify: Field does NOT appear in "Update All Approved" button

#### Test 2: Geographic Features (Multi-Select)

1. Select town: "Lisbon, Portugal"
2. Smart Update
3. Find geographic_features_actual
4. Edit: "Coastal, Hills"
5. Audit: "Approved"
6. Update field
7. ✅ Verify: Saves as ["coastal", "hills"]
8. Reopen modal
9. ✅ Verify: Displays as "coastal, hills"
10. ✅ Verify: isChanged = false (not in bulk update list)

#### Test 3: Bulk Update All Approved

1. Smart Update on any town
2. Edit 3 fields
3. Set all 3 to "Approved"
4. Click "Update All 3 Approved Fields"
5. ✅ Verify: All 3 update sequentially
6. ✅ Verify: All show green checkmarks
7. ✅ Verify: Toast shows "Updated 3 fields successfully!"

#### Test 4: Session Persistence

1. Smart Update → edit 5 fields
2. Set audit statuses
3. Close modal (do NOT click update)
4. Reopen Smart Update
5. ✅ Verify: All 5 edits are still there
6. ✅ Verify: All audit statuses preserved
7. ✅ Verify: No fields in appliedFields yet

#### Test 5: Tab-Specific Smart Update

1. Click "Climate" tab
2. Click "Update This Tab"
3. ✅ Verify: Only Climate fields appear
4. ✅ Verify: No Region or Cost fields

#### Test 6: Data Verification (if VALIDATION_REQUIRED_FIELDS used)

1. Open data verification page
2. ✅ Verify: Quality checks work
3. ✅ Verify: No errors related to CRITICAL_FIELDS

---

## 🚨 ROLLBACK PROCEDURES

If something breaks during refactoring:

### Rollback Single Task

**ARRAY_FIELDS Consolidation (Task 1):**
```bash
git checkout src/utils/admin/bulkUpdateTown.js
git checkout src/components/admin/UpdateTownModal.jsx
rm src/utils/config/arrayFields.js
```

**Normalization Consolidation (Task 2):**
```bash
git checkout src/utils/admin/bulkUpdateTown.js
git checkout src/components/admin/UpdateTownModal.jsx
git checkout src/utils/validation/categoricalValues.js
rm src/utils/fieldNormalization.js
rm src/utils/__tests__/fieldNormalization.test.js
```

**Hooks Extraction (Task 5):**
```bash
git checkout src/pages/admin/TownsManager.jsx
rm src/hooks/useAuditManagement.js
rm src/hooks/useSmartUpdate.js
```

### Rollback Entire Refactor

```bash
# Restore code
git reset --hard [PRE-REFACTOR COMMIT HASH]

# Restore database (if needed)
node restore-database-snapshot.js [SNAPSHOT TIMESTAMP]

# Reinstall dependencies (if needed)
npm install
```

---

## ✅ SUCCESS CHECKLIST

After completing all tasks, verify:

### Code Quality
- [ ] ARRAY_FIELDS defined in exactly 1 file
- [ ] Only 1 normalization function (with modes)
- [ ] TownsManager.jsx < 1,500 lines
- [ ] dataVerification uses VALIDATION_REQUIRED_FIELDS
- [ ] All deprecated function warnings appear in console
- [ ] No ESLint errors
- [ ] No console errors

### Tests
- [ ] 23+ unit tests pass
- [ ] water_bodies regression test passes
- [ ] No test failures

### Functionality
- [ ] Array field editing works (water_bodies, geographic_features_actual)
- [ ] Bulk update works
- [ ] Session persistence works
- [ ] Tab-specific Smart Update works
- [ ] Data verification works
- [ ] No visual regressions

### Documentation
- [ ] JSDoc comments added to new files
- [ ] README.md created in utils/config/
- [ ] PHASE1_ANALYSIS.md exists
- [ ] PHASE2_REFACTORING_PROMPT.md (this file) exists

### Git
- [ ] Pre-refactor checkpoint committed
- [ ] Each task committed separately
- [ ] Final refactor checkpoint committed
- [ ] Database snapshot created

---

## 📊 METRICS TRACKING

**Before Refactoring:**
- TownsManager.jsx: 2,590 lines
- ARRAY_FIELDS definitions: 2 locations
- Normalization functions: 4 scattered
- Unit tests: 0
- Test coverage: 0%

**After Refactoring (Target):**
- TownsManager.jsx: <1,500 lines (42% reduction)
- ARRAY_FIELDS definitions: 1 location (consolidation complete)
- Normalization functions: 1 unified (4 → 1 reduction)
- Unit tests: 23+ passing
- Test coverage: >80% for normalization logic

---

## 🎓 LESSONS FOR FUTURE

**What we learned from water_bodies bug:**
1. Duplication = divergence risk
2. Normalization must be consistent
3. Unit tests catch bugs before production
4. Documentation prevents confusion

**Best Practices Going Forward:**
1. ✅ Single source of truth for constants
2. ✅ Comprehensive unit tests for critical logic
3. ✅ JSDoc comments for all public functions
4. ✅ Extract large components to hooks/utilities
5. ✅ Regular refactoring to prevent accumulation

---

## 📝 FINAL CHECKPOINT

After successful refactoring:

```bash
# Create database snapshot
node create-database-snapshot.js

# Git commit
git add -A
git commit -m "✨ REFACTOR: Towns Manager / Smart Update System Consolidation

COMPLETED:
- Consolidated ARRAY_FIELDS to single source (config/arrayFields.js)
- Unified 4 normalization functions into 1 (fieldNormalization.js)
- Reduced TownsManager.jsx from 2,590 to [NEW LINE COUNT] lines
- Extracted audit & Smart Update logic to custom hooks
- Added 23+ unit tests with water_bodies regression test
- Renamed dataVerification CRITICAL_FIELDS → VALIDATION_REQUIRED_FIELDS

METRICS:
- Files changed: [COUNT]
- Lines added: [COUNT] / removed: [COUNT]
- Test coverage: [PERCENTAGE]%
- All manual tests passed ✅

BEFORE:
- ARRAY_FIELDS: 2 definitions (risk of divergence)
- Normalization: 4 scattered functions
- Tests: 0
- TownsManager.jsx: 2,590 lines

AFTER:
- ARRAY_FIELDS: 1 definition (utils/config/arrayFields.js)
- Normalization: 1 unified function with 4 modes
- Tests: 23 passing (water_bodies regression included)
- TownsManager.jsx: [NEW COUNT] lines

Database snapshot: [TIMESTAMP]
Rollback: git reset --hard [THIS COMMIT]

🎯 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

**END OF REFACTORING PROMPT**

This prompt is your complete guide to unfucking the Towns Manager / Smart Update system. Follow each step carefully, test thoroughly, and commit frequently. Good luck! 🚀
