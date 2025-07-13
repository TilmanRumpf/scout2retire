import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function createPreferences() {
  console.log('🔧 CREATING PROPER ONBOARDING PREFERENCES FOR YOU\n');
  
  const userId = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';
  
  // Create realistic preferences that will give good climate scoring
  const fullOnboardingData = {
    user_id: userId,
    current_status: {
      citizenship: 'USA',
      timeline: 'within_2_years',
      family_situation: 'couple'
    },
    region_preferences: {
      countries: ['Portugal', 'Spain', 'Italy', 'France'],
      regions: ['Europe', 'Mediterranean'],
      geographic_features: ['Coastal', 'Historic']
    },
    climate_preferences: {
      seasonal_preference: 'warm_all_year',
      summer_climate_preference: 'warm',
      winter_climate_preference: 'mild',
      humidity_level: 'moderate',
      sunshine: 'abundant',
      precipitation: 'rarely_rainy'
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
      interests: ['cultural', 'culinary', 'coastal']
    },
    administration: {
      healthcare_quality: ['good'],
      safety_importance: ['good'],
      visa_preference: ['functional']
    },
    costs: {
      total_monthly_budget: 3000,
      max_monthly_rent: 1200
    }
  };
  
  console.log('Creating onboarding data...');
  
  // Insert into onboarding_responses
  const { data, error } = await supabase
    .from('onboarding_responses')
    .insert(fullOnboardingData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating onboarding data:', error);
    return;
  }
  
  console.log('✅ Created onboarding data with ID:', data.id);
  console.log('Climate preferences:', JSON.stringify(data.climate_preferences, null, 2));
  
  // Also create in user_preferences table if it exists
  try {
    const { error: userPrefError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        ...fullOnboardingData
      });
      
    if (!userPrefError) {
      console.log('✅ Also created in user_preferences table');
    }
  } catch (err) {
    console.log('user_preferences table might not exist, that\'s fine');
  }
  
  console.log('\n🎉 DONE! Now your climate preferences should work!');
  console.log('   - Summer: warm');
  console.log('   - Winter: mild'); 
  console.log('   - Humidity: moderate');
  console.log('   - Sunshine: abundant');
  
  console.log('\nRefresh your browser to see the climate scoring working!');
}

createPreferences();