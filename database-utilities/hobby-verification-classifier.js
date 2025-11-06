/**
 * PROFESSIONAL HOBBY VERIFICATION CLASSIFIER
 * 
 * This tool systematically classifies each hobby's verification method
 * with human review at each step to prevent errors
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline/promises';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Verification method definitions
const VERIFICATION_METHODS = {
  universal: {
    name: 'universal',
    description: 'Available everywhere, no verification needed',
    example: 'Reading, Cooking, Meditation'
  },
  database_infrastructure: {
    name: 'database_infrastructure',
    description: 'Check existing database columns for infrastructure',
    example: 'Golf (check golf_courses_count), Swimming (check water_bodies)',
    query_template: 'column_name > 0 OR column_name IS NOT NULL'
  },
  database_geographic: {
    name: 'database_geographic',
    description: 'Check geographic/climate database columns',
    example: 'Beach activities (distance_to_ocean_km < 10)',
    query_template: 'distance_to_ocean_km < X OR elevation_meters > Y'
  },
  ai_terrain: {
    name: 'ai_terrain',
    description: 'Requires AI to verify terrain/natural features',
    example: 'Rock Climbing (needs cliffs), Mountain Biking (needs trails)',
    ai_prompt_template: 'Does {town} have {feature} suitable for {hobby}?'
  },
  ai_facilities: {
    name: 'ai_facilities',
    description: 'Requires AI to check local facilities/businesses',
    example: 'Yoga Studios, Martial Arts Dojos, Dance Studios',
    ai_prompt_template: 'List {facility_type} in {town}'
  },
  ai_community: {
    name: 'ai_community',
    description: 'Requires AI to verify local community/culture',
    example: 'Wine Tasting (wine culture), Surfing (surf community)',
    ai_prompt_template: 'Is {hobby} popular or available in {town}?'
  },
  manual: {
    name: 'manual',
    description: 'Too complex for automated verification',
    example: 'Highly specialized or ambiguous activities'
  }
};

// Classification rules based on patterns
const CLASSIFICATION_RULES = {
  // Universal activities - can be done anywhere
  universal_keywords: [
    'reading', 'writing', 'meditation', 'cooking', 'baking',
    'knitting', 'chess', 'board games', 'video games', 'collecting',
    'language learning', 'online', 'virtual', 'listening'
  ],
  
  // Database verifiable - infrastructure
  infrastructure_patterns: {
    'golf': { method: 'database_infrastructure', check: 'golf_courses_count > 0' },
    'tennis': { method: 'database_infrastructure', check: 'tennis_courts_count > 0' },
    'swimming': { method: 'database_infrastructure', check: 'water_bodies IS NOT NULL OR pools_count > 0' },
    'bowling': { method: 'database_infrastructure', check: 'bowling_alleys_count > 0' },
    'gym': { method: 'database_infrastructure', check: 'fitness_centers_count > 0' }
  },
  
  // Database verifiable - geographic
  geographic_patterns: {
    'beach': { method: 'database_geographic', check: 'distance_to_ocean_km < 10' },
    'coastal': { method: 'database_geographic', check: 'distance_to_ocean_km < 50' },
    'mountain': { method: 'database_geographic', check: 'elevation_meters > 500 OR geographic_features LIKE "%mountain%"' },
    'skiing': { method: 'database_geographic', check: 'ski_resorts_within_100km > 0' },
    'desert': { method: 'database_geographic', check: 'geographic_features LIKE "%desert%"' }
  },
  
  // AI required - terrain
  terrain_keywords: [
    'climbing', 'bouldering', 'caving', 'spelunking',
    'white water', 'rapids', 'cliff', 'canyon'
  ],
  
  // AI required - facilities
  facility_keywords: [
    'studio', 'dojo', 'academy', 'school', 'club',
    'league', 'association', 'center'
  ],
  
  // AI required - community
  community_keywords: [
    'scene', 'community', 'culture', 'tradition',
    'festival', 'local', 'regional'
  ]
};

async function classifyHobby(hobby) {
  console.log('\n' + '='.repeat(60));
  console.log(`HOBBY: ${hobby.name}`);
  console.log(`Category: ${hobby.category}`);
  console.log(`Currently Universal: ${hobby.is_universal}`);
  
  if (hobby.required_conditions?.needs) {
    console.log(`Current Conditions: ${JSON.stringify(hobby.required_conditions.needs)}`);
  }
  
  console.log('\n📊 AUTO-CLASSIFICATION SUGGESTION:');
  
  // Suggest classification based on patterns
  const suggestion = await suggestClassification(hobby);
  console.log(`Suggested Method: ${suggestion.method}`);
  console.log(`Reason: ${suggestion.reason}`);
  
  if (suggestion.verification_query) {
    console.log(`Query: ${suggestion.verification_query}`);
  }
  
  console.log('\n🎯 VERIFICATION METHODS:');
  Object.entries(VERIFICATION_METHODS).forEach(([key, method], index) => {
    console.log(`${index + 1}. ${method.name}: ${method.description}`);
    console.log(`   Example: ${method.example}`);
  });
  
  const choice = await rl.question('\n✅ Choose verification method (1-7) or (s)kip: ');
  
  if (choice.toLowerCase() === 's') {
    return null;
  }
  
  const methodKeys = Object.keys(VERIFICATION_METHODS);
  const selectedMethod = VERIFICATION_METHODS[methodKeys[parseInt(choice) - 1]];
  
  if (!selectedMethod) {
    console.log('❌ Invalid choice, skipping...');
    return null;
  }
  
  // Build the verification object
  const verification = {
    method: selectedMethod.name,
    auto_suggested: suggestion.method === selectedMethod.name,
    reviewed_by: 'human',
    reviewed_at: new Date().toISOString()
  };
  
  // Add method-specific details
  if (selectedMethod.name.includes('database')) {
    const query = await rl.question('Enter verification query (or press Enter for default): ');
    if (query) {
      verification.query = query;
    } else if (suggestion.verification_query) {
      verification.query = suggestion.verification_query;
    }
  } else if (selectedMethod.name.includes('ai')) {
    const prompt = await rl.question('Enter AI prompt template (or press Enter for default): ');
    if (prompt) {
      verification.ai_prompt = prompt;
    }
  }
  
  // Add notes if needed
  const notes = await rl.question('Any notes? (press Enter to skip): ');
  if (notes) {
    verification.notes = notes;
  }
  
  return verification;
}

async function suggestClassification(hobby) {
  const nameLower = hobby.name.toLowerCase();
  
  // Check if it's already universal
  if (hobby.is_universal) {
    return { 
      method: 'universal', 
      reason: 'Already marked as universal in database' 
    };
  }
  
  // Check universal keywords
  for (const keyword of CLASSIFICATION_RULES.universal_keywords) {
    if (nameLower.includes(keyword)) {
      return { 
        method: 'universal', 
        reason: `Contains universal keyword: ${keyword}` 
      };
    }
  }
  
  // Check infrastructure patterns
  for (const [pattern, config] of Object.entries(CLASSIFICATION_RULES.infrastructure_patterns)) {
    if (nameLower.includes(pattern)) {
      return {
        method: config.method,
        reason: `Matches infrastructure pattern: ${pattern}`,
        verification_query: config.check
      };
    }
  }
  
  // Check geographic patterns
  for (const [pattern, config] of Object.entries(CLASSIFICATION_RULES.geographic_patterns)) {
    if (nameLower.includes(pattern)) {
      return {
        method: config.method,
        reason: `Matches geographic pattern: ${pattern}`,
        verification_query: config.check
      };
    }
  }
  
  // Check terrain keywords
  for (const keyword of CLASSIFICATION_RULES.terrain_keywords) {
    if (nameLower.includes(keyword)) {
      return {
        method: 'ai_terrain',
        reason: `Contains terrain keyword: ${keyword}`
      };
    }
  }
  
  // Check facility keywords
  for (const keyword of CLASSIFICATION_RULES.facility_keywords) {
    if (nameLower.includes(keyword)) {
      return {
        method: 'ai_facilities',
        reason: `Contains facility keyword: ${keyword}`
      };
    }
  }
  
  // Check existing conditions
  if (hobby.required_conditions?.needs?.length > 0) {
    const needs = hobby.required_conditions.needs;
    if (needs.includes('ocean') || needs.includes('mountains') || needs.includes('water_body')) {
      return {
        method: 'database_geographic',
        reason: `Has geographic requirement: ${needs.join(', ')}`
      };
    }
    if (needs.includes('basic_facilities') || needs.includes('space')) {
      return {
        method: 'ai_facilities',
        reason: `Requires facilities: ${needs.join(', ')}`
      };
    }
  }
  
  // Default to AI community for unknowns
  return {
    method: 'ai_community',
    reason: 'No clear pattern matched, likely needs community verification'
  };
}

async function processHobbies() {
  console.log('🎯 PROFESSIONAL HOBBY VERIFICATION CLASSIFIER');
  console.log('============================================\n');
  
  // Get batch size
  const batchSize = await rl.question('How many hobbies to process? (default 10): ') || '10';
  const limit = parseInt(batchSize);
  
  // Get starting point
  const skipCount = await rl.question('Skip how many? (default 0): ') || '0';
  const offset = parseInt(skipCount);
  
  // Fetch hobbies
  console.log(`\nFetching ${limit} hobbies starting from position ${offset}...`);
  const { data: hobbies, error } = await supabase
    .from('hobbies')
    .select('*')
    .order('town_name')
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('❌ Error fetching hobbies:', error);
    return;
  }
  
  console.log(`✅ Found ${hobbies.length} hobbies to process\n`);
  
  const updates = [];
  
  // Process each hobby
  for (const hobby of hobbies) {
    const verification = await classifyHobby(hobby);
    
    if (verification) {
      // Merge with existing required_conditions
      const updatedConditions = {
        ...hobby.required_conditions,
        verification
      };
      
      updates.push({
        id: hobby.id,
        name: hobby.name,
        required_conditions: updatedConditions
      });
      
      console.log(`✅ Classified: ${verification.method}`);
    } else {
      console.log(`⏭️  Skipped`);
    }
  }
  
  // Show summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CLASSIFICATION SUMMARY:');
  console.log(`Processed: ${hobbies.length} hobbies`);
  console.log(`Classified: ${updates.length}`);
  console.log(`Skipped: ${hobbies.length - updates.length}`);
  
  if (updates.length > 0) {
    console.log('\n📝 Updates to apply:');
    updates.forEach(u => {
      console.log(`  ${u.name}: ${u.required_conditions.verification.method}`);
    });
    
    const confirm = await rl.question('\n💾 Apply these updates to database? (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      console.log('\n🔄 Updating database...');
      
      for (const update of updates) {
        const { error } = await supabase
          .from('hobbies')
          .update({ required_conditions: update.required_conditions })
          .eq('id', update.id);
        
        if (error) {
          console.error(`❌ Failed to update ${update.name}:`, error);
        } else {
          console.log(`✅ Updated ${update.name}`);
        }
      }
      
      console.log('\n✨ Database updates complete!');
    } else {
      console.log('\n❌ Updates cancelled');
    }
  }
  
  const continueProcess = await rl.question('\n🔄 Process more hobbies? (y/n): ');
  
  if (continueProcess.toLowerCase() === 'y') {
    rl.close();
    await processHobbies();
  } else {
    console.log('\n👋 Classification session complete!');
    rl.close();
  }
}

// Run the classifier
processHobbies().catch(console.error);