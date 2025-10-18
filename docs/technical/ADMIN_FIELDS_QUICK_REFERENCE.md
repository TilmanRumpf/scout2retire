# Admin Fields Quick Reference

**Quick lookup for all admin fields in Score Breakdown Panel**
**Created:** 2025-10-17

---

## Healthcare Section (30 admin points max)

| Field | Type | Range | Unit | Editable | Auto-Bonus/Penalty |
|-------|------|-------|------|----------|-------------------|
| `healthcare_score` | Number | 0.0-10.0 | /10.0 | ✅ | Base score × 3.0 capped at 3.0 pts |
| `hospital_count` | Number | 0-100 (int) | count | ✅ | 10+ = +1.0, 5-9 = +0.7, 2-4 = +0.5, 1 = +0.3 |
| `nearest_major_hospital_km` | Number | 0-999 | km | ✅ | <5 = +1.0, 5-10 = +0.7, 10-30 = +0.5, 30-60 = +0.3, >60 = 0 |
| `emergency_services_quality` | Select | poor/basic/functional/good/excellent | - | ✅ | None (display only) |
| `english_speaking_doctors` | Boolean | true/false | - | ✅ | None (display only) |
| `insurance_availability_rating` | Number | 0-10 (int) | /10 | ✅ | None (display only) |
| `healthcare_cost` | Number | 0-10000 | USD/month | ✅ | None (display only) |

**Healthcare Formula:** `min((healthcare_score/10)*3.0, 3.0) + hospitalBonus + distanceBonus` → scales to 30 points based on user preference

---

## Safety Section (25 admin points max)

| Field | Type | Range | Unit | Editable | Auto-Bonus/Penalty |
|-------|------|-------|------|----------|-------------------|
| `safety_score` | Number | 0.0-10.0 | /10.0 | ✅ | Base score (capped at 7.0) |
| `crime_rate` | Select | very_low/low/moderate/high/very_high | - | ✅ | very_low = +0.5, low = +0.2, mod = 0, high = -0.3, very_high = -0.5 |
| `environmental_health_rating` | Number | 0-10 (int) | /10 | ✅ | Conditional 15 points if user sensitive + rating ≥4 |
| `natural_disaster_risk` | Number | 0-10 (int) | /10 | ✅ | None (display only) |
| `political_stability_rating` | Number | 0-100 (int) | /100 | ✅ | Worth 10 admin points (gradual scoring) |

**Safety Formula:** `safety_score + crimeImpact` → scales to 25 points based on user preference

---

## Infrastructure Section (15 admin points max)

| Field | Type | Range | Unit | Editable | Notes |
|-------|------|-------|------|----------|-------|
| `walkability` | Number | 0-100 (int) | /100 | ✅ | Display only (not in scoring) |
| `air_quality_index` | Number | 0-500 | AQI | ✅ | 0-50=Good, 51-100=Moderate, 101-150=Sensitive, 151-200=Unhealthy, 201+=Very Unhealthy |
| `airport_distance` | Number | 0-1000 | km | ✅ | Display only |
| `government_efficiency_rating` | Number | 0-100 (int) | /100 | ✅ | Divided by 10 = Infrastructure score (worth 15 admin points) |

**Infrastructure Score:** `government_efficiency_rating / 10` → scales to 15 points based on user preference

---

## Legal & Admin Section (10 admin points max)

| Field | Type | Range | Unit | Editable | Scoring Impact |
|-------|------|-------|------|----------|----------------|
| `visa_requirements` | Text | text | - | ✅ | Display only |
| `visa_on_arrival_countries` | Array | array of strings | - | ✅ | +10 points if user citizenship matches |
| `retirement_visa_available` | Boolean | true/false | - | ✅ | +8 points if user wants easy visa access |
| `tax_treaty_us` | Boolean | true/false | - | ✅ | Small bonus in tax scoring |
| `tax_haven_status` | Boolean | true/false | - | ✅ | Bonus in tax scoring |
| `income_tax_rate_pct` | Number | 0-100 | % | ✅ | 0-10%=excellent, 10-20%=good, 20-30%=fair, 30-40%=poor, 40%+=very high |
| `property_tax_rate_pct` | Number | 0-10 | % | ✅ | 0-1%=excellent, 1-2%=good, 2-3%=fair, 3-4%=poor, 4%+=very high |
| `sales_tax_rate_pct` | Number | 0-30 | % | ✅ | 0-10%=excellent, 10-17%=good, 17-22%=fair, 22-27%=poor, 27%+=very high |
| `foreign_income_taxed` | Boolean | true/false | - | ✅ | false = bonus |
| `easy_residency_countries` | Array | array of strings | - | ✅ | +10 points if user citizenship matches |

---

## Calculated Fields (READ ONLY)

| Field | Type | Range | Unit | Editable | Description |
|-------|------|-------|------|----------|-------------|
| `overall_score` | Number | 0-100 | /100 | ❌ | Weighted average of all category scores |
| `admin_score` | Number | 0-100 | /100 | ❌ | Admin category score (worth 20% of overall) |

---

## Admin Score Breakdown (100 points total)

1. **Healthcare:** 30 points
   - Base: `healthcare_score` (0-10) → converted to 0-3 pts
   - Auto-bonus: `hospital_count` → 0-1.0 pts
   - Auto-bonus: `nearest_major_hospital_km` → 0-1.0 pts
   - **Max calculated:** ~5.3 pts → scaled to 30 admin pts based on user preference

2. **Safety:** 25 points
   - Base: `safety_score` (0-10) capped at 7.0
   - Auto-adjust: `crime_rate` → ±0.5 pts
   - **Max calculated:** ~7.5 pts → scaled to 25 admin pts based on user preference

3. **Infrastructure:** 15 points
   - Source: `government_efficiency_rating` / 10
   - **Max:** 10.0 → scaled to 15 admin pts based on user preference

4. **Visa/Residency:** 10 points
   - Easy access match: 10 pts
   - Retirement visa: 8 pts
   - Basic: 5 pts

5. **Environmental (conditional):** 15 points
   - Only if user marks as 'sensitive'
   - Must have `environmental_health_rating` ≥ 4

6. **Political Stability:** 10 points
   - Source: `political_stability_rating` / 10
   - Gradual scoring based on user preference

---

## User Preference Levels

Fields with gradual scoring use these preference levels:

- **basic** - Minimal requirements (4.0+ score = full points)
- **functional** - LINEAR SCALING (score/10 * maxPoints for real differentiation)
- **good** - High standards (7.0+ score = full points)

Example: If user wants "functional" healthcare (30 pts max) and town has 7.5 calculated score:
- Percentage: 7.5 / 10 = 0.75
- Points: 30 × 0.75 = 22.5 pts

---

## Field Type Legend

- **Number:** Numeric input (integer or decimal)
- **Select:** Dropdown with predefined options
- **Boolean:** Yes/No toggle
- **Text:** Free-form text input
- **Array:** Comma-separated list (parsed to array)

---

## Validation Quick Check

✅ **Valid Examples:**
```javascript
healthcare_score: 7.5       // 0.0-10.0 ✓
hospital_count: 12          // integer ✓
crime_rate: 'low'           // from list ✓
english_speaking_doctors: true  // boolean ✓
visa_on_arrival_countries: ['USA', 'CAN']  // array ✓
```

❌ **Invalid Examples:**
```javascript
healthcare_score: 15        // >10.0 ✗
hospital_count: 5.7         // not integer ✗
crime_rate: 'medium'        // not in list ✗
english_speaking_doctors: 'yes'  // not boolean ✗
visa_on_arrival_countries: 'USA,CAN'  // not array (will auto-parse though) ⚠️
```

---

## Usage in Code

```javascript
import { getFieldMetadata, validateFieldValue, formatFieldValue } from '@/utils/admin/adminFieldMetadata';

// Get metadata
const meta = getFieldMetadata('healthcare_score');
console.log(meta.range);  // "0.0-10.0"

// Validate
const result = validateFieldValue('healthcare_score', 7.5);
if (result.valid) { /* save to DB */ }

// Format for display
const display = formatFieldValue('healthcare_score', 7.5);
console.log(display);  // "7.5 /10.0"
```

---

## Database Update Example

```javascript
import supabase from '@/utils/supabaseClient';
import { validateFieldValue } from '@/utils/admin/adminFieldMetadata';

async function updateAdminField(townId, fieldName, newValue) {
  // Validate first
  const validation = validateFieldValue(fieldName, newValue);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Update database
  const { data, error } = await supabase
    .from('towns')
    .update({ [fieldName]: newValue })
    .eq('id', townId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Usage
await updateAdminField(townId, 'healthcare_score', 8.5);
await updateAdminField(townId, 'hospital_count', 12);
await updateAdminField(townId, 'crime_rate', 'low');
```

---

## Common Gotchas

1. **Integer vs Decimal:**
   - `healthcare_score`, `safety_score` → decimals allowed (step 0.1)
   - `hospital_count`, `walkability` → integers only (step 1)

2. **Scale Differences:**
   - Most scores: 0-10
   - `government_efficiency_rating`, `political_stability_rating`: 0-100
   - `air_quality_index`: 0-500
   - Remember to convert when displaying!

3. **Calculated Fields:**
   - `overall_score`, `admin_score` are READ ONLY
   - They recalculate when underlying fields change
   - Don't try to edit them directly

4. **Auto-Bonuses:**
   - Changing `hospital_count` affects calculated healthcare score
   - Changing `crime_rate` affects calculated safety score
   - System applies bonuses automatically - don't add manually

5. **Array Fields:**
   - Must be actual arrays in database: `['USA', 'CAN']`
   - Not comma-separated strings: `'USA,CAN'`
   - Parser will auto-convert if needed

---

**See Also:**
- Full guide: `docs/technical/ADMIN_FIELD_METADATA_GUIDE.md`
- Source code: `src/utils/admin/adminFieldMetadata.js`
- Panel UI: `src/components/ScoreBreakdownPanel.jsx`
- Scoring logic: `src/utils/scoring/categories/adminScoring.js`

**Last Updated:** 2025-10-17
