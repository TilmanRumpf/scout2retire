// Add Nova Scotia towns directly to remote database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const towns = [
  { name: 'Lunenburg', latitude: 44.3768, longitude: -64.3180 },
  { name: 'Bridgewater', latitude: 44.3783, longitude: -64.5186 },
  { name: 'Mahone Bay', latitude: 44.4484, longitude: -64.3815 },
  { name: 'Truro', latitude: 45.3646, longitude: -63.2825 },
  { name: 'Yarmouth', latitude: 43.8360, longitude: -66.1174 },
  { name: "Peggy's Cove", latitude: 44.4939, longitude: -63.9156 },
  { name: 'Chester', latitude: 44.5410, longitude: -64.2370 },
  { name: 'Annapolis Royal', latitude: 44.7410, longitude: -65.5194 },
  { name: 'Lockeport', latitude: 43.6980, longitude: -65.1098 },
  { name: 'Digby', latitude: 44.6220, longitude: -65.7605 }
];

const townsToInsert = towns.map(town => ({
  name: town.name,
  country: 'Canada',
  latitude: town.latitude,
  longitude: town.longitude,
  region: 'North America',
  geo_region: 'Atlantic Canada'
}));

console.log(`Inserting ${towns.length} Nova Scotia towns...`);

const { data, error } = await supabase
  .from('towns')
  .insert(townsToInsert)
  .select('name, latitude, longitude');

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log(`\n✅ Successfully added ${data.length} Nova Scotia towns:\n`);
data.forEach((town, i) => {
  console.log(`${i + 1}. ${town.name} (${town.latitude}, ${town.longitude})`);
});

process.exit(0);
