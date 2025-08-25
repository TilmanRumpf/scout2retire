# Region Matching Algorithm (20% of total score)
**Date: August 25, 2025**

## Overview
The region matching algorithm evaluates geographic and location preferences with a sophisticated multi-tier scoring system that prioritizes direct country matches while providing gradual credit for regional proximity.

## Database Fields Referenced

### User Preferences Table
- `countries` (Array): User's preferred countries
- `regions` (Array): User's preferred regions (e.g., "Mediterranean", "EU", "Southeast Asia")
- `geographic_features` (Array): Preferred features (e.g., "Coastal", "Mountains", "Island")
- `vegetation_types` (Array): Preferred vegetation (e.g., "Mediterranean", "Tropical", "Forest")

### Towns Table
- `country` (String): Town's country
- `regions` (Array): Multiple region classifications
- `geographic_features_actual` (Array): Verified geographic features
- `vegetation_type_actual` (String): Actual vegetation type
- `geo_region` (String): Geographic region classification

## Scoring Breakdown (100 points total)

### 1. Country Matching (40 points)
```javascript
// Field references: user_preferences.countries vs towns.country
```

- **Exact country match**: 40 points
  - Direct match between any value in `user_preferences.countries` and `towns.country`
  - Case-insensitive comparison using `.toLowerCase()`
  
- **No country preference specified**: 40 points (full credit)
  - Allows users to be open to any location

### 2. Geographic Features Matching (30 points)
```javascript
// Field references: user_preferences.geographic_features vs towns.geographic_features_actual
```

**Scoring methodology:**
- Calculate overlap percentage between user preferences and town features
- Points = 30 × (matched features / total user preferred features)

**Feature categories (8 total):**
- Coastal
- Desert
- Island
- Mountains
- Plains
- River Valley
- Urban
- Valley

**Special cases:**
- If user has no geographic feature preferences: 30 points (full credit)
- Empty or null `geographic_features_actual`: 0 points for this component
- Case-insensitive matching implemented after August 24 fix

**Partial credit system:**
- Each matched feature contributes proportionally
- Example: User wants ["Coastal", "Mountains"], town has ["Coastal"] = 15 points (50% match)

### 3. Vegetation Type Matching (20 points)
```javascript
// Field references: user_preferences.vegetation_types vs towns.vegetation_type_actual
```

**Direct match scoring:**
- Exact vegetation type match: 20 points
- No match: 0 points (no partial credit currently)

**Vegetation types (20 categories):**
- Alpine
- Arid
- Boreal Forest
- Chaparral
- Deciduous Forest
- Desert
- Grassland
- Mediterranean
- Mixed Forest
- Mountain
- Pine Forest
- Prairie
- Rainforest
- Savanna
- Scrubland
- Steppe
- Subtropical
- Temperate Forest
- Tropical
- Tundra

**Special cases:**
- No vegetation preference: 20 points (full credit)
- Missing `vegetation_type_actual` data: 0 points
- Case-insensitive comparison required

### 4. Regional Groups Matching (10 points)
```javascript
// Field references: user_preferences.regions vs towns.regions
```

**Scoring methodology:**
- Check for any overlap between user's preferred regions and town's regions
- Any match: 10 points
- No match: 0 points

**Regional classifications (43 total):**

**Continental:**
- Africa, Asia, Europe, North America, Oceania, South America

**Sub-regional:**
- Caribbean, Central America, Central Europe
- East Africa, East Asia, Eastern Europe
- Mediterranean, Middle East, North Africa
- Northern Europe, Pacific Islands, Scandinavia
- South Asia, Southeast Asia, Southern Africa
- Southern Europe, Sub-Saharan Africa, West Africa, Western Europe

**Economic/Political:**
- ASEAN, EU, G20, G7, MENA, MERCOSUR
- NAFTA, NATO, OECD, OPEC, Schengen Area

**Other groupings:**
- Balkans, Baltic States, Benelux, British Isles
- Commonwealth, Francophonie, Gulf States
- Iberian Peninsula, Latin America, Levant
- Maghreb, Nordic Countries

## Algorithm Priority Order

1. **Country match** (highest priority - 40% of score)
   - Direct location preference is weighted most heavily
   
2. **Geographic features** (30% of score)
   - Physical environment preferences
   
3. **Vegetation type** (20% of score)
   - Environmental/climate preferences
   
4. **Regional groups** (10% of score)
   - Broader regional affiliations

## Special Cases and Fallbacks

### No Preferences = Perfect Score
- Users with no regional preferences receive 100% score
- Philosophy: "Open to anywhere" should not penalize matches

### Missing Data Handling
```javascript
// From enhancedMatchingAlgorithm.js
if (!town.geographic_features_actual || town.geographic_features_actual.length === 0) {
  geographicScore = 0; // No credit if data missing
}
```

### Case Sensitivity Fix (August 24, 2025)
- All string comparisons now use `.toLowerCase()`
- Prevents "Coastal" ≠ "coastal" mismatches
- Applied to all array comparisons

### Data Quality Warnings
- Algorithm adds warnings when using estimated or missing data
- Warnings displayed in match insights
- Does not affect numerical score

## Integration with Daily Town Selection

The region matching algorithm is also used in the Smart Daily Town feature with a 4-tier geographic relevance system:

### Tier 1: Exact Country Match
- Shows towns from user's selected countries

### Tier 2: Neighboring Countries
- Uses `COUNTRY_NEIGHBORS` mapping in `townUtils.jsx`
- Example: Spain → Portugal, France, Italy, Morocco, Malta

### Tier 3: Same Continent/Region
- Falls back to broader regional groups
- Example: Mediterranean preference → All Mediterranean countries

### Tier 4: Random (Last Resort)
- Only if no geographic matches found
- Prevents showing completely irrelevant towns

## Recent Improvements (August 2025)

1. **Fixed Missing Fields Bug**
   - Added `geographic_features_actual` and `vegetation_type_actual` to SELECT statements
   - Resolved 44% universal scoring issue

2. **Case Sensitivity Fix**
   - All comparisons now case-insensitive
   - Applied throughout region matching

3. **Smart Geographic Relevance**
   - Prevents Dutch users from seeing Asian towns
   - Respects user's geographic preferences in daily recommendations

## Performance Considerations

- Array comparisons optimized using Set operations
- Case conversion cached where possible
- Database indexes on: `country`, `regions` (GIN index for arrays)

## Validation Rules

1. Countries must match exactly (after case normalization)
2. Geographic features must be from the defined 8-category list
3. Vegetation types must be from the defined 20-category list
4. Regional groups validated against 43 defined regions

## Future Enhancement Opportunities

1. **Partial credit for vegetation similarity**
   - Mediterranean ↔ Chaparral (similar climates)
   - Tropical ↔ Subtropical (adjacent categories)

2. **Distance-based scoring**
   - Use latitude/longitude for proximity scoring
   - Graduate points based on distance from preferred locations

3. **Enhanced neighbor country detection**
   - Expand COUNTRY_NEIGHBORS mapping
   - Consider cultural/linguistic similarities

4. **Weighted geographic features**
   - Allow users to prioritize certain features
   - "Must have coastal" vs "Nice to have mountains"

---

*Algorithm Version: 2.1*  
*Last Major Update: August 24, 2025 (Case sensitivity and missing fields fix)*  
*Database Fields Verified: August 25, 2025*