import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillDisasterRisk() {
  console.log('🌪️ Filling natural disaster risk scores...\n');
  console.log('Scale: 1-10 (1=very low risk, 10=extreme risk)\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // High-risk areas by type
  const HIGH_RISK_ZONES = {
    // Hurricane/Typhoon zones (Caribbean, Gulf, Pacific)
    hurricane: {
      countries: ['Bahamas', 'Puerto Rico', 'U.S. Virgin Islands', 'Dominican Republic', 
                  'Jamaica', 'Barbados', 'Saint Lucia', 'Philippines', 'Taiwan'],
      cities: ['Miami', 'Fort Myers', 'Naples', 'Clearwater', 'Jacksonville', 'Myrtle Beach',
               'Virginia Beach', 'Galveston', 'New Orleans', 'Houston', 'Cancun', 'Playa del Carmen',
               'Cozumel', 'Puerto Vallarta', 'Mazatlan', 'Cebu City', 'Manila'],
      risk: 7
    },
    
    // Earthquake zones (Ring of Fire, Mediterranean)
    earthquake: {
      countries: ['Japan', 'Indonesia', 'Philippines', 'Chile', 'Peru', 'Ecuador',
                  'Mexico', 'Guatemala', 'El Salvador', 'Nicaragua', 'Turkey', 'Greece'],
      cities: ['Tokyo', 'Osaka', 'Los Angeles', 'San Francisco', 'San Diego', 'Seattle',
               'Portland', 'Mexico City', 'Guatemala City', 'Quito', 'Lima', 'Santiago',
               'Istanbul', 'Athens', 'Wellington', 'Christchurch'],
      risk: 6
    },
    
    // Flood-prone areas
    flood: {
      countries: ['Bangladesh', 'Netherlands', 'Vietnam'],
      cities: ['Venice', 'Bangkok', 'Ho Chi Minh City', 'New Orleans', 'Amsterdam',
               'Rotterdam', 'Miami Beach', 'Charleston', 'Norfolk'],
      risk: 5
    },
    
    // Wildfire zones
    wildfire: {
      countries: ['Australia'],
      cities: ['Los Angeles', 'San Diego', 'Santa Barbara', 'Sacramento', 'Phoenix',
               'Perth', 'Adelaide', 'Canberra', 'Nice', 'Marseille', 'Athens'],
      risk: 4
    },
    
    // Volcano zones
    volcano: {
      countries: ['Indonesia', 'Philippines', 'Ecuador'],
      cities: ['Naples', 'Catania', 'Quito', 'Guatemala City', 'Auckland', 'Reykjavik'],
      risk: 3
    }
  };
  
  // Low-risk safe zones
  const SAFE_ZONES = {
    veryLow: {
      countries: ['Uruguay', 'Malta', 'Estonia', 'Latvia', 'Lithuania', 'Czech Republic',
                  'Poland', 'Hungary', 'Austria', 'Switzerland', 'Belgium', 'Denmark',
                  'Sweden', 'Finland', 'Ireland', 'United Kingdom', 'Morocco', 'Tunisia'],
      risk: 1
    },
    low: {
      countries: ['Portugal', 'Spain', 'France', 'Germany', 'Netherlands', 'Canada',
                  'South Africa', 'Namibia', 'Botswana', 'Argentina', 'Paraguay'],
      risk: 2
    }
  };
  
  const missingData = towns.filter(t => t.natural_disaster_risk === null);
  console.log(`🎯 Found ${missingData.length} towns missing natural disaster risk\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    let risk = 3; // Default moderate risk
    let reason = 'default moderate';
    
    // Check very low risk countries first
    if (SAFE_ZONES.veryLow.countries.includes(town.country)) {
      risk = SAFE_ZONES.veryLow.risk;
      reason = 'very low risk country';
    }
    // Check low risk countries
    else if (SAFE_ZONES.low.countries.includes(town.country)) {
      risk = SAFE_ZONES.low.risk;
      reason = 'low risk country';
    }
    // Check high-risk zones
    else {
      // Hurricane risk
      if (HIGH_RISK_ZONES.hurricane.countries.includes(town.country) ||
          HIGH_RISK_ZONES.hurricane.cities.some(city => town.name.includes(city))) {
        risk = Math.max(risk, HIGH_RISK_ZONES.hurricane.risk);
        reason = 'hurricane zone';
        
        // Coastal areas in hurricane zones get +1
        if (town.geographic_features?.includes('Coastal')) {
          risk = Math.min(10, risk + 1);
        }
      }
      
      // Earthquake risk
      if (HIGH_RISK_ZONES.earthquake.countries.includes(town.country) ||
          HIGH_RISK_ZONES.earthquake.cities.some(city => town.name.includes(city))) {
        risk = Math.max(risk, HIGH_RISK_ZONES.earthquake.risk);
        reason = risk === HIGH_RISK_ZONES.earthquake.risk ? 'earthquake zone' : reason + ' + earthquake';
      }
      
      // Flood risk
      if (HIGH_RISK_ZONES.flood.countries.includes(town.country) ||
          HIGH_RISK_ZONES.flood.cities.some(city => town.name.includes(city))) {
        risk = Math.max(risk, HIGH_RISK_ZONES.flood.risk);
        reason = risk === HIGH_RISK_ZONES.flood.risk ? 'flood zone' : reason + ' + flood';
        
        // Low elevation coastal areas higher risk
        if (town.elevation_meters !== null && town.elevation_meters < 10 && 
            town.geographic_features?.includes('Coastal')) {
          risk = Math.min(10, risk + 1);
        }
      }
      
      // Wildfire risk
      if (HIGH_RISK_ZONES.wildfire.countries.includes(town.country) ||
          HIGH_RISK_ZONES.wildfire.cities.some(city => town.name.includes(city))) {
        if (town.geographic_features?.includes('Forest') || 
            town.geographic_features?.includes('Mountain')) {
          risk = Math.max(risk, HIGH_RISK_ZONES.wildfire.risk);
          reason = risk === HIGH_RISK_ZONES.wildfire.risk ? 'wildfire zone' : reason + ' + wildfire';
        }
      }
      
      // Volcano risk
      if (HIGH_RISK_ZONES.volcano.cities.some(city => town.name.includes(city))) {
        risk = Math.max(risk, HIGH_RISK_ZONES.volcano.risk);
        reason = risk === HIGH_RISK_ZONES.volcano.risk ? 'volcano zone' : reason + ' + volcano';
      }
    }
    
    // Regional adjustments
    if (town.country === 'United States') {
      // Midwest tornado alley
      if (['Kansas', 'Oklahoma', 'Texas', 'Nebraska', 'Missouri'].some(state => 
          ['Wichita', 'Tulsa', 'Oklahoma City', 'Omaha', 'Kansas City'].some(city => 
            town.name.includes(city)))) {
        risk = Math.max(risk, 5);
        reason = 'tornado alley';
      }
      // California specific
      if (['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'].some(city => 
          town.name.includes(city))) {
        risk = Math.max(risk, 6); // Earthquake + wildfire
        reason = 'earthquake + wildfire';
      }
    }
    
    console.log(`${town.name}, ${town.country}: ${risk}/10 (${reason})`);
    
    updates.push({
      id: town.id,
      natural_disaster_risk: risk
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ natural_disaster_risk: update.natural_disaster_risk })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Natural disaster risk update complete!');
  
  // Verify and show summary
  const { data: allTowns } = await supabase
    .from('towns')
    .select('natural_disaster_risk');
    
  const riskCounts = {};
  allTowns.forEach(t => {
    const risk = t.natural_disaster_risk || 0;
    riskCounts[risk] = (riskCounts[risk] || 0) + 1;
  });
  
  console.log('\n📊 Risk Distribution:');
  Object.entries(riskCounts)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([risk, count]) => {
      const pct = (count / 341 * 100).toFixed(1);
      console.log(`Risk ${risk}/10: ${count} towns (${pct}%)`);
    });
}

fillDisasterRisk();