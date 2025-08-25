import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeEnglishDoctors() {
  console.log('🏥 Analyzing english_speaking_doctors data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, english_speaking_doctors, english_proficiency_level, expat_community_size, primary_language')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Count coverage
  const withEnglishDocs = towns.filter(t => t.english_speaking_doctors !== null);
  const withEnglishProf = towns.filter(t => t.english_proficiency_level !== null);
  const withExpats = towns.filter(t => t.expat_community_size !== null);
  
  console.log('📊 Related data coverage:\n');
  console.log(`english_speaking_doctors: ${withEnglishDocs.length}/341 (${(withEnglishDocs.length/341*100).toFixed(1)}%)`);
  console.log(`english_proficiency_level: ${withEnglishProf.length}/341 (${(withEnglishProf.length/341*100).toFixed(1)}%)`);
  console.log(`expat_community_size: ${withExpats.length}/341 (${(withExpats.length/341*100).toFixed(1)}%)`);
  
  // Show pattern of existing data
  console.log('\n📋 Sample of towns WITH english_speaking_doctors data:');
  withEnglishDocs.slice(0, 10).forEach(t => {
    console.log(`${t.name}, ${t.country}: ${t.english_speaking_doctors ? 'YES' : 'NO'}`);
  });
  
  // Group by country
  const byCountry = {};
  towns.forEach(t => {
    if (!byCountry[t.country]) {
      byCountry[t.country] = { 
        total: 0, 
        withData: 0,
        hasEnglishDocs: 0,
        englishNative: false,
        primaryLang: t.primary_language
      };
    }
    byCountry[t.country].total++;
    if (t.english_speaking_doctors !== null) {
      byCountry[t.country].withData++;
      if (t.english_speaking_doctors) byCountry[t.country].hasEnglishDocs++;
    }
  });
  
  // Native English-speaking countries
  const englishNative = ['United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand', 'Ireland'];
  englishNative.forEach(c => {
    if (byCountry[c]) byCountry[c].englishNative = true;
  });
  
  console.log('\n🌍 English doctor availability patterns:\n');
  Object.entries(byCountry)
    .filter(([_, data]) => data.withData > 0)
    .sort((a, b) => b[1].hasEnglishDocs/b[1].withData - a[1].hasEnglishDocs/a[1].withData)
    .slice(0, 15)
    .forEach(([country, data]) => {
      const pct = data.withData > 0 ? (data.hasEnglishDocs/data.withData*100).toFixed(0) : 0;
      console.log(`${country}: ${pct}% of towns have English doctors (${data.hasEnglishDocs}/${data.withData})`);
    });
    
  console.log('\n💡 LOGICAL APPROACH:');
  console.log('1. Native English countries → 100% YES');
  console.log('2. High tourism + expats → Usually YES');
  console.log('3. Former British colonies → Often YES');
  console.log('4. Major cities → More likely YES');
  console.log('5. Remote/rural → Usually NO');
  console.log('6. Non-tourist areas → Usually NO');
}

analyzeEnglishDoctors();