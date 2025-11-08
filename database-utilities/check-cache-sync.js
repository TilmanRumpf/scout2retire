#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCacheSync() {
  // Get primary images
  const { data: primaryImages } = await supabase
    .from('town_images')
    .select('town_id, image_url')
    .eq('display_order', 1);

  // Get towns cache
  const { data: towns } = await supabase
    .from('towns')
    .select('id, image_url_1');

  const imageMap = new Map();
  primaryImages.forEach(img => {
    imageMap.set(img.town_id, img.image_url);
  });

  let realMismatches = 0;
  let bothNull = 0;
  
  towns.forEach(town => {
    const cacheUrl = town.image_url_1;
    const actualUrl = imageMap.get(town.id);

    // Both null is NOT a mismatch
    if (cacheUrl === null && actualUrl === undefined) {
      bothNull++;
      return;
    }

    if (cacheUrl !== actualUrl) {
      realMismatches++;
      if (realMismatches <= 10) {
        console.log(`MISMATCH Town ${town.id}:`);
        console.log(`  Cache: ${cacheUrl}`);
        console.log(`  Actual: ${actualUrl || 'undefined'}`);
      }
    }
  });

  console.log(`\nBoth null (correct): ${bothNull}`);
  console.log(`Real mismatches: ${realMismatches}`);
  console.log(`\n${realMismatches === 0 ? '✅ CACHE PERFECTLY SYNCED' : '❌ CACHE OUT OF SYNC'}`);
}

checkCacheSync();
