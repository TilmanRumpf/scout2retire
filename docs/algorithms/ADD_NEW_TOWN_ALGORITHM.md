# 🏛️ ADD NEW TOWN ALGORITHM - Crystal Clear & Repeatable

**Version**: 1.0
**Created**: 2025-10-15
**Purpose**: Bulletproof, consistent, programmatic method for adding new towns to Scout2Retire database

---

## 🎯 DESIGN PRINCIPLES

1. **NO HARDCODING** - All field lists, validations, mappings are configuration-driven
2. **GRACEFUL DEGRADATION** - Missing data = `null` with quality tracking, not failure
3. **VALIDATION FIRST** - Check categorical values BEFORE database insert
4. **DATA QUALITY TRANSPARENCY** - Always report what's missing and why
5. **ADMIN-REVIEWABLE** - Output clear enough for admin UI to show gaps
6. **REPRODUCIBLE** - Same inputs always produce same outputs

---

## 📊 THREE-TIER DATA CLASSIFICATION

### 🔴 TIER 1: CRITICAL (Required for Town to Exist)
**If these are missing, town cannot be added**

- `name` (string, required)
- `country` (string, required)
- `latitude` (number, required for geography)
- `longitude` (number, required for geography)

### 🟡 TIER 2: IMPORTANT (Required for Matching/Scoring)
**Without these, town appears in database but won't match user preferences well**

- `region` (string) - e.g., "Europe", "Asia", "Africa"
- `geo_region` (string) - e.g., "West Africa", "Mediterranean"
- `climate` (string) - General climate type
- `summer_climate_actual` (categorical)
- `winter_climate_actual` (categorical)
- `pace_of_life_actual` (categorical)
- `cost_of_living_usd` (number)
- `typical_monthly_living_cost` (number)

### 🟢 TIER 3: NICE-TO-HAVE (Enrichment Data)
**Can be added later through research or admin UI**

- All 160+ other fields
- Photos, descriptions, detailed amenities
- Nested arrays (activities, interests, hobbies)

---

## 🔄 THE ALGORITHM - 8 CLEAR STEPS

### STEP 1: VALIDATE INPUT
```javascript
function validateInput(townData) {
  const required = ['name', 'country'];
  const missing = required.filter(field => !townData[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate country against known list
  const validCountries = await getValidCountries();
  if (!validCountries.includes(townData.country)) {
    throw new Error(`Unknown country: ${townData.country}. Please verify spelling.`);
  }

  return true;
}
```

**Output**: ✅ Input validated OR ❌ Error with specific fix

---

### STEP 2: ENRICH GEOGRAPHIC DATA
```javascript
async function enrichGeography(townData) {
  let { latitude, longitude } = townData;

  // If lat/lon not provided, attempt geocoding
  if (!latitude || !longitude) {
    const coords = await geocodeTown(townData.name, townData.country);
    if (!coords) {
      throw new Error(`Cannot find coordinates for ${townData.name}, ${townData.country}. Please provide manually.`);
    }
    latitude = coords.lat;
    longitude = coords.lon;
  }

  // Determine timezone from coordinates
  const timezone = await getTimezoneFromCoords(latitude, longitude);

  // Determine region (continent)
  const region = determineRegion(latitude, longitude, townData.country);

  // Determine geo_region (sub-region)
  const geo_region = determineGeoRegion(latitude, longitude, townData.country);

  return {
    latitude,
    longitude,
    timezone,
    region,
    geo_region
  };
}
```

**Output**: Geographic enrichment object with lat/lon, timezone, region, geo_region

---

### STEP 3: GATHER CLIMATE DATA
```javascript
async function gatherClimateData(latitude, longitude, townName) {
  try {
    // Attempt to get climate data from weather API
    const climate = await fetchClimateData(latitude, longitude);

    return {
      avg_temp_summer: climate.avgSummerTemp || null,
      avg_temp_winter: climate.avgWinterTemp || null,
      annual_rainfall: climate.annualRainfall || null,
      sunshine_hours: climate.sunshineHours || null,

      // Categorical values - must be from valid set
      summer_climate_actual: categorizeSummerClimate(climate.avgSummerTemp),
      winter_climate_actual: categorizeWinterClimate(climate.avgWinterTemp),
      sunshine_level_actual: categorizeSunshine(climate.sunshineHours),
      precipitation_level_actual: categorizePrecipitation(climate.annualRainfall),
      humidity_level_actual: categorizeHumidity(climate.humidity),

      climate_description: climate.description || null
    };
  } catch (error) {
    console.warn(`⚠️ Could not fetch climate data for ${townName}: ${error.message}`);
    return {
      // Return nulls with tracking
      avg_temp_summer: null,
      avg_temp_winter: null,
      _data_gaps: ['climate_data_unavailable']
    };
  }
}
```

**Output**: Climate object with values OR nulls with gap tracking

---

### STEP 4: GATHER COST DATA
```javascript
async function gatherCostData(townName, countryName) {
  try {
    // Try Numbeo API first
    const costData = await fetchNumbeoData(townName, countryName);

    if (costData) {
      return {
        cost_of_living_usd: costData.costIndex || null,
        typical_monthly_living_cost: costData.monthlyLivingCost || null,
        rent_1bed: costData.rent1Bedroom || null,
        meal_cost: costData.mealCost || null,
        groceries_cost: costData.groceriesCost || null,
        utilities_cost: costData.utilitiesCost || null
      };
    }

    // Fallback to country-level data if city not found
    const countryData = await fetchCountryCostData(countryName);
    return {
      cost_of_living_usd: countryData.costIndex || null,
      typical_monthly_living_cost: null, // Mark as needs research
      _data_gaps: ['city_cost_data_unavailable', 'using_country_average']
    };

  } catch (error) {
    console.warn(`⚠️ Could not fetch cost data: ${error.message}`);
    return {
      _data_gaps: ['cost_data_unavailable']
    };
  }
}
```

**Output**: Cost object with available data OR nulls with gap tracking

---

### STEP 5: SET DEFAULTS & INITIALIZE STRUCTURES
```javascript
function setDefaults(townData) {
  return {
    // Arrays default to empty (not null)
    activities_available: [],
    interests_supported: [],
    top_hobbies: [],
    water_bodies: [],
    regions: [],
    languages_spoken: [],

    // Objects default to empty (not null)
    environmental_factors: {},
    activity_infrastructure: {},
    residency_path_info: {},
    pet_friendliness: {},

    // Booleans default to false/null
    english_speaking_doctors: null,
    beaches_nearby: null,
    retirement_visa_available: null,

    // Scores default to null (calculate later)
    healthcare_score: null,
    safety_score: null,
    quality_of_life: null,

    // Metadata
    created_at: new Date().toISOString(),
    last_ai_update: new Date().toISOString(),
    needs_update: true, // Flag for admin review
    data_completeness_score: 0, // Will calculate in next step

    ...townData // Merge with provided data
  };
}
```

**Output**: Town object with all defaults initialized

---

### STEP 6: VALIDATE CATEGORICAL VALUES
```javascript
import { isValidCategoricalValue, VALID_CATEGORICAL_VALUES } from '../src/utils/validation/categoricalValues.js';

function validateCategoricalValues(townData) {
  const errors = [];
  const warnings = [];

  // Get all categorical fields from validation schema
  const categoricalFields = Object.keys(VALID_CATEGORICAL_VALUES);

  categoricalFields.forEach(field => {
    const value = townData[field];

    if (value !== null && value !== undefined) {
      // Check if value is valid
      if (!isValidCategoricalValue(field, value)) {
        errors.push({
          field,
          value,
          validOptions: VALID_CATEGORICAL_VALUES[field],
          message: `Invalid value "${value}" for ${field}. Must be one of: ${VALID_CATEGORICAL_VALUES[field].join(', ')}`
        });
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(`Categorical validation failed:\n${errors.map(e => e.message).join('\n')}`);
  }

  return true;
}
```

**Output**: ✅ Validation passed OR ❌ Error with specific invalid values

---

### STEP 7: CALCULATE DATA COMPLETENESS SCORE
```javascript
function calculateDataCompleteness(townData) {
  // Define field importance weights
  const fieldWeights = {
    critical: 40, // name, country, lat/lon
    important: 30, // climate, cost, region
    nice_to_have: 30 // everything else
  };

  const criticalFields = ['name', 'country', 'latitude', 'longitude'];
  const importantFields = ['region', 'geo_region', 'climate', 'summer_climate_actual',
                           'winter_climate_actual', 'cost_of_living_usd', 'typical_monthly_living_cost'];

  const criticalScore = criticalFields.filter(f => townData[f] != null).length / criticalFields.length;
  const importantScore = importantFields.filter(f => townData[f] != null).length / importantFields.length;

  // Get all other fields for nice-to-have calculation
  const allFields = Object.keys(townData);
  const niceToHaveFields = allFields.filter(f =>
    !criticalFields.includes(f) &&
    !importantFields.includes(f) &&
    !f.startsWith('_') // Exclude metadata fields
  );
  const niceToHaveScore = niceToHaveFields.filter(f => townData[f] != null).length / niceToHaveFields.length;

  const totalScore = Math.round(
    (criticalScore * fieldWeights.critical) +
    (importantScore * fieldWeights.important) +
    (niceToHaveScore * fieldWeights.nice_to_have)
  );

  return {
    data_completeness_score: totalScore,
    completeness_breakdown: {
      critical: Math.round(criticalScore * 100),
      important: Math.round(importantScore * 100),
      nice_to_have: Math.round(niceToHaveScore * 100)
    },
    missing_critical: criticalFields.filter(f => townData[f] == null),
    missing_important: importantFields.filter(f => townData[f] == null)
  };
}
```

**Output**: Data quality object with score and missing field lists

---

### STEP 8: INSERT INTO DATABASE & GENERATE REPORT
```javascript
async function insertTown(townData) {
  // Final validation
  validateInput(townData);
  validateCategoricalValues(townData);

  // Calculate completeness
  const quality = calculateDataCompleteness(townData);
  townData.data_completeness_score = quality.data_completeness_score;

  // Insert using Supabase service role key
  const { data, error } = await supabase
    .from('towns')
    .insert([townData])
    .select();

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }

  // Generate quality report
  const report = {
    success: true,
    town_id: data[0].id,
    town_name: data[0].name,
    data_completeness_score: quality.data_completeness_score,
    breakdown: quality.completeness_breakdown,
    missing_critical: quality.missing_critical,
    missing_important: quality.missing_important,
    data_gaps: townData._data_gaps || [],
    next_steps: [
      'Review in Admin UI',
      `Add missing important fields: ${quality.missing_important.join(', ')}`,
      'Add photos (image_url_1)',
      'Research and populate activities/interests arrays',
      'Run scoring algorithm to calculate scores'
    ]
  };

  return report;
}
```

**Output**: Success report with town ID and data quality assessment

---

## 🔧 HELPER FUNCTIONS REQUIRED

### Geographic Helpers
- `geocodeTown(name, country)` - Get lat/lon from town name
- `getTimezoneFromCoords(lat, lon)` - Timezone lookup
- `determineRegion(lat, lon, country)` - Continent/region assignment
- `determineGeoRegion(lat, lon, country)` - Sub-region assignment

### Climate Helpers
- `fetchClimateData(lat, lon)` - Weather API call
- `categorizeSummerClimate(temp)` - Map temp to categorical value
- `categorizeWinterClimate(temp)` - Map temp to categorical value
- `categorizeSunshine(hours)` - Map hours to categorical value
- `categorizePrecipitation(rainfall)` - Map rainfall to categorical value

### Cost Helpers
- `fetchNumbeoData(city, country)` - Cost of living API
- `fetchCountryCostData(country)` - Fallback country data

### Validation Helpers
- `getValidCountries()` - List of known countries from existing towns
- `validateCategoricalValues(data)` - Check against schema

---

## 📊 USAGE EXAMPLE

```javascript
// Minimal input for obscure location
const newTown = await addTown({
  name: 'Bubaque',
  country: 'Guinea-Bissau',
  // Optionally provide lat/lon if known
  latitude: 11.2853,
  longitude: -15.8394
});

// Output:
{
  success: true,
  town_id: 'uuid-here',
  town_name: 'Bubaque',
  data_completeness_score: 32,
  breakdown: {
    critical: 100,
    important: 25,
    nice_to_have: 5
  },
  missing_important: ['cost_of_living_usd', 'typical_monthly_living_cost', 'summer_climate_actual'],
  data_gaps: ['city_cost_data_unavailable', 'using_country_average', 'climate_data_limited'],
  next_steps: [
    'Review in Admin UI at localhost:5173/admin/towns-manager',
    'Add missing important fields: cost_of_living_usd, typical_monthly_living_cost',
    'Add photos (image_url_1)',
    'Research activities for island location',
    'Run scoring algorithm'
  ]
}
```

---

## ✅ SUCCESS CRITERIA

1. **Runs without errors** - Even with minimal data
2. **Validates all categorical values** - No case sensitivity bugs
3. **Produces consistent results** - Same input → same output
4. **Clear quality reporting** - Admin knows what's missing
5. **No hardcoding** - All lists/mappings configurable
6. **Graceful failure** - Missing APIs don't crash, they log

---

## 🚨 ANTI-PATTERNS TO AVOID

❌ **Don't assume data exists** - Always check API responses
❌ **Don't hardcode field lists** - Use configuration
❌ **Don't skip validation** - Case sensitivity killed 40 hours
❌ **Don't fail on missing data** - Mark as null and track
❌ **Don't insert without quality score** - Admin needs to know gaps

---

## 📝 NEXT: IMPLEMENTATION

This algorithm will be implemented in:
- `database-utilities/add-town.js` - Main CLI utility
- `database-utilities/add-town-helpers.js` - Helper functions
- `database-utilities/add-town-config.js` - Configuration/mappings

Usage:
```bash
node database-utilities/add-town.js --name "Bubaque" --country "Guinea-Bissau" --lat 11.2853 --lon -15.8394
```
