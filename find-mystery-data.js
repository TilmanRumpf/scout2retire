import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function findMysteryData() {
  console.log('🔍 FINDING THE MYSTERY DATA ID: ca6cf648-235b-4132-9697-f1cd182db023\n');
  
  const mysteryId = 'ca6cf648-235b-4132-9697-f1cd182db023';
  const userId = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';
  
  // Search all possible tables for this ID
  const tables = ['user_preferences', 'onboarding_responses', 'users', 'favorites'];
  
  for (const table of tables) {
    console.log(`Checking ${table}...`);
    
    try {
      // Try to find by ID
      const { data: byId, error: idError } = await supabase
        .from(table)
        .select('*')
        .eq('id', mysteryId);
        
      if (!idError && byId && byId.length > 0) {
        console.log(`✅ FOUND IT in ${table}!`);
        console.log('Data:', JSON.stringify(byId[0], null, 2));
        break;
      }
      
      // Try to find by user_id
      const { data: byUser, error: userError } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId);
        
      if (!userError && byUser && byUser.length > 0) {
        console.log(`Found data in ${table} by user_id:`, byUser.length, 'records');
        byUser.forEach((record, i) => {
          console.log(`Record ${i + 1} ID:`, record.id);
          if (record.id === mysteryId) {
            console.log('🎯 THIS IS THE MYSTERY DATA!');
            console.log(JSON.stringify(record, null, 2));
          }
        });
      }
      
    } catch (err) {
      console.log(`❌ Error checking ${table}:`, err.message);
    }
  }
  
  // Also check if this ID exists anywhere by doing a general search
  console.log('\n🔍 DIRECT ID SEARCH:');
  
  try {
    const { data: prefData } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('id', mysteryId)
      .single();
      
    if (prefData) {
      console.log('🎯 FOUND IN user_preferences:');
      console.log(JSON.stringify(prefData, null, 2));
      
      console.log('\n🌡️ CLIMATE DATA IN THIS RECORD:');
      console.log('climate_preferences:', JSON.stringify(prefData.climate_preferences, null, 2));
      console.log('climate:', JSON.stringify(prefData.climate, null, 2));
      
      // Check all climate-related fields
      Object.keys(prefData).forEach(key => {
        if (key.toLowerCase().includes('climate')) {
          console.log(`${key}:`, JSON.stringify(prefData[key], null, 2));
        }
      });
    }
  } catch (err) {
    console.log('Direct search failed:', err.message);
  }
}

findMysteryData();