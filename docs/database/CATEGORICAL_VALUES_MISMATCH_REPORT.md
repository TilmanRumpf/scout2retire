# CATEGORICAL VALUES MISMATCH REPORT
**Generated**: 2025-10-19
**Critical Finding**: Database stores NUMERIC values, validation expects TEXT values

## CRITICAL ISSUE: TYPE MISMATCH

### The Problem
The validation file `categoricalValues.js` defines TEXT values like:
- `crime_rate: ['very_low', 'low', 'moderate', 'high', 'very_high']`
- `healthcare_cost: ['very_low', 'low', 'moderate', 'high', 'very_high']`

But the database stores NUMERIC values like:
- `crime_rate: 15, 25, 35, 50, 65`
- `healthcare_cost: 150, 200, 300, 500`

**This is a FUNDAMENTAL schema mismatch!**

---

## FIELD-BY-FIELD ANALYSIS

### 1. CRIME_RATE ❌ CRITICAL MISMATCH

**Validation Expects:**
```javascript
crime_rate: ['very_low', 'low', 'moderate', 'high', 'very_high']
```

**Database Contains (350 towns):**
- "0.9" (1 town, 0.3%)
- "1.1" (2 towns, 0.6%)
- "1.2" (13 towns, 3.7%)
- "1.3" (3 towns, 0.9%)
- "1.4" (1 towns, 0.3%)
- "15" (56 towns, 16.0%)
- "25" (160 towns, 45.7%) ← Most common
- "35" (27 towns, 7.7%)
- "50" (86 towns, 24.6%)
- "65" (1 town, 0.3%)

**Issue**: Database stores numeric crime rates (possibly per 1000 population or similar metric), not categorical text values.

**Suggested Mapping**:
- 0.9-1.4 → "very_low" (20 towns)
- 15 → "low" (56 towns)
- 25 → "moderate" (160 towns)
- 35 → "high" (27 towns)
- 50-65 → "very_high" (87 towns)

---

### 2. NATURAL_DISASTER_RISK ❌ NUMERIC NOT CATEGORICAL

**Validation Expects:**
```javascript
natural_disaster_risk_level: ['minimal', 'low', 'moderate', 'high', 'very_high']
```

**Database Contains (341 towns):**
- "1" (30 towns, 8.8%)
- "2" (84 towns, 24.6%)
- "3" (136 towns, 39.9%) ← Most common
- "4" (14 towns, 4.1%)
- "5" (9 towns, 2.6%)
- "6" (34 towns, 10.0%)
- "7" (34 towns, 10.0%)

**Issue**: Database stores 1-7 numeric scale, not text categories.

**Suggested Mapping**:
- 1 → "minimal" (30 towns)
- 2-3 → "low" (220 towns)
- 4-5 → "moderate" (23 towns)
- 6 → "high" (34 towns)
- 7 → "very_high" (34 towns)

---

### 3. EMERGENCY_SERVICES_QUALITY ❌ NUMERIC NOT CATEGORICAL

**Validation Expects:**
```javascript
emergency_services_quality: ['poor', 'fair', 'good', 'very_good', 'excellent']
```

**Database Contains (78 towns only!):**
- "3" (8 towns, 10.3%)
- "4" (11 towns, 14.1%)
- "5" (13 towns, 16.7%)
- "6" (10 towns, 12.8%)
- "7" (13 towns, 16.7%)
- "8" (23 towns, 29.5%) ← Most common

**Issue**:
1. Only 78/343 towns have data (77% missing!)
2. Database stores 3-8 numeric scale, not text categories

**Suggested Mapping**:
- 3 → "poor" (8 towns)
- 4-5 → "fair" (24 towns)
- 6 → "good" (10 towns)
- 7 → "very_good" (13 towns)
- 8 → "excellent" (23 towns)

---

### 4. ENGLISH_SPEAKING_DOCTORS ❌ BOOLEAN NOT CATEGORICAL

**Validation Expects:**
```javascript
english_speaking_doctors: ['rare', 'limited', 'moderate', 'common', 'widespread']
```

**Database Contains (352 towns):**
- "false" (111 towns, 31.5%)
- "true" (241 towns, 68.5%)

**Issue**: Database stores boolean (true/false), not categorical scale.

**Suggested Mapping**:
- false → "rare" or "limited"
- true → "common" or "widespread"

**Alternative**: Keep as boolean, remove from categorical validation entirely.

---

### 5. HEALTHCARE_COST ❌ NUMERIC NOT CATEGORICAL

**Validation Expects:**
```javascript
healthcare_cost: ['very_low', 'low', 'moderate', 'high', 'very_high']
```

**Database Contains (351 towns):**
- "70" (1 town, 0.3%)
- "150" (29 towns, 8.3%)
- "200" (46 towns, 13.1%)
- "300" (189 towns, 53.8%) ← Most common
- "340" (10 towns, 2.8%)
- "400" (3 towns, 0.9%)
- "450" (11 towns, 3.1%)
- "500" (61 towns, 17.4%)
- "1200" (1 town, 0.3%)

**Issue**: Database stores actual monthly costs in dollars/euros, not categorical text values.

**Suggested Mapping**:
- 70-150 → "very_low" (30 towns)
- 200 → "low" (46 towns)
- 300 → "moderate" (189 towns)
- 340-450 → "high" (24 towns)
- 500-1200 → "very_high" (62 towns)

---

### 6. URBAN_RURAL_CHARACTER ✅ MATCHES!

**Validation Expects:**
```javascript
urban_rural_character: ['urban', 'suburban', 'rural', 'remote']
```

**Database Contains (352 towns):**
- "rural" (116 towns, 33.0%)
- "suburban" (152 towns, 43.2%) ← Most common
- "urban" (84 towns, 23.9%)

**Status**: ✅ Perfect match! (No 'remote' values exist, but that's OK)

---

## SUMMARY OF ISSUES

### Critical Mismatches (5 fields)
1. **crime_rate** - Numeric (0.9-65) vs Text ('very_low' to 'very_high')
2. **natural_disaster_risk** - Numeric (1-7) vs Text ('minimal' to 'very_high')
3. **emergency_services_quality** - Numeric (3-8) vs Text ('poor' to 'excellent')
4. **english_speaking_doctors** - Boolean (true/false) vs Text ('rare' to 'widespread')
5. **healthcare_cost** - Numeric ($70-$1200) vs Text ('very_low' to 'very_high')

### Correct Implementation (1 field)
1. **urban_rural_character** - ✅ Text matches validation

---

## RECOMMENDED ACTIONS

### Option A: Fix Database (Convert to Categorical)
**Pros**: Matches validation, cleaner for UI
**Cons**: Loses precision (crime rate 15 vs 25 becomes just "low" vs "moderate")

### Option B: Fix Validation (Accept Numeric)
**Pros**: Keeps data precision, can display ranges
**Cons**: Need to update all UI components that expect categorical values

### Option C: Dual System (Store Numeric, Display Categorical)
**Pros**: Best of both worlds - precision in DB, friendly in UI
**Cons**: Need mapping layer between DB and UI

**RECOMMENDATION**: **Option C - Dual System**

1. Keep numeric values in database
2. Create mapping functions:
   ```javascript
   // src/utils/categoricalMapping.js
   export function mapCrimeRate(numericValue) {
     if (numericValue < 15) return 'very_low';
     if (numericValue < 25) return 'low';
     if (numericValue < 35) return 'moderate';
     if (numericValue < 50) return 'high';
     return 'very_high';
   }
   ```
3. Update UI components to use mapped values
4. Keep validation for numeric ranges, not text values

---

## DATA COMPLETENESS ISSUES

**CRITICAL FINDING**: Database actually contains **352 towns**, not 343!

The 343 number appears to be outdated. Actual database state:

- **Total towns**: 352 (9 more than expected)
- **emergency_services_quality**: Only 78/352 towns (22%) have data - **265 missing!**
- **crime_rate**: 350/352 towns (99% complete) ✅
- **natural_disaster_risk**: 341/352 towns (97% complete) ✅
- **english_speaking_doctors**: 352/352 towns (100% complete) ✅
- **healthcare_cost**: 351/352 towns (99% complete) ✅
- **urban_rural_character**: 352/352 towns (100% complete) ✅

**Action Items**:
1. Update documentation - database has 352 towns, not 343
2. Fill in missing emergency_services_quality data (265 towns need data)
3. Fill in 1-2 missing values for other fields

---

## FILES TO UPDATE

If choosing Option C (Recommended):

1. **Create**: `src/utils/categoricalMapping.js` - Mapping functions
2. **Update**: `src/utils/validation/categoricalValues.js` - Add numeric validation
3. **Update**: All UI components displaying these fields
4. **Update**: Scoring algorithms using these values
5. **Update**: Admin panels editing these values

---

**Next Steps**:
1. Decide on approach (A, B, or C)
2. Check for duplicate town records
3. Implement chosen solution systematically
4. Add tests for mapping functions
