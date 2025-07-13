import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBucket() {
  console.log('🔍 Checking Supabase storage bucket for St Tropez images...\n');
  
  try {
    // List files in the bucket
    const { data: files, error } = await supabase
      .storage
      .from('town-images')
      .list('', {
        limit: 1000,
        offset: 0
      });
      
    if (error) {
      console.error('Error listing files:', error);
      return;
    }
    
    console.log(`Found ${files.length} files in bucket\n`);
    
    // Find St Tropez and Medellin
    const stTropezFiles = files.filter(f => 
      f.name.toLowerCase().includes('tropez') || 
      f.name.toLowerCase().includes('st-tropez') ||
      f.name.toLowerCase().includes('saint')
    );
    
    const medellinFiles = files.filter(f => 
      f.name.toLowerCase().includes('medellin')
    );
    
    console.log('St Tropez related files:');
    if (stTropezFiles.length === 0) {
      console.log('❌ No St Tropez images found in bucket!');
    } else {
      stTropezFiles.forEach(f => {
        console.log(`  - ${f.name}`);
        console.log(`    URL: https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/${f.name}`);
      });
    }
    
    console.log('\nMedellin related files:');
    if (medellinFiles.length === 0) {
      console.log('❌ No Medellin images found in bucket!');
    } else {
      medellinFiles.forEach(f => {
        console.log(`  - ${f.name}`);
        console.log(`    URL: https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/${f.name}`);
      });
    }
    
    // Check what the DB thinks the URLs should be
    console.log('\n📊 Database URLs:');
    const { data: towns } = await supabase
      .from('towns')
      .select('name, image_url_1')
      .or('name.eq.Saint-Tropez,name.eq.Medellin');
      
    towns?.forEach(t => {
      console.log(`\n${t.name}:`);
      console.log(`  DB URL: ${t.image_url_1}`);
      
      // Extract just the filename
      const filename = t.image_url_1?.split('/').pop();
      console.log(`  Filename: ${filename}`);
      
      // Check if this file exists in bucket
      const exists = files.some(f => f.name === filename);
      console.log(`  Exists in bucket: ${exists ? '✅ YES' : '❌ NO'}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkBucket();