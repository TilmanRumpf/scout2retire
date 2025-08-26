# Onboarding to Town Data Mapping Analysis

## Complete Mapping Table

### 1. CURRENT STATUS Step

| Onboarding Question | Expected Town Field | Actual Town Field | Status | Notes |
|-------------------|-------------------|-------------------|---------|--------|
| Retirement Timeline | Visa/residency info | ❌ None | ❌ | No visa duration/requirements data |
| Target Retirement Date | - | - | N/A | Used for planning, not matching |
| Family Situation | Housing types, family services | ❌ None | ❌ | No family-friendly indicators |
| Citizenship | Visa requirements by country | ❌ None | ❌ | No visa/residency requirements |
| Pet Owner | Pet-friendly info | ❌ None | ❌ | No pet policies/vets data |

### 2. REGION PREFERENCES Step

| Onboarding Question | Expected Town Field | Actual Town Field | Status | Notes |
|-------------------|-------------------|-------------------|---------|--------|
| Region Selection | Region/continent data | `regions` array | ✅ | Properly aligned |
| Country Selection | Country field | `country` | ✅ | Exact match |
| Province Selection | State/province field | `region` | ⚠️ | Field exists but inconsistently populated |
| Geographic Features (Coastal, Mountains, etc.) | Geographic tags | ❌ None | ❌ | No geographic feature tags |
| Vegetation Types | Climate/vegetation data | ❌ None | ❌ | Only basic climate field exists |

### 3. CLIMATE PREFERENCES Step

| Onboarding Question | Expected Town Field | Actual Town Field | Status | Notes |
|-------------------|-------------------|-------------------|---------|--------|
| Summer Climate (Mild/Warm/Hot) | Summer temperature | `avg_temp_summer` | ✅ | Properly mapped |
| Winter Climate (Cold/Cool/Mild) | Winter temperature | `avg_temp_winter` | ✅ | Properly mapped |
| Humidity Level | Humidity data | ❌ None | ❌ | No humidity data |
| Sunshine Preference | Sunshine hours | `sunshine_hours` | ⚠️ | Exists but sparsely populated |
| Precipitation | Rainfall data | `annual_rainfall` | ⚠️ | Exists but sparsely populated |
| Seasonal Preference | Seasonal variation | ❌ None | ❌ | Cannot calculate seasonal variation |

### 4. CULTURE PREFERENCES Step

| Onboarding Question | Expected Town Field | Actual Town Field | Status | Notes |
|-------------------|-------------------|-------------------|---------|--------|
| Living Environment (Rural/Suburban/Urban) | City size/type | `population` | ⚠️ | Only population, no urban/rural classification |
| Pace of Life | Lifestyle descriptor | `lifestyle_description` | ⚠️ | Text field, not structured |
| Social Preference | Social scene data | ❌ None | ❌ | No social activity metrics |
| Expat Community Size | Expat population | `expat_population` | ⚠️ | Text field, not quantified |
| Language Preference | Language data | ❌ None | ❌ | No primary language field |
| Languages Spoken | Language requirements | ❌ None | ❌ | No language data |
| Dining & Nightlife Priority | Restaurant/nightlife | `nightlife_rating`, `restaurants_rating` | ✅ | Properly aligned |
| Events & Concerts Priority | Cultural events | `cultural_rating` | ⚠️ | Generic cultural rating |
| Museums & Arts Priority | Museums | `museums_rating` | ✅ | Direct match |

### 5. HOBBIES Step

| Onboarding Question | Expected Town Field | Actual Town Field | Status | Notes |
|-------------------|-------------------|-------------------|---------|--------|
| Physical Activities (Golf, Tennis, etc.) | Activity facilities | `outdoor_rating` | ⚠️ | Generic outdoor rating only |
| Walking | Walkability | `walkability` | ✅ | Direct match |
| Swimming | Beach/pool access | ❌ None | ❌ | No swimming facilities data |
| Water Sports | Water activities | ❌ None | ❌ | No water sports data |
| Winter Sports | Winter facilities | ❌ None | ❌ | No winter sports data |
| Interests (Arts, Music, etc.) | Cultural venues | `cultural_rating` | ⚠️ | Generic rating only |
| Travel Frequency | Transportation | `nearest_airport`, `airport_distance` | ⚠️ | Airport data only |
| Outdoor Activities Importance | Outdoor options | `outdoor_rating` | ⚠️ | Generic rating |
| Shopping Importance | Shopping facilities | ❌ None | ❌ | No shopping data |
| Wellness & Spas | Wellness facilities | ❌ None | ❌ | No spa/wellness data |

### 6. ADMINISTRATION Step

| Onboarding Question | Expected Town Field | Actual Town Field | Status | Notes |
|-------------------|-------------------|-------------------|---------|--------|
| Healthcare Quality | Healthcare score | `healthcare_score` | ✅ | Direct match |
| Healthcare Access Level | Hospital data | `hospital_count` | ⚠️ | Count only, no specialties |
| Ongoing Treatment Needs | Specialist care | ❌ None | ❌ | No specialty care data |
| Environmental Health | Air quality, humidity | ❌ None | ❌ | No environmental health data |
| Health Insurance | Insurance quality | ❌ None | ❌ | No insurance system data |
| Safety Preference | Safety score | `safety_score` | ✅ | Direct match |
| Emergency Services | Emergency quality | ❌ None | ❌ | No emergency services data |
| Political Stability | Stability data | ❌ None | ❌ | No political stability metrics |
| Tax System | Tax rates | ❌ None | ❌ | No tax data |
| Government Efficiency | Gov efficiency | ❌ None | ❌ | No government metrics |
| Visa Process | Visa ease | ❌ None | ❌ | No visa process data |
| Stay Duration | Visa options | ❌ None | ❌ | No visa duration options |
| Residency Path | Residency options | ❌ None | ❌ | No residency path data |

### 7. COSTS Step

| Onboarding Question | Expected Town Field | Actual Town Field | Status | Notes |
|-------------------|-------------------|-------------------|---------|--------|
| Total Monthly Budget | Cost of living | `cost_index` | ✅ | Direct match |
| Housing Budget (Rent) | Rental costs | `rent_1bed` | ⚠️ | Only 1-bedroom data |
| Home Purchase Budget | Property prices | ❌ None | ❌ | No property purchase data |
| Healthcare Budget | Healthcare costs | `healthcare_cost` | ⚠️ | Exists but sparsely populated |
| Local Mobility | Transport options | `public_transport_quality` | ⚠️ | Only public transport rating |
| Regional Mobility | Regional transport | ❌ None | ❌ | No regional transport data |
| International Mobility | Airport access | `nearest_airport`, `airport_distance` | ✅ | Properly mapped |
| Property Tax Sensitivity | Property tax rates | ❌ None | ❌ | No property tax data |
| Sales Tax Sensitivity | Sales tax rates | ❌ None | ❌ | No sales tax data |
| Income Tax Sensitivity | Income tax rates | ❌ None | ❌ | No income tax data |

## Critical Analysis

### 1. Major Data Gaps (Onboarding data that CAN'T be matched)

**CRITICAL MISSING DATA:**
1. **Visa & Residency Requirements** - Users specify citizenship and residency goals, but no town has visa/residency data
2. **Tax Information** - Users indicate tax sensitivity, but no tax data exists
3. **Language Information** - Users specify language preferences and abilities, but towns lack language data
4. **Environmental Health** - Users with health conditions need air quality/humidity data, none exists
5. **Specific Activity Facilities** - Users select specific activities (golf, tennis, swimming) but towns only have generic ratings

**IMPORTANT MISSING DATA:**
1. **Family Services** - No data on schools, family facilities
2. **Pet Services** - No veterinary or pet-friendly information
3. **Housing Variety** - Only 1-bedroom rent data, no purchase prices or other housing types
4. **Healthcare Specialties** - No data on specific medical specialties
5. **Geographic Features** - No tags for coastal, mountain, island locations

### 2. Underutilized Town Data

These fields exist in towns but aren't fully utilized:
- `infrastructure_description` - Could match infrastructure preferences
- `internet_speed` - Important for remote workers but not asked
- `natural_disaster_risk` - Safety concern not addressed in onboarding
- `crime_rate` - Text field that could be better utilized
- Cultural landmarks - Could enhance cultural matching

### 3. Data Quality Issues

**Inconsistent Data:**
- `expat_population` is text ("Small", "Large") instead of numbers
- Many numeric fields are sparsely populated (sunshine_hours, rainfall)
- Text descriptions instead of structured data for many attributes

**Missing Standardization:**
- No standard scales across different metrics
- Mixed units (some costs in USD, some not specified)
- Inconsistent NULL vs 0 values

### 4. Algorithm Limitations

The matching algorithm tries to compensate but faces challenges:
- Uses fuzzy matching for text fields (less accurate)
- Falls back to generic ratings when specific data is missing
- Cannot match on critical factors like visa requirements
- Limited pre-filtering options due to missing indexed fields

## Recommendations

### Immediate Fixes (High Impact, Low Effort)
1. **Add language field** to towns table - Critical for expat success
2. **Add visa_friendly_for** array field - List countries with easy visa access
3. **Structure expat_population** - Convert to numeric scale or enum
4. **Add geographic_features** array - Tag towns as coastal, mountain, etc.

### Medium-Term Improvements
1. **Tax data collection** - Add basic tax rate fields
2. **Healthcare specialties** - Add available medical specialties
3. **Activity facilities** - Add specific activity availability (golf courses, etc.)
4. **Housing diversity** - Add more housing cost options
5. **Environmental data** - Add air quality index and humidity levels

### Long-Term Enhancements
1. **Create activity_facilities table** - Detailed facility information
2. **Create visa_requirements table** - Country-specific visa rules
3. **Enhance climate data** - Monthly temperature/rainfall patterns
4. **Add family_services table** - Schools, childcare, family activities
5. **Create transportation table** - Detailed transport options

### Algorithm Adjustments
1. **Reduce region weight** when geographic features are important
2. **Increase "unknown data" penalty** to favor well-documented towns
3. **Add "data confidence" score** based on completeness
4. **Implement "must-have" filters** for critical requirements
5. **Better NULL handling** - Distinguish "unknown" from "not applicable"

## Matching Algorithm Current Implementation

The algorithm currently uses these mappings:

**Budget Matching (25% weight):**
- ✅ Uses `cost_index` vs user's `total_monthly_budget`
- ⚠️ Ignores housing budget preferences
- ❌ No tax consideration despite user preferences

**Administration Matching (20% weight):**
- ✅ Uses `healthcare_score` vs healthcare quality preference
- ✅ Uses `safety_score` vs safety preference
- ❌ Ignores visa, tax, government efficiency preferences
- ❌ No political stability or emergency services data

**Climate Matching (15% weight):**
- ✅ Uses `avg_temp_summer/winter` for temperature preferences
- ⚠️ Uses basic `climate` field for type matching
- ❌ No humidity matching despite user preference
- ❌ Limited sunshine/rainfall data usage

**Culture Matching (15% weight):**
- ✅ Uses `nightlife_rating`, `museums_rating`, `restaurants_rating`
- ⚠️ Uses population for urban/rural (crude approximation)
- ❌ No language matching
- ❌ No pace of life data

**Hobbies Matching (15% weight):**
- ✅ Uses `walkability` for walking preference
- ⚠️ Uses generic `outdoor_rating` for all activities
- ❌ No specific activity matching

**Region Matching (10% weight):**
- ✅ Exact country matching
- ✅ Region/continent matching via `regions` array
- ❌ No geographic features matching

## Summary

**Current Coverage: ~30% of onboarding preferences can be properly matched**

The system collects rich, detailed preferences but can only match against basic town data. Critical gaps in visa requirements, language, and specific amenities severely limit the matching quality. The algorithm does its best with available data but cannot fulfill many user requirements.