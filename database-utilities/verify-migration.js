import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verifying Geographic Standardization Migration\n');

  // Check sample data
  const { data: sample, error: sampleError } = await supabase
    .from('towns')
    .select('id, town_name, town_name, country, country_code, region, subdivision_code')
    .limit(10);

  if (sampleError) {
    console.error('❌ Error querying towns:', sampleError);
    return;
  }

  console.log('📊 Sample towns after migration:');
  sample.forEach(town => {
    const match = town.town_name === town.town_name ? '✅' : '❌';
    console.log(`  ${match} ${town.town_name}`);
    console.log(`      name: "${town.town_name}"`);
    console.log(`      town_name: "${town.town_name}"`);
    console.log(`      country: ${town.country}, code: ${town.country_code || 'NULL'}`);
    console.log(`      region: ${town.region}, code: ${town.subdivision_code || 'NULL'}`);
    console.log('');
  });

  // Count verification
  const { count: totalCount } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });

  const { count: townNameCount } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not('town_name', 'is', null);

  const { count: nameCount } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not('name', 'is', null);

  console.log('✅ VERIFICATION RESULTS:');
  console.log(`  Total towns: ${totalCount}`);
  console.log(`  Towns with name: ${nameCount}`);
  console.log(`  Towns with town_name: ${townNameCount}`);

  if (totalCount === townNameCount && townNameCount === nameCount) {
    console.log(`\n🎉 Perfect! All ${totalCount} towns have both name and town_name populated!`);
    console.log('\n📋 Ready to update code files to use town_name');
  } else {
    console.log(`\n⚠️  Warning: Counts don't match!`);
  }
}

verifyMigration();
