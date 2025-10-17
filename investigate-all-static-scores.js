import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateAllScores() {
  console.log('🔍 INVESTIGATING: Which scores are STATIC vs DYNAMIC?\n');

  const { data: allTowns, error } = await supabase
    .from('towns')
    .select('name, healthcare_score, safety_score, government_efficiency_rating, political_stability_rating, hospital_count, nearest_major_hospital_km, english_speaking_doctors')
    .order('name')
    .limit(20);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('ADMIN SCORE COMPONENTS - ARE THEY STORED OR CALCULATED?');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Fields used by adminScoring.js:');
  console.log('  1. healthcare_score (0-10) → 30 points');
  console.log('  2. safety_score (0-10) → 25 points');
  console.log('  3. government_efficiency_rating (0-100) → 15 points');
  console.log('  4. political_stability_rating (0-100) → 10 points');
  console.log('  5. visa/residency data → 10 points');
  console.log('  6. environmental_health_rating → 15 points\n');

  console.log('Sample of 20 towns:\n');
  allTowns.forEach(t => {
    console.log(`${t.name}:`);
    console.log(`  healthcare_score: ${t.healthcare_score} | hospitals: ${t.hospital_count} | distance: ${t.nearest_major_hospital_km}km | english: ${t.english_speaking_doctors}`);
    console.log(`  safety_score: ${t.safety_score}`);
    console.log(`  gov_efficiency: ${t.government_efficiency_rating} | stability: ${t.political_stability_rating}`);
    console.log('');
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CRITICAL QUESTION:');
  console.log('Are ALL of these scores STATIC (stored in DB)?');
  console.log('Or are some CALCULATED dynamically?');
  console.log('\nIf they are ALL static, we need to build a COMPLETE');
  console.log('dynamic scoring system that auto-updates when data changes.');
}

investigateAllScores().catch(console.error);
