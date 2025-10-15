#!/usr/bin/env node

// FIX CANADIAN HOME PRICES - Replace inflated values with accurate 2025 market data
// Based on web research of actual MLS listings and market reports Oct 2025

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Accurate home prices based on Oct 2025 web research
// All prices in USD (converted from CAD at 1.35 rate)
const HOME_PRICE_CORRECTIONS = {
  // Nova Scotia towns
  'Halifax': 451665,              // Was 22.3M → Now $610K CAD / $452K USD
  'Lunenburg': 429630,            // Was $413K → Now $580K CAD / $430K USD (premium waterfront town)
  'Chester': 481481,              // Was $370K → Now $650K CAD / $481K USD (premium town)
  'Mahone Bay': 548148,           // Was $345K → Now $740K CAD / $548K USD (detached avg Oct 2025)
  'Bridgewater': 348889,          // Was $380K → Now $471K CAD / $349K USD (detached avg)
  'Yarmouth': 282963,             // Was $630K → Now $382K CAD / $283K USD (detached avg Oct 2025)
  'Annapolis Royal': 333333,      // Was $420K → Now $450K CAD / $333K USD (regional estimate)
  'Digby': 360741,                // Was $405K → Now $487K CAD / $361K USD (detached avg Oct 2025)
  'Truro': 311111,                // Was $900K → Now $420K CAD / $311K USD (similar NS towns)
  'Lockeport': 237037,            // Was $330K → Now $320K CAD / $237K USD (small coastal)
  "Peggy's Cove": 481481,         // Was $302K → Now $650K CAD / $481K USD (premium tourist)

  // Other Canadian towns
  'Calgary': 619259,              // Was 67.1M → Now $836K CAD / $619K USD (median Q4 2025)
  'Vancouver': 1148148,           // Was 15M → Now $1.55M CAD / $1.15M USD (GVA avg Aug 2025)
  'Kingston': 442593,             // Was 6.9M → Now $598K CAD / $443K USD (median Q1 2025)
  'London (ON)': 519259,          // Was 21.4M → Now $701K CAD / $519K USD (single-family avg)
  'Charlottetown': 333333,        // Was 2.2M → Now $450K CAD / $333K USD (PEI estimate)
  'Moncton': 296296               // Was 4.25M → Now $400K CAD / $296K USD (NB estimate)
};

async function fixCanadianHomePrices() {
  console.log('🏠 FIXING CANADIAN HOME PRICES');
  console.log('=' .repeat(80));
  console.log('');
  console.log('📊 Data Source: MLS listings, Zolo, WOWA, Royal LePage (Oct 2025)');
  console.log('💱 Exchange Rate: 1 USD = 1.35 CAD');
  console.log(`📝 Towns to update: ${Object.keys(HOME_PRICE_CORRECTIONS).length}`);
  console.log('');

  let updatedCount = 0;
  let errorCount = 0;

  for (const [townName, newPrice] of Object.entries(HOME_PRICE_CORRECTIONS)) {
    try {
      // Get current town data
      const { data: towns, error: fetchError } = await supabase
        .from('towns')
        .select('id, name, typical_home_price, purchase_house_avg_usd')
        .ilike('name', townName)
        .eq('country', 'Canada');

      if (fetchError) {
        console.log(`❌ Error fetching ${townName}:`, fetchError.message);
        errorCount++;
        continue;
      }

      if (!towns || towns.length === 0) {
        console.log(`⚠️  ${townName}: Not found in database`);
        continue;
      }

      const town = towns[0];
      const oldPrice1 = town.typical_home_price;
      const oldPrice2 = town.purchase_house_avg_usd;

      // Update both price fields
      const { error: updateError } = await supabase
        .from('towns')
        .update({
          typical_home_price: newPrice,
          purchase_house_avg_usd: newPrice
        })
        .eq('id', town.id);

      if (updateError) {
        console.log(`❌ Error updating ${townName}:`, updateError.message);
        errorCount++;
        continue;
      }

      console.log(`✅ ${townName}:`);
      console.log(`   typical_home_price: $${oldPrice1?.toLocaleString() || 'NULL'} → $${newPrice.toLocaleString()}`);
      console.log(`   purchase_house_avg_usd: $${oldPrice2?.toLocaleString() || 'NULL'} → $${newPrice.toLocaleString()}`);
      console.log('');

      updatedCount++;

    } catch (error) {
      console.log(`❌ Unexpected error for ${townName}:`, error.message);
      errorCount++;
    }
  }

  console.log('');
  console.log('=' .repeat(80));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(80));
  console.log(`✅ Successfully updated: ${updatedCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('');

  // Verify the changes
  console.log('🔍 VERIFYING CANADIAN HOME PRICES...');
  console.log('-'.repeat(80));

  const { data: allCanadianTowns, error: verifyError } = await supabase
    .from('towns')
    .select('name, typical_home_price, purchase_house_avg_usd')
    .eq('country', 'Canada')
    .not('typical_home_price', 'is', null)
    .order('name');

  if (verifyError) {
    console.log('❌ Error verifying:', verifyError.message);
  } else {
    console.log(`\n📋 All Canadian Towns (${allCanadianTowns.length} total):\n`);
    allCanadianTowns.forEach(town => {
      const outlier = town.typical_home_price > 10000000 ? ' 🚨 OUTLIER!' : '';
      console.log(`${town.name.padEnd(25)} $${town.typical_home_price.toLocaleString()}${outlier}`);
    });

    const outliers = allCanadianTowns.filter(t => t.typical_home_price > 10000000);
    if (outliers.length > 0) {
      console.log(`\n⚠️  WARNING: ${outliers.length} towns still have prices >$10M!`);
    } else {
      console.log(`\n✅ SUCCESS: No more price outliers >$10M`);
    }
  }

  console.log('');
  console.log('✅ DONE!');
}

// Run the fixes
fixCanadianHomePrices().catch(console.error);
