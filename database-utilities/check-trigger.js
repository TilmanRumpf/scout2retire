#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTriggerFunction() {
  // Get the function definition
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as function_definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname LIKE '%sync_town%'
    `
  }).catch(() => ({ data: null, error: 'RPC not available' }));

  if (data) {
    console.log('Trigger functions found:');
    data.forEach(fn => {
      console.log(`\n${fn.function_name}:`);
      console.log(fn.function_definition);
    });
  } else {
    console.log('Cannot query functions via RPC, checking manually...');
    
    // Try to trigger manually
    const { data: testImage } = await supabase
      .from('town_images')
      .select('id, town_id, image_url')
      .eq('display_order', 1)
      .limit(1)
      .single();

    if (testImage) {
      console.log(`\nTesting with image ${testImage.id} for town ${testImage.town_id}`);
      console.log(`Current URL: ${testImage.image_url}`);

      const testUrl = `https://test-${Date.now()}.jpg`;
      
      const { error: updateError } = await supabase
        .from('town_images')
        .update({ image_url: testUrl })
        .eq('id', testImage.id);

      if (updateError) {
        console.log('❌ Update failed:', updateError.message);
        console.log('   This indicates trigger issue');
      } else {
        console.log('✅ Update succeeded');
        
        // Check cache
        await new Promise(r => setTimeout(r, 1000));
        
        const { data: town } = await supabase
          .from('towns')
          .select('image_url_1')
          .eq('id', testImage.town_id)
          .single();

        console.log(`Cache value: ${town.image_url_1}`);
        console.log(town.image_url_1 === testUrl ? '✅ Trigger working' : '❌ Trigger not working');

        // Restore
        await supabase
          .from('town_images')
          .update({ image_url: testImage.image_url })
          .eq('id', testImage.id);
      }
    }
  }
}

checkTriggerFunction();
