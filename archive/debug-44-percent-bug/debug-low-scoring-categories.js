// Debug script to identify why Spanish towns might be getting low overall scores
// Even though region scoring is 100%, other categories must be very low to get 44% overall

// Tilman's preferences analysis
const tilmanPrefs = {
  // Budget preferences - POTENTIAL ISSUE
  total_monthly_budget: [3000, 2000], // Array format - algorithm might be confused
  max_monthly_rent: [500, 750, 1000],  // Very low rent expectations
  
  // Admin preferences
  healthcare_quality: ["functional"],    // Not demanding
  safety_importance: ["functional"],     // Not demanding
  
  // Climate preferences - POTENTIAL ISSUE  
  summer_climate_preference: ["warm", "hot", "mild"],     // Wants ALL options?
  winter_climate_preference: ["cool", "mild", "cold"],    // Wants ALL options?
  humidity_level: ["balanced", "humid", "dry"],           // Wants ALL options?
  sunshine: ["balanced", "often_sunny", "less_sunny"],    // Wants ALL options?
  precipitation: ["mostly_dry", "balanced"],
  
  // Culture preferences - POTENTIAL ISSUE
  expat_community_preference: ["moderate", "large", "small"], // Wants ALL sizes?
  language_comfort: {
    preferences: ["willing_to_learn", "english_only", "comfortable", "languages_i_speak", "basic_english"], // Too many options?
    already_speak: ["english", "german"]
  },
  
  // Property tax sensitivity
  property_tax_sensitive: true,
  sales_tax_sensitive: true,
};

// Spanish town typical data
const spanishTownData = {
  // Budget - might be the issue
  cost_of_living_usd: 2200,  // Higher than his $2000 budget?
  typical_rent_1bed: 800,    // Much higher than his $500-1000 range
  
  // Taxes - LIKELY ISSUE
  tax_rates: {
    income_tax: 24,      // High income tax
    property_tax: 0.7,   // He's property tax sensitive
    sales_tax: 21       // High sales tax, he's sensitive
  },
  
  // Climate - might have data issues
  summer_climate_actual: "warm",      // Only matches 1 of his 3 preferences
  winter_climate_actual: "mild",      // Only matches 1 of his 3 preferences  
  humidity_level_actual: "balanced",  // Only matches 1 of his 3 preferences
  sunshine_level_actual: "abundant", // Not in his preference list?
  
  // Culture - potential language barrier
  primary_language: "Spanish",        // He wants English or is willing to learn
  english_proficiency_level: "moderate", // Not high
  
  // Hobbies data might be missing
  activities_available: [],           // Empty = low score
  interests_supported: []             // Empty = low score
};

console.log("=== ANALYZING POTENTIAL LOW-SCORING CATEGORIES ===");

// 1. BUDGET CATEGORY ANALYSIS
console.log("\n1. BUDGET CATEGORY (20% weight)");
console.log("User budget: $2000-3000/month (array format)");
console.log("Spanish town cost: $2200/month"); 
console.log("User rent budget: $500-1000/month");
console.log("Spanish town rent: $800/month");

const userMaxBudget = 3000;
const townCost = 2200;
const budgetRatio = userMaxBudget / townCost;
console.log(`Budget ratio: ${budgetRatio.toFixed(2)} (${budgetRatio >= 1.2 ? 'GOOD' : budgetRatio >= 1.0 ? 'OK' : 'TIGHT'})`);

console.log("\n💡 ISSUE: Spain has high taxes:");
console.log("- Income tax: 24% (high for retirees)");
console.log("- Property tax: 0.7% (user is sensitive)");  
console.log("- Sales tax: 21% (user is sensitive, very high)");
console.log("➜ Budget category likely scoring LOW due to tax sensitivity");

// 2. CLIMATE CATEGORY ANALYSIS  
console.log("\n2. CLIMATE CATEGORY (15% weight)");
console.log("User preferences: ALL options selected for most categories");
console.log("This might be causing scoring issues:");
console.log("- Summer: wants [warm, hot, mild] - should be easy to match");
console.log("- Winter: wants [cool, mild, cold] - should be easy to match");
console.log("- Humidity: wants [balanced, humid, dry] - should be easy to match");
console.log("- Sunshine: wants [balanced, often_sunny, less_sunny] - should be easy to match");
console.log("➜ Climate should score HIGH, not causing the issue");

// 3. CULTURE CATEGORY ANALYSIS
console.log("\n3. CULTURE CATEGORY (15% weight)");
console.log("Potential issues:");
console.log("- Language: wants English OR willing to learn, Spanish towns have 'moderate' English");
console.log("- Expat community: wants ANY size, should be flexible");
console.log("➜ Might score medium due to language barrier");

// 4. ADMIN CATEGORY ANALYSIS  
console.log("\n4. ADMIN CATEGORY (20% weight)");
console.log("User wants 'functional' level for everything");
console.log("Spanish towns typically have:");
console.log("- Healthcare: 7-8/10 (good)");  
console.log("- Safety: 7-8/10 (good)");
console.log("➜ Should score HIGH, not the issue");

// 5. HOBBIES CATEGORY ANALYSIS
console.log("\n5. HOBBIES CATEGORY (10% weight)");
console.log("User activities: [walking, swimming, golf, water_sports]");
console.log("If Spanish towns have empty activities_available arrays:");
console.log("➜ Would score LOW (0 points)");

// WEIGHT CALCULATION SIMULATION
console.log("\n=== SIMULATED SCORE BREAKDOWN ===");
const weights = { region: 20, climate: 15, culture: 15, hobbies: 10, admin: 20, budget: 20 };

// Simulate scores based on analysis above
const simulatedScores = {
  region: 100,    // We confirmed this is correct
  climate: 80,    // Should be high with all options selected  
  culture: 60,    // Medium due to language
  hobbies: 10,    // LOW due to missing activity data
  admin: 85,      // High, functional requirements met
  budget: 30      // LOW due to tax sensitivity
};

let totalWeighted = 0;
console.log("\nCategory contributions:");
Object.entries(simulatedScores).forEach(([category, score]) => {
  const weight = weights[category];
  const contribution = (score * weight) / 100;
  const status = score >= 70 ? '✅' : score >= 40 ? '⚠️' : '❌';
  console.log(`${status} ${category}: ${score}% × ${weight}% = ${contribution.toFixed(1)} points`);
  totalWeighted += contribution;
});

console.log(`\nTOTAL SIMULATED SCORE: ${totalWeighted.toFixed(1)} points = ${Math.round(totalWeighted)}%`);

console.log("\n=== CONCLUSION ===");
if (Math.round(totalWeighted) <= 50) {
  console.log("🎯 LIKELY CAUSES OF 44% SCORE:");
  console.log("1. ❌ BUDGET category (~30%) - Spain's high taxes (21% sales, 24% income)");  
  console.log("2. ❌ HOBBIES category (~10%) - Missing activity data in database");
  console.log("3. ⚠️ CULTURE category (~60%) - Language barrier with moderate English");
  console.log("\nThese three categories alone could drag the score down significantly!");
  
  console.log("\n💡 FIXES NEEDED:");
  console.log("1. Check if tax scoring is too harsh for tax-sensitive users");
  console.log("2. Verify Spanish towns have proper activities_available data"); 
  console.log("3. Review language scoring - 'willing to learn' should score higher");
} else {
  console.log("🤔 Simulated score doesn't match 44% - need deeper investigation");
}