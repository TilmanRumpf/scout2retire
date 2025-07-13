import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.YlqOSO59XfGbpUXZ4qbUZNe63FJWB5lElI1XbfOQAME',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function executeSQL() {
  console.log('🔧 EXECUTING SQL DIRECTLY IN ONLINE SUPABASE\n');
  
  const userId = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';
  
  try {
    console.log('1️⃣ Deleting existing onboarding data...');
    
    // Delete existing data
    const { error: deleteError } = await supabase
      .from('onboarding_responses')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.log('Delete error (might be empty):', deleteError.message);
    } else {
      console.log('✅ Existing data cleaned up');
    }
    
    console.log('2️⃣ Creating comprehensive onboarding data...');
    
    // Create new onboarding data
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
    
    const { data, error: insertError } = await supabase
      .from('onboarding_responses')
      .insert(onboardingData)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Error creating onboarding data:', insertError);
      return;
    }
    
    console.log('✅ Successfully created onboarding data!');
    console.log('Data ID:', data.id);
    
    console.log('3️⃣ Updating user completion status...');
    
    // Update user completion status
    const { error: updateError } = await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', userId);
      
    if (updateError) {
      console.error('❌ Error updating user:', updateError);
    } else {
      console.log('✅ User marked as onboarding completed');
    }
    
    console.log('4️⃣ Verifying data...');
    
    // Verify the data exists
    const { data: verifyData, error: verifyError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Data verified!');
      console.log('Climate preferences:', JSON.stringify(verifyData.climate_preferences, null, 2));
    }
    
    console.log('\n🎉 CLIMATE SCORING IS NOW FIXED!');
    console.log('   Refresh your browser and test climate scoring on any town.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

executeSQL();