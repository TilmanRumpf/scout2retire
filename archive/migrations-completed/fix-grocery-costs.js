import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Fix grocery costs for Da Nang and George Town
 * Based on research verification from September 2025
 */

async function fixGroceryCosts() {
  console.log('🔧 Fixing grocery costs for Southeast Asia...\n');

  // Fix Da Nang, Vietnam
  console.log('Updating Da Nang, Vietnam...');
  const { data: daNang, error: daNangError } = await supabase
    .from('towns')
    .update({ groceries_cost: 200 })
    .eq('name', 'Da Nang')
    .eq('country', 'Vietnam')
    .select();

  if (daNangError) {
    console.error('❌ Error updating Da Nang:', daNangError);
  } else {
    console.log(`✅ Da Nang updated: $40 → $200/month`);
  }

  // Fix George Town, Malaysia
  console.log('\nUpdating George Town, Malaysia...');
  const { data: georgeTown, error: georgeTownError } = await supabase
    .from('towns')
    .update({ groceries_cost: 175 })
    .eq('name', 'George Town')
    .eq('country', 'Malaysia')
    .select();

  if (georgeTownError) {
    console.error('❌ Error updating George Town:', georgeTownError);
  } else {
    console.log(`✅ George Town updated: $40 → $175/month`);
  }

  console.log('\n✅ Grocery costs fixed!\n');
}

fixGroceryCosts().catch(console.error);
