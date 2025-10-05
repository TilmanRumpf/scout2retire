import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkStTropez() {
  console.log('🔍 Checking St Tropez image issue...\n');
  
  try {
    // Check all variations of St Tropez
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1, image_url_2, image_url_3')
      .or('name.ilike.%tropez%,name.eq.St Tropez,name.eq.Saint-Tropez,name.eq.St. Tropez');
    
    if (error) throw error;
    
    if (!towns || towns.length === 0) {
      console.log('❌ No town found with name containing "Tropez"');
      return;
    }
    
    console.log(`Found ${towns.length} town(s):\n`);
    
    towns.forEach(town => {
      console.log(`📍 ${town.name}, ${town.country}`);
      console.log(`   ID: ${town.id}`);
      
      if (town.image_url_1) {
        console.log(`   Image 1: ${town.image_url_1}`);
        // Check for double slashes
        if (town.image_url_1.includes('//')) {
          console.log('   ⚠️  Has double slash in URL');
        }
        // Check URL structure
        if (!town.image_url_1.includes('town-images/')) {
          console.log('   ⚠️  Missing town-images path');
        }
      } else {
        console.log('   ❌ No image_url_1');
      }
      
      if (town.image_url_2) {
        console.log(`   Image 2: ${town.image_url_2}`);
      }
      
      if (town.image_url_3) {
        console.log(`   Image 3: ${town.image_url_3}`);
      }
      
      console.log('');
    });
    
    // Check if the issue was the double slash
    const needsFix = towns.filter(t => 
      t.image_url_1?.includes('town-images//') ||
      t.image_url_2?.includes('town-images//') ||
      t.image_url_3?.includes('town-images//')
    );
    
    if (needsFix.length > 0) {
      console.log('🔧 Found URLs with double slashes. Let me check all towns with this issue...\n');
      
      // Check all towns with double slash issue
      const { data: allProblems, error: allError } = await supabase
        .from('towns')
        .select('name, country, image_url_1')
        .or('image_url_1.like.%town-images//%,image_url_2.like.%town-images//%,image_url_3.like.%town-images//%')
        .order('name');
      
      if (!allError && allProblems) {
        console.log(`📊 ${allProblems.length} towns have double slash issues:`);
        allProblems.forEach(t => {
          console.log(`   - ${t.name}, ${t.country}`);
        });
      }
    }
    
    // Test the URLs
    console.log('\n🌐 Test these URLs in your browser:');
    towns.forEach(town => {
      if (town.image_url_1) {
        console.log(`\n${town.name} original URL:`);
        console.log(town.image_url_1);
        
        if (town.image_url_1.includes('//')) {
          const fixed = town.image_url_1.replace('town-images//', 'town-images/');
          console.log('\nFixed URL (single slash):');
          console.log(fixed);
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStTropez();