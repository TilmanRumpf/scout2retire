import fs from 'fs';

// Towns from Excel that we want to import
const excelTowns = JSON.parse(fs.readFileSync('missing_towns.json', 'utf8'));

// Towns currently in database (paste the list you provided)
const dbTowns = [
  { "name": "Sarandë", "country": "Albania" },
  { "name": "Pago Pago", "country": "American Samoa" },
  { "name": "Saint John's", "country": "Antigua and Barbuda" },
  { "name": "Bariloche", "country": "Argentina" },
  { "name": "Buenos Aires", "country": "Argentina" },
  { "name": "Mendoza", "country": "Argentina" },
  { "name": "Oranjestad", "country": "Aruba" },
  { "name": "Adelaide", "country": "Australia" },
  { "name": "Canberra", "country": "Australia" },
  { "name": "Coffs Harbour", "country": "Australia" },
  { "name": "Gold Coast", "country": "Australia" },
  { "name": "Hervey Bay", "country": "Australia" },
  { "name": "Hobart", "country": "Australia" },
  { "name": "Melbourne", "country": "Australia" },
  { "name": "Newcastle (Aus)", "country": "Australia" },
  { "name": "Perth", "country": "Australia" },
  { "name": "Port Macquarie", "country": "Australia" },
  { "name": "Sunshine Coast", "country": "Australia" },
  { "name": "Sydney", "country": "Australia" },
  { "name": "Victor Harbor", "country": "Australia" },
  { "name": "Vienna", "country": "Austria" },
  { "name": "George Town (Exuma)", "country": "Bahamas" },
  { "name": "Nassau", "country": "Bahamas" },
  { "name": "Bridgetown", "country": "Barbados" },
  { "name": "Bruges", "country": "Belgium" },
  { "name": "Dinant", "country": "Belgium" },
  { "name": "Ghent", "country": "Belgium" },
  { "name": "Leuven", "country": "Belgium" },
  { "name": "Tervuren", "country": "Belgium" },
  { "name": "Corozal", "country": "Belize" },
  { "name": "Placencia", "country": "Belize" },
  { "name": "San Ignacio", "country": "Belize" },
  { "name": "San Pedro (Ambergris Caye)", "country": "Belize" },
  { "name": "Gaborone", "country": "Botswana" },
  { "name": "Florianópolis", "country": "Brazil" },
  { "name": "Road Town", "country": "British Virgin Islands" },
  { "name": "Kampot", "country": "Cambodia" },
  { "name": "Phnom Penh", "country": "Cambodia" },
  { "name": "Siem Reap", "country": "Cambodia" },
  { "name": "Calgary", "country": "Canada" },
  { "name": "Charlottetown", "country": "Canada" },
  { "name": "Halifax", "country": "Canada" },
  { "name": "Kelowna", "country": "Canada" },
  { "name": "Kingston", "country": "Canada" },
  { "name": "London (ON)", "country": "Canada" },
  { "name": "Moncton", "country": "Canada" },
  { "name": "Niagara-on-the-Lake", "country": "Canada" },
  { "name": "Ottawa", "country": "Canada" },
  { "name": "Victoria", "country": "Canada" },
  { "name": "La Serena", "country": "Chile" },
  { "name": "Santiago", "country": "Chile" },
  { "name": "Valparaíso", "country": "Chile" },
  { "name": "Viña del Mar", "country": "Chile" },
  { "name": "Cartagena", "country": "Colombia" },
  { "name": "Medellin", "country": "Colombia" },
  { "name": "Medellín", "country": "Colombia" },
  { "name": "Santa Marta", "country": "Colombia" },
  { "name": "Villa de Leyva", "country": "Colombia" },
  { "name": "Rarotonga (Avarua)", "country": "Cook Islands" },
  { "name": "Atenas", "country": "Costa Rica" },
  { "name": "Escazú", "country": "Costa Rica" },
  { "name": "Grecia", "country": "Costa Rica" },
  { "name": "Tamarindo", "country": "Costa Rica" },
  { "name": "Dubrovnik", "country": "Croatia" },
  { "name": "Pula", "country": "Croatia" },
  { "name": "Rovinj", "country": "Croatia" },
  { "name": "Sibenik", "country": "Croatia" },
  { "name": "Split", "country": "Croatia" },
  { "name": "Trogir", "country": "Croatia" },
  { "name": "Zadar", "country": "Croatia" },
  { "name": "Willemstad", "country": "Curacao" },
  { "name": "Limassol", "country": "Cyprus" },
  { "name": "Prague", "country": "Czech Republic" },
  { "name": "Las Terrenas", "country": "Dominican Republic" },
  { "name": "Puerto Plata", "country": "Dominican Republic" },
  { "name": "Punta Cana", "country": "Dominican Republic" },
  { "name": "Sosúa", "country": "Dominican Republic" },
  { "name": "Cuenca", "country": "Ecuador" },
  { "name": "Manta", "country": "Ecuador" },
  { "name": "Quito", "country": "Ecuador" },
  { "name": "Salinas", "country": "Ecuador" },
  { "name": "Vilcabamba", "country": "Ecuador" },
  { "name": "Cairo", "country": "Egypt" },
  { "name": "El Gouna", "country": "Egypt" },
  { "name": "Hurghada", "country": "Egypt" },
  { "name": "Sharm El Sheikh", "country": "Egypt" },
  { "name": "Tallinn", "country": "Estonia" },
  { "name": "Nadi", "country": "Fiji" },
  { "name": "Savusavu", "country": "Fiji" },
  { "name": "Suva", "country": "Fiji" },
  { "name": "Aix-en-Provence", "country": "France" },
  { "name": "Annecy", "country": "France" },
  { "name": "Antibes", "country": "France" },
  { "name": "Avignon", "country": "France" },
  { "name": "Bordeaux", "country": "France" },
  { "name": "Cannes", "country": "France" },
  { "name": "Cassis", "country": "France" },
  { "name": "Cavalaire-sur-Mer", "country": "France" },
  { "name": "Le Lavandou", "country": "France" },
  { "name": "Menton", "country": "France" },
  { "name": "Montpellier", "country": "France" },
  { "name": "Nice", "country": "France" },
  { "name": "Paris", "country": "France" },
  { "name": "Pau", "country": "France" },
  { "name": "Perpignan", "country": "France" },
  { "name": "Sainte-Maxime", "country": "France" },
  { "name": "Saint-Tropez", "country": "France" },
  { "name": "Sarlat-la-Canéda", "country": "France" },
  { "name": "Papeete", "country": "French Polynesia" },
  { "name": "Eckernförde", "country": "Germany" },
  { "name": "Freiburg im Breisgau", "country": "Germany" },
  { "name": "Heidelberg", "country": "Germany" },
  { "name": "Lindau", "country": "Germany" },
  { "name": "Trier", "country": "Germany" },
  { "name": "Wiesbaden", "country": "Germany" },
  { "name": "Wismar", "country": "Germany" },
  { "name": "Athens", "country": "Greece" },
  { "name": "Chania", "country": "Greece" },
  { "name": "Corfu (Kerkyra)", "country": "Greece" },
  { "name": "Ioannina", "country": "Greece" },
  { "name": "Kalamata", "country": "Greece" },
  { "name": "Nafplio", "country": "Greece" },
  { "name": "Patras", "country": "Greece" },
  { "name": "Rethymno", "country": "Greece" },
  { "name": "Thessaloniki", "country": "Greece" },
  { "name": "Saint George", "country": "Grenada" },
  { "name": "Antigua", "country": "Guatemala" },
  { "name": "Lake Atitlán (Panajachel)", "country": "Guatemala" },
  { "name": "Roatán", "country": "Honduras" },
  { "name": "Budapest", "country": "Hungary" },
  { "name": "Reykjavik", "country": "Iceland" },
  { "name": "Goa", "country": "India" },
  { "name": "Kathmandu", "country": "India" },
  { "name": "Pondicherry", "country": "India" },
  { "name": "Cork", "country": "Ireland" },
  { "name": "Dublin", "country": "Ireland" },
  { "name": "Haifa", "country": "Israel" },
  { "name": "Tel Aviv", "country": "Israel" },
  { "name": "Bologna", "country": "Italy" },
  { "name": "Lecce", "country": "Italy" },
  { "name": "Lucca", "country": "Italy" },
  { "name": "Orvieto", "country": "Italy" },
  { "name": "Ostuni", "country": "Italy" },
  { "name": "Rome", "country": "Italy" },
  { "name": "Salerno", "country": "Italy" },
  { "name": "Spoleto", "country": "Italy" },
  { "name": "Taormina", "country": "Italy" },
  { "name": "Trieste", "country": "Italy" },
  { "name": "Luang Prabang", "country": "Laos" },
  { "name": "Vientiane", "country": "Laos" },
  { "name": "Jurmala", "country": "Latvia" },
  { "name": "Riga", "country": "Latvia" },
  { "name": "George Town", "country": "Malaysia" },
  { "name": "George Town (Penang)", "country": "Malaysia" },
  { "name": "Johor Bahru", "country": "Malaysia" },
  { "name": "Kuala Lumpur", "country": "Malaysia" },
  { "name": "Langkawi", "country": "Malaysia" },
  { "name": "Malacca", "country": "Malaysia" },
  { "name": "Sliema", "country": "Malta" },
  { "name": "Valletta", "country": "Malta" },
  { "name": "Majuro", "country": "Marshall Islands" },
  { "name": "Fort-de-France", "country": "Martinique" },
  { "name": "Grand Baie", "country": "Mauritius" },
  { "name": "Port Louis", "country": "Mauritius" },
  { "name": "Ensenada", "country": "Mexico" },
  { "name": "Huatulco", "country": "Mexico" },
  { "name": "Lake Chapala", "country": "Mexico" },
  { "name": "Lake Chapala (Ajijic)", "country": "Mexico" },
  { "name": "La Paz", "country": "Mexico" },
  { "name": "Loreto", "country": "Mexico" },
  { "name": "Los Cabos (Cabo San Lucas)", "country": "Mexico" },
  { "name": "Mazatlán", "country": "Mexico" },
  { "name": "Merida", "country": "Mexico" },
  { "name": "Mérida", "country": "Mexico" },
  { "name": "Oaxaca City", "country": "Mexico" },
  { "name": "Playa del Carmen", "country": "Mexico" },
  { "name": "Puebla", "country": "Mexico" },
  { "name": "Puerto Vallarta", "country": "Mexico" },
  { "name": "San Miguel de Allende", "country": "Mexico" },
  { "name": "Pohnpei (Kolonia)", "country": "Micronesia" },
  { "name": "Budva", "country": "Montenegro" },
  { "name": "Herceg Novi", "country": "Montenegro" },
  { "name": "Kotor", "country": "Montenegro" },
  { "name": "Agadir", "country": "Morocco" },
  { "name": "Casablanca", "country": "Morocco" },
  { "name": "Essaouira", "country": "Morocco" },
  { "name": "Marrakesh", "country": "Morocco" },
  { "name": "Tangier", "country": "Morocco" },
  { "name": "Swakopmund", "country": "Namibia" },
  { "name": "Windhoek", "country": "Namibia" },
  { "name": "Pokhara", "country": "Nepal" },
  { "name": "Amersfoort", "country": "Netherlands" },
  { "name": "Bergen (NH)", "country": "Netherlands" },
  { "name": "Haarlem", "country": "Netherlands" },
  { "name": "Hoorn", "country": "Netherlands" },
  { "name": "Leiden", "country": "Netherlands" },
  { "name": "Lemmer", "country": "Netherlands" },
  { "name": "Maastricht", "country": "Netherlands" },
  { "name": "Zutphen", "country": "Netherlands" },
  { "name": "Noumea", "country": "New Caledonia" },
  { "name": "Auckland", "country": "New Zealand" },
  { "name": "Christchurch", "country": "New Zealand" },
  { "name": "Napier", "country": "New Zealand" },
  { "name": "Nelson", "country": "New Zealand" },
  { "name": "Queenstown", "country": "New Zealand" },
  { "name": "Tauranga", "country": "New Zealand" },
  { "name": "Wanaka", "country": "New Zealand" },
  { "name": "Wellington", "country": "New Zealand" },
  { "name": "Kyrenia", "country": "Northern Cyprus" },
  { "name": "Paphos", "country": "Northern Cyprus" },
  { "name": "Koror", "country": "Palau" },
  { "name": "Bocas Town (Bocas del Toro)", "country": "Panama" },
  { "name": "Boquete", "country": "Panama" },
  { "name": "Coronado", "country": "Panama" },
  { "name": "Panama City", "country": "Panama" },
  { "name": "Pedasí", "country": "Panama" },
  { "name": "Asunción", "country": "Paraguay" },
  { "name": "Cusco", "country": "Peru" },
  { "name": "Baguio", "country": "Philippines" },
  { "name": "Cebu City", "country": "Philippines" },
  { "name": "Dumaguete", "country": "Philippines" },
  { "name": "Subic Bay (Olongapo)", "country": "Philippines" },
  { "name": "Tagaytay", "country": "Philippines" },
  { "name": "Albufeira", "country": "Portugal" },
  { "name": "Algarve (Lagos)", "country": "Portugal" },
  { "name": "Braga", "country": "Portugal" },
  { "name": "Carvoeiro", "country": "Portugal" },
  { "name": "Cascais", "country": "Portugal" },
  { "name": "Evora", "country": "Portugal" },
  { "name": "Funchal (Madeira)", "country": "Portugal" },
  { "name": "Lisbon", "country": "Portugal" },
  { "name": "Nazaré", "country": "Portugal" },
  { "name": "Olhão", "country": "Portugal" },
  { "name": "Portimão", "country": "Portugal" },
  { "name": "Porto", "country": "Portugal" },
  { "name": "Tavira", "country": "Portugal" },
  { "name": "Vila Real de Santo António", "country": "Portugal" },
  { "name": "Viseu", "country": "Portugal" },
  { "name": "Rincón", "country": "Puerto Rico" },
  { "name": "San Juan", "country": "Puerto Rico" },
  { "name": "Kigali", "country": "Rwanda" },
  { "name": "Basseterre", "country": "Saint Kitts and Nevis" },
  { "name": "Castries", "country": "Saint Lucia" },
  { "name": "Marigot", "country": "Saint Martin" },
  { "name": "Kingstown", "country": "Saint Vincent and Grenadines" },
  { "name": "Apia", "country": "Samoa" },
  { "name": "Dakar", "country": "Senegal" },
  { "name": "Victoria (Mahé)", "country": "Seychelles" },
  { "name": "Singapore", "country": "Singapore" },
  { "name": "Philipsburg", "country": "Sint Maarten" },
  { "name": "Ljubljana", "country": "Slovenia" },
  { "name": "Honiara", "country": "Solomon Islands" },
  { "name": "Cape Town", "country": "South Africa" },
  { "name": "Hermanus", "country": "South Africa" },
  { "name": "Knysna", "country": "South Africa" },
  { "name": "Plettenberg Bay", "country": "South Africa" },
  { "name": "Alicante", "country": "Spain" },
  { "name": "Baiona", "country": "Spain" },
  { "name": "Barcelona", "country": "Spain" },
  { "name": "Castro Urdiales", "country": "Spain" },
  { "name": "Comillas", "country": "Spain" },
  { "name": "Granada", "country": "Spain" },
  { "name": "Malaga", "country": "Spain" },
  { "name": "Marbella", "country": "Spain" },
  { "name": "Palma de Mallorca", "country": "Spain" },
  { "name": "Puerto de la Cruz", "country": "Spain" },
  { "name": "Sanlúcar de Barrameda", "country": "Spain" },
  { "name": "Valencia", "country": "Spain" },
  { "name": "Lugano", "country": "Switzerland" },
  { "name": "Kaohsiung", "country": "Taiwan" },
  { "name": "Taipei", "country": "Taiwan" },
  { "name": "Bangkok", "country": "Thailand" },
  { "name": "Chiang Mai", "country": "Thailand" },
  { "name": "Chiang Rai", "country": "Thailand" },
  { "name": "Hua Hin", "country": "Thailand" },
  { "name": "Koh Samui", "country": "Thailand" },
  { "name": "Phuket", "country": "Thailand" },
  { "name": "Udon Thani", "country": "Thailand" },
  { "name": "Neiafu", "country": "Tonga" },
  { "name": "Hammamet", "country": "Tunisia" },
  { "name": "Sousse", "country": "Tunisia" },
  { "name": "Tunis", "country": "Tunisia" },
  { "name": "Antalya", "country": "Turkey" },
  { "name": "Bodrum", "country": "Turkey" },
  { "name": "Fethiye", "country": "Turkey" },
  { "name": "Providenciales", "country": "Turks and Caicos" },
  { "name": "Abu Dhabi", "country": "United Arab Emirates" },
  { "name": "Dubai", "country": "United Arab Emirates" },
  { "name": "Bath", "country": "United Kingdom" },
  { "name": "Edinburgh", "country": "United Kingdom" },
  { "name": "Truro (Cornwall)", "country": "United Kingdom" },
  { "name": "Gainesville, FL", "country": "United States" },
  { "name": "Colonia del Sacramento", "country": "Uruguay" },
  { "name": "Montevideo", "country": "Uruguay" },
  { "name": "Punta del Este", "country": "Uruguay" },
  { "name": "Charlotte Amalie", "country": "U.S. Virgin Islands" },
  { "name": "Christiansted", "country": "U.S. Virgin Islands" },
  { "name": "Port Vila", "country": "Vanuatu" },
  { "name": "Da Nang", "country": "Vietnam" },
  { "name": "Ho Chi Minh City", "country": "Vietnam" },
  { "name": "Hoi An", "country": "Vietnam" },
  { "name": "Nha Trang", "country": "Vietnam" },
  { "name": "Vung Tau", "country": "Vietnam" }
];

// Clean country names
function normalizeCountryName(country) {
  if (!country) return '';
  
  // Remove parentheses and their contents
  let normalized = country.replace(/\s*\([^)]*\)\s*/g, '').trim();
  
  // Replace common variations
  const replacements = {
    'USA': 'United States',
    'UK': 'United Kingdom',
    '&': 'and',
    'Fed.States': 'Federal States',
    'St.': 'Saint'
  };
  
  Object.entries(replacements).forEach(([from, to]) => {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  });
  
  return normalized;
}

// Create a Set of existing towns for fast lookup
const existingTowns = new Set(
  dbTowns.map(t => `${t.name.toLowerCase()}|${t.country.toLowerCase()}`)
);

// Find truly missing towns
const stillMissing = [];

excelTowns.forEach(town => {
  const normalizedCountry = normalizeCountryName(town.country);
  const key = `${town.name.toLowerCase()}|${normalizedCountry.toLowerCase()}`;
  
  // Check various variations
  const variations = [
    key,
    `${town.name.toLowerCase()}|${town.country.toLowerCase()}`,
    `${town.name.toLowerCase()}|united sainttes`, // The typo in DB
    `${town.name.toLowerCase()}|u.s. virgin islands`,
    `${town.name.toLowerCase()}|us virgin islands`
  ];
  
  const exists = variations.some(v => existingTowns.has(v));
  
  if (!exists) {
    stillMissing.push({
      ...town,
      normalizedCountry
    });
  }
});

console.log(`Total towns in Excel: ${excelTowns.length}`);
console.log(`Towns in database: ${dbTowns.length}`);
console.log(`Still missing: ${stillMissing.length}`);

// Group by country
const byCountry = {};
stillMissing.forEach(t => {
  if (!byCountry[t.normalizedCountry]) {
    byCountry[t.normalizedCountry] = [];
  }
  byCountry[t.normalizedCountry].push(t.name);
});

console.log('\nMissing towns by country:');
Object.entries(byCountry).sort().forEach(([country, towns]) => {
  console.log(`${country}: ${towns.length} towns`);
});

// Generate SQL for remaining towns
let sql = `-- Remaining missing towns to import
-- Total: ${stillMissing.length} towns

`;

stillMissing.forEach(town => {
  const regions = [town.continent, town.category].filter(Boolean);
  const climateDesc = town.category?.includes('Mediterranean') ? 'Mediterranean climate' :
                     town.category?.includes('Caribbean') ? 'Tropical Caribbean climate' :
                     town.category?.includes('Asia') ? 'Varied Asian climate' :
                     null;
  
  sql += `INSERT INTO towns (name, country, region, regions, climate_description)
SELECT '${town.name.replace(/'/g, "''")}', '${town.normalizedCountry.replace(/'/g, "''")}', ${town.region ? `'${town.region.replace(/'/g, "''")}'` : 'NULL'}, ARRAY[${regions.map(r => `'${r.replace(/'/g, "''")}'`).join(', ')}], ${climateDesc ? `'${climateDesc}'` : 'NULL'}
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = '${town.name.replace(/'/g, "''")}' AND country = '${town.normalizedCountry.replace(/'/g, "''")}');
`;
});

sql += `
-- Fix the United States typo
UPDATE towns SET country = 'United States' WHERE country = 'United Sainttes';

-- Show final results
SELECT COUNT(*) as total_towns FROM towns;
SELECT country, COUNT(*) as count FROM towns GROUP BY country ORDER BY country;`;

fs.writeFileSync('final_missing_towns.sql', sql);
console.log('\nSQL script generated: final_missing_towns.sql');