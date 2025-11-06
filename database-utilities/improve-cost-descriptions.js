import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Cost level descriptions based on actual values
function getCostLevel(cost, type) {
  if (type === 'rent') {
    if (cost < 500) return 'very affordable';
    if (cost < 800) return 'budget-friendly';
    if (cost < 1200) return 'moderate';
    if (cost < 1800) return 'somewhat expensive';
    if (cost < 2500) return 'expensive';
    return 'premium-priced';
  }
  if (type === 'meal') {
    if (cost < 10) return 'remarkably cheap';
    if (cost < 15) return 'very affordable';
    if (cost < 20) return 'reasonably priced';
    if (cost < 30) return 'moderately priced';
    if (cost < 40) return 'somewhat pricey';
    return 'expensive';
  }
  if (type === 'groceries') {
    if (cost < 150) return 'very economical';
    if (cost < 250) return 'budget-friendly';
    if (cost < 350) return 'moderate';
    if (cost < 450) return 'somewhat costly';
    return 'expensive';
  }
  if (type === 'utilities') {
    if (cost < 80) return 'minimal';
    if (cost < 120) return 'reasonable';
    if (cost < 180) return 'moderate';
    if (cost < 250) return 'substantial';
    return 'high';
  }
}

// Templates for cost descriptions - 2-3 sentences, detailed but not precise
const COST_TEMPLATES = {
  veryLow: [
    "Living costs here rank among the most affordable globally, with {rent_level} housing and {meal_level} dining that stretches budgets remarkably far. {grocery_comment}, while {utility_comment}.",
    "This destination offers exceptional value with {rent_level} accommodation costs and {meal_level} restaurant prices that appeal to budget-conscious residents. {grocery_comment}, and {utility_comment}.",
    "Cost of living remains refreshingly low, featuring {rent_level} rental markets and {meal_level} dining scenes. {grocery_comment}, with {utility_comment}."
  ],
  low: [
    "Monthly expenses stay comfortably manageable with {rent_level} housing options and {meal_level} restaurant meals. {grocery_comment}, while {utility_comment}.",
    "Budget-friendly living characterizes this area, where {rent_level} rentals meet {meal_level} dining choices. {grocery_comment}, and {utility_comment}.",
    "Affordable lifestyle costs include {rent_level} accommodation and {meal_level} eating out options. {grocery_comment}, with {utility_comment}."
  ],
  moderate: [
    "Living expenses align with typical international standards, offering {rent_level} housing alongside {meal_level} dining experiences. {grocery_comment}, while {utility_comment}.",
    "Cost structure reflects a balanced market with {rent_level} rental rates and {meal_level} restaurant pricing. {grocery_comment}, and {utility_comment}.",
    "Mid-range pricing characterizes daily life here, from {rent_level} apartments to {meal_level} meal costs. {grocery_comment}, with {utility_comment}."
  ],
  high: [
    "Premium living costs reflect the area's desirability, with {rent_level} housing markets and {meal_level} dining scenes. {grocery_comment}, though {utility_comment}.",
    "Expect elevated expenses across the board, from {rent_level} rentals to {meal_level} restaurant bills. {grocery_comment}, while {utility_comment}.",
    "Higher cost of living encompasses {rent_level} accommodation and {meal_level} dining options. {grocery_comment}, and {utility_comment}."
  ],
  veryHigh: [
    "Among the pricier destinations globally, expect {rent_level} housing costs and {meal_level} restaurant pricing that reflects the premium market. {grocery_comment}, with {utility_comment}.",
    "Substantial living expenses characterize this location, where {rent_level} rentals meet {meal_level} dining costs. {grocery_comment}, and {utility_comment}.",
    "Top-tier pricing spans from {rent_level} housing to {meal_level} restaurant experiences. {grocery_comment}, while {utility_comment}."
  ]
};

// Grocery comments based on level
const GROCERY_COMMENTS = {
  veryLow: [
    "Local markets and supermarkets offer exceptional value for fresh produce and staples",
    "Grocery shopping proves remarkably economical across both local markets and chain stores",
    "Food shopping remains surprisingly affordable with excellent local produce availability"
  ],
  low: [
    "Supermarkets provide good value with reasonable prices for quality groceries",
    "Weekly grocery runs stay budget-friendly with competitive pricing on essentials",
    "Food shopping offers solid value across various market options"
  ],
  moderate: [
    "Grocery costs align with typical expectations for the region",
    "Supermarket prices reflect standard market rates for quality products",
    "Food shopping expenses match regional averages"
  ],
  high: [
    "Grocery shopping requires careful budgeting with elevated prices for many items",
    "Supermarket costs run higher than average, particularly for imported goods",
    "Food shopping demands a larger budget allocation"
  ]
};

// Utility comments based on level
const UTILITY_COMMENTS = {
  low: [
    "utility bills remain pleasantly manageable",
    "monthly utilities stay refreshingly low",
    "basic services come at modest rates"
  ],
  moderate: [
    "utilities reflect typical regional pricing",
    "monthly services align with standard rates",
    "utility costs stay predictable"
  ],
  high: [
    "utility expenses require budget consideration",
    "monthly services add up noticeably",
    "utilities represent a significant monthly expense"
  ]
};

function generateNaturalCostDescription(town) {
  // Calculate overall cost level
  const rent = town.rent_1bed || 0;
  const meal = town.meal_cost || 0;
  const groceries = town.groceries_cost || 0;
  const utilities = town.utilities_cost || 0;
  
  // Get levels for each category
  const rentLevel = getCostLevel(rent, 'rent');
  const mealLevel = getCostLevel(meal, 'meal');
  const groceriesLevel = getCostLevel(groceries, 'groceries');
  const utilitiesLevel = getCostLevel(utilities, 'utilities');
  
  // Determine overall cost tier
  const avgCost = (rent/10 + meal*20 + groceries*3 + utilities*3) / 4;
  let costTier;
  if (avgCost < 400) costTier = 'veryLow';
  else if (avgCost < 700) costTier = 'low';
  else if (avgCost < 1100) costTier = 'moderate';
  else if (avgCost < 1600) costTier = 'high';
  else costTier = 'veryHigh';
  
  // Select template
  const templates = COST_TEMPLATES[costTier];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Select grocery comment
  let groceryTier;
  if (groceries < 150) groceryTier = 'veryLow';
  else if (groceries < 250) groceryTier = 'low';
  else if (groceries < 350) groceryTier = 'moderate';
  else groceryTier = 'high';
  const groceryComments = GROCERY_COMMENTS[groceryTier];
  const groceryComment = groceryComments[Math.floor(Math.random() * groceryComments.length)];
  
  // Select utility comment
  let utilityTier;
  if (utilities < 100) utilityTier = 'low';
  else if (utilities < 180) utilityTier = 'moderate';
  else utilityTier = 'high';
  const utilityComments = UTILITY_COMMENTS[utilityTier];
  const utilityComment = utilityComments[Math.floor(Math.random() * utilityComments.length)];
  
  // Fill template
  let description = template
    .replace('{rent_level}', rentLevel)
    .replace('{meal_level}', mealLevel)
    .replace('{grocery_comment}', groceryComment)
    .replace('{utility_comment}', utilityComment);
  
  return description;
}

async function improveCostDescriptions() {
  console.log('💰 IMPROVING COST DESCRIPTIONS\n');
  console.log('Creating detailed but non-precise descriptions (2-3 sentences)\n');
  
  // Get all towns with cost data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .not('rent_1bed', 'is', null)
    .order('country', { ascending: true });
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  
  for (const town of towns) {
    // Generate new description
    const newDescription = generateNaturalCostDescription(town);
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ cost_description: newDescription })
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.town_name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('COST DESCRIPTION IMPROVEMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show samples of improvements
  console.log('\n📝 SAMPLE IMPROVED DESCRIPTIONS:');
  const { data: samples } = await supabase
    .from('towns')
    .select('town_name, country, cost_description, rent_1bed, meal_cost')
    .not('cost_description', 'is', null)
    .limit(10);
    
  samples.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Rent: $${s.rent_1bed}, Meal: $${s.meal_cost}):`);
    console.log(`"${s.cost_description}"`);
  });
}

// Run improvement
improveCostDescriptions().catch(console.error);