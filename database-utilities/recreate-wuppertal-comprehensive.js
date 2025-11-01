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

async function recreateWuppertal() {
  console.log('🏗️  Creating Wuppertal with basic info...');

  // Create town
  const { data: town, error: createError } = await supabase
    .from('towns')
    .insert([{
      name: 'Wuppertal',
      country: 'Germany',
      region: null,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (createError) {
    console.error('❌ Failed to create:', createError);
    return;
  }

  console.log('✅ Created Wuppertal ID:', town.id);
  console.log('🤖 Calling AI population function...');

  // Get user session for auth
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.error('❌ No session - need to be logged in');
    return;
  }

  // Call AI population function
  const response = await fetch(
    `${supabaseUrl}/functions/v1/ai-populate-new-town`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        townId: town.id,
        townName: 'Wuppertal',
        country: 'Germany',
        region: null
      })
    }
  );

  const result = await response.json();

  if (response.ok) {
    console.log('✅ AI POPULATION SUCCESS!');
    console.log('📊 Fields populated:', result.populatedFields?.length || 'unknown');
    console.log('\n🎉 Wuppertal recreated with COMPREHENSIVE AI data!');
    console.log('   Refresh your browser to see ALL fields populated');
  } else {
    console.error('❌ AI population failed:', result);
  }
}

recreateWuppertal();
