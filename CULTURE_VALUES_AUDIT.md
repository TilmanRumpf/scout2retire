# CRITICAL CULTURE VALUES AUDIT REPORT
## October 18, 2025

This audit compares culture dropdown values across three sources:
1. **CulturePanel.jsx** - Admin inline editing
2. **OnboardingCulture.jsx** - User preference setup
3. **categoricalValues.js** - Source of truth (database)

---

## FIELD 1: pace_of_life_actual

### Values in Each Source:
| Source | Values | Count |
|--------|--------|-------|
| CulturePanel.jsx (L114) | `['relaxed', 'moderate', 'fast']` | 3 |
| OnboardingCulture.jsx (L440-444) | `['relaxed', 'moderate', 'fast']` | 3 |
| categoricalValues.js (L56-61) | `['slow', 'relaxed', 'moderate', 'fast']` | 4 |

### Status: ❌ CRITICAL DISCREPANCY
- **Missing from both UI dropdowns**: `'slow'`
- **Impact**: Towns with `pace_of_life_actual='slow'` cannot be edited by admins
- **Issue**: 'slow' is valid in database but unreachable via UI

---

## FIELD 2: social_atmosphere

### Values in Each Source:
| Source | Values | Count |
|--------|--------|-------|
| CulturePanel.jsx (L122) | `['quiet', 'moderate', 'friendly', 'vibrant']` | 4 |
| OnboardingCulture.jsx | Not used (user doesn't input this) | - |
| categoricalValues.js (L91-98) | `['reserved', 'quiet', 'moderate', 'friendly', 'vibrant', 'very friendly']` | 6 |

### Status: ❌ CRITICAL DISCREPANCY
- **Missing from CulturePanel**: `'reserved'`, `'very friendly'`
- **Coverage**: 4 out of 6 values (67%)
- **Impact**: Cannot edit towns with `social_atmosphere='reserved'` or `'very friendly'`

---

## FIELD 3: traditional_progressive_lean

### Values in Each Source:
| Source | Values | Count |
|--------|--------|-------|
| CulturePanel.jsx (L130) | `['traditional', 'moderate', 'balanced', 'progressive']` | 4 |
| OnboardingCulture.jsx | Not used | - |
| categoricalValues.js (L103-108) | `['traditional', 'moderate', 'balanced', 'progressive']` | 4 |

### Status: ✅ PERFECT MATCH
- All values match exactly
- No discrepancies

---

## FIELD 4: expat_community_size

### Values in Each Source:
| Source | Values | Count |
|--------|--------|-------|
| CulturePanel.jsx (L156) | `['small', 'moderate', 'large']` | 3 |
| OnboardingCulture.jsx (L433-437) | `['small', 'moderate', 'large']` | 3 |
| categoricalValues.js (L111-115) | `['small', 'moderate', 'large']` | 3 |

### Status: ✅ PERFECT MATCH
- All values match exactly
- Consistent across all sources

---

## FIELD 5: retirement_community_presence

### Values in Each Source:
| Source | Values | Count |
|--------|--------|-------|
| CulturePanel.jsx (L164) | `['none', 'minimal', 'limited', 'moderate', 'strong', 'very_strong']` | 6 |
| OnboardingCulture.jsx | Not used | - |
| categoricalValues.js (L20-28) | `['none', 'minimal', 'limited', 'moderate', 'strong', 'extensive', 'very_strong']` | 7 |

### Status: ❌ CRITICAL DISCREPANCY
- **Missing from CulturePanel**: `'extensive'`
- **Coverage**: 6 out of 7 values (86%)
- **Impact**: Cannot edit towns with `retirement_community_presence='extensive'`
- **Note**: This is a high-value field for retirement destination scoring

---

## FIELD 6: cultural_events_frequency

### Values in Each Source:
| Source | Values | Count |
|--------|--------|-------|
| CulturePanel.jsx (L172) | `['monthly', 'weekly', 'daily']` | 3 |
| OnboardingCulture.jsx | Not used (user selects importance 1/3/5, not frequency) | - |
| categoricalValues.js (L78-86) | `['rare', 'occasional', 'monthly', 'frequent', 'weekly', 'constant', 'daily']` | 7 |

### Status: ❌ SEVERELY INCOMPLETE
- **Missing from CulturePanel**: `'rare'`, `'occasional'`, `'frequent'`, `'constant'`
- **Coverage**: 3 out of 7 values (43%)
- **Impact**: Cannot select most frequency options when editing towns
- **Severity**: Most dramatic gap of any field

---

## FIELD 7: english_proficiency_level

### Values in Each Source:
| Source | Values | Count |
|--------|--------|-------|
| CulturePanel.jsx (L88) | `['low', 'high']` | 2 |
| OnboardingCulture.jsx | Not used (uses preference categories) | - |
| categoricalValues.js (L118-125) | `['low', 'moderate', 'high', 'very high', 'widespread', 'native']` | 6 |

### Status: ❌ SEVERELY INCOMPLETE
- **Missing from CulturePanel**: `'moderate'`, `'very high'`, `'widespread'`, `'native'`
- **Coverage**: 2 out of 6 values (33%)
- **Impact**: Cannot select most language proficiency levels
- **Severity**: Second most dramatic gap

---

## ADDITIONAL ISSUE: townDataOptions.js

File: `/src/utils/townDataOptions.js` (Line 108)
```javascript
pace_of_life: ['relaxed', 'moderate', 'fast'],
```

- **Issue**: Also missing `'slow'`
- **Should be**: `['slow', 'relaxed', 'moderate', 'fast']`
- **Impact**: Referenced in field mapping logic

---

## SUMMARY: BROKEN FIELDS

| Field | DB Values | UI Values | Missing | Coverage |
|-------|-----------|-----------|---------|----------|
| pace_of_life_actual | 4 | 3 | slow | 75% |
| social_atmosphere | 6 | 4 | reserved, very friendly | 67% |
| retirement_community_presence | 7 | 6 | extensive | 86% |
| cultural_events_frequency | 7 | 3 | rare, occasional, frequent, constant | 43% ⚠️ |
| english_proficiency_level | 6 | 2 | moderate, very high, widespread, native | 33% ⚠️ |
| traditional_progressive_lean | 4 | 4 | - | 100% ✅ |
| expat_community_size | 3 | 3 | - | 100% ✅ |

---

## ROOT CAUSE

**CulturePanel.jsx hardcodes all dropdown values** instead of importing from `categoricalValues.js`:

```javascript
// ❌ WRONG (current state):
range={['quiet', 'moderate', 'friendly', 'vibrant']}

// ✅ CORRECT (should be):
range={getValidValues('social_atmosphere')}
```

This causes:
1. Values to drift from database truth
2. New database values to never reach UI
3. Manual updates required every time database changes
4. Impossible to maintain consistency

---

## RECOMMENDATIONS

### Immediate Fix (High Priority)
Update `CulturePanel.jsx` to import and use `getValidValues()` from `categoricalValues.js`:

```javascript
import { getValidValues } from '../../utils/validation/categoricalValues';

// Replace all hardcoded ranges with:
<EditableField
  field="pace_of_life_actual"
  value={town.pace_of_life_actual}
  label="Pace of Life"
  type="select"
  range={getValidValues('pace_of_life_actual')}
  description="General pace of daily life"
/>
```

### Update townDataOptions.js
Add missing fields or import from `categoricalValues.js`:
```javascript
// Lines 176-177 should be:
cultural_events: getValidValues('cultural_events_frequency'),
english_proficiency: getValidValues('english_proficiency_level'),
```

### Verification
After fix, verify all 7 culture fields show complete value lists in admin panel

---

## DATA VALIDATION

The `isValidCategoricalValue()` function in `categoricalValues.js` accepts these values at the database layer, but the UI never allows users/admins to select them, creating a "hidden" value problem.

**This is a classic hardcoding maintenance disaster** - the moment one field changes, the UI breaks out of sync.

