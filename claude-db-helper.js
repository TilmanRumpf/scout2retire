#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER - UPDATE LUNENBURG IMAGE
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TOBIAS_EMAIL = 'tobiasrumpf@gmx.de';
const TOBIAS_USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

// Let's also check if there are ANY users in the user_hobbies table
// and see if we can find the correct user ID

async function runQueries() {
  console.log('🖼️ UPDATING LUNENBURG IMAGE URL');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // 1. Find Lunenburg in the database
    console.log('🏙️ STEP 1: FINDING LUNENBURG');
    console.log('-'.repeat(40));

    const { data: lunenburgData, error: lunenburgError } = await supabase
      .from('towns')
      .select('id, name, country, photos')
      .eq('name', 'Lunenburg')
      .eq('country', 'Canada');

    if (lunenburgError) {
      console.log('❌ Error finding Lunenburg:', lunenburgError.message);
      return;
    }

    if (lunenburgData.length === 0) {
      console.log('❌ Lunenburg not found in database');
      return;
    }

    const lunenburg = lunenburgData[0];
    console.log(`✅ Found: ${lunenburg.name}, ${lunenburg.country} (ID: ${lunenburg.id})`);
    console.log(`Current photos:`, lunenburg.photos);

    // 2. Update the first URL in the photos array
    console.log('\n🔧 STEP 2: UPDATING IMAGE URL');
    console.log('-'.repeat(40));

    const newUrl = 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/ca-lunenburg-waterfront-2000x1500.jpg';

    // Get current photos array
    const currentPhotos = lunenburg.photos || [];

    if (currentPhotos.length === 0) {
      console.log('❌ No photos array found - creating new array with URL');
      currentPhotos.push(newUrl);
    } else {
      console.log(`Replacing URL at index 0: ${currentPhotos[0]}`);
      currentPhotos[0] = newUrl;
    }

    // Update the database
    const { data: updateData, error: updateError } = await supabase
      .from('towns')
      .update({ photos: currentPhotos })
      .eq('id', lunenburg.id)
      .select('id, name, photos');

    if (updateError) {
      console.log('❌ Error updating photos:', updateError.message);
      return;
    }

    console.log('✅ Photos updated successfully!');
    console.log('New photos array:', updateData[0].photos);

    console.log('\n✅ UPDATE COMPLETE');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the queries
runQueries().catch(console.error);