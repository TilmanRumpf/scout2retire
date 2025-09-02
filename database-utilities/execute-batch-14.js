import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function executeBatch14() {
  console.log('🔧 EXECUTING BATCH 14 HOBBY UPDATES');
  console.log('================================================================================');
  
  const hobbies = [
    'Snorkeling', 'Snowboarding', 'Snowmobiling', 'Snowshoeing', 'Spa & Wellness',
    'Square Dancing', 'Stained Glass', 'Stand-up Paddleboarding', 'Stargazing', 'Street Festivals'
  ];

  // Universal hobbies
  console.log('\n🌟 Updating universal hobbies...');
  
  // Stargazing
  const { error: stargazingError } = await supabase
    .from('hobbies')
    .update({
      category: 'interest',
      verification_method: 'universal',
      is_universal: true,
      verification_query: null,
      verification_notes: 'Stars visible everywhere. Telescopes and apps enhance. Dark skies better but not required.',
      required_conditions: null
    })
    .eq('name', 'Stargazing');

  if (stargazingError) {
    console.error('❌ Error updating Stargazing:', stargazingError);
  } else {
    console.log('✅ Updated Stargazing successfully');
  }

  // Square Dancing
  const { error: squareDancingError } = await supabase
    .from('hobbies')
    .update({
      category: 'activity',
      verification_method: 'universal',
      is_universal: true,
      verification_query: null,
      verification_notes: 'Traditional dance learnable online. Can practice at home. Clubs and callers enhance.',
      required_conditions: null
    })
    .eq('name', 'Square Dancing');

  if (squareDancingError) {
    console.error('❌ Error updating Square Dancing:', squareDancingError);
  } else {
    console.log('✅ Updated Square Dancing successfully');
  }

  console.log('\n🏔️ Updating location-dependent hobbies...');
  
  // Snorkeling
  const { error: snorkelingError } = await supabase
    .from('hobbies')
    .update({
      verification_query: 'Find beaches, lakes, dive shops, or swimming areas suitable for snorkeling near {town}',
      verification_notes: 'Requires clear water access. Oceans, lakes, some pools. Equipment available online.',
      required_conditions: null
    })
    .eq('name', 'Snorkeling');

  if (snorkelingError) {
    console.error('❌ Error updating Snorkeling:', snorkelingError);
  } else {
    console.log('✅ Updated Snorkeling successfully');
  }

  // Snowshoeing
  const { error: snowshoeingError } = await supabase
    .from('hobbies')
    .update({
      verification_query: 'Are there winter snow conditions and trails suitable for snowshoeing near {town}?',
      verification_notes: 'Requires snow coverage. Equipment available online. Winter activity in cold climates.',
      required_conditions: null
    })
    .eq('name', 'Snowshoeing');

  if (snowshoeingError) {
    console.error('❌ Error updating Snowshoeing:', snowshoeingError);
  } else {
    console.log('✅ Updated Snowshoeing successfully');
  }

  // Snowboarding
  const { error: snowboardingError } = await supabase
    .from('hobbies')
    .update({
      verification_query: 'Find ski resorts, snowboarding parks, or mountains with snowboarding near {town}',
      verification_notes: 'Requires ski resorts with lifts and snow. Mountain regions in winter.',
      required_conditions: null
    })
    .eq('name', 'Snowboarding');

  if (snowboardingError) {
    console.error('❌ Error updating Snowboarding:', snowboardingError);
  } else {
    console.log('✅ Updated Snowboarding successfully');
  }

  // Snowmobiling
  const { error: snowmobilingError } = await supabase
    .from('hobbies')
    .update({
      verification_query: 'Are there snowmobile trails, rentals, or winter conditions for snowmobiling near {town}?',
      verification_notes: 'Requires snow, trails, and snowmobile access. Popular in northern regions.',
      required_conditions: null
    })
    .eq('name', 'Snowmobiling');

  if (snowmobilingError) {
    console.error('❌ Error updating Snowmobiling:', snowmobilingError);
  } else {
    console.log('✅ Updated Snowmobiling successfully');
  }

  // Spa & Wellness
  const { error: spaError } = await supabase
    .from('hobbies')
    .update({
      category: 'interest',
      verification_query: 'Find spas, wellness centers, or massage therapy facilities in {town}',
      verification_notes: 'Relaxation and wellness services. Day spas, resorts, wellness centers.',
      required_conditions: null
    })
    .eq('name', 'Spa & Wellness');

  if (spaError) {
    console.error('❌ Error updating Spa & Wellness:', spaError);
  } else {
    console.log('✅ Updated Spa & Wellness successfully');
  }

  // Stained Glass
  const { error: stainedGlassError } = await supabase
    .from('hobbies')
    .update({
      category: 'interest',
      verification_query: 'Find stained glass studios, workshops, or classes in {town}',
      verification_notes: 'Requires specialized tools, glass cutting, soldering. Studios offer classes.',
      required_conditions: null
    })
    .eq('name', 'Stained Glass');

  if (stainedGlassError) {
    console.error('❌ Error updating Stained Glass:', stainedGlassError);
  } else {
    console.log('✅ Updated Stained Glass successfully');
  }

  // Stand-up Paddleboarding
  const { error: supError } = await supabase
    .from('hobbies')
    .update({
      verification_query: 'Find lakes, rivers, ocean access, or SUP rentals in {town}',
      verification_notes: 'Requires calm water bodies. Lakes, bays, slow rivers. Board rentals common.',
      required_conditions: null
    })
    .eq('name', 'Stand-up Paddleboarding');

  if (supError) {
    console.error('❌ Error updating Stand-up Paddleboarding:', supError);
  } else {
    console.log('✅ Updated Stand-up Paddleboarding successfully');
  }

  // Street Festivals
  const { error: streetFestivalsError } = await supabase
    .from('hobbies')
    .update({
      category: 'interest',
      verification_query: 'Are there regular street festivals, art fairs, or community events in {town}?',
      verification_notes: 'Community events vary by location. More common in larger, diverse cities.',
      required_conditions: null
    })
    .eq('name', 'Street Festivals');

  if (streetFestivalsError) {
    console.error('❌ Error updating Street Festivals:', streetFestivalsError);
  } else {
    console.log('✅ Updated Street Festivals successfully');
  }

  console.log('\n🔍 VERIFYING BATCH 14 UPDATES:');
  console.log('================================================================================\n');

  // Verify updates
  for (const hobbyName of hobbies) {
    const { data, error } = await supabase
      .from('hobbies')
      .select('name, category, verification_method, is_universal, verification_query, verification_notes')
      .eq('name', hobbyName)
      .single();

    if (error) {
      console.error(`❌ Error fetching ${hobbyName}:`, error);
    } else if (data) {
      console.log(`${hobbyName}:`);
      console.log(`   Category: ${data.category}`);
      console.log(`   Method: ${data.verification_method}`);
      console.log(`   Universal: ${data.is_universal ? 'YES' : 'NO'}`);
      console.log(`   Notes: ${data.verification_notes?.substring(0, 60)}...`);
      console.log('');
    }
  }

  console.log('✅ Batch 14 processing complete!');
}

executeBatch14().catch(console.error);