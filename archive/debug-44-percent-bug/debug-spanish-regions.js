import { calculateRegionScore } from './src/utils/enhancedMatchingAlgorithm.js';

// Tilman's actual preferences
const tilmanPreferences = {
  countries: ["Spain", "Spain"], // He selected Spain twice for some reason
  regions: ["Mediterranean", "Southern Europe"],
  geographic_features: ["Coastal", "coastal"], // He has duplicates here too
  vegetation_types: ["Subtropical", "Mediterranean", "Tropical"]
};

// Example Spanish town (Valencia)
const valenciaData = {
  id: 1,
  name: "Valencia",
  country: "Spain",
  region: "Valencia Community",
  regions: ["EU","Schengen","Iberian Peninsula","Mediterranean","NATO","Pyrenees","Mediterranean Climate","OECD","Europe","Coastal"],
  geo_region: "Southern Europe,Western Europe,Mediterranean",
  geographic_features_actual: ["coastal"],
  vegetation_type_actual: ["mediterranean"]
};

console.log("=== DEBUGGING SPANISH REGION MATCHING ===");
console.log("\nTilman's preferences:");
console.log("Countries:", tilmanPreferences.countries);
console.log("Regions:", tilmanPreferences.regions);
console.log("Geographic features:", tilmanPreferences.geographic_features);
console.log("Vegetation types:", tilmanPreferences.vegetation_types);

console.log("\nValencia town data:");
console.log("Country:", valenciaData.country);
console.log("Regions array:", valenciaData.regions);
console.log("Geo_region:", valenciaData.geo_region);
console.log("Geographic features:", valenciaData.geographic_features_actual);
console.log("Vegetation type:", valenciaData.vegetation_type_actual);

const result = calculateRegionScore(tilmanPreferences, valenciaData);

console.log("\n=== REGION SCORING RESULT ===");
console.log("Score:", result.score + "%");
console.log("Factors:");
result.factors.forEach(factor => {
  console.log(`  - ${factor.factor}: ${factor.score} points`);
});

console.log("\nExpected: Should be close to 100% since:");
console.log("1. Country match: Spain ✓ (40 points)");
console.log("2. Geographic features: coastal ✓ (30 points)");
console.log("3. Vegetation: mediterranean ✓ (20 points)");
console.log("4. Total expected: 90/90 = 100%");

if (result.score < 90) {
  console.log("\n⚠️ BUG DETECTED: Score is unexpectedly low!");
}