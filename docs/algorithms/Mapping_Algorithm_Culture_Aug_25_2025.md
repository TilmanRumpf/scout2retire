# Culture Matching Algorithm (15% of total score)
**Date: August 25, 2025**

## Overview
The culture matching algorithm evaluates social, linguistic, and lifestyle compatibility using a comprehensive 7-component scoring system that prioritizes language accessibility while balancing community integration and cultural amenities.

## Database Fields Referenced

### User Preferences Table
- `language_comfort.preferences` (Array): Language comfort levels ["english_only", "willing_to_learn", "already_multilingual"]
- `language_comfort.already_speak` (Array): Languages user already speaks
- `expat_community_preference` (Array): Preferred expat community size ["large", "medium", "small", "none"]
- `lifestyle_preferences.pace_of_life` (Array): Pace preference ["fast", "moderate", "slow", "relaxed"]
- `lifestyle_preferences.urban_rural` (Array): Setting preference ["urban", "suburban", "rural"]
- `lifestyle_preferences.traditional_progressive` (String): Cultural lean preference
- `cultural_importance.dining_nightlife` (Number): Importance rating 1-5
- `cultural_importance.museums` (Number): Importance rating 1-5
- `cultural_importance.cultural_events` (Number): Importance rating 1-5
- `lifestyle_importance.cultural_events` (Number): Duplicate/backup rating 1-5

### Towns Table
- `primary_language` (String): Main language spoken
- `languages_spoken` (Array): All languages commonly spoken
- `secondary_languages` (Array): Additional languages
- `english_proficiency` (String): Overall English proficiency level
- `english_proficiency_level` (String): Categorical English level
- `english_speaking_doctors` (Boolean): Medical English availability
- `expat_community_size` (String): Size of expat community
- `expat_population` (String): Expat population level
- `pace_of_life` (String): Actual pace of life
- `pace_of_life_actual` (String): Verified pace of life
- `urban_rural_character` (String): Urban/suburban/rural classification
- `traditional_progressive_lean` (String): Cultural lean
- `social_atmosphere` (String): Social atmosphere descriptor
- `dining_nightlife_level` (Number): Dining/nightlife availability 0-10
- `nightlife_rating` (Number): Nightlife quality 1-10
- `restaurants_rating` (Number): Restaurant quality 1-10
- `museums_level` (Number): Museum availability 0-10
- `museums_rating` (Number): Museum quality 1-10
- `cultural_events_level` (Number): Cultural event frequency 0-10
- `cultural_events_rating` (Number): Cultural event quality 1-10
- `cultural_events_frequency` (String): How often events occur
- `cultural_rating` (Number): Overall cultural score 1-10

## Scoring Breakdown (100 points total)

### 1. Language Compatibility (25 points)
```javascript
// Field references: user_preferences.language_comfort vs towns.english_proficiency, primary_language, languages_spoken
```

**English Only Preference Scoring:**
- **Primary language is English**: 25 points
  - Check: `towns.primary_language === "English"`
- **Excellent English proficiency**: 22 points
  - Check: `towns.english_proficiency === "Excellent"`
- **Good English proficiency**: 18 points
  - Check: `towns.english_proficiency === "Good"`
- **Moderate English proficiency**: 12 points
  - Check: `towns.english_proficiency === "Moderate"`
- **Basic English proficiency**: 8 points
  - Check: `towns.english_proficiency === "Basic"`
- **Estimated English availability**: 8 points
  - Fallback when data missing

**User Speaks Local Language:**
```javascript
// Check if any user language matches town languages
if (userLanguages.includes(town.primary_language) || 
    userLanguages.some(lang => town.languages_spoken?.includes(lang))) {
  languageScore = 25; // Full score
}
```

**Willing to Learn Scoring:**
- **Base score**: 15 points
- **Romance language bonus**: +5 points
  - Languages: Spanish, Portuguese, Italian, French, Catalan, Romanian
  - Rationale: Easier for English speakers

**Special Language Considerations:**
- Medical English availability (`english_speaking_doctors`) adds confidence flag
- Multiple language support increases accessibility score
- Warning added when using estimated data

### 2. Expat Community Match (20 points)
```javascript
// Field references: user_preferences.expat_community_preference vs towns.expat_community_size
```

**Direct Matching:**
- **Exact size match**: 20 points
- **No match**: 0 points (currently binary)

**Size Categories:**
- **Large**: Significant expat presence (>10% population)
- **Medium**: Notable expat community (5-10%)
- **Small**: Some expats present (<5%)
- **None**: Minimal to no expat presence

**Data Quality:**
- Primary field: `expat_community_size`
- Backup field: `expat_population`
- Missing data: No score (0 points)

### 3. Pace of Life Match (20 points)
```javascript
// Field references: user_preferences.lifestyle_preferences.pace_of_life vs towns.pace_of_life_actual
```

**Direct Matching:**
- **Exact pace match**: 20 points
- **No match**: 0 points

**Pace Categories:**
- **Fast**: Urban, business-oriented, high energy
- **Moderate**: Balanced, suburban typical
- **Slow/Relaxed**: Rural, laid-back, retirement-friendly

**Data Hierarchy:**
1. Use `pace_of_life_actual` if available (verified data)
2. Fall back to `pace_of_life` if actual missing
3. Estimate from `urban_rural_character` if both missing

### 4. Urban/Rural Match (15 points)
```javascript
// Field references: user_preferences.lifestyle_preferences.urban_rural vs towns.urban_rural_character
```

**Direct Matching:**
- **Exact character match**: 15 points
- **Array includes match**: 15 points (user can select multiple)
- **No match**: 0 points

**Character Categories:**
- **Urban**: City center, high density, full amenities
- **Suburban**: Residential, moderate density, good amenities
- **Rural**: Countryside, low density, limited amenities

**Population Correlation:**
- Urban typically: >100,000 population
- Suburban typically: 20,000-100,000
- Rural typically: <20,000

### 5. Dining & Nightlife Match (7 points)
```javascript
// Field references: user_preferences.cultural_importance.dining_nightlife vs towns.dining_nightlife_level
```

**Scoring Logic:**
```javascript
const userImportance = preferences.cultural_importance?.dining_nightlife || 3;
const townLevel = town.dining_nightlife_level || town.nightlife_rating || 5;
const normalizedTownLevel = (townLevel / 10) * 5; // Convert to 1-5 scale

if (Math.abs(userImportance - normalizedTownLevel) <= 1) {
  score = 7; // Within 1 point = match
} else {
  score = Math.max(0, 7 - Math.abs(userImportance - normalizedTownLevel));
}
```

**Data Sources (priority order):**
1. `dining_nightlife_level` (0-10 scale)
2. `nightlife_rating` (1-10 scale)
3. `restaurants_rating` (1-10 scale)

### 6. Museums Match (7 points)
```javascript
// Field references: user_preferences.cultural_importance.museums vs towns.museums_level
```

**Scoring Logic:**
```javascript
const userImportance = preferences.cultural_importance?.museums || 3;
const townLevel = town.museums_level || town.museums_rating || 5;
const normalizedTownLevel = (townLevel / 10) * 5; // Convert to 1-5 scale

if (Math.abs(userImportance - normalizedTownLevel) <= 1) {
  score = 7; // Within 1 point = match
} else {
  score = Math.max(0, 7 - Math.abs(userImportance - normalizedTownLevel));
}
```

**Museum Availability Indicators:**
- Level 8-10: World-class museums
- Level 5-7: Good regional museums
- Level 2-4: Local museums/galleries
- Level 0-1: Minimal museum presence

### 7. Cultural Events Match (6 points)
```javascript
// Field references: user_preferences.cultural_importance.cultural_events vs towns.cultural_events_level
```

**Scoring Logic:**
```javascript
const userImportance = preferences.cultural_importance?.cultural_events || 
                       preferences.lifestyle_importance?.cultural_events || 3;
const townLevel = town.cultural_events_level || town.cultural_events_rating || 5;
const normalizedTownLevel = (townLevel / 10) * 5; // Convert to 1-5 scale

if (Math.abs(userImportance - normalizedTownLevel) <= 1) {
  score = 6; // Within 1 point = match
} else {
  score = Math.max(0, 6 - Math.abs(userImportance - normalizedTownLevel));
}
```

**Event Frequency Mapping:**
- `cultural_events_frequency === "Daily"`: Level 9-10
- `cultural_events_frequency === "Weekly"`: Level 7-8
- `cultural_events_frequency === "Monthly"`: Level 5-6
- `cultural_events_frequency === "Seasonal"`: Level 3-4
- `cultural_events_frequency === "Rare"`: Level 1-2

## Special Cases and Fallbacks

### No Preferences = Perfect Score
- Users without cultural preferences receive 100% score
- Philosophy: "Culturally flexible" retirees shouldn't be penalized

### Language Data Estimation
When primary language data missing:
```javascript
// Country-based language estimation
const countryLanguages = {
  'Spain': 'Spanish',
  'Portugal': 'Portuguese',
  'France': 'French',
  'Germany': 'German',
  'Italy': 'Italian',
  'Netherlands': 'Dutch',
  // ... etc
};
```

### Progressive/Traditional Matching
Currently not scored but tracked for future use:
- Field exists: `traditional_progressive_lean`
- User preference: `lifestyle_preferences.traditional_progressive`
- Reserved for future cultural compatibility scoring

### Social Atmosphere Integration
`social_atmosphere` field provides qualitative insights:
- "Friendly and welcoming"
- "Reserved but polite"
- "Warm and social"
- "International and diverse"

## Algorithm Priority Order

1. **Language compatibility** (25% - highest)
   - Critical for daily functioning
   
2. **Expat community** (20%)
   - Social support network importance
   
3. **Pace of life** (20%)
   - Lifestyle alignment
   
4. **Urban/rural setting** (15%)
   - Environmental preference
   
5. **Cultural amenities** (20% combined)
   - Quality of life enhancements

## Integration with Other Systems

### Healthcare Language Support
- Cross-references `english_speaking_doctors`
- Adds medical communication confidence score
- Critical for retirees with health needs

### Social Integration Indicators
- Combines with `lgbtq_friendly_rating`
- References `senior_friendly_rating`
- Considers `retirement_community_presence`

### Cost Correlations
- Urban areas typically higher cost
- Cultural amenities correlate with prices
- Noted in affordability insights

## Recent Improvements (August 2025)

1. **Enhanced Language Scoring**
   - Romance language bonus for learners
   - Multi-language support recognition

2. **Cultural Amenity Normalization**
   - Consistent 1-5 scale conversion
   - Gradual scoring within 1-point range

3. **Data Quality Warnings**
   - Explicit warnings for estimated data
   - Transparency in scoring methodology

## Performance Considerations

- Language fields indexed for exact matches
- Categorical fields use efficient enum types
- Numerical ratings have range indexes

## Validation Rules

1. Language proficiency must be: Excellent/Good/Moderate/Basic
2. Community size must be: large/medium/small/none
3. Pace must be: fast/moderate/slow/relaxed
4. Urban/rural must be: urban/suburban/rural
5. All ratings must be within defined ranges (0-10 or 1-10)

## Data Coverage Statistics

- Towns with language data: ~310/341 (91%)
- Towns with expat community data: ~280/341 (82%)
- Towns with pace of life data: ~320/341 (94%)
- Towns with cultural ratings: ~290/341 (85%)
- Complete culture data: ~250/341 (73%)

## Future Enhancement Opportunities

1. **Gradual Expat Community Scoring**
   - Partial credit for adjacent sizes
   - Large→Medium: 15 points
   - Medium→Small: 10 points

2. **Traditional/Progressive Scoring**
   - Activate cultural lean matching
   - Weight based on user importance

3. **Language Learning Difficulty**
   - Adjust scores based on linguistic distance
   - Consider script differences (Latin/Cyrillic/Arabic)

4. **Cultural Distance Metrics**
   - Hofstede dimensions integration
   - Power distance, individualism scores

5. **Seasonal Cultural Variations**
   - Summer festival seasons
   - Winter cultural activities
   - Tourist season impacts

6. **Digital Nomad Culture**
   - Coworking space integration
   - Tech community presence
   - International networking opportunities

---

*Algorithm Version: 2.1*  
*Last Major Update: August 24, 2025 (Language scoring enhancement)*  
*Database Fields Verified: August 25, 2025*  
*Culture Data Coverage: 73% complete*