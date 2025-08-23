import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

// Log with timestamp
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Generate photo URL using Claude
async function generatePhotoUrl(town) {
  const prompt = `Generate a realistic Unsplash photo URL for this retirement destination:

Town: ${town.name}
Country: ${town.country}
Region: ${town.state_code || town.region || ''}

Return ONLY a valid Unsplash URL in this format:
https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1200&q=80

Find an appropriate photo ID that would represent this location well. The photo should show:
- Scenic views, landmarks, or typical architecture of the area
- Appealing visuals for retirees
- High quality, professional photography

Common Unsplash photo IDs for reference:
- Coastal: 1527003171561-fdfbcdcb5bb9
- Mountain: 1506905925191-d78e05307a6f  
- European city: 1555372900-5564520c3d9f
- Tropical: 1544551763-77d601408c74
- Desert: 1500382416878-f073c1798bba
- Historic: 1513635269091-d3c09b3e6cad

Return ONLY the URL, nothing else.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      temperature: 0.5,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const url = response.content[0].text.trim();
    
    // Validate URL format
    if (!url.startsWith('https://images.unsplash.com/photo-')) {
      // Generate a default URL based on country/region
      return generateDefaultUrl(town);
    }
    
    return url;
  } catch (error) {
    log(`Error generating photo for ${town.name}: ${error.message}`);
    return generateDefaultUrl(town);
  }
}

// Generate default photo URL based on location
function generateDefaultUrl(town) {
  const photoMap = {
    // Coastal locations
    'FL': 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
    'CA': 'https://images.unsplash.com/photo-1542044144-100245c5db9e?auto=format&fit=crop&w=1200&q=80',
    // European
    'Spain': 'https://images.unsplash.com/photo-1558642084-09b3dd36bb91?auto=format&fit=crop&w=1200&q=80',
    'Portugal': 'https://images.unsplash.com/photo-1555881400-69ecb4b35bbc?auto=format&fit=crop&w=1200&q=80',
    'Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2f8f8f?auto=format&fit=crop&w=1200&q=80',
    'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    // Asia
    'Thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
    'Vietnam': 'https://images.unsplash.com/photo-1557750255-c76f6646d6c9?auto=format&fit=crop&w=1200&q=80',
    // Latin America
    'Mexico': 'https://images.unsplash.com/photo-1518105779142-e91ce6e00151?auto=format&fit=crop&w=1200&q=80',
    'Costa Rica': 'https://images.unsplash.com/photo-1552748977-0f7ec8e48a13?auto=format&fit=crop&w=1200&q=80',
    // Default
    'default': 'https://images.unsplash.com/photo-1449034446853-efd7b642e92a?auto=format&fit=crop&w=1200&q=80'
  };
  
  return photoMap[town.state_code] || photoMap[town.country] || photoMap.default;
}

// Main function
async function enrichPhotos(limit = null) {
  log('Starting photo enrichment...');
  
  // Get towns without photos
  let query = supabase
    .from('towns')
    .select('id, name, country, state_code, region')
    .is('image_url_1', null)
    .order('country', { ascending: true });
    
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data: towns, error } = await query;
  
  if (error) {
    log(`Error fetching towns: ${error.message}`);
    return;
  }
  
  log(`Found ${towns.length} towns without photos`);
  
  let successCount = 0;
  let errorCount = 0;
  const batchSize = 10;
  
  for (let i = 0; i < towns.length; i += batchSize) {
    const batch = towns.slice(i, i + batchSize);
    log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(towns.length/batchSize)}`);
    
    const updates = await Promise.all(
      batch.map(async (town) => {
        const photoUrl = await generatePhotoUrl(town);
        return {
          id: town.id,
          name: town.name,
          photoUrl
        };
      })
    );
    
    // Update database
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('towns')
        .update({ 
          image_url_1: update.photoUrl,
          image_validated: true,
          image_source: 'Unsplash',
          last_ai_update: new Date().toISOString()
        })
        .eq('id', update.id);
        
      if (updateError) {
        log(`❌ Failed: ${update.name}`);
        errorCount++;
      } else {
        log(`✅ Added photo: ${update.name}`);
        successCount++;
      }
    }
    
    // Rate limiting between batches
    if (i + batchSize < towns.length) {
      log('Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  log('\n' + '='.repeat(50));
  log('PHOTO ENRICHMENT COMPLETE');
  log(`✅ Success: ${successCount} towns`);
  log(`❌ Errors: ${errorCount} towns`);
  log(`💰 Estimated cost: $${(successCount * 0.00005).toFixed(2)}`);
  log('='.repeat(50));
}

// Parse command line arguments
const args = process.argv.slice(2);
const limit = args.includes('--test') ? 5 : 
              args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 
              null;

// Run enrichment
enrichPhotos(limit).catch(console.error);