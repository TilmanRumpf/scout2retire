import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function analyzeRemainingGaps() {
  console.log('🔍 Analyzing remaining data gaps...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1); // Just need schema
    
  if (error || !towns || towns.length === 0) {
    console.error('Error:', error);
    return;
  }
  
  // Get all columns
  const allColumns = Object.keys(towns[0]);
  
  // Now get actual data to count nulls
  const { data: allTowns } = await supabase
    .from('towns')
    .select('*');
    
  // Count nulls for each column
  const nullCounts = {};
  
  allColumns.forEach(col => {
    nullCounts[col] = allTowns.filter(t => t[col] === null || t[col] === '').length;
  });
  
  // Define importance ratings (based on TOWNS_PREFERENCES_MAPPING.md)
  const importance = {
    // Critical for matching (8-10)
    'image_url_1': 10,
    'image_url_2': 8,
    'image_url_3': 8,
    
    // High importance (6-7)
    'expat_community_size': 7,
    'english_proficiency_level': 7,
    'crime_rate': 6, // Redundant with safety_score
    'air_quality_index': 6,
    'internet_speed_mbps': 6,
    'coworking_spaces_count': 6,
    
    // Medium importance (4-5)
    'cultural_rating': 5,
    'restaurants_rating': 5,
    'shopping_rating': 5,
    'nightlife_rating': 5,
    'outdoor_activities_rating': 5,
    'wellness_rating': 5,
    'golf_courses_count': 4,
    'tennis_courts_count': 4,
    'swimming_facilities': 4,
    'farmers_markets': 4,
    
    // Low importance (1-3)
    'income_tax_rate_pct': 3,
    'property_tax_rate_pct': 3,
    'sales_tax_rate_pct': 3,
    'visa_requirements': 3,
    'min_income_requirement_usd': 3,
    'property_appreciation_rate_pct': 2
  };
  
  // Filter and sort by importance and missing data
  const gaps = Object.entries(nullCounts)
    .filter(([col, count]) => count > 0 && importance[col])
    .map(([col, count]) => ({
      column: col,
      missing: count,
      percentage: (count / 341 * 100).toFixed(1),
      importance: importance[col] || 0
    }))
    .sort((a, b) => {
      if (b.importance !== a.importance) return b.importance - a.importance;
      return b.missing - a.missing;
    });
    
  console.log('📊 REMAINING DATA GAPS (sorted by importance):\n');
  
  // Group by importance level
  const critical = gaps.filter(g => g.importance >= 8);
  const high = gaps.filter(g => g.importance >= 6 && g.importance < 8);
  const medium = gaps.filter(g => g.importance >= 4 && g.importance < 6);
  const low = gaps.filter(g => g.importance < 4);
  
  if (critical.length > 0) {
    console.log('🔴 CRITICAL GAPS (8-10 importance):');
    critical.forEach(g => {
      console.log(`  ${g.column}: ${g.missing}/${341} missing (${g.percentage}%)`);
    });
  }
  
  if (high.length > 0) {
    console.log('\n🟡 HIGH IMPORTANCE GAPS (6-7):');
    high.forEach(g => {
      console.log(`  ${g.column}: ${g.missing}/${341} missing (${g.percentage}%)`);
    });
  }
  
  if (medium.length > 0) {
    console.log('\n🟢 MEDIUM IMPORTANCE GAPS (4-5):');
    medium.forEach(g => {
      console.log(`  ${g.column}: ${g.missing}/${341} missing (${g.percentage}%)`);
    });
  }
  
  if (low.length > 0) {
    console.log('\n⚪ LOW IMPORTANCE GAPS (1-3):');
    console.log(`  ${low.length} columns with ${low.reduce((sum, g) => sum + g.missing, 0)} total missing values`);
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Skip image URLs (requires actual photos, not data estimation)');
  console.log('2. Focus on expat_community_size next (high impact, can estimate)');
  console.log('3. english_proficiency_level (mostly filled, just 54 missing)');
  console.log('4. Skip crime_rate (redundant with safety_score)');
  console.log('5. Internet speed and air quality would be valuable');
}

analyzeRemainingGaps();