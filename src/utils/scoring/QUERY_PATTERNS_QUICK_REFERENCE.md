# Query Patterns Quick Reference

**Quick lookup guide for database field query patterns**

---

## Usage

```javascript
import { getQueryPattern, shouldQueryField } from './fieldQueryPatterns';

// Get query pattern for a field
const pattern = getQueryPattern('hospital_count', town);
console.log(pattern.primaryQuery);
// "How many hospitals are in Venice, Florida, United States?"

// Check if field should be queried
if (shouldQueryField('marinas_count', town)) {
  // Query only if town is coastal
}
```

---

## Pattern Categories

### COUNT (8 fields) - "How many X..."
```
hospital_count, golf_courses_count, tennis_courts_count,
marinas_count, international_schools_count, coworking_spaces_count,
veterinary_clinics_count, dog_parks_count
```
**Format**: Number (0-50)
**Query**: `"How many {item} are in {location}?"`

### RATING/SCORE (24 fields) - "Rate the X 1-10"
```
healthcare_score, safety_score, nightlife_rating,
restaurants_rating, outdoor_rating, cultural_rating,
museums_rating, shopping_rating, wellness_rating
```
**Format**: Number (1-10)
**Query**: `"Rate the {category} in {location} on a scale of 1-10"`

### DISTANCE (6 fields) - "How far to X..."
```
airport_distance, nearest_major_hospital_km,
distance_to_ocean_km, hiking_trails_km,
regional_airport_distance, international_airport_distance
```
**Format**: Number (kilometers)
**Query**: `"What is the distance from {location} to {destination} in kilometers?"`

### COST (14 fields) - "What is cost of X..."
```
cost_of_living_usd, rent_2bed_usd, healthcare_cost_monthly,
groceries_cost, utilities_cost, meal_cost, typical_home_price
```
**Format**: Number (USD)
**Query**: `"What is the average {item} cost in {location} in USD?"`

### BOOLEAN (20 fields) - "Does X have Y..."
```
has_uber, has_public_transit, retirement_visa_available,
beaches_nearby, farmers_markets, english_speaking_doctors
```
**Format**: Yes/No or true/false
**Query**: `"Does {location} have {item}?"`

### LEVEL (4 fields) - "What is X level..."
```
sunshine_level_actual, humidity_level_actual,
precipitation_level_actual, english_proficiency_level
```
**Format**: Categorical (low/moderate/high or specific values)
**Query**: `"What is the {category} level in {location}?"`

### ACTUAL (6 fields) - "What is X like..."
```
pace_of_life_actual, social_atmosphere,
geographic_features_actual, vegetation_type_actual,
summer_climate_actual, winter_climate_actual
```
**Format**: Descriptive text (categorical)
**Query**: `"What is the {category} in {location}?"`

### QUALITY (4 fields) - "What is X quality..."
```
public_transport_quality, emergency_services_quality, road_quality
```
**Format**: Categorical (poor/basic/adequate/good/excellent)
**Query**: `"What is the {service} quality in {location}?"`

### LIST (7 fields) - "What X are available..."
```
activities_available, healthcare_specialties_available,
water_sports_available, international_schools_available
```
**Format**: Comma-separated list
**Query**: `"What {items} are available in {location}?"`

---

## Conditional Fields (Only Query if Condition Met)

```javascript
// Coastal-only fields
if (town.distance_to_ocean_km === 0) {
  // marinas_count, water_sports_available
}

// Near-coast fields
if (town.distance_to_ocean_km < 30) {
  // beaches_nearby
}

// Non-English countries
if (!['United States', 'United Kingdom', 'Canada', ...].includes(town.country)) {
  // english_speaking_doctors, english_proficiency_level
}
```

---

## Country-Level Fields (Query Once per Country)

```javascript
// Apply to ALL towns in the country
const COUNTRY_LEVEL = [
  'retirement_visa_available',
  'digital_nomad_visa',
  'tax_treaty_us',
  'tax_haven_status',
  'foreign_income_taxed'
];
```

---

## Never Query These

```javascript
// Identifiers, metadata, coordinates, URLs
const NO_QUERY = [
  'id', 'town_name', 'latitude', 'longitude',
  'google_maps_link', 'image_url_1', 'image_url_2',
  'data_completeness_score', 'cost_index'
];
```

---

## Expected Value Ranges

| Field Type | Min | Max | Notes |
|------------|-----|-----|-------|
| Count (hospitals) | 0 | 50 | Integer |
| Count (golf courses) | 0 | 20 | Integer |
| Rating/Score | 1 | 10 | Numeric |
| Distance (airport) | 0 | 500 | Kilometers |
| Distance (hospital) | 0 | 100 | Kilometers |
| Cost (monthly living) | 500 | 5000 | USD |
| Cost (rent 2bed) | 200 | 3000 | USD |

---

## Common Categorical Values

### Pace of Life
`slow`, `relaxed`, `moderate`, `fast`

### Social Atmosphere
`reserved`, `quiet`, `moderate`, `friendly`, `vibrant`, `very friendly`

### Sunshine Level
`low`, `less_sunny`, `balanced`, `high`, `often_sunny`

### Precipitation Level
`low`, `mostly_dry`, `balanced`, `high`, `less_dry`

### Quality Scale
`poor`, `basic`, `adequate`, `good`, `excellent`

---

## Query Variations Strategy

Each field has multiple query formats to improve hit rate:

```javascript
// Example: hospital_count
pattern.primaryQuery = "How many hospitals are in Venice, Florida, United States?"
pattern.variations = [
  "Number of hospitals in Venice, Florida, United States",
  "Venice Florida hospitals count",
  "Medical facilities in Venice, Florida"
]

// Try primary first, then variations
for (const query of [pattern.primaryQuery, ...pattern.variations]) {
  const result = await search(query);
  if (result.confidence > 0.8) return result;
}
```

---

## Data Quality Rules

### Always:
- ✅ Use `.toLowerCase()` on string comparisons
- ✅ Validate ranges before saving
- ✅ Use COLUMN_SETS from townColumnSets.js
- ✅ Check for null AND empty string

### Never:
- ❌ Assume case matches ("Coastal" ≠ "coastal")
- ❌ Skip validation
- ❌ Use `SELECT *` on towns table (170 columns!)
- ❌ Define same variable twice

---

## Priority Levels

### Priority 1 (Query First)
```
cost_of_living_usd, healthcare_score, safety_score,
climate fields, pace_of_life_actual
```

### Priority 2 (Important)
```
rent_2bed_usd, airport_distance, retirement_visa_available,
english_speaking_doctors
```

### Priority 3 (Nice to Have)
```
Activity counts, amenity ratings, infrastructure quality
```

---

## Quick Example

```javascript
import { getQueryPattern, shouldQueryField } from './fieldQueryPatterns';

async function queryTownField(town, fieldName) {
  // Check if should query
  if (!shouldQueryField(fieldName, town)) {
    console.log(`Skipping ${fieldName} - condition not met`);
    return null;
  }

  // Get pattern
  const pattern = getQueryPattern(fieldName, town);
  if (!pattern) {
    console.log(`No pattern found for ${fieldName}`);
    return null;
  }

  // Try primary query
  let result = await searchGoogle(pattern.primaryQuery);
  if (result.confidence > 0.8) return result.value;

  // Try variations
  for (const variation of pattern.variations) {
    result = await searchGoogle(variation);
    if (result.confidence > 0.8) return result.value;
  }

  console.log(`Low confidence for ${fieldName}`);
  return null;
}

// Usage
const hospitalCount = await queryTownField(town, 'hospital_count');
const healthcareScore = await queryTownField(town, 'healthcare_score');
```

---

## Search Sources by Field Type

### COUNT fields
- Google Maps (local business search)
- City websites
- Tourism boards
- TripAdvisor listings

### RATING fields
- Numbeo
- Nomad List
- Expat forums (Reddit, InterNations)
- Local rankings/reviews

### DISTANCE fields
- Google Maps (direct calculation)
- Airport websites
- Distance calculators

### COST fields
- Numbeo (primary source)
- Expatistan
- Local real estate sites
- Expat forums

### BOOLEAN fields
- Service websites (Uber.com)
- Government sites (visa info)
- Tourism websites

### CLIMATE/GEOGRAPHY fields
- Weather.com
- Climate-Data.org
- Köppen classification
- Wikipedia

---

**Last Updated**: October 30, 2025
**See Also**:
- `/src/utils/scoring/fieldQueryPatterns.js` (implementation)
- `/FIELD_QUERY_PATTERN_ANALYSIS.md` (detailed analysis)
