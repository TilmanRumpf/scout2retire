import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 Updating BATCH 3: Remaining Towns with Photos...\n')

// BATCH 3: REMAINING TOWNS (34 towns)
const batch3Towns = {
  // MORE GREECE
  'Ioannina': {
    country: 'Greece',
    description: "Ioannina sits beside a scenic lake with Byzantine history and mountain access. This northwestern city offers authentic Greek life away from tourist crowds.",
    cost_index: 1300,
    healthcare_score: 7,
    climate_description: "Continental climate with hot summers (30°C) and cool winters (5°C). More rain than southern Greece.",
    lifestyle_description: "University town with lakeside setting, historic castle, and traditional crafts.",
    healthcare_cost: 60,
    internet_speed: 70,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["lake_activities", "hiking", "museums", "traditional_crafts", "cave_tours"],
    interests_supported: ["nature", "cultural", "crafts", "quiet_lifestyle"],
    beaches_nearby: false,
    hiking_trails_km: 150,
    data_completeness_score: 75
  },

  'Kalamata': {
    country: 'Greece',
    description: "Kalamata offers beaches, olives, and authentic Peloponnese living. This coastal city provides Greek island feel with mainland convenience.",
    cost_index: 1400,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with hot summers (32°C) and mild winters (14°C). Very sunny.",
    lifestyle_description: "Relaxed coastal living with long beach, marina, and famous local olives.",
    healthcare_cost: 65,
    internet_speed: 60,
    public_transport_quality: 5,
    walkability: 7,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "sailing", "hiking", "olive_tours", "ancient_sites"],
    interests_supported: ["beach_lifestyle", "sailing", "culinary", "relaxed_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Nafplio': {
    country: 'Greece',
    description: "Nafplio charms as Greece's most romantic town with Venetian architecture and seaside setting. This former capital offers boutique Greek retirement.",
    cost_index: 1600,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with hot, dry summers and mild winters. Protected by mountains.",
    lifestyle_description: "Sophisticated small town with waterfront promenade, fortress views, and weekend Athenian visitors.",
    healthcare_cost: 70,
    internet_speed: 60,
    public_transport_quality: 5,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "fortress_tours", "museums", "waterfront_dining", "day_trips"],
    interests_supported: ["cultural", "romantic", "beach_lifestyle", "quiet_luxury"],
    beaches_nearby: true,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  'Patras': {
    country: 'Greece',
    description: "Patras serves as gateway to Ionian islands with vibrant culture and university energy. Greece's third city offers urban amenities at lower costs.",
    cost_index: 1300,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with mild, wet winters and hot, dry summers.",
    lifestyle_description: "Port city atmosphere with famous carnival, student life, and ferry connections.",
    healthcare_cost: 60,
    internet_speed: 70,
    public_transport_quality: 6,
    walkability: 7,
    safety_score: 8,
    quality_of_life: 7,
    activities_available: ["carnival", "theaters", "port_walks", "day_trips", "island_ferries"],
    interests_supported: ["cultural", "festivals", "urban_lifestyle", "island_hopping"],
    beaches_nearby: true,
    hiking_trails_km: 60,
    data_completeness_score: 75
  },

  'Rethymno': {
    country: 'Greece',
    description: "Rethymno preserves Venetian and Ottoman heritage on Crete's north coast. This atmospheric town offers beaches, history, and authentic Cretan culture.",
    cost_index: 1400,
    healthcare_score: 7,
    climate_description: "Mediterranean climate similar to Chania. Hot summers and mild winters.",
    lifestyle_description: "Historic harbor town with well-preserved old quarter, long beach, and artistic community.",
    healthcare_cost: 65,
    internet_speed: 60,
    public_transport_quality: 5,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "historical_tours", "tavernas", "festivals", "nearby_gorges"],
    interests_supported: ["historical", "beach_lifestyle", "cultural", "photography"],
    beaches_nearby: true,
    hiking_trails_km: 120,
    data_completeness_score: 75
  },

  'Thessaloniki': {
    country: 'Greece',
    description: "Thessaloniki pulses with Byzantine history, vibrant food scene, and youthful energy. Greece's second city offers urban sophistication at affordable prices.",
    cost_index: 1400,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with hot summers (32°C) and cool winters (9°C).",
    lifestyle_description: "Cosmopolitan port city with amazing food, nightlife, and cultural events year-round.",
    healthcare_cost: 70,
    internet_speed: 80,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["museums", "Byzantine_sites", "waterfront_walks", "markets", "nightlife"],
    interests_supported: ["urban_lifestyle", "cultural", "culinary", "nightlife"],
    beaches_nearby: true,
    hiking_trails_km: 70,
    data_completeness_score: 75
  },

  // IRELAND
  'Cork': {
    country: 'Ireland',
    description: "Cork charms with riverside setting, vibrant culture, and famous food scene. Ireland's 'rebel city' offers authentic Irish life with less rain than Dublin.",
    cost_index: 2000,
    healthcare_score: 8,
    climate_description: "Oceanic climate with mild temperatures year-round. Rainy but less than west coast.",
    lifestyle_description: "Friendly city with strong identity, great pubs, markets, and growing tech scene.",
    healthcare_cost: 100,
    internet_speed: 100,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["pubs", "markets", "festivals", "coastal_drives", "golf"],
    interests_supported: ["cultural", "music", "culinary", "social"],
    beaches_nearby: true,
    hiking_trails_km: 80,
    data_completeness_score: 75
  },

  'Dublin': {
    country: 'Ireland',
    description: "Dublin blends literary heritage, Georgian elegance, and modern dynamism. Ireland's capital offers EU benefits, English-speaking environment, and rich culture.",
    cost_index: 2500,
    healthcare_score: 8,
    climate_description: "Oceanic climate with cool summers (20°C) and mild winters (8°C). Frequent rain.",
    lifestyle_description: "Cosmopolitan city with world-class museums, theaters, pubs, and easy access to countryside.",
    healthcare_cost: 120,
    internet_speed: 120,
    public_transport_quality: 8,
    walkability: 9,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["museums", "theaters", "pubs", "parks", "coastal_walks", "day_trips"],
    interests_supported: ["cultural", "literary", "music", "urban_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  // EASTERN EUROPE
  'Budapest': {
    country: 'Hungary',
    description: "Budapest dazzles with thermal baths, Danube views, and imperial architecture. This grand capital offers European elegance at affordable prices.",
    cost_index: 1300,
    healthcare_score: 8,
    climate_description: "Continental climate with warm summers (27°C) and cold winters (0°C).",
    lifestyle_description: "Sophisticated city life with thermal spas, concerts, cafes, and excellent public transport.",
    healthcare_cost: 60,
    internet_speed: 150,
    public_transport_quality: 9,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["thermal_baths", "concerts", "river_cruises", "museums", "cafes"],
    interests_supported: ["cultural", "thermal_wellness", "music", "urban_lifestyle"],
    beaches_nearby: false,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  'Split': {
    country: 'Croatia',
    description: "Split combines Roman palace living with Adriatic beaches. This Dalmatian gem offers Mediterranean lifestyle, island hopping, and growing expat community.",
    cost_index: 1500,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with hot summers (30°C) and mild winters (11°C).",
    lifestyle_description: "Beach city built within Roman palace walls. Vibrant summer scene, quieter winters.",
    healthcare_cost: 70,
    internet_speed: 80,
    public_transport_quality: 6,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "sailing", "island_hopping", "historical_tours", "hiking"],
    interests_supported: ["beach_lifestyle", "sailing", "historical", "island_living"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Ljubljana': {
    country: 'Slovenia',
    description: "Ljubljana enchants with car-free center, green spaces, and Alpine proximity. Slovenia's capital offers high quality of life in compact, manageable size.",
    cost_index: 1700,
    healthcare_score: 8,
    climate_description: "Continental climate with warm summers (26°C) and cold winters (0°C).",
    lifestyle_description: "Green, walkable city with outdoor cafes, cultural events, and easy access to nature.",
    healthcare_cost: 80,
    internet_speed: 100,
    public_transport_quality: 7,
    walkability: 10,
    safety_score: 10,
    quality_of_life: 9,
    activities_available: ["cycling", "cafes", "markets", "hiking", "skiing", "cultural_events"],
    interests_supported: ["eco_friendly", "outdoor", "cultural", "quiet_urban"],
    beaches_nearby: false,
    hiking_trails_km: 150,
    ski_resorts_within_100km: 15,
    data_completeness_score: 75
  },

  'Riga': {
    country: 'Latvia',
    description: "Riga impresses with Art Nouveau architecture and Baltic charm. This cultural capital offers European living at Eastern European prices.",
    cost_index: 1400,
    healthcare_score: 7,
    climate_description: "Humid continental climate with mild summers (22°C) and cold winters (-5°C).",
    lifestyle_description: "Vibrant cultural scene with opera, concerts, and growing international community.",
    healthcare_cost: 60,
    internet_speed: 100,
    public_transport_quality: 8,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["opera", "museums", "markets", "Baltic_beaches", "concerts"],
    interests_supported: ["cultural", "music", "architectural", "urban_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 40,
    data_completeness_score: 75
  },

  'Jurmala': {
    country: 'Latvia',
    description: "Jurmala stretches along Baltic beaches as Latvia's premier resort. This spa town offers seaside relaxation with easy Riga access.",
    cost_index: 1600,
    healthcare_score: 7,
    climate_description: "Maritime climate similar to Riga but milder. Cool summers, mild winters.",
    lifestyle_description: "Resort town atmosphere with wooden architecture, spas, and long sandy beaches.",
    healthcare_cost: 70,
    internet_speed: 80,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "spas", "concerts", "forest_walks", "cycling"],
    interests_supported: ["beach_lifestyle", "spa_wellness", "quiet_luxury", "nature"],
    beaches_nearby: true,
    hiking_trails_km: 30,
    data_completeness_score: 75
  },

  // MONTENEGRO
  'Budva': {
    country: 'Montenegro',
    description: "Budva buzzes as Montenegro's tourism capital with beaches and nightlife. This Adriatic resort offers Mediterranean living at Balkan prices.",
    cost_index: 1400,
    healthcare_score: 6,
    climate_description: "Mediterranean climate with hot summers (30°C) and mild winters (12°C).",
    lifestyle_description: "Beach resort atmosphere busy in summer, peaceful in winter. Growing expat community.",
    healthcare_cost: 50,
    internet_speed: 60,
    public_transport_quality: 5,
    walkability: 7,
    safety_score: 8,
    quality_of_life: 7,
    activities_available: ["beaches", "nightlife", "water_sports", "old_town_walks", "boat_trips"],
    interests_supported: ["beach_lifestyle", "social", "water_sports", "affordable_luxury"],
    beaches_nearby: true,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  'Herceg Novi': {
    country: 'Montenegro',
    description: "Herceg Novi cascades down to the Bay of Kotor entrance. This botanical city offers year-round flowers, sea access, and relaxed Montenegrin pace.",
    cost_index: 1300,
    healthcare_score: 6,
    climate_description: "Mediterranean climate with mild winters due to bay protection. Lush and green.",
    lifestyle_description: "Quieter alternative to Kotor with botanical gardens, seafront promenade, and local feel.",
    healthcare_cost: 45,
    internet_speed: 50,
    public_transport_quality: 5,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 7,
    activities_available: ["swimming", "botanical_walks", "boat_trips", "fortress_visits", "cafes"],
    interests_supported: ["botanical", "quiet_coastal", "affordable", "relaxed_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 60,
    data_completeness_score: 75
  },

  'Kotor': {
    country: 'Montenegro',
    description: "Kotor mesmerizes with fjord-like bay and medieval walls. This UNESCO World Heritage site offers dramatic beauty and growing international appeal.",
    cost_index: 1500,
    healthcare_score: 6,
    climate_description: "Mediterranean climate with hot summers and mild, rainy winters.",
    lifestyle_description: "Historic walled city with cruise ships in summer, peaceful in off-season.",
    healthcare_cost: 50,
    internet_speed: 60,
    public_transport_quality: 5,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["bay_cruises", "wall_climbing", "swimming", "historical_tours", "hiking"],
    interests_supported: ["historical", "scenic_beauty", "photography", "quiet_seasons"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  // OTHER EUROPE
  'Valletta': {
    country: 'Malta',
    description: "Valletta packs incredible history into Europe's smallest capital. This fortified city offers year-round sun, English-speaking environment, and EU benefits.",
    cost_index: 2000,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with hot summers (30°C) and mild winters (15°C). Very sunny.",
    lifestyle_description: "Compact capital with incredible architecture, harbors, and easy access to beaches.",
    healthcare_cost: 90,
    internet_speed: 80,
    public_transport_quality: 7,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["historical_tours", "harbors", "diving", "boat_trips", "festivals"],
    interests_supported: ["historical", "maritime", "diving", "compact_city"],
    beaches_nearby: true,
    hiking_trails_km: 20,
    data_completeness_score: 75
  },

  'Bath': {
    country: 'United Kingdom',
    description: "Bath enchants with Georgian architecture and Roman heritage. This UNESCO World Heritage city offers quintessential English elegance and thermal springs.",
    cost_index: 2500,
    healthcare_score: 9,
    climate_description: "Oceanic climate with mild temperatures. Cool summers (22°C) and mild winters (7°C).",
    lifestyle_description: "Sophisticated city with theaters, museums, excellent shopping, and beautiful surrounding countryside.",
    healthcare_cost: 0,
    internet_speed: 100,
    public_transport_quality: 8,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["thermal_baths", "theaters", "museums", "countryside_walks", "shopping"],
    interests_supported: ["cultural", "historical", "thermal_wellness", "English_countryside"],
    beaches_nearby: false,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Edinburgh': {
    country: 'United Kingdom',
    description: "Edinburgh captivates with castle views, festivals, and Scottish charm. This sophisticated capital offers culture, history, and Highland access.",
    cost_index: 2200,
    healthcare_score: 9,
    climate_description: "Oceanic climate with cool summers (19°C) and mild winters (4°C). Can be windy.",
    lifestyle_description: "Cultural capital with world-famous festival, excellent restaurants, and walkable center.",
    healthcare_cost: 0,
    internet_speed: 100,
    public_transport_quality: 8,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["festivals", "castle_tours", "museums", "golf", "Highland_trips"],
    interests_supported: ["cultural", "festivals", "historical", "golf", "Scottish_culture"],
    beaches_nearby: true,
    hiking_trails_km: 150,
    data_completeness_score: 75
  },

  'Lemmer': {
    country: 'Netherlands',
    description: "Lemmer offers authentic Dutch waterside living in Friesland. This charming town provides sailing, cycling, and peaceful retirement away from tourist crowds.",
    cost_index: 1800,
    healthcare_score: 9,
    climate_description: "Maritime climate with mild summers (20°C) and cool winters (5°C). Often windy.",
    lifestyle_description: "Quiet waterside town perfect for sailing and cycling enthusiasts. Traditional Dutch atmosphere.",
    healthcare_cost: 110,
    internet_speed: 100,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 10,
    quality_of_life: 8,
    activities_available: ["sailing", "cycling", "fishing", "canal_walks", "bird_watching"],
    interests_supported: ["sailing", "cycling", "nature", "quiet_lifestyle"],
    beaches_nearby: false,
    hiking_trails_km: 20,
    data_completeness_score: 75
  },

  // AMERICAS
  'San Miguel de Allende': {
    country: 'Mexico',
    description: "San Miguel de Allende enchants with colonial architecture, perfect climate, and vibrant expat community. Mexico's premier retirement destination.",
    cost_index: 1400,
    healthcare_score: 7,
    climate_description: "Near-perfect climate with warm days (25°C) and cool nights year-round.",
    lifestyle_description: "Artistic community with galleries, restaurants, and cultural events. Large expat population.",
    healthcare_cost: 60,
    internet_speed: 50,
    public_transport_quality: 5,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["art_galleries", "markets", "hot_springs", "golf", "horseback_riding"],
    interests_supported: ["arts", "cultural", "culinary", "social", "crafts"],
    beaches_nearby: false,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  'Lake Chapala': {
    country: 'Mexico',
    description: "Lake Chapala offers Mexico's largest expat community on Mexico's largest lake. This Jalisco destination provides year-round spring weather and established amenities.",
    cost_index: 1200,
    healthcare_score: 7,
    climate_description: "Subtropical highland climate with constant spring-like temperatures (22-26°C).",
    lifestyle_description: "Relaxed lakeside living with huge expat community, golf courses, and easy Guadalajara access.",
    healthcare_cost: 50,
    internet_speed: 40,
    public_transport_quality: 5,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["golf", "tennis", "sailing", "markets", "expat_clubs"],
    interests_supported: ["golf", "expat_community", "lakeside_living", "social"],
    beaches_nearby: false,
    hiking_trails_km: 30,
    data_completeness_score: 75
  },

  'Merida': {
    country: 'Mexico',
    description: "Merida shines as Yucatan's cultural capital with colonial charm and Mayan heritage. This safe, clean city offers authentic Mexico with modern amenities.",
    cost_index: 1100,
    healthcare_score: 7,
    climate_description: "Tropical climate with hot, humid summers and warm winters. Coastal breezes help.",
    lifestyle_description: "Vibrant cultural scene with museums, markets, and proximity to beaches and ruins.",
    healthcare_cost: 45,
    internet_speed: 60,
    public_transport_quality: 6,
    walkability: 7,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["cultural_events", "markets", "cenotes", "beach_trips", "Mayan_sites"],
    interests_supported: ["cultural", "historical", "authentic_Mexican", "archaeological"],
    beaches_nearby: true,
    hiking_trails_km: 20,
    data_completeness_score: 75
  },

  'Cuenca': {
    country: 'Ecuador',
    description: "Cuenca charms with colonial architecture, spring weather, and Andean culture. This UNESCO city offers sophisticated retirement at incredible value.",
    cost_index: 800,
    healthcare_score: 7,
    climate_description: "Spring-like climate year-round (18-22°C) due to elevation. Rainy season November-May.",
    lifestyle_description: "Cultural city with museums, markets, and growing international community.",
    healthcare_cost: 40,
    internet_speed: 50,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["museums", "markets", "hiking", "hot_springs", "cultural_events"],
    interests_supported: ["cultural", "colonial_architecture", "affordable", "mild_climate"],
    beaches_nearby: false,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Boquete': {
    country: 'Panama',
    description: "Boquete offers cool mountain climate in Panama's highlands. This expat haven provides spring weather, coffee culture, and outdoor adventures.",
    cost_index: 1300,
    healthcare_score: 7,
    climate_description: "Highland climate with temperatures 15-25°C year-round. Misty during rainy season.",
    lifestyle_description: "Small mountain town with coffee farms, hiking trails, and established expat services.",
    healthcare_cost: 60,
    internet_speed: 40,
    public_transport_quality: 4,
    walkability: 6,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["hiking", "coffee_tours", "bird_watching", "hot_springs", "golf"],
    interests_supported: ["nature", "hiking", "coffee_culture", "expat_community"],
    beaches_nearby: false,
    hiking_trails_km: 200,
    data_completeness_score: 75
  },

  'Medellin': {
    country: 'Colombia',
    description: "Medellin impresses with perfect weather, modern infrastructure, and friendly culture. Colombia's 'City of Eternal Spring' offers cosmopolitan living at great value.",
    cost_index: 1000,
    healthcare_score: 8,
    climate_description: "Spring-like climate year-round (22°C average) due to elevation. No seasons.",
    lifestyle_description: "Modern, vibrant city with excellent metro, restaurants, and welcoming paisas (locals).",
    healthcare_cost: 50,
    internet_speed: 80,
    public_transport_quality: 9,
    walkability: 7,
    safety_score: 7,
    quality_of_life: 8,
    activities_available: ["museums", "cable_cars", "markets", "dancing", "day_trips"],
    interests_supported: ["urban_lifestyle", "cultural", "social", "perfect_weather"],
    beaches_nearby: false,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Gainesville': {
    country: 'United States',
    description: "Gainesville blends university energy with Florida charm. This college town offers cultural amenities, natural springs, and no state income tax.",
    cost_index: 1800,
    healthcare_score: 8,
    climate_description: "Humid subtropical with hot summers (32°C) and mild winters (20°C).",
    lifestyle_description: "University town atmosphere with cultural events, nature access, and growing retiree population.",
    healthcare_cost: 300,
    internet_speed: 150,
    public_transport_quality: 5,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["university_events", "springs", "hiking", "cultural_events", "sports"],
    interests_supported: ["intellectual", "nature", "cultural", "college_town"],
    beaches_nearby: false,
    hiking_trails_km: 80,
    data_completeness_score: 75
  },

  'Gainesville, FL': {
    country: 'United States',
    description: "Gainesville offers intellectual stimulation from University of Florida plus natural beauty. Enjoy springs, trails, and cultural events in this vibrant college town.",
    cost_index: 1800,
    healthcare_score: 8,
    climate_description: "Humid subtropical climate with hot, humid summers and mild winters.",
    lifestyle_description: "College town with museums, performing arts, and access to natural springs and parks.",
    healthcare_cost: 300,
    internet_speed: 150,
    public_transport_quality: 5,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["springs", "nature_trails", "university_events", "museums", "sports"],
    interests_supported: ["educational", "nature", "cultural", "sports"],
    beaches_nearby: false,
    hiking_trails_km: 80,
    data_completeness_score: 75
  },

  // ASIA
  'Chiang Mai': {
    country: 'Thailand',
    description: "Chiang Mai offers affordable luxury in Thailand's cultural capital. Excellent healthcare, year-round warmth, and welcoming expat community.",
    cost_index: 1000,
    healthcare_score: 8,
    climate_description: "Tropical climate with warm temperatures year-round (25-35°C). Rainy season June-October.",
    lifestyle_description: "Relaxed pace with Buddhist temples, night markets, and mountain scenery. Large expat community.",
    healthcare_cost: 50,
    internet_speed: 100,
    public_transport_quality: 6,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["temples", "markets", "hiking", "cooking_classes", "meditation"],
    interests_supported: ["spiritual", "cultural", "culinary", "nature", "wellness"],
    beaches_nearby: false,
    hiking_trails_km: 200,
    data_completeness_score: 75
  },

  'George Town': {
    country: 'Malaysia',
    description: "George Town blends colonial heritage with Asian culture in Penang. This UNESCO city offers excellent healthcare, diverse food, and island living.",
    cost_index: 1100,
    healthcare_score: 8,
    climate_description: "Tropical climate hot and humid year-round (27-32°C). Monsoon season September-November.",
    lifestyle_description: "Multicultural island city with incredible street food, heritage buildings, and beaches nearby.",
    healthcare_cost: 60,
    internet_speed: 80,
    public_transport_quality: 6,
    walkability: 7,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["street_food", "heritage_walks", "beaches", "temples", "markets"],
    interests_supported: ["culinary", "cultural", "heritage", "island_living"],
    beaches_nearby: true,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  // VIETNAM
  'Da Nang': {
    country: 'Vietnam',
    description: "Da Nang combines beach living with urban amenities on Vietnam's central coast. Modern infrastructure, affordable healthcare, and year-round sunshine.",
    cost_index: 900,
    healthcare_score: 7,
    climate_description: "Tropical climate with hot summers (35°C) and mild winters (25°C).",
    lifestyle_description: "Beach city with modern amenities, growing expat scene, and easy access to Hoi An.",
    healthcare_cost: 40,
    internet_speed: 80,
    public_transport_quality: 5,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 7,
    activities_available: ["beaches", "swimming", "golf", "hiking", "markets", "water_sports"],
    interests_supported: ["beach_lifestyle", "outdoor", "culinary", "modern_Asian"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Hoi An': {
    country: 'Vietnam',
    description: "Hoi An enchants with lantern-lit old town and nearby beaches. This UNESCO World Heritage site offers charm, tailors, and relaxed riverside living.",
    cost_index: 800,
    healthcare_score: 6,
    climate_description: "Tropical climate similar to Da Nang. Rainy season October-December.",
    lifestyle_description: "Historic trading port with pedestrian old town, beaches, and artistic community.",
    healthcare_cost: 35,
    internet_speed: 60,
    public_transport_quality: 4,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "cycling", "tailoring", "cooking_classes", "lantern_festival"],
    interests_supported: ["cultural", "beach_lifestyle", "photography", "culinary"],
    beaches_nearby: true,
    hiking_trails_km: 40,
    data_completeness_score: 75
  },

  'Nha Trang': {
    country: 'Vietnam',
    description: "Nha Trang offers beach resort living with Vietnamese prices. This coastal city provides diving, islands, and modern amenities on the South China Sea.",
    cost_index: 850,
    healthcare_score: 6,
    climate_description: "Tropical climate with consistent temperatures (25-32°C). Rainy season September-December.",
    lifestyle_description: "Beach resort city with Russian influence, seafood restaurants, and island hopping.",
    healthcare_cost: 35,
    internet_speed: 70,
    public_transport_quality: 5,
    walkability: 7,
    safety_score: 8,
    quality_of_life: 7,
    activities_available: ["beaches", "diving", "island_tours", "mud_baths", "seafood_dining"],
    interests_supported: ["beach_lifestyle", "diving", "island_hopping", "affordable_beach"],
    beaches_nearby: true,
    hiking_trails_km: 60,
    data_completeness_score: 75
  },

  'Vung Tau': {
    country: 'Vietnam',
    description: "Vung Tau provides beach escape near Ho Chi Minh City. This coastal city offers seafood, temples, and weekend getaway atmosphere year-round.",
    cost_index: 900,
    healthcare_score: 6,
    climate_description: "Tropical climate hot year-round. Less rain than other coastal areas.",
    lifestyle_description: "Beach city popular with locals and expats seeking coastal living near Saigon.",
    healthcare_cost: 40,
    internet_speed: 70,
    public_transport_quality: 5,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 7,
    activities_available: ["beaches", "temples", "golf", "seafood_restaurants", "cable_car"],
    interests_supported: ["beach_lifestyle", "golf", "seafood", "relaxed_coastal"],
    beaches_nearby: true,
    hiking_trails_km: 30,
    data_completeness_score: 75
  }
}

async function updateBatch3() {
  let successCount = 0
  let failCount = 0
  
  for (const [cityName, data] of Object.entries(batch3Towns)) {
    try {
      const { error } = await adminSupabase
        .from('towns')
        .update({
          ...data,
          last_ai_update: new Date().toISOString()
        })
        .eq('name', cityName)
        .eq('country', data.country)
      
      if (error) {
        console.log(`❌ Failed to update ${cityName}: ${error.message}`)
        failCount++
      } else {
        console.log(`✅ Updated ${cityName}, ${data.country}`)
        successCount++
      }
    } catch (err) {
      console.log(`❌ Error with ${cityName}: ${err.message}`)
      failCount++
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`\n📊 Batch 3 Complete:`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  
  // Final summary
  const { count: totalComplete } = await adminSupabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not('image_url_1', 'is', null)
    .gte('data_completeness_score', 70)
  
  console.log(`\n🎉 FINAL STATUS:`)
  console.log(`   Towns with photos and data: ${totalComplete}/71`)
}

updateBatch3()