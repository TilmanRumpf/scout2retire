import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Round UP to nearest 10
function roundUpToNearest10(value) {
  if (value === null || value === undefined) return null;
  return Math.ceil(value / 10) * 10;
}

async function roundCostFields() {
  console.log('💰 ROUNDING COST FIELDS UP TO NEAREST 10\n');
  console.log('Fields: rent_1bed, meal_cost, groceries_cost, utilities_cost\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, town_name, country, rent_1bed, meal_cost, groceries_cost, utilities_cost');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let rentUpdated = 0;
  let mealUpdated = 0;
  let groceriesUpdated = 0;
  let utilitiesUpdated = 0;
  let noChange = 0;
  let errorCount = 0;
  
  const samples = [];
  
  for (const town of towns) {
    const oldRent = town.rent_1bed;
    const oldMeal = town.meal_cost;
    const oldGroceries = town.groceries_cost;
    const oldUtilities = town.utilities_cost;
    
    const newRent = roundUpToNearest10(oldRent);
    const newMeal = roundUpToNearest10(oldMeal);
    const newGroceries = roundUpToNearest10(oldGroceries);
    const newUtilities = roundUpToNearest10(oldUtilities);
    
    // Check if any changes needed
    const rentChanged = oldRent !== newRent && oldRent !== null;
    const mealChanged = oldMeal !== newMeal && oldMeal !== null;
    const groceriesChanged = oldGroceries !== newGroceries && oldGroceries !== null;
    const utilitiesChanged = oldUtilities !== newUtilities && oldUtilities !== null;
    
    if (!rentChanged && !mealChanged && !groceriesChanged && !utilitiesChanged) {
      noChange++;
      continue;
    }
    
    // Prepare update data
    const updateData = {};
    if (rentChanged) {
      updateData.rent_1bed = newRent;
      rentUpdated++;
    }
    if (mealChanged) {
      updateData.meal_cost = newMeal;
      mealUpdated++;
    }
    if (groceriesChanged) {
      updateData.groceries_cost = newGroceries;
      groceriesUpdated++;
    }
    if (utilitiesChanged) {
      updateData.utilities_cost = newUtilities;
      utilitiesUpdated++;
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update(updateData)
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.town_name}: ${updateError.message}`);
      errorCount++;
    } else {
      // Collect samples for display
      if (samples.length < 15 && (rentChanged || mealChanged || groceriesChanged || utilitiesChanged)) {
        samples.push({
          name: town.town_name,
          country: town.country,
          oldRent: oldRent,
          newRent: newRent,
          oldMeal: oldMeal,
          newMeal: newMeal,
          oldGroceries: oldGroceries,
          newGroceries: newGroceries,
          oldUtilities: oldUtilities,
          newUtilities: newUtilities,
          rentChanged: rentChanged,
          mealChanged: mealChanged,
          groceriesChanged: groceriesChanged,
          utilitiesChanged: utilitiesChanged
        });
      }
    }
  }
  
  // Show sample changes
  console.log('📊 SAMPLE CHANGES:');
  samples.forEach(s => {
    console.log(`\n${s.name}, ${s.country}:`);
    if (s.rentChanged) {
      console.log(`  Rent (1bed): $${s.oldRent} → $${s.newRent} (+$${s.newRent - s.oldRent})`);
    }
    if (s.mealChanged) {
      console.log(`  Meal cost: $${s.oldMeal} → $${s.newMeal} (+$${s.newMeal - s.oldMeal})`);
    }
    if (s.groceriesChanged) {
      console.log(`  Groceries: $${s.oldGroceries} → $${s.newGroceries} (+$${s.newGroceries - s.oldGroceries})`);
    }
    if (s.utilitiesChanged) {
      console.log(`  Utilities: $${s.oldUtilities} → $${s.newUtilities} (+$${s.newUtilities - s.oldUtilities})`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('COST FIELDS ROUNDING COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Rent (1bed) updated: ${rentUpdated} towns`);
  console.log(`✅ Meal cost updated: ${mealUpdated} towns`);
  console.log(`✅ Groceries updated: ${groceriesUpdated} towns`);
  console.log(`✅ Utilities updated: ${utilitiesUpdated} towns`);
  console.log(`⏭️  No change needed: ${noChange} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  const totalFieldsUpdated = rentUpdated + mealUpdated + groceriesUpdated + utilitiesUpdated;
  console.log(`\n📊 Total field updates: ${totalFieldsUpdated}`);
  
  // Verify results
  const { data: verification } = await supabase
    .from('towns')
    .select('rent_1bed, meal_cost, groceries_cost, utilities_cost')
    .limit(20);
    
  console.log('\n✅ VERIFICATION (all should end in 0):');
  let issueCount = 0;
  verification.forEach(t => {
    const rentOk = !t.rent_1bed || t.rent_1bed % 10 === 0;
    const mealOk = !t.meal_cost || t.meal_cost % 10 === 0;
    const groceriesOk = !t.groceries_cost || t.groceries_cost % 10 === 0;
    const utilitiesOk = !t.utilities_cost || t.utilities_cost % 10 === 0;
    
    if (!rentOk || !mealOk || !groceriesOk || !utilitiesOk) {
      console.log(`  ⚠️ Issue found - Rent: ${t.rent_1bed}, Meal: ${t.meal_cost}, Groceries: ${t.groceries_cost}, Utilities: ${t.utilities_cost}`);
      issueCount++;
    }
  });
  
  if (issueCount === 0) {
    console.log('  All sampled values correctly rounded up to nearest 10! ✨');
  }
}

// Run rounding
roundCostFields().catch(console.error);