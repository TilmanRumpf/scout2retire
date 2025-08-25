import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Your complete town list from Excel
const excelTowns = [
  { name: "Sarandë", continent: "Europe", country: "Albania", region: "Vlorë", category: "Mediterranean" },
  { name: "Pago Pago", continent: "Oceania", country: "American Samoa (US)", region: "Tutuila", category: "Oceania" },
  { name: "Saint John's", continent: "North America", country: "Antigua & Barbuda", region: "Saint John", category: "Caribbean" },
  { name: "Bariloche", continent: "South America", country: "Argentina", region: "Río Negro", category: "South America" },
  { name: "Buenos Aires", continent: "South America", country: "Argentina", region: "Buenos Aires", category: "South America" },
  { name: "Mendoza", continent: "South America", country: "Argentina", region: "Mendoza", category: "South America" },
  { name: "Oranjestad", continent: "North America", country: "Aruba (Netherlands)", region: "Aruba", category: "Caribbean" },
  { name: "Sydney", continent: "Oceania", country: "Australia", region: "New South Wales", category: "Australia & New Zealand" },
  { name: "Adelaide", continent: "Oceania", country: "Australia", region: "South Australia", category: "Australia & New Zealand" },
  { name: "Canberra", continent: "Oceania", country: "Australia", region: "Australian Capital Territory", category: "Australia & New Zealand" },
  { name: "Sunshine Coast", continent: "Oceania", country: "Australia", region: "Queensland", category: "Australia & New Zealand" },
  { name: "Coffs Harbour", continent: "Oceania", country: "Australia", region: "New South Wales", category: "Australia & New Zealand" },
  { name: "Gold Coast", continent: "Oceania", country: "Australia", region: "Queensland", category: "Australia & New Zealand" },
  { name: "Hervey Bay", continent: "Oceania", country: "Australia", region: "Queensland", category: "Australia & New Zealand" },
  { name: "Hobart", continent: "Oceania", country: "Australia", region: "Tasmania", category: "Australia & New Zealand" },
  { name: "Melbourne", continent: "Oceania", country: "Australia", region: "Victoria", category: "Australia & New Zealand" },
  { name: "Newcastle (Aus)", continent: "Oceania", country: "Australia", region: "New South Wales", category: "Australia & New Zealand" },
  { name: "Perth", continent: "Oceania", country: "Australia", region: "Western Australia", category: "Australia & New Zealand" },
  { name: "Port Macquarie", continent: "Oceania", country: "Australia", region: "New South Wales", category: "Australia & New Zealand" },
  { name: "Victor Harbor", continent: "Oceania", country: "Australia", region: "South Australia", category: "Australia & New Zealand" },
  { name: "Vienna", continent: "Europe", country: "Austria", region: "Capital Region", category: "Europe" },
  { name: "Nassau", continent: "North America", country: "Bahamas", region: "New Providence", category: "Caribbean" },
  { name: "George Town (Exuma)", continent: "North America", country: "Bahamas", region: "Great Exuma", category: "Caribbean" },
  { name: "Bridgetown", continent: "North America", country: "Barbados", region: "Saint Michael", category: "Caribbean" },
  { name: "Tervuren", continent: "Europe", country: "Belgium", region: "Flemish Brabant", category: "Europe" },
  { name: "Bruges", continent: "Europe", country: "Belgium", region: "(Central)", category: "Europe" },
  { name: "Dinant", continent: "Europe", country: "Belgium", region: "Namur (Wallonia)", category: "Europe" },
  { name: "Ghent", continent: "Europe", country: "Belgium", region: "East Flanders", category: "Europe" },
  { name: "Leuven", continent: "Europe", country: "Belgium", region: "Flemish Brabant", category: "Europe" },
  { name: "Placencia", continent: "North America", country: "Belize", region: "Stann Creek", category: "Central America" },
  { name: "San Pedro (Ambergris Caye)", continent: "North America", country: "Belize", region: "San Pedro (Ambergris Caye)", category: "Central America" },
  { name: "Corozal", continent: "North America", country: "Belize", region: "Corozal", category: "Central America" },
  { name: "San Ignacio", continent: "North America", country: "Belize", region: "Cayo", category: "Central America" },
  { name: "Gaborone", continent: "Africa", country: "Botswana", region: "South-East", category: "Africa" },
  { name: "Florianópolis", continent: "South America", country: "Brazil", region: "Santa Catarina", category: "South America" },
  { name: "Road Town", continent: "North America", country: "British Virgin Islands", region: "Tortola", category: "Caribbean" },
  { name: "Siem Reap", continent: "Asia", country: "Cambodia", region: "Siem Reap", category: "Asia" },
  { name: "Phnom Penh", continent: "Asia", country: "Cambodia", region: "Phnom Penh", category: "Asia" },
  { name: "Kampot", continent: "Asia", country: "Cambodia", region: "Kampot", category: "Asia" },
  { name: "Calgary", continent: "North America", country: "Canada", region: "Alberta", category: "North America" },
  { name: "Halifax", continent: "North America", country: "Canada", region: "Nova Scotia", category: "North America" },
  { name: "Charlottetown", continent: "North America", country: "Canada", region: "Prince Edward Island", category: "North America" },
  { name: "Kelowna", continent: "North America", country: "Canada", region: "British Columbia", category: "North America" },
  { name: "Kingston", continent: "North America", country: "Canada", region: "Ontario", category: "North America" },
  { name: "London (ON)", continent: "North America", country: "Canada", region: "Ontario", category: "North America" },
  { name: "Moncton", continent: "North America", country: "Canada", region: "New Brunswick", category: "North America" },
  { name: "Niagara-on-the-Lake", continent: "North America", country: "Canada", region: "Ontario", category: "North America" },
  { name: "Ottawa", continent: "North America", country: "Canada", region: "Ontario", category: "North America" },
  { name: "Victoria", continent: "North America", country: "Canada", region: "British Columbia", category: "North America" },
  { name: "Santiago", continent: "South America", country: "Chile", region: "Santiago", category: "South America" },
  { name: "Valparaíso", continent: "South America", country: "Chile", region: "Valparaíso", category: "South America" },
  { name: "La Serena", continent: "South America", country: "Chile", region: "Coquimbo", category: "South America" },
  { name: "Viña del Mar", continent: "South America", country: "Chile", region: "Valparaíso", category: "South America" },
  { name: "Cartagena", continent: "South America", country: "Colombia", region: "Bolívar", category: "South America" },
  { name: "Medellín", continent: "South America", country: "Colombia", region: "Antioquia", category: "South America" },
  { name: "Santa Marta", continent: "South America", country: "Colombia", region: "Magdalena", category: "South America" },
  { name: "Villa de Leyva", continent: "South America", country: "Colombia", region: "Boyacá", category: "South America" },
  { name: "Rarotonga (Avarua)", continent: "Oceania", country: "Cook Islands (NZ)", region: "Rarotonga", category: "Oceania" },
  { name: "Tamarindo", continent: "North America", country: "Costa Rica", region: "Guanacaste", category: "Central America" },
  { name: "Atenas", continent: "North America", country: "Costa Rica", region: "Alajuela", category: "Central America" },
  { name: "Escazú", continent: "North America", country: "Costa Rica", region: "San José", category: "Central America" },
  { name: "Grecia", continent: "North America", country: "Costa Rica", region: "Alajuela", category: "Central America" },
  { name: "Dubrovnik", continent: "Europe", country: "Croatia", region: "Dubrovnik-Neretva", category: "Mediterranean" },
  { name: "Split", continent: "Europe", country: "Croatia", region: "Dalmatia", category: "Mediterranean" },
  { name: "Rovinj", continent: "Europe", country: "Croatia", region: "Istria", category: "Mediterranean" },
  { name: "Sibenik", continent: "Europe", country: "Croatia", region: "Dalmatia", category: "Mediterranean" },
  { name: "Pula", continent: "Europe", country: "Croatia", region: "Istria", category: "Mediterranean" },
  { name: "Trogir", continent: "Europe", country: "Croatia", region: "Dalmatia", category: "Mediterranean" },
  { name: "Zadar", continent: "Europe", country: "Croatia", region: "Zadar", category: "Mediterranean" },
  { name: "Willemstad", continent: "North America", country: "Curacao", region: "Curacao", category: "Caribbean" },
  { name: "Limassol", continent: "Asia", country: "Cyprus", region: "Limassol", category: "Mediterranean" },
  { name: "Prague", continent: "Europe", country: "Czech Republic", region: "Prague (Capital)", category: "Europe" },
  { name: "Sosúa", continent: "North America", country: "Dominican Republic", region: "Puerto Plata", category: "Caribbean" },
  { name: "Las Terrenas", continent: "North America", country: "Dominican Republic", region: "Samaná", category: "Caribbean" },
  { name: "Puerto Plata", continent: "North America", country: "Dominican Republic", region: "Puerto Plata", category: "Caribbean" },
  { name: "Punta Cana", continent: "North America", country: "Dominican Republic", region: "La Altagracia", category: "Caribbean" },
  { name: "Cuenca", continent: "South America", country: "Ecuador", region: "Azuay", category: "South America" },
  { name: "Quito", continent: "South America", country: "Ecuador", region: "Pichincha", category: "South America" },
  { name: "Manta", continent: "South America", country: "Ecuador", region: "Manabí", category: "South America" },
  { name: "Salinas", continent: "South America", country: "Ecuador", region: "Santa Elena", category: "South America" },
  { name: "Vilcabamba", continent: "South America", country: "Ecuador", region: "Loja", category: "South America" },
  { name: "Sharm El Sheikh", continent: "Africa", country: "Egypt", region: "South Sinai", category: "Africa" },
  { name: "Cairo", continent: "Africa", country: "Egypt", region: "Cairo", category: "Africa" },
  { name: "El Gouna", continent: "Africa", country: "Egypt", region: "Red Sea", category: "Africa" },
  { name: "Hurghada", continent: "Africa", country: "Egypt", region: "Red Sea", category: "Africa" },
  { name: "Tallinn", continent: "Europe", country: "Estonia", region: "West Flanders", category: "Europe" },
  { name: "Savusavu", continent: "Oceania", country: "Fiji", region: "Northern Division", category: "Oceania" },
  { name: "Suva", continent: "Oceania", country: "Fiji", region: "Central Division", category: "Oceania" },
  { name: "Nadi", continent: "Oceania", country: "Fiji", region: "Western Division", category: "Oceania" },
  { name: "Sarlat-la-Canéda", continent: "Europe", country: "France", region: "Nouvelle-Aquitaine (Dordogne)", category: "Europe" },
  { name: "Pau", continent: "Europe", country: "France", region: "Nouvelle-Aquitaine (Béarn)", category: "Europe" },
  { name: "Sainte-Maxime", continent: "Europe", country: "France", region: "Provence-Alpes-Côte d'Azur", category: "Mediterranean" },
  { name: "Bordeaux", continent: "Europe", country: "France", region: "Nouvelle-Aquitaine", category: "Europe" },
  { name: "Paris", continent: "Europe", country: "France", region: "Île-de-France", category: "Europe" },
  { name: "Aix-en-Provence", continent: "Europe", country: "France", region: "Provence-Alpes-Cote-d-Azur", category: "Europe" },
  { name: "Annecy", continent: "Europe", country: "France", region: "Auvergne-Rhone-Alpes", category: "Europe" },
  { name: "Antibes", continent: "Europe", country: "France", region: "Provence-Alpes-Côte d'Azur", category: "Mediterranean" },
  { name: "Avignon", continent: "Europe", country: "France", region: "Provence-Alpes-Côte d'Azur", category: "Europe" },
  { name: "Cannes", continent: "Europe", country: "France", region: "Provence-Alpes-Cote-d-Azur", category: "Mediterranean" },
  { name: "Cassis", continent: "Europe", country: "France", region: "Provence-Alpes-Côte d'Azur", category: "Mediterranean" },
  { name: "Cavalaire-sur-Mer", continent: "Europe", country: "France", region: "Provence-Alpes-Côte d'Azur", category: "Mediterranean" },
  { name: "Le Lavandou", continent: "Europe", country: "France", region: "Provence-Alpes-Côte d'Azur", category: "Mediterranean" },
  { name: "Menton", continent: "Europe", country: "France", region: "Provence-Alpes-Côte d'Azur", category: "Mediterranean" },
  { name: "Montpellier", continent: "Europe", country: "France", region: "Occitanie", category: "Mediterranean" },
  { name: "Nice", continent: "Europe", country: "France", region: "Provence-Alpes-Cote-d-Azur", category: "Mediterranean" },
  { name: "Perpignan", continent: "Europe", country: "France", region: "Occitanie (Pyrénées-Orientales)", category: "Mediterranean" },
  { name: "Papeete", continent: "Oceania", country: "French Polynesia (France)", region: "Windward Islands (Tahiti)", category: "Oceania" },
  { name: "Trier", continent: "Europe", country: "Germany", region: "Rhineland-Palatinate", category: "Europe" },
  { name: "Eckernförde", continent: "Europe", country: "Germany", region: "Schleswig-Holstein", category: "Europe" },
  { name: "Freiburg im Breisgau", continent: "Europe", country: "Germany", region: "Baden-Württemberg", category: "Europe" },
  { name: "Heidelberg", continent: "Europe", country: "Germany", region: "Baden-Württemberg", category: "Europe" },
  { name: "Lindau", continent: "Europe", country: "Germany", region: "Bavaria (Lake Constance)", category: "Europe" },
  { name: "Wiesbaden", continent: "Europe", country: "Germany", region: "Hesse", category: "Europe" },
  { name: "Wismar", continent: "Europe", country: "Germany", region: "Mecklenburg-Vorpommern", category: "Europe" },
  { name: "Thessaloniki", continent: "Europe", country: "Greece", region: "Central Macedonia", category: "Mediterranean" },
  { name: "Athens", continent: "Europe", country: "Greece", region: "Attica", category: "Mediterranean" },
  { name: "Chania", continent: "Europe", country: "Greece", region: "Crete", category: "Mediterranean" },
  { name: "Corfu (Kerkyra)", continent: "Europe", country: "Greece", region: "Ionian Islands", category: "Mediterranean" },
  { name: "Ioannina", continent: "Europe", country: "Greece", region: "Epirus", category: "Mediterranean" },
  { name: "Kalamata", continent: "Europe", country: "Greece", region: "Peloponnese", category: "Mediterranean" },
  { name: "Nafplio", continent: "Europe", country: "Greece", region: "Peloponnese", category: "Mediterranean" },
  { name: "Patras", continent: "Europe", country: "Greece", region: "Western Greece", category: "Mediterranean" },
  { name: "Rethymno", continent: "Europe", country: "Greece", region: "Crete", category: "Mediterranean" },
  { name: "Saint George", continent: "North America", country: "Grenada", region: "Saint George", category: "Caribbean" },
  { name: "Antigua", continent: "North America", country: "Guatemala", region: "Sacatepéquez", category: "Central America" },
  { name: "Lake Atitlán (Panajachel)", continent: "North America", country: "Guatemala", region: "Sololá", category: "Central America" },
  { name: "Roatán", continent: "North America", country: "Honduras", region: "Bay Islands", category: "Central America" },
  { name: "Budapest", continent: "Europe", country: "Hungary", region: "Central Hungary", category: "Europe" },
  { name: "Reykjavik", continent: "Europe", country: "Iceland", region: "Ticino", category: "Europe" },
  { name: "Kathmandu", continent: "Asia", country: "India", region: "Puducherry", category: "Asia" },
  { name: "Pondicherry", continent: "Asia", country: "India", region: "Goa", category: "Asia" },
  { name: "Cork", continent: "Europe", country: "Ireland", region: "Munster", category: "Europe" },
  { name: "Dublin", continent: "Europe", country: "Ireland", region: "Leinster", category: "Europe" },
  { name: "Tel Aviv", continent: "Asia", country: "Israel", region: "Tel Aviv District", category: "Mediterranean" },
  { name: "Haifa", continent: "Asia", country: "Israel", region: "Haifa District", category: "Mediterranean" },
  { name: "Spoleto", continent: "Europe", country: "Italy", region: "Umbria", category: "Europe" },
  { name: "Trieste", continent: "Europe", country: "Italy", region: "Friuli Venezia Giulia", category: "Europe" },
  { name: "Taormina", continent: "Europe", country: "Italy", region: "Sicily", category: "Mediterranean" },
  { name: "Bologna", continent: "Europe", country: "Italy", region: "Emilia-Romagna", category: "Europe" },
  { name: "Lecce", continent: "Europe", country: "Italy", region: "Apulia (Puglia)", category: "Mediterranean" },
  { name: "Lucca", continent: "Europe", country: "Italy", region: "Tuscany", category: "Europe" },
  { name: "Orvieto", continent: "Europe", country: "Italy", region: "Umbria", category: "Europe" },
  { name: "Ostuni", continent: "Europe", country: "Italy", region: "Apulia (Puglia)", category: "Mediterranean" },
  { name: "Salerno", continent: "Europe", country: "Italy", region: "Campania", category: "Mediterranean" },
  { name: "Goa", continent: "Asia", country: "India", region: "Goa", category: "Asia" },
  { name: "Luang Prabang", continent: "Asia", country: "Laos", region: "Luang Prabang", category: "Asia" },
  { name: "Vientiane", continent: "Asia", country: "Laos", region: "Vientiane Prefecture", category: "Asia" },
  { name: "Jurmala", continent: "Europe", country: "Latvia", region: "Riga Region", category: "Europe" },
  { name: "Riga", continent: "Europe", country: "Latvia", region: "Riga Region", category: "Europe" },
  { name: "George Town (Penang)", continent: "Asia", country: "Malaysia", region: "Penang", category: "Asia" },
  { name: "Johor Bahru", continent: "Asia", country: "Malaysia", region: "Johor", category: "Asia" },
  { name: "Kuala Lumpur", continent: "Asia", country: "Malaysia", region: "Kuala Lumpur", category: "Asia" },
  { name: "Langkawi", continent: "Asia", country: "Malaysia", region: "Kedah", category: "Asia" },
  { name: "Malacca", continent: "Asia", country: "Malaysia", region: "Malacca", category: "Asia" },
  { name: "Sliema", continent: "Europe", country: "Malta", region: "—", category: "Mediterranean" },
  { name: "Valletta", continent: "Europe", country: "Malta", region: "—", category: "Mediterranean" },
  { name: "Majuro", continent: "Oceania", country: "Marshall Islands", region: "Majuro Atoll", category: "Oceania" },
  { name: "Fort-de-France", continent: "North America", country: "Martinique (France)", region: "Martinique", category: "Caribbean" },
  { name: "Grand Baie", continent: "Africa", country: "Mauritius", region: "Rivière du Rempart", category: "Africa" },
  { name: "Port Louis", continent: "Africa", country: "Mauritius", region: "Port Louis (Capital)", category: "Africa" },
  { name: "San Miguel de Allende", continent: "North America", country: "Mexico", region: "Guanajuato", category: "North America" },
  { name: "Ensenada", continent: "North America", country: "Mexico", region: "Baja California", category: "North America" },
  { name: "Huatulco", continent: "North America", country: "Mexico", region: "Oaxaca", category: "North America" },
  { name: "Lake Chapala (Ajijic)", continent: "North America", country: "Mexico", region: "Jalisco", category: "North America" },
  { name: "Los Cabos (Cabo San Lucas)", continent: "North America", country: "Mexico", region: "Baja California Sur", category: "North America" },
  { name: "Mazatlán", continent: "North America", country: "Mexico", region: "Sinaloa", category: "North America" },
  { name: "Mérida", continent: "North America", country: "Mexico", region: "Yucatán", category: "North America" },
  { name: "Oaxaca City", continent: "North America", country: "Mexico", region: "Oaxaca", category: "North America" },
  { name: "Puebla", continent: "North America", country: "Mexico", region: "Puebla", category: "North America" },
  { name: "Puerto Vallarta", continent: "North America", country: "Mexico", region: "Jalisco", category: "North America" },
  { name: "La Paz", continent: "North America", country: "Mexico", region: "Baja California Sur", category: "North America" },
  { name: "Loreto", continent: "North America", country: "Mexico", region: "Baja California Sur", category: "North America" },
  { name: "Playa del Carmen", continent: "North America", country: "Mexico", region: "Quintana Roo", category: "North America" },
  { name: "Pohnpei (Kolonia)", continent: "Oceania", country: "Micronesia (Fed.States)", region: "Pohnpei", category: "Oceania" },
  { name: "Budva", continent: "Europe", country: "Montenegro", region: "Budva", category: "Mediterranean" },
  { name: "Herceg Novi", continent: "Europe", country: "Montenegro", region: "Herceg Novi", category: "Mediterranean" },
  { name: "Kotor", continent: "Europe", country: "Montenegro", region: "Kotor", category: "Mediterranean" },
  { name: "Tangier", continent: "Africa", country: "Morocco", region: "Tanger-Tetouan-Al Hoceima", category: "Mediterranean" },
  { name: "Agadir", continent: "Africa", country: "Morocco", region: "Souss-Massa", category: "Africa" },
  { name: "Casablanca", continent: "Africa", country: "Morocco", region: "Casablanca-Settat", category: "Africa" },
  { name: "Essaouira", continent: "Africa", country: "Morocco", region: "Marrakesh-Safi", category: "Africa" },
  { name: "Marrakesh", continent: "Africa", country: "Morocco", region: "Marrakesh-Safi", category: "Africa" },
  { name: "Windhoek", continent: "Africa", country: "Namibia", region: "Khomas", category: "Africa" },
  { name: "Swakopmund", continent: "Africa", country: "Namibia", region: "Erongo", category: "Africa" },
  { name: "Pokhara", continent: "Asia", country: "Nepal", region: "Bagmati", category: "Asia" },
  { name: "Lemmer", continent: "Europe", country: "Netherlands", region: "Friesland", category: "Europe" },
  { name: "Amersfoort", continent: "Europe", country: "Netherlands", region: "Utrecht Province", category: "Europe" },
  { name: "Bergen (NH)", continent: "Europe", country: "Netherlands", region: "North Holland", category: "Europe" },
  { name: "Haarlem", continent: "Europe", country: "Netherlands", region: "North Holland", category: "Europe" },
  { name: "Hoorn", continent: "Europe", country: "Netherlands", region: "North Holland", category: "Europe" },
  { name: "Leiden", continent: "Europe", country: "Netherlands", region: "South Holland", category: "Europe" },
  { name: "Maastricht", continent: "Europe", country: "Netherlands", region: "Limburg", category: "Europe" },
  { name: "Zutphen", continent: "Europe", country: "Netherlands", region: "Gelderland", category: "Europe" },
  { name: "Noumea", continent: "Oceania", country: "New Caledonia (France)", region: "South Province", category: "Oceania" },
  { name: "Tauranga", continent: "Oceania", country: "New Zealand", region: "Bay of Plenty", category: "Australia & New Zealand" },
  { name: "Auckland", continent: "Oceania", country: "New Zealand", region: "Auckland", category: "Australia & New Zealand" },
  { name: "Christchurch", continent: "Oceania", country: "New Zealand", region: "Canterbury", category: "Australia & New Zealand" },
  { name: "Napier", continent: "Oceania", country: "New Zealand", region: "Hawke's Bay", category: "Australia & New Zealand" },
  { name: "Nelson", continent: "Oceania", country: "New Zealand", region: "Tasman / Nelson Region", category: "Australia & New Zealand" },
  { name: "Queenstown", continent: "Oceania", country: "New Zealand", region: "Otago", category: "Australia & New Zealand" },
  { name: "Wanaka", continent: "Oceania", country: "New Zealand", region: "Otago", category: "Australia & New Zealand" },
  { name: "Wellington", continent: "Oceania", country: "New Zealand", region: "Wellington", category: "Australia & New Zealand" },
  { name: "Kyrenia", continent: "Asia", country: "Northern Cyprus", region: "Kyrenia", category: "Mediterranean" },
  { name: "Paphos", continent: "Asia", country: "Northern Cyprus", region: "Paphos", category: "Mediterranean" },
  { name: "Koror", continent: "Oceania", country: "Palau", region: "Koror", category: "Oceania" },
  { name: "Boquete", continent: "North America", country: "Panama", region: "Chiriquí", category: "Central America" },
  { name: "Bocas Town (Bocas del Toro)", continent: "North America", country: "Panama", region: "Bocas del Toro", category: "Central America" },
  { name: "Coronado", continent: "North America", country: "Panama", region: "Panamá Oeste", category: "Central America" },
  { name: "Panama City", continent: "North America", country: "Panama", region: "Panamá", category: "Central America" },
  { name: "Pedasí", continent: "North America", country: "Panama", region: "Los Santos", category: "Central America" },
  { name: "Asunción", continent: "South America", country: "Paraguay", region: "Asunción", category: "South America" },
  { name: "Cusco", continent: "South America", country: "Peru", region: "Cusco", category: "South America" },
  { name: "Subic Bay (Olongapo)", continent: "Asia", country: "Philippines", region: "Zambales", category: "Asia" },
  { name: "Baguio", continent: "Asia", country: "Philippines", region: "Benguet", category: "Asia" },
  { name: "Cebu City", continent: "Asia", country: "Philippines", region: "Cebu", category: "Asia" },
  { name: "Tagaytay", continent: "Asia", country: "Philippines", region: "Cavite", category: "Asia" },
  { name: "Dumaguete", continent: "Asia", country: "Philippines", region: "Negros Oriental", category: "Asia" },
  { name: "Lisbon", continent: "Europe", country: "Portugal", region: "Lisbon District", category: "Europe" },
  { name: "Viseu", continent: "Europe", country: "Portugal", region: "Centro", category: "Europe" },
  { name: "Tavira", continent: "Europe", country: "Portugal", region: "Algarve", category: "Mediterranean" },
  { name: "Porto", continent: "Europe", country: "Portugal", region: "Porto District", category: "Europe" },
  { name: "Albufeira", continent: "Europe", country: "Portugal", region: "Algarve", category: "Mediterranean" },
  { name: "Algarve (Lagos)", continent: "Europe", country: "Portugal", region: "Algarve (Faro)", category: "Europe" },
  { name: "Braga", continent: "Europe", country: "Portugal", region: "Norte", category: "Europe" },
  { name: "Carvoeiro", continent: "Europe", country: "Portugal", region: "Algarve", category: "Mediterranean" },
  { name: "Cascais", continent: "Europe", country: "Portugal", region: "Lisbon District", category: "Europe" },
  { name: "Evora", continent: "Europe", country: "Portugal", region: "Alentejo", category: "Europe" },
  { name: "Funchal (Madeira)", continent: "Europe", country: "Portugal", region: "Madeira", category: "Europe" },
  { name: "Nazaré", continent: "Europe", country: "Portugal", region: "Centro", category: "Europe" },
  { name: "Portimão", continent: "Europe", country: "Portugal", region: "Algarve", category: "Mediterranean" },
  { name: "Vila Real de Santo António", continent: "Europe", country: "Portugal", region: "Algarve", category: "Mediterranean" },
  { name: "Olhão", continent: "Europe", country: "Portugal", region: "Algarve", category: "Mediterranean" },
  { name: "Rincón", continent: "North America", country: "Puerto Rico (US)", region: "Puerto Rico", category: "Caribbean" },
  { name: "San Juan", continent: "North America", country: "Puerto Rico (US)", region: "Puerto Rico", category: "Caribbean" },
  { name: "Kigali", continent: "Africa", country: "Rwanda", region: "Kigali", category: "Africa" },
  { name: "Castries", continent: "North America", country: "Saint Lucia", region: "Castries", category: "Caribbean" },
  { name: "Marigot", continent: "North America", country: "Saint Martin (France)", region: "Saint Martin", category: "Caribbean" },
  { name: "Apia", continent: "Oceania", country: "Samoa", region: "Tuamasaga (Upolu)", category: "Oceania" },
  { name: "Dakar", continent: "Africa", country: "Senegal", region: "Dakar", category: "Africa" },
  { name: "Victoria (Mahé)", continent: "Africa", country: "Seychelles", region: "Mahé", category: "Africa" },
  { name: "Singapore", continent: "Asia", country: "Singapore", region: "—", category: "Asia" },
  { name: "Philipsburg", continent: "North America", country: "Sint Maarten", region: "Sint Maarten", category: "Caribbean" },
  { name: "Ljubljana", continent: "Europe", country: "Slovenia", region: "Osrednjeslovenska", category: "Europe" },
  { name: "Honiara", continent: "Oceania", country: "Solomon Islands", region: "Guadalcanal", category: "Oceania" },
  { name: "Cape Town", continent: "Africa", country: "South Africa", region: "Western Cape", category: "Africa" },
  { name: "Hermanus", continent: "Africa", country: "South Africa", region: "Western Cape", category: "Africa" },
  { name: "Knysna", continent: "Africa", country: "South Africa", region: "Western Cape", category: "Africa" },
  { name: "Plettenberg Bay", continent: "Africa", country: "South Africa", region: "Western Cape", category: "Africa" },
  { name: "Puerto de la Cruz", continent: "Europe", country: "Spain", region: "Canary Islands", category: "Europe" },
  { name: "Baiona", continent: "Europe", country: "Spain", region: "Galicia (Pontevedra)", category: "Atlantic Coast" },
  { name: "Castro Urdiales", continent: "Europe", country: "Spain", region: "Cantabria", category: "Atlantic Coast" },
  { name: "Comillas", continent: "Europe", country: "Spain", region: "Cantabria", category: "Atlantic Coast" },
  { name: "Granada", continent: "Europe", country: "Spain", region: "Andalusia", category: "Mediterranean" },
  { name: "Sanlúcar de Barrameda", continent: "Europe", country: "Spain", region: "Andalusia (Cádiz)", category: "Atlantic Coast" },
  { name: "Alicante", continent: "Europe", country: "Spain", region: "Valencian Community", category: "Mediterranean" },
  { name: "Valencia", continent: "Europe", country: "Spain", region: "Valencian Community", category: "Mediterranean" },
  { name: "Barcelona", continent: "Europe", country: "Spain", region: "Catalonia", category: "Europe" },
  { name: "Malaga", continent: "Europe", country: "Spain", region: "Andalusia", category: "Mediterranean" },
  { name: "Marbella", continent: "Europe", country: "Spain", region: "Andalusia", category: "Mediterranean" },
  { name: "Palma de Mallorca", continent: "Europe", country: "Spain", region: "Balearic Islands", category: "Mediterranean" },
  { name: "Basseterre", continent: "North America", country: "St. Kitts & Nevis", region: "Saint George Basseterre", category: "Caribbean" },
  { name: "Kingstown", continent: "North America", country: "St. Vincent & Grenadines", region: "Saint George", category: "Caribbean" },
  { name: "Lugano", continent: "Europe", country: "Switzerland", region: "Harju (Tallinn)", category: "Europe" },
  { name: "Taipei", continent: "Asia", country: "Taiwan", region: "—", category: "Asia" },
  { name: "Kaohsiung", continent: "Asia", country: "Taiwan", region: "—", category: "Asia" },
  { name: "Bangkok", continent: "Asia", country: "Thailand", region: "Bangkok", category: "Asia" },
  { name: "Chiang Mai", continent: "Asia", country: "Thailand", region: "Chiang Mai", category: "Asia" },
  { name: "Chiang Rai", continent: "Asia", country: "Thailand", region: "Chiang Rai", category: "Asia" },
  { name: "Hua Hin", continent: "Asia", country: "Thailand", region: "Prachuap Khiri Khan", category: "Asia" },
  { name: "Koh Samui", continent: "Asia", country: "Thailand", region: "Surat Thani", category: "Asia" },
  { name: "Phuket", continent: "Asia", country: "Thailand", region: "Phuket", category: "Asia" },
  { name: "Udon Thani", continent: "Asia", country: "Thailand", region: "Udon Thani", category: "Asia" },
  { name: "Neiafu", continent: "Oceania", country: "Tonga", region: "Vavaʻu", category: "Oceania" },
  { name: "Sousse", continent: "Africa", country: "Tunisia", region: "Sousse", category: "Africa" },
  { name: "Tunis", continent: "Africa", country: "Tunisia", region: "Tunis", category: "Africa" },
  { name: "Hammamet", continent: "Africa", country: "Tunisia", region: "Nabeul", category: "Mediterranean" },
  { name: "Antalya", continent: "Asia", country: "Turkey", region: "Antalya", category: "Mediterranean" },
  { name: "Bodrum", continent: "Asia", country: "Turkey", region: "Muğla", category: "Mediterranean" },
  { name: "Fethiye", continent: "Asia", country: "Turkey", region: "Muğla", category: "Mediterranean" },
  { name: "Providenciales", continent: "North America", country: "Turks & Caicos (UK)", region: "Providenciales", category: "Caribbean" },
  { name: "Charlotte Amalie", continent: "North America", country: "U.S. Virgin Islands", region: "St. Thomas", category: "Caribbean" },
  { name: "Christiansted", continent: "North America", country: "U.S. Virgin Islands", region: "St. Croix", category: "Caribbean" },
  { name: "Truro (Cornwall)", continent: "Europe", country: "UK (England)", region: "Cornwall", category: "Europe" },
  { name: "Bath", continent: "Europe", country: "UK (England)", region: "South West England", category: "Europe" },
  { name: "Edinburgh", continent: "Europe", country: "UK (Scotland)", region: "Scotland", category: "Europe" },
  { name: "Abu Dhabi", continent: "Asia", country: "United Arab Emirates", region: "Abu Dhabi", category: "Asia" },
  { name: "Dubai", continent: "Asia", country: "United Arab Emirates", region: "Dubai", category: "Asia" },
  { name: "Montevideo", continent: "South America", country: "Uruguay", region: "Montevideo", category: "South America" },
  { name: "Punta del Este", continent: "South America", country: "Uruguay", region: "Maldonado", category: "South America" },
  { name: "Colonia del Sacramento", continent: "South America", country: "Uruguay", region: "Colonia", category: "South America" },
  { name: "Gainesville", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Huntsville", continent: "North America", country: "USA", region: "Alabama", category: "North America" },
  { name: "Scottsdale", continent: "North America", country: "USA", region: "Arizona", category: "North America" },
  { name: "Tucson", continent: "North America", country: "USA", region: "Arizona", category: "North America" },
  { name: "Palm Springs", continent: "North America", country: "USA", region: "California", category: "North America" },
  { name: "San Diego", continent: "North America", country: "USA", region: "California", category: "North America" },
  { name: "Denver", continent: "North America", country: "USA", region: "Colorado", category: "North America" },
  { name: "St. Petersburg", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Sarasota", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Clearwater", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Fort Myers", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Jacksonville", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Naples", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Orlando", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Palm Beach", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Venice (FL)", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Savannah", continent: "North America", country: "USA", region: "Georgia", category: "North America" },
  { name: "Honolulu", continent: "North America", country: "USA", region: "Hawaii", category: "North America" },
  { name: "Boise", continent: "North America", country: "USA", region: "Idaho", category: "North America" },
  { name: "Las Vegas", continent: "North America", country: "USA", region: "Nevada", category: "North America" },
  { name: "Santa Fe", continent: "North America", country: "USA", region: "New Mexico", category: "North America" },
  { name: "Charlotte", continent: "North America", country: "USA", region: "North Carolina", category: "North America" },
  { name: "Portland", continent: "North America", country: "USA", region: "Oregon", category: "North America" },
  { name: "Charleston", continent: "North America", country: "USA", region: "South Carolina", category: "North America" },
  { name: "Myrtle Beach", continent: "North America", country: "USA", region: "South Carolina", category: "North America" },
  { name: "Chattanooga", continent: "North America", country: "USA", region: "Tennessee", category: "North America" },
  { name: "Austin", continent: "North America", country: "USA", region: "Texas", category: "North America" },
  { name: "Galveston", continent: "North America", country: "USA", region: "Texas", category: "North America" },
  { name: "Virginia Beach", continent: "North America", country: "USA", region: "Virginia", category: "North America" },
  { name: "Phoenix", continent: "North America", country: "USA", region: "Arizona", category: "North America" },
  { name: "Boulder", continent: "North America", country: "USA", region: "Colorado", category: "North America" },
  { name: "The Villages", continent: "North America", country: "USA", region: "Florida", category: "North America" },
  { name: "Asheville", continent: "North America", country: "USA", region: "North Carolina", category: "North America" },
  { name: "Chapel Hill", continent: "North America", country: "USA", region: "North Carolina", category: "North America" },
  { name: "Raleigh", continent: "North America", country: "USA", region: "North Carolina", category: "North America" },
  { name: "Bend", continent: "North America", country: "USA", region: "Oregon", category: "North America" },
  { name: "Lancaster", continent: "North America", country: "USA", region: "Pennsylvania", category: "North America" },
  { name: "Hilton Head Island", continent: "North America", country: "USA", region: "South Carolina", category: "North America" },
  { name: "San Antonio", continent: "North America", country: "USA", region: "Texas", category: "North America" },
  { name: "St. George", continent: "North America", country: "USA", region: "Utah", category: "North America" },
  { name: "Port Vila", continent: "Oceania", country: "Vanuatu", region: "Shefa", category: "Oceania" },
  { name: "Ho Chi Minh City", continent: "Asia", country: "Vietnam", region: "Ho Chi Minh City", category: "Asia" },
  { name: "Hoi An", continent: "Asia", country: "Vietnam", region: "Quảng Nam", category: "Asia" },
  { name: "Nha Trang", continent: "Asia", country: "Vietnam", region: "Khánh Hòa", category: "Asia" },
  { name: "Vung Tau", continent: "Asia", country: "Vietnam", region: "Bà Rịa-Vũng Tàu", category: "Asia" },
  { name: "Da Nang", continent: "Asia", country: "Vietnam", region: "Da Nang", category: "Asia" }
];

// Clean country names for matching
function cleanCountryName(country) {
  return country
    .replace(/\s*\([^)]*\)\s*/g, '') // Remove parenthetical info
    .replace(/Fed\.States/g, 'Federal States')
    .replace(/&/g, 'and')
    .trim();
}

async function analyzeTowns() {
  console.log('=== Town Database Analysis ===\n');
  console.log(`Excel towns: ${excelTowns.length}`);
  
  // Get current towns from database
  const { data: dbTowns, error } = await supabase
    .from('towns')
    .select('name, country')
    .order('name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Database towns: ${dbTowns.length}\n`);
  
  // Create lookup maps
  const dbTownsMap = new Map();
  dbTowns.forEach(town => {
    const key = `${town.name.toLowerCase()}_${cleanCountryName(town.country).toLowerCase()}`;
    dbTownsMap.set(key, town);
  });
  
  const excelTownsMap = new Map();
  excelTowns.forEach(town => {
    const key = `${town.name.toLowerCase()}_${cleanCountryName(town.country).toLowerCase()}`;
    excelTownsMap.set(key, town);
  });
  
  // Find missing towns (in Excel but not in DB)
  const missingTowns = [];
  excelTowns.forEach(town => {
    const key = `${town.name.toLowerCase()}_${cleanCountryName(town.country).toLowerCase()}`;
    if (!dbTownsMap.has(key)) {
      missingTowns.push(town);
    }
  });
  
  // Find extra towns (in DB but not in Excel)
  const extraTowns = [];
  dbTowns.forEach(town => {
    const key = `${town.name.toLowerCase()}_${cleanCountryName(town.country).toLowerCase()}`;
    if (!excelTownsMap.has(key)) {
      extraTowns.push(town);
    }
  });
  
  // Summary
  console.log('=== SUMMARY ===');
  console.log(`Towns in Excel: ${excelTowns.length}`);
  console.log(`Towns in Database: ${dbTowns.length}`);
  console.log(`Missing towns (need to import): ${missingTowns.length}`);
  console.log(`Extra towns in DB: ${extraTowns.length}\n`);
  
  // Show missing towns by country
  if (missingTowns.length > 0) {
    console.log('=== MISSING TOWNS BY COUNTRY ===');
    const byCountry = {};
    missingTowns.forEach(town => {
      const country = cleanCountryName(town.country);
      if (!byCountry[country]) byCountry[country] = [];
      byCountry[country].push(town.name);
    });
    
    Object.keys(byCountry).sort().forEach(country => {
      console.log(`\n${country} (${byCountry[country].length}):`);
      byCountry[country].sort().forEach(name => console.log(`  - ${name}`));
    });
  }
  
  // Show extra towns if any
  if (extraTowns.length > 0) {
    console.log('\n=== EXTRA TOWNS IN DATABASE ===');
    extraTowns.forEach(town => {
      console.log(`- ${town.name}, ${town.country}`);
    });
  }
  
  // Save missing towns to file for import
  if (missingTowns.length > 0) {
    const fs = await import('fs').then(m => m.default);
    fs.writeFileSync(
      'missing_towns.json',
      JSON.stringify(missingTowns, null, 2)
    );
    console.log(`\n✅ Saved ${missingTowns.length} missing towns to missing_towns.json`);
  }
}

// Run analysis
analyzeTowns().catch(console.error);