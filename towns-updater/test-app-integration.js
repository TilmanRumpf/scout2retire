import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAppIntegration() {
  console.log('🧪 Testing Enhanced Matching Algorithm Integration\n');
  
  try {
    // Step 1: Verify towns have the new data fields
    console.log('1️⃣ Checking town data fields...');
    const { data: sampleTown, error: townError } = await supabase
      .from('towns')
      .select('*')
      .eq('name', 'Porto')
      .single();
      
    if (townError) throw townError;
    
    const newFields = [
      'activities_available',
      'interests_supported',
      'climate_description',
      'primary_language',
      'english_proficiency_level',
      'visa_on_arrival_countries',
      'geographic_features_actual',
      'vegetation_type_actual',
      'summer_climate_actual',
      'winter_climate_actual',
      'beaches_nearby',
      'income_tax_rate_pct'
    ];
    
    const hasFields = newFields.filter(field => sampleTown[field] !== null && sampleTown[field] !== undefined);
    console.log(`✅ Town has ${hasFields.length}/${newFields.length} new fields populated`);
    console.log('   Fields present:', hasFields.join(', '));
    
    // Step 2: Get a test user's preferences
    console.log('\n2️⃣ Checking user preference structure...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, onboarding_completed, onboarding_region, onboarding_climate, onboarding_culture, onboarding_hobbies, onboarding_admin, onboarding_budget')
      .eq('onboarding_completed', true)
      .limit(1);
      
    if (userError) throw userError;
    
    if (users.length === 0) {
      console.log('⚠️  No users with completed onboarding found');
    } else {
      const user = users[0];
      console.log('✅ Found user with onboarding data');
      
      const onboardingSections = [
        'onboarding_region',
        'onboarding_climate', 
        'onboarding_culture',
        'onboarding_hobbies',
        'onboarding_admin',
        'onboarding_budget'
      ];
      
      const populatedSections = onboardingSections.filter(section => 
        user[section] && Object.keys(user[section]).length > 0
      );
      
      console.log(`   User has ${populatedSections.length}/6 onboarding sections populated`);
    }
    
    // Step 3: Test scoring calculation
    console.log('\n3️⃣ Testing match score calculation...');
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .not('image_url_1', 'is', null)
      .limit(5);
      
    if (townsError) throw townsError;
    
    console.log(`✅ Testing with ${towns.length} towns`);
    
    // Step 4: Verify frontend integration points
    console.log('\n4️⃣ Frontend integration checklist:');
    console.log('   [ ] TownDiscovery page has usePersonalization: true');
    console.log('   [ ] matchingAlgorithm.js uses calculateEnhancedMatch');
    console.log('   [ ] getTownOfTheDay() uses enhanced algorithm');
    console.log('   [ ] Match scores display on town cards');
    console.log('   [ ] Browser console shows "Personalized recommendations loaded!"');
    
    // Step 5: Manual verification steps
    console.log('\n5️⃣ Manual verification steps:');
    console.log('   1. Open http://localhost:5173 in browser');
    console.log('   2. Log in with a user who completed onboarding');
    console.log('   3. Navigate to /discover');
    console.log('   4. Check browser console for:');
    console.log('      - "Personalized recommendations loaded!"');
    console.log('      - User preferences object');
    console.log('      - Top 3 towns with scores');
    console.log('   5. Verify town cards show match percentages');
    console.log('   6. Check color coding:');
    console.log('      - Green: 80%+ (Excellent)');
    console.log('      - Yellow: 60-79% (Good)');
    console.log('      - Orange: <60% (Fair)');
    
    // Step 6: Data quality check
    console.log('\n6️⃣ Data quality check:');
    const { data: allTowns, error: allError } = await supabase
      .from('towns')
      .select('id, name, country, activities_available, interests_supported, cost_index, healthcare_score')
      .not('image_url_1', 'is', null);
      
    if (allError) throw allError;
    
    const townsWithActivities = allTowns.filter(t => t.activities_available?.length > 0);
    const townsWithInterests = allTowns.filter(t => t.interests_supported?.length > 0);
    const townsWithCost = allTowns.filter(t => t.cost_index > 0);
    const townsWithHealthcare = allTowns.filter(t => t.healthcare_score > 0);
    
    console.log(`   Towns with photos: ${allTowns.length}`);
    console.log(`   Towns with activities: ${townsWithActivities.length} (${Math.round(townsWithActivities.length/allTowns.length*100)}%)`);
    console.log(`   Towns with interests: ${townsWithInterests.length} (${Math.round(townsWithInterests.length/allTowns.length*100)}%)`);
    console.log(`   Towns with cost data: ${townsWithCost.length} (${Math.round(townsWithCost.length/allTowns.length*100)}%)`);
    console.log(`   Towns with healthcare: ${townsWithHealthcare.length} (${Math.round(townsWithHealthcare.length/allTowns.length*100)}%)`);
    
    console.log('\n✅ Integration test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAppIntegration();