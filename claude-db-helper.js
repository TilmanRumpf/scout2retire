#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Example queries that replace the non-existent "npx supabase db execute"

async function runQueries() {
  console.log('🔍 Verifying recreation data for all Spanish towns...\n');

  try {
    // Get all Spanish towns with recreation data
    console.log('Fetching all Spanish towns with recreation data...');
    
    const { data: spanishTowns, error: fetchError } = await supabase
      .from('towns')
      .select('name, country, beaches_nearby, marinas_count, golf_courses_count, tennis_courts_count')
      .eq('country', 'Spain')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching Spanish towns:', fetchError.message);
      return;
    }

    console.log(`\n📊 Recreation data for all ${spanishTowns.length} Spanish towns:\n`);
    
    let townsWithRecreationData = 0;
    let townsWithoutRecreationData = 0;
    
    spanishTowns.forEach(town => {
      const hasRecreationData = 
        town.beaches_nearby !== null || 
        town.marinas_count !== null || 
        town.golf_courses_count !== null || 
        town.tennis_courts_count !== null;
      
      if (hasRecreationData) {
        townsWithRecreationData++;
        console.log(`✅ ${town.name}:`);
        console.log(`     - Beaches nearby: ${town.beaches_nearby || 'null'}`);
        console.log(`     - Marinas: ${town.marinas_count || 'null'}`);
        console.log(`     - Golf courses: ${town.golf_courses_count || 'null'}`);
        console.log(`     - Tennis courts: ${town.tennis_courts_count || 'null'}\n`);
      } else {
        townsWithoutRecreationData++;
        console.log(`❌ ${town.name}: No recreation data`);
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`   Towns with recreation data: ${townsWithRecreationData}`);
    console.log(`   Towns without recreation data: ${townsWithoutRecreationData}`);
    console.log(`   Total Spanish towns: ${spanishTowns.length}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ Spanish recreation data verification completed!');
}

// Run the queries
runQueries().catch(console.error);