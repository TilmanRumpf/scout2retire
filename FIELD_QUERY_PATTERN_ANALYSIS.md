# Field Query Pattern Analysis - Towns Table

**Generated**: October 30, 2025
**Database**: Scout2Retire Towns Table (195 fields analyzed)
**Purpose**: Map database fields to intelligent search query patterns

---

## Executive Summary

The towns table contains **195 fields** across 9 distinct pattern categories. This analysis provides:

1. **Semantic understanding** of field naming conventions
2. **Query templates** for each field type
3. **Search optimization strategies** for data collection
4. **Edge case handling** for conditional fields

### Field Distribution by Pattern

| Pattern | Count | Examples |
|---------|-------|----------|
| **COUNT** | 8 | `golf_courses_count`, `hospital_count`, `marinas_count` |
| **RATING/SCORE** | 24 | `healthcare_score`, `nightlife_rating`, `outdoor_rating` |
| **DISTANCE** | 6 | `airport_distance`, `nearest_major_hospital_km` |
| **COST** | 14 | `cost_of_living_usd`, `rent_2bed_usd`, `groceries_cost` |
| **BOOLEAN** | 20 | `has_uber`, `retirement_visa_available`, `beaches_nearby` |
| **AVAILABLE (Lists)** | 7 | `activities_available`, `healthcare_specialties_available` |
| **LEVEL** | 4 | `sunshine_level_actual`, `humidity_level_actual` |
| **ACTUAL (Descriptive)** | 6 | `pace_of_life_actual`, `geographic_features_actual` |
| **QUALITY** | 4 | `public_transport_quality`, `emergency_services_quality` |
| **OTHER** | 102 | Identifiers, metadata, specialized fields |

---

## Pattern Analysis Deep Dive

### 1. COUNT PATTERNS (8 fields)

**Naming Convention**: `{item}_count`
**Data Type**: `number` (integer, 0-50 range)
**Query Format**: "How many [item] are in {location}?"

#### Fields:
- `hospital_count` (0-50)
- `golf_courses_count` (0-20)
- `tennis_courts_count` (0-30)
- `marinas_count` (0-15)
- `international_schools_count` (0-20)
- `coworking_spaces_count` (0-30)
- `veterinary_clinics_count` (0-20)
- `dog_parks_count` (0-15)

#### Query Template Pattern:
```
Primary: "How many {item} are in {town_name}, {region}, {country}?"
Alt 1:   "Number of {item} in {location}"
Alt 2:   "{town_name} {country} {item} count"
```

#### Example Queries:
```
✅ "How many hospitals are in Venice, Florida, United States?"
✅ "Number of golf courses in Budva, Montenegro"
✅ "Noumea New Caledonia marinas count"
```

#### Search Optimization Tips:
- **Include alternatives**: "medical facilities" for hospitals, "golf clubs" for golf courses
- **Check local sources**: City websites, tourism boards, Google Maps
- **Validate ranges**: Counts >50 for hospitals or >20 for golf courses likely incorrect
- **Cross-reference**: TripAdvisor, Yelp, local directories

#### Sample Data:
```javascript
// Venice, FL, United States
hospital_count: 0
golf_courses_count: 0
marinas_count: 3  // Valid: Coastal town
dog_parks_count: 0
```

---

### 2. RATING/SCORE PATTERNS (24 fields)

**Naming Convention**: `{category}_rating` or `{category}_score`
**Data Type**: `number` (1-10 scale)
**Query Format**: "Rate the {category} in {location} on a scale of 1-10"

#### Fields (Top 12):
- `healthcare_score` (quality of medical care)
- `safety_score` (crime, security)
- `nightlife_rating` (bars, clubs, entertainment)
- `museums_rating` (cultural institutions)
- `restaurants_rating` (dining scene)
- `cultural_rating` (arts, events)
- `outdoor_rating` (nature, activities)
- `shopping_rating` (retail options)
- `wellness_rating` (spas, gyms, yoga)
- `travel_connectivity_rating` (transportation access)
- `family_friendliness_rating` (kid-friendly)
- `senior_friendly_rating` (retiree-friendly)

#### Query Template Pattern:
```
Primary: "Rate the {category} in {location} on a scale of 1-10"
Alt 1:   "{category} quality rating {location}"
Alt 2:   "{town} {country} {category} score"
Alt 3:   "How good is the {category} in {location}"
```

#### Example Queries:
```
✅ "Rate the healthcare quality in Venice, Florida, United States on a scale of 1-10"
✅ "Nightlife rating Budva Montenegro"
✅ "How good is the restaurant scene in Noumea, New Caledonia"
```

#### Search Optimization Tips:
- **Use review aggregators**: Numbeo, Nomad List, Expatistan
- **Check local rankings**: "Best hospitals in {town}", "Top restaurants {location}"
- **Expat forums**: InterNations, Reddit expat communities
- **Tourism sites**: Official tourism boards often have quality metrics
- **Normalize ranges**: Convert percentages/5-star to 1-10 scale

#### Scoring Guidance:
| Score | Description | Indicators |
|-------|-------------|------------|
| 9-10  | Excellent, world-class | International recognition, awards |
| 7-8   | Good, above average | Regional reputation, positive reviews |
| 5-6   | Adequate, acceptable | Basic services available |
| 3-4   | Below average, limited | Few options, quality concerns |
| 1-2   | Poor, inadequate | Major gaps, safety concerns |

#### Sample Data:
```javascript
// Venice, FL
healthcare_score: 8  // Good hospital access in region
safety_score: 7      // Low crime, safe community
nightlife_rating: 2  // Limited entertainment options
restaurants_rating: 4 // Some dining, not extensive
```

---

### 3. DISTANCE PATTERNS (6 fields)

**Naming Convention**: `{destination}_distance` or `{destination}_km`
**Data Type**: `number` (kilometers, 0-500 range)
**Query Format**: "What is the distance from {location} to {destination} in kilometers?"

#### Fields:
- `airport_distance` (0-500 km, nearest major airport)
- `international_airport_distance` (0-500 km)
- `regional_airport_distance` (0-300 km)
- `nearest_major_hospital_km` (0-100 km)
- `distance_to_ocean_km` (0-500 km, 0 if coastal)
- `hiking_trails_km` (0-100 km)

#### Query Template Pattern:
```
Primary: "What is the distance from {location} to {destination} in kilometers?"
Alt 1:   "Nearest {destination} to {location}"
Alt 2:   "{town} {destination} distance"
Alt 3:   "How far is {location} from {destination}"
```

#### Example Queries:
```
✅ "What is the distance from Venice, Florida to the nearest international airport in kilometers?"
✅ "Nearest major hospital to Budva Montenegro"
✅ "How far is Noumea from the ocean"
```

#### Search Optimization Tips:
- **Use Google Maps**: Direct distance calculation
- **Verify airport type**: Distinguish international vs regional
- **Check driving distance**: May differ from straight-line
- **Coastal towns**: `distance_to_ocean_km` should be 0
- **Mountain towns**: Shorter hiking trail distances expected

#### Special Cases:
```javascript
// Coastal town
distance_to_ocean_km: 0  // Always 0 for coastal locations

// Island location
airport_distance: 80     // Often within island
international_airport_distance: 80  // Same as local airport

// Landlocked town
distance_to_ocean_km: 250  // Can be substantial
```

#### Sample Data:
```javascript
// Venice, FL (Coastal)
airport_distance: 41  // Sarasota-Bradenton Int'l
distance_to_ocean_km: 0  // On Gulf Coast
nearest_major_hospital_km: 47

// Budva, Montenegro (Coastal)
airport_distance: 102  // Podgorica Airport
distance_to_ocean_km: 0  // Adriatic coast
```

---

### 4. COST PATTERNS (14 fields)

**Naming Convention**: `{item}_cost`, `{item}_usd`, or `{item}_price`
**Data Type**: `number` (USD, various ranges)
**Query Format**: "What is the average {item} cost in {location} in USD?"

#### Fields by Category:

**Monthly Recurring:**
- `cost_of_living_usd` (500-5000, total monthly)
- `rent_2bed_usd` (300-3000, monthly rent)
- `rent_house_usd` (500-5000, monthly)
- `healthcare_cost_monthly` (50-500, insurance/care)
- `groceries_cost` (200-800, monthly food)
- `utilities_cost` (50-300, electricity/water/internet)

**One-Time/Purchase:**
- `typical_home_price` (50k-1M, purchase)
- `purchase_apartment_sqm_usd` (per square meter)
- `purchase_house_avg_usd` (average house)

**Per-Item:**
- `meal_cost` (5-50, restaurant meal)

**Requirements:**
- `min_income_requirement_usd` (visa/residency)

#### Query Template Pattern:
```
Primary: "What is the average {item} cost in {location} in USD?"
Alt 1:   "{item} costs {location}"
Alt 2:   "{town} {country} {item} expenses"
Alt 3:   "How much is {item} in {location}"
```

#### Example Queries:
```
✅ "What is the average monthly cost of living in Venice, Florida in USD?"
✅ "Rent 2 bedroom apartment Budva Montenegro USD"
✅ "How much are groceries in Noumea, New Caledonia"
```

#### Search Optimization Tips:
- **Primary sources**: Numbeo (most comprehensive), Expatistan
- **Expat forums**: Reddit r/expats, InterNations
- **Local sites**: Craigslist, local real estate sites
- **Currency conversion**: Always convert to USD at current rates
- **Quality tiers**: Specify "mid-range" or "average" to avoid luxury/budget extremes

#### Data Sources Ranked:
1. **Numbeo** - Most reliable, crowdsourced, regularly updated
2. **Expatistan** - Good for cost of living comparisons
3. **Local real estate sites** - Current rental/purchase prices
4. **Nomad List** - Digital nomad perspective, monthly costs
5. **Expat forums** - Real experiences, but verify dates

#### Expected Ranges by Field:

| Field | Low | Mid | High | Notes |
|-------|-----|-----|------|-------|
| `cost_of_living_usd` | 800 | 2000 | 4000 | Monthly, single person |
| `rent_2bed_usd` | 400 | 1200 | 2500 | Monthly, city center |
| `groceries_cost` | 200 | 400 | 700 | Monthly, one person |
| `utilities_cost` | 60 | 150 | 250 | Electricity, water, internet |
| `meal_cost` | 8 | 20 | 40 | Mid-range restaurant |
| `healthcare_cost_monthly` | 50 | 200 | 400 | Insurance or pay-per-use |

---

### 5. BOOLEAN PATTERNS (20 fields)

**Naming Convention**: `has_{item}`, `is_{state}`, or `{item}_available`
**Data Type**: `boolean` (true/false) or text ("yes"/"no")
**Query Format**: "Does {location} have {item}?" or "Is {item} available in {location}?"

#### Fields by Category:

**Transportation:**
- `has_uber` (Uber service available)
- `has_public_transit` (buses, trains, metro)

**Amenities:**
- `beaches_nearby` (within ~30km)
- `farmers_markets` (regular markets)

**Services:**
- `english_speaking_doctors` (medical care in English)
- `health_insurance_required` (mandatory insurance)

**Visa/Immigration:**
- `retirement_visa_available` (country-level)
- `digital_nomad_visa` (country-level)
- `tax_treaty_us` (country-level)
- `tax_haven_status` (country-level)
- `foreign_income_taxed` (country-level)

#### Query Template Pattern:
```
Primary: "Does {location} have {item}?"
Alt 1:   "Is {item} available in {location}"
Alt 2:   "{location} {item}"
Alt 3:   "{item} in {town} {country}"
```

#### Example Queries:
```
✅ "Does Venice, Florida have Uber?"
✅ "Is public transportation available in Budva, Montenegro"
✅ "Beaches nearby Noumea New Caledonia"
```

#### Search Optimization Tips:
- **Direct service checks**: Uber.com coverage map, company websites
- **Government sites**: Visa requirements, tax treaties
- **Yes/No clarity**: Look for definitive statements, not maybes
- **Country vs Town**: Some fields (visa, tax) apply to entire country

#### Special Handling:

**Country-Level Fields** (apply to all towns in country):
- `retirement_visa_available`
- `digital_nomad_visa`
- `tax_treaty_us`
- `tax_haven_status`
- `foreign_income_taxed`

Query these ONCE per country, not per town.

**Conditional Fields** (only relevant if condition met):
```javascript
// Only query if town is coastal or near coast
if (distance_to_ocean_km < 30) {
  query: beaches_nearby
}

// Only query if not in English-speaking country
if (country !== 'United States' && country !== 'United Kingdom') {
  query: english_speaking_doctors
}
```

#### Sample Data:
```javascript
// Venice, FL, United States
has_uber: false  // Small town, no Uber
has_public_transit: false  // Car-dependent
beaches_nearby: true  // Gulf Coast location
farmers_markets: true  // Weekly markets
retirement_visa_available: true  // US retirement options
```

---

### 6. LEVEL PATTERNS (4 fields)

**Naming Convention**: `{category}_level` or `{category}_level_actual`
**Data Type**: `string` (categorical: low/moderate/high or specific values)
**Query Format**: "What is the {category} level in {location}?"

#### Fields:
- `sunshine_level_actual`: `low`, `less_sunny`, `balanced`, `high`, `often_sunny`
- `precipitation_level_actual`: `low`, `mostly_dry`, `balanced`, `high`, `less_dry`
- `humidity_level_actual`: `low`, `moderate`, `high`
- `english_proficiency_level`: `low`, `moderate`, `high`, `native`

#### Query Template Pattern:
```
Primary: "What is the {category} level in {location}?"
Alt 1:   "{category} {location}"
Alt 2:   "{town} {country} {category}"
Alt 3:   "How {category_adj} is {location}"
```

#### Example Queries:
```
✅ "What is the sunshine level in Venice, Florida?"
✅ "Humidity Budva Montenegro"
✅ "How much does it rain in Noumea, New Caledonia"
```

#### Search Optimization Tips:
- **Climate data**: Weather.com, Climate-Data.org
- **Sunshine hours**: Convert hours/year to categorical
  - <2000 hrs = `low`
  - 2000-2400 = `less_sunny`
  - 2400-2800 = `balanced`
  - 2800-3200 = `high`
  - >3200 = `often_sunny`
- **Precipitation**: Annual rainfall in mm
  - <500mm = `low`
  - 500-800 = `mostly_dry`
  - 800-1200 = `balanced`
  - 1200-1800 = `high`
  - >1800 = `less_dry`
- **English proficiency**: EF English Proficiency Index

#### Categorical Value Mapping:

**Sunshine Level:**
| Value | Description | Hours/Year |
|-------|-------------|------------|
| `low` | Overcast, cloudy | <2000 |
| `less_sunny` | Some clouds | 2000-2400 |
| `balanced` | Mix of sun/clouds | 2400-2800 |
| `high` | Mostly sunny | 2800-3200 |
| `often_sunny` | Constantly sunny | >3200 |

**Humidity Level:**
| Value | Description | Relative % |
|-------|-------------|------------|
| `low` | Dry, arid | <50% |
| `moderate` | Comfortable | 50-70% |
| `high` | Humid, muggy | >70% |

---

### 7. ACTUAL PATTERNS (6 fields)

**Naming Convention**: `{category}_actual`
**Data Type**: `string` (descriptive categorical)
**Query Format**: "What is the {category} in {location}?"

#### Fields:
- `pace_of_life_actual`: `slow`, `relaxed`, `moderate`, `fast`
- `social_atmosphere`: `reserved`, `quiet`, `moderate`, `friendly`, `vibrant`, `very friendly`
- `geographic_features_actual`: `coastal`, `mountain`, `valley`, `plains`, `island`, etc.
- `vegetation_type_actual`: `desert`, `forest`, `grassland`, `tropical`, etc.
- `summer_climate_actual`: `hot`, `warm`, `mild`, `cool`
- `winter_climate_actual`: `cold`, `cool`, `mild`, `warm`
- `seasonal_variation_actual`: `low`, `minimal`, `moderate`, `distinct_seasons`, `high`, `extreme`

#### Query Template Pattern:
```
Primary: "What is the {category} in {location}?"
Alt 1:   "{category} {location}"
Alt 2:   "Describe the {category} in {town} {country}"
```

#### Example Queries:
```
✅ "What is the pace of life in Venice, Florida?"
✅ "Social atmosphere Budva Montenegro"
✅ "Describe the geography of Noumea, New Caledonia"
```

#### Search Optimization Tips:
- **Expat forums**: Best source for subjective qualities like "pace of life"
- **Tourism descriptions**: Often describe atmosphere, lifestyle
- **Geographic data**: Google Earth, Wikipedia for terrain/features
- **Climate guides**: Köppen climate classification
- **Look for keywords**: "laid-back", "bustling", "friendly locals"

#### Data Quality Note:
These are **descriptive categorical values**, not errors! The September 30, 2025 audit found:
- 48% of towns use "relaxed" for pace_of_life_actual
- This is BETTER than forcing generic "slow" or "moderate"
- Rich descriptors improve user experience

**Example Valid Values:**
```javascript
// Venice, FL - Retiree town
pace_of_life_actual: "relaxed"  // ✅ Perfect descriptor
social_atmosphere: "friendly"   // ✅ Retirement community vibe

// Budva, Montenegro - Tourist town
pace_of_life_actual: "moderate"  // ✅ Seasonal variation
social_atmosphere: "vibrant"     // ✅ Summer nightlife

// Noumea, New Caledonia - Island
geographic_features_actual: "coastal, island"  // ✅ Multiple features
vegetation_type_actual: "tropical"  // ✅ Pacific island
```

---

### 8. QUALITY PATTERNS (4 fields)

**Naming Convention**: `{service}_quality`
**Data Type**: `string` (categorical: poor/basic/adequate/good/excellent)
**Query Format**: "What is the {service} quality in {location}?"

#### Fields:
- `public_transport_quality`: Quality of buses, trains, metro
- `emergency_services_quality`: Ambulance, fire, police response
- `road_quality`: Condition of roads and highways

#### Query Template Pattern:
```
Primary: "What is the {service} quality in {location}?"
Alt 1:   "{service} quality {location}"
Alt 2:   "How good is {service} in {town} {country}"
```

#### Example Queries:
```
✅ "What is the public transportation quality in Venice, Florida?"
✅ "Emergency services quality Budva Montenegro"
✅ "Road conditions Noumea New Caledonia"
```

#### Quality Scale:
| Value | Description | Indicators |
|-------|-------------|------------|
| `poor` | Inadequate, unreliable | Frequent issues, safety concerns |
| `basic` | Minimal, functional | Limited service, basic coverage |
| `adequate` | Acceptable, sufficient | Meets needs, some gaps |
| `good` | Reliable, above average | Consistent service, well-maintained |
| `excellent` | Outstanding, world-class | Exceptional service, highly rated |

---

### 9. LIST PATTERNS (7 fields)

**Naming Convention**: `{items}_available`
**Data Type**: `string` (comma-separated list)
**Query Format**: "What {items} are available in {location}?"

#### Fields:
- `activities_available`: Outdoor/recreational activities (50-200 items)
- `healthcare_specialties_available`: Medical specialties (5-20 items)
- `medical_specialties_available`: Same as healthcare (alias)
- `water_sports_available`: Beach/ocean activities (5-15 items)
- `international_schools_available`: Names of schools (0-10 items)
- `childcare_available`: Daycare/preschool options (boolean or list)

#### Query Template Pattern:
```
Primary: "What {items} are available in {location}?"
Alt 1:   "{items} {location}"
Alt 2:   "List of {items} in {town} {country}"
```

#### Example Queries:
```
✅ "What outdoor activities are available in Venice, Florida?"
✅ "Medical specialties Budva Montenegro"
✅ "Water sports Noumea New Caledonia"
```

#### Search Optimization Tips:
- **Tourism websites**: Comprehensive activity lists
- **Hospital websites**: Medical specialties offered
- **TripAdvisor**: Activity reviews and listings
- **Google Maps**: Local business search
- **Expat forums**: What people actually do for fun

#### Sample Data Structure:
```javascript
// Venice, FL
activities_available: "adventure_activities,fishing_charters,boating,sailing,beach_walking,hiking,bird_watching,golf,tennis,yoga,swimming,kayaking"

healthcare_specialties_available: "cardiology,oncology,orthopedics,general surgery"

water_sports_available: "sailing,fishing,kayaking,paddleboarding,swimming"
```

#### Parsing Strategy:
```javascript
// Split into array
const activities = town.activities_available.split(',');

// Count
const activityCount = activities.length;

// Check for specific activity
const hasYoga = activities.includes('yoga');
```

---

## Edge Cases and Special Handling

### 1. Country-Level vs Town-Level Fields

**Country-Level** (query once per country, apply to all towns):
```javascript
const COUNTRY_LEVEL_FIELDS = [
  'retirement_visa_available',
  'digital_nomad_visa',
  'visa_requirements',
  'tax_treaty_us',
  'tax_haven_status',
  'foreign_income_taxed'
];
```

**Query Strategy:**
1. Query once per country
2. Cache result
3. Apply to all towns in that country
4. Update annually or on policy changes

### 2. Conditional Fields (Only Query if Condition Met)

```javascript
// Marinas - only for coastal towns
if (town.distance_to_ocean_km === 0) {
  query('marinas_count');
  query('water_sports_available');
}

// Beaches - within 30km of coast
if (town.distance_to_ocean_km < 30) {
  query('beaches_nearby');
}

// English-speaking doctors - non-English countries
const englishSpeakingCountries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand', 'Ireland'];
if (!englishSpeakingCountries.includes(town.country)) {
  query('english_speaking_doctors');
  query('english_proficiency_level');
}
```

### 3. Fields That Should Never Be Queried

```javascript
const NO_QUERY_FIELDS = [
  // Identifiers
  'id', 'name', 'town_name',

  // Coordinates
  'latitude', 'longitude',

  // URLs and links
  'google_maps_link',
  'image_url_1', 'image_url_2', 'image_url_3',
  'image_source', 'image_license',

  // Internal metadata
  'data_completeness_score',
  'image_validated_at',
  'image_validation_note',

  // Calculated/derived
  'cost_index', // Relative to other towns
  'quality_of_life' // Composite score
];
```

### 4. Fields Requiring Calculation or Transformation

```javascript
// Sunshine hours → sunshine_level_actual
function convertSunshineToLevel(hoursPerYear) {
  if (hoursPerYear < 2000) return 'low';
  if (hoursPerYear < 2400) return 'less_sunny';
  if (hoursPerYear < 2800) return 'balanced';
  if (hoursPerYear < 3200) return 'high';
  return 'often_sunny';
}

// Annual rainfall (mm) → precipitation_level_actual
function convertRainfallToLevel(mmPerYear) {
  if (mmPerYear < 500) return 'low';
  if (mmPerYear < 800) return 'mostly_dry';
  if (mmPerYear < 1200) return 'balanced';
  if (mmPerYear < 1800) return 'high';
  return 'less_dry';
}

// Temperature ranges → climate descriptors
function classifySummerClimate(avgTempC) {
  if (avgTempC < 18) return 'cool';
  if (avgTempC < 24) return 'mild';
  if (avgTempC < 30) return 'warm';
  return 'hot';
}
```

---

## Query Optimization Strategies

### 1. Batch Country-Level Queries

```javascript
// Get all unique countries first
const countries = [...new Set(towns.map(t => t.country))];

// Query visa info once per country
const countryData = {};
for (const country of countries) {
  countryData[country] = {
    retirement_visa_available: await queryVisa(country),
    digital_nomad_visa: await queryDigitalNomadVisa(country),
    tax_treaty_us: await queryTaxTreaty(country)
  };
}

// Apply to all towns in country
towns.forEach(town => {
  Object.assign(town, countryData[town.country]);
});
```

### 2. Skip Conditional Fields Early

```javascript
function getQueryableFields(town) {
  const allFields = Object.keys(town);

  return allFields.filter(field => {
    // Skip no-query fields
    if (NO_QUERY_FIELDS.includes(field)) return false;

    // Check conditionals
    if (field === 'marinas_count' && town.distance_to_ocean_km > 0) return false;
    if (field === 'water_sports_available' && town.distance_to_ocean_km > 50) return false;

    return true;
  });
}
```

### 3. Prioritize High-Impact Fields

**Priority 1** (User-critical, always visible):
- `cost_of_living_usd`
- `healthcare_score`
- `safety_score`
- `climate fields` (summer, winter, sunshine)
- `pace_of_life_actual`

**Priority 2** (Important for filtering):
- `rent_2bed_usd`
- `airport_distance`
- `retirement_visa_available`
- `english_speaking_doctors`

**Priority 3** (Nice-to-have, detail pages):
- Activity counts
- Amenity ratings
- Infrastructure quality

### 4. Query Variation Strategy

Use multiple query variations per field to improve hit rate:

```javascript
async function queryWithVariations(field, town) {
  const pattern = getQueryPattern(field, town);

  // Try primary query first
  let result = await searchGoogle(pattern.primaryQuery);
  if (result.confident) return result;

  // Try variations if primary fails
  for (const variation of pattern.variations) {
    result = await searchGoogle(variation);
    if (result.confident) return result;
  }

  // Fall back to broad search
  return await searchGoogle(`${town.town_name} ${town.country} ${field.replace('_', ' ')}`);
}
```

---

## Data Quality and Validation

### Expected Value Ranges

```javascript
const VALIDATION_RULES = {
  // Counts (should be integers)
  hospital_count: { min: 0, max: 50, type: 'integer' },
  golf_courses_count: { min: 0, max: 20, type: 'integer' },

  // Ratings (1-10 scale)
  healthcare_score: { min: 1, max: 10, type: 'number' },
  safety_score: { min: 1, max: 10, type: 'number' },

  // Distances (kilometers)
  airport_distance: { min: 0, max: 500, type: 'number' },
  nearest_major_hospital_km: { min: 0, max: 100, type: 'number' },

  // Costs (USD)
  cost_of_living_usd: { min: 500, max: 5000, type: 'number' },
  rent_2bed_usd: { min: 200, max: 3000, type: 'number' },

  // Categorical (enum values)
  pace_of_life_actual: {
    values: ['slow', 'relaxed', 'moderate', 'fast'],
    type: 'enum'
  },
  sunshine_level_actual: {
    values: ['low', 'less_sunny', 'balanced', 'high', 'often_sunny'],
    type: 'enum'
  }
};
```

### Common Data Quality Issues

**Issue 1: Case Sensitivity**
```javascript
// ❌ WRONG - August 2025 disaster
if (town.geographic_features_actual === 'Coastal') // Won't match "coastal"

// ✅ RIGHT - Always normalize
if (town.geographic_features_actual.toLowerCase() === 'coastal')
```

**Issue 2: Missing SELECT Fields**
```javascript
// ❌ WRONG - 3-hour duplicate definition bug
const selectColumns = 'id, name, country';  // First definition
// ... 500 lines later ...
const selectColumns = 'id, name';  // Second definition (missing country!)

// ✅ RIGHT - Use centralized column sets
import { COLUMN_SETS } from './townColumnSets';
const { data } = await supabase.from('towns').select(COLUMN_SETS.basic);
```

**Issue 3: Null vs Empty String**
```javascript
// Check for both null and empty
if (!town.activities_available || town.activities_available.trim() === '') {
  // Field is empty, query it
}
```

---

## Recommendations for Implementation

### 1. Create Query Pattern Manager

```javascript
// src/utils/scoring/queryPatternManager.js
import { getQueryPattern, shouldQueryField } from './fieldQueryPatterns';

export class QueryPatternManager {
  async queryTown(town, fields) {
    const results = {};

    for (const field of fields) {
      // Skip if shouldn't query
      if (!shouldQueryField(field, town)) {
        results[field] = { skipped: true, reason: 'conditional not met' };
        continue;
      }

      // Get pattern
      const pattern = getQueryPattern(field, town);
      if (!pattern) {
        results[field] = { error: 'no pattern found' };
        continue;
      }

      // Execute query with variations
      results[field] = await this.executeQuery(pattern);
    }

    return results;
  }

  async executeQuery(pattern) {
    // Try primary query
    let result = await this.searchGoogle(pattern.primaryQuery);
    if (result.confidence > 0.8) return result;

    // Try variations
    for (const variation of pattern.variations) {
      result = await this.searchGoogle(variation);
      if (result.confidence > 0.8) return result;
    }

    return result;
  }
}
```

### 2. Prioritize Missing Fields

```javascript
// Query high-priority fields first
async function fillMissingData(towns) {
  const priorities = {
    1: ['cost_of_living_usd', 'healthcare_score', 'safety_score'],
    2: ['rent_2bed_usd', 'airport_distance', 'pace_of_life_actual'],
    3: ['golf_courses_count', 'nightlife_rating', 'shopping_rating']
  };

  for (const priority of [1, 2, 3]) {
    const fields = priorities[priority];

    for (const town of towns) {
      const missingFields = fields.filter(f => !town[f]);
      if (missingFields.length > 0) {
        await queryTown(town, missingFields);
      }
    }
  }
}
```

### 3. Cache Country-Level Data

```javascript
// Cache visa and tax data per country
const countryCache = new Map();

async function getCountryData(country) {
  if (countryCache.has(country)) {
    return countryCache.get(country);
  }

  const data = {
    retirement_visa_available: await queryVisa(country),
    digital_nomad_visa: await queryDigitalNomad(country),
    tax_treaty_us: await queryTaxTreaty(country)
  };

  countryCache.set(country, data);
  return data;
}
```

### 4. Implement Validation Pipeline

```javascript
// Validate query results before saving
function validateResult(field, value) {
  const rule = VALIDATION_RULES[field];
  if (!rule) return { valid: true };

  if (rule.type === 'integer' && !Number.isInteger(value)) {
    return { valid: false, reason: 'not an integer' };
  }

  if (rule.min !== undefined && value < rule.min) {
    return { valid: false, reason: 'below minimum' };
  }

  if (rule.max !== undefined && value > rule.max) {
    return { valid: false, reason: 'above maximum' };
  }

  if (rule.type === 'enum' && !rule.values.includes(value)) {
    return { valid: false, reason: 'invalid enum value' };
  }

  return { valid: true };
}
```

---

## Summary of Key Learnings

### 1. Field Naming Conventions Are Semantic
- `_count` → countable items
- `_rating`/`_score` → 1-10 scales
- `_km`/`_distance` → distances in kilometers
- `_cost`/`_usd` → monetary values
- `has_`/`is_`/`_available` → boolean flags
- `_actual` → descriptive categorical (rich values!)
- `_level` → categorical levels (low/moderate/high)
- `_quality` → quality ratings (poor to excellent)

### 2. Query Optimization Hierarchy
1. **Skip unnecessary**: Use conditional logic
2. **Batch country-level**: Query once per country
3. **Prioritize high-impact**: Cost, safety, healthcare first
4. **Use variations**: Multiple query formats increase success rate

### 3. Data Quality Matters
- **Case sensitivity kills**: Always `.toLowerCase()` on comparisons
- **Validate ranges**: Catches outliers and errors
- **Rich descriptors are good**: "relaxed" > forcing "slow" or "moderate"
- **Centralized column sets**: Prevents duplicate definitions

### 4. Edge Cases Are Common
- **Conditional fields**: 15+ fields only apply in certain contexts
- **Country vs town**: 6 fields are country-level only
- **Never query**: 20+ fields are metadata/identifiers

---

## Files Created

1. **`/src/utils/scoring/fieldQueryPatterns.js`**
   - Pattern templates for all 9 categories
   - Query generation functions
   - Edge case handling
   - Validation helpers

2. **`/FIELD_QUERY_PATTERN_ANALYSIS.md`** (this document)
   - Comprehensive analysis
   - Search optimization strategies
   - Implementation recommendations

---

## Next Steps

1. **Implement Query Pattern Manager**
   - Create service to use patterns
   - Integrate with Claude API
   - Add caching layer

2. **Build Data Collection Pipeline**
   - Prioritize missing fields
   - Query high-impact fields first
   - Validate results before saving

3. **Create Admin Interface**
   - `/admin/data-collector` page
   - Select towns and fields
   - Monitor query progress
   - Review and approve results

4. **Test and Iterate**
   - Start with 5-10 test towns
   - Verify query accuracy
   - Tune patterns based on results
   - Scale to full database

---

**Document Version**: 1.0
**Last Updated**: October 30, 2025
**Author**: Claude Code Analysis
