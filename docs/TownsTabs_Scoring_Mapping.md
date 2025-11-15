# Towns Manager Tabs → Scoring System Mapping

**Report Date:** November 13, 2025
**Purpose:** Field-level mapping between Towns Manager tabs and scoring algorithms
**Author:** System Architecture Analysis

---

## Executive Summary

This report provides complete field-level mapping between the 11 Towns Manager tabs and the 6 scoring categories. Each tab section documents:
1. **Fields on this tab** - Field labels, internal keys, data types, storage paths
2. **Link to scoring logic** - Which scoring file uses the field and how
3. **Expected value constraints** - Valid enums/ranges from `categoricalValues.js` and `adjacencyRules.js`
4. **AI Update Risk Notes** - Fields that require strict validation vs. safe for free-form AI

**Key Findings:**
- **170+ fields** mapped across 11 tabs
- **6 scoring categories** (Region 30%, Climate 15%, Culture 15%, Hobbies 10%, Admin 20%, Cost 10%)
- **24 enum fields** require strict validation against `categoricalValues.js`
- **9 adjacency rules** define "compatible but not exact" matches (climate 70% credit, culture/region 50% credit)

---

## 📊 Scoring Weight Distribution

| Scoring Category | Weight | Primary Tabs | Files |
|------------------|--------|--------------|-------|
| **Region** | 30% | Region | `regionScoring.js` |
| **Climate** | 15% | Climate | `climateScoring.js` |
| **Culture** | 15% | Culture, Activities | `cultureScoring.js` |
| **Hobbies** | 10% | Hobbies | `hobbiesScoring.js` |
| **Admin** | 20% | Healthcare, Safety, Infrastructure, Admin | `adminScoring.js` |
| **Cost** | 10% | Costs | `costScoring.js` |

---

## Tab 1: Overview

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Town Name** | `town_name` | string | `town.town_name` | ❌ Display-only |
| **Country** | `country` | string | `town.country` | ✅ Region scoring (country match = 40 pts) |
| **State/Region Code** | `state_code` or `region` | string | `town.state_code` | ✅ Region scoring (US state matching) |
| **Description** | `description` | text (500 chars) | `town.description` | ❌ Display-only (marketing) |
| **Verbose Description** | `verbose_description` | text (2000 chars) | `town.verbose_description` | ❌ Display-only (marketing) |
| **Summary Statement** | `summary_statement` | text (200 chars) | `town.summary_statement` | ❌ Display-only (marketing) |
| **Overall Score** | `overall_score` | number (0-100) | `town.overall_score` | ❌ Calculated field (not input) |
| **Image URL 1-3** | `image_url_1`, `image_url_2`, `image_url_3` | string (URL) | `town.image_url_*` | ❌ Display-only |
| **Published Status** | `published` | boolean | `town.published` | ❌ Admin metadata |

### Link to Scoring Logic

**Country/State Matching:**
- **File:** `regionScoring.js` lines 100-117
- **How Used:** Exact country match = 40 points (44% of Region category max)
- **US State Handling:** Lines 104-109 check if user selected US state (e.g., "Florida") and matches against `town.region` when `town.country === "United States"`

**Region (geo_region, regions) Matching:**
- **File:** `regionScoring.js` lines 119-140
- **How Used:** Region match (without exact country) = 30 points (33% of Region category max)
- **Format:** `town.regions` is array, `town.geo_region` is comma-separated string

### Expected Value Constraints

| Field | Constraint Type | Valid Values / Format |
|-------|-----------------|----------------------|
| `town_name` | string | Free-form, but must be real town name |
| `country` | string | Free-form (no strict enum), case-insensitive matching |
| `state_code` | string | US states: Alabama, Alaska, ... Wyoming (50 states) |
| `description` | text | 500 characters max, marketing copy |
| `verbose_description` | text | 2000 characters max, detailed marketing copy |
| `summary_statement` | text | 200 characters max, one-line summary |
| `overall_score` | number | 0-100 (calculated, not manually set) |
| `image_url_*` | URL | Valid image URL format |
| `published` | boolean | true/false |

**Source:** US states list hardcoded in `regionScoring.js` lines 82-90

### AI Update Risk Notes

**🟢 SAFE for AI (free-form text):**
- `description` - Marketing copy, no scoring impact
- `verbose_description` - Extended marketing copy
- `summary_statement` - One-liner, no scoring impact

**🟡 MEDIUM RISK (validates against data, not enum):**
- `town_name` - Must be real town name, but no strict validation
- `country` - Must be real country, case-insensitive scoring logic handles variations
- `state_code` - Must match US state list if country is "United States"

**🔴 HIGH RISK (affects scoring):**
- `region` / `state_code` - Used in Region scoring (30% weight), must be accurate

**🚫 NEVER AUTO-UPDATE:**
- `overall_score` - Calculated field, will be overwritten by scoring system
- `published` - Admin decision, not data field
- `image_url_*` - Should be manually uploaded, not AI-generated

**Validation Required:**
- Before AI update: Verify town/country/state exist in real world
- After AI update: Check country is in database's countries list

---

## Tab 2: Region

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Country** | `country` | string | `town.country` | ✅ Region scoring (40 pts) |
| **Region/State** | `region` | string | `town.region` | ✅ Region scoring (30 pts for region match) |
| **Geographic Features** | `geographic_features_actual` | multiselect array | `town.geographic_features_actual` | ✅ Region scoring (30 pts) |
| **Vegetation Type** | `vegetation_type_actual` | multiselect array | `town.vegetation_type_actual` | ✅ Region scoring (20 pts) |
| **Population** | `population` | number | `town.population` | ❌ Display-only |
| **Population Density** | `population_density_actual` | string (enum) | `town.population_density_actual` | ❌ Available but unscored |
| **Altitude (meters)** | `altitude_meters` | number | `town.altitude_meters` | ❌ Display-only |
| **Latitude** | `latitude` | number | `town.latitude` | ❌ Display-only (geocoding) |
| **Longitude** | `longitude` | number | `town.longitude` | ❌ Display-only (geocoding) |
| **Regions (multi-classification)** | `regions` | array | `town.regions` | ✅ Region scoring (30 pts fallback) |
| **Geo Region (comma-separated)** | `geo_region` | string | `town.geo_region` | ✅ Region scoring (30 pts fallback) |

### Link to Scoring Logic

**Geographic Features Matching:**
- **File:** `regionScoring.js` lines 152-223
- **How Used:**
  - Exact match = 30 points (full credit)
  - Adjacent match (e.g., coastal ↔ island) = 15 points (50% credit)
  - No match = 0 points
- **Adjacency Rules:** `adjacencyRules.js` lines 145-155 (GEOGRAPHIC_FEATURES_ADJACENCY)
  - Coastal ↔ island, lake, river (all water access)
  - Mountain ↔ valley, forest (often found together)
  - Lake ↔ river (water features)

**Vegetation Type Matching:**
- **File:** `regionScoring.js` lines 228-293
- **How Used:**
  - Exact match = 20 points (full credit)
  - Adjacent match (e.g., mediterranean ↔ subtropical) = 10 points (50% credit)
  - No match = 0 points
- **Adjacency Rules:** `adjacencyRules.js` lines 165-171 (VEGETATION_ADJACENCY)
  - Mediterranean ↔ subtropical (warm, dry climates)
  - Subtropical ↔ tropical
  - Forest ↔ grassland

**Region/Country/State Matching:**
- See Overview tab section above
- **Critical:** Case-insensitive matching (lines 19, 124, 136 use `compareIgnoreCase()` and `normalize()`)

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `geographic_features_actual` | **STRICT ENUM** (multiselect) | `coastal`, `mountain`, `island`, `lake`, `river`, `valley`, `desert`, `forest`, `plains` |
| `vegetation_type_actual` | **STRICT ENUM** (multiselect) | `tropical`, `subtropical`, `mediterranean`, `forest`, `grassland`, `desert` |
| `population_density_actual` | enum | `low`, `medium`, `high` (not currently scored) |
| `country` | string | Free-form, case-insensitive |
| `region` | string | Free-form, case-insensitive |
| `regions` | array | Free-form strings (region names) |
| `geo_region` | string | Comma-separated region names |
| `population` | number | Positive integer |
| `altitude_meters` | number | Integer (meters above sea level) |
| `latitude` | number | -90 to 90 |
| `longitude` | number | -180 to 180 |

**Source:** `categoricalValues.js` lines 202-223

### AI Update Risk Notes

**🔴 CRITICAL - MUST VALIDATE AGAINST ENUM:**
- `geographic_features_actual` - **BREAKS SCORING** if invalid values used
  - **Validation:** Must be exact match from 9 valid values
  - **Array format:** `["coastal", "island"]` not `"coastal, island"`
  - **Case:** lowercase only
  - **Adjacency aware:** AI should understand related features (e.g., if user wants "coastal", "island" is compatible)

- `vegetation_type_actual` - **BREAKS SCORING** if invalid values used
  - **Validation:** Must be exact match from 6 valid values
  - **Array format:** `["mediterranean", "subtropical"]` not `"mediterranean, subtropical"`
  - **Case:** lowercase only

**🟡 MEDIUM RISK (data accuracy):**
- `country` - Must be real country name (case-insensitive matching handles variations)
- `region` - Must be real region/state name
- `population` - Must be accurate, verifiable number
- `latitude`/`longitude` - Must match town's actual coordinates

**🟢 SAFE (display-only):**
- `population_density_actual` - Not currently scored, but should still match reality
- `altitude_meters` - Display-only, validate against geocoding data

**Validation Rules:**
```javascript
// BEFORE saving AI-suggested values:
import { VALID_CATEGORICAL_VALUES } from '../validation/categoricalValues';

// Validate geographic features
if (Array.isArray(suggestedValue)) {
  const valid = suggestedValue.every(feature =>
    VALID_CATEGORICAL_VALUES.geographic_features_actual.includes(feature.toLowerCase())
  );
  if (!valid) {
    return { error: 'Invalid geographic feature - must be from valid list' };
  }
}

// Validate vegetation types
if (Array.isArray(suggestedValue)) {
  const valid = suggestedValue.every(veg =>
    VALID_CATEGORICAL_VALUES.vegetation_type_actual.includes(veg.toLowerCase())
  );
  if (!valid) {
    return { error: 'Invalid vegetation type - must be from valid list' };
  }
}
```

---

## Tab 3: Climate

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Climate Type** | `climate` | string (enum) | `town.climate` | ❌ Display-only (inference source) |
| **Climate Description** | `climate_description` | text | `town.climate_description` | ⚠️ Used as FALLBACK when primary fields missing |
| **Summer Climate** | `summer_climate_actual` | string (enum) | `town.summer_climate_actual` | ✅ Climate scoring (25 pts) |
| **Winter Climate** | `winter_climate_actual` | string (enum) | `town.winter_climate_actual` | ✅ Climate scoring (25 pts) |
| **Avg Temp Summer (°C)** | `avg_temp_summer` | number | `town.avg_temp_summer` | ✅ Climate scoring (25 pts, primary) |
| **Avg Temp Winter (°C)** | `avg_temp_winter` | number | `town.avg_temp_winter` | ✅ Climate scoring (25 pts, primary) |
| **Humidity Level** | `humidity_level_actual` | string (enum) | `town.humidity_level_actual` | ✅ Climate scoring (20 pts) |
| **Sunshine Level** | `sunshine_level_actual` | string (enum) | `town.sunshine_level_actual` | ✅ Climate scoring (20 pts) |
| **Sunshine Hours/Year** | `sunshine_hours` | number | `town.sunshine_hours` | ⚠️ Used as FALLBACK for sunshine scoring |
| **Precipitation Level** | `precipitation_level_actual` | string (enum) | `town.precipitation_level_actual` | ✅ Climate scoring (10 pts) |
| **Annual Rainfall (mm)** | `annual_rainfall` | number | `town.annual_rainfall` | ⚠️ Used as FALLBACK for precipitation scoring |
| **Seasonal Variation** | `seasonal_variation_actual` | string (enum) | `town.seasonal_variation_actual` | ✅ Climate scoring (15 pts bonus) |

### Link to Scoring Logic

**Summer Temperature Scoring (25 points):**
- **File:** `climateScoring.js` lines 96-143
- **Primary:** Uses `avg_temp_summer` (numeric) if available
- **Fallback:** Uses `summer_climate_actual` (enum) if numeric missing
- **Temperature Ranges:** Lines 32-44
  - `mild`: 15-24°C
  - `warm`: 22-32°C
  - `hot`: 28°C+
- **Gradual Scoring:** Lines 52-71
  - Within range = 100% (25 pts)
  - Within 2°C = 80% (20 pts)
  - Within 5°C = 50% (12.5 pts)
  - Within 10°C = 20% (5 pts)
  - Beyond 10°C = 0 pts

**Winter Temperature Scoring (25 points):**
- **File:** `climateScoring.js` lines 162-224
- **Primary:** Uses `avg_temp_winter` (numeric)
- **Fallback:** Uses `winter_climate_actual` (enum)
- **Temperature Ranges:** Lines 39-43
  - `cold`: ≤5°C
  - `cool`: 3-15°C
  - `mild`: 12°C+

**Humidity Scoring (20 points):**
- **File:** `climateScoring.js` lines 226-286
- **Primary:** Uses `humidity_level_actual`
- **Fallback:** Infers from `climate_description` (lines 253-285)
- **Adjacency Rules:** `adjacencyRules.js` lines 25-29
  - dry ↔ balanced (70% credit = 14 pts)
  - balanced ↔ dry OR humid (70% credit)
  - humid ↔ balanced (70% credit)

**Sunshine Scoring (20 points):**
- **File:** `climateScoring.js` lines 288-378
- **Primary:** Uses `sunshine_level_actual`
- **Fallback 1:** Uses `sunshine_hours` if available (lines 315-344)
  - \>2800 hrs = often_sunny
  - \>2200 hrs = balanced
  - ≤2200 hrs = less_sunny
- **Fallback 2:** Infers from `climate_description` (lines 345-377)
- **Adjacency Rules:** `adjacencyRules.js` lines 39-51
  - often_sunny ↔ balanced (70% credit)
  - balanced ↔ often_sunny OR less_sunny (70% credit)
  - less_sunny ↔ balanced (70% credit)

**Precipitation Scoring (10 points):**
- **File:** `climateScoring.js` lines 380-468
- **Primary:** Uses `precipitation_level_actual`
- **Fallback 1:** Uses `annual_rainfall` (lines 407-434)
  - <400mm = mostly_dry
  - 400-1000mm = balanced
  - \>1000mm = less_dry
- **Fallback 2:** Infers from `climate_description` (lines 435-467)
- **Adjacency Rules:** `adjacencyRules.js` lines 61-67
  - mostly_dry ↔ balanced (70% credit)
  - balanced ↔ mostly_dry OR less_dry (70% credit)
  - less_dry ↔ balanced (70% credit)

**Seasonal Preference Scoring (15 points):**
- **File:** `climateScoring.js` lines 470-623
- **Uses:** `seasonal_variation_actual` + temperature data
- **Logic:**
  - No preference or "all_seasons" = 15 points (full credit)
  - "summer_focused" = checks if summer temp matches user preference
  - "winter_focused" = checks if winter temp matches user preference
  - "all_seasons" = requires BOTH summer AND winter to match

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `summer_climate_actual` | **STRICT ENUM** | `mild`, `warm`, `hot` |
| `winter_climate_actual` | **STRICT ENUM** | `cold`, `cool`, `mild` |
| `humidity_level_actual` | **STRICT ENUM** | `dry`, `balanced`, `humid` |
| `sunshine_level_actual` | **STRICT ENUM** | `often_sunny`, `balanced`, `less_sunny` |
| `precipitation_level_actual` | **STRICT ENUM** | `mostly_dry`, `balanced`, `less_dry` |
| `seasonal_variation_actual` | **STRICT ENUM** | `all_seasons`, `summer_focused`, `winter_focused` |
| `climate` | enum (display) | `tropical`, `subtropical`, `temperate`, `continental`, `mediterranean`, `desert`, `arid`, `oceanic`, `polar` |
| `avg_temp_summer` | number | Typical range: 15-40°C (validate realistic for location) |
| `avg_temp_winter` | number | Typical range: -10 to 25°C (validate realistic for location) |
| `sunshine_hours` | number | Typical range: 1500-3500 hours/year |
| `annual_rainfall` | number | Typical range: 100-3000mm/year |
| `climate_description` | text | Free-form, 200-500 chars |

**Source:** `categoricalValues.js` lines 32-153

### AI Update Risk Notes

**🔴 CRITICAL - MUST VALIDATE AGAINST ENUM:**
- `summer_climate_actual` - **BREAKS SCORING** if not `mild`/`warm`/`hot`
- `winter_climate_actual` - **BREAKS SCORING** if not `cold`/`cool`/`mild`
- `humidity_level_actual` - **BREAKS SCORING** if not `dry`/`balanced`/`humid`
- `sunshine_level_actual` - **BREAKS SCORING** if not `often_sunny`/`balanced`/`less_sunny`
- `precipitation_level_actual` - **BREAKS SCORING** if not `mostly_dry`/`balanced`/`less_dry`
- `seasonal_variation_actual` - **BREAKS SCORING** if not `all_seasons`/`summer_focused`/`winter_focused`

**🟡 MEDIUM RISK (must be accurate):**
- `avg_temp_summer` - Used as PRIMARY scorer (preferred over enum), must be realistic
- `avg_temp_winter` - Used as PRIMARY scorer (preferred over enum), must be realistic
- `sunshine_hours` - Fallback scoring, must be accurate if `sunshine_level_actual` missing
- `annual_rainfall` - Fallback scoring, must be accurate if `precipitation_level_actual` missing

**🟢 SAFE (free-form or display-only):**
- `climate_description` - Free-form text, used only as last-resort fallback for inference
- `climate` - Display-only enum, not directly scored

**Validation Rules:**
```javascript
// Temperature validation
if (suggestedValue < -20 || suggestedValue > 50) {
  return { error: 'Temperature outside realistic range for human habitation' };
}

// Enum validation
const CLIMATE_ENUMS = {
  summer_climate_actual: ['mild', 'warm', 'hot'],
  winter_climate_actual: ['cold', 'cool', 'mild'],
  humidity_level_actual: ['dry', 'balanced', 'humid'],
  sunshine_level_actual: ['often_sunny', 'balanced', 'less_sunny'],
  precipitation_level_actual: ['mostly_dry', 'balanced', 'less_dry'],
  seasonal_variation_actual: ['all_seasons', 'summer_focused', 'winter_focused']
};

if (!CLIMATE_ENUMS[fieldName].includes(suggestedValue)) {
  return { error: `Must be one of: ${CLIMATE_ENUMS[fieldName].join(', ')}` };
}
```

**Special Note:**
Climate tab is **HIGH STAKES** because it represents 15% of total match score. Invalid enum values will cause scoring to fail entirely. Always validate enums before saving.

---

## Tab 4: Culture

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Pace of Life** | `pace_of_life_actual` | string (enum) | `town.pace_of_life_actual` | ✅ Culture scoring (20 pts in V1, 15 pts in V2) |
| **Urban/Rural Character** | `urban_rural_character` | string (enum) | `town.urban_rural_character` | ✅ Culture scoring (20 pts in V1, 15 pts in V2) |
| **Primary Language** | `primary_language` | string | `town.primary_language` | ✅ Culture scoring (20 pts in V1, 15 pts in V2) |
| **Languages Spoken** | `languages_spoken` | array | `town.languages_spoken` | ✅ Culture scoring (bonus for multi-lingual) |
| **English Proficiency** | `english_proficiency_level` | string (enum) | `town.english_proficiency_level` | ✅ Culture scoring (used for "english_only" users) |
| **Expat Community Size** | `expat_community_size` | string (enum) | `town.expat_community_size` | ✅ Culture scoring (10 pts) |
| **Dining & Nightlife Rating** | `restaurants_rating`, `nightlife_rating` | number (1-10) | `town.restaurants_rating`, `town.nightlife_rating` | ✅ Culture scoring (10 pts combined) |
| **Cultural Events Frequency** | `cultural_events_frequency` | string (enum) | `town.cultural_events_frequency` | ✅ Culture scoring (10 pts) |
| **Museums Rating** | `museums_rating` | number (1-10) | `town.museums_rating` | ✅ Culture scoring (10 pts) |
| **Traditional vs Progressive** | `traditional_progressive_lean` | string (enum) | `town.traditional_progressive_lean` | ✅ Culture V2 scoring (10 pts) |
| **Social Atmosphere** | `social_atmosphere` | string (enum) | `town.social_atmosphere` | ✅ Culture V2 scoring (10 pts) |
| **Cultural Diversity** | `cultural_diversity_actual` | string (enum) | `town.cultural_diversity_actual` | ❌ Available but unscored |

### Link to Scoring Logic

**Pace of Life Scoring (20 pts V1, 15 pts V2):**
- **File:** `cultureScoring.js` lines 120-163
- **How Used:**
  - Exact match = full points
  - Adjacent match = 50% credit (10 pts V1, 7.5 pts V2)
- **Adjacency Rules:** `adjacencyRules.js` lines 91-95
  - fast ↔ moderate (50% credit)
  - moderate ↔ fast OR relaxed (50% credit)
  - relaxed ↔ moderate (50% credit)
- **Data Mapping:** Uses `mapCultureValue()` to normalize variations (line 130)

**Urban/Rural Scoring (20 pts V1, 15 pts V2):**
- **File:** `cultureScoring.js` lines 77-118
- **How Used:**
  - Exact match = full points
  - Adjacent match = 50% credit (10 pts V1, 7.5 pts V2)
- **Adjacency Rules:** `adjacencyRules.js` lines 79-83
  - urban ↔ suburban (50% credit)
  - suburban ↔ urban OR rural (50% credit)
  - rural ↔ suburban (50% credit)

**Language Scoring (20 pts V1, 15 pts V2):**
- **File:** `cultureScoring.js` lines 165-221
- **Logic:**
  - If user speaks local language = 20 pts (full)
  - If user wants "english_only" + town has native English = 20 pts
  - If user wants "english_only" + town has high English proficiency = 15 pts
  - If user "willing_to_learn" = 10 pts (partial credit)
- **Proficiency Scores:** Lines 199-207
  - native = 20 pts
  - high = 15 pts
  - moderate = 10 pts
  - low = 5 pts

**Expat Community Scoring (10 pts):**
- **File:** `cultureScoring.js` lines 223-267
- **How Used:**
  - Exact match = 10 pts
  - Adjacent match = 5 pts (50% credit)
- **Adjacency Rules:** `adjacencyRules.js` lines 103-107
  - large ↔ moderate (50% credit)
  - moderate ↔ large OR small (50% credit)
  - small ↔ moderate (50% credit)

**Dining & Nightlife Scoring (10 pts):**
- **File:** `cultureScoring.js` lines 269-321
- **Logic:** User specifies IMPORTANCE (1-5), town has QUALITY (1-10)
  - If importance = 1 (don't care) = 10 pts (full)
  - If importance = 5 (very important) + quality ≥8 = 10 pts
  - If importance = 5 + quality 6-7 = 5 pts
  - If importance = 3 (nice to have) + quality ≥7 = 10 pts
  - If importance = 3 + quality 5-6 = 7 pts

**Cultural Events Scoring (10 pts):**
- **File:** `cultureScoring.js` lines 323-360
- **How Used:** Frequency matching (occasional, regular, frequent)
  - Exact match = 10 pts
  - Adjacent frequency (1 step away) = 7 pts
  - Far apart (occasional vs frequent) = 4 pts

**Museums Scoring (10 pts):**
- **File:** `cultureScoring.js` lines 362-414
- **Logic:** User specifies IMPORTANCE (1-5), town has QUALITY (1-10)
  - Same threshold logic as Dining & Nightlife

**Traditional/Progressive Scoring (10 pts - V2 only):**
- **File:** `cultureScoring.js` lines 416-448
- **How Used:**
  - Exact match = 10 pts
  - Adjacent match = 5 pts (50% credit)
- **Adjacency Rules:** `adjacencyRules.js` lines 115-119
  - traditional ↔ balanced (50% credit)
  - balanced ↔ traditional OR progressive (50% credit)
  - progressive ↔ balanced (50% credit)

**Social Atmosphere Scoring (10 pts - V2 only):**
- **File:** `cultureScoring.js` lines 450-481
- **How Used:**
  - Exact match = 10 pts
  - Adjacent match = 5 pts (50% credit)
- **Adjacency Rules:** `adjacencyRules.js` lines 127-131
  - quiet ↔ friendly (50% credit)
  - friendly ↔ quiet OR vibrant (50% credit)
  - vibrant ↔ friendly (50% credit)

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `pace_of_life_actual` | **STRICT ENUM** | `relaxed`, `moderate`, `fast` |
| `urban_rural_character` | **STRICT ENUM** | `rural`, `suburban`, `urban` |
| `english_proficiency_level` | **STRICT ENUM** | `low`, `moderate`, `high`, `native` |
| `expat_community_size` | **STRICT ENUM** | `small`, `moderate`, `large` |
| `cultural_events_frequency` | **STRICT ENUM** | `occasional`, `regular`, `frequent` |
| `traditional_progressive_lean` | **STRICT ENUM** | `traditional`, `balanced`, `progressive` |
| `social_atmosphere` | **STRICT ENUM** | `quiet`, `friendly`, `vibrant` |
| `primary_language` | string | Free-form (language name) |
| `languages_spoken` | array | Array of language names |
| `restaurants_rating` | number | 1-10 scale |
| `nightlife_rating` | number | 1-10 scale |
| `museums_rating` | number | 1-10 scale |
| `cultural_diversity_actual` | enum (unscored) | `low`, `moderate`, `high` |

**Source:** `categoricalValues.js` lines 49-98, 102-115

### AI Update Risk Notes

**🔴 CRITICAL - MUST VALIDATE AGAINST ENUM:**
- `pace_of_life_actual` - **BREAKS SCORING** if not `relaxed`/`moderate`/`fast`
  - **Special Note:** 48% of database uses "relaxed" (not "slow")
- `urban_rural_character` - **BREAKS SCORING** if not `rural`/`suburban`/`urban`
- `expat_community_size` - **BREAKS SCORING** if not `small`/`moderate`/`large`
- `cultural_events_frequency` - **BREAKS SCORING** if not `occasional`/`regular`/`frequent`
- `traditional_progressive_lean` - **BREAKS SCORING** if not `traditional`/`balanced`/`progressive`
- `social_atmosphere` - **BREAKS SCORING** if not `quiet`/`friendly`/`vibrant`
- `english_proficiency_level` - **BREAKS SCORING** if not `low`/`moderate`/`high`/`native`

**🟡 MEDIUM RISK (must be accurate):**
- `primary_language` - Used in language matching, must be real language name
- `languages_spoken` - Array of language names, affects multi-lingual bonus
- `restaurants_rating` - Must be realistic 1-10 score
- `nightlife_rating` - Must be realistic 1-10 score
- `museums_rating` - Must be realistic 1-10 score

**🟢 SAFE (free-form or unscored):**
- `cultural_diversity_actual` - Not currently scored, but should be accurate

**Validation Rules:**
```javascript
// Rating validation (1-10 scale)
if (suggestedValue < 1 || suggestedValue > 10 || !Number.isInteger(suggestedValue)) {
  return { error: 'Rating must be integer between 1-10' };
}

// Enum validation
const CULTURE_ENUMS = {
  pace_of_life_actual: ['relaxed', 'moderate', 'fast'],
  urban_rural_character: ['rural', 'suburban', 'urban'],
  expat_community_size: ['small', 'moderate', 'large'],
  cultural_events_frequency: ['occasional', 'regular', 'frequent'],
  traditional_progressive_lean: ['traditional', 'balanced', 'progressive'],
  social_atmosphere: ['quiet', 'friendly', 'vibrant'],
  english_proficiency_level: ['low', 'moderate', 'high', 'native']
};

if (!CULTURE_ENUMS[fieldName].includes(suggestedValue)) {
  return { error: `Must be one of: ${CULTURE_ENUMS[fieldName].join(', ')}` };
}
```

**Special Adjacency-Aware Validation:**
When suggesting values, AI should be aware of adjacent values for partial credit. Example:
- If user wants "fast" pace and town is "moderate" → AI should note "This gets 50% credit (adjacent match)"
- If user wants "urban" and town is "suburban" → "This gets 50% credit (adjacent match)"

---

## Tab 5: Healthcare

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Healthcare Score** | `healthcare_score` | number (0-10) | `town.healthcare_score` | ✅ Admin scoring (30 pts, dynamically calculated) |
| **Healthcare Quality** | `healthcare_quality` | string (enum) | `town.healthcare_quality` | ❌ Legacy field (score is calculated) |
| **Healthcare Description** | `healthcare_description` | text | `town.healthcare_description` | ❌ Display-only |
| **Hospital Count** | `hospital_count` | number | `town.hospital_count` | ✅ Bonus to healthcare score (+0.5) |
| **Emergency Services Quality** | `emergency_services_quality` | string (enum) | `town.emergency_services_quality` | ✅ Bonus to healthcare score (+1.0 if excellent) |
| **English Speaking Doctors** | `english_speaking_doctors` | string (enum) | `town.english_speaking_doctors` | ✅ Bonus to healthcare score (+0.5 if common/widespread) |
| **Healthcare Cost** | `healthcare_cost` | string (enum) | `town.healthcare_cost` | ❌ Available but unscored (used in Cost category) |
| **Healthcare Cost Monthly** | `healthcare_cost_monthly` | number (USD) | `town.healthcare_cost_monthly` | ✅ Cost scoring (not Admin) |
| **Emergency Response Time** | `emergency_response_time` | number (minutes) | `town.emergency_response_time` | ❌ Available but unscored |

### Link to Scoring Logic

**Healthcare Scoring (30 points):**
- **File:** `adminScoring.js` lines 260-286
- **Primary Calculation:** Uses `calculateHealthcareScore()` helper (lines 23)
- **Helper File:** `src/utils/scoring/helpers/calculateHealthcareScore.js`
- **Base Score Logic:**
  - User preference: `basic`, `functional`, `good`
  - Town score: 0-10 scale
  - Gradual scoring (lines 36-78):
    - If user wants "good" (≥7.0):
      - Score ≥7.0 = 30 pts (full)
      - Score 6.0-6.9 = 25.5 pts (85%)
      - Score 5.0-5.9 = 19.5 pts (65%)
      - Score 4.0-4.9 = 12 pts (40%)
      - Score <4.0 = 4.5 pts (15%)
    - If user wants "functional":
      - **LINEAR SCORING:** Score/10 * 30 pts
      - Example: 7.0 score = 21 pts, 5.0 = 15 pts
    - If user wants "basic" (≥4.0):
      - Score ≥4.0 = 30 pts (full)
      - Score 3.0-3.9 = 21 pts (70%)
      - Score 2.0-2.9 = 12 pts (40%)
      - Score <2.0 = 4.5 pts (15%)

**Healthcare Score Calculation (Dynamic):**
- **Base:** `town.healthcare_score` (0-10)
- **Bonuses added:**
  - Hospital count: +0.5 if `hospital_count > 0`
  - Emergency services: +1.0 if `emergency_services_quality === 'excellent'`
  - English doctors: +0.5 if `english_speaking_doctors === 'common' || 'widespread'`
- **Maximum:** 10.0 (capped)

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `healthcare_score` | number | 0-10 (base score before bonuses) |
| `emergency_services_quality` | **ENUM** | `poor`, `fair`, `good`, `very_good`, `excellent` |
| `english_speaking_doctors` | **ENUM** | `rare`, `limited`, `moderate`, `common`, `widespread` |
| `healthcare_cost` | enum | `very_low`, `low`, `moderate`, `high`, `very_high` |
| `healthcare_quality` | enum (legacy) | `basic`, `functional`, `good` |
| `hospital_count` | number | Positive integer (typically 0-20) |
| `healthcare_cost_monthly` | number | Positive integer in USD (typically $50-$500) |
| `emergency_response_time` | number | Positive integer in minutes (typically 5-30) |
| `healthcare_description` | text | Free-form, 200-500 chars |

**Source:** `categoricalValues.js` lines 172-198

### AI Update Risk Notes

**🔴 CRITICAL - MUST VALIDATE:**
- `emergency_services_quality` - **AFFECTS SCORING** (excellent = +1.0 bonus)
  - Must be exact match from: `poor`, `fair`, `good`, `very_good`, `excellent`
- `english_speaking_doctors` - **AFFECTS SCORING** (common/widespread = +0.5 bonus)
  - Must be exact match from: `rare`, `limited`, `moderate`, `common`, `widespread`

**🟡 MEDIUM RISK (must be accurate):**
- `healthcare_score` - Base score 0-10, must be realistic for location
  - **Validation:** Check against WHO data, expat forums, etc.
- `hospital_count` - Must be accurate (affects scoring +0.5 bonus)
- `healthcare_cost_monthly` - Used in Cost category scoring, must be realistic

**🟢 SAFE (free-form or display-only):**
- `healthcare_description` - Free-form marketing text
- `healthcare_quality` - Legacy field, not used (score is calculated)
- `healthcare_cost` - Enum but not scored in Admin category
- `emergency_response_time` - Not currently scored

**Validation Rules:**
```javascript
// Healthcare score validation
if (suggestedValue < 0 || suggestedValue > 10) {
  return { error: 'Healthcare score must be 0-10' };
}

// Enum validation
const HEALTHCARE_ENUMS = {
  emergency_services_quality: ['poor', 'fair', 'good', 'very_good', 'excellent'],
  english_speaking_doctors: ['rare', 'limited', 'moderate', 'common', 'widespread'],
  healthcare_cost: ['very_low', 'low', 'moderate', 'high', 'very_high']
};

if (!HEALTHCARE_ENUMS[fieldName].includes(suggestedValue)) {
  return { error: `Must be one of: ${HEALTHCARE_ENUMS[fieldName].join(', ')}` };
}
```

---

## Tab 6: Safety

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Safety Score** | `safety_score` | number (0-10) | `town.safety_score` | ✅ Admin scoring (25 pts, dynamically calculated) |
| **Safety Quality** | `safety_quality` | string (enum) | `town.safety_quality` | ❌ Legacy field (score is calculated) |
| **Safety Description** | `safety_description` | text | `town.safety_description` | ❌ Display-only |
| **Crime Rate** | `crime_rate` | number (0-100) | `town.crime_rate` | ✅ Adjusts safety score (-2.0 if high crime) |
| **Crime Rate Category** | `crime_rate_category` | string (enum) | `town.crime_rate_category` | ❌ Display-only (calculated from crime_rate) |
| **Natural Disaster Risk** | `natural_disaster_risk_level` | string (enum) | `town.natural_disaster_risk_level` | ❌ Available but unscored |
| **Environmental Health Rating** | `environmental_health_rating` | number (0-10) | `town.environmental_health_rating` | ✅ Admin scoring (15 pts for sensitive users) |
| **Political Stability Rating** | `political_stability_rating` | number (0-100) | `town.political_stability_rating` | ✅ Admin scoring (10 pts) |
| **Political Stability Score** | `political_stability_score` | number (0-10) | `town.political_stability_score` | ❌ Legacy field (use rating/100) |

### Link to Scoring Logic

**Safety Scoring (25 points):**
- **File:** `adminScoring.js` lines 288-314
- **Primary Calculation:** Uses `calculateSafetyScore()` helper (line 24)
- **Helper File:** `src/utils/scoring/helpers/calculateSafetyScore.js`
- **Base Score Logic:**
  - Same gradual scoring as healthcare (lines 36-78)
  - User preference: `basic`, `functional`, `good`
  - Town score: 0-10 scale
- **Crime Impact:**
  - If `crime_rate > 60` (high crime) → deduct 2.0 from safety score
  - Score cannot go below 0

**Safety Score Calculation (Dynamic):**
- **Base:** `town.safety_score` (0-10)
- **Penalties:**
  - Crime rate > 60: -2.0
- **Bonuses:**
  - None currently (environmental_health_rating scored separately)

**Environmental Health Scoring (15 points):**
- **File:** `adminScoring.js` lines 361-366
- **Conditional:** Only scored if user marks `health_considerations.environmental_health === 'sensitive'`
- **Logic:**
  - If `environmental_health_rating >= 4` AND user is sensitive = 15 pts
  - Otherwise = 0 pts

**Political Stability Scoring (10 points):**
- **File:** `adminScoring.js` lines 368-386
- **How Used:**
  - Converts 0-100 rating to 0-10 scale (`rating / 10`)
  - Gradual scoring based on user preference
  - Same thresholds as healthcare/safety

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `safety_score` | number | 0-10 (base score before crime penalty) |
| `crime_rate` | number | 0-100 (crime index, higher = more crime) |
| `crime_rate_category` | **ENUM** | `very_low`, `low`, `moderate`, `high`, `very_high` |
| `natural_disaster_risk_level` | enum | `minimal`, `low`, `moderate`, `high`, `very_high` |
| `environmental_health_rating` | number | 0-10 |
| `political_stability_rating` | number | 0-100 (World Bank Governance Indicator scale) |
| `safety_quality` | enum (legacy) | `basic`, `functional`, `good` |
| `political_stability_score` | number (legacy) | 0-10 (use rating/100 instead) |
| `safety_description` | text | Free-form, 200-500 chars |

**Source:** `categoricalValues.js` lines 156-171

### AI Update Risk Notes

**🔴 CRITICAL - MUST VALIDATE:**
- `crime_rate` - **DIRECTLY AFFECTS SCORING** (>60 = -2.0 penalty)
  - **Validation:** Must be 0-100, check against Numbeo, Expatistan data
  - **Impact:** Very sensitive field, incorrect value significantly impacts score
- `crime_rate_category` - **MUST MATCH crime_rate value**
  - very_low: 0-20
  - low: 20-40
  - moderate: 40-60
  - high: 60-80
  - very_high: 80-100

**🟡 MEDIUM RISK (must be accurate):**
- `safety_score` - Base score 0-10, must be realistic
  - **Sources:** Global Peace Index, Numbeo Safety Index
- `political_stability_rating` - 0-100 scale, must match World Bank Governance Indicators
  - **Scoring Impact:** 10 points in Admin category
- `environmental_health_rating` - 0-10 scale
  - **Scoring Impact:** 15 points if user is environmentally sensitive

**🟢 SAFE (free-form or unscored):**
- `safety_description` - Free-form marketing text
- `safety_quality` - Legacy field, not used
- `natural_disaster_risk_level` - Not currently scored (but should be accurate)
- `political_stability_score` - Legacy field (use rating instead)

**Validation Rules:**
```javascript
// Crime rate validation
if (suggestedValue < 0 || suggestedValue > 100) {
  return { error: 'Crime rate must be 0-100' };
}

// Crime category auto-derivation
const crimeCategoryFromRate = (rate) => {
  if (rate < 20) return 'very_low';
  if (rate < 40) return 'low';
  if (rate < 60) return 'moderate';
  if (rate < 80) return 'high';
  return 'very_high';
};

// Safety/environmental/political scores
if (suggestedValue < 0 || suggestedValue > 10) {
  return { error: 'Score must be 0-10' };
}

// Political stability rating
if (suggestedValue < 0 || suggestedValue > 100) {
  return { error: 'Political stability rating must be 0-100' };
}
```

**Critical Note:**
Safety tab affects 25 points (25% of Admin category, which is 20% of total = **5% of overall match score**). Crime rate field is particularly sensitive because it's a direct penalty.

---

## Tab 7: Infrastructure

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Walkability** | `walkability` | number (1-10) | `town.walkability` | ❌ Available but unscored |
| **Public Transport Rating** | `public_transport_rating` | number (1-10) | `town.public_transport_rating` | ❌ Available but unscored |
| **Internet Speed (Mbps)** | `internet_speed_mbps` | number | `town.internet_speed_mbps` | ❌ Available but unscored |
| **Air Quality Index** | `air_quality_index` | number (0-500) | `town.air_quality_index` | ❌ Available but unscored |
| **Airport Distance (km)** | `airport_distance` | number | `town.airport_distance` | ❌ Available but unscored |
| **Airport Name** | `nearest_airport_name` | string | `town.nearest_airport_name` | ❌ Display-only |
| **International Airport** | `international_airport_nearby` | boolean | `town.international_airport_nearby` | ❌ Available but unscored |
| **Infrastructure Description** | `infrastructure_description` | text | `town.infrastructure_description` | ❌ Display-only |

### Link to Scoring Logic

**NO DIRECT SCORING:**
- Infrastructure fields are **currently not used** in any scoring category
- These fields are available for future scoring implementation
- `air_quality_index` may be related to `environmental_health_rating` (Safety tab) conceptually, but not directly scored

**Potential Future Use:**
- Walkability could be added to Culture or Admin scoring
- Public transport could factor into Lifestyle scoring
- Internet speed relevant for digital nomads (future feature)
- Air quality related to environmental health

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `walkability` | number | 1-10 scale (Walk Score methodology) |
| `public_transport_rating` | number | 1-10 scale |
| `internet_speed_mbps` | number | Typical range: 10-1000 Mbps |
| `air_quality_index` | number | 0-500 (US EPA AQI scale) |
| `airport_distance` | number | Positive number in kilometers |
| `nearest_airport_name` | string | Free-form airport name |
| `international_airport_nearby` | boolean | true/false |
| `infrastructure_description` | text | Free-form, 200-500 chars |

**No strict enums on this tab.**

### AI Update Risk Notes

**🟢 ALL FIELDS ARE SAFE (unscored):**
- `walkability` - No scoring impact, but should be accurate (1-10)
- `public_transport_rating` - No scoring impact, but should be accurate (1-10)
- `internet_speed_mbps` - No scoring impact, verify against Speedtest data
- `air_quality_index` - No scoring impact, verify against IQAir, WHO data
- `airport_distance` - No scoring impact, verify distance to nearest airport
- `international_airport_nearby` - Boolean, check if major international airport within 100km

**🟡 MEDIUM PRIORITY (data accuracy):**
- Even though these fields don't affect scoring, they're shown to users and should be accurate
- Users may filter/sort by these fields in discovery

**Validation Rules:**
```javascript
// Rating validation (1-10 scale)
if (suggestedValue < 1 || suggestedValue > 10) {
  return { error: 'Rating must be 1-10' };
}

// AQI validation (0-500 scale)
if (suggestedValue < 0 || suggestedValue > 500) {
  return { error: 'AQI must be 0-500' };
}

// Internet speed validation (realistic range)
if (suggestedValue < 1 || suggestedValue > 1000) {
  return { warning: 'Internet speed outside typical range (1-1000 Mbps)' };
}
```

**Special Note:**
Infrastructure tab is **LOW STAKES** for Smart Update because no fields affect scoring. This makes it a good candidate for AI experimentation. However, data accuracy still matters for user experience.

---

## Tab 8: Activities

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Restaurants Rating** | `restaurants_rating` | number (1-10) | `town.restaurants_rating` | ✅ Culture scoring (10 pts combined with nightlife) |
| **Nightlife Rating** | `nightlife_rating` | number (1-10) | `town.nightlife_rating` | ✅ Culture scoring (10 pts combined with restaurants) |
| **Cultural Events Frequency** | `cultural_events_frequency` | string (enum) | `town.cultural_events_frequency` | ✅ Culture scoring (10 pts) |
| **Cultural Events Rating** | `cultural_events_rating` | number (1-10) | `town.cultural_events_rating` | ❌ Available but unscored (frequency is used instead) |
| **Museums Rating** | `museums_rating` | number (1-10) | `town.museums_rating` | ✅ Culture scoring (10 pts) |
| **Outdoor Activities** | `outdoor_activities` | text/array | `town.outdoor_activities` | ❌ Legacy field (see Hobbies tab) |
| **Beaches Nearby** | `beaches_nearby` | boolean | `town.beaches_nearby` | ❌ Legacy field (use geographic_features_actual) |
| **Hiking Trails** | `hiking_trails` | boolean | `town.hiking_trails` | ❌ Legacy field (see Hobbies tab) |
| **Golf Courses** | `golf_courses` | number | `town.golf_courses` | ❌ Legacy field (see Hobbies tab) |
| **Ski Resorts Nearby** | `ski_resorts_nearby` | boolean | `town.ski_resorts_nearby` | ❌ Legacy field (see Hobbies tab) |

### Link to Scoring Logic

**Restaurants + Nightlife Scoring (10 points combined):**
- **File:** `cultureScoring.js` lines 269-321
- **How Used:** Average of two ratings (1-10 scale)
  - `avgQuality = (restaurants_rating + nightlife_rating) / 2`
  - User specifies IMPORTANCE (1-5)
  - If importance = 1 (don't care) → 10 pts
  - If importance = 5 (very important):
    - avgQuality ≥8 → 10 pts
    - avgQuality 6-7 → 5 pts
    - avgQuality <6 → 0 pts
  - If importance = 3 (nice to have):
    - avgQuality ≥7 → 10 pts
    - avgQuality 5-6 → 7 pts
    - avgQuality 3-4 → 3 pts
    - avgQuality <3 → 0 pts

**Cultural Events Scoring (10 points):**
- **File:** `cultureScoring.js` lines 323-360
- **Uses:** `cultural_events_frequency` (NOT `cultural_events_rating`)
- **Logic:**
  - Exact frequency match = 10 pts
  - Adjacent frequency (1 step away) = 7 pts
  - Far apart (occasional vs frequent) = 4 pts
- **Frequency Options:** `occasional`, `regular`, `frequent`

**Museums Scoring (10 points):**
- **File:** `cultureScoring.js` lines 362-414
- **How Used:** Same importance-based logic as restaurants/nightlife
- **Uses:** `museums_rating` (1-10 scale)

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `restaurants_rating` | number | 1-10 scale (quality rating) |
| `nightlife_rating` | number | 1-10 scale (quality rating) |
| `cultural_events_frequency` | **STRICT ENUM** | `occasional`, `regular`, `frequent` |
| `cultural_events_rating` | number | 1-10 scale (NOT SCORED, use frequency) |
| `museums_rating` | number | 1-10 scale (quality rating) |
| `outdoor_activities` | text/array (legacy) | Free-form, deprecated |
| `beaches_nearby` | boolean (legacy) | Use `geographic_features_actual` instead |
| `hiking_trails` | boolean (legacy) | See Hobbies tab |
| `golf_courses` | number (legacy) | See Hobbies tab |
| `ski_resorts_nearby` | boolean (legacy) | See Hobbies tab |

**Source:** `categoricalValues.js` lines 69-73

### AI Update Risk Notes

**🔴 CRITICAL - MUST VALIDATE:**
- `cultural_events_frequency` - **BREAKS SCORING** if not `occasional`/`regular`/`frequent`
  - **Validation:** Must be exact match from 3 valid values

**🟡 MEDIUM RISK (must be accurate):**
- `restaurants_rating` - Used in Culture scoring (10 pts), must be realistic 1-10
- `nightlife_rating` - Used in Culture scoring (10 pts), must be realistic 1-10
- `museums_rating` - Used in Culture scoring (10 pts), must be realistic 1-10
- **Validation Source:** TripAdvisor, Yelp, Google Reviews averages

**🟢 SAFE (unscored or legacy):**
- `cultural_events_rating` - NOT SCORED (frequency is used instead), but should still be accurate
- `outdoor_activities` - Legacy field, use Hobbies tab instead
- `beaches_nearby` - Legacy field, use `geographic_features_actual: ["coastal"]` instead
- `hiking_trails`, `golf_courses`, `ski_resorts_nearby` - Legacy fields, see Hobbies tab

**Validation Rules:**
```javascript
// Rating validation (1-10 scale)
if (suggestedValue < 1 || suggestedValue > 10 || !Number.isInteger(suggestedValue)) {
  return { error: 'Rating must be integer 1-10' };
}

// Cultural events frequency (CRITICAL)
const validFrequencies = ['occasional', 'regular', 'frequent'];
if (!validFrequencies.includes(suggestedValue)) {
  return { error: `Must be one of: ${validFrequencies.join(', ')}` };
}
```

**Special Note:**
- `cultural_events_frequency` is the **ONLY enum field** on this tab that affects scoring
- The three rating fields (restaurants, nightlife, museums) are numeric and more forgiving
- Legacy hobby-related fields should NOT be updated - direct users to Hobbies tab instead

---

## Tab 9: Hobbies

### Fields on This Tab

**This tab uses a custom component (`HobbiesDisplay`) that manages town-hobby relationships, not individual fields.**

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Town-Hobby Links** | (database table) | join table | `town_hobbies` table | ✅ Hobbies scoring (100% of Hobbies category) |
| **Available Hobbies List** | (from hobbies table) | array | `hobbies` table (190 hobbies) | ✅ Reference data for matching |

### Database Schema

**Table:** `town_hobbies`
```sql
CREATE TABLE town_hobbies (
  id UUID PRIMARY KEY,
  town_id UUID REFERENCES towns(id),
  hobby_id UUID REFERENCES hobbies(id),
  inferred BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP,
  UNIQUE(town_id, hobby_id)
);
```

**Table:** `hobbies`
```sql
CREATE TABLE hobbies (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  category TEXT,
  is_universal BOOLEAN DEFAULT false,
  location_requirements JSONB,
  created_at TIMESTAMP
);
```

**Hobby Categories:**
- Outdoor & Adventure (hiking, surfing, skiing, etc.)
- Arts & Culture (painting, theater, museums, etc.)
- Sports & Fitness (golf, tennis, yoga, etc.)
- Social & Community (volunteering, language exchange, etc.)
- Culinary & Dining (cooking classes, wine tasting, etc.)
- Relaxation & Wellness (spa, meditation, hot springs, etc.)

**190 Total Hobbies:**
- 109 universal (available anywhere)
- 81 location-specific (require geographic features)

### Link to Scoring Logic

**Hobbies Scoring (100% of 10% category weight = 10% of total):**
- **File:** `hobbiesScoring.js` lines 18-23
- **Delegates to:** `src/utils/scoring/helpers/hobbiesMatching.js`
- **Logic:**
  - Uses **geographic inference** instead of direct town-hobby links
  - Matches user's selected hobbies against town's geographic features
  - Example: If town has `geographic_features_actual: ["coastal"]`, infers surfing, sailing, beach activities
  - Example: If town has `geographic_features_actual: ["mountain"]`, infers hiking, skiing, rock climbing

**Inference Rules:**
- **Coastal** → surfing, sailing, beach volleyball, fishing, diving, kayaking
- **Mountain** → hiking, skiing, snowboarding, rock climbing, mountain biking
- **Island** → same as coastal + snorkeling, island hopping
- **Lake/River** → fishing, kayaking, canoeing, stand-up paddleboarding
- **Forest** → hiking, bird watching, foraging, camping
- **Desert** → stargazing, dune bashing, desert hiking
- **Universal hobbies** → yoga, reading, cooking, photography (available everywhere)

**Scoring Calculation:**
```javascript
// Simplified scoring logic
const userHobbies = user.selected_hobbies; // e.g., ["surfing", "hiking", "yoga"]
const townFeatures = town.geographic_features_actual; // e.g., ["coastal", "mountain"]

let matchedHobbies = 0;
for (const hobby of userHobbies) {
  if (hobby.isUniversal) {
    matchedHobbies++; // Always available
  } else if (hobby.requiredFeatures.some(f => townFeatures.includes(f))) {
    matchedHobbies++; // Geographic match
  }
}

const score = (matchedHobbies / userHobbies.length) * 100;
```

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `town_hobbies` (links) | join table | Links to 190 valid hobby IDs |
| `hobbies.name` | string | 190 predefined hobby names |
| `hobbies.is_universal` | boolean | true/false |
| `hobbies.location_requirements` | JSONB | `{"geographic_features": ["coastal"]}` |
| `inferred` | boolean | true (if auto-inferred), false (if manually added) |
| `confidence_score` | decimal | 0.0-1.0 (for inferred hobbies) |

**No enums on town object** - hobbies are stored in separate table.

### AI Update Risk Notes

**🟡 MEDIUM RISK (database relationships):**
- Hobbies are managed via **join table**, not direct fields on town object
- AI should NOT directly manipulate `town_hobbies` table
- Instead, AI should:
  1. Ensure `geographic_features_actual` is accurate (this drives inference)
  2. Let the hobbies inference system auto-populate based on geographic features

**🔴 DO NOT AUTO-UPDATE:**
- `town_hobbies` links - Should be managed by admin or inference system
- Manually added hobbies (where `inferred = false`) should not be overwritten

**🟢 SAFE APPROACH:**
- Focus AI updates on **Tab 2: Region** → `geographic_features_actual`
- The hobbies system will automatically infer available hobbies from geographic features
- Example: If AI updates town to add `"coastal"` feature, hobbies like surfing, sailing, beach volleyball will auto-appear

**Validation Rules:**
```javascript
// Hobbies are inferred from geographic features
// So validation is already covered by Region tab validation

// If manually adding hobby links (advanced):
const validHobbyIds = await supabase
  .from('hobbies')
  .select('id, name');

if (!validHobbyIds.some(h => h.id === suggestedHobbyId)) {
  return { error: 'Invalid hobby ID' };
}

// Check if hobby is location-appropriate
const hobby = await supabase
  .from('hobbies')
  .select('location_requirements')
  .eq('id', suggestedHobbyId)
  .single();

if (!hobby.is_universal) {
  const requiredFeatures = hobby.location_requirements.geographic_features;
  const townHasFeatures = requiredFeatures.some(f =>
    town.geographic_features_actual.includes(f)
  );

  if (!townHasFeatures) {
    return { error: 'Town lacks required geographic features for this hobby' };
  }
}
```

**Special Note:**
Hobbies tab is **LOW RISK** for Smart Update because:
1. It uses inference system (not direct data entry)
2. Driven by `geographic_features_actual` which is validated on Region tab
3. Admin can manually override inferred hobbies if needed

**Recommendation:** Skip Hobbies tab in Smart Update. Focus on Region tab's `geographic_features_actual` field instead.

---

## Tab 10: Admin

### Fields on This Tab

**Note:** Admin tab reuses fields from Healthcare, Safety, and Infrastructure tabs, plus adds legal/visa fields.

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Healthcare Score** | `healthcare_score` | number (0-10) | `town.healthcare_score` | ✅ Admin scoring (30 pts) |
| **English Speaking Doctors** | `english_speaking_doctors` | string (enum) | `town.english_speaking_doctors` | ✅ Bonus to healthcare score (+0.5) |
| **Safety Score** | `safety_score` | number (0-10) | `town.safety_score` | ✅ Admin scoring (25 pts) |
| **Walkability** | `walkability` | number (1-10) | `town.walkability` | ❌ Available but unscored |
| **Air Quality Index** | `air_quality_index` | number (0-500) | `town.air_quality_index` | ❌ Available but unscored |
| **Airport Distance** | `airport_distance` | number | `town.airport_distance` | ❌ Available but unscored |
| **Visa Requirements** | `visa_requirements` | text | `town.visa_requirements` | ⚠️ Informational (scoring uses specific visa fields) |
| **Visa Difficulty** | `visa_difficulty` | string (enum) | `town.visa_difficulty` | ❌ Available but unscored |
| **Retirement Visa Available** | `retirement_visa_available` | boolean | `town.retirement_visa_available` | ✅ Admin scoring (8 pts bonus) |
| **Visa on Arrival Countries** | `visa_on_arrival_countries` | array | `town.visa_on_arrival_countries` | ✅ Admin scoring (10 pts if user citizenship matches) |
| **Easy Residency Countries** | `easy_residency_countries` | array | `town.easy_residency_countries` | ✅ Admin scoring (10 pts if user citizenship matches) |
| **Government Efficiency Rating** | `government_efficiency_rating` | number (0-100) | `town.government_efficiency_rating` | ✅ Admin scoring (15 pts) |
| **Political Stability Rating** | `political_stability_rating` | number (0-100) | `town.political_stability_rating` | ✅ Admin scoring (10 pts) |
| **Tax Treaty US** | `tax_treaty_us` | boolean | `town.tax_treaty_us` | ❌ Available but unscored (future Cost V3?) |

### Link to Scoring Logic

**Healthcare, Safety:** See tabs 5 & 6 above.

**Visa/Residency Scoring (10 points):**
- **File:** `adminScoring.js` lines 338-359
- **Logic:**
  - If user citizenship in `visa_on_arrival_countries` OR `easy_residency_countries` → 10 pts
  - Else if `retirement_visa_available === true` → 8 pts
  - Else → 5 pts (baseline)
- **Critical:** Uses **case-insensitive matching** (line 346-348)
  - User citizenship: "USA", "usa", "United States" all match
  - Array values must be country names or ISO codes

**Government Efficiency Scoring (15 points):**
- **File:** `adminScoring.js` lines 316-336
- **How Used:**
  - Converts 0-100 rating to 0-10 scale (`rating / 10`)
  - Gradual scoring based on user preference (same as healthcare/safety)
  - If user wants "good" (≥70 rating):
    - Rating ≥70 → 15 pts
    - Rating 60-69 → 12.75 pts (85%)
    - Rating 50-59 → 9.75 pts (65%)
    - Rating 40-49 → 6 pts (40%)
    - Rating <40 → 2.25 pts (15%)

**Political Stability Scoring (10 points):**
- See Safety tab section above (lines 368-386)

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `visa_difficulty` | enum | `easy`, `moderate`, `difficult`, `very_difficult` |
| `retirement_visa_available` | boolean | true/false |
| `visa_on_arrival_countries` | **ARRAY** of strings | Country names or ISO-3 codes (case-insensitive) |
| `easy_residency_countries` | **ARRAY** of strings | Country names or ISO-3 codes (case-insensitive) |
| `government_efficiency_rating` | number | 0-100 (World Bank Governance Indicator) |
| `political_stability_rating` | number | 0-100 (World Bank Governance Indicator) |
| `tax_treaty_us` | boolean | true/false |
| `visa_requirements` | text | Free-form description (200-1000 chars) |

**No strict enums except visa_difficulty (which is not scored).**

### AI Update Risk Notes

**🔴 CRITICAL - AFFECTS SCORING:**
- `retirement_visa_available` - **GIVES 8 POINTS** if true
  - **Validation:** Must verify official government retirement visa programs exist
- `visa_on_arrival_countries` - **GIVES 10 POINTS** if user's citizenship matches
  - **Validation:** Must be accurate array of ISO-3 codes or country names
  - **Format:** `["USA", "CAN", "GBR", "AUS"]` or `["United States", "Canada", ...]`
  - **Source:** Official visa policy databases (VisaHQ, IATA)
- `easy_residency_countries` - **GIVES 10 POINTS** if user's citizenship matches
  - **Validation:** Same as visa_on_arrival_countries

**🟡 MEDIUM RISK (must be accurate):**
- `government_efficiency_rating` - 0-100, **affects 15 points in Admin scoring**
  - **Source:** World Bank Worldwide Governance Indicators (WGI)
  - **Field:** Government Effectiveness percentile rank
- `political_stability_rating` - 0-100, **affects 10 points in Admin scoring**
  - **Source:** World Bank WGI Political Stability and Absence of Violence

**🟢 SAFE (informational or unscored):**
- `visa_requirements` - Free-form text, not scored
- `visa_difficulty` - Enum but not scored
- `tax_treaty_us` - Not currently scored (may be used in future Cost V3)

**Validation Rules:**
```javascript
// Visa/residency arrays validation
if (!Array.isArray(suggestedValue)) {
  return { error: 'Must be an array of country names or ISO codes' };
}

// Validate each country in array exists
const validCountries = await getValidCountryCodes(); // ISO-3 database
const invalidCountries = suggestedValue.filter(c =>
  !validCountries.includes(c.toUpperCase()) &&
  !validCountries.includes(c)
);

if (invalidCountries.length > 0) {
  return { error: `Invalid countries: ${invalidCountries.join(', ')}` };
}

// Government efficiency rating validation
if (suggestedValue < 0 || suggestedValue > 100) {
  return { error: 'Rating must be 0-100' };
}

// Retirement visa validation
if (typeof suggestedValue !== 'boolean') {
  return { error: 'Must be true or false' };
}
```

**Special Validation:**
- **Retirement visa:** Must research official government programs
  - Examples: Portugal D7, Spain Non-Lucrative, Costa Rica Pensionado
  - DO NOT assume - verify official program exists
- **Visa arrays:** Case-insensitive matching means "USA", "usa", "United States" all valid
  - Recommend standardizing to ISO-3 codes: "USA", "CAN", "GBR", etc.

---

## Tab 11: Costs

### Fields on This Tab

| Field Label | Internal Key | Data Type | Storage Path | Used in Scoring? |
|-------------|--------------|-----------|--------------|------------------|
| **Cost of Living (USD/month)** | `cost_of_living_usd` | number | `town.cost_of_living_usd` | ✅ Cost scoring (70 pts primary) |
| **Typical Monthly Living Cost** | `typical_monthly_living_cost` | number | `town.typical_monthly_living_cost` | ✅ Cost scoring (fallback if cost_of_living_usd missing) |
| **Typical Rent 1-Bed** | `typical_rent_1bed` or `rent_1bed` | number | `town.typical_rent_1bed` | ✅ Cost scoring (optional breakdown) |
| **Rent 2-Bed** | `rent_2bed` | number | `town.rent_2bed` | ❌ Available but unscored |
| **Home Price per sqm** | `home_price_sqm` | number | `town.home_price_sqm` | ❌ Available but unscored |
| **Max Monthly Rent** | `max_monthly_rent` | number | `town.max_monthly_rent` | ❌ Available but unscored |
| **Utilities Cost** | `utilities_cost` | number | `town.utilities_cost` | ❌ Available but unscored |
| **Groceries Index** | `groceries_index` | number | `town.groceries_index` | ❌ Available but unscored |
| **Restaurant Price Index** | `restaurant_price_index` | number | `town.restaurant_price_index` | ❌ Available but unscored |
| **Healthcare Cost Monthly** | `healthcare_cost_monthly` | number | `town.healthcare_cost_monthly` | ❌ Available but unscored (informational) |
| **Income Tax Rate (%)** | `income_tax_rate_pct` | number | `town.income_tax_rate_pct` | ⚠️ Used if user is tax-sensitive (future) |
| **Property Tax Rate (%)** | `property_tax_rate_pct` | number | `town.property_tax_rate_pct` | ⚠️ Used if user is tax-sensitive (future) |
| **Sales Tax Rate (%)** | `sales_tax_rate_pct` | number | `town.sales_tax_rate_pct` | ⚠️ Used if user is tax-sensitive (future) |

### Link to Scoring Logic

**Cost V2 Scoring (100% of Cost category = 10% of total):**
- **File:** `costScoring.js` (read earlier in session)
- **Primary Field:** `cost_of_living_usd` or `typical_monthly_living_cost`
- **Logic:**
  - User specifies `total_monthly_cost` (budget)
  - Calculate ratio: `townCost / userBudget`
  - **Asymmetric scoring:**
    - If ratio ≤ 1.0 (cheaper or equal): Full score (70 pts)
    - If ratio > 1.0 (expensive): Exponential penalty
      - ratio = 1.1 → ~60 pts
      - ratio = 1.3 → ~40 pts
      - ratio = 1.5 → ~25 pts
      - ratio = 2.0 → ~10 pts
  - **Luxury lifestyle adjustment:**
    - If userBudget ≥ $4000 AND townCost < 50% of budget:
      - Apply up to 30% penalty (very cheap town may not match luxury expectations)
      - Penalty increases as ratio gets smaller (cheaper)
      - Example: $5000 budget, $1200 town → 65% score (not 70%)

**Tax Scoring (future Cost V3?):**
- **File:** `adminScoring.js` lines 88-193 (NOT in costScoring.js currently)
- **Note:** Tax fields exist but are NOT used in current Cost V2 scoring
- **Future Use:** May be incorporated into Cost V3 or remain in Admin category

### Expected Value Constraints

| Field | Constraint Type | Valid Values |
|-------|-----------------|--------------|
| `cost_of_living_usd` | number | **CRITICAL:** $300-$8000/month (validated in aiResearch.js) |
| `typical_monthly_living_cost` | number | Same as above (fallback field) |
| `typical_rent_1bed` | number | Typically $200-$3000/month |
| `rent_2bed` | number | Typically $300-$5000/month |
| `home_price_sqm` | number | Typically $500-$10000/sqm |
| `utilities_cost` | number | Typically $50-$300/month |
| `groceries_index` | number | 0-200 (100 = baseline, Numbeo scale) |
| `restaurant_price_index` | number | 0-200 (100 = baseline, Numbeo scale) |
| `healthcare_cost_monthly` | number | Typically $50-$500/month |
| `income_tax_rate_pct` | number | 0-50% (typical range for OECD countries) |
| `property_tax_rate_pct` | number | 0-5% (typical range, US: 0.3-2.5%) |
| `sales_tax_rate_pct` | number | 0-27% (EU VAT: 15-27%, US: 0-10%) |

**No enums on this tab - all numeric fields.**

### AI Update Risk Notes

**🔴 CRITICAL - VALIDATED IN aiResearch.js:**
- `cost_of_living_usd` - **MOST IMPORTANT FIELD ON THIS TAB**
  - **Range:** $300-$8000/month (enforced in `aiResearch.js` lines 467-485)
  - **Validation:** AI suggestions outside this range are REJECTED
  - **Source:** Numbeo, Expatistan, Nomad List
  - **Common Errors:**
    - AI confuses annual with monthly ($24000/year → $2000/month)
    - AI uses local currency instead of USD
    - AI includes home purchase costs (should be rent only)
  - **Format:** Integer only, no decimals

**🟡 MEDIUM RISK (must be accurate):**
- `typical_rent_1bed` - Contributes to cost breakdown, verify against Numbeo
- `income_tax_rate_pct` - May be used in future scoring, verify against tax authority
- `property_tax_rate_pct` - May be used in future scoring
- `sales_tax_rate_pct` - May be used in future scoring

**🟢 SAFE (unscored, informational):**
- `rent_2bed`, `home_price_sqm`, `utilities_cost` - Not scored, but should be accurate
- `groceries_index`, `restaurant_price_index` - Numbeo indices, verify against source
- `healthcare_cost_monthly` - Informational, shown to users

**Validation Rules (from aiResearch.js):**
```javascript
// ENFORCED IN AI RESEARCH FUNCTION
if (fieldName === 'cost_of_living_usd' && result.suggestedValue !== null) {
  const cost = parseInt(result.suggestedValue);

  // Reject if not a number or outside reasonable range
  if (isNaN(cost) || cost < 300 || cost > 8000) {
    console.warn(`⚠️ VALIDATION FAILED: cost_of_living_usd=${cost} outside range (300-8000)`);
    return {
      success: false,
      suggestedValue: null,
      confidence: 'low',
      reasoning: `AI suggested ${cost} which is outside reasonable monthly cost range (300-8000 USD).
                  This might be annual cost, local currency, or hallucination. Manual research recommended.`
    };
  }

  console.log(`✓ VALIDATION PASSED: cost_of_living_usd=${cost} is reasonable`);
}
```

**Special Validation Notes:**
- Cost of living should represent **SINGLE PERSON, MODEST LIFESTYLE** monthly expenses
- Should include: rent (1-bed), utilities, groceries, local transport, basic dining, insurance
- Should EXCLUDE: home purchase, car ownership, luxury spending, travel
- Verify against multiple sources: Numbeo, Expatistan, Nomad List must agree within 20%

**Cost Tab Risk Assessment:**
- **HIGHEST STAKES:** `cost_of_living_usd` determines 70% of Cost category score
- Cost category = 10% of total match score
- Invalid cost = breaks scoring for **10% of user's match**
- **Double-check this field** before approving AI suggestions

---

## Cross-Tab Field Dependencies

### Fields Used in Multiple Tabs

| Field | Tabs | Scoring Impact |
|-------|------|----------------|
| `healthcare_score` | Healthcare, Admin | 30 pts (Admin category) |
| `safety_score` | Safety, Admin | 25 pts (Admin category) |
| `walkability` | Infrastructure, Admin | 0 pts (unscored) |
| `air_quality_index` | Infrastructure, Safety (indirect) | 0 pts (unscored, but related to environmental_health_rating) |
| `cultural_events_frequency` | Activities, Culture | 10 pts (Culture category) |
| `restaurants_rating` | Activities, Culture | 10 pts combined (Culture category) |
| `nightlife_rating` | Activities, Culture | 10 pts combined (Culture category) |
| `museums_rating` | Activities, Culture | 10 pts (Culture category) |

### Calculated Fields (Do Not Edit)

| Field | Calculation | Where Calculated |
|-------|-------------|------------------|
| `overall_score` | Weighted average of 6 category scores | Scoring system |
| `crime_rate_category` | Derived from `crime_rate` (0-100) | UI display |
| `healthcare_score` (calculated) | Base + bonuses | `calculateHealthcareScore()` helper |
| `safety_score` (calculated) | Base - crime penalty | `calculateSafetyScore()` helper |

---

## Summary of High-Risk Fields for AI Update

### 🔴 CRITICAL - Must Validate Against Enum (24 fields)

**Region Tab:**
- `geographic_features_actual` (9 valid values)
- `vegetation_type_actual` (6 valid values)

**Climate Tab:**
- `summer_climate_actual` (3 valid values)
- `winter_climate_actual` (3 valid values)
- `humidity_level_actual` (3 valid values)
- `sunshine_level_actual` (3 valid values)
- `precipitation_level_actual` (3 valid values)
- `seasonal_variation_actual` (3 valid values)

**Culture Tab:**
- `pace_of_life_actual` (3 valid values)
- `urban_rural_character` (3 valid values)
- `expat_community_size` (3 valid values)
- `cultural_events_frequency` (3 valid values)
- `traditional_progressive_lean` (3 valid values)
- `social_atmosphere` (3 valid values)
- `english_proficiency_level` (4 valid values)

**Healthcare Tab:**
- `emergency_services_quality` (5 valid values)
- `english_speaking_doctors` (5 valid values)

**Safety Tab:**
- `crime_rate_category` (5 valid values, derived from crime_rate)

**Activities Tab:**
- `cultural_events_frequency` (3 valid values, duplicate from Culture)

**Costs Tab:**
- `cost_of_living_usd` (**HARD RANGE:** $300-$8000, validated in aiResearch.js)

### 🟡 MEDIUM RISK - Must Be Accurate (10 fields)

- `country` (Region) - Used in Region scoring (40 pts)
- `region` / `state_code` (Region) - Used in Region scoring (30 pts)
- `avg_temp_summer` (Climate) - Primary scorer (25 pts)
- `avg_temp_winter` (Climate) - Primary scorer (25 pts)
- `crime_rate` (Safety) - Penalty if >60 (-2.0 from safety score)
- `political_stability_rating` (Admin) - 10 pts scoring
- `government_efficiency_rating` (Admin) - 15 pts scoring
- `retirement_visa_available` (Admin) - 8 pts bonus
- `visa_on_arrival_countries` (Admin) - 10 pts if match
- `easy_residency_countries` (Admin) - 10 pts if match

### 🟢 SAFE - Free-Form or Unscored (140+ fields)

- All description/text fields (description, verbose_description, etc.)
- All Infrastructure tab fields (walkability, internet speed, etc.)
- Legacy hobby fields (use Hobbies tab inference system instead)
- Display-only fields (images, published status, etc.)

---

## Recommended AI Update Priority

### Priority 1: High-Value, Low-Risk Fields
- `description`, `verbose_description` - Marketing copy, no scoring impact
- `climate_description` - Informational text
- `healthcare_description`, `safety_description` - Informational text

### Priority 2: Numeric Fields with Validation
- `avg_temp_summer`, `avg_temp_winter` - Easy to validate, high scoring impact
- `healthcare_score`, `safety_score` - Base scores (before bonuses/penalties)
- `population`, `altitude_meters` - Verifiable against geocoding data

### Priority 3: Enum Fields (REQUIRES STRICT VALIDATION)
- `summer_climate_actual`, `winter_climate_actual` - 3 values each, easy to validate
- `humidity_level_actual`, `sunshine_level_actual`, `precipitation_level_actual` - 3 values each
- `pace_of_life_actual`, `urban_rural_character` - 3 values each

### Priority 4: Array/Complex Fields
- `geographic_features_actual`, `vegetation_type_actual` - Multiselect, requires array validation
- `visa_on_arrival_countries`, `easy_residency_countries` - Research-intensive

### ⚠️ DO NOT AUTO-UPDATE
- `overall_score` - Calculated field
- `town_hobbies` - Managed by inference system
- `published` - Admin decision
- `image_url_*` - Manual upload
- Any field marked "legacy" or "calculated"

---

**Report Complete**
**Total Fields Documented:** 170+
**Total Enum Constraints:** 24
**Total Adjacency Rules:** 9
**Scoring Categories:** 6

**Next Step:** Use this mapping to design tab-specific Smart Update prompts with enum validation and adjacency awareness.
