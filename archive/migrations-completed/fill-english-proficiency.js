import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fillEnglishProficiency() {
  console.log('🗣️ Filling English proficiency levels...\n');
  
  const { data: missing, error } = await supabase
    .from('towns')
    .select('id, name, country, primary_language')
    .is('english_proficiency_level', null)
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`🎯 Found ${missing.length} towns missing English proficiency level\n`);
  
  // English proficiency by country (based on EF EPI and other sources)
  const COUNTRY_PROFICIENCY = {
    // Very High Proficiency
    'Netherlands': 'very high',
    'Singapore': 'very high',
    'Austria': 'very high',
    'Denmark': 'very high',
    'Norway': 'very high',
    'Sweden': 'very high',
    'Finland': 'very high',
    'Luxembourg': 'very high',
    'South Africa': 'very high',
    'Germany': 'very high',
    'Belgium': 'very high',
    'Portugal': 'very high',
    'Croatia': 'very high',
    'Malta': 'very high',
    
    // Native English
    'United States': 'native',
    'United Kingdom': 'native',
    'Canada': 'native',
    'Australia': 'native',
    'New Zealand': 'native',
    'Ireland': 'native',
    'Bahamas': 'native',
    'Barbados': 'native',
    'Belize': 'native',
    'Jamaica': 'native',
    'Trinidad and Tobago': 'native',
    'Antigua and Barbuda': 'native',
    'Saint Kitts and Nevis': 'native',
    'Saint Lucia': 'native',
    'Saint Vincent and Grenadines': 'native',
    'Grenada': 'native',
    
    // High Proficiency
    'Malaysia': 'high',
    'Philippines': 'high',
    'Greece': 'high',
    'Poland': 'high',
    'Hungary': 'high',
    'Romania': 'high',
    'Czech Republic': 'high',
    'Estonia': 'high',
    'Kenya': 'high',
    'Nigeria': 'high',
    'India': 'high',
    'Israel': 'high',
    'Switzerland': 'high',
    'Slovenia': 'high',
    
    // Moderate Proficiency
    'France': 'moderate',
    'Spain': 'moderate',
    'Italy': 'moderate',
    'South Korea': 'moderate',
    'Hong Kong': 'moderate',
    'Latvia': 'moderate',
    'Vietnam': 'moderate',
    'Japan': 'moderate',
    'Indonesia': 'moderate',
    'Taiwan': 'moderate',
    'Chile': 'moderate',
    'Argentina': 'moderate',
    'Uruguay': 'moderate',
    'Costa Rica': 'moderate',
    'Brazil': 'moderate',
    'Peru': 'moderate',
    'Nepal': 'moderate',
    'Morocco': 'moderate',
    'Tunisia': 'moderate',
    'Egypt': 'moderate',
    'Turkey': 'moderate',
    'UAE': 'moderate',
    
    // Low Proficiency
    'Thailand': 'low',
    'Mexico': 'low',
    'Colombia': 'low',
    'Ecuador': 'low',
    'Panama': 'low',
    'Guatemala': 'low',
    'Honduras': 'low',
    'Nicaragua': 'low',
    'El Salvador': 'low',
    'Cambodia': 'low',
    'Laos': 'low',
    'Myanmar': 'low',
    'China': 'low',
    'Saudi Arabia': 'low',
    'Iraq': 'low',
    'Libya': 'low',
    
    // Very Low
    'Haiti': 'very low',
    'Afghanistan': 'very low',
    'Yemen': 'very low',
    'Somalia': 'very low'
  };
  
  const updates = [];
  
  missing.forEach(town => {
    // Default to the country level
    let proficiency = COUNTRY_PROFICIENCY[town.country] || 'low';
    
    // Override for specific cases
    if (town.primary_language === 'English') {
      proficiency = 'native';
    }
    
    console.log(`${town.name}, ${town.country}: ${proficiency}`);
    
    updates.push({
      id: town.id,
      english_proficiency_level: proficiency
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update all at once since it's a small batch
  for (const update of updates) {
    const { error } = await supabase
      .from('towns')
      .update({ english_proficiency_level: update.english_proficiency_level })
      .eq('id', update.id);
      
    if (error) {
      console.error(`❌ Error updating ${update.id}:`, error);
    }
  }
  
  console.log('\n🎉 English proficiency update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('english_proficiency_level')
    .is('english_proficiency_level', null);
    
  console.log(`\n📊 Remaining towns without English proficiency: ${verification?.length || 0}`);
}

fillEnglishProficiency();