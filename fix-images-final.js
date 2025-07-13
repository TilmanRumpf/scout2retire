import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Get the service role key from the conversation
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fixImages() {
  console.log('Fixing St Tropez and Medellin images...\n');
  
  try {
    // First check what we have
    const { data: check, error: checkError } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1')
      .or('name.eq.Saint-Tropez,name.eq.Medellin');
      
    if (checkError) {
      console.error('Check error:', checkError);
      return;
    }
    
    console.log('Current state:');
    check.forEach(t => {
      console.log(`${t.name}: ${t.image_url_1}`);
    });
    
    // Fix the URLs
    for (const town of check) {
      if (town.image_url_1?.includes('town-images//')) {
        const fixed = town.image_url_1.replace('town-images//', 'town-images/');
        
        const { error } = await supabase
          .from('towns')
          .update({ image_url_1: fixed })
          .eq('id', town.id);
          
        if (error) {
          console.error(`Error fixing ${town.name}:`, error);
        } else {
          console.log(`\n✅ Fixed ${town.name}`);
          console.log(`   Old: ${town.image_url_1}`);
          console.log(`   New: ${fixed}`);
        }
      }
    }
    
    console.log('\nDone!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
  
  process.exit(0);
}

fixImages();