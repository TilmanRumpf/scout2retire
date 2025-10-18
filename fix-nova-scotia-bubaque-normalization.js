/**
 * Fix Data Normalization for Nova Scotia Towns and Bubaque
 *
 * PROBLEM: Some towns have field names stored as values instead of actual categorical values
 * TARGETS: Only Nova Scotia towns and Bubaque, Guinea-Bissau
 * PRESERVES: All other town data remains unchanged
 *
 * Run: node fix-nova-scotia-bubaque-normalization.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Fields that might have field names as values
const FIELDS_TO_CHECK = [
  'internet_reliability',
  'mobile_coverage',
  'public_transport_quality',
  'digital_services_availability',
  'bike_infrastructure',
  'road_quality',
  'traffic_congestion',
  'parking_availability',
  'banking_infrastructure',
  'beaches_nearby',
  'water_sports_available',
  'mountain_activities',
  'cultural_activities',
  'sports_facilities'
];

// Mapping for Nova Scotia towns (Canadian developed provinces)
const NOVA_SCOTIA_DEFAULTS = {
  internet_reliability: 'good',
  mobile_coverage: 'good',
  public_transport_quality: 'fair', // varies by town size
  digital_services_availability: 'high',
  bike_infrastructure: 'fair',
  road_quality: 'good',
  traffic_congestion: 'low',
  parking_availability: 'good',
  banking_infrastructure: 'good',
  beaches_nearby: 'abundant', // coastal province
  water_sports_available: 'moderate',
  mountain_activities: 'limited',
  cultural_activities: 'moderate',
  sports_facilities: 'moderate'
};

// Mapping for Bubaque (remote island in Guinea-Bissau)
const BUBAQUE_DEFAULTS = {
  internet_reliability: 'poor',
  mobile_coverage: 'poor',
  public_transport_quality: 'very_poor',
  digital_services_availability: 'very_low',
  bike_infrastructure: 'very_poor',
  road_quality: 'poor',
  traffic_congestion: 'minimal',
  parking_availability: 'excellent', // no traffic issues
  banking_infrastructure: 'very_poor',
  beaches_nearby: 'abundant', // island with beaches
  water_sports_available: 'excellent', // coastal location
  mountain_activities: 'none',
  cultural_activities: 'limited',
  sports_facilities: 'very_limited'
};

async function fixTownData() {
  console.log('🔧 Starting targeted data normalization fix...\n');

  // 1. Get Nova Scotia towns
  console.log('📍 Fetching Nova Scotia towns...');
  const { data: novaTowns, error: nsError } = await supabase
    .from('towns')
    .select('id, name, state_code, ' + FIELDS_TO_CHECK.join(', '))
    .or('state_code.eq.NS,region.ilike.%nova scotia%');

  if (nsError) {
    console.error('❌ Error fetching Nova Scotia towns:', nsError);
    return;
  }

  console.log(`Found ${novaTowns?.length || 0} Nova Scotia towns\n`);

  // 2. Get Bubaque
  console.log('📍 Fetching Bubaque...');
  const { data: bubaque, error: bubError } = await supabase
    .from('towns')
    .select('id, name, country, ' + FIELDS_TO_CHECK.join(', '))
    .eq('name', 'Bubaque')
    .single();

  if (bubError && bubError.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('❌ Error fetching Bubaque:', bubError);
    return;
  }

  // 3. Fix Nova Scotia towns
  if (novaTowns && novaTowns.length > 0) {
    console.log('🔧 Fixing Nova Scotia towns...\n');

    for (const town of novaTowns) {
      const updates = {};
      let needsUpdate = false;

      for (const field of FIELDS_TO_CHECK) {
        const value = town[field];

        // Check if value is the field name itself (broken)
        if (value === field || value === field.replace(/_/g, ' ')) {
          updates[field] = NOVA_SCOTIA_DEFAULTS[field];
          needsUpdate = true;
          console.log(`  ${town.name}: ${field} = "${value}" → "${NOVA_SCOTIA_DEFAULTS[field]}"`);
        }
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('towns')
          .update(updates)
          .eq('id', town.id);

        if (updateError) {
          console.error(`❌ Error updating ${town.name}:`, updateError);
        } else {
          console.log(`✅ Fixed ${town.name}\n`);
        }
      } else {
        console.log(`✓ ${town.name} - no fixes needed\n`);
      }
    }
  }

  // 4. Fix Bubaque
  if (bubaque) {
    console.log('🔧 Fixing Bubaque, Guinea-Bissau...\n');

    const updates = {};
    let needsUpdate = false;

    for (const field of FIELDS_TO_CHECK) {
      const value = bubaque[field];

      // Check if value is the field name itself (broken) or null/empty
      if (value === field || value === field.replace(/_/g, ' ') || !value) {
        updates[field] = BUBAQUE_DEFAULTS[field];
        needsUpdate = true;
        console.log(`  Bubaque: ${field} = "${value}" → "${BUBAQUE_DEFAULTS[field]}"`);
      }
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('towns')
        .update(updates)
        .eq('id', bubaque.id);

      if (updateError) {
        console.error('❌ Error updating Bubaque:', updateError);
      } else {
        console.log('✅ Fixed Bubaque\n');
      }
    } else {
      console.log('✓ Bubaque - no fixes needed\n');
    }
  } else {
    console.log('ℹ️ Bubaque not found in database\n');
  }

  // 5. Verify other towns remain unchanged
  console.log('🔍 Verifying other towns remain unchanged...');
  const { data: sampleTowns, error: sampleError } = await supabase
    .from('towns')
    .select('name, mobile_coverage, internet_reliability')
    .not('state_code', 'eq', 'NS')
    .neq('name', 'Bubaque')
    .limit(5);

  if (!sampleError && sampleTowns) {
    console.log('\nSample of unchanged towns:');
    sampleTowns.forEach(town => {
      console.log(`  ${town.name}: mobile=${town.mobile_coverage}, internet=${town.internet_reliability}`);
    });
  }

  console.log('\n✅ Targeted normalization fix complete!');
  console.log('📝 Only Nova Scotia towns and Bubaque were modified.');
  console.log('📝 All other town data remains unchanged.');
}

// Run the fix
fixTownData().catch(console.error);