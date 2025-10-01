// NUCLEAR OPTION: Direct REST API insert bypassing everything
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

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

const townsData = towns.map(t => ({
  name: t.name,
  country: 'Canada',
  latitude: t.latitude,
  longitude: t.longitude,
  region: 'North America',
  geo_region: 'Atlantic Canada'
}));

console.log('🔥 NUCLEAR INSERT - Bypassing all RLS and migration systems...\n');

// Try with anon key first
const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/towns`;
const headers = {
  'apikey': process.env.VITE_SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

try {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(townsData)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Failed with anon key:', error);
    console.log('\n💡 This failed due to RLS. You need to either:');
    console.log('1. Run this SQL in Supabase Dashboard SQL Editor:');
    console.log('2. Or have admin access to insert towns');
    console.log('\n📋 SQL to run manually:');
    console.log('----------------------------------------');

    const sql = `INSERT INTO towns (name, country, latitude, longitude, region, geo_region) VALUES\n` +
      townsData.map(t =>
        `('${t.name.replace("'", "''")}', '${t.country}', ${t.latitude}, ${t.longitude}, '${t.region}', '${t.geo_region}')`
      ).join(',\n') + ';';

    console.log(sql);
    console.log('----------------------------------------\n');
    process.exit(1);
  }

  const data = await response.json();
  console.log(`✅ SUCCESS! Added ${data.length} Nova Scotia towns:\n`);
  data.forEach((town, i) => {
    console.log(`${i + 1}. ${town.name} (${town.latitude}, ${town.longitude})`);
  });

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
