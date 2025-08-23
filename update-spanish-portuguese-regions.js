#!/usr/bin/env node

/**
 * Update Spanish and Portuguese towns to have correct regional classifications
 * - All get "Southern Europe" (politically/culturally correct)
 * - All get "Western Europe" (geographically correct - Atlantic edge)
 * - Mediterranean towns keep "Mediterranean" as third classification
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env') });

// Supabase configuration - using service role key for admin access
const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateRegions() {
  console.log('🔍 Fetching current Spanish and Portuguese towns...\n');
  
  // 1. Query current state
  const { data: townsBefore, error: fetchError } = await supabase
    .from('towns')
    .select('id, name, country, geo_region')
    .in('country', ['Spain', 'Portugal'])
    .order('country')
    .order('name');
  
  if (fetchError) {
    console.error('❌ Error fetching towns:', fetchError);
    return;
  }
  
  console.log('📊 Current state of geo_region field:');
  console.log('=' .repeat(60));
  townsBefore.forEach(town => {
    console.log(`${town.country.padEnd(10)} | ${town.name.padEnd(25)} | ${town.geo_region || 'NULL'}`);
  });
  
  console.log('\n🔄 Updating geo_region fields...\n');
  
  // 2. Perform updates
  let updateCount = 0;
  let errorCount = 0;
  
  for (const town of townsBefore) {
    let newGeoRegion;
    
    // Determine new geo_region value
    if (town.geo_region && town.geo_region.includes('Mediterranean')) {
      newGeoRegion = 'Southern Europe,Western Europe,Mediterranean';
    } else {
      newGeoRegion = 'Southern Europe,Western Europe';
    }
    
    // Skip if already correct
    if (town.geo_region === newGeoRegion) {
      console.log(`✓ ${town.name} - already correct`);
      continue;
    }
    
    // Update the town
    const { error: updateError } = await supabase
      .from('towns')
      .update({ geo_region: newGeoRegion })
      .eq('id', town.id);
    
    if (updateError) {
      console.error(`❌ Error updating ${town.name}:`, updateError);
      errorCount++;
    } else {
      console.log(`✅ Updated ${town.name}: ${town.geo_region || 'NULL'} → ${newGeoRegion}`);
      updateCount++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📈 Summary: ${updateCount} towns updated, ${errorCount} errors\n`);
  
  // 3. Verify changes
  console.log('🔍 Verifying updated state...\n');
  
  const { data: townsAfter, error: verifyError } = await supabase
    .from('towns')
    .select('id, name, country, geo_region')
    .in('country', ['Spain', 'Portugal'])
    .order('country')
    .order('name');
  
  if (verifyError) {
    console.error('❌ Error verifying changes:', verifyError);
    return;
  }
  
  console.log('📊 Updated state of geo_region field:');
  console.log('=' .repeat(60));
  townsAfter.forEach(town => {
    console.log(`${town.country.padEnd(10)} | ${town.name.padEnd(25)} | ${town.geo_region}`);
  });
  
  // Check if all towns now have correct regions
  const allCorrect = townsAfter.every(town => {
    return town.geo_region && 
           town.geo_region.includes('Southern Europe') && 
           town.geo_region.includes('Western Europe');
  });
  
  console.log('\n' + '=' .repeat(60));
  if (allCorrect) {
    console.log('✅ SUCCESS: All Spanish and Portuguese towns now have correct regional classifications!');
  } else {
    console.log('⚠️  Some towns may still need attention.');
  }
}

// Run the update
updateRegions().catch(console.error);