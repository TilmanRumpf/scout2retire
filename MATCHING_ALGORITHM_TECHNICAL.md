# Matching Algorithm Technical Documentation

## Architecture Overview

The Scout2Retire matching system consists of three main components:

### 1. Main Orchestrator (`matchingAlgorithm.js`)
- Entry point for all matching requests
- Handles caching (1-hour SessionStorage)
- Pre-filters towns at database level
- Manages pagination and result limits
- Provides fallback preferences for non-onboarded users

### 2. Enhanced Scoring Engine (`enhancedMatchingAlgorithm.js`)
- Performs detailed scoring across 6 categories
- Implements null-safe comparisons
- Handles array-formatted preferences
- Calculates data completeness bonus
- Returns structured match results

### 3. Helper Functions (`enhancedMatchingHelpers.js`)
- Generates dynamic insights
- Creates contextual warnings
- Provides score explanations
- Currently partially unused (legacy)

## Data Flow

```
User → Signup → Onboarding (7 steps) → Database Storage
                                              ↓
                                     matchingAlgorithm.js
                                              ↓
                                    Pre-filter Query (Supabase)
                                              ↓
                                    enhancedMatchingAlgorithm.js
                                              ↓
                                    Scored & Ranked Results
                                              ↓
                                         User Interface
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  hometown TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Onboarding Responses Table
```sql
CREATE TABLE onboarding_responses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_status JSONB,
  region_preferences JSONB,
  climate_preferences JSONB,
  culture_preferences JSONB,
  hobbies JSONB,
  administration JSONB,
  costs JSONB,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

### Towns Table (Key Fields for Matching)
```sql
CREATE TABLE towns (
  -- Basic Information
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  
  -- Cost & Budget
  cost_index INTEGER,
  typical_monthly_living_cost INTEGER,
  typical_rent_1bed INTEGER,
  healthcare_cost_monthly INTEGER,
  
  -- Scores
  healthcare_score INTEGER,
  safety_score INTEGER,
  
  -- Climate Data
  climate_description TEXT,
  summer_climate_actual TEXT,
  winter_climate_actual TEXT,
  humidity_level_actual TEXT,
  sunshine_level_actual TEXT,
  precipitation_level_actual TEXT,
  avg_temp_summer NUMERIC,
  avg_temp_winter NUMERIC,
  sunshine_hours INTEGER,
  annual_rainfall INTEGER,
  
  -- Culture & Language
  primary_language TEXT,
  english_proficiency_level TEXT,
  expat_community_size TEXT,
  pace_of_life_actual TEXT,
  urban_rural_character TEXT,
  
  -- Activities & Amenities
  activities_available TEXT[],
  interests_supported TEXT[],
  
  -- Administrative & Tax Information
  visa_on_arrival_countries TEXT[],
  retirement_visa_available BOOLEAN,
  
  -- Tax Data (NEW: Comprehensive tax scoring support)
  tax_rates JSONB,                    -- Structured tax data: {"income_tax": 15, "property_tax": 1.2, "sales_tax": 10}
  income_tax_rate_pct NUMERIC,        -- Individual tax rate fields (fallback)
  property_tax_rate_pct NUMERIC,
  sales_tax_rate_pct NUMERIC,
  tax_treaty_us BOOLEAN,              -- US tax treaty availability
  tax_haven_status BOOLEAN,           -- Recognized tax haven status
  foreign_income_taxed BOOLEAN,       -- Whether foreign income is taxed
  
  -- Geographic
  geographic_features_actual TEXT[],
  beaches_nearby BOOLEAN,
  
  -- Images (Required for Display)
  image_url_1 TEXT
);
```

## Key Algorithms

### 1. Pre-filtering Logic
```javascript
// Budget pre-filter (50%-200% of user budget)
if (userPrefs.costs?.total_monthly_budget) {
  const budget = userPrefs.costs.total_monthly_budget;
  query = query
    .gte('cost_index', budget * 0.5)
    .lte('cost_index', budget * 2.0);
}

// Healthcare pre-filter
if (userPrefs.administration?.healthcare_quality?.includes('good')) {
  query = query.gte('healthcare_score', 7);
}

// Safety pre-filter  
if (userPrefs.administration?.safety_importance?.includes('good')) {
  query = query.gte('safety_score', 7);
}

// Image requirement (always applied)
query = query
  .not('image_url_1', 'is', null)
  .not('image_url_1', 'eq', '')
  .not('image_url_1', 'ilike', 'NULL');
```

### 2. Array Overlap Calculation
```javascript
function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  if (!userArray?.length || !townArray?.length) return 0;
  
  const userSet = new Set(userArray.map(item => item.toLowerCase()));
  const townSet = new Set(townArray.map(item => item.toLowerCase()));
  
  let matches = 0;
  for (const item of userSet) {
    if (townSet.has(item)) matches++;
  }
  
  return (matches / userSet.size) * maxScore;
}
```

### 3. Data Completeness Scoring
```javascript
function calculateDataCompleteness(town) {
  const importantFields = [
    'cost_index', 'healthcare_score', 'safety_score',
    'climate_description', 'summer_climate_actual',
    'winter_climate_actual', 'primary_language',
    'english_proficiency_level', 'activities_available',
    // ... 18 total fields
  ];
  
  let completedFields = 0;
  importantFields.forEach(field => {
    const value = town[field];
    if (value !== null && value !== undefined && value !== '' && 
        (!Array.isArray(value) || value.length > 0)) {
      completedFields++;
    }
  });
  
  return (completedFields / importantFields.length) * 5; // 0-5 points
}
```

### 4. Preference Format Conversion
```javascript
// Main algorithm converts user data format
const convertedPrefs = {
  region_preferences: userPrefs.region || userPrefs.region_preferences || {},
  climate_preferences: userPrefs.climate || userPrefs.climate_preferences || {},
  culture_preferences: userPrefs.culture || userPrefs.culture_preferences || {},
  hobbies_preferences: userPrefs.hobbies || userPrefs.hobbies_preferences || {},
  admin_preferences: userPrefs.administration || userPrefs.admin_preferences || {},
  budget_preferences: userPrefs.costs || userPrefs.budget_preferences || {},
  current_status: userPrefs.current_status || {}
};
```

## Scoring Weights

```javascript
// Weights optimized for 55+ retirees: equal emphasis on location preference, 
// budget constraints, and healthcare/safety (60% combined), with climate 
// and culture as secondary factors
const CATEGORY_WEIGHTS = {
  region: 20,      // Geographic match
  climate: 15,     // Climate preferences 
  culture: 15,     // Cultural fit
  hobbies: 10,     // Activities & interests
  admin: 20,       // Healthcare, safety, visa
  budget: 20       // Financial fit
}
```

## Recent Improvements (January 2025)

### 1. Comprehensive Tax Scoring (January 2025)
```javascript
// Replaced basic tax penalties with comprehensive gradual scoring
// - Tax scoring now worth 15 points in budget category (was 10 penalty-only)
// - Gradual scoring for income (0-40%), property (0-4%), sales tax (0-25%)
// - Only scores taxes the user is sensitive to (from onboarding checkboxes)
// - Bonus points for tax treaties, tax haven status, foreign income exemptions
// - Smart data fallback: JSON tax_rates field → individual tax fields → penalties for missing data

// Tax rate thresholds with gradual scoring:
const TAX_THRESHOLDS = {
  income: { excellent: 10, good: 20, fair: 30, poor: 40 },    // 0-10% excellent
  property: { excellent: 1, good: 2, fair: 3, poor: 4 },     // 0-1% excellent  
  sales: { excellent: 8, good: 15, fair: 20, poor: 25 }      // 0-8% excellent
}

// Example impact:
// - User sensitive to income tax, town has 15% rate: 10/15 points (was 0 points!)
// - User sensitive to all taxes, excellent rates + bonuses: 15/15 points
// - Non-tax-sensitive user: neutral 8/15 points regardless of rates

// Integration with budget scoring:
const taxResult = calculateTaxScore(preferences, town, 15)
score += taxResult.score  // Replaces old penalty system
factors.push(...taxResult.factors)  // Detailed tax factor descriptions

// User tax sensitivity from onboarding costs step:
// preferences.income_tax_sensitive   - "State income tax rates are important to me" 
// preferences.property_tax_sensitive - "Property tax rates are important to me"
// preferences.sales_tax_sensitive    - "Sales tax rates are important to me"

// Tax data priority: town.tax_rates JSON → individual fields → missing data penalties
```

### 2. Gradual Healthcare & Safety Scoring (January 2025)
```javascript
// Replaced rigid threshold scoring with intelligent gradual scoring
// - Healthcare and safety now use preference-based tier scoring
// - User wants "good" (9+): 100% at 9.0+, 80% at 8.0+, 60% at 7.0+, etc.
// - User wants "functional" (7+): 100% at 7.0+, 80% at 6.0+, 60% at 5.0+
// - User wants "basic" (5+): 100% at 5.0+, 67% at 4.0+
// - Total impact: Up to 44 points vs 0 points for near-misses (8.5 healthcare)
```

### 2. Gradual Climate Scoring (January 2025)
```javascript
// Replaced all-or-nothing climate matching with intelligent gradual scoring
// - Humidity, sunshine, precipitation now use adjacency-based scoring
// - Perfect match: 100% points, Adjacent: 70% points, Opposite: 0% points
// - Smart fallback logic: sunshine_hours → sunshine_level, annual_rainfall → precipitation_level
// - Climate description inference for missing data
// - Total impact: +30 points for adjacent preferences vs 0 points before
```

### 3. Enhanced Language Matching (January 2025)
```javascript
// Prioritizes actual town language data over hard-coded assumptions
// - Uses town.primary_language when available
// - Detailed English proficiency scoring (excellent/good/moderate/basic/none)
// - Enhanced country mapping for former colonies and multi-language countries
// - Data quality warnings when using estimates
// - Romance language learning bonuses
```

### 4. Seasonal Preference Scoring
```javascript
// Added scoring for user's seasonal preferences
// Options: 'Optional', 'all_seasons', 'summer_focused', 'winter_focused'
// Worth 15 points in climate scoring
// Adjusted other climate scores proportionally to maintain 100 total
```

### 7. Array Handling Fix
```javascript
// Before: Expected single value
const requiredScore = healthcareMap[preferences.healthcare_quality] || 7;

// After: Handles arrays properly
const healthcareArray = preferences.healthcare_quality || [];
const healthcarePref = Array.isArray(healthcareArray) ? healthcareArray[0] : healthcareArray;
const requiredScore = healthcareMap[healthcarePref] || 7;
```

### 8. Null Safety
```javascript
// Before: Could crash on null
if (preferences.summer_climate_preference === town.summer_climate_actual)

// After: Null-safe
if (town.summer_climate_actual && 
    preferences.summer_climate_preference === town.summer_climate_actual)
```

### 9. Temperature-Based Climate Scoring with Seasonal Preferences
```javascript
// Temperature ranges for climate preferences (in Celsius)
const TEMP_RANGES = {
  summer: {
    mild: { min: 15, max: 24 },
    warm: { min: 22, max: 32 },
    hot: { min: 28, max: Infinity }
  },
  winter: {
    cold: { min: -Infinity, max: 5 },
    cool: { min: 3, max: 15 },
    mild: { min: 12, max: Infinity }
  }
}

// Climate scoring points adjusted to include seasonal preferences
// Total: 100 points
const CLIMATE_POINTS = {
  summer: 21,         // Was 25
  winter: 21,         // Was 25
  humidity: 17,       // Was 20
  sunshine: 17,       // Was 20
  precipitation: 9,   // Was 10
  seasonal: 15        // NEW - seasonal preference
}

// Gradual scoring based on distance from range
function calculateTemperatureScore(actualTemp, preferredRange) {
  if (actualTemp >= preferredRange.min && actualTemp <= preferredRange.max) {
    return 100 // Perfect match
  }
  
  let distance = actualTemp < preferredRange.min 
    ? preferredRange.min - actualTemp 
    : actualTemp - preferredRange.max
  
  if (distance <= 2) return 80      // Within 2°C
  if (distance <= 5) return 50      // Within 5°C
  if (distance <= 10) return 20     // Within 10°C
  return 0                           // More than 10°C away
}

// Usage in climate scoring
if (town.avg_temp_summer !== null) {
  // Use numeric temperature data
  const tempScore = calculateTemperatureScore(
    town.avg_temp_summer, 
    TEMP_RANGES.summer[preferences.summer_climate_preference]
  )
  score += Math.round(tempScore * 25 / 100)
} else if (town.summer_climate_actual) {
  // Fall back to string matching
  if (preferences.summer_climate_preference === town.summer_climate_actual) {
    score += 25
  }
} else if (town.climate_description) {
  // Last resort: parse description
  const desc = town.climate_description.toLowerCase()
  if (preferences.summer_climate_preference === 'warm' && desc.includes('warm')) {
    score += 13
  }
}

// Seasonal preference scoring (NEW - January 2025)
if (preferences.seasonal_preference && 
    town.avg_temp_summer !== null && town.avg_temp_winter !== null) {
  
  const seasonPref = preferences.seasonal_preference
  
  if (seasonPref === 'summer_focused') {
    // Prefer warm seasons - reward mild winters
    if (town.avg_temp_winter >= 15) score += 15      // Perfect
    else if (town.avg_temp_winter >= 10) score += 12 // Good
    else if (town.avg_temp_winter >= 5) score += 8   // Okay
    else score += 0                                   // Too cold
    
  } else if (seasonPref === 'winter_focused') {
    // Prefer cool seasons - reward moderate summers
    if (town.avg_temp_summer <= 25) score += 15      // Perfect
    else if (town.avg_temp_summer <= 28) score += 12 // Good
    else if (town.avg_temp_summer <= 32) score += 8  // Okay
    else score += 0                                   // Too hot
    
  } else if (seasonPref === 'all_seasons') {
    // Enjoy all seasons - reward seasonal variation
    const variation = Math.abs(town.avg_temp_summer - town.avg_temp_winter)
    if (variation >= 15) score += 15      // Distinct seasons
    else if (variation >= 10) score += 12 // Moderate variation
    else if (variation >= 5) score += 8   // Some variation
    else score += 0                        // Too stable
  }
  // Note: 'Optional' = no seasonal scoring (0 points)
}
```

### 2. Gradual Healthcare & Safety Scoring Implementation
```javascript
// Helper function for preference-based tier scoring
function calculateGradualAdminScore(actualScore, userPref, maxPoints) {
  if (!actualScore || !userPref) return { score: 0, description: null }
  
  // Define scoring tiers based on user preference level
  if (userPref === 'good') {
    // User wants high quality (ideal 9+)
    if (actualScore >= 9.0) {
      return { score: maxPoints, description: 'exceeds requirements' }
    } else if (actualScore >= 8.0) {
      return { score: Math.round(maxPoints * 0.8), description: 'very good quality' }
    } else if (actualScore >= 7.0) {
      return { score: Math.round(maxPoints * 0.6), description: 'acceptable quality' }
    } else if (actualScore >= 6.0) {
      return { score: Math.round(maxPoints * 0.4), description: 'below ideal but adequate' }
    } else if (actualScore >= 5.0) {
      return { score: Math.round(maxPoints * 0.2), description: 'concerns about quality' }
    } else {
      return { score: 0, description: 'inadequate quality' }
    }
  } else if (userPref === 'functional') {
    // User wants adequate quality (ideal 7+)
    if (actualScore >= 7.0) {
      return { score: maxPoints, description: 'meets requirements' }
    } else if (actualScore >= 6.0) {
      return { score: Math.round(maxPoints * 0.8), description: 'nearly meets requirements' }
    } else if (actualScore >= 5.0) {
      return { score: Math.round(maxPoints * 0.6), description: 'basic but functional' }
    } else {
      return { score: 0, description: 'below functional level' }
    }
  } else if (userPref === 'basic') {
    // User wants minimal quality (ideal 5+)
    if (actualScore >= 5.0) {
      return { score: maxPoints, description: 'meets basic requirements' }
    } else if (actualScore >= 4.0) {
      return { score: Math.round(maxPoints * 0.67), description: 'marginal but acceptable' }
    } else {
      return { score: 0, description: 'below minimum standards' }
    }
  }
  
  return { score: Math.round(maxPoints * 0.5), description: 'standard quality' }
}

// Usage in administration scoring
const healthcareResult = calculateGradualAdminScore(
  town.healthcare_score, 
  healthcarePref, 
  30  // Healthcare gets 30 points
)

const safetyResult = calculateGradualAdminScore(
  town.safety_score, 
  safetyPref, 
  25  // Safety gets 25 points
)

// Factor generation with detailed descriptions
factors.push({ 
  factor: `Healthcare ${healthcareResult.description} (score: ${town.healthcare_score})`, 
  score: healthcareResult.score 
})

// Before vs After examples:
// User wants "good" healthcare, town has 8.5:
//   BEFORE: 8.5 < 9.0 threshold = 0 points
//   AFTER:  8.5 in 8.0-8.9 tier = 24/30 points (80%)

// User wants "functional" safety, town has 6.8:
//   BEFORE: 6.8 < 7.0 threshold = 0 points  
//   AFTER:  6.8 in 6.0-6.9 tier = 20/25 points (80%)
```

### 5. Gradual Climate Scoring Implementation
```javascript
// Helper function for adjacency-based scoring
function calculateGradualClimateScore(userPref, townActual, maxPoints, adjacencyMap) {
  if (!userPref || !townActual) return { score: 0, description: null }
  
  // Exact match
  if (userPref === townActual) {
    return { score: maxPoints, description: 'Perfect' }
  }
  
  // Check if preferences are adjacent
  const adjacent = adjacencyMap[userPref]?.includes(townActual)
  if (adjacent) {
    return { 
      score: Math.round(maxPoints * 0.7), // 70% of max points
      description: 'Good compatibility' 
    }
  }
  
  // Opposite or no relationship
  return { score: 0, description: 'Preference mismatch' }
}

// Adjacency mappings for climate factors
const humidityAdjacency = {
  'dry': ['balanced'],
  'balanced': ['dry', 'humid'], 
  'humid': ['balanced']
}

const sunshineAdjacency = {
  'often_sunny': ['balanced'],
  'mostly_sunny': ['balanced'],
  'abundant': ['balanced'],
  'balanced': ['often_sunny', 'mostly_sunny', 'abundant', 'less_sunny'],
  'less_sunny': ['balanced']
}

const precipitationAdjacency = {
  'mostly_dry': ['balanced'],
  'dry': ['balanced'],
  'balanced': ['mostly_dry', 'dry', 'often_rainy', 'wet'],
  'often_rainy': ['balanced'],
  'wet': ['balanced']
}

// Usage in climate scoring
const humidityResult = calculateGradualClimateScore(
  preferences.humidity_level, 
  town.humidity_level_actual, 
  17, 
  humidityAdjacency
)

// Smart fallback logic for missing data
if (!town.sunshine_level_actual && town.sunshine_hours) {
  let inferredSunshine = null
  if (town.sunshine_hours > 2800) inferredSunshine = 'often_sunny'
  else if (town.sunshine_hours > 2200) inferredSunshine = 'balanced'  
  else inferredSunshine = 'less_sunny'
  
  // Use inferred data with reduced points
  const result = calculateGradualClimateScore(
    preferences.sunshine, inferredSunshine, 13, sunshineAdjacency
  )
}

// Climate description inference (last resort)
if (town.climate_description) {
  const desc = town.climate_description.toLowerCase()
  if (desc.includes('arid') || desc.includes('desert')) {
    inferredHumidity = 'dry'
    inferredPrecipitation = 'mostly_dry'
  }
  // Further reduced points for description-based inference
}
```

### 6. Enhanced Language Matching Logic
```javascript
// Priority-based language detection
let primaryLanguage = town.primary_language  // First: Use actual data
let usingEstimatedLanguage = false

// Only use fallback if primary_language missing AND data completeness < 60%
if (!primaryLanguage && (!town.data_completeness_score || town.data_completeness_score < 60)) {
  const countryLanguages = {
    'Portugal': 'Portuguese', 'Spain': 'Spanish', 'France': 'French',
    // Enhanced mapping for special cases
    'Malta': 'English', 'Singapore': 'English', 'Ireland': 'English',
    'South Africa': 'English', 'Philippines': 'English',
    'Switzerland': 'German', 'Belgium': 'Dutch', 'Luxembourg': 'French'
  }
  primaryLanguage = countryLanguages[town.country] || 'Local'
  usingEstimatedLanguage = true
}

// English proficiency scoring with new levels
const proficiencyScores = {
  'excellent': 22,    // Near-native level
  'good': 18,         // Conversational level
  'moderate': 12,     // Basic communication
  'basic': 8,         // Limited communication
  'none': 0,          // No English
  // Legacy values for backward compatibility
  'native': 25, 'very_high': 22, 'high': 18
}

// Romance language learning bonus
const romanceLanguages = ['spanish', 'portuguese', 'italian', 'french', 'catalan', 'romanian']
if (romanceLanguages.includes(primaryLanguage.toLowerCase())) {
  learnScore += 5  // Easier for English speakers
}

// Data quality penalty
if (usingEstimatedLanguage && !town.english_proficiency_level) {
  factors.push({ factor: 'Language data estimated from country', score: -2 })
}
```

### 10. Data Completeness Bonus
```javascript
// Add 0-5 bonus points based on data quality
const dataBonus = calculateDataCompleteness(town);
totalScore += dataBonus;

// Add to factors for transparency
if (dataBonus >= 3) {
  allFactors.push({ factor: 'Comprehensive data available', score: dataBonus });
} else if (dataBonus <= 1) {
  allFactors.push({ factor: 'Limited data available', score: -2 });
}
```

## Performance Optimizations

### 1. Database-Level Filtering
- Reduces data transfer by 50-80%
- Only fetches towns that could potentially match
- Uses Supabase indexes efficiently

### 2. Caching Strategy
- 1-hour SessionStorage cache
- Keyed by userId + options
- Clears on preference changes

### 3. Batch Processing
- All towns scored in parallel using Promise.all()
- No sequential database queries
- Single query fetches all needed towns

## API Response Format

```javascript
{
  success: true,
  towns: [
    {
      // All original town fields plus:
      matchScore: 86,
      matchReasons: [
        "Coastal preference matched",
        "Perfect summer climate match",
        "English widely spoken"
      ],
      categoryScores: {
        region: 85,
        climate: 90,
        culture: 70,
        hobbies: 80,
        admin: 85,
        budget: 95
      },
      warnings: ["High tax rate of 35%"],
      insights: [
        {
          category: "culture",
          type: "positive",
          text: "English is the primary language"
        }
      ],
      highlights: ["Tax-free retirement income"],
      confidence: "Very High",
      valueRating: 5,
      data_completeness: 4
    }
  ],
  isPersonalized: true,
  userPreferences: { /* full preferences used */ },
  metadata: {
    totalAvailable: 71,
    preFiltered: true
  }
}
```

## Error Handling

The system gracefully handles:
- Missing user preferences (uses defaults)
- Null town data (uses fallbacks)
- Database errors (returns error object)
- Invalid preference formats (array/string conversion)
- Missing required fields (sensible defaults)

## Testing Approach

### Unit Tests Needed
1. Array preference handling
2. Null safety checks
3. Fallback logic
4. Score calculations
5. Data completeness

### Integration Tests Needed
1. Full matching flow
2. Database query optimization
3. Cache behavior
4. Error scenarios
5. Edge cases (no matches, all matches)

## Future Enhancements

### 1. Machine Learning Integration
- Learn from user feedback
- Adjust weights dynamically
- Predict preferences

### 2. Advanced Filtering
- Multi-user matching (couples)
- Seasonal preferences
- Accessibility requirements

### 3. Performance Improvements
- Redis caching layer
- Elasticsearch integration
- Pre-computed match scores

### 4. Data Enrichment
- Real-time cost updates
- Weather API integration
- Community feedback scores

---

*Last updated: January 2025*