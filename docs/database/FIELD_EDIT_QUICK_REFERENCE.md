# Towns Field Editing - Quick Reference Guide

**Created: 2025-10-18**
**For: Admin Panel Users & Developers**

---

## TL;DR: EDIT COVERAGE STATS

| Category | Editable | Displayed Not Edit | Missing | Total |
|----------|----------|------------------|---------|-------|
| Region/Geography | 9 | 4 | 3 | 16 |
| Climate/Weather | 12 | 0 | 20 | 32 |
| Culture/Lifestyle | 9 | 6 | 8 | 23 |
| Costs/Economy | 8 | 8 | 8 | 24 |
| Healthcare | 7 | 1 | 8 | 16 |
| Safety | 5 | 1 | 8 | 14 |
| Infrastructure | 6 | 1 | 8 | 15 |
| Visa/Legal | 6 | 1 | 12 | 19 |
| Hobbies/Activities | 0 | 11 | 8 | 19 |
| Scoring | 0 | 10 | 0 | 10 |
| Other/Metadata | 0 | 15 | 10 | 25 |
| **TOTALS** | **37** | **60** | **70+** | **170+** |

---

## WHERE TO EDIT WHAT

### Region Panel (`src/components/admin/RegionPanel.jsx`)

**Edit these fields here:**
- country
- state_code
- geo_region
- latitude
- longitude
- geographic_features_actual
- vegetation_type_actual
- elevation_meters
- population
- distance_to_ocean_km (legacy)
- water_bodies (legacy)

**NOT editable:**
- nearest_airport
- urban_rural_character

---

### Climate Panel (`src/components/admin/ClimatePanel.jsx`)

**Edit these fields here:**
- avg_temp_summer
- summer_climate_actual
- avg_temp_winter
- winter_climate_actual
- sunshine_level_actual
- sunshine_hours
- precipitation_level_actual
- annual_rainfall
- seasonal_variation_actual
- humidity_level_actual
- humidity_average
- climate_description
- avg_temp_spring (legacy)
- avg_temp_fall (legacy)
- snow_days (legacy)
- uv_index (legacy)
- storm_frequency (legacy)

**NOT editable:**
- Monthly breakdown (jan_avg_temp, jan_precipitation, etc.) - 36 fields!

---

### Culture Panel (`src/components/admin/CulturePanel.jsx`)

**Edit these fields here:**
- primary_language
- english_proficiency_level
- pace_of_life_actual
- social_atmosphere
- traditional_progressive_lean
- expat_community_size
- retirement_community_presence
- cultural_events_frequency
- local_festivals
- cultural_events (legacy)
- local_cuisine (legacy)
- religious_diversity (legacy)
- arts_scene (legacy)
- music_scene (legacy)

**NOT editable:**
- cultural_events_rating
- nightlife_rating
- restaurants_rating
- museums_rating
- shopping_rating
- cultural_landmark_1
- lgbtq_friendly_rating
- pet_friendly_rating

---

### Costs Panel (`src/components/admin/CostsPanel.jsx`)

**Edit these fields here:**
- cost_of_living_usd
- typical_monthly_living_cost
- rent_1bed
- rent_2bed
- home_price_sqm
- utilities_cost
- groceries_index
- restaurant_price_index

**NOT editable:**
- groceries_cost (displayed but not editable!)
- meal_cost (displayed but not editable!)
- food_cost
- transportation_cost
- entertainment_cost
- monthly_budget_min
- monthly_budget_max

---

### Admin/Scoring Panel (`src/components/ScoreBreakdownPanel.jsx`)

#### Healthcare Section
**Edit these:**
- healthcare_score
- hospital_count
- nearest_major_hospital_km
- emergency_services_quality
- english_speaking_doctors
- insurance_availability_rating
- healthcare_cost

**NOT editable:**
- doctor_visit_cost
- pharmacy_availability
- healthcare_system_type
- dentist_availability
- medical_insurance_types

#### Safety Section
**Edit these:**
- safety_score
- crime_rate
- environmental_health_rating
- natural_disaster_risk
- political_stability_rating

**NOT editable:**
- theft_rate
- assault_rate
- women_safety_rating
- lgbtq_safety_rating
- government_corruption_index

#### Infrastructure Section
**Edit these:**
- walkability
- air_quality_index
- regional_airport_distance
- international_airport_distance
- airport_distance
- government_efficiency_rating

**NOT editable:**
- internet_speed (shown but not editable!)
- public_transport_rating
- public_transport_type
- electricity_reliability
- water_quality

#### Legal & Admin Section
**Edit these:**
- visa_requirements
- visa_on_arrival_countries
- retirement_visa_available
- tax_treaty_us
- tax_haven_status
- income_tax_rate_pct
- property_tax_rate_pct
- sales_tax_rate_pct
- foreign_income_taxed
- easy_residency_countries

**NOT editable:**
- digital_nomad_visa (shown but not editable!)
- digital_nomad_requirements
- student_visa_available
- spouse_visa_available
- residency_visa_type
- corporate_tax_rate_pct
- capital_gains_tax_pct

---

### Hobbies Component (`src/components/admin/HobbiesDisplay.jsx`)

**Edit via custom component ONLY:**
- hobbies (main data structure)
- hobbies_* (category data)

**Can VIEW but NOT EDIT:**
- outdoor_rating
- outdoor_activities_rating
- golf_courses_count
- hiking_trails_km
- tennis_courts_count
- marinas_count
- ski_resorts_within_100km
- dog_parks_count
- farmers_markets
- beaches_nearby

---

## THE BIG GAPS: What's COMPLETELY MISSING

### 1. Hobbies/Activities (MAJOR)
These display on town page but NO edit UI exists:
- outdoor_rating
- outdoor_activities_rating
- golf_courses_count
- hiking_trails_km
- tennis_courts_count
- marinas_count
- ski_resorts_within_100km
- dog_parks_count
- farmers_markets
- beaches_nearby
- parks_count
- nature_reserves_count

**FIX:** Create "Hobbies & Activities" panel with EditableDataField for each

### 2. Culture Ratings (Major)
Display in "Culture & Lifestyle Box" but NO edit UI:
- cultural_events_rating
- nightlife_rating
- restaurants_rating
- museums_rating
- shopping_rating
- cultural_landmark_1

**FIX:** Add to Culture Panel

### 3. Cost Details (Major)
Display but NO edit UI:
- groceries_cost
- meal_cost

**FIX:** Add to Costs Panel

### 4. Healthcare Advanced (Moderate)
Not displayed, not editable:
- healthcare_system_type
- doctor_visit_cost
- pharmacy_availability
- medical_insurance_types
- dentist_availability
- hospital_stay_cost_per_night

**FIX:** Create "Healthcare Advanced" panel

### 5. Safety Advanced (Moderate)
Not displayed, not editable:
- women_safety_rating
- lgbtq_safety_rating
- theft_rate
- assault_rate
- government_corruption_index

**FIX:** Create "Safety Details" panel

### 6. Visa/Residency Advanced (Moderate)
Not displayed, not editable:
- digital_nomad_requirements
- student_visa_available
- spouse_visa_available
- residency_visa_type
- corporate_tax_rate_pct
- capital_gains_tax_pct
- dividend_tax_pct

**FIX:** Create "Visa & Legal Details" panel

### 7. Infrastructure Details (Moderate)
Display but NOT editable (internet_speed!), others missing:
- internet_speed (shown but not editable)
- public_transport_rating
- public_transport_type
- public_transport_frequency
- electricity_reliability
- water_quality
- broadband_availability

**FIX:** Create "Infrastructure Details" panel with internet_speed edit

### 8. Climate Monthly Data (Nice to Have)
Completely missing:
- monthly_avg_temp_jan through _dec (12 fields)
- monthly_precipitation_jan through _dec (12 fields)
- monthly_humidity_jan through _dec (12 fields)

**FIX:** Create "Monthly Climate Data" table view

### 9. Images/Media (Nice to Have)
Display but NOT editable:
- image_url_1, image_url_2, ... image_url_N
- photos (array)
- description

**FIX:** Create "Images & Description" panel

### 10. Images/Media (Nice to Have)
Completely hidden:
- data_quality_score
- last_verified_date
- verification_status
- is_archived

**FIX:** Create "Data Management" section for admins

---

## FIELD TYPE QUICK REFERENCE

| Type | Example Fields | Edit UI |
|------|-----------------|---------|
| **Number** | cost_of_living_usd, healthcare_score | Input field |
| **String** | primary_language, description | Text input |
| **Boolean** | retirement_visa_available | Toggle |
| **Select** | pace_of_life_actual | Dropdown |
| **Array** | visa_on_arrival_countries | Tag input |
| **Text (long)** | climate_description | Textarea |
| **Calculated** | overall_score | Display only |
| **Hobbies** | hobbies, hobbies_* | HobbiesDisplay component |

---

## IMPLEMENTATION PRIORITY

**Phase 1 (Critical - Immediate):**
1. Hobbies & Activities Panel (8 missing fields)
2. Culture Ratings Panel updates (6 new fields)
3. Cost Details Panel updates (2 new fields)
4. Infrastructure Panel - Add internet_speed edit

**Phase 2 (High - This Sprint):**
1. Healthcare Advanced Panel (6 fields)
2. Safety Details Panel (5 fields)
3. Visa & Legal Details Panel (7 fields)

**Phase 3 (Nice to Have - Next Sprint):**
1. Monthly Climate Data table
2. Images & Description manager
3. Data Management section

---

## FILE PATHS QUICK LOOKUP

| Component | File Path |
|-----------|-----------|
| Region Editing | `/src/components/admin/RegionPanel.jsx` |
| Climate Editing | `/src/components/admin/ClimatePanel.jsx` |
| Culture Editing | `/src/components/admin/CulturePanel.jsx` |
| Costs Editing | `/src/components/admin/CostsPanel.jsx` |
| Admin/Scoring | `/src/components/ScoreBreakdownPanel.jsx` |
| Hobbies | `/src/components/admin/HobbiesDisplay.jsx` |
| Inline Editor | `/src/components/EditableDataField.jsx` |
| Field Metadata | `/src/utils/admin/adminFieldMetadata.js` |
| Main Manager | `/src/pages/admin/TownsManager.jsx` |
| Column Sets | `/src/utils/townColumnSets.js` |

---

## QUICK ADD: How to Add a New Editable Field

### 1. Create field metadata (if new field)
```javascript
// In src/utils/admin/adminFieldMetadata.js
myNewField: {
  label: 'Display Name',
  type: 'number', // or 'string', 'boolean', 'select', 'array'
  range: '0-100', // or ['option1', 'option2'] for select
  step: 1, // for numbers
  description: 'Help text for admins',
  editable: true,
  unit: 'unit name',
  category: 'section_name',
  validator: (val) => val >= 0 && val <= 100
}
```

### 2. Add to appropriate panel
```javascript
// In RegionPanel.jsx, ClimatePanel.jsx, etc.
<EditableField
  field="myNewField"
  value={town.myNewField}
  label="Display Name"
  type="number"
  range="0-100"
  description="Help text"
/>
```

### 3. Done! EditableDataField handles DB sync automatically

---

## TESTING CHECKLIST

When adding new editable field:
- [ ] Field metadata created
- [ ] Panel component updated
- [ ] Can see field on page
- [ ] Can click to edit
- [ ] Can save new value
- [ ] Database updates
- [ ] Page refreshes show new value
- [ ] Can see in TownDiscovery if displayed

