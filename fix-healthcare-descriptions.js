import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Balanced, realistic descriptions based on actual scores (0-9 scale)
function getHealthcareDescription(town) {
  const score = town.healthcare_score || 5;
  const hospitals = town.hospital_count || 0;
  const population = town.population || 50000;
  const country = town.country || '';
  
  // English-speaking countries
  const englishSpeaking = ['United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'Ireland'].includes(country);
  const partialEnglish = ['Netherlands', 'Germany', 'Belgium', 'Malta', 'Cyprus', 'Singapore'].includes(country);
  
  let description = '';
  
  // Score-based assessment (balanced and realistic)
  if (score >= 8) {
    // Excellent healthcare (8-9)
    if (hospitals >= 3) {
      description = `Well-developed healthcare with ${hospitals} hospitals nearby and modern facilities. `;
    } else if (hospitals >= 1) {
      description = `Good healthcare infrastructure with ${hospitals === 1 ? 'a hospital' : `${hospitals} hospitals`} within reach. `;
    } else {
      description = `Quality healthcare available though hospital access requires travel. `;
    }
    
    if (englishSpeaking) {
      description += `English-speaking medical staff standard. `;
    } else if (partialEnglish) {
      description += `Many doctors speak English. `;
    } else {
      description += `Local language helpful for medical visits. `;
    }
    
    if (population > 500000) {
      description += `Specialists widely available, shorter wait times for most services.`;
    } else if (population > 100000) {
      description += `Common specialists available, reasonable appointment availability.`;
    } else {
      description += `Basic specialties covered, may need to travel for complex care.`;
    }
    
  } else if (score >= 6) {
    // Good healthcare (6-7)
    if (hospitals >= 2) {
      description = `Solid healthcare system with ${hospitals} hospitals serving the area. `;
    } else if (hospitals === 1) {
      description = `Adequate healthcare with one hospital locally. `;
    } else {
      description = `Healthcare available but no hospital within 10km. `;
    }
    
    if (englishSpeaking) {
      description += `No language barriers. `;
    } else if (partialEnglish) {
      description += `English commonly understood in medical settings. `;
    } else {
      description += `Basic English in tourist areas, translator may help elsewhere. `;
    }
    
    if (population > 200000) {
      description += `Most medical needs met locally, standard wait times.`;
    } else {
      description += `Common medical services available, specialist referrals may require travel.`;
    }
    
  } else if (score >= 4) {
    // Basic healthcare (4-5)
    if (hospitals > 0) {
      description = `Basic healthcare facilities with ${hospitals === 1 ? 'one hospital' : `${hospitals} hospitals`} nearby. `;
    } else {
      description = `Limited medical facilities, nearest hospital over 10km away. `;
    }
    
    description += `Primary care available but specialists scarce. `;
    
    if (englishSpeaking) {
      description += `English-speaking staff simplifies care access.`;
    } else {
      description += `Language assistance often needed for medical care.`;
    }
    
  } else {
    // Limited healthcare (0-3)
    if (hospitals > 0) {
      description = `Minimal healthcare despite ${hospitals === 1 ? 'a hospital' : 'hospitals'} in area. `;
    } else {
      description = `Very limited medical facilities, no nearby hospitals. `;
    }
    
    description += `Only basic medical services, travel required for most treatments. `;
    
    if (population < 30000) {
      description += `Small town limitations mean medical travel is common.`;
    } else {
      description += `Consider proximity to larger medical centers when evaluating.`;
    }
  }
  
  // Add insurance note for expensive countries
  const expensiveHealthcare = ['United States', 'Switzerland', 'Norway', 'Iceland'].includes(country);
  if (expensiveHealthcare && !description.includes('insurance')) {
    description = description.replace(/\.$/, '. Comprehensive insurance essential.');
  }
  
  // Add warning for very small towns
  if (population < 20000 && hospitals === 0) {
    description = description.replace(/\.$/, '. Major medical needs require travel to larger cities.');
  }
  
  return description.trim();
}

async function fixHealthcareDescriptions() {
  console.log('🏥 FIXING HEALTHCARE DESCRIPTIONS\n');
  console.log('Creating balanced, human-readable assessments\n');
  
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
    const newDescription = getHealthcareDescription(town);
    
    // Collect samples across different score ranges
    if (samples.length < 20) {
      samples.push({
        name: town.name,
        country: town.country,
        description: newDescription,
        score: town.healthcare_score,
        hospitals: town.hospital_count,
        population: town.population
      });
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ healthcare_description: newDescription })
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
  console.log('HEALTHCARE DESCRIPTION UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show varied samples
  console.log('\n📋 SAMPLE DESCRIPTIONS:');
  
  // Show different score ranges
  const highScore = samples.filter(s => s.score >= 8).slice(0, 3);
  const midScore = samples.filter(s => s.score >= 5 && s.score < 8).slice(0, 3);
  const lowScore = samples.filter(s => s.score < 5).slice(0, 3);
  
  console.log('\nHigh scores (8-9):');
  highScore.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Score: ${s.score}, Hospitals: ${s.hospitals}):`);
    console.log(`"${s.description}"`);
  });
  
  console.log('\nMid scores (5-7):');
  midScore.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Score: ${s.score}, Hospitals: ${s.hospitals}):`);
    console.log(`"${s.description}"`);
  });
  
  console.log('\nLower scores (0-4):');
  lowScore.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Score: ${s.score}, Hospitals: ${s.hospitals}):`);
    console.log(`"${s.description}"`);
  });
}

// Run fix
fixHealthcareDescriptions().catch(console.error);