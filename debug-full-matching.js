// Full debugging script to test the complete matching pipeline with Tilman's data

import { calculateEnhancedMatch } from './src/utils/enhancedMatchingAlgorithm.js';
import { convertPreferencesToAlgorithmFormat } from './src/utils/unifiedScoring.js';

// Tilman's actual preferences from database
const tilmanDbPreferences = {
  "retirement_status": "retiring_soon",
  "target_retirement_year": 2030,
  "timeline_flexibility": "",
  "primary_citizenship": "us",
  "secondary_citizenship": "de",
  "visa_concerns": false,
  "family_status": "family",
  "partner_agreement": null,
  "bringing_children": false,
  "bringing_pets": true,
  "current_location": null,
  "moving_motivation": null,
  "regions": ["Mediterranean", "Southern Europe"],
  "countries": ["Spain", "Spain"], // Duplicates in DB
  "provinces": ["Any Province"],
  "geographic_features": ["Coastal", "coastal"], // Duplicates/case issues
  "vegetation_types": ["Subtropical", "Mediterranean", "Tropical"],
  "summer_climate_preference": ["warm", "hot", "mild"],
  "winter_climate_preference": ["cool", "mild", "cold"],
  "humidity_level": ["balanced", "humid", "dry"],
  "sunshine": ["balanced", "often_sunny", "less_sunny"],
  "precipitation": ["mostly_dry", "balanced"],
  "seasonal_preference": "summer_focused",
  "expat_community_preference": ["moderate", "large", "small"],
  "language_comfort": {
    "preferences": ["willing_to_learn", "english_only", "comfortable", "languages_i_speak", "basic_english"],
    "already_speak": ["english", "german"]
  },
  "cultural_importance": {
    "museums": 3,
    "cultural_events": 3,
    "dining_nightlife": 3
  },
  "lifestyle_preferences": {
    "urban_rural": ["suburban", "rural"],
    "pace_of_life": ["moderate", "slow", "relaxed"],
    "social_preference": "balanced",
    "traditional_progressive": ""
  },
  "activities": ["walking", "swimming", "golf", "walking_cycling", "water_sports"],
  "interests": ["music", "reading", "cooking", "arts", "cooking_wine"],
  "travel_frequency": "occasional",
  "lifestyle_importance": {
    "shopping": 3,
    "wellness": 3,
    "cultural_events": 3,
    "outdoor_activities": 4
  },
  "healthcare_quality": ["functional"],
  "health_considerations": {
    "healthcare_access": "general_practitioner",
    "ongoing_treatment": "",
    "environmental_health": ""
  },
  "insurance_importance": ["functional"],
  "safety_importance": ["functional"],
  "emergency_services": ["functional"],
  "political_stability": ["functional"],
  "tax_preference": ["functional"],
  "government_efficiency": ["functional"],
  "visa_preference": ["functional"],
  "stay_duration": ["long", "medium"],
  "residency_path": ["residence"],
  "monthly_healthcare_budget": 650,
  "mobility": {
    "local": ["walk_bike", "public_transit", "need_car"],
    "regional": ["train_access", "need_car"],
    "international": ["major_airport", "regional_airport"]
  },
  "property_tax_sensitive": true,
  "sales_tax_sensitive": true,
  "income_tax_sensitive": false,
  "total_monthly_budget": [3000, 2000],
  "max_monthly_rent": [500, 750, 1000],
  "max_home_price": [320000, 100000, 200000, 300000]
};

// Spanish town example (Valencia)
const valenciaData = {
  id: 1,
  name: "Valencia",
  country: "Spain",
  region: "Valencia Community",
  regions: ["EU","Schengen","Iberian Peninsula","Mediterranean","NATO","Pyrenees","Mediterranean Climate","OECD","Europe","Coastal"],
  geo_region: "Southern Europe,Western Europe,Mediterranean",
  geographic_features_actual: ["coastal"],
  vegetation_type_actual: ["mediterranean"],
  
  // Climate data
  avg_temp_summer: 26,
  avg_temp_winter: 12,
  summer_climate_actual: "warm",
  winter_climate_actual: "mild", 
  humidity_level_actual: "balanced",
  sunshine_level_actual: "abundant",
  precipitation_level_actual: "mostly_dry",
  
  // Culture data
  urban_rural_character: "suburban",
  pace_of_life_actual: "moderate",
  primary_language: "Spanish",
  english_proficiency_level: "moderate",
  expat_community_size: "moderate",
  dining_nightlife_level: 3,
  cultural_events_level: 3,
  museums_level: 3,
  
  // Admin data
  healthcare_score: 8,
  safety_score: 8,
  government_efficiency_rating: 75,
  political_stability_rating: 85,
  
  // Budget data
  cost_of_living_usd: 2200,
  typical_monthly_living_cost: 2200,
  typical_rent_1bed: 800,
  healthcare_cost_monthly: 150,
  tax_rates: {
    income_tax: 24,
    property_tax: 0.7,
    sales_tax: 21
  }
};

console.log("=== DEBUGGING FULL MATCHING PIPELINE ===");

// Step 1: Convert database preferences to algorithm format
console.log("\n1. CONVERTING DATABASE PREFERENCES TO ALGORITHM FORMAT");
const convertedPrefs = convertPreferencesToAlgorithmFormat(tilmanDbPreferences);
console.log("Converted preferences:");
console.log("- Region preferences:", convertedPrefs.region_preferences);
console.log("- Climate preferences:", convertedPrefs.climate_preferences);
console.log("- Culture preferences:", convertedPrefs.culture_preferences);
console.log("- Admin preferences:", convertedPrefs.admin_preferences);
console.log("- Budget preferences:", convertedPrefs.budget_preferences);

// Step 2: Run the matching algorithm
console.log("\n2. RUNNING ENHANCED MATCHING ALGORITHM");
const matchResult = await calculateEnhancedMatch(convertedPrefs, valenciaData);

console.log("\n=== MATCHING RESULT ===");
console.log("Overall match score:", matchResult.match_score + "%");
console.log("Match quality:", matchResult.match_quality);
console.log("\nCategory scores:");
Object.entries(matchResult.category_scores).forEach(([category, score]) => {
  console.log(`  ${category}: ${score}%`);
});

console.log("\nTop factors:");
matchResult.top_factors.slice(0, 10).forEach((factor, i) => {
  console.log(`  ${i + 1}. ${factor.factor}: ${factor.score} points`);
});

// Step 3: Analyze the region scoring specifically
console.log("\n3. DETAILED REGION ANALYSIS");
const regionFactors = matchResult.match_factors.filter(f => f.factor.toLowerCase().includes('country') || 
  f.factor.toLowerCase().includes('region') || 
  f.factor.toLowerCase().includes('geographic') || 
  f.factor.toLowerCase().includes('vegetation') ||
  f.factor.toLowerCase().includes('open to'));

console.log("Region-related factors:");
regionFactors.forEach(factor => {
  console.log(`  - ${factor.factor}: ${factor.score} points`);
});

// Expected vs actual
console.log("\n=== ANALYSIS ===");
console.log("Region score:", matchResult.category_scores.region + "%");

const expectedRegionScore = 40 + 30 + 20; // Country + geo + vegetation = 90/90 = 100%
console.log("Expected region score: 100% (Country match + Coastal + Mediterranean)");

if (matchResult.category_scores.region < 90) {
  console.log("⚠️ REGION SCORE IS LOWER THAN EXPECTED");
  console.log("This suggests an issue in the preference conversion or region matching logic");
} else {
  console.log("✅ Region score looks correct");
}

// Check overall score
console.log("\nOverall match score:", matchResult.match_score + "%");
if (matchResult.match_score < 70) {
  console.log("⚠️ OVERALL SCORE IS LOW - likely due to other categories");
  console.log("Categories dragging down the score:");
  Object.entries(matchResult.category_scores).forEach(([category, score]) => {
    if (score < 60) {
      console.log(`  ${category}: ${score}% (LOW)`);
    }
  });
}

// Show the weighting calculation
console.log("\n4. WEIGHT CALCULATION CHECK");
const CATEGORY_WEIGHTS = {
  region: 20,      
  climate: 15,     
  culture: 15,     
  hobbies: 10,     
  admin: 20,       
  budget: 20       
};

let weightedTotal = 0;
Object.entries(matchResult.category_scores).forEach(([category, score]) => {
  const weight = CATEGORY_WEIGHTS[category] || 0;
  const weighted = (score * weight) / 100;
  console.log(`${category}: ${score}% × ${weight}% weight = ${weighted.toFixed(1)} points`);
  weightedTotal += weighted;
});

console.log(`Total weighted score: ${weightedTotal.toFixed(1)}/100 = ${Math.round(weightedTotal)}%`);
console.log(`Algorithm returned: ${matchResult.match_score}%`);

if (Math.abs(weightedTotal - matchResult.match_score) > 1) {
  console.log("⚠️ WEIGHT CALCULATION MISMATCH!");
} else {
  console.log("✅ Weight calculation matches");
}