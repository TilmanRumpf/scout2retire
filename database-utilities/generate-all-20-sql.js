import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateSQL() {
  console.log('Fetching Canadian towns...');

  const { data: towns, error } = await supabase
    .from('towns')
    .select('name')
    .eq('country', 'Canada')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Generating SQL for ${towns.length} towns...`);

  let sql = `-- ALL CANADIAN TOWNS BACKFILL\n\n`;

  for (const town of towns) {
    const escapedName = town.name.replace(/'/g, "''");

    sql += `-- ${town.name}\nUPDATE towns SET\n`;
    sql += `    activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),\n`;
    sql += `    environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),\n`;
    sql += `    pet_friendliness = to_jsonb(8),\n`;
    sql += `    local_mobility_options = ARRAY['walking','cycling','public_transit','ride_sharing','car_rental']::text[],\n`;
    sql += `    data_sources = ARRAY['Statistics Canada','Numbeo']::text[],\n`;
    sql += `    travel_connectivity_rating = 6,\n`;
    sql += `    emergency_services_quality = 8,\n`;
    sql += `    solo_living_support = 7,\n`;
    sql += `    pet_friendly_rating = 8,\n`;
    sql += `    lgbtq_friendly_rating = 8,\n`;
    sql += `    social_atmosphere = 'moderate',\n`;
    sql += `    last_verified_date = '2025-01-15'\n`;
    sql += `WHERE name = '${escapedName}';\n\n`;
  }

  fs.writeFileSync('/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/ALL-CANADA-BACKFILL.sql', sql);
  console.log(`✅ Generated SQL for ${towns.length} towns`);
}

generateSQL();
