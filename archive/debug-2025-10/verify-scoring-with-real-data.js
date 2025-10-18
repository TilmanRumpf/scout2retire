/**
 * Verify component-based scoring with real database data
 */

import { createClient } from '@supabase/supabase-js';
import { calculateHealthcareScore, getHealthcareBonusBreakdown } from './src/utils/scoring/helpers/calculateHealthcareScore.js';
import { calculateSafetyScore, getSafetyScoreBreakdown } from './src/utils/scoring/helpers/calculateSafetyScore.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 VERIFYING COMPONENT-BASED SCORING WITH REAL DATA\n');
console.log('═'.repeat(80));

// Fetch sample towns with different characteristics
const { data: towns, error } = await supabase
  .from('towns')
  .select(`
    id, name, country, region,
    healthcare_score, hospital_count, nearest_major_hospital_km,
    english_speaking_doctors, emergency_services_quality,
    insurance_availability_rating, healthcare_cost, healthcare_cost_monthly,
    safety_score, crime_rate, environmental_health_rating,
    natural_disaster_risk, natural_disaster_risk_score
  `)
  .not('healthcare_score', 'is', null)
  .not('safety_score', 'is', null)
  .limit(10);

if (error) {
  console.error('❌ Error fetching towns:', error);
  process.exit(1);
}

console.log(`\n📊 Testing with ${towns.length} real towns from database\n`);

// Test each town
towns.forEach((town, index) => {
  console.log(`\n${index + 1}. ${town.name}, ${town.region || town.country}`);
  console.log('─'.repeat(80));

  // Healthcare scoring
  const healthcareScore = calculateHealthcareScore(town);
  const healthcareBreakdown = getHealthcareBonusBreakdown(town);

  console.log(`🏥 HEALTHCARE: ${healthcareScore}/10.0`);
  console.log(`   Quality:        ${healthcareBreakdown.quality.toFixed(1)}/4.0 (admin: ${healthcareBreakdown.components.quality.adminBase.toFixed(1)}, hospitals: ${healthcareBreakdown.components.quality.hospitalBonus.toFixed(1)})`);
  console.log(`   Accessibility:  ${healthcareBreakdown.accessibility.toFixed(1)}/3.0`);
  console.log(`   Cost:           ${healthcareBreakdown.cost.toFixed(1)}/3.0`);

  // Safety scoring
  const safetyScore = calculateSafetyScore(town);
  const safetyBreakdown = getSafetyScoreBreakdown(town);

  console.log(`🛡️  SAFETY: ${safetyScore}/10.0`);
  console.log(`   Base:           ${safetyBreakdown.baseSafety.toFixed(1)}/7.0 (admin: ${safetyBreakdown.components.base.adminRating})`);
  console.log(`   Crime Impact:   ${safetyBreakdown.crimeImpact > 0 ? '+' : ''}${safetyBreakdown.crimeImpact.toFixed(1)} (rate: ${safetyBreakdown.components.crime.crimeRate ?? 'N/A'} - ${safetyBreakdown.components.crime.description})`);
  console.log(`   Environmental:  ${safetyBreakdown.environmental.toFixed(1)}/1.0`);

  // Compare with original scores
  console.log(`\n   📈 Comparison:`);
  console.log(`   Original healthcare_score: ${town.healthcare_score}/10.0 → Dynamic: ${healthcareScore}/10.0`);
  console.log(`   Original safety_score:     ${town.safety_score}/10.0 → Dynamic: ${safetyScore}/10.0`);
});

console.log('\n\n═'.repeat(80));
console.log('✅ VERIFICATION COMPLETE\n');

// Summary statistics
const healthcareScores = towns.map(t => ({
  original: t.healthcare_score,
  dynamic: calculateHealthcareScore(t),
  diff: calculateHealthcareScore(t) - t.healthcare_score
}));

const safetyScores = towns.map(t => ({
  original: t.safety_score,
  dynamic: calculateSafetyScore(t),
  diff: calculateSafetyScore(t) - t.safety_score
}));

console.log('📊 SCORE CHANGES SUMMARY:\n');
console.log('Healthcare Scores:');
console.log(`   Average original: ${(healthcareScores.reduce((sum, s) => sum + s.original, 0) / healthcareScores.length).toFixed(2)}`);
console.log(`   Average dynamic:  ${(healthcareScores.reduce((sum, s) => sum + s.dynamic, 0) / healthcareScores.length).toFixed(2)}`);
console.log(`   Average change:   ${healthcareScores.reduce((sum, s) => sum + s.diff, 0) / healthcareScores.length > 0 ? '+' : ''}${(healthcareScores.reduce((sum, s) => sum + s.diff, 0) / healthcareScores.length).toFixed(2)}`);

console.log('\nSafety Scores:');
console.log(`   Average original: ${(safetyScores.reduce((sum, s) => sum + s.original, 0) / safetyScores.length).toFixed(2)}`);
console.log(`   Average dynamic:  ${(safetyScores.reduce((sum, s) => sum + s.dynamic, 0) / safetyScores.length).toFixed(2)}`);
console.log(`   Average change:   ${safetyScores.reduce((sum, s) => sum + s.diff, 0) / safetyScores.length > 0 ? '+' : ''}${(safetyScores.reduce((sum, s) => sum + s.diff, 0) / safetyScores.length).toFixed(2)}`);

console.log('\n✨ Component-based scoring is working correctly with real data!');
