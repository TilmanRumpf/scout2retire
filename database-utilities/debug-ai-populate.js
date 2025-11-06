import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAIPopulate() {
  console.log('🔍 DEBUG: Testing AI population function...\n');

  // Find Wuppertal
  const { data: town, error: findError } = await supabase
    .from('towns')
    .select('id, town_name, country, region')
    .ilike('town_name', 'wuppertal')
    .single();

  if (findError || !town) {
    console.error('❌ Could not find Wuppertal:', findError);
    return;
  }

  console.log('✅ Found town:', town);
  console.log('📍 Town ID:', town.id);
  console.log('📍 Town Name:', town.town_name);
  console.log('📍 Country:', town.country);
  console.log('\n🤖 Calling AI population function...\n');

  // Get a session token (using service role key for testing)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.log('⚠️  No user session, will use service role key directly');
  }

  // Call the edge function
  const startTime = Date.now();

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/ai-populate-new-town`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}` // Use service role key
        },
        body: JSON.stringify({
          townId: town.id,
          townName: town.town_name,
          country: town.country,
          region: town.region
        })
      }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Function completed in ${elapsed}s`);
    console.log('📊 Response status:', response.status);
    console.log('📊 Response statusText:', response.statusText);

    const result = await response.json();

    console.log('\n📦 FULL RESPONSE:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ AI POPULATION SUCCESSFUL!');
      console.log('📊 Fields populated:', result.populatedFields?.length || 'unknown');

      if (result.populatedFields) {
        console.log('\n📋 POPULATED FIELDS:');
        result.populatedFields.forEach((field, idx) => {
          console.log(`  ${idx + 1}. ${field}`);
        });
      }

      // Now check the database to verify
      console.log('\n🔍 Verifying database update...');
      const { data: updatedTown, error: checkError } = await supabase
        .from('towns')
        .select('*')
        .eq('id', town.id)
        .single();

      if (checkError) {
        console.error('❌ Error checking updated town:', checkError);
        return;
      }

      // Count non-null fields
      const nonNullFields = Object.entries(updatedTown).filter(([key, value]) => {
        if (['id', 'created_at', 'updated_at', 'name', 'country', 'region'].includes(key)) return false;
        return value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0);
      });

      console.log('✅ Database verification:');
      console.log(`   Total non-null fields: ${nonNullFields.length}`);
      console.log('\n   Sample populated fields:');
      nonNullFields.slice(0, 10).forEach(([field, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        console.log(`   - ${field}: ${displayValue.toString().substring(0, 50)}${displayValue.toString().length > 50 ? '...' : ''}`);
      });

    } else {
      console.error('\n❌ AI POPULATION FAILED!');
      console.error('Error:', result.error || result);
    }

  } catch (error) {
    console.error('\n💥 EXCEPTION CAUGHT:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugAIPopulate();
