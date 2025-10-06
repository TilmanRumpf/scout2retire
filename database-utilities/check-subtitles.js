import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSubtitles() {
  console.log('🔍 Checking subtitle column in regional_inspirations...\n');

  const { data, error } = await supabase
    .from('regional_inspirations')
    .select('title, region_name, subtitle')
    .eq('is_active', true)
    .order('display_order')
    .limit(5);

  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  The subtitle column may not exist yet.');
    console.log('📋 Run this SQL in Supabase SQL Editor:');
    console.log('   cat database-utilities/populate-inspirations-subtitles.sql\n');
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ First 5 inspirations:\n');
    data.forEach((item, i) => {
      console.log(`${i + 1}. ${item.title}`);
      console.log(`   Region: ${item.region_name}`);
      console.log(`   Subtitle: ${item.subtitle || '❌ NOT SET'}\n`);
    });

    const withSubtitles = data.filter(d => d.subtitle).length;
    const total = data.length;

    if (withSubtitles === 0) {
      console.log('⚠️  No subtitles found!');
      console.log('📋 You need to run: database-utilities/populate-inspirations-subtitles.sql\n');
    } else if (withSubtitles < total) {
      console.log(`⚠️  Only ${withSubtitles}/${total} have subtitles`);
    } else {
      console.log(`✅ All ${total} inspirations have subtitles!`);
    }
  }
}

checkSubtitles();
