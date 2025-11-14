# File Inventory & Roles

Generated: November 13, 2025

## Core Scoring Logic (Orchestrators)

### src/utils/scoring/unifiedScoring.js
- **Role:** Main scoring orchestrator - converts user preferences to algorithm format and scores individual towns
- **Key Exports:**
  - `scoreTown(town, userPreferences)` - Score single town
  - `scoreTownsBatch(towns, userPreferences)` - Score multiple towns in parallel
  - `convertPreferencesToAlgorithmFormat(userPreferences)` - Convert DB format to algorithm format
- **Key Imports:** `calculateEnhancedMatch` from calculateMatch.js
- **Type:** Core scoring logic
- **Defines Category Weights:** No (imports from config.js)
- **Defines Match Thresholds:** No (imports from config.js)
- **Hardcoded Values:** None (uses centralized config)
- **Handles Missing Data:** Yes - returns error fallback with 50% default scores

### src/utils/scoring/matchingAlgorithm.js
- **Role:** Entry point for personalized town recommendations - pre-filters database and caches results
- **Key Exports:**
  - `getPersonalizedTowns(userId, options)` - Main recommendation function
  - `clearPersonalizedCache` - Cache management (deprecated, imported from preferenceUtils)
- **Key Imports:** `scoreTownsBatch` from unifiedScoring.js, `getOnboardingProgress` from onboardingUtils
- **Type:** Core scoring logic
- **Features:**
  - Smart pre-filtering (healthcare ≥7 for "good" requirement, safety ≥7)
  - SessionStorage caching with 1-hour TTL
  - Preference hash versioning for cache invalidation
  - Fallback expansion if results <10 towns
- **Handles Missing Data:** Yes - falls back to broader search, uses defaults if no preferences

### src/utils/scoring/core/calculateMatch.js
- **Role:** Main calculation orchestrator - combines all 6 category scores into weighted total
- **Key Exports:**
  - `calculateEnhancedMatch(userPreferences, town)` - Returns match result with scores and factors
- **Key Imports:** All 6 category scorers (region, climate, culture, hobbies, admin, cost)
- **Scoring Formula:** Weighted sum of 6 categories (no bonuses, pure weighted scoring)
- **Category Weights:** Imported from CATEGORY_WEIGHTS config (30% region, 13% climate, 12% culture, 8% hobbies, 18% admin, 19% cost)
- **Match Quality Thresholds:** Excellent ≥85, Very Good ≥70, Good ≥55, Fair ≥40, Poor <40
- **Type:** Core scoring logic
- **Important Logic:** Empty preferences = 100% match ("I don't care" = "I'm happy with anything")

### src/utils/scoring/index.js
- **Role:** Main entry point - re-exports all scoring functions for external use
- **Key Exports:**
  - Main functions: `getPersonalizedTowns`, `scoreTown`, `scoreTownsBatch`, `calculateEnhancedMatch`
  - Config: `CATEGORY_WEIGHTS`, `MATCH_QUALITY`
  - Individual category scorers (for testing/debugging)
- **Type:** Core scoring logic (export hub)

---

## Category Scorers

### src/utils/scoring/categories/regionScoring.js
- **Role:** Scores geographic location match (country, region, features, vegetation)
- **Key Exports:** `calculateRegionScore(preferences, town)`
- **Key Imports:** `parsePreferences`, `stringUtils`, `REGION_SETTINGS` config, `VALID_CATEGORICAL_VALUES`
- **Scoring Points:** 90 points total (converted to 0-100%)
  - Country/Region: 40 points (exact country = 44%, all three components = 100%)
  - Geographic Features: 30 points (with 50% partial credit for related features)
  - Vegetation Type: 20 points (with 50% partial credit for related types)
- **Type:** Category scorer
- **Hardcoded Adjacency Rules:** Yes - relatedFeatures and relatedVegetation maps (coastal→island→lake, mediterranean→subtropical)
- **Hardcoded Constants:** US_STATES list (50 states)
- **Handles Missing Data:** Yes - awards full points if no preferences, 0 points if preferences but no town data
- **Special Logic:** US state matching (Florida as country "United States" + region "Florida")

### src/utils/scoring/categories/climateScoring.js
- **Role:** Scores weather/climate match (summer, winter, humidity, sunshine, precipitation, seasonal)
- **Key Exports:** `calculateClimateScore(preferences, town)`
- **Key Imports:** `parsePreferences`, `mapToStandardValue` (climate inference), `stringUtils`
- **Scoring Points:** 100 points total (115 possible, capped at 100)
  - Summer Temperature: 25 points (numeric or categorical matching)
  - Winter Temperature: 25 points
  - Humidity: 20 points (with gradual 70% adjacency)
  - Sunshine: 20 points (with gradual 70% adjacency)
  - Precipitation: 10 points (with gradual 70% adjacency)
  - Seasonal Preference: 15 points (bonus for alignment)
- **Type:** Category scorer
- **Hardcoded Constants:**
  - TEMP_RANGES (summer: mild 15-24°C, warm 22-32°C, hot 28+°C; winter: cold <5°C, cool 3-15°C, mild 12+°C)
  - Adjacency maps for humidity, sunshine, precipitation
- **Handles Missing Data:** Yes - three-tier fallback (actual field → numeric temp → climate description inference)
- **Special Logic:** Temperature gradual scoring (within 2°C=80%, 5°C=50%, 10°C=20%), seasonal preference matching logic

### src/utils/scoring/categories/cultureScoring.js
- **Role:** Scores cultural/lifestyle match (urban/rural, pace, language, expat, dining, events, museums)
- **Key Exports:** `calculateCultureScore(preferences, town)`
- **Key Imports:** `parsePreferences`, `mapCultureValue` (culture inference), `stringUtils`
- **Scoring Points:** 100 points total
  - Living Environment: 20 points (exact match or 50% for adjacent)
  - Pace of Life: 20 points (exact match or 50% for adjacent)
  - Language Preference: 20 points (speaks local=20, willing to learn=10, English proficiency scaled)
  - Expat Community: 10 points (exact match or 50% for adjacent)
  - Dining & Nightlife: 10 points (importance vs quality matching)
  - Cultural Events: 10 points (frequency matching: exact=10, adjacent=7, far=4)
  - Museums & Arts: 10 points (importance vs quality matching)
- **Type:** Category scorer
- **Hardcoded Adjacency Rules:** Yes - CULTURE_ADJACENCY maps for urban_rural, pace, expat
- **Handles Missing Data:** Yes - partial credit (12 points for living env, 12 for pace, 6 for expat, 5 for dining/events/museums)

### src/utils/scoring/categories/hobbiesScoring.js
- **Role:** Wrapper for hobbies scoring using geographic inference system
- **Key Exports:** `calculateHobbiesScore(preferences, town)`
- **Key Imports:** `calculateHobbiesScore` from hobbiesMatching.js (aliased as calculateNormalizedHobbiesScore)
- **Scoring Points:** Delegated to hobbiesMatching.js (0-100% with tiered weighting)
- **Type:** Category scorer (thin wrapper)
- **Special Feature:** Uses geographic inference instead of towns_hobbies table (avoids 865k relationships)

### src/utils/scoring/categories/adminScoring.js
- **Role:** Scores administrative features (healthcare, safety, government, visa, environmental, stability)
- **Key Exports:** `calculateAdminScore(preferences, town)`
- **Key Imports:** `parsePreferences`, `calculateHealthcareScore`, `calculateSafetyScore`, `ADMIN_QUALITY_VALUES`
- **Scoring Points:** 100 points total
  - Healthcare: 30 points (dynamic calculation from helpers)
  - Safety: 25 points (dynamic calculation from helpers)
  - Government Efficiency: 15 points (gradual based on 0-100 rating)
  - Visa/Residency: 10 points (citizenship-based matching)
  - Environmental Health: 15 points (conditional for sensitive users)
  - Political Stability: 10 points (gradual based on 0-100 rating)
- **Type:** Category scorer
- **Dynamic Calculations:** Healthcare and Safety use external helper functions (not static fields)
- **Hardcoded Constants:** Tax scoring integrated (uses helper), visa/residency logic
- **Handles Missing Data:** Yes - minimal credit (5 for healthcare, 5 for safety, 3 for gov, 2 for stability)
- **Special Logic:** Case-insensitive citizenship matching (critical fix 2025-10-16)

### src/utils/scoring/categories/costScoring.js
- **Role:** Scores cost of living match (overall cost, rent, healthcare, taxes)
- **Key Exports:** `calculateCostScore(preferences, town)`
- **Key Imports:** `parsePreferences`, internal `calculateTaxScore` and `calculateGradualTaxScore`
- **Scoring Points:** 100 points total (115 possible, capped at 100)
  - Base Cost Fit: 70 points (based on cost ratio: 2x+ = 70, 1.5x = 65, 1.2x = 60, etc.)
  - Rent Match Bonus: +20 points (if user set rent AND town has data AND matches)
  - Healthcare Bonus: +10 points (if user set healthcare AND town has data AND matches)
  - Tax Scoring: 15 points (based on sensitivity and rates)
- **Type:** Category scorer
- **CRITICAL FIX (2025-10-17):** Removed "power user penalty" - everyone gets same base points, bonuses awarded for additional matches
- **Hardcoded Tax Thresholds:** Yes - income (10/20/30/40%), property (1/2/3/4%), sales (10/17/22/27%)
- **Handles Missing Data:** Yes - neutral score (20 points) if no cost data

---

## Helper Functions

### Preference Processing

#### src/utils/scoring/helpers/preferenceParser.js
- **Role:** Centralized preference extraction and normalization - eliminates 160+ duplicate access points
- **Key Exports:** `parsePreferences(rawPreferences)` - returns normalized structure with helpers
- **Output Structure:** Returns object with region, climate, culture, hobbies, admin, cost, citizenship + hasAnyPreferences flag
- **Type:** Helper (preference processing)
- **Critical Fix (2025-10-16):** Added `.toLowerCase()` to normalizeArray to prevent case sensitivity bugs (40-hour disaster)
- **Special Functions:**
  - `normalizeArray()` - Handles null/undefined/string/array → lowercase trimmed array
  - `normalizeClimatePreference()` - Filters out empty values ("Optional", "Select Preference")
  - `normalizeSeasonalPreference()` - Handles all empty value conventions
  - `extractMaxFromArrayOrValue()` - For cost fields (max = what user can afford)

### String Utilities

#### src/utils/scoring/helpers/stringUtils.js
- **Role:** Case-insensitive string operations to prevent 40-hour case-sensitivity bug
- **Key Exports:**
  - `compareIgnoreCase(str1, str2)` - Safe null-handling case-insensitive comparison
  - `includesIgnoreCase(haystack, needle)` - Case-insensitive includes
  - `normalize(str)` - Lowercase + trim
  - `arrayIncludesIgnoreCase(array, value)` - Case-insensitive array search
  - `uniqueIgnoreCase(array)` - Unique values preserving first occurrence
- **Type:** Helper (string utilities)
- **Purpose:** Eliminate duplicate .toLowerCase() calls, prevent case bugs

### Array Matching

#### src/utils/scoring/helpers/arrayMatching.js
- **Role:** Array overlap calculation for preference matching
- **Key Exports:**
  - `calculateArrayOverlap(userArray, townArray, maxScore)` - Percentage of user preferences matched
  - `getArrayMatchBreakdown(userArray, townArray)` - Detailed matched/unmatched breakdown
  - `calculateWeightedArrayOverlap(weightedUserArray, townArray, maxScore)` - Weighted matching
- **Key Imports:** `arrayIncludesIgnoreCase` from stringUtils
- **Type:** Helper (array matching)
- **Logic:** No user preferences = perfect score (100%), town has no characteristics = 0

### Gradual Scoring

#### src/utils/scoring/helpers/gradualScoring.js
- **Role:** Gradual scoring logic using adjacency maps (perfect match = 100%, adjacent = 70%, mismatch = 0%)
- **Key Exports:**
  - `calculateGradualMatch(userPref, townActual, maxPoints, adjacencyMap)` - Single preference matching
  - `calculateGradualMatchForArray(userPrefs, townActual, maxPoints, adjacencyMap)` - Best match from array
  - `ADJACENCY_MAPS` - Common adjacency maps for humidity, sunshine, precipitation, pace, social, traditional
- **Type:** Helper (gradual scoring)
- **Scoring:** Exact match = 100%, adjacent = 70%, mismatch = 0%

#### src/utils/scoring/helpers/adjacencyMatcher.js
- **Role:** Centralized adjacency matching with configurable strength
- **Key Exports:**
  - `findAdjacentMatches(userPreference, townValue, adjacencyMap, options)` - Returns {match, strength}
  - `includesIgnoreCase(array, value)` - Case-insensitive array search
  - `getMatchingValues(userPreferences, townValues)` - All matching values
  - `calculateArrayMatchPercentage(userPreferences, townValues)` - Percentage 0-100
- **Type:** Helper (adjacency matching)
- **Configurable:** adjacentStrength option (default 0.7)

### Inference Systems

#### src/utils/scoring/helpers/climateInference.js
- **Role:** Climate data inference when direct data missing
- **Key Exports:**
  - `inferHumidity(town)` - Infers from climate description, rainfall, or geographic features
  - `inferSummerClimate(avgTempSummer)` - Maps temperature to mild/warm/hot
  - `inferWinterClimate(avgTempWinter)` - Maps temperature to cold/cool/mild
  - `mapToStandardValue(value, category)` - Maps town values to GOLDEN onboarding values
  - `getEffectiveClimateValue(town, category)` - Gets actual or inferred value with source tracking
- **Type:** Helper (climate inference)
- **Mappings:** summer (mild/warm/hot), winter (cold/cool/mild), humidity (dry/balanced/humid), sunshine (often_sunny/balanced/less_sunny), precipitation (mostly_dry/balanced/less_dry)
- **Inference Priority:** 1) Climate description keywords, 2) Numeric data (rainfall, temp), 3) Geographic features

#### src/utils/scoring/helpers/cultureInference.js
- **Role:** Culture data mapping from legacy/wrong town values to golden onboarding values
- **Key Exports:**
  - `mapCultureValue(value, category)` - Maps to standard values
  - `getEffectiveCultureValue(town, category)` - Gets mapped value with metadata
- **Type:** Helper (culture inference)
- **Mappings:**
  - pace: relaxed/moderate/fast (maps "very slow"→relaxed, "slow"→relaxed, "very fast"→fast)
  - urban_rural: rural/suburban/urban (maps "small town"→suburban, "large city"→urban)
  - expat: small/moderate/large (maps "none"→small, "very large"→large)

#### src/utils/scoring/helpers/hobbiesInference.js
- **Role:** Geographic inference system for hobby availability (avoids 865k town_hobby relationships)
- **Key Exports:**
  - `inferHobbyAvailability(town, userHobbies)` - Returns available hobbies with confidence
  - `calculateHobbyScore(town, userHobbies)` - Score 0-100 with native match detection
  - `getUrbanSpilloverMultiplier(distanceToUrban)` - Urban amenity proximity bonus
  - `isHobbyLikelyAvailable(town, hobbyName)` - Boolean check for single hobby
- **Type:** Helper (hobbies inference)
- **Inference Logic:**
  - Universal hobbies: 15 activities available everywhere (walking, reading, cooking, etc.)
  - Water sports: Coastal/lake towns or within 100km of ocean (Florida special case)
  - Winter sports: Mountain towns elevation >800m or ski resorts
  - Golf/Tennis: Infrastructure dependent (course/court count)
  - Cultural: Urban areas (population ≥100k) or proximity to urban center
  - Wine: Mediterranean countries or known wine regions
- **Scoring:** Distinctive (town specialty) = 1.0, Inferred (infrastructure) = 0.8, Universal = 0.5
- **Native Match Detection:** STRICT patterns (coastal + water hobbies listed, mountains + skiing listed, etc.) = 85-100% scores

#### src/utils/scoring/helpers/hobbiesMatching.js
- **Role:** Main hobbies matching with geographic inference and tiered weighting
- **Key Exports:**
  - `calculateHobbiesScore(userHobbies, town)` - Score with tiered weighting
  - `getTownHobbyRecommendations(town)` - Get available hobbies for display
- **Key Imports:** `inferHobbyAvailability` and `calculateHobbyScore` from hobbiesInference
- **Type:** Helper (hobbies matching)
- **Tiered Weighting:** Tier 2 (Explore More selections) get 2x weight vs Tier 1 (compound buttons)
- **Legacy Mapping:** Extensive mapping of old compound buttons to expanded hobbies (walking_cycling → walking/cycling/hiking/mountain biking)
- **Travel Bonus:** +15 for frequent travelers with airport, +10 for occasional, -10 penalty for frequent without airport
- **Scoring Range:** 0-100% (capped)

### Dynamic Calculations

#### src/utils/scoring/helpers/calculateHealthcareScore.js
- **Role:** Dynamic healthcare score calculation from 3 components (replaces static field)
- **Key Exports:**
  - `calculateHealthcareScore(town)` - Returns 0-10.0 with 1 decimal
  - `getHealthcareBonusBreakdown(town)` - Detailed component breakdown
- **Type:** Helper (dynamic calculation)
- **Formula:** Quality (0-4.0) + Accessibility (0-3.0) + Cost (0-3.0) = max 10.0
- **Quality Components:**
  - Admin baseline: 0-3.0 (from healthcare_score field)
  - Hospital count bonus: 0-1.0 (≥10=1.0, ≥5=0.7, ≥2=0.5, 1=0.3, 0=0)
- **Accessibility Components:**
  - Distance to hospital: 0-1.5 (≤5km=1.5, ≤15=1.0, ≤30=0.7, ≤50=0.4)
  - Emergency services: 0-1.0 (≥8=1.0, ≥6=0.7, ≥4=0.4, ≥2=0.2)
  - English doctors: 0-0.5
- **Cost Components:**
  - Insurance acceptance: 0-1.5 (widely=1.5, commonly=1.0, limited=0.5)
  - Affordability: 0-1.5 (≤200=1.5, ≤400=1.2, ≤800=0.8, ≤1500=0.4)

#### src/utils/scoring/helpers/calculateSafetyScore.js
- **Role:** Dynamic safety score calculation from 3 components (replaces static field)
- **Key Exports:**
  - `calculateSafetyScore(town)` - Returns 0-10.0 with 1 decimal
  - `getSafetyScoreBreakdown(town)` - Detailed component breakdown
- **Type:** Helper (dynamic calculation)
- **Formula:** Base Safety (0-7.0) + Crime Impact (-1.0 to +2.0) + Environmental (0-1.0) = max 10.0
- **Base Safety:** Admin rating capped at 7.0 (leaves room for bonuses)
- **Crime Impact:** 0-20=+2.0, 21-40=+1.0, 41-60=0.0, 61-80=-0.5, 81-100=-1.0
- **Environmental Components:**
  - Health rating: 0-0.6
  - Natural disaster risk: 0-0.4 (low=0.4, moderate=0.2, high=0)

#### src/utils/scoring/helpers/taxScoring.js
- **Role:** Tax scoring logic (appears to be unused/duplicate - logic integrated into costScoring.js and adminScoring.js)
- **Type:** Helper (potentially deprecated)

---

## Configuration & Constants

### src/utils/scoring/config.js
- **Role:** Central control panel for all scoring configuration
- **Key Exports:**
  - `CATEGORY_WEIGHTS` - Weights add up to 100 (region:30, climate:13, culture:12, hobbies:8, admin:18, cost:19)
  - `MATCH_QUALITY` - Thresholds (Excellent:85, Very Good:70, Good:55, Fair:40, Poor:0)
  - `REGION_SETTINGS` - Points breakdown (country:40, region:30, geo:30, veg:20, partial credit:50%)
  - `CLIMATE_SETTINGS` - Points and temperature ranges
  - `CULTURE_SETTINGS` - Points breakdown (living:20, pace:20, language:20, expat:10, dining:10, events:10, museums:10)
  - `ADMIN_SETTINGS` - Points breakdown (healthcare:30, safety:25, gov:15, visa:10, env:15, stability:10)
  - `COST_SETTINGS` - Points and ratio thresholds
  - `HOBBIES_SETTINGS` - Activity weight:85%, travel bonus:15%
  - `DEBUG` - Feature flags for logging
- **Type:** Configuration
- **Safety Check:** Validates weights add to 100
- **Updated:** 2025-10-15 (increased region from 20% to 30%)

### src/utils/validation/categoricalValues.js
- **Role:** Centralized source of truth for all categorical/enum field values
- **Key Exports:**
  - `VALID_CATEGORICAL_VALUES` - Object with all valid values for each field
  - `isValidCategoricalValue(field, value)` - Validation function
  - `getValidValues(field)` - Get valid values array
  - `getCategoricalFields()` - Get all field names
  - `normalizeCategoricalValue(value)` - Lowercase + trim
- **Type:** Configuration (validation)
- **Fields Defined:** 23 categorical fields including pace_of_life_actual, sunshine_level_actual, precipitation_level_actual, summer_climate_actual, winter_climate_actual, humidity_level_actual, urban_rural_character, expat_community_size, english_proficiency_level, geographic_features_actual, vegetation_type_actual, seasonal_variation_actual, cultural_events_frequency, social_atmosphere, traditional_progressive_lean, etc.
- **MATCHES USER ONBOARDING:** Fields explicitly aligned with onboarding UI (3-value options)
- **Updated:** 2025-11-13 (consolidated cultural_events_frequency from 7 to 3 values, social_atmosphere from 6 to 3, traditional_progressive_lean from 4 to 3)

### src/utils/config/userPreferenceOptions.js
- **Role:** Centralized configuration for user preference options (ADMIN quality levels)
- **Key Exports:**
  - `ADMIN_QUALITY_LEVELS` - Array of {value, label, threshold, description}
  - `ADMIN_QUALITY_VALUES` - Just the values array ['good', 'functional', 'basic']
  - `getAdminQualityThreshold(qualityLevel)` - Get scoring threshold
  - `getAdminQualityLabel(qualityLevel)` - Get display label
- **Type:** Configuration (user preferences)
- **Quality Levels:** good (threshold 7.0), functional (linear 0-10), basic (threshold 4.0)
- **Created:** 2025-11-13 (RULE #2 compliance)

### src/utils/townDataOptions.js
- **Role:** Town field options for dropdown generation (suspected hardcoding violation)
- **Type:** Configuration

### src/utils/townColumnSets.js
- **Role:** Predefined column sets for database queries (prevents SELECT *)
- **Type:** Configuration
- **Column Sets:** minimal (4 cols), basic (8 cols), searchResults, climate, cost, lifestyle, infrastructure, fullDetail (~50 cols)

### src/config/imageConfig.js
- **Role:** Photo system configuration
- **Type:** Configuration
- **Defines:** MAX_PHOTOS_PER_TOWN, file size limits, backward compatibility triggers

---

## Preference Management

### Onboarding Pages
- **src/pages/onboarding/OnboardingCurrentStatus.jsx** - Citizenship, timeline, family
- **src/pages/onboarding/OnboardingRegion.jsx** - Countries, regions, provinces, geographic features, vegetation
- **src/pages/onboarding/OnboardingClimate.jsx** - Summer, winter, humidity, sunshine, precipitation, seasonal
- **src/pages/onboarding/OnboardingCulture.jsx** - Urban/rural, pace, language, expat, dining, events, museums
- **src/pages/onboarding/OnboardingHobbies.jsx** - Activities, interests, Explore More tiered selection
- **src/pages/onboarding/OnboardingAdministration.jsx** - Healthcare, safety, government, visa, taxes
- **src/pages/onboarding/OnboardingCosts.jsx** - Total monthly, rent, healthcare costs, tax sensitivities
- **src/pages/onboarding/OnboardingReview.jsx** - Summary and confirmation
- **src/pages/onboarding/OnboardingComplete.jsx** - Completion screen
- **src/pages/onboarding/OnboardingProgress.jsx** - Progress tracking component
- **src/components/onboarding/SelectionCard.jsx** - Reusable selection card component

### Preference Utilities
- **src/utils/userpreferences/onboardingUtils.js** - Onboarding data fetching and saving
- **src/utils/userpreferences/userPreferences.js** - User preference management
- **src/utils/preferenceUtils.js** - Preference hash generation, cache clearing
- **src/utils/scottyPreferenceValidator.js** - Preference validation

---

## Admin & Testing

### src/pages/admin/AlgorithmManager.jsx
- **Role:** Admin interface for algorithm testing and debugging
- **Type:** Admin UI

### tests/scoring-snapshot.test.js
- **Role:** Snapshot testing for scoring system
- **Type:** Test file

---

## Supporting Files

### src/utils/scoring/matchDisplayHelpers.js
- **Role:** Display formatting for match scores and factors
- **Type:** UI helper

### src/utils/scoring/cacheBuster.js
- **Role:** Cache invalidation for scoring system (version-based)
- **Type:** Cache management

### src/utils/scoring/fieldQueryPatterns.js
- **Role:** Query pattern definitions for database access
- **Type:** Database utility

---

## Summary Statistics

- **Total files analyzed:** 56
- **Core scoring files:** 4 (unifiedScoring.js, matchingAlgorithm.js, calculateMatch.js, index.js)
- **Category scorers:** 6 (region, climate, culture, hobbies, admin, cost)
- **Helper files:** 14 (preferenceParser, stringUtils, arrayMatching, gradualScoring, adjacencyMatcher, climateInference, cultureInference, hobbiesInference, hobbiesMatching, calculateHealthcareScore, calculateSafetyScore, taxScoring, and supporting files)
- **Config files:** 6 (config.js, categoricalValues.js, userPreferenceOptions.js, townDataOptions.js, townColumnSets.js, imageConfig.js)
- **Onboarding pages:** 11 (10 pages + 1 component)
- **Admin/test files:** 2
- **Preference management files:** 4

---

## Key Architecture Decisions

### Primary Entry Point
**`getPersonalizedTowns(userId, options)`** in matchingAlgorithm.js
- Pre-filters database (healthcare, safety thresholds)
- Calls `scoreTownsBatch()` which calls `scoreTown()` for each town
- `scoreTown()` converts preferences and calls `calculateEnhancedMatch()`
- `calculateEnhancedMatch()` calls all 6 category scorers and combines with weights

### Category Weights (CATEGORY_WEIGHTS)
- **Region:** 30% (increased from 20% on 2025-10-15)
- **Climate:** 13% (reduced from 15%)
- **Culture:** 12% (reduced from 15%)
- **Hobbies:** 8% (reduced from 10%)
- **Administration:** 18% (reduced from 20%)
- **Cost:** 19% (reduced from 20%)
- **Total:** 100% (validated in config.js)

### Match Quality Thresholds (MATCH_QUALITY)
- **Excellent:** ≥85
- **Very Good:** ≥70
- **Good:** ≥55
- **Fair:** ≥40
- **Poor:** <40

### Hardcoded Adjacency Rules
**Located in multiple files (DUPLICATION DETECTED):**
- **regionScoring.js:** relatedFeatures (coastal→island→lake, mountain→valley→forest), relatedVegetation (mediterranean→subtropical)
- **climateScoring.js:** humidityAdjacency, sunshineAdjacency, precipitationAdjacency (all 70% partial match)
- **cultureScoring.js:** CULTURE_ADJACENCY (urban_rural, pace, expat - all 50% partial match)
- **gradualScoring.js:** ADJACENCY_MAPS (centralized versions for humidity, sunshine, precipitation, pace, social, traditional)

### Hardcoded Scoring Constants
**Points per category defined in config.js:**
- **REGION_SETTINGS:** country 40, region 30, geo 30, veg 20, partial 50%
- **CLIMATE_SETTINGS:** summer 25, winter 25, humidity 20, sunshine 20, precipitation 10, seasonal 15
- **CULTURE_SETTINGS:** living 20, pace 20, language 20, expat 10, dining 10, events 10, museums 10
- **ADMIN_SETTINGS:** healthcare 30, safety 25, gov 15, visa 10, env 15, stability 10
- **COST_SETTINGS:** overall 40, rent 30 (bonus), healthcare 20 (bonus), tax 15
- **HOBBIES_SETTINGS:** activity weight 85%, travel bonus 15%

### Missing Data Handling
**All category scorers handle missing data:**
- **No preferences:** 100% score (user is flexible)
- **Preferences but no town data:** Partial credit or 0 points
- **Climate/Culture:** 3-tier fallback (actual → numeric → inferred)
- **Healthcare/Safety:** Dynamic calculation with defaults
- **Hobbies:** Geographic inference instead of database lookup

### Dynamic vs Static Scoring
**Dynamic (calculated on-the-fly):**
- Healthcare score (calculateHealthcareScore.js)
- Safety score (calculateSafetyScore.js)
- Hobbies availability (hobbiesInference.js)

**Static (from database fields):**
- All other town characteristics

---

## Critical Fixes & Improvements

### 2025-10-16: Case Sensitivity Fix
- Added `.toLowerCase()` to preferenceParser.js normalizeArray function
- Prevents 40-hour disaster from August 24, 2025 ("Coastal" !== "coastal")

### 2025-10-17: Power User Penalty Removal
- costScoring.js: Removed 50% penalty for setting rent/healthcare costs
- New logic: Everyone gets same base points, bonuses for additional matches
- More cost fields = MORE points, not LESS

### 2025-10-17: Dynamic Healthcare & Safety
- Replaced static database fields with component-based calculations
- Healthcare: Quality + Accessibility + Cost = 0-10.0
- Safety: Base + Crime Impact + Environmental = 0-10.0

### 2025-10-15: Region Weight Increase
- Increased region weight from 20% to 30%
- Makes country selection more impactful
- Other categories proportionally adjusted

### 2025-11-13: Categorical Value Consolidation
- cultural_events_frequency: 7 → 3 values
- social_atmosphere: 6 → 3 values
- traditional_progressive_lean: 4 → 3 values
- seasonal_variation_actual: migrated all 352 towns to match user preference format

### 2025-11-13: Centralized Configuration (RULE #2)
- Created userPreferenceOptions.js for ADMIN_QUALITY_LEVELS
- Moved geographic_features and vegetation_types to categoricalValues.js
- Eliminated hardcoding across multiple files

---

**End of Inventory Report**
