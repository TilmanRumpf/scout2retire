import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

// Known landmarks database (within 20km of town centers)
const REGIONAL_LANDMARKS = {
  // Netherlands
  'Lemmer': ['Woudagemaal UNESCO Steam Pumping Station', 'IJsselmeer Lake', 'Historic Lemmer Lock'],
  'Haarlem': ['Frans Hals Museum', 'Grote Kerk (St. Bavo Church)', 'Teylers Museum'],
  
  // Florida beaches
  'Sarasota': ['Ringling Museum of Art', 'Marie Selby Botanical Gardens', 'Ca\' d\'Zan Mansion'],
  'Naples': ['Naples Pier', 'Artis-Naples Cultural Center', 'Corkscrew Swamp Sanctuary'],
  'Venice (FL)': ['Venice Beach', 'Historic Venice Train Depot', 'Venetian Waterway Park'],
  'Fort Myers': ['Edison and Ford Winter Estates', 'Calusa Nature Center', 'Southwest Florida Museum'],
  
  // Small European towns
  'Dinant': ['Citadel of Dinant', 'Collegiate Church of Notre-Dame', 'Saxophone Monument'],
  'Trogir': ['Trogir Cathedral', 'Kamerlengo Fortress', 'UNESCO Old Town'],
  'Rovinj': ['Church of St. Euphemia', 'Rovinj Old Town', 'Batana Eco-Museum'],
  
  // Caribbean
  'Castries': ['Cathedral Basilica', 'Derek Walcott Square', 'Morne Fortune'],
  'Sosúa': ['Jewish Museum', 'Sosúa Beach', 'El Choco National Park'],
  
  // Default landmarks by type
  coastal: ['Historic Harbor', 'Waterfront Promenade', 'Maritime Museum'],
  mountain: ['Mountain Viewpoint', 'Historic Alpine Village', 'Mountain Chapel'],
  island: ['Island Heritage Center', 'Historic Fort', 'Traditional Market'],
  historic: ['Old Town Square', 'Historic Cathedral', 'Town Museum'],
  capital: ['National Museum', 'Parliament Building', 'Presidential Palace'],
};

async function generateLandmarks(town) {
  // Check for known landmarks first
  if (REGIONAL_LANDMARKS[town.name]) {
    return REGIONAL_LANDMARKS[town.name];
  }
  
  // Use AI to generate realistic landmarks
  const prompt = `Generate 3 real or highly plausible cultural landmarks within 20km of ${town.name}, ${town.country}.

Context:
- Population: ${town.population || 'Unknown'}
- Region: ${town.state_code || town.region || 'Unknown'}
- Geographic features: ${town.geographic_features || 'Unknown'}
- Description: ${town.description || 'No description'}

Return ONLY a JSON array of 3 landmark names. Each should be:
1. A specific, named landmark (not generic like "beach" or "museum")
2. Culturally or historically significant
3. Within 20km of the town center
4. Real if you know actual landmarks, otherwise create plausible ones based on the region

Example format: ["Landmark Name 1", "Landmark Name 2", "Landmark Name 3"]

For small towns without famous landmarks, include nearby natural features, historic buildings, or regional attractions.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const landmarks = JSON.parse(jsonMatch[0]);
      // Validate and clean landmarks
      return landmarks
        .filter(l => l && typeof l === 'string' && l.length > 3)
        .slice(0, 3)
        .map(l => l.trim());
    }
  } catch (error) {
    console.log(`Error generating landmarks for ${town.name}: ${error.message}`);
  }
  
  // Fallback to generic landmarks based on features
  return generateFallbackLandmarks(town);
}

function generateFallbackLandmarks(town) {
  const landmarks = [];
  
  // Based on geographic features
  if (town.geographic_features && Array.isArray(town.geographic_features)) {
    const features = town.geographic_features.join(' ').toLowerCase();
    
    if (features.includes('coastal') || features.includes('beach')) {
      landmarks.push(`${town.name} Harbor`, `${town.name} Beach Promenade`, 'Maritime Heritage Museum');
    } else if (features.includes('mountain')) {
      landmarks.push(`${town.name} Mountain Lookout`, 'Historic Mountain Chapel', 'Alpine Heritage Center');
    } else if (features.includes('island')) {
      landmarks.push(`${town.name} Island Fort`, 'Traditional Fish Market', 'Island Cultural Center');
    } else if (features.includes('valley')) {
      landmarks.push(`${town.name} Valley Viewpoint`, 'Historic Town Bridge', 'Valley Heritage Museum');
    }
  }
  
  // Add town-specific landmarks
  if (landmarks.length < 3) {
    landmarks.push(`${town.name} Historic Center`);
    landmarks.push(`${town.name} Main Square`);
    landmarks.push(`${town.name} Town Museum`);
  }
  
  return landmarks.slice(0, 3);
}

async function enrichCulturalLandmarks(options = {}) {
  const { testMode = false, limit = null } = options;
  
  console.log('🏛️ ENRICHING CULTURAL LANDMARKS\n');
  console.log('Including landmarks within 20km of town centers\n');
  
  // Get towns without cultural landmarks
  let query = supabase
    .from('towns')
    .select('*')
    .is('cultural_landmark_1', null)
    .order('country', { ascending: true });
    
  if (limit) query = query.limit(limit);
  
  const { data: towns, error } = await query;
  
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Found ${towns.length} towns without cultural landmarks\n`);
  
  if (testMode) {
    console.log('TEST MODE: Processing first 5 towns only\n');
    towns.splice(5);
  }
  
  let successCount = 0;
  let errorCount = 0;
  let aiCount = 0;
  let fallbackCount = 0;
  const estimatedCost = towns.length * 0.00005; // Haiku cost estimate
  
  console.log(`Estimated cost: $${estimatedCost.toFixed(4)}\n`);
  console.log('Processing...\n');
  
  for (let i = 0; i < towns.length; i++) {
    const town = towns[i];
    console.log(`[${i + 1}/${towns.length}] ${town.name}, ${town.country}`);
    
    // Generate landmarks
    const landmarks = await generateLandmarks(town);
    
    if (!landmarks || landmarks.length === 0) {
      console.log(`  ❌ Failed to generate landmarks`);
      errorCount++;
      continue;
    }
    
    // Check if AI or fallback was used
    if (REGIONAL_LANDMARKS[town.name]) {
      console.log(`  📚 Using known landmarks database`);
    } else if (landmarks[0].includes(town.name)) {
      console.log(`  🔧 Using fallback landmarks`);
      fallbackCount++;
    } else {
      console.log(`  🤖 Generated with AI`);
      aiCount++;
    }
    
    // Update database
    const updateData = {
      cultural_landmark_1: landmarks[0] || null,
      cultural_landmark_2: landmarks[1] || null,
      cultural_landmark_3: landmarks[2] || null
    };
    
    const { error: updateError } = await supabase
      .from('towns')
      .update(updateData)
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`  ❌ Database update failed: ${updateError.message}`);
      errorCount++;
    } else {
      console.log(`  ✅ Updated: ${landmarks[0]}`);
      successCount++;
    }
    
    // Rate limiting for AI calls
    if (i < towns.length - 1 && aiCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Save progress every 20 towns
    if ((i + 1) % 20 === 0) {
      console.log(`\n💾 Progress: ${successCount} successful, ${errorCount} errors\n`);
    }
  }
  
  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('CULTURAL LANDMARKS ENRICHMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successfully updated: ${successCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`🤖 AI generated: ${aiCount}`);
  console.log(`🔧 Fallback used: ${fallbackCount}`);
  console.log(`💰 Actual cost: ~$${(aiCount * 0.00005).toFixed(4)}`);
  
  // Verify coverage
  const { data: final } = await supabase
    .from('towns')
    .select('cultural_landmark_1');
    
  const populated = final.filter(t => t.cultural_landmark_1 !== null).length;
  console.log(`\n📊 Final coverage: ${populated}/${final.length} towns (${(populated*100/final.length).toFixed(1)}%)`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  testMode: args.includes('--test'),
  limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null
};

// Run enrichment
enrichCulturalLandmarks(options).catch(console.error);