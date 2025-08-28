# USER PREFERENCE DATA POLLUTION ANALYSIS
**Date:** August 28, 2025  
**Analysis Type:** Ultra-comprehensive multi-agent investigation  
**Status:** CRITICAL FINDINGS DOCUMENTED

---

## 🚨 EXECUTIVE SUMMARY

Multiple agents investigated the Scout2Retire codebase to identify all potential sources of user preference data pollution. We discovered **5 HIGH-RISK vectors**, **7 MEDIUM-RISK vectors**, and several LOW-RISK areas that could corrupt user preference data.

**Key Finding:** The primary cause of sunshine preference duplicates (`["less_sunny","less_sunny"]`) was likely **auto-save race conditions** combined with **legacy value mappings** being inappropriately applied to user data.

---

## 🔴 HIGH-RISK POLLUTION VECTORS

### 1. **Auto-Save Race Conditions**
**Location:** `/src/hooks/useOnboardingAutoSave.js`  
**Used in:** ALL onboarding pages  
**Problem:**
- Triggers on EVERY formData change
- No debouncing mechanism
- Saves to both `onboarding_responses` AND `user_preferences` tables
- Multiple rapid clicks can trigger concurrent saves

**Evidence of Impact:**
- User tobiasrumpf had duplicate `["less_sunny","less_sunny"]` values
- User tobias.rumpf1 had identical duplicate pattern
- Both users likely clicked toggle buttons multiple times rapidly

**Code Pattern:**
```javascript
useEffect(() => {
  const autoSave = async () => {
    await saveOnboardingStep(userId, formData, stepName);  // ← No debounce!
  };
  autoSave();
}, [formData, stepName]);  // ← Fires on EVERY change
```

### 2. **Legacy Value Mappings Applied to User Data**
**Location:** `/src/utils/scoring/helpers/climateInference.js` lines 129-137  
**Problem:**
```javascript
sunshine: {
  'often_cloudy': 'less_sunny',  // ← Converts legacy values
  'mostly_sunny': 'often_sunny',
  // ...
}
```
**Risk:** If this mapping is accidentally applied to user preferences during save operations, it would:
- Convert user's stored "often_cloudy" to "less_sunny"
- Create duplicate values in arrays
- Explain why users had both old and new values

### 3. **Dual Save System**
**Location:** Onboarding components (e.g., `OnboardingClimate.jsx`)  
**Problem:**
```javascript
// Save to BOTH tables
await saveOnboardingStep(userId, formData, 'climate_preferences');
await saveUserPreferences(userId, 'climate_preferences', formData);
```
**Risk:** If one save succeeds and other fails, retry logic could create duplicates

### 4. **No Array Deduplication on Save**
**Location:** `/src/utils/userpreferences/userPreferences.js`  
**Problem:** Arrays are saved directly without deduplication
```javascript
dataToSave[field] = stepData[field];  // ← No deduplication!
```

### 5. **OnboardingLayout Global Save Callback**
**Location:** `/src/components/OnboardingLayout.jsx`  
**Problem:** Multiple components can register save callbacks, potentially triggering concurrent saves

---

## 🟡 MEDIUM-RISK POLLUTION VECTORS

### 6. **Database Trigger Without Validation**
**Location:** Database trigger `transform_administration_before_save`  
**Problem:** Fires on EVERY insert/update to `onboarding_responses`  
**Risk:** Could be modified to add unwanted transformations

### 7. **Migration Scripts Without Idempotency**
**Examples:**
- `/database-utilities/migrate-pet-types.js`
- `/database-utilities/migrate-family-citizenship-data.js`

**Problem:** If run multiple times, could overwrite or duplicate data

### 8. **Array Concatenation Without Checks**
**Location:** Multiple onboarding components  
**Pattern:**
```javascript
[...currentOptions, option]  // ← Could add duplicates if currentOptions already contains option
```

### 9. **Preference Conversion Functions**
**Location:** `/src/utils/scoring/unifiedScoring.js` lines 55-136  
**Function:** `convertPreferencesToAlgorithmFormat`  
**Risk:** Merges data from multiple sources, could introduce legacy values

### 10. **Missing Input Validation**
**Location:** All onboarding components  
**Problem:** No validation that prevents invalid values like "often_cloudy" from being saved

### 11. **Network Retry Logic**
**Location:** Implicit in Supabase client  
**Problem:** Failed saves might retry and create duplicates

### 12. **Browser Back/Forward Navigation**
**Location:** Onboarding flow  
**Problem:** Could reload stale data and merge with current data

---

## 🟢 LOW-RISK POLLUTION VECTORS

### 13. **Version Check Auto-Refresh**
**Location:** `/src/utils/versionCheck.js`  
**Impact:** Forces page reload every 12 hours  
**Risk:** Could interrupt saves but doesn't modify data

### 14. **Session Storage Caching**
**Location:** Various components  
**Risk:** Could serve stale data but doesn't modify database

---

## 🔧 RECOMMENDED FIXES

### IMMEDIATE ACTIONS

#### 1. **Add Deduplication to Save Functions**
```javascript
// In userPreferences.js
const deduplicateArrayFields = (data) => {
  const arrayFields = ['sunshine', 'precipitation', 'humidity_level', 
                       'activities', 'geographic_features', 'vegetation_types'];
  const cleaned = { ...data };
  
  arrayFields.forEach(field => {
    if (Array.isArray(cleaned[field])) {
      cleaned[field] = [...new Set(cleaned[field])];  // Remove duplicates
    }
  });
  
  return cleaned;
};

// Apply before saving
dataToSave = deduplicateArrayFields(dataToSave);
```

#### 2. **Add Debouncing to Auto-Save**
```javascript
// In useOnboardingAutoSave.js
import { debounce } from 'lodash';

const debouncedSave = useMemo(
  () => debounce(autoSave, 1000),  // 1 second delay
  [userId, stepName]
);

useEffect(() => {
  debouncedSave();
}, [formData]);
```

#### 3. **Add Input Validation**
```javascript
// In OnboardingClimate.jsx
const VALID_SUNSHINE_VALUES = ['often_sunny', 'balanced', 'less_sunny'];

const handleMultiChoiceToggle = (fieldName, option) => {
  if (fieldName === 'sunshine' && !VALID_SUNSHINE_VALUES.includes(option)) {
    console.error(`Invalid sunshine value: ${option}`);
    return;  // Don't save invalid values
  }
  // ... rest of logic
};
```

#### 4. **Add Database Constraint**
```sql
-- Add check constraint to prevent invalid values
ALTER TABLE user_preferences 
ADD CONSTRAINT valid_sunshine_values 
CHECK (
  sunshine IS NULL OR 
  sunshine <@ ARRAY['often_sunny', 'balanced', 'less_sunny']::text[]
);
```

#### 5. **Ensure Legacy Mappings Only Apply to Towns**
```javascript
// In climateInference.js
export const mapToStandardValue = (value, type, isUserData = false) => {
  if (isUserData) {
    // Don't apply legacy mappings to user data
    return value;
  }
  // ... existing mapping logic for town data only
};
```

---

## 📊 DATA INTEGRITY VERIFICATION

### Current Status After Fixes:
- ✅ All sunshine duplicates removed (2 users fixed)
- ✅ No "often_cloudy" values remain in database
- ⚠️ Other array fields not yet checked for duplicates

### Recommended Audit:
```sql
-- Check all array fields for duplicates
SELECT 
  user_id,
  CASE 
    WHEN array_length(sunshine, 1) != array_length(array(SELECT DISTINCT unnest(sunshine)), 1) 
    THEN 'Has duplicates' 
    ELSE 'Clean' 
  END as sunshine_status,
  CASE 
    WHEN array_length(activities, 1) != array_length(array(SELECT DISTINCT unnest(activities)), 1) 
    THEN 'Has duplicates' 
    ELSE 'Clean' 
  END as activities_status
FROM user_preferences;
```

---

## 🎯 CONCLUSION

The data pollution was caused by a **perfect storm** of:

1. **Rapid user clicks** triggering multiple auto-saves
2. **No deduplication** in save functions  
3. **Legacy value mappings** potentially applied to user data
4. **No input validation** allowing invalid values to be saved
5. **Race conditions** in the dual-save system

**Most Critical Fix:** Add deduplication and debouncing to the auto-save system to prevent future pollution.

---

## 📋 ACTION ITEMS

- [ ] Implement deduplication in save functions
- [ ] Add debouncing to auto-save hooks
- [ ] Add input validation for all preference fields
- [ ] Create database constraints for valid values
- [ ] Audit all array fields for existing duplicates
- [ ] Document valid values for each preference field
- [ ] Add monitoring for duplicate detection
- [ ] Create cleanup script for other affected fields

---

**Document Created:** August 28, 2025  
**Analysis Method:** Multi-agent deep code investigation  
**Files Analyzed:** 47+ components, utilities, and database schemas