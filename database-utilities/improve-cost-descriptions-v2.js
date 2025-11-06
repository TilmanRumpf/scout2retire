import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Cost level descriptions - more variety
function getCostLevel(cost, type) {
  if (type === 'rent') {
    const levels = [
      { max: 500, terms: ['quite affordable', 'wallet-friendly', 'economical', 'budget-conscious'] },
      { max: 800, terms: ['reasonable', 'fair', 'manageable', 'accessible'] },
      { max: 1200, terms: ['moderate', 'average', 'typical', 'standard'] },
      { max: 1800, terms: ['pricey', 'costly', 'above average', 'elevated'] },
      { max: 2500, terms: ['expensive', 'high-end', 'premium', 'steep'] },
      { max: 99999, terms: ['luxury-level', 'top-tier', 'exclusive', 'premium'] }
    ];
    const level = levels.find(l => cost < l.max);
    return level.terms[Math.floor(Math.random() * level.terms.length)];
  }
  if (type === 'meal') {
    const levels = [
      { max: 10, terms: ['cheap eats', 'bargain dining', 'budget meals', 'inexpensive'] },
      { max: 15, terms: ['affordable dining', 'reasonable prices', 'fair costs', 'good value'] },
      { max: 20, terms: ['moderate dining', 'standard pricing', 'typical costs', 'average'] },
      { max: 30, terms: ['upscale dining', 'higher prices', 'costly meals', 'pricier'] },
      { max: 40, terms: ['expensive dining', 'premium costs', 'high-end', 'steep prices'] },
      { max: 99999, terms: ['luxury dining', 'exclusive pricing', 'top dollar', 'premium rates'] }
    ];
    const level = levels.find(l => cost < l.max);
    return level.terms[Math.floor(Math.random() * level.terms.length)];
  }
  if (type === 'groceries') {
    const levels = [
      { max: 150, terms: ['minimal', 'rock-bottom', 'dirt cheap', 'ultra-low'] },
      { max: 250, terms: ['economical', 'budget', 'reasonable', 'modest'] },
      { max: 350, terms: ['average', 'standard', 'typical', 'moderate'] },
      { max: 450, terms: ['hefty', 'substantial', 'considerable', 'above average'] },
      { max: 99999, terms: ['premium', 'expensive', 'high', 'costly'] }
    ];
    const level = levels.find(l => cost < l.max);
    return level.terms[Math.floor(Math.random() * level.terms.length)];
  }
  if (type === 'utilities') {
    const levels = [
      { max: 80, terms: ['minimal', 'negligible', 'low', 'modest'] },
      { max: 120, terms: ['reasonable', 'fair', 'standard', 'typical'] },
      { max: 180, terms: ['moderate', 'average', 'mid-range', 'regular'] },
      { max: 250, terms: ['substantial', 'considerable', 'notable', 'significant'] },
      { max: 99999, terms: ['high', 'expensive', 'costly', 'steep'] }
    ];
    const level = levels.find(l => cost < l.max);
    return level.terms[Math.floor(Math.random() * level.terms.length)];
  }
}

// Structure patterns - fragments and varied formats
const STRUCTURES = [
  // Pattern 1: Category listing
  (r, m, g, u) => `${r} housing, ${m}, ${g} groceries. Utilities run ${u}.`,
  (r, m, g, u) => `${r} rentals with ${m} and ${g} grocery costs. ${u} utilities.`,
  (r, m, g, u) => `Housing ${r}, restaurants ${m}, groceries ${g}, utilities ${u}.`,
  
  // Pattern 2: Overall + details
  (r, m, g, u) => `Generally ${getOverallLevel(r, m, g, u)} living costs: ${r} rent, ${m}, ${g} shopping. ${u} utility bills.`,
  (r, m, g, u) => `${getOverallLevel(r, m, g, u)} cost of living with ${r} housing and ${m}. Groceries ${g}, utilities ${u}.`,
  (r, m, g, u) => `Living expenses ${getOverallLevel(r, m, g, u)} overall — ${r} apartments, ${m}, ${g} groceries, ${u} utilities.`,
  
  // Pattern 3: Highlight contrasts
  (r, m, g, u) => `${r} housing meets ${m}. Shopping stays ${g} while utilities remain ${u}.`,
  (r, m, g, u) => `Rentals run ${r}, dining out ${m}. Grocery bills ${g}, monthly utilities ${u}.`,
  (r, m, g, u) => `${r} rent prices, ${m} at restaurants. ${g} for weekly shopping, ${u} utility costs.`,
  
  // Pattern 4: Compact fragments
  (r, m, g, u) => `${r} rentals, ${m}, ${g} groceries, ${u} utilities.`,
  (r, m, g, u) => `Housing: ${r}. Dining: ${m}. Groceries: ${g}. Utilities: ${u}.`,
  (r, m, g, u) => `${r} accommodations. ${m}, ${g} shopping, ${u} monthly services.`,
  
  // Pattern 5: Flow style
  (r, m, g, u) => `Living costs span from ${r} housing to ${m}, with ${g} grocery runs and ${u} utilities.`,
  (r, m, g, u) => `Expect ${r} rents alongside ${m}. Groceries stay ${g}, utilities ${u}.`,
  (r, m, g, u) => `${r} apartment costs pair with ${m} and ${g} grocery expenses. ${u} utility charges.`,
  
  // Pattern 6: Mixed emphasis
  (r, m, g, u) => `Notably ${r} housing market. ${m}, ${g} groceries, ${u} utilities round out expenses.`,
  (r, m, g, u) => `${m} complements ${r} housing costs. Grocery shopping runs ${g}, utilities ${u}.`,
  (r, m, g, u) => `Monthly costs: ${r} rent, ${g} groceries, ${u} utilities. Restaurant meals ${m}.`
];

function getOverallLevel(r, m, g, u) {
  const levels = ['affordable', 'reasonable', 'moderate', 'elevated', 'high'];
  // Simple hash to pick consistently but varied
  const hash = (r.length + m.length + g.length + u.length) % levels.length;
  return levels[hash];
}

function generateNaturalCostDescription(town) {
  // Get varied descriptions for each category
  const rentDesc = getCostLevel(town.rent_1bed || 0, 'rent');
  const mealDesc = getCostLevel(town.meal_cost || 0, 'meal');
  const groceriesDesc = getCostLevel(town.groceries_cost || 0, 'groceries');
  const utilitiesDesc = getCostLevel(town.utilities_cost || 0, 'utilities');
  
  // Pick a random structure
  const structure = STRUCTURES[Math.floor(Math.random() * STRUCTURES.length)];
  
  // Generate description
  let description = structure(rentDesc, mealDesc, groceriesDesc, utilitiesDesc);
  
  // Capitalize first letter if needed
  description = description.charAt(0).toUpperCase() + description.slice(1);
  
  return description;
}

async function improveCostDescriptions() {
  console.log('💰 IMPROVING COST DESCRIPTIONS - V2\n');
  console.log('Creating concise, varied descriptions (max 2 sentences)\n');
  
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
  const samples = [];
  
  for (const town of towns) {
    // Generate new description
    const newDescription = generateNaturalCostDescription(town);
    
    // Collect first 15 samples
    if (samples.length < 15) {
      samples.push({
        name: town.town_name,
        country: town.country,
        description: newDescription,
        rent: town.rent_1bed,
        meal: town.meal_cost
      });
    }
    
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
  
  // Show samples to verify variety
  console.log('\n📝 SAMPLE DESCRIPTIONS (checking variety):');
  samples.forEach(s => {
    console.log(`\n${s.name}, ${s.country}:`);
    console.log(`"${s.description}"`);
  });
}

// Run improvement
improveCostDescriptions().catch(console.error);