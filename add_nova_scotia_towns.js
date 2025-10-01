import fetch from 'node-fetch';

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

const SUPABASE_URL = 'https://axlruvvsjepsulcbqlho.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNzk1MywiZXhwIjoyMDcyNjgzOTUzfQ.fI7L6Uo7OGU2XqjNslIsPPQVEv6Xt4f9mTM6wsgPFco';

const townsToInsert = towns.map(town => ({
  name: town.name,
  country: 'Canada',
  latitude: town.latitude,
  longitude: town.longitude,
  region: 'North America',
  geo_region: 'Atlantic Canada'
}));

const res = await fetch(`${SUPABASE_URL}/rest/v1/towns`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify(townsToInsert)
});

if (!res.ok) {
  const error = await res.text();
  console.error('Error:', error);
  process.exit(1);
}

const data = await res.json();
console.log(`✅ Successfully added ${data.length} Nova Scotia towns:\n`);
data.forEach(town => {
  console.log(`- ${town.name} (${town.latitude}, ${town.longitude})`);
});
