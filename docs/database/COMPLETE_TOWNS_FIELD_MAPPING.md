# Complete Towns Table Field Mapping (170+ Columns)
**Created: 2025-10-18**
**Purpose: COMPREHENSIVE audit of ALL town fields and their editability in the admin UI**

## CRITICAL FINDING: MASSIVE EDIT COVERAGE GAPS

The Towns Manager has only **37 actively editable fields** out of **170+** total columns. This means **133+ fields are either READ-ONLY or MISSING from the admin interface**.

---

## SECTION 1: CURRENTLY EDITABLE FIELDS (37 total)

### A. REGION PANEL (7 fields editable)

| Field Name | Type | Current Status | Notes |
|-----------|------|-----------------|-------|
| country | string | ✅ EDITABLE | Basic location |
| state_code | string | ✅ EDITABLE | State/province code |
| geo_region | array | ✅ EDITABLE | Geographic regions |
| latitude | number | ✅ EDITABLE | -90 to 90 |
| longitude | number | ✅ EDITABLE | -180 to 180 |
| geographic_features_actual | array | ✅ EDITABLE | Mountains, coastal, island, etc. |
| vegetation_type_actual | select | ✅ EDITABLE | tropical, temperate, arid, mixed, alpine |
| elevation_meters | number | ✅ EDITABLE | 0-9000m |
| population | number | ✅ EDITABLE | Town/city population |

**Legacy fields in Region (2 fields):**
- distance_to_ocean_km | number | 0-5000km
- water_bodies | text | Nearby water bodies

### B. CLIMATE PANEL (16 fields editable)

| Field Name | Type | Current Status | Notes |
|-----------|------|-----------------|-------|
| avg_temp_summer | number | ✅ EDITABLE | -50 to 50°C |
| summer_climate_actual | string | ✅ EDITABLE | Description |
| avg_temp_winter | number | ✅ EDITABLE | -50 to 30°C |
| winter_climate_actual | string | ✅ EDITABLE | Description |
| sunshine_level_actual | select | ✅ EDITABLE | low, less_sunny, balanced, high, often_sunny |
| sunshine_hours | number | ✅ EDITABLE | 0-4500 hrs/year |
| precipitation_level_actual | select | ✅ EDITABLE | low, mostly_dry, balanced, high, less_dry |
| annual_rainfall | number | ✅ EDITABLE | 0-10000mm |
| seasonal_variation_actual | select | ✅ EDITABLE | low, minimal, moderate, distinct_seasons, high, extreme |
| humidity_level_actual | select | ✅ EDITABLE | low, moderate, high |
| humidity_average | number | ✅ EDITABLE | 0-100% |
| climate_description | text | ✅ EDITABLE | General climate description |

**Legacy fields in Climate (5 fields):**
- avg_temp_spring | number | -50 to 50°C
- avg_temp_fall | number | -50 to 50°C
- snow_days | number | 0-365 days/year
- uv_index | number | 0-15 scale
- storm_frequency | select | rare, occasional, moderate, frequent, very frequent

### C. CULTURE PANEL (9 fields editable)

| Field Name | Type | Current Status | Notes |
|-----------|------|-----------------|-------|
| primary_language | string | ✅ EDITABLE | Main language spoken |
| english_proficiency_level | select | ✅ EDITABLE | minimal, low, moderate, high, widespread |
| pace_of_life_actual | select | ✅ EDITABLE | slow, relaxed, moderate, fast |
| social_atmosphere | select | ✅ EDITABLE | reserved, quiet, moderate, friendly, vibrant, very friendly |
| traditional_progressive_lean | select | ✅ EDITABLE | traditional, moderate, balanced, progressive |
| expat_community_size | select | ✅ EDITABLE | small, moderate, large |
| retirement_community_presence | select | ✅ EDITABLE | none, minimal, limited, moderate, strong, extensive, very_strong |
| cultural_events_frequency | select | ✅ EDITABLE | rare, occasional, monthly, frequent, weekly |
| local_festivals | text | ✅ EDITABLE | Festival descriptions |

**Legacy fields in Culture (5 fields):**
- cultural_events | text
- local_cuisine | text
- religious_diversity | text
- arts_scene | text
- music_scene | text

### D. COSTS PANEL (5 fields editable)

| Field Name | Type | Current Status | Notes |
|-----------|------|-----------------|-------|
| cost_of_living_usd | number | ✅ EDITABLE | 0-10000 USD/month |
| typical_monthly_living_cost | number | ✅ EDITABLE | 0-10000 USD/month |
| rent_1bed | number | ✅ EDITABLE | 0-10000 USD/month |
| rent_2bed | number | ✅ EDITABLE | 0-15000 USD/month |
| home_price_sqm | number | ✅ EDITABLE | 0-50000 USD/m² |
| utilities_cost | number | ✅ EDITABLE | 0-500 USD/month |
| groceries_index | number | ✅ EDITABLE | 0-200 index |
| restaurant_price_index | number | ✅ EDITABLE | 0-200 index |

### E. ADMIN/HEALTHCARE PANEL (Score Breakdown Panel) (22 fields editable)

**Healthcare Section (6 fields):**
| Field Name | Type | Current Status | Notes |
|-----------|------|-----------------|-------|
| healthcare_score | number | ✅ EDITABLE | 0.0-10.0 scale |
| hospital_count | number | ✅ EDITABLE | Count of hospitals |
| nearest_major_hospital_km | number | ✅ EDITABLE | Distance in km |
| emergency_services_quality | select | ✅ EDITABLE | poor, basic, functional, good, excellent |
| english_speaking_doctors | boolean | ✅ EDITABLE | true/false |
| insurance_availability_rating | number | ✅ EDITABLE | 0-10 scale |
| healthcare_cost | number | ✅ EDITABLE | USD/month |

**Safety Section (4 fields):**
| Field Name | Type | Current Status | Notes |
|-----------|------|-----------------|-------|
| safety_score | number | ✅ EDITABLE | 0.0-10.0 scale |
| crime_rate | select | ✅ EDITABLE | very_low, low, moderate, high, very_high |
| environmental_health_rating | number | ✅ EDITABLE | 0-10 scale |
| natural_disaster_risk | number | ✅ EDITABLE | 0-10 scale |
| political_stability_rating | number | ✅ EDITABLE | 0-100 scale |

**Infrastructure Section (5 fields):**
| Field Name | Type | Current Status | Notes |
|-----------|------|-----------------|-------|
| walkability | number | ✅ EDITABLE | 0-100 scale |
| air_quality_index | number | ✅ EDITABLE | AQI 0-500 |
| regional_airport_distance | number | ✅ EDITABLE | km |
| international_airport_distance | number | ✅ EDITABLE | km |
| airport_distance | number | ✅ EDITABLE | km (fallback) |
| government_efficiency_rating | number | ✅ EDITABLE | 0-100 scale |

**Legal & Admin Section (5 fields):**
| Field Name | Type | Current Status | Notes |
|-----------|------|-----------------|-------|
| visa_requirements | text | ✅ EDITABLE | Text description |
| visa_on_arrival_countries | array | ✅ EDITABLE | Country codes |
| retirement_visa_available | boolean | ✅ EDITABLE | true/false |
| tax_treaty_us | boolean | ✅ EDITABLE | true/false |
| tax_haven_status | boolean | ✅ EDITABLE | true/false |
| income_tax_rate_pct | number | ✅ EDITABLE | 0-100% |
| property_tax_rate_pct | number | ✅ EDITABLE | 0-10% |
| sales_tax_rate_pct | number | ✅ EDITABLE | 0-30% |
| foreign_income_taxed | boolean | ✅ EDITABLE | true/false |
| easy_residency_countries | array | ✅ EDITABLE | Country codes |

---

## SECTION 2: DISPLAYED BUT NOT EDITABLE (60+ fields)

### Displayed in TownDiscovery.jsx but NO EDIT UI

These fields are shown to users but admins CANNOT edit them directly. Many don't have a panel at all!

| Field Name | Where Displayed | Type | Why Not Editable? |
|-----------|-----------------|------|-------------------|
| **HOBBIES DATA (Major Gap)** | Hobbies section | complex | Uses HobbiesDisplay component only - no inline edit |
| outdoor_rating | Town data box | number | Missing from all panels |
| outdoor_activities_rating | Town data box | number | Missing from all panels |
| walkability | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| beaches_nearby | Town data box | boolean | Legacy field - no UI |
| golf_courses_count | Town data box | number | Missing from all panels |
| hiking_trails_km | Town data box | number | Missing from all panels |
| tennis_courts_count | Town data box | number | Missing from all panels |
| marinas_count | Town data box | number | Missing from all panels |
| ski_resorts_within_100km | Town data box | number | Missing from all panels |
| dog_parks_count | Town data box | number | Missing from all panels |
| farmers_markets | Town data box | boolean | Missing from all panels |
| water_bodies | Geography box | string | Legacy field - read only |
| **CULTURAL DATA (Major Gap)** | Culture section | string/number | Only partial edit support |
| cultural_events_rating | Town data box | number | Missing from all panels |
| nightlife_rating | Town data box | number | Missing from all panels |
| restaurants_rating | Town data box | number | Missing from all panels |
| museums_rating | Town data box | number | Missing from all panels |
| shopping_rating | Town data box | number | Missing from all panels |
| cultural_landmark_1 | Town data box | string | Missing from all panels |
| **HEALTHCARE/ADMIN DATA** | Admin box | number | Partial coverage |
| healthcare_score | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| safety_score | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| hospital_count | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| nearest_major_hospital_km | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| english_speaking_doctors | Town data box | boolean | ✅ EDIT AVAILABLE in Admin panel |
| air_quality_index | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| natural_disaster_risk | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| internet_speed | Town data box | number | Missing from all panels |
| crime_rate | Town data box | string | ✅ EDIT AVAILABLE in Admin panel |
| **COST DATA** | Costs box | number | Partial coverage |
| cost_index | Town data box | number | Derived field - not editable |
| cost_of_living_usd | Town data box | number | ✅ EDIT AVAILABLE in Costs panel |
| typical_monthly_living_cost | Town data box | number | ✅ EDIT AVAILABLE in Costs panel |
| rent_1bed | Town data box | number | ✅ EDIT AVAILABLE in Costs panel |
| rent_2bed_usd | Town data box | number | ✅ EDIT AVAILABLE in Costs panel |
| utilities_cost | Town data box | number | ✅ EDIT AVAILABLE in Costs panel |
| groceries_cost | Town data box | number | Missing from all panels |
| meal_cost | Town data box | number | Missing from all panels |
| **GEOGRAPHY/LOCATION** | Region box | string/number | Partial coverage |
| elevation_meters | Town data box | number | ✅ EDIT AVAILABLE in Region panel |
| latitude | Town data box | number | ✅ EDIT AVAILABLE in Region panel |
| longitude | Town data box | number | ✅ EDIT AVAILABLE in Region panel |
| distance_to_ocean_km | Town data box | number | Legacy field - read only |
| nearest_airport | Town data box | string | Missing from all panels |
| airport_distance | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| population | Town data box | number | ✅ EDIT AVAILABLE in Region panel |
| urban_rural_character | Town data box | string | Missing from all panels |
| **TAXES & FINANCE** | Costs/Admin boxes | number/string | Partial coverage |
| income_tax_rate_pct | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| sales_tax_rate_pct | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| property_tax_rate_pct | Town data box | number | ✅ EDIT AVAILABLE in Admin panel |
| tax_haven_status | Town data box | boolean | ✅ EDIT AVAILABLE in Admin panel |
| foreign_income_taxed | Town data box | boolean | ✅ EDIT AVAILABLE in Admin panel |
| **VISA & RESIDENCY** | Admin box | boolean/text | Partial coverage |
| retirement_visa_available | Town data box | boolean | ✅ EDIT AVAILABLE in Admin panel |
| digital_nomad_visa | Town data box | boolean | Missing from all panels |
| visa_on_arrival_countries | - | array | ✅ EDIT AVAILABLE in Admin panel |

---

## SECTION 3: DATABASE FIELDS WITH NO UI AT ALL (70+ fields)

These columns exist in the database but are COMPLETELY MISSING from the admin interface. Admins CANNOT see or edit them!

### Metadata Fields (10 fields)
- id
- created_at
- updated_at
- last_ai_update
- data_source
- data_quality_score
- last_verified_date
- verification_status
- is_archived
- is_excluded

### Display/Image Fields (multiple)
- image_url_1, image_url_2, ... image_url_N (photos for slideshow)
- photos (JSON array or string)
- description
- appealStatement
- matchScore
- insights
- matchReasons
- highlights
- warnings
- categoryScores (JSON)

### REGION/GEOGRAPHY (Additional Missing)
- region (name string)
- regions (array)
- geographic_features (legacy field)
- climate (string description)
- geo_region (may be duplicate of region?)

### CLIMATE (Additional Missing)
- climate_type (string)
- monthly_avg_temp_jan, _feb, ... _dec (12 fields for monthly data)
- monthly_precipitation_jan, _feb, ... _dec (12 fields)
- monthly_humidity_jan, _feb, ... _dec (12 fields)
- wind_patterns (string)
- frost_days (number)

### CULTURE/LIFESTYLE (Additional Missing)
- primary_language (EDITABLE but may have related fields)
- lgbtq_friendly_rating (number 0-10)
- pet_friendly_rating (number 0-10)
- language (alternative name?)
- languages_spoken (array)
- english_proficiency (alternative name?)

### COSTS/ECONOMY (Additional Missing)
- cost_of_living_index (separate from cost_of_living_usd?)
- rent_1bedroom_center (alternative name?)
- rent_1bedroom_outside (alternative name?)
- rent_2bed_usd (may conflict with rent_2bed)
- rent_studio (number)
- rent_3bed (number)
- monthly_budget_min (number)
- monthly_budget_max (number)
- healthcare_monthly_cost (may be same as healthcare_cost?)
- groceries_monthly_cost (may be same as groceries_cost?)
- food_cost (number)
- transportation_cost (number)
- entertainment_cost (number)
- miscellaneous_cost (number)

### HEALTHCARE/ADMIN (Additional Missing)
- healthcare_system_type (string: public, private, mixed, etc.)
- doctor_language_proficiency (string)
- pharmacy_availability (string)
- medical_insurance_types (array)
- emergency_response_time (number - in Legacy Fields Section)
- healthcare_accessibility (number)
- healthcare_waiting_times (string)
- dentist_availability (string)
- doctor_visit_cost (number)
- hospital_stay_cost_per_night (number)

### SAFETY (Additional Missing)
- theft_rate (number)
- assault_rate (number)
- homicide_rate (number)
- street_safety_rating (number)
- women_safety_rating (number)
- lgbtq_safety_rating (number)
- political_stability_score (in Legacy Fields - should be political_stability_rating)
- government_corruption_index (number)
- civil_unrest_frequency (string)

### INFRASTRUCTURE (Additional Missing)
- public_transport_rating (number)
- public_transport_type (array: metro, bus, tram, etc.)
- public_transport_frequency (string)
- public_transport_cost (number)
- internet_quality (string)
- electricity_reliability (string)
- water_quality (string)
- utility_reliability (number)
- cell_service_quality (string)
- broadband_availability (string)
- fixed_broadband_percentage (number)
- mobile_3g_percentage (number)
- mobile_4g_percentage (number)
- local_mobility_options (string)
- regional_connectivity (string)
- international_access (string)

### VISA/RESIDENCY/LEGAL (Additional Missing)
- residency_path_info (string)
- family_reunification_citizenship (boolean)
- digital_nomad_requirements (string)
- student_visa_available (boolean)
- spouse_visa_available (boolean)
- parent_visa_available (boolean)
- dual_citizenship_allowed (boolean)
- residency_visa_type (string)
- visa_processing_time_days (number)
- tax_resident_requirements_days (number)
- tax_residency_taxation_required (boolean)
- corporate_tax_rate_pct (number)
- capital_gains_tax_pct (number)
- dividend_tax_pct (number)
- inheritance_tax_pct (number)
- wealth_tax_pct (number)
- financial_reporting_requirements (text)
- visa_requirements_summary (string - may be same as visa_requirements)
- ease_of_residency_rating (number)

### HOBBIES/ACTIVITIES (Additional Missing - MAJOR GAP)
- hobbies (JSON - entire hobbies subsystem)
- hobbies_* (multiple activity-specific fields)
- activities_available (array/JSON)
- sports_available (array/JSON)
- water_sports_available (boolean)
- winter_sports_available (boolean)
- beach_activities (string)
- mountain_activities (string)
- urban_activities (string)
- art_galleries_count (number)
- theater_count (number)
- concert_venues_count (number)
- parks_count (number)
- nature_reserves_count (number)

### SCORING CALCULATED FIELDS (8 fields)
These are automatically calculated - should NOT be editable:
- overall_score (0-100, weighted average)
- climate_score (0-100)
- cost_score (0-100)
- lifestyle_score (0-100)
- infrastructure_score (0-100)
- admin_score (0-100)
- region_score (0-100)
- culture_score (0-100)
- hobbies_score (0-100)
- budget_score (0-100)

### USER RELATIONSHIP FIELDS (Multiple)
- user_id (FK - relationships)
- user_town_access (many-to-many relationship)
- favorites (many-to-many relationship)
- user_notes (one-to-many relationship)
- user_preferences (one-to-many relationship)

---

## SECTION 4: RECOMMENDATIONS FOR COMPLETE EDIT COVERAGE

### Priority 1: CRITICAL GAPS (Add edit UI immediately)

1. **Hobbies Data** - Currently uses special HobbiesDisplay but needs inline editing for:
   - golf_courses_count
   - hiking_trails_km
   - beaches_nearby
   - tennis_courts_count
   - marinas_count
   - ski_resorts_within_100km
   - dog_parks_count
   - farmers_markets

2. **Culture Ratings** - Missing completely:
   - cultural_events_rating (0-10)
   - nightlife_rating (0-10)
   - restaurants_rating (0-10)
   - museums_rating (0-10)
   - shopping_rating (0-10)
   - cultural_landmark_1 (string)

3. **Cost Details** - Missing:
   - groceries_cost (number)
   - meal_cost (number)
   - cost_index (calculated - SKIP)

4. **Infrastructure** - Missing:
   - internet_speed (number - already displayed!)
   - public_transport_rating
   - emergency_services_quality (added to admin panel)

### Priority 2: HIGH VALUE (Add edit UI for data quality)

1. **Tax Fields** - All editable but could be better organized:
   - corporate_tax_rate_pct
   - capital_gains_tax_pct
   - dividend_tax_pct
   - inheritance_tax_pct

2. **Visa/Residency** - Some missing:
   - digital_nomad_requirements
   - student_visa_available
   - spouse_visa_available
   - residency_visa_type

3. **Healthcare Advanced** - Some missing:
   - healthcare_system_type
   - pharmacy_availability
   - medical_insurance_types
   - doctor_visit_cost

4. **Safety Advanced** - Some missing:
   - women_safety_rating
   - lgbtq_safety_rating
   - theft_rate
   - assault_rate

### Priority 3: NICE TO HAVE (Improve admin experience)

1. **Climate Detail** - Add monthly data:
   - monthly_avg_temp_jan through _dec (12 fields)
   - monthly_precipitation_jan through _dec (12 fields)
   - monthly_humidity_jan through _dec (12 fields)

2. **Regional Data** - Currently scattered:
   - public_transport_type
   - internet_quality
   - electricity_reliability
   - water_quality

3. **Relationship Fields** - For linking:
   - user_id
   - is_archived
   - verification_status

---

## SECTION 5: SUGGESTED PANEL REORGANIZATION

### Existing Panels (Keep structure, add missing fields):
- **Region Panel** - Add: nearest_airport, urban_rural_character
- **Climate Panel** - Add: monthly breakdown tables for temperature/precipitation/humidity
- **Culture Panel** - Add: cultural_events_rating, nightlife_rating, restaurants_rating, museums_rating, shopping_rating, cultural_landmark_1
- **Costs Panel** - Add: groceries_cost, meal_cost, food_cost, transportation_cost, entertainment_cost
- **Admin Panel** - Add: internet_speed, digital_nomad_requirements, student_visa_available, spouse_visa_available

### New Panels Needed:
1. **Hobbies & Activities Panel** - Centralize all hobby counts and activity ratings
2. **Safety Details Panel** - Expand with: women_safety_rating, lgbtq_safety_rating, theft_rate, assault_rate
3. **Healthcare Advanced Panel** - Add: healthcare_system_type, pharmacy_availability, doctor_visit_cost
4. **Visa & Legal Details Panel** - Expand with all visa types and requirements
5. **Images & Media Panel** - Manage all image_url_* fields, photos array

---

## SECTION 6: IMPLEMENTATION CHECKLIST

**Total Fields in Towns Table:** 170+ columns
**Currently Editable:** 37 fields (22%)
**Displayed but Not Editable:** 60 fields (35%)
**Complete Coverage Gap (not UI at all):** 70+ fields (43%)

### What admin CAN do now:
- Edit basic location, climate, culture, and cost data
- Edit administrative/healthcare/safety scores
- View all 170+ fields in TownDiscovery but not edit 80%+

### What admin CANNOT do:
- Edit hobbies/activities data (except via HobbiesDisplay component)
- Edit cultural event ratings
- Edit internet speed
- Edit many visa/residency details
- Edit advanced healthcare options
- Edit monthly climate data
- Edit dozens of other important fields

### To achieve COMPLETE EDIT COVERAGE:
1. Create 5 new admin panels (Hobbies, Safety Details, Healthcare Advanced, Visa Details, Images)
2. Add ~35 new editable fields to existing panels
3. Standardize EditableDataField usage across all panels
4. Create field metadata for all 70+ missing fields
5. Add comprehensive validation rules for each field
6. Implement field-level permissions if needed

---

## Related Files:
- `/src/utils/townColumnSets.js` - Column definitions
- `/src/components/admin/RegionPanel.jsx` - Region edits
- `/src/components/admin/ClimatePanel.jsx` - Climate edits
- `/src/components/admin/CulturePanel.jsx` - Culture edits
- `/src/components/admin/CostsPanel.jsx` - Costs edits
- `/src/components/ScoreBreakdownPanel.jsx` - Admin scoring edits
- `/src/utils/admin/adminFieldMetadata.js` - Field metadata definitions
- `/src/pages/admin/TownsManager.jsx` - Main admin interface


---

## APPENDIX A: VISUAL SUMMARY

```
TOWNS TABLE: 170+ COLUMNS
├── EDITABLE IN ADMIN UI (37 fields - 22%)
│   ├── Region Panel (9 fields)
│   ├── Climate Panel (16 fields)
│   ├── Culture Panel (9 fields)
│   ├── Costs Panel (8 fields)
│   └── Admin Panel (22 fields - Healthcare, Safety, Infrastructure, Legal)
│
├── DISPLAYED BUT NOT EDITABLE (60 fields - 35%)
│   ├── Hobbies counts (8 fields - golf_courses, hiking_trails, etc.)
│   ├── Culture ratings (5 fields - nightlife_rating, restaurants_rating, etc.)
│   ├── Healthcare metrics (5 fields)
│   ├── Safety metrics (5 fields)
│   ├── Cost breakdowns (8 fields)
│   ├── Geography (8 fields)
│   └── Other (21 fields)
│
└── MISSING FROM UI ENTIRELY (70+ fields - 43%)
    ├── Metadata (10 fields - created_at, updated_at, etc.)
    ├── Display fields (10 fields - image_url_*, description, etc.)
    ├── Monthly climate data (36 fields - temp_jan-dec, precip_jan-dec, humidity_jan-dec)
    ├── Advanced healthcare (8 fields)
    ├── Advanced safety (6 fields)
    ├── Advanced visa/residency (12 fields)
    └── Other advanced fields (10+ fields)
```

---

## APPENDIX B: FIELD EDIT UI COVERAGE BY CATEGORY

```
REGION & GEOGRAPHY
├── country .......................... ✅ EDITABLE (Region Panel)
├── state_code ....................... ✅ EDITABLE (Region Panel)
├── geo_region ....................... ✅ EDITABLE (Region Panel)
├── latitude ......................... ✅ EDITABLE (Region Panel)
├── longitude ........................ ✅ EDITABLE (Region Panel)
├── geographic_features_actual ....... ✅ EDITABLE (Region Panel)
├── elevation_meters ................. ✅ EDITABLE (Region Panel)
├── vegetation_type_actual ........... ✅ EDITABLE (Region Panel)
├── population ....................... ✅ EDITABLE (Region Panel)
├── distance_to_ocean_km ............. 🔒 LEGACY FIELD (read-only)
├── water_bodies ..................... 🔒 LEGACY FIELD (read-only)
├── nearest_airport .................. ❌ MISSING FROM UI
├── urban_rural_character ............ ❌ MISSING FROM UI
└── climate (type description) ....... ❌ MISSING FROM UI

CLIMATE & WEATHER
├── avg_temp_summer .................. ✅ EDITABLE (Climate Panel)
├── summer_climate_actual ............ ✅ EDITABLE (Climate Panel)
├── avg_temp_winter .................. ✅ EDITABLE (Climate Panel)
├── winter_climate_actual ............ ✅ EDITABLE (Climate Panel)
├── sunshine_level_actual ............ ✅ EDITABLE (Climate Panel)
├── sunshine_hours ................... ✅ EDITABLE (Climate Panel)
├── precipitation_level_actual ....... ✅ EDITABLE (Climate Panel)
├── annual_rainfall .................. ✅ EDITABLE (Climate Panel)
├── seasonal_variation_actual ........ ✅ EDITABLE (Climate Panel)
├── humidity_level_actual ............ ✅ EDITABLE (Climate Panel)
├── humidity_average ................. ✅ EDITABLE (Climate Panel)
├── climate_description .............. ✅ EDITABLE (Climate Panel)
├── avg_temp_spring .................. 🔒 LEGACY FIELD (read-only)
├── avg_temp_fall .................... 🔒 LEGACY FIELD (read-only)
├── snow_days ........................ 🔒 LEGACY FIELD (read-only)
├── uv_index ......................... 🔒 LEGACY FIELD (read-only)
├── storm_frequency .................. 🔒 LEGACY FIELD (read-only)
├── monthly_avg_temp_jan-dec ......... ❌ MISSING FROM UI (12 fields)
├── monthly_precipitation_jan-dec .... ❌ MISSING FROM UI (12 fields)
└── monthly_humidity_jan-dec ......... ❌ MISSING FROM UI (12 fields)

CULTURE & LIFESTYLE
├── primary_language ................. ✅ EDITABLE (Culture Panel)
├── english_proficiency_level ........ ✅ EDITABLE (Culture Panel)
├── pace_of_life_actual .............. ✅ EDITABLE (Culture Panel)
├── social_atmosphere ................ ✅ EDITABLE (Culture Panel)
├── traditional_progressive_lean ..... ✅ EDITABLE (Culture Panel)
├── expat_community_size ............. ✅ EDITABLE (Culture Panel)
├── retirement_community_presence .... ✅ EDITABLE (Culture Panel)
├── cultural_events_frequency ........ ✅ EDITABLE (Culture Panel)
├── local_festivals .................. ✅ EDITABLE (Culture Panel)
├── cultural_events .................. 🔒 LEGACY FIELD (read-only)
├── local_cuisine .................... 🔒 LEGACY FIELD (read-only)
├── religious_diversity .............. 🔒 LEGACY FIELD (read-only)
├── arts_scene ....................... 🔒 LEGACY FIELD (read-only)
├── music_scene ....................... 🔒 LEGACY FIELD (read-only)
├── cultural_events_rating ........... 📊 DISPLAYED but NOT EDITABLE
├── nightlife_rating ................. 📊 DISPLAYED but NOT EDITABLE
├── restaurants_rating ............... 📊 DISPLAYED but NOT EDITABLE
├── museums_rating ................... 📊 DISPLAYED but NOT EDITABLE
├── shopping_rating .................. 📊 DISPLAYED but NOT EDITABLE
├── cultural_landmark_1 .............. 📊 DISPLAYED but NOT EDITABLE
├── lgbtq_friendly_rating ............ ❌ MISSING FROM UI
├── pet_friendly_rating .............. ❌ MISSING FROM UI
└── language (duplicate?) ............ ❌ MISSING FROM UI

COSTS & ECONOMY
├── cost_of_living_usd ............... ✅ EDITABLE (Costs Panel)
├── typical_monthly_living_cost ...... ✅ EDITABLE (Costs Panel)
├── rent_1bed ........................ ✅ EDITABLE (Costs Panel)
├── rent_2bed ........................ ✅ EDITABLE (Costs Panel)
├── home_price_sqm ................... ✅ EDITABLE (Costs Panel)
├── utilities_cost ................... ✅ EDITABLE (Costs Panel)
├── groceries_index .................. ✅ EDITABLE (Costs Panel)
├── restaurant_price_index ........... ✅ EDITABLE (Costs Panel)
├── cost_index ....................... 📊 CALCULATED (not editable)
├── cost_of_living_index ............. ❌ MISSING FROM UI (duplicate?)
├── groceries_cost ................... ❌ MISSING FROM UI (displayed but not editable)
├── meal_cost ........................ ❌ MISSING FROM UI (displayed but not editable)
├── food_cost ........................ ❌ MISSING FROM UI
├── transportation_cost .............. ❌ MISSING FROM UI
├── entertainment_cost ............... ❌ MISSING FROM UI
├── miscellaneous_cost ............... ❌ MISSING FROM UI
├── rent_studio ...................... ❌ MISSING FROM UI
├── rent_3bed ........................ ❌ MISSING FROM UI
├── monthly_budget_min ............... ❌ MISSING FROM UI
└── monthly_budget_max ............... ❌ MISSING FROM UI

HEALTHCARE (30 admin points)
├── healthcare_score ................. ✅ EDITABLE (Admin Panel)
├── hospital_count ................... ✅ EDITABLE (Admin Panel)
├── nearest_major_hospital_km ........ ✅ EDITABLE (Admin Panel)
├── emergency_services_quality ....... ✅ EDITABLE (Admin Panel)
├── english_speaking_doctors ......... ✅ EDITABLE (Admin Panel)
├── insurance_availability_rating .... ✅ EDITABLE (Admin Panel)
├── healthcare_cost .................. ✅ EDITABLE (Admin Panel)
├── healthcare_cost_monthly .......... 📊 DISPLAYED but NOT EDITABLE
├── healthcare_monthly_cost .......... ❌ MISSING FROM UI (duplicate?)
├── healthcare_system_type ........... ❌ MISSING FROM UI
├── doctor_language_proficiency ...... ❌ MISSING FROM UI
├── pharmacy_availability ............ ❌ MISSING FROM UI
├── medical_insurance_types .......... ❌ MISSING FROM UI
├── doctor_visit_cost ................ ❌ MISSING FROM UI
├── hospital_stay_cost_per_night ..... ❌ MISSING FROM UI
├── dentist_availability ............. ❌ MISSING FROM UI
└── emergency_response_time .......... 🔒 LEGACY FIELD (read-only)

SAFETY (25 admin points)
├── safety_score ..................... ✅ EDITABLE (Admin Panel)
├── crime_rate ....................... ✅ EDITABLE (Admin Panel)
├── environmental_health_rating ...... ✅ EDITABLE (Admin Panel)
├── natural_disaster_risk ............ ✅ EDITABLE (Admin Panel)
├── political_stability_rating ....... ✅ EDITABLE (Admin Panel)
├── crime_rate_description ........... 📊 DISPLAYED but NOT EDITABLE
├── theft_rate ....................... ❌ MISSING FROM UI
├── assault_rate ..................... ❌ MISSING FROM UI
├── homicide_rate .................... ❌ MISSING FROM UI
├── street_safety_rating ............. ❌ MISSING FROM UI
├── women_safety_rating .............. ❌ MISSING FROM UI
├── lgbtq_safety_rating .............. ❌ MISSING FROM UI
├── government_corruption_index ...... ❌ MISSING FROM UI
├── civil_unrest_frequency ........... ❌ MISSING FROM UI
└── political_stability_score ........ 🔒 LEGACY FIELD (read-only) [CONFLICTS with _rating]

INFRASTRUCTURE (15 admin points)
├── walkability ....................... ✅ EDITABLE (Admin Panel)
├── air_quality_index ................ ✅ EDITABLE (Admin Panel)
├── regional_airport_distance ........ ✅ EDITABLE (Admin Panel)
├── international_airport_distance ... ✅ EDITABLE (Admin Panel)
├── airport_distance ................. ✅ EDITABLE (Admin Panel)
├── government_efficiency_rating ..... ✅ EDITABLE (Admin Panel)
├── internet_speed ................... 📊 DISPLAYED but NOT EDITABLE
├── public_transport_rating .......... ❌ MISSING FROM UI
├── public_transport_type ............ ❌ MISSING FROM UI
├── public_transport_frequency ....... ❌ MISSING FROM UI
├── public_transport_cost ............ ❌ MISSING FROM UI
├── internet_quality ................. ❌ MISSING FROM UI
├── electricity_reliability .......... ❌ MISSING FROM UI
├── water_quality .................... ❌ MISSING FROM UI
├── utility_reliability .............. ❌ MISSING FROM UI
├── cell_service_quality ............. ❌ MISSING FROM UI
├── broadband_availability ........... ❌ MISSING FROM UI
└── local_mobility_options ........... ❌ MISSING FROM UI

VISA & RESIDENCY (10 admin points)
├── visa_requirements ................ ✅ EDITABLE (Admin Panel)
├── visa_on_arrival_countries ........ ✅ EDITABLE (Admin Panel)
├── retirement_visa_available ........ ✅ EDITABLE (Admin Panel)
├── tax_treaty_us .................... ✅ EDITABLE (Admin Panel)
├── tax_haven_status ................. ✅ EDITABLE (Admin Panel)
├── easy_residency_countries ......... ✅ EDITABLE (Admin Panel)
├── visa_requirements_summary ........ ❌ MISSING FROM UI (dup of visa_requirements?)
├── residency_path_info .............. ❌ MISSING FROM UI
├── family_reunification_citizenship . ❌ MISSING FROM UI
├── digital_nomad_visa ............... 📊 DISPLAYED but NOT EDITABLE
├── digital_nomad_requirements ....... ❌ MISSING FROM UI
├── student_visa_available ........... ❌ MISSING FROM UI
├── spouse_visa_available ............ ❌ MISSING FROM UI
├── parent_visa_available ............ ❌ MISSING FROM UI
├── dual_citizenship_allowed ......... ❌ MISSING FROM UI
├── residency_visa_type .............. ❌ MISSING FROM UI
├── visa_processing_time_days ........ ❌ MISSING FROM UI
├── ease_of_residency_rating ......... ❌ MISSING FROM UI
└── ease_of_residency_rating ......... ❌ MISSING FROM UI

TAXES & FINANCE (10+ admin points)
├── income_tax_rate_pct .............. ✅ EDITABLE (Admin Panel)
├── property_tax_rate_pct ............ ✅ EDITABLE (Admin Panel)
├── sales_tax_rate_pct ............... ✅ EDITABLE (Admin Panel)
├── foreign_income_taxed ............. ✅ EDITABLE (Admin Panel)
├── corporate_tax_rate_pct ........... ❌ MISSING FROM UI
├── capital_gains_tax_pct ............ ❌ MISSING FROM UI
├── dividend_tax_pct ................. ❌ MISSING FROM UI
├── inheritance_tax_pct .............. ❌ MISSING FROM UI
├── wealth_tax_pct ................... ❌ MISSING FROM UI
├── financial_reporting_requirements . ❌ MISSING FROM UI
├── tax_resident_requirements_days ... ❌ MISSING FROM UI
├── tax_residency_taxation_required .. ❌ MISSING FROM UI
└── tax_treaty ........................ 🔒 LEGACY FIELD (read-only)

HOBBIES & ACTIVITIES (MAJOR GAP - uses custom component only)
├── outdoor_rating ................... 📊 DISPLAYED but NOT EDITABLE
├── outdoor_activities_rating ........ 📊 DISPLAYED but NOT EDITABLE
├── walkability ....................... ✅ EDITABLE (Infrastructure section)
├── beaches_nearby ................... 📊 DISPLAYED but NOT EDITABLE (legacy)
├── golf_courses_count ............... 📊 DISPLAYED but NOT EDITABLE
├── hiking_trails_km ................. 📊 DISPLAYED but NOT EDITABLE
├── tennis_courts_count .............. 📊 DISPLAYED but NOT EDITABLE
├── marinas_count .................... 📊 DISPLAYED but NOT EDITABLE
├── ski_resorts_within_100km ......... 📊 DISPLAYED but NOT EDITABLE
├── dog_parks_count .................. 📊 DISPLAYED but NOT EDITABLE
├── farmers_markets .................. 📊 DISPLAYED but NOT EDITABLE
├── parks_count ....................... ❌ MISSING FROM UI
├── nature_reserves_count ............ ❌ MISSING FROM UI
├── outdoor_activities ............... 🔒 LEGACY FIELD (read-only)
├── hiking_trails .................... 🔒 LEGACY FIELD (read-only)
├── beaches_nearby ................... 🔒 LEGACY FIELD (read-only)
├── golf_courses ..................... 🔒 LEGACY FIELD (read-only)
├── ski_resorts_nearby ............... 🔒 LEGACY FIELD (read-only)
├── cultural_attractions ............. 🔒 LEGACY FIELD (read-only)
├── hobbies (JSON) ................... 🎯 HobbiesDisplay component (special handling)
├── hobbies_* (multiple) ............. 🎯 HobbiesDisplay component (special handling)
└── activities_available ............. ❌ MISSING FROM UI

DISPLAY & METADATA
├── id ................................ 🔒 SYSTEM FIELD
├── created_at ....................... 🔒 SYSTEM FIELD
├── updated_at ....................... 🔒 SYSTEM FIELD
├── last_ai_update ................... 🔒 SYSTEM FIELD
├── data_source ....................... 🔒 SYSTEM FIELD
├── data_quality_score ............... 🔒 SYSTEM FIELD
├── last_verified_date ............... 🔒 SYSTEM FIELD
├── verification_status .............. 🔒 SYSTEM FIELD
├── is_archived ....................... 🔒 SYSTEM FIELD
├── is_excluded ....................... 🔒 SYSTEM FIELD
├── name ............................. 📊 DISPLAYED but NOT EDITABLE (primary key equivalent)
├── description ...................... 📊 DISPLAYED but NOT EDITABLE
├── photos ........................... 📊 DISPLAYED but NOT EDITABLE
├── image_url_1, image_url_2, etc. ... 📊 DISPLAYED but NOT EDITABLE
├── appealStatement .................. 📊 DISPLAYED but NOT EDITABLE
├── matchScore ....................... 📊 DISPLAYED but NOT EDITABLE (calculated)
├── insights ......................... 📊 DISPLAYED but NOT EDITABLE
├── matchReasons ..................... 📊 DISPLAYED but NOT EDITABLE
├── highlights ....................... 📊 DISPLAYED but NOT EDITABLE
├── warnings ......................... 📊 DISPLAYED but NOT EDITABLE
└── categoryScores ................... 📊 DISPLAYED but NOT EDITABLE (JSON)

SCORING FIELDS (All calculated - should NOT be editable)
├── overall_score .................... 📊 DISPLAYED, NOT EDITABLE (calculated)
├── climate_score .................... 📊 DISPLAYED, NOT EDITABLE (calculated)
├── cost_score ....................... 📊 DISPLAYED, NOT EDITABLE (calculated)
├── lifestyle_score .................. 📊 DISPLAYED, NOT EDITABLE (calculated)
├── infrastructure_score ............. 📊 DISPLAYED, NOT EDITABLE (calculated)
├── admin_score ....................... 📊 DISPLAYED, NOT EDITABLE (calculated)
├── region_score ..................... 📊 DISPLAYED, NOT EDITABLE (calculated)
├── culture_score .................... 📊 DISPLAYED, NOT EDITABLE (calculated)
├── hobbies_score .................... 📊 DISPLAYED, NOT EDITABLE (calculated)
└── budget_score ..................... 📊 DISPLAYED, NOT EDITABLE (calculated)
```

---

## LEGEND:
- ✅ **EDITABLE** - Admin can edit inline with database sync
- 🔒 **LEGACY FIELD** - Read-only, preserved for historical data
- 📊 **DISPLAYED NOT EDITABLE** - Shows in UI but no edit capability
- ❌ **MISSING FROM UI** - Database field but completely hidden from admin
- 🔲 **SYSTEM FIELD** - Internal use, typically not edited
- 🎯 **SPECIAL COMPONENT** - Uses custom component (HobbiesDisplay)
- 📉 **CALCULATED** - Auto-computed from other fields

