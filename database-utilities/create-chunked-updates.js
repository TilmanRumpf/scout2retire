// Split the massive UPDATEs into smaller chunks to avoid silent failures

const towns = [
  'Chester', 'Digby', 'Lockeport', 'Lunenburg', 'Mahone Bay', "Peggy's Cove",
  'Truro', 'Yarmouth', 'Calgary', 'Charlottetown', 'Halifax', 'Kelowna',
  'Kingston', 'London (ON)', 'Moncton', 'Niagara-on-the-Lake', 'Ottawa', 'Victoria'
];

const chunk1 = `
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7`;

const chunk2 = `
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75`;

console.log('-- CHUNKED UPDATES FOR ALL TOWNS');
console.log('-- Run each chunk separately\n');

towns.forEach(town => {
  console.log(`-- ${town} - Chunk 1`);
  console.log(`UPDATE towns SET ${chunk1} WHERE name = '${town}';\n`);
  
  console.log(`-- ${town} - Chunk 2`);
  console.log(`UPDATE towns SET ${chunk2} WHERE name = '${town}';\n`);
});

