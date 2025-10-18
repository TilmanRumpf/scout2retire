import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyExclusions() {
  console.log('🔍 VERIFYING ABU DHABI EXCLUSIONS IN DATABASE...\n');

  // Step 1: Find Abu Dhabi's town ID
  const { data: abuDhabi, error: townError } = await supabase
    .from('towns')
    .select('id, name, country')
    .ilike('name', '%Abu Dhabi%')
    .single();

  if (townError || !abuDhabi) {
    console.error('❌ Could not find Abu Dhabi in database:', townError);
    return;
  }

  console.log(`✅ Found Abu Dhabi: ${abuDhabi.name}, ${abuDhabi.country}`);
  console.log(`   Town ID: ${abuDhabi.id}\n`);

  // Step 2: Get ALL records for Abu Dhabi from towns_hobbies
  const { data: allRecords, error: allError } = await supabase
    .from('towns_hobbies')
    .select('hobby_id, is_excluded')
    .eq('town_id', abuDhabi.id);

  if (allError) {
    console.error('❌ Error fetching towns_hobbies:', allError);
    return;
  }

  console.log(`📊 Total towns_hobbies records for Abu Dhabi: ${allRecords.length}`);

  // Step 3: Filter for excluded hobbies
  const excludedRecords = allRecords.filter(r => r.is_excluded === true);

  console.log(`🚫 Excluded hobby records: ${excludedRecords.length}\n`);

  if (excludedRecords.length === 0) {
    console.log('❌❌❌ NO EXCLUDED HOBBIES FOUND IN DATABASE! ❌❌❌');
    console.log('THE UI IS LYING! THE DATA IS NOT SAVED!\n');
    return;
  }

  // Step 4: Get the actual hobby names
  console.log('🔍 Fetching hobby names for excluded records...\n');

  for (const record of excludedRecords) {
    const { data: hobby, error: hobbyError } = await supabase
      .from('hobbies')
      .select('name, category')
      .eq('id', record.hobby_id)
      .single();

    if (hobby) {
      console.log(`  ✅ ${hobby.name} (${hobby.category})`);
    } else {
      console.log(`  ⚠️  Hobby ID ${record.hobby_id} - could not fetch name`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅✅✅ VERIFIED: EXCLUSIONS ARE IN THE DATABASE! ✅✅✅');
  console.log('='.repeat(60));
  console.log(`\nAbu Dhabi has ${excludedRecords.length} excluded hobbies saved in towns_hobbies table.`);
  console.log('The feature is working correctly! 🎉\n');
}

verifyExclusions().catch(console.error);
