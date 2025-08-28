# Hobbies Algorithm (10% weight)
**Updated: August 27, 2025**

## Quick Reference
Simple percentage match of user activities vs town offerings
```javascript
score = (matched_activities / total_user_activities) * 100
```

## Universal Activities (Always Available)
These 14 activities are available everywhere:
- walking, reading, cooking, photography, writing
- meditation, yoga, podcasts, online_learning, crafts
- board_games, card_games, gardening, bird_watching

## Location-Specific Activities

### Water Activities
**Required:** `beaches_nearby === true` OR `marinas_count > 0`
- swimming, surfing, sailing, kayaking, paddleboarding
- fishing, scuba_diving, snorkeling, water_skiing, boating
- jet_skiing, windsurfing, kitesurfing

### Mountain Activities
**Required:** `hiking_trails_km > 0` OR `elevation_meters > 500`
- hiking, mountain_biking, rock_climbing, trail_running
- skiing/snowboarding (needs `ski_resorts_within_100km > 0`)

### Sports Facilities
| Activity | Required Field |
|----------|----------------|
| Golf | `golf_courses_count > 0` |
| Tennis | `tennis_courts_count > 0` |
| Swimming (pools) | `swimming_facilities` includes "pool" |
| Dog walking | `dog_parks_count > 0` |

### Cultural Activities
| Activity | Required Field |
|----------|----------------|
| Museums | `museums_level > 0` |
| Theater | `cultural_events_level > 0` |
| Dining out | `restaurants_rating > 0` |
| Nightlife | `nightlife_rating > 0` |
| Wine tasting | Region includes wine areas |
| Farmers markets | `farmers_markets === true` |

### Urban Activities
**Required:** `urban_rural_character === "urban"`
- Shopping, coworking, business networking
- Public transport exploring, street photography

## Activity Database (142 Total)

### Categories:
- **Outdoor** (35): hiking, cycling, running, swimming, etc.
- **Sports** (28): tennis, golf, martial arts, etc.
- **Cultural** (22): museums, theater, concerts, etc.
- **Social** (18): volunteering, clubs, dancing, etc.
- **Wellness** (15): yoga, spa, meditation, etc.
- **Creative** (14): painting, music, writing, etc.
- **Educational** (10): languages, history, courses, etc.

## Scoring Examples

```javascript
// User wants: ["hiking", "swimming", "reading", "golf"]
// Town has: ["hiking", "reading"] // No beach or golf course

matched = 2 (hiking, reading)
total = 4
score = (2/4) * 100 = 50 points
```

```javascript
// User wants: ["photography", "cooking", "gardening"]
// These are all universal activities

matched = 3
total = 3
score = (3/3) * 100 = 100 points
```

## Data Fields Used

### User Preferences
- `activities` - Primary activity list
- `interests` - General interests
- `lifestyle_importance.outdoor_activities` (1-5)
- `lifestyle_importance.wellness` (1-5)

### Town Data
- `activities_available` - Normalized activity list
- `golf_courses_count`, `tennis_courts_count`
- `hiking_trails_km`, `marinas_count`
- `beaches_nearby`, `water_bodies`
- `ski_resorts_within_100km`
- `museums_level`, `cultural_events_level`
- `farmers_markets`, `coworking_spaces_count`

## Key Implementation Notes
1. **Simple percentage calculation** - no complex weighting
2. **Universal activities** prevent zero scores
3. **No preferences = 100%** score
4. **Binary matching** - activity exists or doesn't
5. **Combine** both `activities` and `interests` arrays

## Common Activity Mappings
| User Says | Maps To |
|-----------|----------|
| "beach" | swimming, sunbathing, beach_walking |
| "water sports" | sailing, kayaking, surfing, etc. |
| "fitness" | gym, running, cycling, swimming |
| "nature" | hiking, bird_watching, photography |
| "culture" | museums, theater, concerts |

---
*Version 2.2 - Simplified*