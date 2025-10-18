# Missing Editable Fields - Quick Checklist

## 🔴 CRITICAL (Must Fix First)

### CostsPanel - Add Taxes Section
- [ ] income_tax_rate_pct
- [ ] sales_tax_rate_pct
- [ ] property_tax_rate_pct
- [ ] tax_haven_status
- [ ] foreign_income_taxed

### Admin Tab - Add Visa Section
- [ ] retirement_visa_available
- [ ] digital_nomad_visa
- [ ] visa_on_arrival_countries

### Admin Tab - Add Safety Section
- [ ] safety_score
- [ ] crime_rate
- [ ] natural_disaster_risk
- [ ] internet_speed

### Create HobbiesPanel.jsx
- [ ] outdoor_rating
- [ ] outdoor_activities_rating
- [ ] walkability
- [ ] beaches_nearby
- [ ] golf_courses_count
- [ ] hiking_trails_km
- [ ] tennis_courts_count
- [ ] marinas_count
- [ ] ski_resorts_within_100km
- [ ] dog_parks_count
- [ ] farmers_markets

---

## 🟡 HIGH PRIORITY

### CulturePanel - Add Ratings Section
- [ ] cultural_events_rating
- [ ] nightlife_rating
- [ ] restaurants_rating
- [ ] museums_rating
- [ ] shopping_rating
- [ ] cultural_landmark_1
- [ ] cultural_landmark_2
- [ ] cultural_landmark_3

### CostsPanel - Fix Field Names
- [ ] cost_index
- [ ] Resolve rent_2bed vs rent_2bed_usd
- [ ] Resolve groceries_cost vs groceries_index
- [ ] Resolve meal_cost vs restaurant_price_index

### Admin Tab - Add Healthcare Costs
- [ ] healthcare_cost_monthly

---

## 🟢 MEDIUM PRIORITY

### RegionPanel - Add Geography
- [ ] nearest_airport
- [ ] airport_distance
- [ ] urban_rural_character
- [ ] region (different from geo_region)

### ClimatePanel - Add Details
- [ ] climate (climate type name)
- [ ] air_quality_index

---

## ✅ ALREADY COMPLETE

### RegionPanel (11 fields)
- [x] country, state_code, geo_region
- [x] latitude, longitude
- [x] geographic_features_actual
- [x] vegetation_type_actual
- [x] elevation_meters, population
- [x] distance_to_ocean_km, water_bodies (Legacy)

### ClimatePanel (13 fields)
- [x] Summer: avg_temp_summer, summer_climate_actual
- [x] Winter: avg_temp_winter, winter_climate_actual
- [x] Sunshine: sunshine_level_actual, sunshine_hours
- [x] Precipitation: precipitation_level_actual, annual_rainfall
- [x] Humidity: humidity_level_actual, humidity_average
- [x] General: climate_description, seasonal_variation_actual

### CulturePanel (10 fields)
- [x] Language: primary_language, english_proficiency_level
- [x] Lifestyle: pace_of_life_actual, social_atmosphere, traditional_progressive_lean
- [x] Community: expat_community_size, retirement_community_presence
- [x] Events: cultural_events_frequency, local_festivals

### CostsPanel (8 fields)
- [x] Living: cost_of_living_usd, typical_monthly_living_cost
- [x] Housing: rent_1bed, rent_2bed, home_price_sqm
- [x] Daily: utilities_cost, groceries_index, restaurant_price_index

---

**Total Missing:** 54 fields
**Total Critical:** 29 fields (53%)
**Total High Priority:** 12 fields (22%)
**Total Medium Priority:** 6 fields (11%)

**Recommended Order:**
1. Taxes (5 fields) - 1 hour
2. Visa (3 fields) - 30 min
3. Safety (4 fields) - 30 min
4. Hobbies Panel (11 fields) - 3 hours
5. Culture Ratings (8 fields) - 1 hour
6. Geography (4 fields) - 30 min
7. Climate (2 fields) - 15 min

**Total Estimated Time:** 6-7 hours
