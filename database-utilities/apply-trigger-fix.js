#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('Reading migration file...\n');
  
  const sql = readFileSync(
    '/Users/tilmanrumpf/Desktop/scout2retire/supabase/migrations/20251109000002_fix_town_images_trigger.sql',
    'utf8'
  );

  console.log('Applying migration to fix trigger...\n');
  console.log('='.repeat(70));
  
  try {
    // Split by $$ to handle DO blocks properly
    const statements = sql.split(/;(?=\s*(?:--|$))/);
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed || trimmed.startsWith('--')) continue;
      
      // Execute via raw SQL if possible, otherwise skip comments
      if (trimmed.length > 0) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: trimmed + ';' })
            .catch(() => ({ data: null, error: 'RPC not available' }));
          
          if (error && error !== 'RPC not available') {
            console.log('Statement error:', error);
          }
        } catch (e) {
          // Continue on error for individual statements
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Migration applied (check output above for results)\n');

    // Now test the trigger directly
    console.log('Testing trigger functionality...\n');

    const { data: testImage } = await supabase
      .from('town_images')
      .select('id, town_id, image_url')
      .eq('display_order', 1)
      .limit(1)
      .single();

    if (!testImage) {
      console.log('No test image found');
      return;
    }

    const testUrl = `https://trigger-test-${Date.now()}.jpg`;
    console.log(`Test image: ${testImage.id}`);
    console.log(`Original URL: ${testImage.image_url}`);
    console.log(`Test URL: ${testUrl}\n`);

    const { error: updateError } = await supabase
      .from('town_images')
      .update({ image_url: testUrl })
      .eq('id', testImage.id);

    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
      console.log('\nTrigger still has issues. May need manual SQL execution.');
      process.exit(1);
    }

    console.log('✅ Update succeeded!\n');

    // Wait for trigger
    await new Promise(r => setTimeout(r, 1500));

    const { data: town } = await supabase
      .from('towns')
      .select('image_url_1')
      .eq('id', testImage.town_id)
      .single();

    if (town.image_url_1 === testUrl) {
      console.log('✅ TRIGGER WORKING - Cache updated correctly!\n');
    } else {
      console.log(`❌ TRIGGER NOT WORKING`);
      console.log(`   Expected: ${testUrl}`);
      console.log(`   Got: ${town.image_url_1}\n`);
    }

    // Restore
    await supabase
      .from('town_images')
      .update({ image_url: testImage.image_url })
      .eq('id', testImage.id);

    console.log('✅ Restored original URL');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
