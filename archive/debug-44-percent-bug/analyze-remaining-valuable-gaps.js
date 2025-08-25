import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeRemainingGaps() {
  console.log('🔍 Analyzing remaining valuable data gaps...\n');
  
  // Get sample for schema
  const { data: sample } = await supabase
    .from('towns')
    .select('*')
    .limit(1);
    
  if (!sample || sample.length === 0) return;
  
  // Get all towns for counting
  const { data: towns } = await supabase
    .from('towns')
    .select('*');
  
  // Define remaining valuable columns
  const valuableColumns = {
    // Digital infrastructure
    'internet_speed_mbps': { importance: 8, category: 'Digital' },
    'has_fiber_internet': { importance: 7, category: 'Digital' },
    'coworking_spaces_count': { importance: 6, category: 'Digital' },
    
    // Climate details
    'humidity_average': { importance: 7, category: 'Climate' },
    'rainy_days_per_year': { importance: 6, category: 'Climate' },
    'sunshine_hours': { importance: 7, category: 'Climate' },
    'hurricane_risk': { importance: 7, category: 'Climate' },
    'earthquake_risk': { importance: 7, category: 'Climate' },
    
    // Financial/Legal
    'retirement_visa_available': { importance: 8, category: 'Legal' },
    'digital_nomad_visa': { importance: 7, category: 'Legal' },
    'min_income_requirement_usd': { importance: 7, category: 'Legal' },
    'foreign_income_taxed': { importance: 7, category: 'Financial' },
    'tax_treaty_us': { importance: 7, category: 'Financial' },
    'property_appreciation_rate_pct': { importance: 5, category: 'Financial' },
    
    // Demographics
    'population_over_65_pct': { importance: 6, category: 'Demographics' },
    'median_age': { importance: 5, category: 'Demographics' },
    'retirement_community_presence': { importance: 7, category: 'Demographics' },
    
    // Recreation/Activities
    'golf_courses_count': { importance: 5, category: 'Recreation' },
    'tennis_courts_count': { importance: 4, category: 'Recreation' },
    'marinas_count': { importance: 4, category: 'Recreation' },
    'swimming_facilities': { importance: 5, category: 'Recreation' },
    'farmers_markets': { importance: 5, category: 'Lifestyle' },
    'hiking_trails_km': { importance: 5, category: 'Recreation' },
    'beaches_nearby': { importance: 6, category: 'Recreation' },
    
    // Healthcare specifics
    'medical_specialties_available': { importance: 6, category: 'Healthcare' },
    'veterinary_clinics_count': { importance: 4, category: 'Healthcare' },
    'health_insurance_required': { importance: 6, category: 'Healthcare' },
    
    // Transportation
    'requires_car': { importance: 6, category: 'Transport' },
    'has_uber': { importance: 5, category: 'Transport' },
    'train_station': { importance: 5, category: 'Transport' },
    'airport_distance': { importance: 6, category: 'Transport' },
    
    // Cost details
    'groceries_cost': { importance: 5, category: 'Cost' },
    'meal_cost': { importance: 4, category: 'Cost' },
    'utilities_cost': { importance: 5, category: 'Cost' }
  };
  
  // Count nulls
  const gaps = {};
  
  Object.entries(valuableColumns).forEach(([col, info]) => {
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
  
  // Sort by importance and completeness
  const sorted = Object.entries(gaps)
    .sort((a, b) => {
      if (b[1].importance !== a[1].importance) return b[1].importance - a[1].importance;
      return a[1].missing - b[1].missing; // Prefer easier to complete
    });
  
  // Group by category
  const byCategory = {};
  sorted.forEach(([col, data]) => {
    if (!byCategory[data.category]) byCategory[data.category] = [];
    byCategory[data.category].push({ column: col, ...data });
  });
  
  console.log('📊 REMAINING HIGH-VALUE GAPS BY CATEGORY:\n');
  
  Object.entries(byCategory).forEach(([category, columns]) => {
    console.log(`\n🏷️  ${category.toUpperCase()}`);
    const totalMissing = columns.reduce((sum, col) => sum + col.missing, 0);
    console.log(`   Total missing: ${totalMissing} values\n`);
    
    columns.forEach(col => {
      console.log(`   ${col.column}: ${col.missing}/341 (${col.percentage}%) - Importance: ${col.importance}/10`);
    });
  });
  
  // Find columns that are already mostly filled
  console.log('\n✅ COLUMNS ALREADY MOSTLY FILLED (good candidates):');
  sorted
    .filter(([_, data]) => data.missing < 100)
    .forEach(([col, data]) => {
      console.log(`   ${col}: Only ${data.missing} missing (${data.percentage}%)`);
    });
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('1. Finish partially complete columns first (requires_car, has_uber, train_station)');
  console.log('2. Climate data (humidity, sunshine) - affects comfort');
  console.log('3. Visa/retirement requirements - critical for eligibility');
  console.log('4. Internet speed - essential for remote workers');
  console.log('5. Beaches nearby - popular retirement amenity');
}

analyzeRemainingGaps();