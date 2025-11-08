#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTriggers() {
  console.log('Checking actual database triggers and functions...\n');
  
  // Try to get trigger info using SQL
  const query = `
    SELECT 
      t.tgname AS trigger_name,
      t.tgenabled AS is_enabled,
      t.tgtype AS trigger_type,
      p.proname AS function_name,
      pg_get_functiondef(p.oid) AS function_code
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE n.nspname = 'public' 
    AND c.relname = 'town_images'
    AND t.tgname NOT LIKE 'RI_%'
    ORDER BY t.tgname;
  `;

  try {
    // Use psql if available
    const dbUrl = process.env.VITE_SUPABASE_URL.replace('https://', '');
    const projectRef = dbUrl.split('.')[0];
    
    console.log('Attempting to query triggers...\n');
    
    // Alternative: Just try the update and see what happens
    console.log('Testing actual update to see exact error...\n');
    
    const { data: img } = await supabase
      .from('town_images')
      .select('*')
      .eq('display_order', 1)
      .limit(1)
      .single();
    
    if (img) {
      console.log('Sample record:', {
        id: img.id,
        town_id: img.town_id,
        image_url: img.image_url,
        display_order: img.display_order
      });
      
      console.log('\nAttempting update...');
      const { data, error } = await supabase
        .from('town_images')
        .update({ image_url: 'https://test.jpg' })
        .eq('id', img.id)
        .select();
      
      if (error) {
        console.log('\n❌ ERROR:', error);
        console.log('\nError details:', JSON.stringify(error, null, 2));
      } else {
        console.log('\n✅ Update succeeded!');
        console.log('Data:', data);
        
        // Restore
        await supabase
          .from('town_images')
          .update({ image_url: img.image_url })
          .eq('id', img.id);
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTriggers();
