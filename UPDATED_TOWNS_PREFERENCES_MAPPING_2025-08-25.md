# TOWNS_PREFERENCES_MAPPING - Updated Schema Analysis
**Analysis Date: August 25, 2025**  
**Database: Scout2Retire Supabase Instance**  
**Total Towns: 341**  
**Total User Preferences: 12**

---

## 1. TABLE COLUMN COUNTS

### Towns Table: **173 columns**
### User Preferences Table: **66 columns**

---

## 2. NUMERICAL VALUE RANGES

### 🌡️ Temperature Ranges
- **Summer Average Temperature**: 12°C to 42°C (53.6°F to 107.6°F)
- **Winter Average Temperature**: -10°C to 31°C (14°F to 87.8°F)

### 💰 Cost Ranges
- **Cost Index**: $35 to $85
- **Cost of Living (USD)**: $1,000 to $5,150 per month
- **Rent 1-Bedroom**: $240 to $2,100 per month
- **Rent 2-Bedroom**: $325 to $2,800 per month
- **Typical Monthly Living Cost**: $536 to $4,500
- **Typical Home Price**: $75,000 to $1,500,000
- **Purchase Price per sqm**: $800 to $4,500 per sqm

### 👥 Population Ranges
- **Population**: 1,300 to 20,900,000 residents

### 🌊 Distance & Geography Ranges
- **Distance to Ocean**: 0km to 1,600km (0 to 994 miles)
- **Elevation**: 0m to 3,640m (0 to 11,942 feet)
- **Airport Distance**: 2km to 194km (1.2 to 120.5 miles)
- **Distance to Major Hospital**: 0km to 160km (0 to 99.4 miles)

### 💸 Tax Rate Ranges
- **Income Tax Rate**: 0% to 55%
- **Sales Tax Rate**: 0% to 25%
- **Property Tax Rate**: 0% to 10%

### ⭐ Quality Score Ranges (typically 1-10 scale)
- **Healthcare Score**: 7 to 9
- **Safety Score**: 6 to 10
- **Quality of Life**: 7 to 9
- **Nightlife Rating**: 2 to 10
- **Museums Rating**: 1 to 10
- **Restaurants Rating**: 3 to 10
- **Cultural Rating**: 3 to 10
- **Outdoor Rating**: 7 to 9
- **Walkability**: 2 to 10

### 🌍 Environmental Factors
- **Annual Rainfall**: 0mm to 3,900mm (0 to 153.5 inches)
- **Sunshine Hours**: 1,320 to 4,020 hours per year
- **Humidity Average**: 30% to 85%
- **Air Quality Index**: 15 to 156
- **Natural Disaster Risk Score**: 2 to 7

### 🏥 Facility Counts
- **Hospital Count**: 0 to 104
- **Golf Courses**: 0 to 200
- **Tennis Courts**: 0 to 45
- **Marinas**: 0 to 15
- **Coworking Spaces**: 0 to 60

---

## 3. CATEGORICAL VALUES

### 🌤️ Climate Types (6 distinct values)
1. "Continental"
2. "Desert"
3. "Mediterranean"
4. "Subtropical"
5. "Temperate"
6. "Tropical"

### 🏙️ Urban/Rural Character (3 distinct values)
1. "rural"
2. "suburban"
3. "urban"

### ⚡ Pace of Life (3 distinct values)
1. "fast"
2. "moderate"
3. "relaxed"

### 🛡️ Safety/Crime Levels (7 distinct crime rate descriptions)
1. "Low - Generally safe with occasional petty crime"
2. "Low to Moderate - Generally safe, some property crime exists"
3. "Low to Moderate - Safe for retirees with standard precautions"
4. "Moderate - Some crime exists, choose neighborhoods carefully"
5. "Moderate to High - Research safe neighborhoods before moving"
6. "Very Low - One of the safest destinations"
7. "Very Low - Wiesbaden is considered one of the safest cities in Germany..."

### 🌍 Expat Community Size (3 distinct values)
1. "large"
2. "moderate"
3. "small"

### 🌪️ Natural Disaster Risk (7 levels)
1. "1" (lowest risk)
2. "2"
3. "3"
4. "4"
5. "5"
6. "6"
7. "7" (highest risk)

---

## 4. ARRAY FIELD VALUES

### 🗺️ Geographic Features (8 distinct values)
1. "Coastal Plains"
2. "High Mountains"
3. "Mountains"
4. "Plains"
5. "Rivers"
6. "Tropical Coastline"
7. "mountain"
8. "plains"

### 🌿 Vegetation Types (20 distinct values)
1. "Alpine Vegetation"
2. "Coastal Mediterranean"
3. "Coastal Tropical"
4. "Desert"
5. "Desert Vegetation"
6. "Mediterranean"
7. "Mediterranean Vegetation"
8. "Mixed Forests"
9. "Mountain Forests"
10. "Northern Forests"
11. "Subtropical Vegetation"
12. "Temperate Forests"
13. "Tropical Highlands"
14. "Tropical Vegetation"
15. "forest"
16. "grassland"
17. "mediterranean"
18. "subtropical"
19. "temperate"
20. "tropical"

### 🌎 Regions (43 distinct values)
1. "ASEAN"
2. "Andes"
3. "Anglo-America"
4. "Asia"
5. "Atlantic"
6. "Atlantic Ocean"
7. "Baja California"
8. "Canada"
9. "Canadian Rockies"
10. "Coastal"
11. "Colonial Cities"
12. "Commonwealth"
13. "EU"
14. "East Coast"
15. "Europe"
16. "G20"
17. "G7"
18. "Ganges Basin"
19. "Himalayas"
20. "Island"
21. "Latin America"
22. "MERCOSUR"
23. "Mekong Delta"
24. "Mexican Highlands"
25. "Mexico"
26. "Mountainous"
27. "NATO"
28. "North America"
29. "OECD"
30. "Oceania"
31. "Pacific"
32. "Pacific Ocean"
33. "Prairie Provinces"
34. "Rhine Valley"
35. "Schengen"
36. "South America"
37. "South Asia"
38. "Southeast Asia"
39. "Subtropical"
40. "Temperate"
41. "Tropical"
42. "USA"
43. "Valley"

### 🎯 Activities Available (142 distinct activities)
**Most Common Activity Categories:**
- **Cultural**: art_galleries, cultural_events, museums, cultural_clubs, festivals, live_music
- **Food & Dining**: cafe_hopping, cooking, fine_dining, food_scene, restaurants, street_food
- **Outdoor**: hiking, nature_walks, beach_walking, cycling_culture, outdoor_sports, trail_running
- **Water**: boating, sailing, fishing_charters, water_aerobics, swimming_pools
- **Fitness**: golf, tennis, yoga_ashrams, meditation, wellness
- **Social**: expat_meetups, social_groups, retirement_clubs, language_exchange
- **Urban**: shopping, nightlife, walkability, pedestrian_friendly
- **Relaxation**: slow_living, stress_free_lifestyle, relaxation, reading

---

## 5. KEY MAPPING INSIGHTS

### Primary User Preference to Town Data Mappings:

1. **Climate Preferences** → `climate`, `avg_temp_summer`, `avg_temp_winter`, `humidity_average`, `annual_rainfall`, `sunshine_hours`

2. **Cost Considerations** → `cost_index`, `typical_monthly_living_cost`, `typical_rent_1bed`, `typical_home_price`, `income_tax_rate_pct`, `property_tax_rate_pct`, `sales_tax_rate_pct`

3. **Geographic Preferences** → `geographic_features_actual`, `vegetation_type_actual`, `elevation_meters`, `distance_to_ocean_km`, `regions`

4. **Lifestyle Preferences** → `activities_available`, `pace_of_life`, `urban_rural_character`, `expat_community_size`, `nightlife_rating`, `cultural_rating`

5. **Safety & Healthcare** → `crime_rate`, `safety_score`, `healthcare_score`, `natural_disaster_risk_score`, `hospital_count`

6. **Infrastructure** → `walkability`, `internet_speed`, `airport_distance`, `public_transport_quality`, `coworking_spaces_count`

### Data Quality Notes:
- **High Coverage**: Population, cost data, climate data, activities
- **Moderate Coverage**: Facility counts, tax rates, environmental factors  
- **Variable Coverage**: Some newer fields may have null values
- **Array Fields**: Geographic features, vegetation, regions, and activities are stored as arrays requiring special handling in matching algorithms

---

**Report Generated**: August 25, 2025  
**Data Source**: Supabase Database - Scout2Retire Production Instance  
**Analysis Scripts**: `/schema-analysis.js` and `/detailed-ranges.js`