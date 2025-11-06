import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Natural disaster risk descriptions
function getDisasterRisk(score) {
  if (score === null || score === undefined) score = 3;
  
  if (score <= 2) {
    return ['minimal natural disaster risk', 'very low disaster exposure', 'negligible natural hazards', 'rare extreme weather'][Math.floor(Math.random() * 4)];
  } else if (score <= 4) {
    return ['occasional weather events', 'some seasonal risks', 'moderate disaster potential', 'periodic weather concerns'][Math.floor(Math.random() * 4)];
  } else if (score <= 6) {
    return ['notable weather risks', 'seasonal hazards present', 'regular weather events', 'environmental risks exist'][Math.floor(Math.random() * 4)];
  } else {
    return ['significant natural risks', 'regular extreme weather', 'frequent environmental hazards', 'high disaster exposure'][Math.floor(Math.random() * 4)];
  }
}

// Emergency response quality based on hospital proximity
function getEmergencyResponse(hospitalCount, nearestHospital) {
  const distance = parseInt(nearestHospital) || 50;
  
  if (hospitalCount >= 2) {
    return ['multiple hospitals nearby', 'excellent emergency access', 'strong medical infrastructure', 'rapid emergency response'][Math.floor(Math.random() * 4)];
  } else if (hospitalCount === 1) {
    return ['hospital within reach', 'adequate emergency access', 'local hospital available', 'emergency care accessible'][Math.floor(Math.random() * 4)];
  } else if (distance <= 20) {
    return ['hospital within 20km', 'emergency care requires short travel', 'medical facilities nearby', 'hospital access reasonable'][Math.floor(Math.random() * 4)];
  } else if (distance <= 50) {
    return ['nearest hospital ' + distance + 'km away', 'medical facilities distant', 'emergency response delayed', 'hospital requires travel'][Math.floor(Math.random() * 4)];
  } else {
    return ['limited emergency access', 'remote from hospitals', 'medical facilities distant', 'emergency care requires planning'][Math.floor(Math.random() * 4)];
  }
}

// Area-specific safety notes
function getAreaNotes(town) {
  const country = town.country;
  const population = town.population || 50000;
  const geographic = town.geographic_features?.join(' ').toLowerCase() || '';
  
  // Tourist areas often have better policing
  if (town.description?.toLowerCase().includes('tourist') || 
      town.description?.toLowerCase().includes('resort')) {
    return 'tourist areas well-patrolled';
  }
  
  // Capital cities
  if (town.description?.toLowerCase().includes('capital')) {
    return 'varied safety by district';
  }
  
  // Beach towns
  if (geographic.includes('beach') || geographic.includes('coastal')) {
    return 'beach areas generally secure';
  }
  
  // Small towns
  if (population < 30000) {
    return 'small-town community watch';
  }
  
  // Mountain areas
  if (geographic.includes('mountain')) {
    return 'isolated but tight-knit community';
  }
  
  // Islands
  if (geographic.includes('island')) {
    return 'island community generally safe';
  }
  
  // Large cities
  if (population > 1000000) {
    return 'varies significantly by neighborhood';
  }
  
  return 'standard precautions advised';
}

// Country-specific safety context
function getCountryContext(country) {
  const veryStable = ['Switzerland', 'Norway', 'Denmark', 'Finland', 'Iceland', 'New Zealand', 'Singapore', 'Luxembourg', 'Austria', 'Netherlands'];
  const stable = ['Canada', 'Australia', 'Germany', 'Sweden', 'Belgium', 'Ireland', 'Portugal', 'Czech Republic', 'Slovenia', 'Estonia'];
  const moderate = ['United States', 'United Kingdom', 'France', 'Spain', 'Italy', 'Greece', 'Poland', 'Hungary', 'Croatia', 'Chile'];
  
  if (veryStable.includes(country)) {
    return 'highly stable country';
  } else if (stable.includes(country)) {
    return 'stable governance';
  } else if (moderate.includes(country)) {
    return 'generally stable';
  } else {
    return 'check current conditions';
  }
}

// Specific safety tips based on crime description
function getSafetyTips(crimeRate) {
  if (!crimeRate) return 'standard precautions apply';
  
  const crime = crimeRate.toLowerCase();
  
  if (crime.includes('very low') || crime.includes('minimal')) {
    return ['basic awareness sufficient', 'minimal precautions needed', 'standard safety practices', 'routine vigilance adequate'][Math.floor(Math.random() * 4)];
  } else if (crime.includes('low')) {
    return ['normal urban caution', 'standard safety awareness', 'typical precautions apply', 'basic vigilance recommended'][Math.floor(Math.random() * 4)];
  } else if (crime.includes('moderate')) {
    return ['situational awareness important', 'choose areas carefully', 'neighborhood research advised', 'area selection matters'][Math.floor(Math.random() * 4)];
  } else if (crime.includes('high') || crime.includes('significant')) {
    return ['heightened awareness essential', 'careful area selection crucial', 'strong precautions needed', 'security measures important'][Math.floor(Math.random() * 4)];
  } else {
    return 'standard urban precautions';
  }
}

// Women's safety consideration
function getWomensSafety(safetyScore, country) {
  const excellentCountries = ['Iceland', 'Norway', 'Finland', 'Denmark', 'Switzerland', 'New Zealand', 'Canada', 'Austria', 'Netherlands', 'Singapore'];
  const goodCountries = ['Australia', 'Germany', 'Sweden', 'Belgium', 'Ireland', 'Portugal', 'Slovenia', 'Estonia', 'Czech Republic', 'Luxembourg'];
  
  if (excellentCountries.includes(country) && safetyScore >= 7) {
    return 'excellent for solo female travelers';
  } else if (goodCountries.includes(country) && safetyScore >= 6) {
    return 'generally safe for women';
  } else if (safetyScore >= 7) {
    return 'reasonable for solo travelers';
  } else if (safetyScore >= 5) {
    return 'group travel advisable';
  } else {
    return 'exercise caution';
  }
}

// Generate comprehensive safety description
function generateSafetyDescription(town) {
  const safetyScore = town.safety_score || 5;
  const crimeRate = town.crime_rate || 'Moderate - Some crime exists';
  const hospitalCount = town.hospital_count || 0;
  const nearestHospital = town.nearest_major_hospital_km || '50';
  const disasterRisk = town.natural_disaster_risk || 3;
  
  // Get components
  const disasterDesc = getDisasterRisk(disasterRisk);
  const emergencyDesc = getEmergencyResponse(hospitalCount, nearestHospital);
  const areaNote = getAreaNotes(town);
  const countryContext = getCountryContext(town.country);
  const safetyTip = getSafetyTips(crimeRate);
  const womensNote = getWomensSafety(safetyScore, town.country);
  
  // Build description based on safety score
  let description = '';
  
  if (safetyScore >= 8) {
    // Very safe (8-10)
    description = `${crimeRate} in this ${countryContext} location. ${emergencyDesc.charAt(0).toUpperCase() + emergencyDesc.slice(1)} with ${disasterDesc}. ${areaNote.charAt(0).toUpperCase() + areaNote.slice(1)}, ${safetyTip}. ${womensNote.charAt(0).toUpperCase() + womensNote.slice(1)}.`;
  } else if (safetyScore >= 6) {
    // Safe (6-7)
    description = `${crimeRate}. ${emergencyDesc.charAt(0).toUpperCase() + emergencyDesc.slice(1)}, ${disasterDesc}. ${countryContext.charAt(0).toUpperCase() + countryContext.slice(1)} with ${areaNote}. ${safetyTip.charAt(0).toUpperCase() + safetyTip.slice(1)}, ${womensNote}.`;
  } else if (safetyScore >= 4) {
    // Moderate (4-5)
    description = `${crimeRate} requiring ${safetyTip}. ${emergencyDesc.charAt(0).toUpperCase() + emergencyDesc.slice(1)}, ${disasterDesc} present. ${areaNote.charAt(0).toUpperCase() + areaNote.slice(1)}. ${countryContext.charAt(0).toUpperCase() + countryContext.slice(1)}, ${womensNote}.`;
  } else {
    // Lower safety (0-3)
    description = `${crimeRate} - ${safetyTip} essential. ${emergencyDesc.charAt(0).toUpperCase() + emergencyDesc.slice(1)}, ${disasterDesc} possible. ${areaNote.charAt(0).toUpperCase() + areaNote.slice(1)} but ${countryContext}. ${womensNote.charAt(0).toUpperCase() + womensNote.slice(1)}.`;
  }
  
  // Add specific warnings for high-risk areas
  if (disasterRisk >= 7) {
    description = description.replace(/\.$/, ' - prepare for weather events.');
  }
  
  // Add note for very remote areas
  if (hospitalCount === 0 && parseInt(nearestHospital) > 50) {
    description = description.replace(/\.$/, ' - medical evacuation planning advised.');
  }
  
  // Clean up
  description = description.replace(/\s+/g, ' ').trim();
  
  return description;
}

async function improveSafetyDescriptions() {
  console.log('🛡️ IMPROVING SAFETY DESCRIPTIONS\n');
  console.log('Creating comprehensive safety assessments\n');
  
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
    const newDescription = generateSafetyDescription(town);
    
    // Collect samples
    if (samples.length < 20) {
      samples.push({
        name: town.town_name,
        country: town.country,
        description: newDescription,
        safetyScore: town.safety_score,
        hospitals: town.hospital_count,
        crimeRate: town.crime_rate?.substring(0, 30) + '...'
      });
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ safety_description: newDescription })
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.town_name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('SAFETY DESCRIPTION UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show samples by safety level
  console.log('\n🛡️ SAMPLE SAFETY DESCRIPTIONS:\n');
  
  // High safety
  const highSafety = samples.filter(s => s.safetyScore >= 8).slice(0, 5);
  console.log('High Safety (8-10):');
  highSafety.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Score: ${s.safetyScore}, Hospitals: ${s.hospitals}):`);
    console.log(`Crime: ${s.crimeRate}`);
    console.log(`"${s.description}"`);
  });
  
  // Moderate safety
  const midSafety = samples.filter(s => s.safetyScore >= 5 && s.safetyScore < 8).slice(0, 5);
  console.log('\nModerate Safety (5-7):');
  midSafety.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Score: ${s.safetyScore}, Hospitals: ${s.hospitals}):`);
    console.log(`Crime: ${s.crimeRate}`);
    console.log(`"${s.description}"`);
  });
  
  // Lower safety
  const lowSafety = samples.filter(s => s.safetyScore < 5).slice(0, 3);
  if (lowSafety.length > 0) {
    console.log('\nLower Safety (0-4):');
    lowSafety.forEach(s => {
      console.log(`\n${s.name}, ${s.country} (Score: ${s.safetyScore}, Hospitals: ${s.hospitals}):`);
      console.log(`Crime: ${s.crimeRate}`);
      console.log(`"${s.description}"`);
    });
  }
}

// Run improvement
improveSafetyDescriptions().catch(console.error);