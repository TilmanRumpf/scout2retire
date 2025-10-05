#!/usr/bin/env node

// Check ALL hobby-related tables in the database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkAllHobbyTables() {
  console.log('🔍 FINDING ALL HOBBY-RELATED TABLES IN DATABASE');
  console.log('=' .repeat(80));
  
  try {
    // First, get list of ALL tables
    console.log('\n📊 ALL TABLES IN DATABASE:');
    console.log('-'.repeat(40));
    
    // Get all tables
    const { data: allTables, error: allError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `
      }).single();
    
    // If RPC doesn't work, try alternative approach
    let tables = [];
    
    // Try to query known tables directly
    const knownTables = [
      'hobbies',
      'hobbies_old', 
      'user_hobbies',
      'towns_hobbies',
      'town_hobbies',  // Old name
      'activities',
      'interests',
      'activities_available',
      'interests_supported'
    ];
    
    console.log('Checking for existence of potential hobby tables...\n');
    
    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          tables.push(tableName);
          console.log(`✅ Found: ${tableName}`);
          
          // Get row count
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          console.log(`   Rows: ${count || 0}`);
          
          // Get column info
          const { data: sample } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (sample && sample[0]) {
            console.log(`   Columns: ${Object.keys(sample[0]).join(', ')}`);
          }
        } else {
          console.log(`❌ Not found: ${tableName}`);
        }
      } catch (e) {
        // Table doesn't exist
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 DETAILED ANALYSIS OF FOUND TABLES:');
    console.log('='.repeat(80));
    
    // Analyze each found table
    for (const table of tables) {
      console.log(`\n📁 TABLE: ${table}`);
      console.log('-'.repeat(40));
      
      try {
        // Get sample data
        const { data: sampleData, error: sampleError } = await supabase
          .from(table)
          .select('*')
          .limit(3);
        
        if (!sampleError && sampleData) {
          console.log(`Sample records (${sampleData.length}):`);
          
          sampleData.forEach((record, i) => {
            console.log(`\nRecord ${i + 1}:`);
            Object.entries(record).forEach(([key, value]) => {
              if (value && typeof value === 'object') {
                console.log(`  ${key}: ${JSON.stringify(value)}`);
              } else if (typeof value === 'string' && value.length > 50) {
                console.log(`  ${key}: ${value.substring(0, 50)}...`);
              } else {
                console.log(`  ${key}: ${value}`);
              }
            });
          });
        }
        
        // Special analysis for specific tables
        if (table === 'hobbies') {
          const { data: stats } = await supabase
            .from('hobbies')
            .select('is_universal, verification_method', { count: 'exact' });
          
          if (stats) {
            const universal = stats.filter(h => h.is_universal).length;
            const locationDependent = stats.filter(h => !h.is_universal).length;
            
            console.log(`\n📊 Statistics:`);
            console.log(`  Universal hobbies: ${universal}`);
            console.log(`  Location-dependent: ${locationDependent}`);
            console.log(`  Total: ${stats.length}`);
            
            // Count by verification method
            const methods = {};
            stats.forEach(h => {
              methods[h.verification_method] = (methods[h.verification_method] || 0) + 1;
            });
            console.log(`\n  Verification methods:`);
            Object.entries(methods).forEach(([method, count]) => {
              console.log(`    ${method}: ${count}`);
            });
          }
        }
        
        if (table === 'towns_hobbies' || table === 'town_hobbies') {
          // Count unique towns and hobbies
          const { data: townCount } = await supabase
            .from(table)
            .select('town_id', { count: 'exact' });
          
          const { data: uniqueTowns } = await supabase
            .from(table)
            .select('town_id');
          
          if (uniqueTowns) {
            const uniqueTownIds = [...new Set(uniqueTowns.map(t => t.town_id))];
            console.log(`\n📊 Coverage:`);
            console.log(`  Unique towns with hobbies: ${uniqueTownIds.length}`);
            console.log(`  Total entries: ${uniqueTowns.length}`);
          }
        }
        
      } catch (e) {
        console.log(`Error analyzing ${table}:`, e.message);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMMARY:');
    console.log('-'.repeat(40));
    console.log(`Total hobby-related tables found: ${tables.length}`);
    console.log('Tables:', tables.join(', '));
    
    // Determine table purposes
    console.log('\n📝 TABLE PURPOSES:');
    tables.forEach(table => {
      let purpose = 'Unknown';
      
      if (table === 'hobbies') {
        purpose = 'Master reference table with 173 normalized hobbies';
      } else if (table === 'hobbies_old') {
        purpose = 'Backup of old hobbies table (before normalization)';
      } else if (table === 'user_hobbies') {
        purpose = 'Junction table for user-to-hobby relationships (currently unused)';
      } else if (table === 'towns_hobbies' || table === 'town_hobbies') {
        purpose = 'Junction table linking towns to available hobbies';
      } else if (table === 'activities' || table === 'activities_available') {
        purpose = 'Legacy column in towns table (deprecated)';
      } else if (table === 'interests' || table === 'interests_supported') {
        purpose = 'Legacy column in towns table (deprecated)';
      }
      
      console.log(`  ${table}: ${purpose}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

// Run the check
checkAllHobbyTables();