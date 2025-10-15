#!/usr/bin/env node

// FIX CANADIAN CURRENCY MISLABELING
// Issue: Canadian cost_of_living_usd field contains CAD values, not USD
// Solution: Convert CAD to USD using October 2025 exchange rate

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// October 2025 CAD to USD exchange rate
const CAD_TO_USD = 0.71; // 1 CAD = 0.71 USD

async function fixCanadianCurrency() {
  console.log('🔧 FIXING CANADIAN CURRENCY MISLABELING');
  console.log('='.repeat(80));
  console.log(`Exchange Rate: 1 CAD = ${CAD_TO_USD} USD`);
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Get ALL Canadian towns
    console.log('📊 Step 1: Fetching Canadian towns...');
    const { data: canadianTowns, error: fetchError } = await supabase
      .from('towns')
      .select('id, name, country, region, cost_of_living_usd, typical_monthly_living_cost, typical_rent_1bed, rent_2bed_usd, rent_house_usd, healthcare_cost_monthly')
      .eq('country', 'Canada');

    if (fetchError) {
      console.error('❌ Error fetching towns:', fetchError.message);
      return;
    }

    console.log(`✅ Found ${canadianTowns.length} Canadian towns\n`);

    // Step 2: Show before values
    console.log('📋 BEFORE (Current "USD" values - actually CAD):');
    console.log('-'.repeat(80));
    canadianTowns.forEach(town => {
      console.log(`${town.name.padEnd(25)} | Cost: $${town.cost_of_living_usd || 'N/A'} | 1BR Rent: $${town.typical_rent_1bed || 'N/A'}`);
    });

    // Step 3: Calculate conversions
    console.log('\n\n🔄 CONVERTING CAD → USD...\n');
    const updates = [];

    for (const town of canadianTowns) {
      const update = {
        id: town.id,
        name: town.name,
        old_cost: town.cost_of_living_usd,
        new_cost: null,
        old_rent_1bed: town.typical_rent_1bed,
        new_rent_1bed: null,
        old_monthly_living: town.typical_monthly_living_cost,
        new_monthly_living: null,
        old_rent_2bed: town.rent_2bed_usd,
        new_rent_2bed: null,
        old_rent_house: town.rent_house_usd,
        new_rent_house: null,
        old_healthcare: town.healthcare_cost_monthly,
        new_healthcare: null
      };

      // Convert each field
      if (town.cost_of_living_usd) {
        update.new_cost = Math.round(town.cost_of_living_usd * CAD_TO_USD);
      }
      if (town.typical_monthly_living_cost) {
        update.new_monthly_living = Math.round(town.typical_monthly_living_cost * CAD_TO_USD);
      }
      if (town.typical_rent_1bed) {
        update.new_rent_1bed = Math.round(town.typical_rent_1bed * CAD_TO_USD);
      }
      if (town.rent_2bed_usd) {
        update.new_rent_2bed = Math.round(town.rent_2bed_usd * CAD_TO_USD);
      }
      if (town.rent_house_usd) {
        update.new_rent_house = Math.round(town.rent_house_usd * CAD_TO_USD);
      }
      if (town.healthcare_cost_monthly) {
        update.new_healthcare = Math.round(town.healthcare_cost_monthly * CAD_TO_USD);
      }

      updates.push(update);
    }

    // Step 4: Show conversion preview
    console.log('📋 CONVERSION PREVIEW:');
    console.log('-'.repeat(80));
    updates.forEach(u => {
      console.log(`\n${u.name}:`);
      if (u.old_cost) console.log(`  cost_of_living_usd: $${u.old_cost} CAD → $${u.new_cost} USD`);
      if (u.old_rent_1bed) console.log(`  typical_rent_1bed: $${u.old_rent_1bed} CAD → $${u.new_rent_1bed} USD`);
      if (u.old_monthly_living) console.log(`  typical_monthly_living_cost: $${u.old_monthly_living} CAD → $${u.new_monthly_living} USD`);
      if (u.old_rent_2bed) console.log(`  rent_2bed_usd: $${u.old_rent_2bed} CAD → $${u.new_rent_2bed} USD`);
      if (u.old_rent_house) console.log(`  rent_house_usd: $${u.old_rent_house} CAD → $${u.new_rent_house} USD`);
      if (u.old_healthcare) console.log(`  healthcare_cost_monthly: $${u.old_healthcare} CAD → $${u.new_healthcare} USD`);
    });

    // Step 5: Execute updates
    console.log('\n\n🚀 EXECUTING DATABASE UPDATES...\n');
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      const updateData = {};
      if (update.new_cost !== null) updateData.cost_of_living_usd = update.new_cost;
      if (update.new_monthly_living !== null) updateData.typical_monthly_living_cost = update.new_monthly_living;
      if (update.new_rent_1bed !== null) updateData.typical_rent_1bed = update.new_rent_1bed;
      if (update.new_rent_2bed !== null) updateData.rent_2bed_usd = update.new_rent_2bed;
      if (update.new_rent_house !== null) updateData.rent_house_usd = update.new_rent_house;
      if (update.new_healthcare !== null) updateData.healthcare_cost_monthly = update.new_healthcare;

      if (Object.keys(updateData).length === 0) {
        console.log(`⚠️  ${update.name}: No cost fields to update`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('towns')
        .update(updateData)
        .eq('id', update.id);

      if (updateError) {
        console.log(`❌ ${update.name}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${update.name}: Updated ${Object.keys(updateData).length} fields`);
        successCount++;
      }
    }

    // Step 6: Verification
    console.log('\n\n🔍 VERIFICATION - Fetching updated values...\n');
    const { data: verifyTowns, error: verifyError } = await supabase
      .from('towns')
      .select('name, cost_of_living_usd, typical_rent_1bed, typical_monthly_living_cost')
      .eq('country', 'Canada')
      .order('name');

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('📋 AFTER (Corrected USD values):');
      console.log('-'.repeat(80));
      verifyTowns.forEach(town => {
        console.log(`${town.name.padEnd(25)} | Cost: $${town.cost_of_living_usd || 'N/A'} | 1BR Rent: $${town.typical_rent_1bed || 'N/A'}`);
      });
    }

    // Summary
    console.log('\n\n📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`✅ Successfully updated: ${successCount} towns`);
    console.log(`❌ Errors: ${errorCount} towns`);
    console.log(`📉 Average cost reduction: ${Math.round((1 - CAD_TO_USD) * 100)}%`);
    console.log('');
    console.log('🎯 IMPACT ON USER BUDGET MATCHING:');
    console.log('   User budget: $2,000 USD');
    console.log('   Nova Scotia cheapest (before): $2,300 "USD" (actually CAD) - OVER BUDGET');
    console.log(`   Nova Scotia cheapest (after): $${Math.round(2300 * CAD_TO_USD)} USD - WITHIN BUDGET ✅`);
    console.log('');
    console.log('✅ Canadian cost data is now correctly normalized to USD!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the fix
fixCanadianCurrency().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Unhandled error:', err);
  process.exit(1);
});
