import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function debugAdminData() {
  console.log('=== TOWNS ADMIN DATA ===');
  
  // Query towns admin data
  const { data: towns, error: townsError } = await supabase
    .from('towns')
    .select('name, healthcare_score, safety_score, government_efficiency_rating, political_stability_rating')
    .limit(10);
  
  if (townsError) {
    console.error('Error fetching towns:', townsError);
    return;
  }
  
  console.log('Sample towns admin data:');
  towns.forEach(town => {
    console.log(`${town.name}:`);
    console.log(`  Healthcare: ${town.healthcare_score}`);
    console.log(`  Safety: ${town.safety_score}`);
    console.log(`  Gov Efficiency: ${town.government_efficiency_rating}`);
    console.log(`  Political Stability: ${town.political_stability_rating}`);
    console.log('---');
  });
  
  // Check how many towns have null values
  const { data: stats, error: statsError } = await supabase
    .from('towns')
    .select('healthcare_score, safety_score, government_efficiency_rating, political_stability_rating');
    
  if (statsError) {
    console.error('Error fetching stats:', statsError);
    return;
  }
  
  const nullCounts = {
    healthcare_score: 0,
    safety_score: 0,
    government_efficiency_rating: 0,
    political_stability_rating: 0
  };
  
  const totalTowns = stats.length;
  
  stats.forEach(town => {
    if (!town.healthcare_score) nullCounts.healthcare_score++;
    if (!town.safety_score) nullCounts.safety_score++;
    if (!town.government_efficiency_rating) nullCounts.government_efficiency_rating++;
    if (!town.political_stability_rating) nullCounts.political_stability_rating++;
  });
  
  console.log('\n=== NULL VALUE STATISTICS ===');
  console.log(`Total towns: ${totalTowns}`);
  Object.entries(nullCounts).forEach(([field, count]) => {
    const percentage = ((count / totalTowns) * 100).toFixed(1);
    console.log(`${field}: ${count} null (${percentage}%)`);
  });
  
  console.log('\n=== USER PREFERENCES SAMPLE ===');
  
  // Query user preferences
  const { data: prefs, error: prefsError } = await supabase
    .from('user_preferences')
    .select('healthcare_quality, safety_importance, government_efficiency, visa_preference')
    .limit(5);
  
  if (prefsError) {
    console.error('Error fetching user preferences:', prefsError);
    return;
  }
  
  console.log('Sample user preferences:');
  prefs.forEach((pref, index) => {
    console.log(`User ${index + 1}:`);
    console.log(`  Healthcare Quality: ${JSON.stringify(pref.healthcare_quality)}`);
    console.log(`  Safety Importance: ${JSON.stringify(pref.safety_importance)}`);
    console.log(`  Government Efficiency: ${JSON.stringify(pref.government_efficiency)}`);
    console.log(`  Visa Preference: ${JSON.stringify(pref.visa_preference)}`);
    console.log('---');
  });
}

debugAdminData().catch(console.error);