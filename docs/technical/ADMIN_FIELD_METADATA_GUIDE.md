# Admin Field Metadata System - Complete Guide

**Created:** 2025-10-17
**Purpose:** Comprehensive metadata system for inline editing in Admin Score Breakdown Panel

---

## Overview

The Admin Field Metadata system provides complete type information, validation rules, and descriptions for every field displayed in the Admin Score Breakdown Panel. This enables:

- **Inline editing** with proper input types (number, select, boolean, etc.)
- **Real-time validation** before database updates
- **Contextual help** via tooltips explaining what each field means
- **Auto-formatting** for display (units, decimals, etc.)
- **Type-safe parsing** of user input

---

## File Location

```
src/utils/admin/adminFieldMetadata.js
```

---

## Core Data Structure

Each field has this metadata:

```javascript
{
  label: 'Healthcare Score',              // User-friendly display name
  type: 'number',                         // Data type: number, string, boolean, select, array, text
  range: '0.0-10.0',                      // Valid range or options
  step: 0.1,                              // Step increment (for numbers)
  description: 'Overall healthcare...',   // Tooltip/help text
  editable: true,                         // Can it be edited?
  unit: '/10.0',                          // Unit of measurement
  category: 'healthcare',                 // Which section (healthcare, safety, infrastructure, legal, calculated)
  validator: (val) => val >= 0 && val <= 10  // Custom validation function
}
```

---

## Field Categories

### Healthcare (30 admin points)
- `healthcare_score` - 0.0-10.0 base score
- `hospital_count` - Integer count with auto-bonus
- `nearest_major_hospital_km` - Distance with auto-bonus
- `emergency_services_quality` - Select: poor/basic/functional/good/excellent
- `english_speaking_doctors` - Boolean
- `insurance_availability_rating` - 0-10 integer
- `healthcare_cost` - USD/month

### Safety (25 admin points)
- `safety_score` - 0.0-10.0 base score
- `crime_rate` - Select: very_low/low/moderate/high/very_high
- `environmental_health_rating` - 0-10 integer (conditional 15 points)
- `natural_disaster_risk` - 0-10 integer
- `political_stability_rating` - 0-100 integer (worth 10 points)

### Infrastructure (15 admin points)
- `walkability` - 0-100 integer
- `air_quality_index` - 0-500 AQI scale
- `airport_distance` - Kilometers
- `government_efficiency_rating` - 0-100 (divided by 10 for score)

### Legal & Admin (10 points)
- `visa_requirements` - Text summary
- `visa_on_arrival_countries` - Array of country codes
- `retirement_visa_available` - Boolean (worth 8 points)
- `tax_treaty_us` - Boolean
- `tax_haven_status` - Boolean
- `income_tax_rate_pct` - 0-100% with thresholds
- `property_tax_rate_pct` - 0-10% with thresholds
- `sales_tax_rate_pct` - 0-30% with thresholds
- `foreign_income_taxed` - Boolean
- `easy_residency_countries` - Array of country codes

### Calculated (READ ONLY)
- `overall_score` - 0-100 (weighted average)
- `admin_score` - 0-100 (admin category score)

---

## Usage Examples

### 1. Get Field Metadata

```javascript
import { getFieldMetadata } from '@/utils/admin/adminFieldMetadata';

const metadata = getFieldMetadata('healthcare_score');
console.log(metadata.label);        // "Healthcare Score"
console.log(metadata.type);         // "number"
console.log(metadata.range);        // "0.0-10.0"
console.log(metadata.description);  // "Overall healthcare quality..."
```

### 2. Validate User Input

```javascript
import { validateFieldValue } from '@/utils/admin/adminFieldMetadata';

const result = validateFieldValue('healthcare_score', 7.5);
if (result.valid) {
  console.log('Valid value!');
} else {
  console.error(result.error);  // "Must be between 0.0 and 10.0"
}

// Examples:
validateFieldValue('healthcare_score', 7.5);   // ✅ { valid: true, error: null }
validateFieldValue('healthcare_score', 15);    // ❌ { valid: false, error: "Must be between 0.0 and 10.0" }
validateFieldValue('hospital_count', 5);       // ✅ { valid: true, error: null }
validateFieldValue('hospital_count', 5.7);     // ❌ { valid: false, error: "Invalid value..." }
validateFieldValue('crime_rate', 'low');       // ✅ { valid: true, error: null }
validateFieldValue('crime_rate', 'medium');    // ❌ { valid: false, error: "Must be one of: very_low, low, ..." }
```

### 3. Format for Display

```javascript
import { formatFieldValue } from '@/utils/admin/adminFieldMetadata';

formatFieldValue('healthcare_score', 7.5);     // "7.5 /10.0"
formatFieldValue('hospital_count', 12);        // "12 count"
formatFieldValue('nearest_major_hospital_km', 3.2);  // "3.2 km"
formatFieldValue('english_speaking_doctors', true);  // "Yes"
formatFieldValue('crime_rate', 'low');         // "low"
formatFieldValue('visa_on_arrival_countries', ['USA', 'CAN']);  // "USA, CAN"
```

### 4. Parse User Input

```javascript
import { parseFieldInput } from '@/utils/admin/adminFieldMetadata';

parseFieldInput('healthcare_score', '7.5');    // 7.5 (number)
parseFieldInput('hospital_count', '12');       // 12 (number)
parseFieldInput('english_speaking_doctors', 'yes');  // true (boolean)
parseFieldInput('crime_rate', 'low');          // "low" (string)
parseFieldInput('visa_on_arrival_countries', 'USA,CAN,UK');  // ['USA', 'CAN', 'UK'] (array)
```

### 5. Get All Fields by Category

```javascript
import { getFieldsByCategory } from '@/utils/admin/adminFieldMetadata';

const healthcareFields = getFieldsByCategory('healthcare');
// Returns object with: healthcare_score, hospital_count, nearest_major_hospital_km, etc.

const safetyFields = getFieldsByCategory('safety');
// Returns object with: safety_score, crime_rate, environmental_health_rating, etc.
```

### 6. Get Only Editable Fields

```javascript
import { getEditableFields } from '@/utils/admin/adminFieldMetadata';

const editableFields = getEditableFields();
// Returns object with all editable fields (excludes overall_score, admin_score)

Object.entries(editableFields).forEach(([fieldName, metadata]) => {
  console.log(`${metadata.label}: ${metadata.description}`);
});
```

---

## Inline Editing Component Example

```jsx
import React, { useState } from 'react';
import { getFieldMetadata, validateFieldValue, formatFieldValue, parseFieldInput } from '@/utils/admin/adminFieldMetadata';
import toast from 'react-hot-toast';
import supabase from '@/utils/supabaseClient';

function InlineEditField({ townId, fieldName, currentValue, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const metadata = getFieldMetadata(fieldName);

  if (!metadata) return <span>Unknown field</span>;

  const displayValue = formatFieldValue(fieldName, currentValue);

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(currentValue ?? '');
  };

  const handleSave = async () => {
    // Parse input
    const parsedValue = parseFieldInput(fieldName, inputValue);

    // Validate
    const validation = validateFieldValue(fieldName, parsedValue);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Update database
    try {
      const { error } = await supabase
        .from('towns')
        .update({ [fieldName]: parsedValue })
        .eq('id', townId);

      if (error) throw error;

      toast.success(`${metadata.label} updated!`);
      setIsEditing(false);
      onUpdate?.(fieldName, parsedValue);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue('');
  };

  if (!metadata.editable) {
    return (
      <div className="text-gray-500 italic" title={metadata.description}>
        {displayValue} (calculated)
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span title={metadata.description}>{displayValue}</span>
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ✏️ Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {metadata.type === 'number' && (
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          step={metadata.step}
          className="px-2 py-1 border rounded w-24"
          placeholder={metadata.range}
        />
      )}

      {metadata.type === 'boolean' && (
        <select
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )}

      {metadata.type === 'select' && (
        <select
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          {metadata.range.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {(metadata.type === 'text' || metadata.type === 'string') && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="px-2 py-1 border rounded flex-1"
        />
      )}

      <button onClick={handleSave} className="text-green-600 hover:text-green-800">
        ✓ Save
      </button>
      <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
        ✗ Cancel
      </button>
    </div>
  );
}

export default InlineEditField;
```

---

## Key Auto-Bonus/Penalty Logic

### Healthcare Score
**Base:** `healthcare_score` (0.0-10.0)

**Auto-bonuses applied by system:**
- Hospital count: 10+ = +1.0, 5-9 = +0.7, 2-4 = +0.5, 1 = +0.3
- Hospital distance: <5km = +1.0, 5-10km = +0.7, 10-30km = +0.5, 30-60km = +0.3, >60km = 0

**Formula:** `min((healthcare_score / 10) * 3.0, 3.0) + hospitalBonus + distanceBonus`

**Max calculated:** ~5.3 points (scales to 30 admin points based on user preference)

### Safety Score
**Base:** `safety_score` (0.0-10.0)

**Auto-adjustments:**
- Crime rate: very_low = +0.5, low = +0.2, moderate = 0, high = -0.3, very_high = -0.5
- Environmental: If user sensitive and rating ≥4, may add bonus

**Max:** 10.0 (scales to 25 admin points based on user preference)

### Government Efficiency
**Base:** `government_efficiency_rating` (0-100)

**Conversion:** `rating / 10` = 0-10 scale

**Worth:** 15 admin points with gradual scoring

---

## Validation Rules Summary

| Field Type | Validation |
|------------|------------|
| `healthcare_score` | 0.0-10.0, step 0.1 |
| `hospital_count` | 0-100, integer only |
| `nearest_major_hospital_km` | 0-999, decimals allowed |
| `emergency_services_quality` | Must be: poor, basic, functional, good, excellent |
| `english_speaking_doctors` | Boolean only |
| `insurance_availability_rating` | 0-10, integer only |
| `healthcare_cost` | 0-10000 USD |
| `safety_score` | 0.0-10.0, step 0.1 |
| `crime_rate` | Must be: very_low, low, moderate, high, very_high |
| `environmental_health_rating` | 0-10, integer only |
| `natural_disaster_risk` | 0-10, integer only |
| `political_stability_rating` | 0-100, integer only |
| `walkability` | 0-100, integer only |
| `air_quality_index` | 0-500, integer only |
| `airport_distance` | 0-1000 km |
| `government_efficiency_rating` | 0-100, integer only |
| `visa_requirements` | Text, max 500 chars |
| `visa_on_arrival_countries` | Array of strings |
| `retirement_visa_available` | Boolean only |
| `tax_treaty_us` | Boolean only |
| `tax_haven_status` | Boolean only |
| `income_tax_rate_pct` | 0-100% |
| `property_tax_rate_pct` | 0-10% |
| `sales_tax_rate_pct` | 0-30% |
| `foreign_income_taxed` | Boolean only |

---

## Integration with ScoreBreakdownPanel

To add inline editing to ScoreBreakdownPanel.jsx:

1. Import the metadata system:
```javascript
import {
  getFieldMetadata,
  validateFieldValue,
  formatFieldValue
} from '../utils/admin/adminFieldMetadata';
```

2. Replace the `DataField` component with inline editing support
3. Add update handlers that:
   - Validate input using `validateFieldValue()`
   - Update database via Supabase
   - Refresh town data
   - Show toast notifications

---

## Related Files

- **Metadata source:** `src/utils/admin/adminFieldMetadata.js`
- **Panel UI:** `src/components/ScoreBreakdownPanel.jsx`
- **Scoring logic:** `src/utils/scoring/categories/adminScoring.js`
- **Healthcare calc:** `src/utils/scoring/helpers/calculateHealthcareScore.js`
- **Safety calc:** `src/utils/scoring/helpers/calculateSafetyScore.js`
- **Categorical values:** `src/utils/validation/categoricalValues.js`

---

## Future Enhancements

1. **Bulk edit mode** - Edit multiple fields at once
2. **Field history** - Track who changed what when
3. **Auto-recalculation** - Trigger score recalc on field update
4. **Preset templates** - Quick-fill common field combinations
5. **Field dependencies** - Show warnings when related fields are inconsistent

---

## Testing Checklist

Before deploying inline editing:

- [ ] All number fields accept valid ranges
- [ ] Step increments work correctly (0.1 for scores, 1 for integers)
- [ ] Select fields show all valid options
- [ ] Boolean fields toggle properly
- [ ] Array fields parse comma-separated input
- [ ] Validation errors show helpful messages
- [ ] Unit labels display correctly
- [ ] Calculated fields are disabled
- [ ] Tooltips show descriptions
- [ ] Database updates succeed
- [ ] UI refreshes after save
- [ ] Cancel restores original value

---

**Last Updated:** 2025-10-17
**Status:** Complete metadata system ready for integration
