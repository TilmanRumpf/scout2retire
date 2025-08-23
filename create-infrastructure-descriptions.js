import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Internet speed assessment
function getInternetQuality(speed) {
  if (speed >= 100) {
    return ['excellent fiber connectivity', 'high-speed broadband widely available', 'fast reliable internet', 'strong digital infrastructure'][Math.floor(Math.random() * 4)];
  } else if (speed >= 50) {
    return ['good broadband coverage', 'decent internet speeds', 'reliable connectivity', 'solid internet service'][Math.floor(Math.random() * 4)];
  } else if (speed >= 25) {
    return ['adequate internet service', 'basic broadband available', 'moderate internet speeds', 'functional connectivity'][Math.floor(Math.random() * 4)];
  } else if (speed >= 10) {
    return ['limited internet speeds', 'basic connectivity', 'slow broadband', 'minimal internet infrastructure'][Math.floor(Math.random() * 4)];
  } else {
    return ['poor internet connectivity', 'very limited broadband', 'unreliable internet', 'weak digital infrastructure'][Math.floor(Math.random() * 4)];
  }
}

// Public transport assessment
function getTransportQuality(score) {
  if (score >= 8) {
    return ['exceptional public transit system', 'comprehensive transport network', 'excellent mobility options', 'world-class public transport'][Math.floor(Math.random() * 4)];
  } else if (score >= 6) {
    return ['good public transport coverage', 'reliable transit options', 'decent bus/train network', 'solid transport infrastructure'][Math.floor(Math.random() * 4)];
  } else if (score >= 4) {
    return ['moderate public transport', 'basic transit services', 'limited but functional transport', 'some public mobility options'][Math.floor(Math.random() * 4)];
  } else if (score >= 2) {
    return ['minimal public transport', 'car-dependent infrastructure', 'limited transit options', 'private transport necessary'][Math.floor(Math.random() * 4)];
  } else {
    return ['virtually no public transport', 'personal vehicle essential', 'no transit infrastructure', 'complete car dependency'][Math.floor(Math.random() * 4)];
  }
}

// Utilities reliability based on cost and country
function getUtilitiesReliability(cost, country) {
  // Higher cost often means better reliability in developed countries
  const developedCountries = ['United States', 'Canada', 'Australia', 'United Kingdom', 'Germany', 'France', 'Netherlands', 'Belgium', 'Switzerland', 'Japan', 'Singapore'];
  const isDeveloped = developedCountries.includes(country);
  
  if (isDeveloped) {
    return ['reliable utilities', 'stable power and water', 'consistent essential services', 'dependable infrastructure'][Math.floor(Math.random() * 4)];
  } else if (cost >= 100) {
    return ['generally reliable utilities', 'mostly stable services', 'decent utility provision', 'adequate essential services'][Math.floor(Math.random() * 4)];
  } else if (cost >= 50) {
    return ['basic utilities functional', 'occasional service interruptions', 'utilities mostly reliable', 'standard service levels'][Math.floor(Math.random() * 4)];
  } else {
    return ['utilities variable', 'periodic outages possible', 'basic services with interruptions', 'infrastructure developing'][Math.floor(Math.random() * 4)];
  }
}

// Road and general infrastructure based on population and country
function getRoadInfrastructure(population, country, transport) {
  const developedCountries = ['United States', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Switzerland', 'Japan', 'Singapore', 'South Korea'];
  const isDeveloped = developedCountries.includes(country);
  
  if (isDeveloped) {
    return ['well-maintained roads', 'modern road network', 'excellent road conditions', 'quality road infrastructure'][Math.floor(Math.random() * 4)];
  } else if (population > 500000) {
    return ['decent urban roads', 'reasonable road network', 'mixed road conditions', 'variable road quality'][Math.floor(Math.random() * 4)];
  } else if (population > 100000) {
    return ['basic road infrastructure', 'roads adequate', 'some unpaved areas', 'infrastructure developing'][Math.floor(Math.random() * 4)];
  } else {
    return ['rural road conditions', 'basic road network', 'limited paved roads', 'simple infrastructure'][Math.floor(Math.random() * 4)];
  }
}

// Banking and services
function getBankingServices(population, country) {
  const digitalBanking = ['Singapore', 'South Korea', 'United Kingdom', 'Netherlands', 'Sweden', 'Finland', 'Estonia'];
  
  if (digitalBanking.includes(country)) {
    return ['advanced digital banking', 'cashless society emerging', 'excellent financial services', 'modern banking infrastructure'][Math.floor(Math.random() * 4)];
  } else if (population > 200000) {
    return ['full banking services', 'ATMs widely available', 'standard financial infrastructure', 'conventional banking access'][Math.floor(Math.random() * 4)];
  } else if (population > 50000) {
    return ['basic banking available', 'limited ATM coverage', 'essential financial services', 'modest banking options'][Math.floor(Math.random() * 4)];
  } else {
    return ['limited banking facilities', 'few ATMs available', 'basic financial services', 'cash-based economy'][Math.floor(Math.random() * 4)];
  }
}

// Walkability and urban planning
function getWalkability(transport, population, geographic) {
  const features = geographic?.join(' ').toLowerCase() || '';
  const isCoastal = features.includes('coastal') || features.includes('beach');
  const isMountain = features.includes('mountain');
  
  if (transport >= 6 && population > 100000) {
    return ['highly walkable city center', 'pedestrian-friendly design', 'excellent walkability', 'walking-oriented urban planning'][Math.floor(Math.random() * 4)];
  } else if (transport >= 4 || isCoastal) {
    return ['walkable downtown areas', 'decent pedestrian infrastructure', 'moderate walkability', 'some pedestrian zones'][Math.floor(Math.random() * 4)];
  } else if (isMountain) {
    return ['hillside terrain affects walkability', 'steep areas challenge walking', 'varied walkability by district', 'topography impacts mobility'][Math.floor(Math.random() * 4)];
  } else if (transport <= 2) {
    return ['car-oriented layout', 'limited walkability', 'driving necessary for most errands', 'spread-out development'][Math.floor(Math.random() * 4)];
  } else {
    return ['mixed walkability', 'some walkable areas', 'variable pedestrian access', 'selective walking zones'][Math.floor(Math.random() * 4)];
  }
}

// Generate complete infrastructure description
function generateInfrastructureDescription(town) {
  const internet = getInternetQuality(town.internet_speed || 25);
  const transport = getTransportQuality(town.public_transport_quality || 3);
  const utilities = getUtilitiesReliability(town.utilities_cost || 100, town.country);
  const roads = getRoadInfrastructure(town.population || 50000, town.country, town.public_transport_quality || 3);
  const banking = getBankingServices(town.population || 50000, town.country);
  const walkability = getWalkability(town.public_transport_quality || 3, town.population || 50000, town.geographic_features);
  
  // Build varied sentence structures
  const templates = [
    // Template 1: Internet-first
    `${internet.charAt(0).toUpperCase() + internet.slice(1)} supporting remote work, ${transport} for daily mobility. ${roads.charAt(0).toUpperCase() + roads.slice(1)} with ${utilities}. ${banking.charAt(0).toUpperCase() + banking.slice(1)}, ${walkability}.`,
    
    // Template 2: Transport-focused
    `${transport.charAt(0).toUpperCase() + transport.slice(1)} complemented by ${roads}. ${internet.charAt(0).toUpperCase() + internet.slice(1)}, ${utilities}. ${walkability.charAt(0).toUpperCase() + walkability.slice(1)} with ${banking}.`,
    
    // Template 3: Balanced overview
    `Infrastructure features ${internet} and ${transport}. ${utilities.charAt(0).toUpperCase() + utilities.slice(1)}, ${roads}. ${banking.charAt(0).toUpperCase() + banking.slice(1)} plus ${walkability}.`,
    
    // Template 4: Utilities-first
    `${utilities.charAt(0).toUpperCase() + utilities.slice(1)} supporting daily life, ${internet} for connectivity. ${transport.charAt(0).toUpperCase() + transport.slice(1)}, ${roads}. ${walkability.charAt(0).toUpperCase() + walkability.slice(1)}, ${banking}.`,
    
    // Template 5: Practical focus
    `Daily infrastructure includes ${utilities} and ${internet}. ${transport.charAt(0).toUpperCase() + transport.slice(1)} with ${roads}. ${banking.charAt(0).toUpperCase() + banking.slice(1)}, ${walkability}.`
  ];
  
  let description = templates[Math.floor(Math.random() * templates.length)];
  
  // Add special notes for extremes
  if (town.internet_speed >= 150) {
    description = description.replace(/\.$/, ' — digital nomad friendly.');
  } else if (town.internet_speed < 10) {
    description = description.replace(/\.$/, ' — connectivity challenges persist.');
  }
  
  if (town.public_transport_quality >= 9) {
    description = description.replace(/\.$/, ' — car-free living viable.');
  } else if (town.public_transport_quality <= 1) {
    description = description.replace(/\.$/, ' — personal vehicle essential.');
  }
  
  return description;
}

async function createInfrastructureDescriptions() {
  console.log('🏗️ CREATING INFRASTRUCTURE DESCRIPTIONS\n');
  console.log('Generating comprehensive infrastructure assessments for all towns\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country', { ascending: true });
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  const samples = [];
  
  for (const town of towns) {
    const newDescription = generateInfrastructureDescription(town);
    
    // Collect samples
    if (samples.length < 20) {
      samples.push({
        name: town.name,
        country: town.country,
        description: newDescription,
        internet: town.internet_speed,
        transport: town.public_transport_quality,
        population: town.population
      });
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ infrastructure_description: newDescription })
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('INFRASTRUCTURE DESCRIPTION UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show samples by category
  console.log('\n🏗️ SAMPLE INFRASTRUCTURE DESCRIPTIONS:\n');
  
  // High infrastructure
  const highInfra = samples.filter(s => s.transport >= 7).slice(0, 3);
  if (highInfra.length > 0) {
    console.log('Cities with Good Infrastructure:');
    highInfra.forEach(s => {
      console.log(`\n${s.name}, ${s.country} (Internet: ${s.internet}Mbps, Transport: ${s.transport}/10):`);
      console.log(`"${s.description}"`);
    });
  }
  
  // Medium infrastructure
  const midInfra = samples.filter(s => s.transport >= 3 && s.transport < 7).slice(0, 3);
  console.log('\nMedium Infrastructure:');
  midInfra.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Internet: ${s.internet}Mbps, Transport: ${s.transport}/10):`);
    console.log(`"${s.description}"`);
  });
  
  // Car-dependent areas
  const carDependent = samples.filter(s => s.transport <= 2).slice(0, 3);
  console.log('\nCar-Dependent Areas:');
  carDependent.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Internet: ${s.internet}Mbps, Transport: ${s.transport}/10):`);
    console.log(`"${s.description}"`);
  });
}

// Run creation
createInfrastructureDescriptions().catch(console.error);