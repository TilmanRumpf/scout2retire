import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkInterestsVsPreferences() {
  console.log('🔍 CHECKING INTERESTS_SUPPORTED VS USER PREFERENCES\n');
  console.log('===================================================\n');
  
  // Get all unique interests from towns
  const { data: towns, error: townsError } = await supabase
    .from('towns')
    .select('interests_supported');
    
  if (townsError) {
    console.error('Error fetching towns:', townsError);
    return;
  }
  
  // Get user preferences table structure
  const { data: preferences, error: prefsError } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(10);
    
  if (prefsError) {
    console.error('Error fetching user preferences:', prefsError);
    return;
  }
  
  // Collect all unique interests from towns
  const allTownInterests = new Set();
  towns.forEach(town => {
    if (town.interests_supported && Array.isArray(town.interests_supported)) {
      town.interests_supported.forEach(interest => {
        allTownInterests.add(interest);
      });
    }
  });
  
  console.log(`📊 TOWNS INTERESTS_SUPPORTED:\n`);
  console.log(`Total unique interests: ${allTownInterests.size}\n`);
  
  // Show user preferences structure
  console.log('👤 USER PREFERENCES TABLE STRUCTURE:\n');
  if (preferences && preferences.length > 0) {
    const samplePref = preferences[0];
    console.log('Columns found:');
    Object.keys(samplePref).forEach(key => {
      const value = samplePref[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`  - ${key}: ${type}`);
    });
    
    // Check if there's an interests or similar field
    const interestFields = Object.keys(samplePref).filter(key => 
      key.toLowerCase().includes('interest') || 
      key.toLowerCase().includes('hobby') ||
      key.toLowerCase().includes('activity') ||
      key.toLowerCase().includes('preference')
    );
    
    console.log('\n🎯 POTENTIAL INTEREST FIELDS IN USER_PREFERENCES:\n');
    if (interestFields.length > 0) {
      interestFields.forEach(field => {
        console.log(`  - ${field}`);
        // Show sample values
        const values = new Set();
        preferences.forEach(p => {
          if (p[field]) {
            if (Array.isArray(p[field])) {
              p[field].forEach(v => values.add(v));
            } else {
              values.add(p[field]);
            }
          }
        });
        if (values.size > 0) {
          console.log(`    Sample values: ${Array.from(values).slice(0, 5).join(', ')}`);
        }
      });
    } else {
      console.log('  No obvious interest/hobby fields found');
    }
    
    // Show sample user preferences data
    console.log('\n📋 SAMPLE USER PREFERENCES DATA:\n');
    preferences.slice(0, 3).forEach((pref, idx) => {
      console.log(`User ${idx + 1}:`);
      Object.entries(pref).forEach(([key, value]) => {
        if (value && (Array.isArray(value) ? value.length > 0 : true)) {
          const displayValue = Array.isArray(value) ? 
            `[${value.slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}]` : 
            value;
          console.log(`  ${key}: ${displayValue}`);
        }
      });
      console.log('');
    });
  } else {
    console.log('No user preferences found in database');
  }
  
  // Show all unique interests from towns (sorted)
  console.log('📝 ALL UNIQUE INTERESTS FROM TOWNS (for reference):\n');
  const sortedInterests = Array.from(allTownInterests).sort();
  
  // Group by category for better readability
  const categories = {
    lifestyle: [],
    activities: [],
    culture: [],
    geographic: [],
    economic: [],
    other: []
  };
  
  sortedInterests.forEach(interest => {
    if (interest.includes('lifestyle') || interest.includes('living')) {
      categories.lifestyle.push(interest);
    } else if (interest.includes('sport') || interest.includes('hiking') || 
               interest.includes('diving') || interest.includes('surf')) {
      categories.activities.push(interest);
    } else if (interest.includes('culture') || interest.includes('art') || 
               interest.includes('music') || interest.includes('cuisine')) {
      categories.culture.push(interest);
    } else if (interest.includes('beach') || interest.includes('mountain') || 
               interest.includes('coastal') || interest.includes('desert')) {
      categories.geographic.push(interest);
    } else if (interest.includes('affordable') || interest.includes('luxury') || 
               interest.includes('budget')) {
      categories.economic.push(interest);
    } else {
      categories.other.push(interest);
    }
  });
  
  Object.entries(categories).forEach(([category, interests]) => {
    if (interests.length > 0) {
      console.log(`\n${category.toUpperCase()} (${interests.length}):`);
      interests.forEach(i => console.log(`  - ${i}`));
    }
  });
  
  // Check for case inconsistencies
  console.log('\n⚠️ CASE/FORMATTING ANALYSIS:\n');
  
  const caseIssues = [];
  sortedInterests.forEach(interest => {
    // Check for inconsistent use of underscores vs spaces
    if (interest.includes(' ')) {
      caseIssues.push(`Has spaces: "${interest}"`);
    }
    // Check for mixed case
    if (interest !== interest.toLowerCase()) {
      caseIssues.push(`Not lowercase: "${interest}"`);
    }
  });
  
  if (caseIssues.length > 0) {
    console.log('Issues found:');
    caseIssues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ All interests use consistent lowercase with underscores');
  }
}

// Run check
checkInterestsVsPreferences().catch(console.error);