import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeUserInterestsField() {
  console.log('🔍 ANALYZING USER PREFERENCES INTERESTS FIELD\n');
  console.log('==============================================\n');
  
  // Get all user preferences with interests
  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .select('id, interests, activities')
    .not('interests', 'is', null);
    
  if (error) {
    console.error('Error fetching preferences:', error);
    return;
  }
  
  console.log(`Found ${preferences.length} users with interests data\n`);
  
  // Collect all unique interests from users
  const userInterests = new Set();
  const userActivities = new Set();
  
  preferences.forEach(pref => {
    // Collect interests
    if (pref.interests && Array.isArray(pref.interests)) {
      pref.interests.forEach(interest => {
        userInterests.add(interest);
      });
    }
    
    // Collect activities
    if (pref.activities && Array.isArray(pref.activities)) {
      pref.activities.forEach(activity => {
        userActivities.add(activity);
      });
    }
  });
  
  console.log('📊 USER INTERESTS FIELD VALUES:\n');
  console.log(`Total unique interests: ${userInterests.size}`);
  
  if (userInterests.size > 0) {
    console.log('\nAll user interests found:');
    Array.from(userInterests).sort().forEach(interest => {
      console.log(`  - "${interest}"`);
    });
  }
  
  console.log('\n📊 USER ACTIVITIES FIELD VALUES:\n');
  console.log(`Total unique activities: ${userActivities.size}`);
  
  if (userActivities.size > 0) {
    console.log('\nAll user activities found:');
    Array.from(userActivities).sort().forEach(activity => {
      console.log(`  - "${activity}"`);
    });
  }
  
  // Get town interests for comparison
  const { data: towns } = await supabase
    .from('towns')
    .select('interests_supported')
    .limit(1);
  
  const townInterests = new Set();
  towns.forEach(town => {
    if (town.interests_supported && Array.isArray(town.interests_supported)) {
      town.interests_supported.forEach(interest => {
        townInterests.add(interest);
      });
    }
  });
  
  // Check for mismatches
  console.log('\n⚠️ MISMATCHES ANALYSIS:\n');
  
  console.log('User interests NOT in town interests:');
  Array.from(userInterests).forEach(userInt => {
    if (!townInterests.has(userInt)) {
      // Try to find similar matches
      const similar = Array.from(townInterests).filter(townInt => 
        townInt.includes(userInt) || userInt.includes(townInt) ||
        townInt.replace(/_/g, '') === userInt.replace(/_/g, '')
      );
      
      if (similar.length > 0) {
        console.log(`  - "${userInt}" → similar in towns: [${similar.join(', ')}]`);
      } else {
        console.log(`  - "${userInt}" → NO MATCH IN TOWNS`);
      }
    }
  });
  
  console.log('\nUser activities NOT in town activities:');
  // Get a sample town's activities
  const { data: sampleTown } = await supabase
    .from('towns')
    .select('activities_available')
    .limit(1)
    .single();
  
  const townActivities = new Set(sampleTown?.activities_available || []);
  
  Array.from(userActivities).forEach(userAct => {
    if (!townActivities.has(userAct)) {
      // Try to find similar matches
      const similar = Array.from(townActivities).filter(townAct => 
        townAct.includes(userAct) || userAct.includes(townAct) ||
        townAct.replace(/_/g, '') === userAct.replace(/_/g, '')
      );
      
      if (similar.length > 0) {
        console.log(`  - "${userAct}" → similar in towns: [${similar.slice(0, 3).join(', ')}]`);
      } else {
        console.log(`  - "${userAct}" → NO MATCH IN TOWNS`);
      }
    }
  });
  
  // Show mapping needed
  console.log('\n🔧 REQUIRED MAPPINGS:\n');
  
  const mappings = {
    // User term -> Town term
    'cooking_wine': 'wine_culture',
    'theater': 'theater',
    'wine': 'wine_culture',
    'volunteering': 'volunteering',
    'music': 'music',
    'health_wellness': 'wellness',
    'golf_tennis': ['golf', 'tennis'],
    'fishing': 'fishing',
    'cycling': 'cycling',
    'sailing': 'sailing',
    'walking': 'walking',
    'tennis': 'tennis',
    'history_heritage': ['history', 'heritage']
  };
  
  console.log('User interests/activities → Town interests mapping:');
  Object.entries(mappings).forEach(([user, town]) => {
    console.log(`  "${user}" → ${Array.isArray(town) ? `[${town.join(', ')}]` : `"${town}"`}`);
  });
}

// Run analysis
analyzeUserInterestsField().catch(console.error);