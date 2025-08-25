# Climate Matching Algorithm (15% of total score)
**Date: August 25, 2025**

## Overview
The climate matching algorithm evaluates weather and environmental preferences using a sophisticated gradual scoring system that provides partial credit for adjacent climate categories rather than binary matching.

## Database Fields Referenced

### User Preferences Table
- `summer_climate_preference` (Array): Preferred summer climates ["hot", "warm", "mild"]
- `winter_climate_preference` (Array): Preferred winter climates ["cold", "mild", "warm"]
- `humidity_level` (Array): Preferred humidity ["humid", "dry", "moderate"]
- `sunshine` (Array): Sunshine preference ["sunny", "less_sunny", "cloudy"]
- `precipitation` (Array): Rain preference ["often_rainy", "dry", "moderate"]
- `seasonal_preference` (String): Overall seasonal pattern preference

### Towns Table
- `summer_climate_actual` (String): Actual summer climate category
- `winter_climate_actual` (String): Actual winter climate category
- `avg_temp_summer` (Number): Average summer temperature in Celsius
- `avg_temp_winter` (Number): Average winter temperature in Celsius
- `summer_temp_low` (Number): Summer low temperature (7°C to 29°C)
- `summer_temp_high` (Number): Summer high temperature (17°C to 49°C)
- `winter_temp_low` (Number): Winter low temperature (-15°C to 25°C)
- `winter_temp_high` (Number): Winter high temperature (-5°C to 35°C)
- `humidity_level_actual` (String): Categorical humidity level
- `humidity_average` (Number): Average humidity percentage (30% to 85%)
- `sunshine_level_actual` (String): Categorical sunshine level
- `sunshine_hours` (Number): Annual sunshine hours (1,320 to 4,020)
- `precipitation_level_actual` (String): Categorical precipitation level
- `annual_rainfall` (Number): Annual rainfall in mm (0 to 3,900)
- `seasonal_variation_actual` (String): Seasonal variation level

## Scoring Breakdown (100 points total)

### 1. Summer Climate Match (25 points)
```javascript
// Field references: user_preferences.summer_climate_preference vs towns.summer_climate_actual
```

**Temperature-based categorization:**
- **Hot**: avg_temp_summer ≥ 30°C
- **Warm**: 20°C ≤ avg_temp_summer < 30°C  
- **Mild**: avg_temp_summer < 20°C

**Gradual scoring system:**
- **Exact match**: 25 points
- **Adjacent category**: 15 points
  - Hot ↔ Warm (adjacent)
  - Warm ↔ Mild (adjacent)
- **Two categories apart**: 5 points
  - Hot ↔ Mild (opposite ends)
- **No preference specified**: 25 points (full credit)

**Fallback for missing data:**
```javascript
if (!town.summer_climate_actual && town.avg_temp_summer) {
  // Derive from temperature data
  if (avg_temp_summer >= 30) summer_climate_actual = "hot";
  else if (avg_temp_summer >= 20) summer_climate_actual = "warm";
  else summer_climate_actual = "mild";
}
```

### 2. Winter Climate Match (25 points)
```javascript
// Field references: user_preferences.winter_climate_preference vs towns.winter_climate_actual
```

**Temperature-based categorization:**
- **Cold**: avg_temp_winter < 5°C
- **Mild**: 5°C ≤ avg_temp_winter < 15°C
- **Warm**: avg_temp_winter ≥ 15°C

**Gradual scoring system:**
- **Exact match**: 25 points
- **Adjacent category**: 15 points
  - Cold ↔ Mild (adjacent)
  - Mild ↔ Warm (adjacent)
- **Two categories apart**: 5 points
  - Cold ↔ Warm (opposite ends)
- **No preference specified**: 25 points (full credit)

**Fallback for missing data:**
```javascript
if (!town.winter_climate_actual && town.avg_temp_winter) {
  // Derive from temperature data
  if (avg_temp_winter < 5) winter_climate_actual = "cold";
  else if (avg_temp_winter < 15) winter_climate_actual = "mild";
  else winter_climate_actual = "warm";
}
```

### 3. Humidity Level Match (15 points)
```javascript
// Field references: user_preferences.humidity_level vs towns.humidity_level_actual
```

**Humidity categorization:**
- **Dry**: humidity_average < 50%
- **Moderate**: 50% ≤ humidity_average < 70%
- **Humid**: humidity_average ≥ 70%

**Gradual scoring system:**
- **Exact match**: 15 points
- **Adjacent category**: 10 points
  - Dry ↔ Moderate (adjacent)
  - Moderate ↔ Humid (adjacent)
- **Two categories apart**: 5 points
  - Dry ↔ Humid (opposite ends)
- **No preference**: 15 points (full credit)

**Data validation:**
- Humidity values range from 30% to 85% in database
- Missing data triggers fallback to climate-based estimation

### 4. Sunshine Level Match (15 points)
```javascript
// Field references: user_preferences.sunshine vs towns.sunshine_level_actual
```

**Sunshine categorization:**
- **Sunny**: sunshine_hours > 2,800 hours/year
- **Moderate** (less_sunny): 2,000 ≤ sunshine_hours ≤ 2,800
- **Cloudy**: sunshine_hours < 2,000 hours/year

**Gradual scoring system:**
- **Exact match**: 15 points
- **Adjacent category**: 10 points
  - Sunny ↔ Moderate (adjacent)
  - Moderate ↔ Cloudy (adjacent)
- **Two categories apart**: 5 points
  - Sunny ↔ Cloudy (opposite ends)
- **No preference**: 15 points (full credit)

**Annual sunshine ranges:**
- Minimum: 1,320 hours (very cloudy locations)
- Maximum: 4,020 hours (desert locations)

### 5. Precipitation Level Match (10 points)
```javascript
// Field references: user_preferences.precipitation vs towns.precipitation_level_actual
```

**Precipitation categorization:**
- **Dry**: annual_rainfall < 500mm
- **Moderate**: 500mm ≤ annual_rainfall < 1,000mm
- **Wet** (often_rainy): annual_rainfall ≥ 1,000mm

**Gradual scoring system:**
- **Exact match**: 10 points
- **Adjacent category**: 6 points
  - Dry ↔ Moderate (adjacent)
  - Moderate ↔ Wet (adjacent)
- **Two categories apart**: 2 points
  - Dry ↔ Wet (opposite ends)
- **No preference**: 10 points (full credit)

**Annual rainfall ranges:**
- Minimum: 0mm (extreme desert)
- Maximum: 3,900mm (tropical rainforest)

### 6. Seasonal Variation Match (10 points)
```javascript
// Field references: user_preferences.seasonal_preference vs towns.seasonal_variation_actual
```

**Seasonal preference mapping:**
- `warm_all_year` → Low seasonal variation
- `distinct_seasons` → High seasonal variation
- `mild_variation` → Moderate seasonal variation

**Seasonal variation calculation:**
```javascript
// Derived from temperature difference
seasonal_variation = Math.abs(avg_temp_summer - avg_temp_winter);
if (seasonal_variation < 10) seasonal_variation_actual = "low";
else if (seasonal_variation < 20) seasonal_variation_actual = "moderate";
else seasonal_variation_actual = "high";
```

**Scoring:**
- **Match**: 10 points
- **Adjacent**: 6 points
- **Opposite**: 2 points
- **No preference**: 10 points

## Special Cases and Fallbacks

### Climate Type Integration
```javascript
// Field reference: towns.climate
```
When specific climate data is missing, the algorithm uses the overall climate type as fallback:

**Climate type mappings:**
- **Desert**: hot/warm summers, mild winters, dry, sunny, low precipitation
- **Mediterranean**: warm summers, mild winters, moderate humidity, sunny, low-moderate precipitation
- **Tropical**: hot summers, warm winters, humid, moderate sun, high precipitation
- **Continental**: warm summers, cold winters, moderate humidity, moderate sun, moderate precipitation
- **Temperate**: mild-warm summers, mild winters, moderate all categories
- **Subtropical**: hot summers, mild-warm winters, humid, sunny, moderate-high precipitation

### Missing Data Handling

1. **Temperature-based derivation**: When categorical data missing, derive from numerical temperatures
2. **Climate-based estimation**: Use overall climate type for missing specific metrics
3. **Regional defaults**: Apply regional averages when town data incomplete
4. **Warning flags**: Add data quality warnings to match insights

### No Preferences = Perfect Score
- Users without climate preferences receive 100% match
- Supports "climate-flexible" retirees

## Algorithm Priority Order

1. **Temperature preferences** (50% combined - summer + winter)
   - Most important for comfort and health
   
2. **Humidity** (15% of score)
   - Significant health and comfort impact
   
3. **Sunshine** (15% of score)
   - Mental health and lifestyle considerations
   
4. **Precipitation** (10% of score)
   - Daily life convenience
   
5. **Seasonal variation** (10% of score)
   - Long-term adaptation needs

## Integration with Other Systems

### Health Considerations
- Extreme temperatures flagged for users with health conditions
- High humidity warnings for respiratory issues
- Low sunshine alerts for seasonal affective concerns

### Cost Correlations
- Hot climates often correlate with higher cooling costs
- Cold climates with higher heating costs
- Algorithm notes these in insights

### Activity Availability
- Climate affects available activities (skiing, beach, hiking seasons)
- Cross-referenced with hobbies matching

## Recent Improvements (August 2025)

1. **Gradual Scoring Implementation**
   - Moved from binary to gradual scoring
   - Provides fairer assessment of "close enough" climates

2. **Temperature-based Fallbacks**
   - Automatically derive categories from numerical data
   - Reduces impact of missing categorical fields

3. **Enhanced Data Validation**
   - Case-insensitive comparisons
   - Robust null/undefined handling

## Performance Considerations

- Pre-calculated seasonal variations stored in database
- Climate categories indexed for fast queries
- Numerical temperature indexes for range queries

## Validation Rules

1. Temperature ranges must be realistic (-50°C to 50°C)
2. Humidity must be 0-100%
3. Sunshine hours must be 0-4,380 (max possible)
4. Rainfall must be non-negative
5. Categorical values must match defined options

## Data Coverage Statistics

- Towns with complete climate data: ~280/341 (82%)
- Towns with temperature data: ~320/341 (94%)
- Towns with humidity data: ~300/341 (88%)
- Towns with sunshine data: ~290/341 (85%)
- Towns with precipitation data: ~310/341 (91%)

## Future Enhancement Opportunities

1. **Microclimate Recognition**
   - Account for local variations within regions
   - Coastal vs inland temperature moderation

2. **Extreme Weather Integration**
   - Hurricane/cyclone frequency
   - Heatwave/cold snap occurrences
   - Drought risk assessment

3. **Climate Change Projections**
   - 10-20 year climate forecasts
   - Sea level rise considerations
   - Temperature trend analysis

4. **Seasonal Detailed Matching**
   - Month-by-month preferences
   - Shoulder season optimization
   - Peak season avoidance options

5. **Air Quality Integration**
   - Combine with air_quality_index field
   - Wildfire smoke considerations
   - Pollution seasonal patterns

---

*Algorithm Version: 2.1*  
*Last Major Update: August 24, 2025 (Gradual scoring system)*  
*Database Fields Verified: August 25, 2025*  
*Climate Data Coverage: 82% complete*