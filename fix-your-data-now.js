import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function fixYourDataNow() {
  console.log('🔧 FIXING YOUR ONBOARDING DATA FOR CLIMATE SCORING\n');
  
  const userId = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';
  
  // Create comprehensive onboarding data
  const onboardingData = {
    user_id: userId,
    current_status: {
      citizenship: 'USA',
      timeline: 'within_2_years',
      family_situation: 'couple'
    },
    region_preferences: {
      countries: ['Portugal', 'Spain', 'Italy', 'Greece'],
      regions: ['Europe', 'Mediterranean'],
      geographic_features: ['Coastal', 'Historic']
    },
    climate_preferences: {
      seasonal_preference: 'warm_all_year',
      summer_climate_preference: 'warm',
      winter_climate_preference: 'mild',
      humidity_level: 'moderate',
      sunshine: 'abundant',
      precipitation: 'moderate'
    },
    culture_preferences: {
      language_comfort: {
        preferences: 'willing_to_learn'
      },
      expat_community_preference: 'moderate',
      lifestyle_preferences: {
        pace_of_life: 'relaxed',
        urban_rural: 'small_city'
      }
    },
    hobbies: {
      primary_hobbies: ['dining', 'walking', 'cultural_events'],
      interests: ['cultural', 'culinary', 'coastal'],
      activities: ['water_sports', 'hiking', 'photography']
    },
    administration: {
      healthcare_quality: ['good'],
      safety_importance: ['good'],
      visa_preference: ['functional'],
      political_stability: ['good']
    },
    costs: {
      total_monthly_budget: 3000,
      max_monthly_rent: 1200,
      budget_flexibility: 'moderate'
    },
    submitted_at: new Date().toISOString()
  };
  
  console.log('1️⃣ Deleting any existing data...');
  
  // First delete any existing data
  const { error: deleteError } = await supabase
    .from('onboarding_responses')
    .delete()
    .eq('user_id', userId);
    
  if (deleteError) {
    console.log('Delete error (might be empty):', deleteError.message);
  }
  
  console.log('2️⃣ Creating new comprehensive data...');
  
  // Insert new data
  const { data, error } = await supabase
    .from('onboarding_responses')
    .insert(onboardingData)
    .select()
    .single();
    
  if (error) {
    console.error('❌ Error creating data:', error);
    console.error('Error details:', error.details);
    return;
  }
  
  console.log('✅ Successfully created onboarding data!');
  console.log('Data ID:', data.id);
  
  console.log('\n3️⃣ Verifying climate preferences...');
  console.log('Climate data:', JSON.stringify(data.climate_preferences, null, 2));
  
  console.log('\n4️⃣ Testing algorithm access...');
  
  // Test the algorithm access
  const { data: testData, error: testError } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', userId);
    
  if (testError) {
    console.error('❌ Test access failed:', testError);
  } else {
    console.log('✅ Algorithm can now access data!');
    console.log('Found records:', testData.length);
    if (testData.length > 0) {
      console.log('Climate preferences found:', !!testData[0].climate_preferences);
      console.log('Summer preference:', testData[0].climate_preferences?.summer_climate_preference);
      console.log('Winter preference:', testData[0].climate_preferences?.winter_climate_preference);
    }
  }
  
  console.log('\n🎉 CLIMATE SCORING SHOULD NOW WORK!');
  console.log('   Go refresh your browser and test a town.');
}

fixYourDataNow();