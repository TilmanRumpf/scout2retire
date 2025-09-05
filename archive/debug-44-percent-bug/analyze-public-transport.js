import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function analyzePublicTransport() {
  console.log('🚌 Analyzing public transport quality data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, population, public_transport_quality, has_public_transit, train_station, has_uber, requires_car')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Count coverage
  const coverage = {
    public_transport_quality: towns.filter(t => t.public_transport_quality !== null).length,
    has_public_transit: towns.filter(t => t.has_public_transit !== null).length,
    train_station: towns.filter(t => t.train_station !== null).length,
    has_uber: towns.filter(t => t.has_uber !== null).length,
    requires_car: towns.filter(t => t.requires_car !== null).length
  };
  
  console.log('📊 Transport data coverage:\n');
  Object.entries(coverage).forEach(([col, count]) => {
    const pct = (count/341*100).toFixed(1);
    console.log(`${col.padEnd(30)} ${pct}% (${count}/341)`);
  });
  
  // Show patterns
  console.log('\n📋 Sample public transport quality scores:');
  towns.filter(t => t.public_transport_quality !== null)
    .slice(0, 10)
    .forEach(t => {
      console.log(`${t.name}, ${t.country}: ${t.public_transport_quality}/10`);
    });
    
  // Analyze by population
  console.log('\n📈 Transport quality by city size:');
  const bySize = {
    large: { total: 0, hasData: 0, avgScore: 0 },
    medium: { total: 0, hasData: 0, avgScore: 0 },
    small: { total: 0, hasData: 0, avgScore: 0 }
  };
  
  towns.forEach(t => {
    const size = t.population > 500000 ? 'large' : t.population > 100000 ? 'medium' : 'small';
    bySize[size].total++;
    if (t.public_transport_quality !== null) {
      bySize[size].hasData++;
      bySize[size].avgScore += t.public_transport_quality;
    }
  });
  
  Object.entries(bySize).forEach(([size, data]) => {
    if (data.hasData > 0) {
      const avg = (data.avgScore / data.hasData).toFixed(1);
      console.log(`${size}: avg score ${avg} (${data.hasData}/${data.total} have data)`);
    }
  });
  
  console.log('\n💡 LOGICAL PATTERNS:');
  console.log('- Large cities (>500k): Usually 7-9/10');
  console.log('- Medium cities (100-500k): Usually 5-7/10');
  console.log('- Small cities (50-100k): Usually 3-5/10');
  console.log('- Towns (<50k): Usually 1-3/10');
  console.log('- Tourist areas: +1-2 points');
  console.log('- Islands: -1-2 points');
  console.log('- Europe/Asia: Generally better');
  console.log('- Americas: More car-dependent');
}

analyzePublicTransport();