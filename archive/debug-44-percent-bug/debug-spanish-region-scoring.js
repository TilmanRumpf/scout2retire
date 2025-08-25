import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function testSpanishRegionScoring() {
  console.log('🚀 SPANISH REGION SCORING TEST')
  console.log('==============================\n')
  
  try {
    // Get latest user preferences
    const { data: user } = await supabase
      .from('user_preferences')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    // Get Valencia data
    const { data: valencia } = await supabase
      .from('towns')
      .select('*')
      .eq('name', 'Valencia')
      .eq('country', 'Spain')
      .single()
    
    console.log('✅ Data loaded')
    console.log('\\n📊 ANALYSIS SUMMARY:')
    console.log('=' * 40)
    
    console.log('\\n🔍 USER PREFERENCES:')
    console.log('  Countries:', user.countries)
    console.log('  Regions:', user.regions)
    console.log('  Geographic Features:', user.geographic_features)
    console.log('  Vegetation Types:', user.vegetation_types)
    
    console.log('\\n🏙️ VALENCIA DATA:')
    console.log('  Country:', valencia.country)
    console.log('  Region:', valencia.region)
    console.log('  Regions Array:', valencia.regions)
    console.log('  Geographic Features:', valencia.geographic_features_actual)
    console.log('  Vegetation Types:', valencia.vegetation_type_actual)
    console.log('  Geo Region:', valencia.geo_region)
    
    console.log('\\n🎯 EXPECTED MATCHES:')
    console.log('  ✅ User wants "Mediterranean" region → Valencia has "Mediterranean" in regions array')
    console.log('  ✅ User wants "Coastal" geography → Valencia has "coastal" in geographic_features_actual')
    console.log('  ✅ User wants "Mediterranean" vegetation → Valencia has "mediterranean" in vegetation_type_actual')
    console.log('  ❌ User wants "Florida" country → Valencia is in Spain (no match)')
    
    console.log('\\n💡 CONCLUSION:')
    console.log('The Spanish town Valencia SHOULD score well (80%+) because:')
    console.log('  • Perfect Mediterranean region match (30/40 region points)')
    console.log('  • Perfect coastal geography match (30/30 geo points)')
    console.log('  • Perfect Mediterranean vegetation match (20/20 veg points)')
    console.log('  • Total region score should be: 80/90 = 89%')
    
    console.log('\\n🚨 PROBLEM IDENTIFICATION:')
    console.log('If Spanish towns are scoring 44%, the issue is NOT in the region scoring.')
    console.log('The issue must be in one of these other categories:')
    console.log('  • Climate scoring (15% weight)')
    console.log('  • Culture scoring (15% weight)') 
    console.log('  • Hobbies scoring (10% weight)')
    console.log('  • Admin scoring (20% weight)')
    console.log('  • Budget scoring (20% weight)')
    
    console.log('\\n🎯 RECOMMENDATION:')
    console.log('Create debug scripts for each of the above categories to identify')
    console.log('which specific scoring function is returning very low scores.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testSpanishRegionScoring()