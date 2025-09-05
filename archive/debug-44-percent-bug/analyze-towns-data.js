import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function analyzeDataCompleteness() {
  console.log('🔍 Analyzing towns data completeness...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Total towns: ${towns.length}\n`);
  
  // Define key columns for matching (based on TOWNS_PREFERENCES_MAPPING.md)
  const keyColumns = {
    // Cost/Budget - CRITICAL
    'cost_of_living_usd': { category: 'Cost', importance: 10 },
    'rent_1bed': { category: 'Cost', importance: 9 },
    'purchase_apartment_sqm_usd': { category: 'Cost', importance: 8 },
    'typical_monthly_living_cost': { category: 'Cost', importance: 9 },
    
    // Climate - CRITICAL
    'avg_temp_summer': { category: 'Climate', importance: 10 },
    'avg_temp_winter': { category: 'Climate', importance: 10 },
    'humidity_average': { category: 'Climate', importance: 8 },
    'annual_rainfall': { category: 'Climate', importance: 7 },
    'sunshine_hours': { category: 'Climate', importance: 8 },
    
    // Healthcare - CRITICAL
    'healthcare_score': { category: 'Healthcare', importance: 10 },
    'healthcare_cost_monthly': { category: 'Healthcare', importance: 9 },
    'nearest_major_hospital_km': { category: 'Healthcare', importance: 8 },
    'english_speaking_doctors': { category: 'Healthcare', importance: 7 },
    
    // Safety - HIGH
    'safety_score': { category: 'Safety', importance: 9 },
    'crime_index': { category: 'Safety', importance: 8 },
    
    // Transportation - HIGH
    'airport_distance': { category: 'Transport', importance: 8 },
    'walkability': { category: 'Transport', importance: 7 },
    'public_transport_quality': { category: 'Transport', importance: 7 },
    
    // Community - HIGH
    'expat_community_size': { category: 'Community', importance: 8 },
    'english_proficiency_level': { category: 'Community', importance: 7 },
    
    // Lifestyle - MEDIUM
    'cultural_rating': { category: 'Lifestyle', importance: 6 },
    'restaurants_rating': { category: 'Lifestyle', importance: 5 },
    'outdoor_activities_rating': { category: 'Lifestyle', importance: 6 },
    
    // Photos - CRITICAL FOR UX
    'image_url_1': { category: 'Visual', importance: 10 }
  };
  
  // Analyze completeness
  const completeness = {};
  
  for (const [column, info] of Object.entries(keyColumns)) {
    const populated = towns.filter(t => t[column] !== null && t[column] !== undefined && t[column] !== '').length;
    const percentage = (populated / towns.length * 100).toFixed(1);
    completeness[column] = {
      ...info,
      populated,
      missing: towns.length - populated,
      percentage: parseFloat(percentage)
    };
  }
  
  // Sort by importance and missing data
  const sorted = Object.entries(completeness)
    .sort((a, b) => {
      // First by importance
      if (b[1].importance !== a[1].importance) {
        return b[1].importance - a[1].importance;
      }
      // Then by most missing data
      return b[1].missing - a[1].missing;
    });
  
  console.log('📊 DATA COMPLETENESS ANALYSIS\n');
  console.log('Columns sorted by importance and missing data:\n');
  
  sorted.forEach(([column, data]) => {
    const bar = '█'.repeat(Math.floor(data.percentage / 10)) + '░'.repeat(10 - Math.floor(data.percentage / 10));
    console.log(`${column.padEnd(30)} ${bar} ${data.percentage.toString().padStart(5)}% | Importance: ${data.importance}/10 | Missing: ${data.missing}`);
  });
  
  // Top 10 most critical missing data
  console.log('\n🎯 TOP 10 CRITICAL DATA GAPS (High importance + High missing):\n');
  
  const criticalGaps = sorted
    .filter(([_, data]) => data.importance >= 7 && data.missing > 50)
    .slice(0, 10);
    
  criticalGaps.forEach(([column, data], index) => {
    console.log(`${index + 1}. ${column} (${data.category})`);
    console.log(`   - Importance: ${data.importance}/10`);
    console.log(`   - Missing: ${data.missing}/${towns.length} (${(100 - data.percentage).toFixed(1)}%)\n`);
  });
  
  // Sample of towns with most missing data
  console.log('\n🌍 SAMPLE TOWNS WITH MOST MISSING DATA:\n');
  
  const townsMissingCount = towns.map(town => {
    const missingCount = Object.keys(keyColumns).filter(col => !town[col]).length;
    return { ...town, missingCount };
  }).sort((a, b) => b.missingCount - a.missingCount).slice(0, 5);
  
  townsMissingCount.forEach(town => {
    console.log(`${town.name}, ${town.country} - Missing ${town.missingCount}/${Object.keys(keyColumns).length} key fields`);
  });
}

analyzeDataCompleteness();