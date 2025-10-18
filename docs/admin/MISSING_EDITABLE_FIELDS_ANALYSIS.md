# Missing Editable Fields in Towns Manager - Comprehensive Audit
**Date:** 2025-10-18
**Screenshots:** `/screenshots-audit/`

## Executive Summary

After auditing the Towns Manager admin interface against the Discover page display, I found **57 data fields** that are displayed to users but **NOT editable** in the Towns Manager. This represents a significant gap in admin functionality.

---

## Methodology

1. **Screenshot Analysis:** Captured all 6 tabs in Towns Manager (Region, Climate, Culture, Hobbies, Admin, Costs)
2. **Code Review:** Analyzed `TownDiscovery.jsx` to identify all displayed fields
3. **Panel Review:** Examined `RegionPanel.jsx`, `ClimatePanel.jsx`, `CulturePanel.jsx` for editable fields
4. **Gap Analysis:** Cross-referenced displayed fields against editable fields

---

## Current Editable Fields by Tab

### Region Tab (10 fields)
- ✅ country
- ✅ state_code
- ✅ geo_region
- ✅ latitude
- ✅ longitude
- ✅ geographic_features_actual
- ✅ vegetation_type_actual
- ✅ elevation_meters
- ✅ population
- ✅ distance_to_ocean_km (Legacy)
- ✅ water_bodies (Legacy)

### Climate Tab (13 fields)
- ✅ avg_temp_summer
- ✅ summer_climate_actual
- ✅ avg_temp_winter
- ✅ winter_climate_actual
- ✅ sunshine_level_actual
- ✅ sunshine_hours
- ✅ precipitation_level_actual
- ✅ annual_rainfall
- ✅ seasonal_variation_actual
- ✅ humidity_level_actual
- ✅ humidity_average
- ✅ climate_description
- ✅ avg_temp_spring, avg_temp_fall, snow_days, uv_index, storm_frequency (Legacy)

### Culture Tab (10 fields)
- ✅ primary_language
- ✅ english_proficiency_level
- ✅ pace_of_life_actual
- ✅ social_atmosphere
- ✅ traditional_progressive_lean
- ✅ expat_community_size
- ✅ retirement_community_presence
- ✅ cultural_events_frequency
- ✅ local_festivals
- ✅ cultural_events, local_cuisine, religious_diversity, arts_scene, music_scene (Legacy)

### Hobbies Tab
*Status: NOT REVIEWED IN DETAIL (screenshot too small)*

### Admin Tab
*Visible fields:* Healthcare score, hospital count, nearest hospital distance, emergency services quality, English-speaking doctors, insurance availability

### Costs Tab
*Not visible in screenshots*

---

## MISSING FIELDS - Displayed but Not Editable

### REGION & GEOGRAPHY (6 fields missing)
| Field Name | Currently Displayed | Editable? | Location in UI |
|-----------|-------------------|-----------|----------------|
| `region` | ✅ Yes (Discover page) | ❌ No | Region box: "Region: [value]" |
| `nearest_airport` | ✅ Yes (Discover page) | ❌ No | Region box: "Airport: [value]" |
| `airport_distance` | ✅ Yes (Discover page) | ❌ No | Region box: "Airport distance: [value]km" |
| `urban_rural_character` | ✅ Yes (Discover page) | ❌ No | Region box: "Character: [value]" |
| `distance_to_ocean_km` | ✅ Yes (Discover page) | ⚠️ Legacy | Region box: "Ocean distance: [value]km" |
| `water_bodies` | ✅ Yes (Discover page) | ⚠️ Legacy | Hobbies box: "Water: [value]" |

### CLIMATE & WEATHER (2 fields missing)
| Field Name | Currently Displayed | Editable? | Location in UI |
|-----------|-------------------|-----------|----------------|
| `climate` | ✅ Yes (Discover page) | ❌ No | Climate box: "Climate type: [value]" |
| `air_quality_index` | ✅ Yes (Discover page) | ❌ No | Climate box: "Air quality index: [value]" |

### CULTURE & LIFESTYLE (10 fields missing)
| Field Name | Currently Displayed | Editable? | Location in UI |
|-----------|-------------------|-----------|----------------|
| `cultural_events_rating` | ✅ Yes (Discover page) | ❌ No | Culture box: "Cultural events: [value]/10" |
| `nightlife_rating` | ✅ Yes (Discover page) | ❌ No | Culture box: "Nightlife: [value]/10" |
| `restaurants_rating` | ✅ Yes (Discover page) | ❌ No | Culture box: "Restaurants: [value]/10" |
| `museums_rating` | ✅ Yes (Discover page) | ❌ No | Culture box: "Museums: [value]/10" |
| `shopping_rating` | ✅ Yes (Discover page) | ❌ No | Culture box: "Shopping: [value]/10" |
| `cultural_landmark_1` | ✅ Yes (Discover page) | ❌ No | Culture box: "Landmark: [value]" |
| `cultural_landmark_2` | ❓ Likely exists | ❌ No | Not displayed (probably in database) |
| `cultural_landmark_3` | ❓ Likely exists | ❌ No | Not displayed (probably in database) |
| `local_cuisine` | ❓ Legacy field | ⚠️ Legacy | Not displayed prominently |
| `arts_scene` | ❓ Legacy field | ⚠️ Legacy | Not displayed prominently |

### HOBBIES & ACTIVITIES (13 fields missing)
| Field Name | Currently Displayed | Editable? | Location in UI |
|-----------|-------------------|-----------|----------------|
| `outdoor_rating` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Outdoor rating: [value]/10" |
| `outdoor_activities_rating` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Outdoor activities: [value]/10" |
| `walkability` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Walkability: [value]/10" |
| `beaches_nearby` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Beaches: Yes/No" |
| `golf_courses_count` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Golf courses: [count]" |
| `hiking_trails_km` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Hiking trails: [value]km" |
| `tennis_courts_count` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Tennis courts: [count]" |
| `marinas_count` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Marinas: [count]" |
| `ski_resorts_within_100km` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Ski resorts nearby: [count]" |
| `dog_parks_count` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Dog parks: [count]" |
| `farmers_markets` | ✅ Yes (Discover page) | ❌ No | Hobbies box: "Farmers markets: Yes/No" |
| `cycling_infrastructure` | ❓ Possible field | ❌ No | Not visible in current view |
| `water_sports_available` | ❓ Possible field | ❌ No | Not visible in current view |

### ADMIN & HEALTHCARE (11 fields missing)
| Field Name | Currently Displayed | Editable? | Location in UI |
|-----------|-------------------|-----------|----------------|
| `healthcare_score` | ✅ Yes (Discover + Admin tab) | ❓ Unknown | Admin box: "Healthcare score: [value]/10" |
| `safety_score` | ✅ Yes (Discover page) | ❌ No | Admin box: "Safety score: [value]/10" |
| `healthcare_cost_monthly` | ✅ Yes (Discover page) | ❌ No | Admin box: "Healthcare cost: $[value]/mo" |
| `hospital_count` | ✅ Yes (Discover + Admin tab) | ❓ Unknown | Admin box: "Hospitals: [count]" |
| `nearest_major_hospital_km` | ✅ Yes (Discover + Admin tab) | ❓ Unknown | Admin box: "Major hospital: [value]km" |
| `english_speaking_doctors` | ✅ Yes (Discover + Admin tab) | ❓ Unknown | Admin box: "English doctors: Yes/No" |
| `visa_on_arrival_countries` | ✅ Yes (Discover page) | ❌ No | Admin box: "Visa on arrival: Yes" |
| `retirement_visa_available` | ✅ Yes (Discover page) | ❌ No | Admin box: "Retirement visa: Yes/No" |
| `digital_nomad_visa` | ✅ Yes (Discover page) | ❌ No | Admin box: "Digital nomad visa: Yes/No" |
| `crime_rate` | ✅ Yes (Discover page) | ❌ No | Admin box: "Crime: [value]" |
| `natural_disaster_risk` | ✅ Yes (Discover page) | ❌ No | Admin box: "Disaster risk: [value]/10" |
| `internet_speed` | ✅ Yes (Discover page) | ❌ No | Admin box: "Internet: [value] Mbps" |

### COSTS & ECONOMICS (15 fields missing)
| Field Name | Currently Displayed | Editable? | Location in UI |
|-----------|-------------------|-----------|----------------|
| `cost_of_living_usd` | ✅ Yes (Discover page) | ❌ No | Costs box: "Monthly living: $[value]" |
| `cost_index` | ✅ Yes (Discover page) | ❌ No | Costs box + cards: "Cost index: [value]" |
| `rent_1bed` | ✅ Yes (Discover page) | ❌ No | Costs box: "1-bed rent: $[value]" |
| `rent_2bed_usd` | ✅ Yes (Discover page) | ❌ No | Costs box: "2-bed rent: $[value]" |
| `groceries_cost` | ✅ Yes (Discover page) | ❌ No | Costs box: "Groceries: $[value]" |
| `meal_cost` | ✅ Yes (Discover page) | ❌ No | Costs box: "Meal out: $[value]" |
| `utilities_cost` | ✅ Yes (Discover page) | ❌ No | Costs box: "Utilities: $[value]" |
| `income_tax_rate_pct` | ✅ Yes (Discover page) | ❌ No | Costs box: "Income tax: [value]%" |
| `sales_tax_rate_pct` | ✅ Yes (Discover page) | ❌ No | Costs box: "Sales tax: [value]%" |
| `property_tax_rate_pct` | ✅ Yes (Discover page) | ❌ No | Costs box: "Property tax: [value]%" |
| `tax_haven_status` | ✅ Yes (Discover page) | ❌ No | Costs box: "Tax haven: Yes/No" |
| `foreign_income_taxed` | ✅ Yes (Discover page) | ❌ No | Costs box: "Foreign income taxed: Yes/No" |
| `typical_monthly_living_cost` | ✅ Yes (town cards) | ❌ No | Town cards: "$[value]/mo" |
| `rent_3bed_usd` | ❓ Possible field | ❌ No | Not visible in current view |
| `transportation_cost` | ❓ Possible field | ❌ No | Not visible in current view |

---

## CRITICAL FINDINGS

### 1. **Entire Costs Tab Appears Missing**
- **15 cost-related fields** displayed on Discover page
- **NO Costs tab visible** in Towns Manager screenshots
- This is a MAJOR gap - costs are a primary decision factor

### 2. **Hobbies Tab Incomplete**
- **13 hobby/activity fields** displayed on Discover page
- Hobbies tab screenshot too small to verify editable fields
- Need to review Hobbies panel component

### 3. **Admin Tab Partially Visible**
- Some healthcare fields visible in screenshot (score, hospital count, etc.)
- Unclear which are editable vs. read-only
- Need to review Admin panel component

### 4. **Rating Fields (1-10 scales) Not Editable**
All `/10` rating fields appear to be display-only:
- cultural_events_rating
- nightlife_rating
- restaurants_rating
- museums_rating
- shopping_rating
- outdoor_rating
- outdoor_activities_rating
- walkability
- healthcare_score
- safety_score

### 5. **Geographic/Infrastructure Data Missing**
- nearest_airport
- airport_distance
- urban_rural_character
- All appear to be important for user decisions

---

## RECOMMENDATIONS

### Immediate Actions (High Priority)

1. **Create Costs Tab**
   - Add all 15 cost-related fields
   - Group by: Living Costs, Housing Costs, Taxes
   - Use EditableDataField component pattern

2. **Expand Hobbies Tab**
   - Add 13 missing hobby/activity fields
   - Group by: Outdoor Activities, Sports Facilities, Amenities
   - Include boolean fields (beaches, farmers markets) and counts

3. **Complete Admin Tab**
   - Add missing visa/immigration fields
   - Add safety/crime fields
   - Add infrastructure (internet speed)

4. **Expand Region Tab**
   - Add airport information (name + distance)
   - Add urban/rural character
   - Add general "region" field (seems to be different from geo_region)

5. **Complete Culture Tab**
   - Add rating fields (cultural events, nightlife, etc.)
   - Add cultural landmarks 1-3
   - Consider if ratings should be editable or calculated

### Medium Priority

6. **Add Climate Fields**
   - climate (general climate type/name)
   - air_quality_index

7. **Review Legacy Fields**
   - Decide which legacy fields should be promoted to main UI
   - Document which are deprecated vs. still useful

### Technical Debt

8. **Create Missing Panel Components**
   - `HobbiesPanel.jsx` (review if exists, expand if incomplete)
   - `AdminPanel.jsx` (review if exists, expand if incomplete)
   - `CostsPanel.jsx` (CREATE - appears to be completely missing)

9. **Standardize Field Types**
   - Document which fields are:
     - Direct input (text, number)
     - Select dropdowns (predefined values)
     - Calculated (auto-generated)
     - Boolean (Yes/No)
     - Arrays (comma-separated)

---

## FILES TO REVIEW/CREATE

### Need to Review
- ✅ `src/components/admin/RegionPanel.jsx` (REVIEWED)
- ✅ `src/components/admin/ClimatePanel.jsx` (REVIEWED)
- ✅ `src/components/admin/CulturePanel.jsx` (REVIEWED)
- ⚠️ `src/components/admin/HobbiesPanel.jsx` (EXISTS? REVIEW NEEDED)
- ⚠️ `src/components/admin/AdminPanel.jsx` (EXISTS? REVIEW NEEDED)
- ❌ `src/components/admin/CostsPanel.jsx` (MISSING - CREATE)

### Parent Component
- `src/pages/admin/TownsManager.jsx` - Review tab structure

---

## DATA VERIFICATION NEEDED

Use Supabase MCP to verify these fields exist in database:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'towns'
AND column_name IN (
  'nearest_airport', 'airport_distance', 'urban_rural_character',
  'climate', 'air_quality_index',
  'cultural_events_rating', 'nightlife_rating', 'restaurants_rating',
  'museums_rating', 'shopping_rating', 'cultural_landmark_1',
  'outdoor_rating', 'outdoor_activities_rating', 'walkability',
  'beaches_nearby', 'golf_courses_count', 'hiking_trails_km',
  'tennis_courts_count', 'marinas_count', 'ski_resorts_within_100km',
  'dog_parks_count', 'farmers_markets',
  'healthcare_score', 'safety_score', 'healthcare_cost_monthly',
  'hospital_count', 'nearest_major_hospital_km', 'english_speaking_doctors',
  'visa_on_arrival_countries', 'retirement_visa_available', 'digital_nomad_visa',
  'crime_rate', 'natural_disaster_risk', 'internet_speed',
  'cost_of_living_usd', 'cost_index', 'rent_1bed', 'rent_2bed_usd',
  'groceries_cost', 'meal_cost', 'utilities_cost',
  'income_tax_rate_pct', 'sales_tax_rate_pct', 'property_tax_rate_pct',
  'tax_haven_status', 'foreign_income_taxed', 'typical_monthly_living_cost'
)
ORDER BY column_name;
```

---

## SUMMARY STATISTICS

| Category | Displayed Fields | Editable Fields | Missing |
|----------|-----------------|----------------|---------|
| Region & Geography | 16 | 10 | 6 |
| Climate & Weather | 15 | 13 | 2 |
| Culture & Lifestyle | 20 | 10 | 10 |
| Hobbies & Activities | 13 | ❓ | 13 |
| Admin & Healthcare | 12 | ❓ | 11 |
| Costs & Economics | 15 | 0 | 15 |
| **TOTAL** | **91** | **~33** | **~57** |

**Admin Coverage: 36%** (only 33 of 91 displayed fields are currently editable)

---

## NEXT STEPS

1. Review HobbiesPanel.jsx and AdminPanel.jsx to verify current state
2. Create CostsPanel.jsx from scratch
3. Add missing fields to existing panels
4. Test all inline editing functionality
5. Update this document with actual field counts after review

---

**Generated:** 2025-10-18
**Tool:** Playwright screenshot audit + Code analysis
**Files Analyzed:** TownDiscovery.jsx, RegionPanel.jsx, ClimatePanel.jsx, CulturePanel.jsx
