import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Initialize Claude with API key from environment
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'YOUR_API_KEY_HERE'
});

async function analyzeTownHobbies(town, allHobbies) {
  const prompt = `You are analyzing a retirement town to determine which hobbies and activities are available there.

Town: ${town.name}
State/Region: ${town.state_code || town.region}
Country: ${town.country}
Population: ${town.population || 'Unknown'}
Description: ${town.description || 'No description'}
Climate: Summer ${town.summer_temp_avg}°F, Winter ${town.winter_temp_avg}°F
Geography: ${town.geographic_features ? town.geographic_features.join(', ') : 'Unknown'}
Near Ocean: ${town.near_ocean ? 'Yes' : 'No'}
Near Mountains: ${town.near_mountains ? 'Yes' : 'No'}
Infrastructure: ${JSON.stringify(town.activity_infrastructure || {})}

Available hobbies to choose from:
${allHobbies.map(h => `- ${h.name} (${h.category})`).join('\n')}

Based on the town's characteristics, climate, geography, and infrastructure, return a JSON array of hobby names that would realistically be available in this town. Consider:
- Climate suitability (e.g., no winter sports in Florida)
- Geography (e.g., sailing near ocean, hiking near mountains)
- Population size (larger towns have more diverse activities)
- Infrastructure mentioned
- Common sense about what activities exist where

Be generous but realistic. Return ONLY a JSON array of hobby names, nothing else.
Example: ["Walking", "Swimming", "Golf", "Tennis", "Reading", "Gardening"]`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Cheap and fast
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text.trim();
    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error(`Error analyzing ${town.name}:`, error.message);
    return [];
  }
}

async function populateTownHobbies() {
  console.log('🚀 Starting AI-powered town hobby population...\n');

  // Get all hobbies
  const { data: hobbies, error: hobbyError } = await supabase
    .from('hobbies')
    .select('*')
    .order('name');

  if (hobbyError) {
    console.error('Error fetching hobbies:', hobbyError);
    return;
  }

  console.log(`📚 Loaded ${hobbies.length} hobbies from database\n`);

  // Get all towns
  const { data: towns, error: townError } = await supabase
    .from('towns')
    .select('*')
    .order('name');

  if (townError) {
    console.error('Error fetching towns:', townError);
    return;
  }

  console.log(`🏘️ Processing ${towns.length} towns...\n`);

  // Process towns in batches to avoid rate limits
  const batchSize = 5;
  let processedCount = 0;
  let totalAssociations = 0;

  for (let i = 0; i < towns.length; i += batchSize) {
    const batch = towns.slice(i, Math.min(i + batchSize, towns.length));
    
    const batchPromises = batch.map(async (town) => {
      console.log(`🔍 Analyzing ${town.name}, ${town.state_code || town.country}...`);
      
      // Get AI recommendations
      const recommendedHobbies = await analyzeTownHobbies(town, hobbies);
      
      if (recommendedHobbies.length === 0) {
        console.log(`   ⚠️ No hobbies identified for ${town.name}`);
        return 0;
      }

      // Find hobby IDs for the recommended hobbies
      const hobbyRecords = hobbies.filter(h => 
        recommendedHobbies.includes(h.name)
      );

      // Prepare insert data
      const townHobbies = hobbyRecords.map(hobby => ({
        town_id: town.id,
        hobby_id: hobby.id
      }));

      // Insert into town_hobbies table
      const { error: insertError } = await supabase
        .from('town_hobbies')
        .insert(townHobbies);

      if (insertError) {
        console.log(`   ❌ Error inserting hobbies for ${town.name}:`, insertError.message);
        return 0;
      }

      console.log(`   ✅ Added ${hobbyRecords.length} hobbies to ${town.name}`);
      return hobbyRecords.length;
    });

    const results = await Promise.all(batchPromises);
    const batchTotal = results.reduce((sum, count) => sum + count, 0);
    totalAssociations += batchTotal;
    processedCount += batch.length;

    console.log(`\n📊 Progress: ${processedCount}/${towns.length} towns processed`);
    console.log(`   Total associations created: ${totalAssociations}\n`);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < towns.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n🎉 COMPLETE!');
  console.log(`   Processed ${processedCount} towns`);
  console.log(`   Created ${totalAssociations} town-hobby associations`);
  console.log(`   Average ${(totalAssociations / processedCount).toFixed(1)} hobbies per town`);

  // Verify a sample
  const { data: sample } = await supabase
    .from('town_hobbies')
    .select(`
      town:towns(name),
      hobby:hobbies(name)
    `)
    .limit(10);

  if (sample && sample.length > 0) {
    console.log('\n📝 Sample associations:');
    sample.forEach(s => {
      console.log(`   ${s.town.name} → ${s.hobby.name}`);
    });
  }
}

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('⚠️  Please set ANTHROPIC_API_KEY environment variable');
  console.log('   Run: export ANTHROPIC_API_KEY="your-key-here"');
  console.log('   Or edit this file and replace YOUR_API_KEY_HERE');
  process.exit(1);
}

populateTownHobbies().catch(console.error);