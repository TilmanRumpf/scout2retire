# COMPREHENSIVE TOWNS TABLE COLUMN ANALYSIS
**Generated:** 2025-10-30
**Total Columns:** 195
**Total Towns:** 352
**Well-Populated Fields (>90%):** 112

---

## 📊 EXECUTIVE SUMMARY

### Column Distribution
- **Boolean Fields:** 20 (10.3%)
- **Numeric Fields:** 77 (39.5%)
- **Text Fields:** 50 (25.6%)
- **JSON Fields:** 22 (11.3%)
- **Timestamp Fields:** 4 (2.1%)
- **Unknown:** 22 (11.3%)

### Data Quality
- **100% Populated:** 117 fields
- **90-99% Populated:** 17 fields
- **<10% Populated:** 7 fields (sparse, consider for cleanup)

---

## 🔘 BOOLEAN FIELDS (20 fields)

### Geographic Access (5 fields)
| Field | Values | Use Case |
|-------|--------|----------|
| `beaches_nearby` | true/false | "Towns with beaches" |
| `coastline_access` | false only | NOT USEFUL - all false |
| `lake_river_access` | false only | NOT USEFUL - all false |
| `mountain_access` | false only | NOT USEFUL - all false |
| `train_station` | false only | NOT USEFUL - all false |

### Visa & Legal (3 fields)
| Field | Values | Use Case |
|-------|--------|----------|
| `digital_nomad_visa` | false only (99.7%) | "Digital nomad visa available" |
| `retirement_visa_available` | true only (99.7%) | "Retirement visa available" |
| `tax_haven_status` | false only | NOT USEFUL - all false |
| `tax_treaty_us` | false only | NOT USEFUL - all false |
| `foreign_income_taxed` | true only | NOT USEFUL - all true |

### Healthcare & Services (3 fields)
| Field | Values | Use Case |
|-------|--------|----------|
| `english_speaking_doctors` | true/false | "English-speaking doctors available" |
| `health_insurance_required` | true only | NOT USEFUL - all true |
| `international_schools_available` | false only | NOT USEFUL - all false |

### Infrastructure (4 fields)
| Field | Values | Use Case |
|-------|--------|----------|
| `has_public_transit` | false only | NOT USEFUL - all false |
| `has_uber` | false only | NOT USEFUL - all false |
| `requires_car` | false only | NOT USEFUL - all false |
| `farmers_markets` | true only | NOT USEFUL - all true |

### System/Meta (5 fields)
| Field | Values | Use Case |
|-------|--------|----------|
| `childcare_available` | false only | NOT USEFUL - all false |
| `image_is_fallback` | false only | System field |
| `needs_update` | false only | System field |

**RECOMMENDATION:** 13 of 20 boolean fields have ONLY one value (always true or always false). These should be removed or converted to text fields with richer data.

---

## 🔢 NUMERIC FIELDS (77 fields)

### CLIMATE & WEATHER (10 fields)
| Field | Type | Range | Population | Use Case |
|-------|------|-------|------------|----------|
| `air_quality_index` | integer | 20-140 | 99.7% | "Air quality better than 50" |
| `annual_rainfall` | integer | 550-1280 mm | 100% | "Less than 700mm annual rainfall" |
| `avg_temp_summer` | integer | 20-36°C | 100% | "Summer temps 25-30°C" |
| `avg_temp_winter` | integer | -3-24°C | 100% | "Winter temps above 15°C" |
| `humidity_average` | integer | 55-78% | 99.7% | "Humidity below 65%" |
| `sunshine_hours` | integer | 2040-2840 hrs | 99.7% | "More than 2500 sunshine hours" |
| `elevation_meters` | text | 2-... | 100% | "Elevation below 500m" |
| `pollen_levels` | text | - | 5.7% | SPARSE - needs data |

### COST OF LIVING (15 fields)
| Field | Type | Range | Population | Use Case |
|-------|------|-------|------------|----------|
| `cost_of_living_usd` | integer | 914-2576 | 100% | "Monthly cost under $1500" |
| `cost_index` | integer | 40-85 | 99.7% | "Cost index below 60" |
| `rent_1bed` | integer | 320-1680 | 100% | "1-bed rent under $800" |
| `rent_2bed_usd` | integer | 325-1560 | 31.3% | "2-bed rent under $1000" |
| `rent_house_usd` | integer | 450-2160 | 31.3% | "House rent under $1500" |
| `groceries_cost` | integer | 70-370 | 100% | "Groceries under $250/month" |
| `utilities_cost` | integer | 40-150 | 100% | "Utilities under $100" |
| `meal_cost` | integer | 20-30 | 100% | "Average meal under $15" |
| `healthcare_cost` | integer | 75-500 | 99.7% | "Healthcare under $200/month" |
| `healthcare_cost_monthly` | integer | 65-431 | 99.7% | Same as above |
| `typical_monthly_living_cost` | integer | 914-2624 | 100% | Same as cost_of_living_usd |
| `typical_home_price` | integer | 85000-500000 | 38.1% | "Homes under $300k" |
| `typical_rent_1bed` | integer | 250-1200 | 37.8% | Duplicate of rent_1bed? |
| `purchase_apartment_sqm_usd` | integer | 1200-4500 | 15.6% | SPARSE |
| `purchase_house_avg_usd` | integer | 150000-585185 | 15.6% | SPARSE |

**DUPLICATES DETECTED:**
- `cost_of_living_usd` vs `typical_monthly_living_cost` (same range)
- `healthcare_cost` vs `healthcare_cost_monthly` (same range)
- `rent_1bed` vs `typical_rent_1bed` (need to verify which is canonical)

### TAX RATES (4 fields)
| Field | Type | Range | Population | Use Case |
|-------|------|-------|------------|----------|
| `income_tax_rate_pct` | numeric | 0-54% | 99.7% | "Income tax under 25%" |
| `property_tax_rate_pct` | numeric | 0.5-1.5% | 99.7% | "Property tax under 1%" |
| `sales_tax_rate_pct` | numeric | 6-23% | 99.7% | "Sales tax under 10%" |
| `property_appreciation_rate_pct` | numeric | 3-3.5% | 15.6% | SPARSE |

### QUALITY/RATING SCORES (1-10 scale) (25 fields)
| Field | Range | Population | Category |
|-------|-------|------------|----------|
| `quality_of_life` | 7-9 | 100% | Overall Score |
| `healthcare_score` | 7-9 | 100% | Healthcare |
| `safety_score` | 6-9 | 100% | Safety |
| `walkability` | 2-9 | 100% | Transportation |
| `public_transport_quality` | 1-6 | 100% | Transportation |
| `cultural_rating` | 3-9 | 99.7% | Culture |
| `cultural_events_rating` | 3-7 | 100% | Culture |
| `museums_rating` | 1-7 | 99.7% | Culture |
| `outdoor_rating` | 8-9 | 99.4% | Activities |
| `outdoor_activities_rating` | 5-7 | 100% | Activities |
| `restaurants_rating` | 3-8 | 99.7% | Dining |
| `shopping_rating` | 3-8 | 99.7% | Shopping |
| `nightlife_rating` | 2-8 | 99.7% | Entertainment |
| `wellness_rating` | 3-6 | 99.7% | Health |
| `english_proficiency` | 25-95 | 100% | Language |
| `political_stability_rating` | 9-85 | 99.7% | Safety |
| `government_efficiency_rating` | 8-70 | 99.7% | Governance |
| `environmental_health_rating` | 2-9 | 22.2% | Environment - SPARSE |
| `emergency_services_quality` | 3-8 | 22.2% | Healthcare - SPARSE |
| `insurance_availability_rating` | 3-9 | 22.2% | Healthcare - SPARSE |
| `medical_specialties_rating` | 3-6 | 22.2% | Healthcare - SPARSE |
| `travel_connectivity_rating` | 3-7 | 22.2% | Travel - SPARSE |
| `family_friendliness_rating` | 4-9 | 37.8% | Lifestyle - SPARSE |
| `senior_friendly_rating` | 3-4 | 37.8% | Lifestyle - SPARSE |
| `lgbtq_friendly_rating` | 6-8 | 23.0% | Lifestyle - SPARSE |
| `pet_friendly_rating` | 7-8 | 29.3% | Lifestyle - SPARSE |
| `solo_living_support` | 3-7 | 12.2% | Lifestyle - SPARSE |
| `startup_ecosystem_rating` | 4-4 | 5.7% | Business - VERY SPARSE |

**SPARSE RATINGS (22-38% populated):** These 9 rating fields need AI-powered population or should be removed from search templates.

### COUNTS (Infrastructure/Activities) (10 fields)
| Field | Range | Population | Use Case |
|-------|-------|------------|----------|
| `population` | 22k-1.15M | 100% | "Population under 100k" |
| `hospital_count` | 0-5 | 100% | "Multiple hospitals available" |
| `golf_courses_count` | 0-2 | 100% | "Has golf courses" |
| `tennis_courts_count` | 0-4 | 100% | "Has tennis courts" |
| `marinas_count` | 0-3 | 100% | "Has marinas" |
| `hiking_trails_km` | 10-100 | 100% | "50+ km of hiking trails" |
| `ski_resorts_within_100km` | 0-0 | 100% | NOT USEFUL - all 0 |
| `international_schools_count` | 0-0 | 100% | NOT USEFUL - all 0 |
| `coworking_spaces_count` | 0-0 | 100% | NOT USEFUL - all 0 |
| `dog_parks_count` | 0-0 | 100% | NOT USEFUL - all 0 |
| `veterinary_clinics_count` | 0-0 | 100% | NOT USEFUL - all 0 |
| `recreation_centers` | 0-0 | 100% | NOT USEFUL - all 0 |
| `parks_per_capita` | 0-0 | 100% | NOT USEFUL - all 0 |

**NOT USEFUL:** 7 count fields are ALL ZERO - should be removed or populated with real data.

### DISTANCES (8 fields)
| Field | Type | Range | Population | Use Case |
|-------|------|-------|------------|----------|
| `distance_to_urban_center` | integer | 0-238 km | 99.7% | "Within 50km of city" |
| `distance_to_ocean_km` | text | 0-... | 100% | "Within 10km of ocean" |
| `nearest_major_hospital_km` | text | - | - | "Hospital within 20km" |
| `airport_distance` | text | - | 100% | Needs parsing |
| `international_airport_distance` | text | - | - | Needs data |
| `regional_airport_distance` | text | - | - | Needs data |

**TEXT FIELDS THAT SHOULD BE NUMERIC:** Several distance fields are stored as text and need conversion to integers for range queries.

### OTHER NUMERIC (5 fields)
| Field | Range | Population | Notes |
|-------|-------|------------|-------|
| `crime_rate` | text | 99.4% | Should be numeric |
| `internet_speed` | 50-100 Mbps | 100% | "Internet over 75 Mbps" |
| `natural_disaster_risk` | 2-5 | 96.9% | "Disaster risk under 3" |
| `natural_disaster_risk_score` | 2-6 | 15.6% | SPARSE - duplicate? |
| `data_completeness_score` | 0-80 | 100% | System field |
| `visa_free_days` | 0-999 | 99.7% | "Visa-free over 90 days" |
| `min_income_requirement_usd` | 0-0 | 5.7% | VERY SPARSE |
| `pet_friendliness` | NaN | 12.5% | BROKEN - all NaN |

**DATA QUALITY ISSUES:**
- `pet_friendliness` is broken (all NaN values)
- `min_income_requirement_usd` is 5.7% populated (useless)
- `crime_rate` stored as text, should be numeric

---

## 📝 TEXT FIELDS (50 fields)

### CATEGORICAL VALUES (Should use validation) (14 fields)
| Field | Sample Values | Population | Validation File |
|-------|---------------|------------|-----------------|
| `summer_climate_actual` | "subtropical" | 100% | categoricalValues.js |
| `winter_climate_actual` | "warm" | 100% | categoricalValues.js |
| `sunshine_level_actual` | "high", "often_sunny" | 100% | categoricalValues.js |
| `precipitation_level_actual` | "low", "mostly_dry" | 100% | categoricalValues.js |
| `seasonal_variation_actual` | "minimal", "moderate" | 100% | categoricalValues.js |
| `humidity_level_actual` | "humid" | 100% | categoricalValues.js |
| `pace_of_life_actual` | "relaxed", "slow" | - | categoricalValues.js |
| `social_atmosphere` | "friendly", "vibrant" | - | categoricalValues.js |
| `retirement_community_presence` | "extensive", "strong" | - | categoricalValues.js |
| `expat_community_size` | "small", "moderate" | 100% | categoricalValues.js |
| `cultural_events_frequency` | "monthly" | 15.9% | categoricalValues.js |
| `traditional_progressive_lean` | "moderate", "balanced" | - | categoricalValues.js |
| `english_proficiency_level` | "native" | 100% | Should be enum |
| `urban_rural_character` | - | - | Needs validation |

### DESCRIPTIVE TEXT (Long-form) (5 fields)
| Field | Population | Use Case |
|-------|------------|----------|
| `description` | 100% | Main town description |
| `climate_description` | 100% | "Warm and humid throughout..." |
| `cost_description` | 99.7% | "Costly housing, higher prices..." |
| `healthcare_description` | 100% | "Quality healthcare available..." |
| `infrastructure_description` | 99.7% | "Strong digital infrastructure..." |
| `lifestyle_description` | 99.7% | "Coastal peaceful lifestyle..." |
| `safety_description` | - | Safety details |

### LOCATION/GEOGRAPHY (10 fields)
| Field | Population | Type |
|-------|------------|------|
| `name` / `town_name` | 100% | Primary identifier |
| `country` | 100% | "United States" |
| `country_code` | - | "US" |
| `region` | 100% | "North America" |
| `geo_region` | 100% | "north america" |
| `subdivision_code` | - | State/province code |
| `timezone` | - | "America/New_York" |
| `nearest_major_city` | - | "Tampa" |
| `nearest_airport` | 99.7% | Airport name |
| `climate` | 100% | "subtropical" (duplicate of summer_climate?) |

**DUPLICATES:**
- `name` vs `town_name`
- `region` vs `geo_region`
- `climate` vs `summer_climate_actual`

### UNIQUE IDENTIFIERS & LINKS (4 fields)
| Field | Population | Use Case |
|-------|------------|----------|
| `id` | 100% | UUID primary key |
| `google_maps_link` | 99.7% | External link |
| `image_url_1` | 56.0% | Primary image |
| `image_url_2` | 3.4% | VERY SPARSE |
| `image_url_3` | - | Additional images |
| `image_source` | 25.9% | Image attribution |
| `image_photographer` | 3.4% | VERY SPARSE |
| `image_license` | 6.8% | VERY SPARSE |
| `image_validation_note` | 13.4% | System field |

### INFRASTRUCTURE & SERVICES (8 fields)
| Field | Population | Notes |
|-------|------------|-------|
| `parking_availability` | - | Should be rating or boolean |
| `road_quality` | - | Should be rating |
| `traffic_congestion` | - | Should be rating |
| `internet_reliability` | - | Should be rating |
| `mobile_coverage` | - | Should be rating |
| `banking_infrastructure` | - | Should be rating |
| `bike_infrastructure` | - | Should be rating |
| `digital_services_availability` | - | Should be rating |

**RECOMMENDATION:** These 8 fields should be converted to numeric ratings (1-10) for better searchability.

### ACTIVITIES & HOBBIES (4 fields)
| Field | Population | Type |
|-------|------------|------|
| `cultural_landmark_1` | 99.7% | "Venice Beach" |
| `cultural_landmark_2` | 99.7% | "Historic Venice Train Depot" |
| `cultural_landmark_3` | 99.7% | "Venetian Waterway Park" |
| `mountain_activities` | - | Text description |

### RESIDENCY & VISA (3 fields)
| Field | Population | Notes |
|-------|------------|-------|
| `visa_requirements` | - | Long text |
| `residency_path_info` | - | Long text |

### OTHER (6 fields)
| Field | Population | Notes |
|-------|------------|-------|
| `primary_language` | - | Should be categorical |
| `tourist_season_impact` | 5.7% | VERY SPARSE |
| `private_healthcare_cost_index` | 15.6% | Duplicate of cost_index? |

---

## 📦 JSON FIELDS (22 fields)

### ACTIVITIES & INTERESTS (4 fields)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `activities_available` | 100% | Array of activities |
| `interests_supported` | 100% | Array of interests |
| `top_hobbies` | 100% | Popular hobbies |
| `activity_infrastructure` | 12.5% | SPARSE |

### GEOGRAPHIC FEATURES (4 fields)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `geographic_features` | 99.4% | Legacy format |
| `geographic_features_actual` | 100% | Current format |
| `vegetation_type_actual` | 100% | Plant types |
| `water_bodies` | 100% | Lakes, rivers, etc. |

**DUPLICATE:** `geographic_features` vs `geographic_features_actual` - can remove legacy?

### HEALTHCARE (2 fields)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `healthcare_specialties_available` | 99.7% | Array of specialties |
| `medical_specialties_available` | 5.7% | VERY SPARSE - duplicate? |

### LANGUAGES (2 fields)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `languages_spoken` | 100% | Array of languages |
| `secondary_languages` | 15.9% | SPARSE |

### TRANSPORTATION (3 fields)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `local_mobility_options` | 100% | Car, bike, walk |
| `regional_connectivity` | 100% | Highway, airport |
| `international_access` | 100% | Airports, flights |

### LOCATION & BOUNDARIES (2 fields)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `regions` | 100% | Geographic regions |
| `swimming_facilities` | 8.0% | SPARSE |

### VISA & RESIDENCY (2 fields)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `easy_residency_countries` | 5.7% | VERY SPARSE |
| `visa_on_arrival_countries` | 0.3% | ALMOST EMPTY |

### ENVIRONMENT (1 field)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `environmental_factors` | 12.5% | SPARSE |

### SYSTEM/META (2 fields)
| Field | Population | Sample Data |
|-------|------------|-------------|
| `audit_data` | 100% | System metadata |
| `data_sources` | 5.7% | VERY SPARSE |

---

## 🕐 TIMESTAMP FIELDS (4 fields)

| Field | Population | Use Case |
|-------|------------|----------|
| `created_at` | 100% | Record creation |
| `last_ai_update` | 100% | Last AI enrichment |
| `last_verified_date` | 6.0% | SPARSE - manual verification |
| `image_validated_at` | 19.9% | Image validation timestamp |

---

## 🚨 DATA QUALITY ISSUES

### CRITICAL ISSUES
1. **13 Boolean fields with single value** - Remove or convert to text
2. **7 Count fields all ZERO** - Remove or populate
3. **`pet_friendliness` all NaN** - Broken field
4. **Multiple duplicates** - Consolidate:
   - `name` vs `town_name`
   - `cost_of_living_usd` vs `typical_monthly_living_cost`
   - `healthcare_cost` vs `healthcare_cost_monthly`
   - `geographic_features` vs `geographic_features_actual`

### SPARSE FIELDS (<10% populated)
| Field | Population | Action |
|-------|------------|--------|
| `visa_on_arrival_countries` | 0.3% | DELETE |
| `image_photographer` | 3.4% | Low priority |
| `image_url_2` | 3.4% | Low priority |
| `min_income_requirement_usd` | 5.7% | DELETE |
| `startup_ecosystem_rating` | 5.7% | DELETE |
| `pollen_levels` | 5.7% | DELETE or populate |
| `tourist_season_impact` | 5.7% | DELETE or populate |
| `image_license` | 6.8% | Low priority |
| `last_verified_date` | 6.0% | System field - OK |

### FIELDS NEEDING TYPE CONVERSION
| Field | Current Type | Should Be |
|-------|-------------|-----------|
| `crime_rate` | text | integer |
| `distance_to_ocean_km` | text | integer |
| `elevation_meters` | text | integer |
| `parking_availability` | text | integer (1-10) |
| `road_quality` | text | integer (1-10) |
| `traffic_congestion` | text | integer (1-10) |
| `internet_reliability` | text | integer (1-10) |

---

## ✅ SEARCH TEMPLATE RECOMMENDATIONS

### TIER 1: READY FOR SEARCH (100% populated, clean data)
**Climate (6 fields)**
- `summer_climate_actual`, `winter_climate_actual`
- `sunshine_level_actual`, `precipitation_level_actual`
- `seasonal_variation_actual`, `humidity_level_actual`

**Cost (8 fields)**
- `cost_of_living_usd`, `cost_index`
- `rent_1bed`, `groceries_cost`, `utilities_cost`
- `meal_cost`, `healthcare_cost_monthly`

**Quality Scores (10 fields)**
- `quality_of_life`, `healthcare_score`, `safety_score`
- `walkability`, `public_transport_quality`
- `cultural_rating`, `outdoor_rating`
- `restaurants_rating`, `nightlife_rating`

**Geographic (5 fields)**
- `population`, `distance_to_urban_center`
- `beaches_nearby`, `english_speaking_doctors`

### TIER 2: USABLE (90-99% populated)
**Ratings (15 fields)**
- All rating fields with 90%+ population

**Infrastructure (5 fields)**
- `hospital_count`, `internet_speed`
- `hiking_trails_km`, `golf_courses_count`

### TIER 3: NEEDS WORK (22-38% populated)
**Sparse Ratings (9 fields)**
- `family_friendliness_rating`, `senior_friendly_rating`
- `lgbtq_friendly_rating`, `pet_friendly_rating`
- `emergency_services_quality`, `environmental_health_rating`

### TIER 4: DELETE OR FIX (<10% populated or broken)
- `pet_friendliness` (broken - all NaN)
- `visa_on_arrival_countries` (0.3%)
- `min_income_requirement_usd` (5.7%)
- All count fields that are 100% zero

---

## 📋 NEXT STEPS

### Immediate Actions
1. **Remove 13 useless boolean fields** (all one value)
2. **Remove 7 zero-count fields** (all zeros)
3. **Fix `pet_friendliness`** (all NaN)
4. **Consolidate duplicates** (name, cost, healthcare)
5. **Convert text to numeric** (crime_rate, distance_to_ocean_km, etc.)

### Data Enrichment Priority
1. **Populate sparse ratings** (22-38% populated) using AI
2. **Add missing image data** (photographer, license)
3. **Convert text ratings to numeric** (parking, road_quality, etc.)

### Search Template Creation
1. **Start with Tier 1 fields** (100% populated, 50+ templates possible)
2. **Add Tier 2 fields** (90%+ populated, 30+ templates)
3. **Wait on Tier 3** until data is enriched

---

## 📊 FIELD USAGE IN EXISTING CODE

### Current Column Sets (townColumnSets.js)
- **minimal:** 4 fields
- **basic:** 7 fields
- **climate:** 11 fields
- **cost:** 9 fields
- **lifestyle:** 10 fields
- **infrastructure:** 10 fields
- **admin:** 7 fields
- **scoring:** 6 fields
- **fullDetail:** ~60 fields

### Fields NOT in Any Column Set
**High-value unused fields:**
- `air_quality_index` (99.7%)
- `annual_rainfall` (100%)
- `avg_temp_summer`, `avg_temp_winter` (100%)
- `natural_disaster_risk` (96.9%)
- `english_proficiency` (100%)
- Many rating fields

**RECOMMENDATION:** Create additional column sets for:
- `environment` (air quality, disaster risk, pollen)
- `weather_detailed` (rainfall, temps, humidity_average)
- `ratings_complete` (all 25 rating fields)
- `activities` (counts, facilities)

---

**Generated by:** database-utilities/analyze-all-columns.js
**Data file:** database-utilities/column-analysis-output.json
