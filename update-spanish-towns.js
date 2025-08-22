#!/usr/bin/env node

// SPANISH TOWNS GEOGRAPHIC FEATURES UPDATE
// This script updates Spanish towns with proper geographic_features_actual and vegetation_type_actual data

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function updateSpanishTowns() {
  console.log('🇪🇸 SPANISH TOWNS GEOGRAPHIC FEATURES UPDATE');
  console.log('==============================================\n');

  try {
    // Step 1: Query all Spanish towns
    console.log('1️⃣ Querying all Spanish towns...');
    const { data: spanishTowns, error: queryError } = await supabase
      .from('towns')
      .select('id, name, country, geographic_features_actual, vegetation_type_actual')
      .eq('country', 'Spain')
      .order('name');

    if (queryError) {
      console.error('❌ Error querying Spanish towns:', queryError);
      return;
    }

    console.log(`✅ Found ${spanishTowns.length} Spanish towns:`);
    spanishTowns.forEach(town => {
      console.log(`   • ${town.name} (ID: ${town.id})`);
      console.log(`     Geographic features: ${JSON.stringify(town.geographic_features_actual)}`);
      console.log(`     Vegetation type: ${JSON.stringify(town.vegetation_type_actual)}`);
    });

    // Step 2: Define coastal towns (these should get ["coastal"] and ["mediterranean"])
    const coastalTowns = [
      'Granada', 'Castro Urdiales', 'Valencia', 'Alicante', 
      'Puerto de la Cruz', 'Comillas', 'Balona'
    ];

    console.log('\n2️⃣ Updating coastal Spanish towns...');
    
    for (const townName of coastalTowns) {
      const town = spanishTowns.find(t => t.name === townName);
      if (town) {
        console.log(`   🏖️ Updating ${townName}...`);
        
        const { error: updateError } = await supabase
          .from('towns')
          .update({
            geographic_features_actual: ['coastal'],
            vegetation_type_actual: ['mediterranean']
          })
          .eq('id', town.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${townName}:`, updateError);
        } else {
          console.log(`   ✅ ${townName} updated successfully`);
        }
      } else {
        console.log(`   ⚠️ ${townName} not found in Spanish towns list`);
      }
    }

    // Step 3: Update remaining inland Spanish towns with appropriate data
    console.log('\n3️⃣ Updating inland Spanish towns...');
    
    const inlandTownNames = spanishTowns
      .filter(town => !coastalTowns.includes(town.name))
      .map(town => town.name);

    for (const townName of inlandTownNames) {
      const town = spanishTowns.find(t => t.name === townName);
      if (town) {
        console.log(`   🏔️ Updating ${townName}...`);
        
        const { error: updateError } = await supabase
          .from('towns')
          .update({
            geographic_features_actual: ['continental'],
            vegetation_type_actual: ['mediterranean']
          })
          .eq('id', town.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${townName}:`, updateError);
        } else {
          console.log(`   ✅ ${townName} updated successfully`);
        }
      }
    }

    // Step 4: Verify updates
    console.log('\n4️⃣ Verifying updates...');
    const { data: updatedTowns, error: verifyError } = await supabase
      .from('towns')
      .select('id, name, country, geographic_features_actual, vegetation_type_actual')
      .eq('country', 'Spain')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
      return;
    }

    console.log('✅ Updated Spanish towns:');
    updatedTowns.forEach(town => {
      console.log(`   • ${town.name}`);
      console.log(`     Geographic features: ${JSON.stringify(town.geographic_features_actual)}`);
      console.log(`     Vegetation type: ${JSON.stringify(town.vegetation_type_actual)}`);
    });

    console.log('\n🎉 Spanish towns update completed successfully!');
    console.log('This should fix the 44% scoring bug for Spanish towns.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the update
updateSpanishTowns().catch(console.error);