import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkActivityFields() {
  // Get one town to see what fields exist
  const { data: town, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  const activityFields = [
    'golf_courses_count',
    'tennis_courts_count',
    'sports_facilities',
    'dog_parks_count',
    'hiking_trails_km',
    'ski_resorts_within_100km',
    'mountain_activities',
    'outdoor_rating',
    'parks_per_capita',
    'recreation_centers',
    'beaches_nearby',
    'water_sports_available',
    'cultural_activities'
  ];

  console.log('Activity fields existence check:\n');
  activityFields.forEach(field => {
    const exists = field in town;
    const value = town[field];
    const type = typeof value;

    if (exists) {
      console.log(`✅ ${field}: EXISTS (value: ${value}, type: ${type})`);
    } else {
      console.log(`❌ ${field}: MISSING`);
    }
  });

  // Check for fields with 'sport', 'activity', 'beach', 'water', 'mountain'
  console.log('\n\nAll columns related to activities:');
  const keys = Object.keys(town);
  const relatedFields = keys.filter(key =>
    key.includes('sport') ||
    key.includes('activity') ||
    key.includes('activities') ||
    key.includes('beach') ||
    key.includes('water') ||
    key.includes('mountain') ||
    key.includes('golf') ||
    key.includes('tennis') ||
    key.includes('hiking') ||
    key.includes('ski') ||
    key.includes('outdoor')
  );

  relatedFields.forEach(field => {
    console.log(`  ${field}: ${town[field]} (${typeof town[field]})`);
  });
}

checkActivityFields();