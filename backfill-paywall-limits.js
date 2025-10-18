import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function backfillLimits() {
  console.log('🚀 Starting backfill...');

  // Get all tiers
  const { data: tiers, error: tiersError } = await supabase
    .from('user_categories')
    .select('id, category_code, display_name');

  if (tiersError) {
    console.error('Error fetching tiers:', tiersError);
    return;
  }

  console.log('Tiers:', tiers.map(t => `${t.category_code} (${t.id})`).join(', '));

  // Get all features
  const { data: features, error: featuresError } = await supabase
    .from('feature_definitions')
    .select('id, feature_code, display_name');

  if (featuresError) {
    console.error('Error fetching features:', featuresError);
    return;
  }

  console.log(`\n📊 Found ${features.length} features to process\n`);

  // Find tier IDs
  const assistantAdmin = tiers.find(t => t.category_code === 'assistant_admin');
  const townManager = tiers.find(t => t.category_code === 'town_manager');
  const enterprise = tiers.find(t => t.category_code === 'enterprise');

  if (!assistantAdmin || !townManager || !enterprise) {
    console.error('❌ Could not find required tiers');
    console.log('Available:', tiers.map(t => t.category_code));
    return;
  }

  console.log(`✅ Found tiers:`);
  console.log(`   Assistant Admin: ${assistantAdmin.id}`);
  console.log(`   Town Manager: ${townManager.id}`);
  console.log(`   Enterprise: ${enterprise.id}\n`);

  // Get all existing limits
  const { data: existingLimits, error: limitsError } = await supabase
    .from('category_limits')
    .select('*');

  if (limitsError) {
    console.error('Error fetching limits:', limitsError);
    return;
  }

  console.log(`📦 Found ${existingLimits.length} existing limit records\n`);

  const updates = [];
  let assistantAdminCount = 0;
  let townManagerCount = 0;

  for (const feature of features) {
    // 1. Backfill Assistant Admin to ∞ (null) if empty
    const assistantLimit = existingLimits.find(
      l => l.category_id === assistantAdmin.id && l.feature_id === feature.id
    );

    if (!assistantLimit) {
      updates.push({
        category_id: assistantAdmin.id,
        feature_id: feature.id,
        limit_value: null
      });
      assistantAdminCount++;
      console.log(`   ∞ Assistant Admin → ${feature.display_name}`);
    }

    // 2. Copy Enterprise to Town Manager if Town Manager is empty
    const townManagerLimit = existingLimits.find(
      l => l.category_id === townManager.id && l.feature_id === feature.id
    );

    const enterpriseLimit = existingLimits.find(
      l => l.category_id === enterprise.id && l.feature_id === feature.id
    );

    if (!townManagerLimit && enterpriseLimit) {
      const displayValue = enterpriseLimit.limit_value === null ? '∞' : enterpriseLimit.limit_value;
      updates.push({
        category_id: townManager.id,
        feature_id: feature.id,
        limit_value: enterpriseLimit.limit_value
      });
      townManagerCount++;
      console.log(`   📋 Town Manager ← Enterprise: ${feature.display_name} = ${displayValue}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Assistant Admin fields to set to ∞: ${assistantAdminCount}`);
  console.log(`   Town Manager fields to copy from Enterprise: ${townManagerCount}`);
  console.log(`   Total updates: ${updates.length}\n`);

  if (updates.length === 0) {
    console.log('✅ Nothing to update - all fields already filled!');
    return;
  }

  console.log('💾 Inserting updates...');

  const { data, error } = await supabase
    .from('category_limits')
    .upsert(updates, { onConflict: 'category_id,feature_id' });

  if (error) {
    console.error('❌ Error upserting limits:', error);
  } else {
    console.log(`✅ Successfully updated ${updates.length} limit records!`);
  }
}

backfillLimits().catch(console.error);
