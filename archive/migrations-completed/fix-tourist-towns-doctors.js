import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fixTouristTowns() {
  // These are all major tourist/expat destinations that should have English doctors
  const touristTowns = [
    'Luang Prabang',  // Major tourist city in Laos
    'Chiang Rai',     // Tourist hub in Thailand
    'Hua Hin',        // Expat retirement hub in Thailand
    'Udon Thani',     // Expat area in Thailand
    'Ho Chi Minh City', // Major city in Vietnam
    'Nha Trang',      // Beach resort in Vietnam
    'Hoi An',         // UNESCO tourist town in Vietnam
    'Vung Tau',       // Beach town near Saigon
    'Kampot',         // Expat hub in Cambodia
    'Subic Bay (Olongapo)' // Former US base, many expats
  ];
  
  for (const townName of touristTowns) {
    const { error } = await supabase
      .from('towns')
      .update({ english_speaking_doctors: true })
      .eq('name', townName);
      
    if (!error) {
      console.log(`✅ ${townName}: YES (tourist/expat destination)`);
    }
  }
  
  // Verify
  const { data: check } = await supabase
    .from('towns')
    .select('english_speaking_doctors')
    .is('english_speaking_doctors', null);
    
  console.log(`\n📊 Final check: ${check?.length || 0} towns still missing english_speaking_doctors`);
}

fixTouristTowns();