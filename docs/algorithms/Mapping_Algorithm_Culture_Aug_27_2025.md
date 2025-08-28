# Culture Algorithm (15% weight)
**Updated: August 27, 2025**

## Quick Reference
- **Language**: 25 points
- **Expat Community**: 20 points
- **Pace of Life**: 15 points
- **Urban/Rural**: 15 points
- **Cultural Amenities**: 15 points
- **Social Atmosphere**: 10 points

## 1. Language Compatibility (25 points)

### English-Only Users
| Town English Level | Points |
|--------------------|--------|
| Primary language English | 25 |
| Excellent proficiency | 22 |
| Good proficiency | 18 |
| Moderate proficiency | 12 |
| Basic proficiency | 8 |
| No English | 5 |

### Multi-lingual Users
```javascript
if (user_languages.includes(town.primary_language)) return 25;
if (user_languages.some(lang => town.languages_spoken?.includes(lang))) return 25;
```

### Willing to Learn
| Language Type | Points |
|---------------|--------|
| Romance languages* | 20 |
| Other languages | 15 |

*Spanish, Portuguese, Italian, French, Catalan, Romanian

**Bonus:** +5 if `english_speaking_doctors === true`

## 2. Expat Community (20 points)

| User Wants | Town Has |  |  |  |
|------------|----------|----------|----------|----------|
|  | Large | Medium | Small | None |
| Large | 20 | 10 | 5 | 0 |
| Medium | 10 | 20 | 10 | 5 |
| Small | 5 | 10 | 20 | 10 |
| None | 0 | 5 | 10 | 20 |
| No preference | 20 | 20 | 20 | 20 |

## 3. Pace of Life (15 points)

| User Wants | Town Pace |  |  |  |
|------------|-----------|----------|----------|----------|
|  | Fast | Moderate | Slow | Relaxed |
| Fast | 15 | 10 | 5 | 3 |
| Moderate | 10 | 15 | 10 | 8 |
| Slow | 5 | 10 | 15 | 12 |
| Relaxed | 3 | 8 | 12 | 15 |
| No preference | 15 | 15 | 15 | 15 |

## 4. Urban/Rural Setting (15 points)

| User Wants | Town Type |  |  |
|------------|-----------|----------|----------|
|  | Urban | Suburban | Rural |
| Urban | 15 | 10 | 5 |
| Suburban | 10 | 15 | 10 |
| Rural | 5 | 10 | 15 |
| No preference | 15 | 15 | 15 |

## 5. Cultural Amenities (15 points)

### Dining & Nightlife (5 points)
```javascript
importance = user.cultural_importance.dining_nightlife || 0;
rating = town.dining_nightlife_level || 5;
score = 5 * (rating / 10) * (importance / 5);
```

### Museums (5 points)
```javascript
importance = user.cultural_importance.museums || 0;
rating = town.museums_level || 5;
score = 5 * (rating / 10) * (importance / 5);
```

### Cultural Events (5 points)
```javascript
importance = user.cultural_importance.cultural_events || 0;
rating = town.cultural_events_level || 5;
score = 5 * (rating / 10) * (importance / 5);
```

## 6. Social Atmosphere (10 points)

| Traditional vs Progressive Match | Points |
|----------------------------------|--------|
| Exact match | 10 |
| No preference from user | 10 |
| Opposite preference | 5 |

## Data Fields Used

### User Preferences
- `language_comfort.preferences`
- `language_comfort.already_speak`
- `expat_community_preference`
- `lifestyle_preferences.pace_of_life`
- `lifestyle_preferences.urban_rural`
- `cultural_importance.*` (1-5 ratings)

### Town Data
- `primary_language`, `languages_spoken`
- `english_proficiency`, `english_proficiency_level`
- `expat_community_size`, `expat_population`
- `pace_of_life`, `pace_of_life_actual`
- `urban_rural_character`
- `dining_nightlife_level`, `museums_level`, `cultural_events_level`
- `traditional_progressive_lean`

## Key Implementation Notes
1. **Language is king** - 25% of culture score
2. **Binary expat matching** - needs gradual scoring improvement
3. **Cultural amenities** scale with user importance (0-5)
4. **No preference = perfect score** for all categories

---
*Version 2.2 - Simplified*