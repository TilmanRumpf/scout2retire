# Hobbies Matching Algorithm (10% of total score)
**Date: August 25, 2025**

## Overview
The hobbies matching algorithm evaluates activity and interest compatibility using a normalized database of 142 distinct activities, distinguishing between universally available activities and location-specific opportunities.

## Database Fields Referenced

### User Preferences Table
- `activities` (Array): Preferred activities (e.g., ["cycling", "water_sports", "gardening", "hiking"])
- `interests` (Array): General interests (e.g., ["theater", "wine", "volunteering", "photography"])
- `lifestyle_importance.outdoor_activities` (Number): Importance of outdoor activities (1-5)
- `lifestyle_importance.wellness` (Number): Importance of wellness activities (1-5)
- `lifestyle_importance.shopping` (Number): Importance of shopping (1-5)

### Towns Table
- `activities_available` (Array): Normalized list of available activities
- `golf_courses_count` (Number): Number of golf courses (0-50)
- `tennis_courts_count` (Number): Number of tennis courts (0-100)
- `hiking_trails_km` (Number): Kilometers of hiking trails (0-1000)
- `marinas_count` (Number): Number of marinas (0-20)
- `ski_resorts_within_100km` (Number): Nearby ski resorts (0-15)
- `dog_parks_count` (Number): Dog parks available (0-50)
- `swimming_facilities` (Array): Types of swimming facilities
- `coworking_spaces_count` (Number): Coworking spaces (0-100)
- `farmers_markets` (Boolean): Farmers markets available
- `beaches_nearby` (Boolean): Beach access available
- `water_bodies` (Array): Nearby water features
- `outdoor_activities_rating` (Number): Overall outdoor rating (1-10)
- `outdoor_rating` (Number): General outdoor score (1-10)
- `wellness_rating` (Number): Wellness facilities rating (1-10)
- `shopping_rating` (Number): Shopping quality rating (1-10)

## Scoring Breakdown (100 points total)

### Primary Scoring Method: Activity Matching (100 points)
```javascript
// Field references: user_preferences.activities + interests vs towns.activities_available
```

**Calculation Method:**
```javascript
const userActivities = [...(preferences.activities || []), ...(preferences.interests || [])];
const townActivities = town.activities_available || [];

// Calculate percentage match
const matchCount = userActivities.filter(activity => 
  townActivities.includes(activity)
).length;

const matchPercentage = userActivities.length > 0 
  ? (matchCount / userActivities.length) * 100
  : 100; // No preferences = perfect score

return Math.round(matchPercentage);
```

## Activity Categories and Mappings

### Universal Activities (Always Available)
These activities are assumed available everywhere and automatically added:
```javascript
const universalActivities = [
  'walking', 'reading', 'cooking', 'photography', 'writing',
  'meditation', 'yoga', 'podcasts', 'online_learning', 'crafts',
  'board_games', 'card_games', 'gardening', 'bird_watching'
];
```

### Location-Specific Activities

#### Water Activities
**Database fields:** `beaches_nearby`, `water_bodies`, `marinas_count`
```javascript
// Activities requiring water access
const waterActivities = [
  'swimming', 'surfing', 'sailing', 'kayaking', 'paddleboarding',
  'fishing', 'scuba_diving', 'snorkeling', 'water_skiing', 'boating',
  'jet_skiing', 'windsurfing', 'kitesurfing'
];

// Added if beaches_nearby === true OR marinas_count > 0
```

#### Mountain/Outdoor Activities  
**Database fields:** `hiking_trails_km`, `elevation_meters`, `ski_resorts_within_100km`
```javascript
const mountainActivities = [
  'hiking', 'mountain_biking', 'rock_climbing', 'skiing',
  'snowboarding', 'mountaineering', 'trail_running'
];

// Added based on:
// - hiking: hiking_trails_km > 0
// - skiing/snowboarding: ski_resorts_within_100km > 0
// - climbing: elevation_meters > 500 OR geographic_features includes "Mountains"
```

#### Sports Facilities
**Database fields:** `golf_courses_count`, `tennis_courts_count`, `swimming_facilities`
```javascript
const facilityActivities = {
  'golf': golf_courses_count > 0,
  'tennis': tennis_courts_count > 0,
  'swimming': swimming_facilities?.length > 0
};
```

#### Cultural Activities
**Database fields:** `museums_rating`, `cultural_events_rating`, `cultural_events_frequency`
```javascript
const culturalActivities = [
  'museums', 'art_galleries', 'theater', 'concerts',
  'festivals', 'opera', 'ballet', 'cinema'
];

// Added based on:
// - museums/galleries: museums_rating > 3
// - theater/concerts: cultural_events_rating > 5
// - festivals: cultural_events_frequency !== "Rare"
```

#### Social/Community Activities
**Database fields:** `farmers_markets`, `coworking_spaces_count`, `expat_community_size`
```javascript
const communityActivities = {
  'farmers_markets': farmers_markets === true,
  'networking': coworking_spaces_count > 0,
  'expat_groups': expat_community_size !== 'none',
  'volunteering': true // Always available
};
```

## Complete Activity List (142 Total)

### Outdoor & Adventure (47)
- Hiking, camping, cycling, mountain biking, rock climbing
- Trail running, backpacking, wildlife watching, bird watching
- Geocaching, orienteering, zip-lining, bungee jumping
- Parasailing, hang gliding, hot air ballooning, skydiving
- Caving, spelunking, sandboarding, dune bashing
- Safari, whale watching, northern lights viewing

### Water Sports (23)
- Swimming, surfing, sailing, kayaking, paddleboarding
- Fishing, fly fishing, deep sea fishing, spearfishing
- Scuba diving, snorkeling, freediving, water skiing
- Jet skiing, windsurfing, kitesurfing, wakeboarding
- Rowing, dragon boat racing, water polo, aqua aerobics

### Winter Sports (12)
- Skiing, snowboarding, cross-country skiing, snowshoeing
- Ice skating, ice hockey, curling, sledding
- Snowmobiling, ice climbing, winter hiking, ice fishing

### Traditional Sports (18)
- Golf, tennis, basketball, soccer, volleyball
- Baseball, softball, cricket, rugby, football
- Badminton, squash, racquetball, table tennis
- Bowling, bocce ball, croquet, lawn bowling

### Fitness & Wellness (15)
- Yoga, pilates, tai chi, qigong, meditation
- Gym workouts, crossfit, martial arts, boxing
- Dancing, zumba, aerobics, spinning, barre

### Cultural & Arts (14)
- Museums, art galleries, theater, concerts, opera
- Ballet, cinema, photography, painting, sculpture
- Poetry, creative writing, book clubs, lectures

### Social & Community (13)
- Volunteering, community service, farmers markets
- Wine tasting, cooking classes, language exchange
- Expat meetups, networking events, social clubs
- Board games, card games, trivia nights

## Special Scoring Considerations

### Activity Importance Weighting
When user specifies importance levels:
```javascript
// Outdoor activities bonus
if (preferences.lifestyle_importance?.outdoor_activities >= 4) {
  if (town.outdoor_activities_rating >= 7) {
    bonusPoints += 10;
  }
}

// Wellness facilities bonus
if (preferences.lifestyle_importance?.wellness >= 4) {
  if (town.wellness_rating >= 7) {
    bonusPoints += 5;
  }
}
```

### Data Quality Enhancements

#### Activity Inference System
```javascript
// Infer activities from geographic features
if (town.geographic_features_actual?.includes('Coastal')) {
  add(['beach_activities', 'swimming', 'surfing']);
}

if (town.geographic_features_actual?.includes('Mountains')) {
  add(['hiking', 'mountain_biking', 'skiing']);
}

if (town.geographic_features_actual?.includes('River Valley')) {
  add(['fishing', 'kayaking', 'riverside_cycling']);
}
```

#### Climate-Based Availability
```javascript
// Seasonal activity adjustments
if (town.winter_climate_actual === 'cold') {
  add(['winter_sports', 'ice_skating']);
  flag(['beach_activities'], 'seasonal_only');
}

if (town.summer_climate_actual === 'hot') {
  add(['swimming', 'water_sports']);
  flag(['hiking'], 'early_morning_only');
}
```

## Algorithm Priority Order

1. **Direct activity matches** (Primary scoring)
   - Exact matches between user preferences and town offerings
   
2. **Category matches** (Secondary consideration)
   - Water sports enthusiast → coastal towns
   - Mountain activities → elevated regions
   
3. **Infrastructure availability** (Supporting data)
   - Specific facility counts validate activity availability
   
4. **Universal activities** (Baseline)
   - Ensures minimum score for all towns

## Integration with Other Systems

### Geographic Correlation
- Coastal features → Water activities
- Mountain features → Hiking/skiing
- Urban areas → Cultural activities
- Rural areas → Nature activities

### Climate Impact
- Hot climates → Year-round water sports
- Cold climates → Winter sports availability
- Mild climates → Year-round outdoor activities

### Cost Considerations
- Golf → Higher cost activities
- Hiking → Low cost activities
- Cultural events → Variable costs

## Recent Improvements (August 2025)

1. **Activity Normalization**
   - Standardized 142 activities across all towns
   - Consistent naming conventions

2. **Universal Activity Recognition**
   - No longer penalizes towns for common activities
   - Fairer scoring for rural locations

3. **Multi-Source Integration**
   - Combines specific counts with general ratings
   - Infers activities from multiple data points

## Performance Considerations

- Activities stored as PostgreSQL arrays with GIN indexes
- Efficient array intersection operations
- Pre-calculated activity categories

## Validation Rules

1. All activities must be from the normalized list
2. Activity counts must be non-negative integers
3. Ratings must be 1-10 scale
4. Boolean fields must be true/false
5. Arrays must not contain duplicates

## Data Coverage Statistics

- Towns with activities_available: ~250/341 (73%)
- Towns with specific facility counts: ~290/341 (85%)
- Towns with outdoor ratings: ~300/341 (88%)
- Towns with complete hobby data: ~230/341 (67%)

## Future Enhancement Opportunities

1. **Seasonal Activity Scoring**
   - Adjust availability based on climate
   - Summer vs winter activity profiles

2. **Activity Quality Ratings**
   - Not just availability but quality
   - World-class golf vs local course

3. **Activity Cost Integration**
   - Budget-conscious activity matching
   - Free vs paid activity balance

4. **Age-Appropriate Modifications**
   - Adjust intensity levels for 55+
   - Accessible versions of activities

5. **Social Activity Matching**
   - Group vs solo activity preferences
   - Club/organization availability

6. **Digital Hobby Support**
   - Gaming communities
   - Online hobby groups
   - Streaming/content creation

7. **Specialized Interest Groups**
   - Wine clubs for oenophiles
   - Book clubs for readers
   - Garden clubs for horticulturists

---

*Algorithm Version: 2.1*  
*Last Major Update: August 24, 2025 (Activity normalization)*  
*Database Fields Verified: August 25, 2025*  
*Activity Data Coverage: 67% complete*  
*Total Normalized Activities: 142*