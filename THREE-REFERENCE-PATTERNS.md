# THREE REFERENCE TOWN PATTERNS FOR NOVA SCOTIA

Based on SQL dump analysis from visible data

---

## 1. HALIFAX (Already in NS - our template)

**regions array:**
```json
["Canada", "Atlantic Canada", "Maritime", "Atlantic Ocean", "Coastal", "NATO", "Commonwealth", "G7", "G20", "OECD", "Anglo-America", "North America"]
```

**Key scalars:**
- pace_of_life_actual: "moderate"
- summer_climate_actual: "mild"
- winter_climate_actual: "cold"
- humidity_level_actual: "balanced"
- sunshine_level_actual: "balanced"
- precipitation_level_actual: "less_dry"
- seasonal_variation_actual: "extreme"
- typical_monthly_living_cost: 3960
- healthcare_score: 9
- safety_score: 8

**geographic_features_actual:** `["coastal", "plains"]`
**vegetation_type_actual:** `["forest"]`
**languages_spoken:** `["English"]`

---

## 2. PORTO (European UNESCO heritage coastal)

**regions array:**
```json
["EU", "Iberian Peninsula", "Schengen", "Atlantic", "NATO", "Mediterranean Climate", "OECD", "Europe", "Coastal"]
```

**Key scalars:**
- pace_of_life_actual: "relaxed"
- summer_climate_actual: "warm"
- winter_climate_actual: "cool"
- humidity_level_actual: "balanced"
- sunshine_level_actual: "balanced"
- precipitation_level_actual: "less_dry"
- seasonal_variation_actual: "moderate"
- typical_monthly_living_cost: 1889
- healthcare_score: 8
- safety_score: 9

**geographic_features_actual:** `["coastal"]`
**vegetation_type_actual:** `["mediterranean"]`
**languages_spoken:** `["Portuguese", "English"]`
**water_bodies:** `["Douro River", "Atlantic Ocean"]`

---

## 3. EDINBURGH (UK coastal, similar climate to NS)

**regions array:**
```json
["British Isles", "Scotland", "Island", "North Sea", "Coastal", "NATO", "Commonwealth", "Temperate", "G7", "G20", "OECD", "Europe"]
```

**Key scalars:**
- pace_of_life_actual: "moderate"
- summer_climate_actual: "mild"
- winter_climate_actual: "cool"
- humidity_level_actual: "balanced"
- sunshine_level_actual: "less_sunny"
- precipitation_level_actual: "less_dry"
- seasonal_variation_actual: "high"
- typical_monthly_living_cost: 1680
- healthcare_score: 9
- safety_score: 9

**geographic_features_actual:** `["plains"]`
**vegetation_type_actual:** `["forest"]`
**languages_spoken:** `["English"]`
**water_bodies:** `["Firth of Forth", "Water of Leith"]`

---

## PATTERN FOR NOVA SCOTIA TOWNS

### For Lunenburg, Mahone Bay, Chester, Peggy's Cove (coastal):

**regions:**
```json
["Canada", "Atlantic Canada", "Maritime", "Atlantic Ocean", "Coastal", "NATO", "Commonwealth", "G7", "G20", "OECD", "Anglo-America", "North America"]
```

**Scalars:**
- pace_of_life_actual: "relaxed" (NOT "slow" - use allowed value!)
- summer_climate_actual: "mild"
- winter_climate_actual: "cold"
- humidity_level_actual: "balanced"
- sunshine_level_actual: "balanced"
- precipitation_level_actual: "often_rainy"
- seasonal_variation_actual: "extreme"

**geographic_features_actual:** `["coastal", "harbor"]` or `["coastal"]`
**vegetation_type_actual:** `["forest"]`
**languages_spoken:** `["English"]`

---

## CRITICAL FIXES NEEDED:

1. ✅ Use "relaxed" not "slow" for pace_of_life_actual
2. ✅ Match Halifax's regions array exactly
3. ✅ Use proper water_bodies for each town
4. ✅ Add activities_available and interests_supported arrays
5. ✅ Ensure all array fields use proper format

