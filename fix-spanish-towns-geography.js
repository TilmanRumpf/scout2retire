#!/usr/bin/env node

// SPANISH TOWNS GEOGRAPHY CORRECTION
// Fixing the geographic categorization for Spanish towns

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fixSpanishGeography() {
  console.log('🔧 CORRECTING SPANISH TOWNS GEOGRAPHY');
  console.log('=====================================\n');

  try {
    // Define the correct categorization
    const townUpdates = [
      // Coastal towns (mainland coast)
      { name: 'Alicante', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Valencia', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Barcelona', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Malaga', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Marbella', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Castro Urdiales', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Comillas', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Baiona', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Sanlúcar de Barrameda', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      { name: 'Puerto de la Cruz', geographic_features_actual: ['coastal'], vegetation_type_actual: ['mediterranean'] },
      
      // Island towns
      { name: 'Palma de Mallorca', geographic_features_actual: ['coastal', 'island'], vegetation_type_actual: ['mediterranean'] },
      
      // Inland towns
      { name: 'Granada', geographic_features_actual: ['continental', 'mountain'], vegetation_type_actual: ['mediterranean'] }
    ];

    // Get current data
    const { data: spanishTowns, error: queryError } = await supabase
      .from('towns')
      .select('id, name, country')
      .eq('country', 'Spain');

    if (queryError) {
      console.error('❌ Error querying Spanish towns:', queryError);
      return;
    }

    console.log('📍 Applying geographic corrections...\n');

    for (const update of townUpdates) {
      const town = spanishTowns.find(t => t.name === update.name);
      if (town) {
        console.log(`   🔄 Updating ${update.name}...`);
        console.log(`      Geographic: ${JSON.stringify(update.geographic_features_actual)}`);
        console.log(`      Vegetation: ${JSON.stringify(update.vegetation_type_actual)}`);
        
        const { error: updateError } = await supabase
          .from('towns')
          .update({
            geographic_features_actual: update.geographic_features_actual,
            vegetation_type_actual: update.vegetation_type_actual
          })
          .eq('id', town.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${update.name}:`, updateError);
        } else {
          console.log(`   ✅ ${update.name} corrected successfully\n`);
        }
      } else {
        console.log(`   ⚠️ ${update.name} not found\n`);
      }
    }

    // Final verification
    console.log('🔍 Final verification of all Spanish towns...\n');
    const { data: finalTowns, error: verifyError } = await supabase
      .from('towns')
      .select('name, geographic_features_actual, vegetation_type_actual')
      .eq('country', 'Spain')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
      return;
    }

    finalTowns.forEach(town => {
      console.log(`🇪🇸 ${town.name}`);
      console.log(`   Geographic: ${JSON.stringify(town.geographic_features_actual)}`);
      console.log(`   Vegetation: ${JSON.stringify(town.vegetation_type_actual)}\n`);
    });

    console.log('✅ Spanish towns geography correction completed!');
    console.log('📊 Summary:');
    console.log(`   • Total towns: ${finalTowns.length}`);
    console.log(`   • Coastal towns: ${finalTowns.filter(t => t.geographic_features_actual?.includes('coastal')).length}`);
    console.log(`   • Island towns: ${finalTowns.filter(t => t.geographic_features_actual?.includes('island')).length}`);
    console.log(`   • Continental towns: ${finalTowns.filter(t => t.geographic_features_actual?.includes('continental')).length}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the correction
fixSpanishGeography().catch(console.error);