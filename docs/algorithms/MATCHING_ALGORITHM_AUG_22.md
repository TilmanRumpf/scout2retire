# Scout2Retire Town Matching Algorithm Documentation
## Version 2.0 - August 22, 2025

## Table of Contents
1. [Overview](#overview)
2. [Algorithm Architecture](#algorithm-architecture)
3. [Scoring Categories](#scoring-categories)
4. [Data Flow](#data-flow)
5. [Scoring Calculation](#scoring-calculation)
6. [Case Study: Spanish Towns 44% Match](#case-study-spanish-towns-44-match)

---

## Overview

The Scout2Retire matching algorithm is a sophisticated scoring system that matches users with ideal retirement towns based on their preferences across six key categories. The algorithm prioritizes location, budget, and healthcare/safety (60% combined weight) while considering climate and culture as secondary factors.

### Key Principles
- **"Open to Anywhere" Philosophy**: Users with no preferences in a category receive 100% match
- **Gradual Scoring**: Adjacent preferences receive partial points (e.g., "warm" vs "hot" climate)
- **Data Quality Handling**: Multiple fallback mechanisms for missing data
- **Performance Optimization**: Pre-filtering at database level, caching, batch processing

### File Structure
```
/src/utils/
├── matchingAlgorithm.js         # Main entry point, handles caching and orchestration
├── enhancedMatchingAlgorithm.js # Core scoring logic for all 6 categories
├── unifiedScoring.js            # Preference conversion and batch scoring
├── hobbiesMatching.js           # Specialized hobby scoring
└── enhancedMatchingHelpers.js   # Insights and warnings generation
```

---

## Algorithm Architecture

### 1. Entry Point Flow
```javascript
getPersonalizedTowns(userId) 
  → getOnboardingProgress(userId)     // Fetch user preferences
  → convertPreferencesToAlgorithmFormat() // Standardize format
  → scoreTownsBatch(towns, preferences)   // Score all towns
  → calculateEnhancedMatch()             // Calculate individual scores
```

### 2. Category Weights
```javascript
const CATEGORY_WEIGHTS = {
  region:  20,  // Geographic match
  climate: 15,  // Climate preferences
  culture: 15,  // Cultural fit
  hobbies: 10,  // Activities & interests
  admin:   20,  // Healthcare, safety, visa
  budget:  20   // Financial fit
}
// Total: 100%
```

---

## Scoring Categories

### 1. REGION MATCHING (20% of total)
**File**: `enhancedMatchingAlgorithm.js:42-204`

#### Components (90 points total → converted to percentage)

##### A. Country/Region Match (40 points max)
- **Country Match (40 pts)**: Direct country match or US state match
- **Region Match (30 pts)**: Region matches but not country
- **No Match (0 pts)**: User has preferences but no matches
- **Open to Anywhere (40 pts)**: No preferences specified

**Special US State Handling**: 
```javascript
if (US_STATES.has(country) && town.country === 'United States' && town.region === country) {
  regionCountryScore = 40 // State match treated as country match
}
```

##### B. Geographic Features (30 points max)
- **Match (30 pts)**: ANY feature matches (coastal, mountain, island, lake, river, valley, desert, forest, plains)
- **No Preferences/All Selected (30 pts)**: User is flexible
- **No Match (0 pts)**: User has preferences but no matches

**Coastal Fallback**: When `geographic_features_actual` is NULL:
```javascript
const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific']
hasMatch = town.regions.some(region => 
  coastalIndicators.some(indicator => region.toLowerCase().includes(indicator))
)
```

##### C. Vegetation Type (20 points max)
- **Match (20 pts)**: ANY vegetation type matches (tropical, subtropical, mediterranean, forest, grassland, desert)
- **No Preferences/All Selected (20 pts)**: User is flexible
- **No Match (0 pts)**: User has preferences but no matches

### 2. CLIMATE MATCHING (15% of total)
**File**: `enhancedMatchingAlgorithm.js:314-863`

#### Components (100 points total)

##### A. Summer Temperature (25 points)
Temperature ranges:
- Mild: 15-24°C
- Warm: 22-32°C
- Hot: 28°C+

Scoring by distance:
- Perfect match: 100% (25 pts)
- Within 2°C: 80% (20 pts)
- Within 5°C: 50% (12.5 pts)
- Within 10°C: 20% (5 pts)
- Beyond 10°C: 0% (0 pts)

##### B. Winter Temperature (25 points)
Temperature ranges:
- Cold: <5°C
- Cool: 3-15°C
- Mild: 12°C+

Same distance-based scoring as summer

##### C. Humidity (15 points)
Gradual scoring with adjacency:
- Exact match: 15 pts
- Adjacent preference: 10.5 pts (70%)
- Opposite preference: 0 pts

Adjacency map:
```javascript
'very_low': ['low'],
'low': ['very_low', 'moderate'],
'moderate': ['low', 'high'],
'high': ['moderate', 'very_high'],
'very_high': ['high']
```

##### D. Sunshine (15 points)
- Annual hours > 2800: "often_sunny"
- 2000-2800 hours: "balanced"
- < 2000 hours: "less_sunny"

##### E. Precipitation (10 points)
Based on annual rainfall:
- < 400mm: "mostly_dry"
- 400-1000mm: "balanced"
- > 1000mm: "often_rainy"

##### F. Seasonal Preference (15 points)
- No preference: 15 pts
- Summer-focused: Check if summer climate fits
- Winter-focused: Check if winter climate fits
- All seasons: Both summer AND winter must fit

### 3. CULTURE MATCHING (15% of total)
**File**: `enhancedMatchingAlgorithm.js:866-1148`

#### Components (100 points total)

##### A. Urban/Rural Setting (35 points)
Categories with population thresholds:
- Large city: 500k+
- Small city: 50k-500k
- Town: 5k-50k
- Rural: <5k

Scoring:
- Exact match: 35 pts
- Adjacent category: 20 pts
- Two categories away: 10 pts
- Opposite preference: 0 pts

##### B. Pace of Life (20 points)
- Hectic ↔ Fast ↔ Moderate ↔ Relaxed ↔ Very relaxed
- Exact match: 20 pts
- Adjacent: 14 pts (70%)
- Opposite: 0 pts

##### C. Expat Community (15 points)
Based on `town.expat_percentage`:
- Large: >10%
- Moderate: 5-10%
- Small: 1-5%
- Minimal: <1%

##### D. Language Comfort (15 points)
Checks:
- English as official/widely spoken
- User already speaks local language
- Willingness to learn vs language difficulty

##### E. Cultural Activities (15 points)
Based on `town.cultural_venues_count`:
- Abundant: 20+ venues
- Moderate: 5-20 venues
- Limited: <5 venues

### 4. HOBBIES MATCHING (10% of total)
**File**: `hobbiesMatching.js`

Uses normalized database with:
- Universal hobbies (available everywhere)
- Location-specific hobbies
- Town-specific hobby support data

Scoring based on:
- Activity availability
- Interest alignment
- Outdoor activities rating
- Specific hobby infrastructure

### 5. ADMINISTRATION MATCHING (20% of total)
**File**: `enhancedMatchingAlgorithm.js:1494-1643`

#### Components (100 points total)

##### A. Healthcare Quality (35 points)
Based on `town.healthcare_score` (0-100):
- Excellent (80+): 35 pts
- Good (60-79): 25 pts
- Adequate (40-59): 15 pts
- Poor (<40): 0 pts

##### B. Safety (35 points)
Based on `town.safety_score` (0-100):
- Very safe (80+): 35 pts
- Safe (60-79): 25 pts
- Moderate (40-59): 15 pts
- Concerns (<40): 0 pts

##### C. Visa Requirements (20 points)
Considers:
- User citizenship
- Town country requirements
- Ease of visa/residency

##### D. Government Efficiency (10 points)
Based on `town.government_efficiency_score`

### 6. BUDGET MATCHING (20% of total)
**File**: `enhancedMatchingAlgorithm.js:1646-1797`

#### Components (100 points total)

##### A. Total Cost of Living (40 points)
Compares user's `total_monthly_budget` with `town.cost_of_living_total`:
```javascript
const budgetRatio = town.cost_of_living_total / preferences.total_monthly_budget
if (budgetRatio <= 0.8) score = 40      // 20% under budget
else if (budgetRatio <= 1.0) score = 35  // Within budget
else if (budgetRatio <= 1.1) score = 20  // 10% over
else if (budgetRatio <= 1.2) score = 10  // 20% over
else score = 0                           // >20% over
```

##### B. Housing Costs (30 points)
Similar ratio-based scoring for `max_monthly_rent` vs `town.avg_rent_1br`

##### C. Healthcare Costs (15 points)
Compares healthcare budget with town's healthcare costs

##### D. Tax Considerations (15 points)
- Property tax sensitivity
- Sales tax rates
- Income tax implications

---

## Data Flow

### 1. User Preferences Collection
**Source**: `OnboardingRegion.jsx` → `user_preferences` table

```sql
user_preferences {
  user_id: UUID
  countries: text[]
  regions: text[]
  provinces: text[]
  geographic_features: text[]
  vegetation_types: text[]
  summer_climate_preference: text[]
  winter_climate_preference: text[]
  humidity_level: text[]
  sunshine: text[]
  precipitation: text[]
  // ... 50+ more fields
}
```

### 2. Town Data Structure
**Source**: `towns` table

```sql
towns {
  id: UUID
  name: text
  country: text
  region: text (US state or province)
  geo_region: text (continent/region)
  regions: text[] (multiple region tags)
  
  // Geographic
  geographic_features_actual: text[]
  vegetation_type_actual: text[]
  
  // Climate
  avg_temp_summer: numeric
  avg_temp_winter: numeric
  summer_climate_actual: text
  winter_climate_actual: text
  humidity_level_actual: text
  sunshine_hours: integer
  annual_rainfall: integer
  
  // Demographics
  population: integer
  expat_percentage: numeric
  
  // Quality scores
  healthcare_score: integer
  safety_score: integer
  cost_of_living_total: numeric
  // ... 100+ more fields
}
```

### 3. Scoring Pipeline
```
1. Load user preferences
2. Fetch qualifying towns (with pre-filtering)
3. Convert preferences to algorithm format
4. For each town:
   a. Calculate 6 category scores
   b. Apply category weights
   c. Sum to total percentage
5. Sort by score
6. Generate insights and warnings
7. Return ranked results
```

---

## Scoring Calculation

### Final Score Formula
```javascript
totalScore = 
  (regionScore × 0.20) +
  (climateScore × 0.15) +
  (cultureScore × 0.15) +
  (hobbiesScore × 0.10) +
  (adminScore × 0.20) +
  (budgetScore × 0.20)
```

### Score Interpretation
- **90-100%**: Excellent match
- **75-89%**: Very good match
- **60-74%**: Good match
- **45-59%**: Fair match
- **30-44%**: Poor match
- **<30%**: Not recommended

---

## Case Study: Spanish Towns 44% Match

### User: Tilman.Rumpf@gmail.com

#### User's Region Preferences
```javascript
{
  countries: ["Spain", "Spain"],  // Duplicate entry
  regions: ["Mediterranean", "Southern Europe"],
  geographic_features: ["Coastal", "coastal"],  // Duplicate with different case
  vegetation_types: ["Subtropical", "Mediterranean", "Tropical"]
}
```

#### Spanish Towns Data Quality Analysis
**12 Spanish towns in database**

| Field | Data Present | Match Rate | Issue |
|-------|--------------|------------|-------|
| Country | 12/12 (100%) | ✅ 100% | Perfect - all marked as "Spain" |
| Region (geo_region) | 12/12 (100%) | ⚠️ 17% | Only 2 towns match "Mediterranean" |
| Geographic Features | 0/12 (0%) | ❌ 0% | ALL NULL - critical data missing |
| Vegetation Type | 0/12 (0%) | ❌ 0% | ALL NULL - critical data missing |

#### Region Score Calculation Breakdown

##### Step 1: Country/Region Match (Max 40 points)
```javascript
// User selected "Spain" as country preference
// All Spanish towns have country = "Spain"
countryMatched = true
regionCountryScore = 40  // Perfect country match
```

##### Step 2: Geographic Features (Max 30 points)
```javascript
// User wants "Coastal"
// ALL Spanish towns have geographic_features_actual = NULL
// Fallback check: Do any regions contain coastal indicators?
// Result: Some towns may have coastal indicators in regions array
geoScore = 0  // No data available
```

##### Step 3: Vegetation Type (Max 20 points)
```javascript
// User wants "Subtropical", "Mediterranean", "Tropical"
// ALL Spanish towns have vegetation_type_actual = NULL
vegScore = 0  // No data available
```

##### Final Region Score
```javascript
rawScore = 40 + 0 + 0 = 40
totalPossible = 90
percentage = (40 / 90) × 100 = 44.4%
```

### Why Exactly 44%?

The Spanish towns receive **44% region match** because:

1. **Country Match (40/40 points)**: ✅ Perfect - Spain matches Spain
2. **Geographic Features (0/30 points)**: ❌ No data - all NULL
3. **Vegetation Type (0/20 points)**: ❌ No data - all NULL

**Calculation**: 40/90 = 0.444... = **44%**

### Root Causes of Low Match

#### 1. Missing Critical Data
Spanish towns are missing:
- `geographic_features_actual[]` - Should indicate coastal, mountain, etc.
- `vegetation_type_actual[]` - Should show Mediterranean vegetation
- Most climate fields (summer/winter temperatures and descriptions)

#### 2. Incorrect Region Classification
Only 2 of 12 Spanish towns are tagged as "Mediterranean" in `geo_region`, despite Spain being a Mediterranean country. Most are only tagged as "Southern Europe".

#### 3. Data Quality vs Other Countries
Comparison with Portuguese towns (example):
- Portuguese towns: 80-90% data completeness
- Spanish towns: 20-30% data completeness

### Recommendations to Fix

#### Immediate Actions
1. **Populate geographic_features_actual** for all Spanish towns:
   ```sql
   UPDATE towns 
   SET geographic_features_actual = ARRAY['coastal', 'mediterranean']
   WHERE country = 'Spain' AND name IN ('Barcelona', 'Valencia', 'Malaga', ...);
   ```

2. **Add vegetation_type_actual**:
   ```sql
   UPDATE towns 
   SET vegetation_type_actual = ARRAY['mediterranean', 'subtropical']
   WHERE country = 'Spain';
   ```

3. **Fix geo_region classification**:
   ```sql
   UPDATE towns 
   SET geo_region = 'Mediterranean'
   WHERE country = 'Spain' AND name IN (coastal_spanish_towns);
   ```

#### Expected Impact
With complete data, Spanish coastal towns would score:
- Country/Region: 40/40 (100%)
- Geographic Features: 30/30 (100% - coastal match)
- Vegetation: 20/20 (100% - Mediterranean match)
- **New Region Score: 100%** (up from 44%)

This would cascade to improve overall matching from ~50% to ~85% for well-matched Spanish towns.

### Broader Implications

This case reveals systematic data quality issues:

1. **Data Completeness Varies by Country**: Some countries have rich data while others are bare minimum
2. **Fallback Mechanisms Insufficient**: The coastal indicator fallback doesn't work for Spanish towns
3. **Region Classification Inconsistent**: Mediterranean countries not consistently tagged
4. **User Preference Duplicates**: System allows duplicate selections ("Spain", "Spain")

### Solution Architecture

```javascript
// Proposed data enrichment pipeline
async function enrichTownData(town) {
  // 1. Geocode for geographic features
  const features = await detectGeographicFeatures(town.lat, town.lng)
  
  // 2. Climate API for weather data
  const climate = await fetchClimateData(town.lat, town.lng)
  
  // 3. Vegetation classification
  const vegetation = await classifyVegetation(town.country, town.region)
  
  // 4. Update database
  await updateTownData(town.id, { features, climate, vegetation })
}
```

---

## Conclusion

The Scout2Retire matching algorithm is sophisticated and well-designed, but its effectiveness is severely limited by data quality issues. The Spanish towns case study demonstrates that even perfect country matches can result in poor overall scores (44%) when critical data fields are missing.

The algorithm's strength lies in its:
- Flexible scoring with "open to anywhere" philosophy
- Multiple fallback mechanisms for missing data
- Gradual scoring for adjacent preferences
- Comprehensive coverage of retirement decision factors

The primary weakness is data completeness, particularly for:
- Geographic features (coastal, mountain, etc.)
- Vegetation types
- Climate specifics
- Consistent regional classification

Addressing these data gaps would dramatically improve matching accuracy and user satisfaction.