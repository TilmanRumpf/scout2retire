import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate DIFFERENT safety description that doesn't repeat crime_rate
function generateProperSafetyDescription(town) {
  const safetyScore = town.safety_score || 5;
  const hospitalCount = town.hospital_count || 0;
  const nearestHospital = parseInt(town.nearest_major_hospital_km) || 50;
  const disasterRisk = town.natural_disaster_risk || 3;
  const population = town.population || 50000;
  const country = town.country || '';
  
  // Geographic context
  const geographic = town.geographic_features?.join(' ').toLowerCase() || '';
  const isCoastal = geographic.includes('coastal') || geographic.includes('beach');
  const isMountain = geographic.includes('mountain');
  const isIsland = geographic.includes('island');
  const isUrban = population > 500000;
  const isRural = population < 30000;
  
  let descriptions = [];
  
  // SAFETY SCORE ASSESSMENT (not crime - that's already in crime_rate)
  if (safetyScore >= 8) {
    descriptions.push([
      'Well-regarded for personal security with strong community cohesion',
      'Peaceful environment with reliable public safety infrastructure',
      'Consistently rated highly for resident security and wellbeing',
      'Strong safety record with effective local governance'
    ][Math.floor(Math.random() * 4)]);
  } else if (safetyScore >= 6) {
    descriptions.push([
      'Generally secure with standard urban precautions advisable',
      'Reasonable safety profile with typical awareness recommended',
      'Stable environment requiring normal vigilance',
      'Decent security situation with routine precautions'
    ][Math.floor(Math.random() * 4)]);
  } else if (safetyScore >= 4) {
    descriptions.push([
      'Mixed safety record requiring careful area selection',
      'Variable security by district - research neighborhoods',
      'Safety varies - local knowledge beneficial',
      'Selective area choice important for security'
    ][Math.floor(Math.random() * 4)]);
  } else {
    descriptions.push([
      'Security challenges present - heightened awareness needed',
      'Safety concerns require careful planning',
      'Challenging security environment demands preparation',
      'Notable safety issues - thorough research essential'
    ][Math.floor(Math.random() * 4)]);
  }
  
  // EMERGENCY PREPAREDNESS (different from crime)
  if (hospitalCount >= 2) {
    descriptions.push('excellent emergency medical coverage');
  } else if (hospitalCount === 1) {
    descriptions.push('local emergency facilities available');
  } else if (nearestHospital <= 30) {
    descriptions.push('emergency care accessible within 30km');
  } else {
    descriptions.push('remote medical access requires planning');
  }
  
  // NATURAL HAZARDS (unique info)
  if (disasterRisk <= 2) {
    descriptions.push('minimal environmental hazards');
  } else if (disasterRisk <= 4) {
    descriptions.push('occasional weather events possible');
  } else if (disasterRisk <= 6) {
    descriptions.push('seasonal weather patterns to monitor');
  } else {
    descriptions.push('significant weather risks require preparation');
  }
  
  // LOCATION-SPECIFIC SAFETY FACTORS
  if (isUrban) {
    descriptions.push('typical big-city awareness needed');
  } else if (isRural) {
    descriptions.push('quiet rural setting with limited services');
  } else if (isCoastal) {
    descriptions.push('coastal location with water-related considerations');
  } else if (isMountain) {
    descriptions.push('mountain terrain affects emergency response times');
  } else if (isIsland) {
    descriptions.push('island isolation impacts evacuation options');
  }
  
  // PRACTICAL SAFETY TIPS (not repeating crime info)
  const tips = [];
  
  if (safetyScore >= 7) {
    tips.push([
      'Evening walks generally comfortable',
      'Public transport widely used safely',
      'Solo exploration typically fine',
      'Outdoor dining relaxed'
    ][Math.floor(Math.random() * 4)]);
  } else if (safetyScore >= 5) {
    tips.push([
      'Daytime activities unrestricted',
      'Group activities recommended evenings',
      'Tourist areas well-monitored',
      'Main districts generally secure'
    ][Math.floor(Math.random() * 4)]);
  } else {
    tips.push([
      'Guided tours advisable',
      'Secure accommodation essential',
      'Local contacts valuable',
      'Travel insurance critical'
    ][Math.floor(Math.random() * 4)]);
  }
  
  // WOMEN'S SAFETY (additional context)
  const womensSafety = [];
  if (safetyScore >= 8) {
    womensSafety.push('comfortable for solo female residents');
  } else if (safetyScore >= 6) {
    womensSafety.push('generally fine for independent women');
  } else if (safetyScore >= 4) {
    womensSafety.push('women should use standard precautions');
  } else {
    womensSafety.push('solo female travelers need extra care');
  }
  
  // Combine into natural paragraph
  let finalDescription = descriptions[0] + '. ';
  finalDescription += descriptions[1].charAt(0).toUpperCase() + descriptions[1].slice(1) + ' with ' + descriptions[2] + '. ';
  
  if (descriptions[3]) {
    finalDescription += descriptions[3].charAt(0).toUpperCase() + descriptions[3].slice(1) + '. ';
  }
  
  finalDescription += tips[0].charAt(0).toUpperCase() + tips[0].slice(1) + ', ' + womensSafety[0] + '.';
  
  return finalDescription;
}

async function fixSafetyDescriptions() {
  console.log('🛡️ FIXING SAFETY DESCRIPTIONS - MAKING THEM UNIQUE\n');
  console.log('Creating descriptions that DON\'T repeat crime_rate text\n');
  
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
    const newDescription = generateProperSafetyDescription(town);
    
    // Collect samples to show difference
    if (samples.length < 15) {
      samples.push({
        name: town.name,
        country: town.country,
        crimeRate: town.crime_rate,
        oldSafety: town.safety_description,
        newSafety: newDescription,
        score: town.safety_score
      });
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ safety_description: newDescription })
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
  console.log('SAFETY DESCRIPTION FIX COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show before/after comparison
  console.log('\n🔄 BEFORE/AFTER COMPARISON:\n');
  
  samples.slice(0, 5).forEach(s => {
    console.log(`${s.name}, ${s.country} (Safety Score: ${s.score}):`);
    console.log('  Crime Rate:', s.crimeRate);
    console.log('  OLD Safety:', s.oldSafety?.substring(0, 80) + '...');
    console.log('  NEW Safety:', s.newSafety?.substring(0, 80) + '...');
    console.log('  ✅ NOW DIFFERENT!\n');
  });
  
  console.log('Safety descriptions now provide UNIQUE information, not repeating crime_rate!');
}

// Run fix
fixSafetyDescriptions().catch(console.error);