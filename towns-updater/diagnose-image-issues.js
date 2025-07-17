import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseImageIssues() {
  console.log('🔍 Diagnosing Image URL Issues\n');
  
  try {
    // Check St Tropez (might be stored as Saint-Tropez)
    console.log('1️⃣ Checking St Tropez / Saint-Tropez...');
    const { data: stTropez, error: stError } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1')
      .or('name.eq.Saint-Tropez,name.eq.St Tropez,name.ilike.%tropez%');
    
    if (!stError && stTropez) {
      stTropez.forEach(town => {
        console.log(`\nFound: ${town.name}, ${town.country}`);
        console.log(`URL: ${town.image_url_1}`);
        if (town.image_url_1) {
          console.log(`Double slash issue: ${town.image_url_1.includes('//') ? '❌ YES' : '✅ NO'}`);
          console.log(`URL structure: ${town.image_url_1.includes('town-images/') ? '✅ Correct path' : '❌ Wrong path'}`);
        }
      });
    }
    
    // Check Medellin
    console.log('\n2️⃣ Checking Medellin...');
    const { data: medellin, error: medError } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1')
      .eq('name', 'Medellin');
    
    if (!medError && medellin) {
      medellin.forEach(town => {
        console.log(`\nFound: ${town.name}, ${town.country}`);
        console.log(`URL: ${town.image_url_1}`);
        if (town.image_url_1) {
          console.log(`Double slash issue: ${town.image_url_1.includes('//') ? '❌ YES' : '✅ NO'}`);
          console.log(`URL structure: ${town.image_url_1.includes('town-images/') ? '✅ Correct path' : '❌ Wrong path'}`);
        }
      });
    }
    
    // Check for all towns with double slashes
    console.log('\n3️⃣ All towns with double slash issues...');
    const { data: problemTowns, error: problemError } = await supabase
      .from('towns')
      .select('name, country, image_url_1')
      .or('image_url_1.like.%//%,image_url_2.like.%//%,image_url_3.like.%//%')
      .order('name');
    
    if (!problemError && problemTowns) {
      console.log(`\nFound ${problemTowns.length} towns with double slashes:`);
      problemTowns.forEach(town => {
        console.log(`- ${town.name}, ${town.country}`);
      });
    }
    
    // Test direct image URLs
    console.log('\n4️⃣ Testing image accessibility...');
    const testUrls = [
      'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images//St-Tropez-Depositphotos-216005330-L.jpg',
      'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/St-Tropez-Depositphotos-216005330-L.jpg',
      'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images//Medellin-Depositphotos-514358048-XL.jpg',
      'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/Medellin-Depositphotos-514358048-XL.jpg'
    ];
    
    console.log('\nTest these URLs in your browser:');
    testUrls.forEach((url, i) => {
      console.log(`${i + 1}. ${url}`);
      console.log(`   ${url.includes('//') ? '(with double slash)' : '(fixed - single slash)'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

diagnoseImageIssues();