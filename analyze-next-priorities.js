import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeNextPriorities() {
  console.log('🔍 Analyzing remaining high-value data gaps...\n');
  
  // Get a sample town to see all columns
  const { data: sample } = await supabase
    .from('towns')
    .select('*')
    .limit(1);
    
  if (!sample || sample.length === 0) return;
  
  // Get all towns to count nulls
  const { data: towns } = await supabase
    .from('towns')
    .select('*');
  
  // Define columns we haven't filled yet with their importance
  const remainingColumns = {
    // Digital nomad/remote work related
    'internet_speed_mbps': { importance: 8, category: 'Digital Infrastructure' },
    'coworking_spaces_count': { importance: 7, category: 'Digital Infrastructure' },
    'has_fiber_internet': { importance: 6, category: 'Digital Infrastructure' },
    
    // Tax related (important for financial planning)
    'income_tax_rate_pct': { importance: 7, category: 'Financial' },
    'property_tax_rate_pct': { importance: 6, category: 'Financial' },
    'sales_tax_rate_pct': { importance: 5, category: 'Financial' },
    'foreign_income_taxed': { importance: 7, category: 'Financial' },
    'tax_treaty_us': { importance: 6, category: 'Financial' },
    
    // Specific amenities
    'golf_courses_count': { importance: 4, category: 'Recreation' },
    'tennis_courts_count': { importance: 4, category: 'Recreation' },
    'marinas_count': { importance: 4, category: 'Recreation' },
    'swimming_facilities': { importance: 5, category: 'Recreation' },
    'farmers_markets': { importance: 5, category: 'Lifestyle' },
    'dog_parks_count': { importance: 4, category: 'Lifestyle' },
    
    // Climate details
    'rainy_days_per_year': { importance: 5, category: 'Climate' },
    'hurricane_risk': { importance: 6, category: 'Climate' },
    'earthquake_risk': { importance: 6, category: 'Climate' },
    'natural_disaster_risk': { importance: 6, category: 'Climate' },
    
    // Population/Demographics
    'population': { importance: 5, category: 'Demographics' },
    'population_over_65_pct': { importance: 6, category: 'Demographics' },
    'median_age': { importance: 5, category: 'Demographics' },
    
    // Healthcare specifics
    'hospital_count': { importance: 5, category: 'Healthcare' },
    'medical_specialties_available': { importance: 5, category: 'Healthcare' },
    'veterinary_clinics_count': { importance: 4, category: 'Healthcare' },
    
    // Legal/Administrative
    'retirement_visa_available': { importance: 7, category: 'Legal' },
    'digital_nomad_visa': { importance: 6, category: 'Legal' },
    'min_income_requirement_usd': { importance: 6, category: 'Legal' },
    'easy_residency': { importance: 6, category: 'Legal' }
  };
  
  // Count nulls and calculate stats
  const gaps = {};
  
  Object.entries(remainingColumns).forEach(([col, info]) => {
    if (sample[0].hasOwnProperty(col)) {
      const nullCount = towns.filter(t => t[col] === null || t[col] === '').length;
      if (nullCount > 0) {
        gaps[col] = {
          ...info,
          missing: nullCount,
          percentage: (nullCount / 341 * 100).toFixed(1)
        };
      }
    }
  });
  
  // Sort by importance and missing percentage
  const sortedGaps = Object.entries(gaps)
    .sort((a, b) => {
      // First by importance
      if (b[1].importance !== a[1].importance) return b[1].importance - a[1].importance;
      // Then by missing count
      return b[1].missing - a[1].missing;
    });
  
  // Group by category
  const byCategory = {};
  sortedGaps.forEach(([col, data]) => {
    if (!byCategory[data.category]) byCategory[data.category] = [];
    byCategory[data.category].push({ column: col, ...data });
  });
  
  console.log('📊 HIGH-VALUE DATA GAPS BY CATEGORY:\n');
  
  Object.entries(byCategory).forEach(([category, columns]) => {
    console.log(`\n🏷️  ${category.toUpperCase()}`);
    columns.forEach(col => {
      console.log(`   ${col.column}: ${col.missing}/${341} missing (${col.percentage}%) - Importance: ${col.importance}/10`);
    });
  });
  
  console.log('\n🎯 TOP RECOMMENDATIONS:\n');
  console.log('1. Internet Speed (8/10 importance) - Critical for remote workers/digital nomads');
  console.log('2. Tax rates (7/10) - Important for financial planning');
  console.log('3. Visa information (7/10) - Key decision factor');
  console.log('4. Natural disaster risks (6/10) - Safety consideration');
  console.log('5. Population demographics (6/10) - Community feel');
}

analyzeNextPriorities();