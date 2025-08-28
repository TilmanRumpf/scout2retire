# Region Algorithm (20% weight)
**Updated: August 27, 2025**

## Quick Reference
- **Country Match**: 40 points
- **Geographic Features**: 30 points
- **Vegetation Type**: 20 points
- **Regional Groups**: 10 points

## 1. Country Matching (40 points)
```javascript
if (!user.countries || user.countries.length === 0) return 40; // No preference
if (user.countries.map(c => c.toLowerCase())
    .includes(town.country.toLowerCase())) return 40; // Match!
return 0; // No match
```

**Simple:** Country match or no preference = full points

## 2. Geographic Features (30 points)

### Feature Categories (8 types)
- Coastal, Desert, Island, Mountains
- Plains, River Valley, Urban, Valley

### Scoring
```javascript
matched = user_features.filter(f => 
  town_features.map(t => t.toLowerCase())
    .includes(f.toLowerCase())
).length;

score = 30 * (matched / user_features.length);
```

**Examples:**
- User wants ["Coastal", "Mountains"], town has ["Coastal"] = 15 points (50%)
- User wants ["Island"], town has ["Island", "Coastal"] = 30 points (100%)
- No preference = 30 points

## 3. Vegetation Type (20 points)

### Vegetation Categories (20 types)
Alpine, Arid, Boreal Forest, Chaparral, Deciduous Forest, Desert, Grassland, Mediterranean, Mixed Forest, Mountain, Pine Forest, Prairie, Rainforest, Savanna, Scrubland, Steppe, Subtropical, Temperate Forest, Tropical, Tundra

### Scoring
```javascript
if (!user.vegetation_types) return 20; // No preference
if (user.vegetation_types.map(v => v.toLowerCase())
    .includes(town.vegetation_type_actual?.toLowerCase())) return 20;
return 0; // No partial credit currently
```

## 4. Regional Groups (10 points)

### Major Regions
- **Europe**: EU, Mediterranean, Scandinavia, Eastern Europe
- **Americas**: Caribbean, Central America, South America, North America
- **Asia**: Southeast Asia, East Asia, South Asia, Middle East
- **Other**: Oceania, Africa, Pacific Islands

### Scoring
```javascript
if (!user.regions) return 10; // No preference
if (town.regions?.some(r => 
    user.regions.map(ur => ur.toLowerCase())
      .includes(r.toLowerCase()))) return 10;
return 0;
```

## Data Fields Used

### User Preferences
- `countries` - Preferred countries array
- `regions` - Preferred regions (Mediterranean, EU, etc.)
- `geographic_features` - Preferred features (Coastal, Mountains, etc.)
- `vegetation_types` - Preferred vegetation

### Town Data
- `country` - Town's country (string)
- `regions` - Multiple region classifications (array)
- `geographic_features_actual` - Verified features (array)
- `vegetation_type_actual` - Single vegetation type (string)
- `geo_region` - Geographic region (backup field)

## Critical Implementation Notes

### ⚠️ ALWAYS USE .toLowerCase()
The August 24, 2025 disaster: 40 hours wasted because "coastal" ≠ "Coastal"
```javascript
// WRONG - CAUSED 40-HOUR BUG
if (user_feature === town_feature) // FAILS!

// CORRECT
if (user_feature.toLowerCase() === town_feature.toLowerCase()) // WORKS!
```

### Data Coverage
- Country: 100% complete (all 341 towns)
- Geographic features: 100% complete (fixed Aug 24)
- Vegetation type: 100% complete (fixed Aug 24)
- Regions: ~95% complete

## Scoring Examples

### Example 1: Perfect Match
- User wants: Spain, Coastal, Mediterranean vegetation
- Town: Valencia, Spain, ["Coastal", "Urban"], "Mediterranean"
- Score: 40 + 30 + 20 + 0 = 90/100

### Example 2: Partial Match
- User wants: ["Coastal", "Mountains"], any country
- Town: Nice, France, ["Coastal"], "Mediterranean"
- Score: 40 + 15 + 0 + 0 = 55/100

### Example 3: No Preferences
- User: No preferences set
- Any town: 40 + 30 + 20 + 10 = 100/100

## Priority Order
1. **Country** (40%) - Most specific preference
2. **Geographic features** (30%) - Physical environment
3. **Vegetation** (20%) - Climate indicator
4. **Regions** (10%) - Broad geographic area

---
*Version 2.2 - Simplified*