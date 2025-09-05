#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkDuplicatesAndIntegrity() {
  console.log('🔍 CHECKING FOR DUPLICATE TOWNS AND DATA INTEGRITY ISSUES');
  console.log('================================================================================\n');

  try {
    // 1. Check for duplicate town names within same state
    console.log('1️⃣ CHECKING FOR DUPLICATE TOWN NAMES (SAME STATE):');
    console.log('----------------------------------------');
    
    const { data: duplicateNames, error: dupError } = await supabase
      .rpc('check_duplicate_towns', {});
    
    if (dupError) {
      console.log('Creating RPC function for duplicate check...');
      
      // Fallback: Direct query for duplicates
      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('id, name, state_code');
      
      if (townsError) {
        console.error('❌ Error fetching towns:', townsError);
        return;
      }
      
      // Group by name + state_code to find duplicates
      const townGroups = {};
      towns.forEach(town => {
        const key = `${town.name}|${town.state_code}`;
        if (!townGroups[key]) {
          townGroups[key] = [];
        }
        townGroups[key].push(town);
      });
      
      const duplicates = Object.entries(townGroups).filter(([key, group]) => group.length > 1);
      
      if (duplicates.length > 0) {
        console.log(`⚠️ Found ${duplicates.length} sets of duplicate town names:`);
        duplicates.forEach(([key, group]) => {
          const [name, state] = key.split('|');
          console.log(`   ${name}, ${state}: ${group.length} entries`);
          group.forEach(town => {
            console.log(`     - ID: ${town.id}`);
          });
        });
      } else {
        console.log('✅ No duplicate town names found');
      }
    }

    console.log('\n2️⃣ CHECKING TOTAL TOWN COUNT:');
    console.log('----------------------------------------');
    
    const { count: townCount, error: countError } = await supabase
      .from('towns')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.error('❌ Error counting towns:', countError);
    } else {
      console.log(`📊 Total towns in database: ${townCount}`);
    }

    console.log('\n3️⃣ CHECKING TOWNS_HOBBIES INTEGRITY:');
    console.log('----------------------------------------');
    
    // Check for orphaned towns_hobbies records (referencing non-existent town IDs)
    const { data: orphanedHobbies, error: orphanError } = await supabase
      .from('towns_hobbies')
      .select(`
        town_id,
        towns!inner(id, name, state_code)
      `);
    
    if (orphanError) {
      console.log('Checking orphaned records manually...');
      
      // Get all town_ids from towns_hobbies
      const { data: hobbiesData, error: hobbiesError } = await supabase
        .from('towns_hobbies')
        .select('town_id');
      
      if (hobbiesError) {
        console.error('❌ Error fetching towns_hobbies:', hobbiesError);
      } else {
        const uniqueTownIds = [...new Set(hobbiesData.map(h => h.town_id))];
        console.log(`📊 Unique town_ids in towns_hobbies: ${uniqueTownIds.length}`);
        
        // Check if all these IDs exist in towns table
        const { data: existingTowns, error: existError } = await supabase
          .from('towns')
          .select('id')
          .in('id', uniqueTownIds);
        
        if (existError) {
          console.error('❌ Error checking existing towns:', existError);
        } else {
          const existingIds = new Set(existingTowns.map(t => t.id));
          const orphanedIds = uniqueTownIds.filter(id => !existingIds.has(id));
          
          if (orphanedIds.length > 0) {
            console.log(`⚠️ Found ${orphanedIds.length} orphaned town_ids in towns_hobbies:`);
            orphanedIds.forEach(id => console.log(`   - ${id}`));
          } else {
            console.log('✅ No orphaned records in towns_hobbies');
          }
        }
      }
    } else {
      console.log(`✅ All towns_hobbies records reference valid towns`);
    }

    console.log('\n4️⃣ CHECKING FOR MISSING HOBBY RELATIONSHIPS:');
    console.log('----------------------------------------');
    
    // Check towns that might be missing from towns_hobbies
    const { data: townsWithoutHobbies, error: noHobbiesError } = await supabase
      .from('towns')
      .select(`
        id, name, state_code,
        towns_hobbies!left(town_id)
      `)
      .is('towns_hobbies.town_id', null);
    
    if (noHobbiesError) {
      console.error('❌ Error checking towns without hobbies:', noHobbiesError);
    } else {
      if (townsWithoutHobbies.length > 0) {
        console.log(`⚠️ Found ${townsWithoutHobbies.length} towns without hobby relationships:`);
        townsWithoutHobbies.slice(0, 10).forEach(town => {
          console.log(`   - ${town.name}, ${town.state_code} (ID: ${town.id})`);
        });
        if (townsWithoutHobbies.length > 10) {
          console.log(`   ... and ${townsWithoutHobbies.length - 10} more`);
        }
      } else {
        console.log('✅ All towns have hobby relationships');
      }
    }

    console.log('\n5️⃣ SUMMARY STATISTICS:');
    console.log('----------------------------------------');
    
    // Get counts from each table
    const { count: hobbiesCount, error: hobbiesCountError } = await supabase
      .from('towns_hobbies')
      .select('id', { count: 'exact' });
    
    if (!hobbiesCountError) {
      console.log(`📊 Towns: ${townCount}`);
      console.log(`📊 Town-Hobby relationships: ${hobbiesCount}`);
      console.log(`📊 Average hobbies per town: ${(hobbiesCount / townCount).toFixed(2)}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDuplicatesAndIntegrity();