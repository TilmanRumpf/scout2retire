import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Category weights
const CATEGORY_WEIGHTS = {
  region: 15,
  climate: 20,
  culture: 20,
  hobbies: 20,
  admin: 15,
  budget: 10
};

// Helper function to calculate array overlap score
function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  if (!userArray?.length || !townArray?.length) return 0;
  
  const userSet = new Set(userArray.map(item => item.toLowerCase()));
  const townSet = new Set(townArray.map(item => item.toLowerCase()));
  
  let matches = 0;
  for (const item of userSet) {
    if (townSet.has(item)) matches++;
  }
  
  return (matches / userSet.size) * maxScore;
}

async function testMatching() {
  console.log('🔍 Testing Enhanced Matching Algorithm with Sample Users\n');
  
  try {
    // Test User 1: Beach lover, warm climate, English speaker
    const user1Preferences = {
      region_preferences: {
        countries: ['Mexico', 'Spain', 'Portugal'],
        regions: ['Mediterranean', 'Central America'],
        geographic_features: ['Coastal', 'Beach']
      },
      climate_preferences: {
        summer_climate_preference: 'hot',
        winter_climate_preference: 'warm',
        humidity_level: 'moderate',
        sunshine: 'abundant'
      },
      culture_preferences: {
        language_comfort: { preferences: 'english_only' },
        expat_community_preference: 'large',
        lifestyle_preferences: {
          pace_of_life: 'relaxed',
          urban_rural: 'small_city'
        }
      },
      hobbies_preferences: {
        activities: ['beach', 'swimming', 'dining', 'golf'],
        interests: ['coastal', 'water_sports', 'culinary']
      },
      admin_preferences: {
        healthcare_quality: 'good',
        safety_importance: 'good',
        citizenship: 'USA'
      },
      budget_preferences: {
        total_monthly_budget: 2500,
        max_monthly_rent: 1000
      }
    };
    
    // Test User 2: Culture enthusiast, four seasons, budget conscious
    const user2Preferences = {
      region_preferences: {
        countries: ['Czech Republic', 'Poland', 'Hungary'],
        regions: ['Europe'],
        geographic_features: ['Historic', 'Urban']
      },
      climate_preferences: {
        summer_climate_preference: 'warm',
        winter_climate_preference: 'cold',
        humidity_level: 'moderate',
        sunshine: 'moderate'
      },
      culture_preferences: {
        language_comfort: { preferences: 'willing_to_learn' },
        expat_community_preference: 'moderate',
        lifestyle_preferences: {
          pace_of_life: 'moderate',
          urban_rural: 'large_city'
        },
        cultural_importance: {
          museums: 5,
          cultural_events: 5,
          dining_nightlife: 4
        }
      },
      hobbies_preferences: {
        activities: ['museums', 'concerts', 'walking', 'cafes'],
        interests: ['cultural', 'arts', 'history', 'classical_music']
      },
      admin_preferences: {
        healthcare_quality: 'functional',
        safety_importance: 'functional',
        citizenship: 'USA'
      },
      budget_preferences: {
        total_monthly_budget: 1800,
        max_monthly_rent: 700
      }
    };
    
    // Get towns with photos
    const { data: towns, error } = await supabase
      .from('towns')
      .select('*')
      .not('image_url_1', 'is', null)
      .limit(20);
      
    if (error) throw error;
    
    console.log(`Testing with ${towns.length} towns...\n`);
    
    // Test User 1
    console.log('👤 USER 1: Beach lover, warm climate, English speaker');
    console.log('Budget: $2,500/month | Preferences: Coastal, Hot climate, English-only\n');
    
    const user1Scores = [];
    for (const town of towns) {
      // Simple scoring based on key preferences
      let score = 0;
      
      // Region match
      if (user1Preferences.region_preferences.countries.includes(town.country)) {
        score += 15;
      }
      
      // Climate match (checking for warm/hot climate indicators)
      if (town.climate_description?.toLowerCase().includes('warm') || 
          town.climate_description?.toLowerCase().includes('tropical')) {
        score += 20;
      }
      
      // English proficiency
      if (town.english_proficiency_level === 'native' || 
          town.english_proficiency_level === 'very_high') {
        score += 15;
      }
      
      // Activities match
      if (town.activities_available?.includes('beach') || 
          town.activities_available?.includes('swimming')) {
        score += 20;
      }
      
      // Budget fit
      if (town.cost_index <= user1Preferences.budget_preferences.total_monthly_budget) {
        score += 10;
      }
      
      user1Scores.push({ town: town.name, country: town.country, score });
    }
    
    // Sort and display top 5
    user1Scores.sort((a, b) => b.score - a.score);
    console.log('Top 5 matches:');
    user1Scores.slice(0, 5).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.town}, ${match.country} - ${match.score}%`);
    });
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // Test User 2
    console.log('👤 USER 2: Culture enthusiast, four seasons, budget conscious');
    console.log('Budget: $1,800/month | Preferences: Historic, Museums, Cultural events\n');
    
    const user2Scores = [];
    for (const town of towns) {
      // Simple scoring based on key preferences
      let score = 0;
      
      // Region match
      if (user2Preferences.region_preferences.countries.includes(town.country)) {
        score += 15;
      }
      
      // Activities match
      if (town.activities_available?.includes('museums') || 
          town.activities_available?.includes('concerts')) {
        score += 20;
      }
      
      // Interests match
      if (town.interests_supported?.includes('cultural') || 
          town.interests_supported?.includes('history')) {
        score += 20;
      }
      
      // Budget fit
      if (town.cost_index <= user2Preferences.budget_preferences.total_monthly_budget) {
        score += 10;
      }
      
      // Historic feature
      if (town.description?.toLowerCase().includes('historic') || 
          town.description?.toLowerCase().includes('medieval')) {
        score += 15;
      }
      
      user2Scores.push({ town: town.name, country: town.country, score });
    }
    
    // Sort and display top 5
    user2Scores.sort((a, b) => b.score - a.score);
    console.log('Top 5 matches:');
    user2Scores.slice(0, 5).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.town}, ${match.country} - ${match.score}%`);
    });
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // Verify data completeness
    console.log('📊 Data Completeness Check:');
    let completeTowns = 0;
    let missingFields = {
      activities: 0,
      interests: 0,
      climate: 0,
      cost: 0,
      english: 0
    };
    
    towns.forEach(town => {
      let isComplete = true;
      
      if (!town.activities_available?.length) {
        missingFields.activities++;
        isComplete = false;
      }
      if (!town.interests_supported?.length) {
        missingFields.interests++;
        isComplete = false;
      }
      if (!town.climate_description) {
        missingFields.climate++;
        isComplete = false;
      }
      if (!town.cost_index) {
        missingFields.cost++;
        isComplete = false;
      }
      if (!town.english_proficiency_level) {
        missingFields.english++;
        isComplete = false;
      }
      
      if (isComplete) completeTowns++;
    });
    
    console.log(`  Complete towns: ${completeTowns}/${towns.length}`);
    console.log(`  Missing activities: ${missingFields.activities}`);
    console.log(`  Missing interests: ${missingFields.interests}`);
    console.log(`  Missing climate: ${missingFields.climate}`);
    console.log(`  Missing cost: ${missingFields.cost}`);
    console.log(`  Missing English level: ${missingFields.english}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMatching();