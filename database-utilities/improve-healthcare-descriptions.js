import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CAUTIOUS healthcare quality assessments - err on lower side
function getHealthcareLevel(rating, hasSpecialties, population) {
  // Downgrade ratings to be conservative
  const adjustedRating = Math.max(1, rating - 1);
  
  if (adjustedRating <= 2) {
    return ['basic', 'limited', 'minimal', 'rudimentary'][Math.floor(Math.random() * 4)];
  } else if (adjustedRating <= 4) {
    return ['adequate', 'functional', 'standard', 'acceptable'][Math.floor(Math.random() * 4)];
  } else if (adjustedRating <= 6) {
    return ['decent', 'reasonable', 'satisfactory', 'moderate'][Math.floor(Math.random() * 4)];
  } else if (adjustedRating <= 8) {
    return ['good', 'solid', 'reliable', 'competent'][Math.floor(Math.random() * 4)];
  } else {
    // Even top-rated gets conservative description
    return ['well-developed', 'comprehensive', 'established', 'advanced'][Math.floor(Math.random() * 4)];
  }
}

// REALISTIC wait times - err on longer side
function getWaitTimes(population, rating) {
  if (population < 50000) {
    return ['expect delays', 'longer waits common', 'patience required', 'appointments take time'][Math.floor(Math.random() * 4)];
  } else if (population < 200000) {
    return ['variable wait times', 'delays possible', 'booking ahead advised', 'waits vary significantly'][Math.floor(Math.random() * 4)];
  } else if (population < 1000000) {
    return ['moderate waits typical', 'standard waiting periods', 'typical delays', 'average wait times'][Math.floor(Math.random() * 4)];
  } else {
    return ['varies by facility', 'depends on provider', 'mixed availability', 'inconsistent waits'][Math.floor(Math.random() * 4)];
  }
}

// CAUTIOUS specialty descriptions
function getSpecialtyAccess(specialties, population) {
  if (!specialties || specialties.length === 0) {
    return ['specialist care very limited', 'minimal specialist access', 'specialists largely absent', 'specialty care scarce'][Math.floor(Math.random() * 4)];
  } else if (specialties.length < 3) {
    return ['few specialists available', 'limited specialty options', 'basic specialties only', 'specialist access restricted'][Math.floor(Math.random() * 4)];
  } else if (specialties.length < 6) {
    return ['some specialists present', 'select specialties available', 'common specialties covered', 'standard specialists found'][Math.floor(Math.random() * 4)];
  } else {
    return ['various specialists available', 'multiple specialties present', 'range of specialists', 'broader specialty access'][Math.floor(Math.random() * 4)];
  }
}

// HONEST language/barrier assessments
function getLanguageBarrier(country) {
  const englishCountries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'Ireland'];
  const partialEnglish = ['Netherlands', 'Germany', 'Belgium', 'Malta', 'Cyprus'];
  
  if (englishCountries.includes(country)) {
    return ['no language barriers', 'English-speaking staff', 'communication straightforward', 'no translation needed'][Math.floor(Math.random() * 4)];
  } else if (partialEnglish.includes(country)) {
    return ['some English spoken', 'variable English skills', 'language mix expected', 'English partially available'][Math.floor(Math.random() * 4)];
  } else {
    return ['language barriers likely', 'local language essential', 'translator often needed', 'communication challenges expected'][Math.floor(Math.random() * 4)];
  }
}

// REALISTIC emergency care descriptions
function getEmergencyCare(rating, population) {
  if (rating <= 3 || population < 20000) {
    return ['emergency care basic at best', 'limited emergency facilities', 'emergency services minimal', 'basic emergency response only'][Math.floor(Math.random() * 4)];
  } else if (rating <= 5 || population < 100000) {
    return ['emergency care functional', 'standard emergency services', 'adequate emergency response', 'emergency facilities available'][Math.floor(Math.random() * 4)];
  } else if (rating <= 7) {
    return ['emergency services reliable', 'decent emergency care', 'emergency response adequate', 'emergency facilities equipped'][Math.floor(Math.random() * 4)];
  } else {
    return ['emergency care well-equipped', 'comprehensive emergency services', 'emergency response efficient', 'strong emergency facilities'][Math.floor(Math.random() * 4)];
  }
}

// CAUTIOUS insurance/cost warnings
function getInsuranceNeeds(country) {
  const publicHealthcare = ['United Kingdom', 'Canada', 'France', 'Germany', 'Netherlands', 'Belgium', 'Austria', 'Australia', 'New Zealand'];
  
  if (publicHealthcare.includes(country)) {
    return ['public system exists but private insurance recommended', 'public healthcare available though waits common', 'dual system - private coverage advisable', 'public option present but limited'][Math.floor(Math.random() * 4)];
  } else {
    return ['comprehensive insurance essential', 'private insurance mandatory', 'full coverage strongly advised', 'insurance absolutely necessary'][Math.floor(Math.random() * 4)];
  }
}

// Generate CAUTIOUS descriptions
const TEMPLATES = [
  // Pattern 1: Direct assessment
  (level, wait, spec, lang, emerg, insur) => `Healthcare infrastructure ${level}, ${wait}. ${spec}, ${lang}. ${emerg}. ${insur}.`,
  
  // Pattern 2: Reality check
  (level, wait, spec, lang, emerg, insur) => `Medical facilities ${level} with ${wait}. ${spec} and ${lang}. ${emerg}, ${insur}.`,
  
  // Pattern 3: Practical warnings
  (level, wait, spec, lang, emerg, insur) => `Expect ${level} healthcare where ${wait}. ${spec}, ${lang}. ${emerg}. Important: ${insur}.`,
  
  // Pattern 4: Conservative assessment
  (level, wait, spec, lang, emerg, insur) => `Healthcare system ${level} — ${wait}, ${spec}. ${lang}, ${emerg}. ${insur}.`,
  
  // Pattern 5: Cautious overview
  (level, wait, spec, lang, emerg, insur) => `Medical care ${level} overall. ${wait}, ${spec}. ${lang}. ${emerg}, ${insur}.`,
  
  // Pattern 6: Realistic picture
  (level, wait, spec, lang, emerg, insur) => `Healthcare remains ${level}, ${wait} standard. ${spec} while ${lang}. ${emerg}. Note: ${insur}.`
];

function generateCautiousHealthcareDescription(town) {
  // Get conservative assessments
  const level = getHealthcareLevel(
    town.healthcare_quality || 3,
    town.healthcare_specialties_available,
    town.population || 50000
  );
  
  const wait = getWaitTimes(town.population || 50000, town.healthcare_quality || 3);
  const spec = getSpecialtyAccess(town.healthcare_specialties_available, town.population || 50000);
  const lang = getLanguageBarrier(town.country);
  const emerg = getEmergencyCare(town.healthcare_quality || 3, town.population || 50000);
  const insur = getInsuranceNeeds(town.country);
  
  // Pick random template
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  
  // Generate description
  let description = template(level, wait, spec, lang, emerg, insur);
  
  // Add population-based warning for very small towns
  if (town.population && town.population < 20000) {
    description = description.replace(/\.$/, ' — major procedures require travel to larger cities.');
  }
  
  // Ensure no overselling
  description = description
    .replace(/excellent/gi, 'good')
    .replace(/outstanding/gi, 'decent')
    .replace(/world-class/gi, 'developed')
    .replace(/top-tier/gi, 'established')
    .replace(/cutting-edge/gi, 'modern')
    .replace(/state-of-the-art/gi, 'equipped');
  
  return description;
}

async function improveHealthcareDescriptions() {
  console.log('🏥 IMPROVING HEALTHCARE DESCRIPTIONS - CAUTIOUS APPROACH\n');
  console.log('Creating realistic, conservative healthcare assessments\n');
  console.log('⚠️  Erring on the side of caution for user safety\n');
  
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
    // Generate cautious description
    const newDescription = generateCautiousHealthcareDescription(town);
    
    // Collect samples
    if (samples.length < 15) {
      samples.push({
        name: town.name,
        country: town.country,
        description: newDescription,
        rating: town.healthcare_quality,
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
  
  // Show samples
  console.log('\n🏥 SAMPLE CAUTIOUS DESCRIPTIONS:');
  samples.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Quality: ${s.rating}/10, Pop: ${s.population?.toLocaleString() || 'unknown'}):`);
    console.log(`"${s.description}"`);
  });
  
  console.log('\n⚠️  All descriptions use conservative language to protect users');
}

// Run improvement
improveHealthcareDescriptions().catch(console.error);