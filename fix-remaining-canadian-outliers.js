#!/usr/bin/env node

// FIX REMAINING CANADIAN HOME PRICE OUTLIERS

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Remaining corrections - based on Oct 2025 web research
const REMAINING_CORRECTIONS = {
  'Ottawa': 790000 / 1.35,          // $790K CAD median Q3 2025 → $585K USD
  'Kelowna': 1104600 / 1.35,        // $1.105M CAD median single-family → $818K USD
  'Victoria': 1294800 / 1.35,       // $1.295M CAD benchmark Sept 2025 → $959K USD
  'Niagara-on-the-Lake': 1430000 / 1.35  // $1.43M CAD detached July 2025 → $1.059M USD
};

async function fixRemainingOutliers() {
  console.log('🔧 FIXING REMAINING CANADIAN HOME PRICE OUTLIERS');
  console.log('='.repeat(80));
  console.log('');

  for (const [townName, newPriceUSD] of Object.entries(REMAINING_CORRECTIONS)) {
    const newPriceCAD = newPriceUSD * 1.35;

    const { data: towns, error: fetchError } = await supabase
      .from('towns')
      .select('id, name, typical_home_price')
      .ilike('name', townName)
      .eq('country', 'Canada');

    if (fetchError || !towns || towns.length === 0) {
      console.log(`⚠️  ${townName}: Not found or error`);
      continue;
    }

    const town = towns[0];
    const oldPrice = town.typical_home_price;

    const { error: updateError } = await supabase
      .from('towns')
      .update({
        typical_home_price: Math.round(newPriceUSD),
        purchase_house_avg_usd: Math.round(newPriceUSD)
      })
      .eq('id', town.id);

    if (updateError) {
      console.log(`❌ ${townName}: Update failed`);
      continue;
    }

    console.log(`✅ ${townName}:`);
    console.log(`   Was: $${oldPrice?.toLocaleString() || 'NULL'}`);
    console.log(`   Now: $${Math.round(newPriceUSD).toLocaleString()} USD ($${Math.round(newPriceCAD).toLocaleString()} CAD)`);
    console.log('');
  }

  // Final verification
  console.log('');
  console.log('🔍 FINAL VERIFICATION - ALL CANADIAN TOWNS:');
  console.log('='.repeat(80));

  const { data: allTowns } = await supabase
    .from('towns')
    .select('name, typical_home_price')
    .eq('country', 'Canada')
    .not('typical_home_price', 'is', null)
    .order('typical_home_price', { ascending: false });

  if (allTowns) {
    allTowns.forEach(town => {
      const status = town.typical_home_price > 2000000 ? ' ⚠️  HIGH' :
                     town.typical_home_price > 10000000 ? ' 🚨 OUTLIER!' : ' ✅';
      console.log(`${town.name.padEnd(25)} $${town.typical_home_price.toLocaleString()}${status}`);
    });

    const outliers = allTowns.filter(t => t.typical_home_price > 10000000);
    const expensive = allTowns.filter(t => t.typical_home_price > 1000000 && t.typical_home_price <= 10000000);

    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`   Total Canadian towns: ${allTowns.length}`);
    console.log(`   Outliers (>$10M): ${outliers.length}`);
    console.log(`   High-end ($1M-$10M): ${expensive.length}`);
    console.log(`   Normal (<$1M): ${allTowns.length - outliers.length - expensive.length}`);

    if (outliers.length === 0) {
      console.log('');
      console.log('✅ SUCCESS! All outliers fixed - no more prices >$10M');
    }
  }

  console.log('');
  console.log('✅ DONE!');
}

fixRemainingOutliers().catch(console.error);
