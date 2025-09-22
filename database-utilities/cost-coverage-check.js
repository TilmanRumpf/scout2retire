#!/usr/bin/env node

// Simple cost coverage check using direct SQL
const query = `
SELECT 
  COUNT(*) as total,
  COUNT(cost_of_living_usd) as col_count,
  COUNT(typical_monthly_living_cost) as monthly_count,  
  COUNT(rent_1bed) as rent_count,
  COUNT(cost_data) as cost_data_count
FROM towns;
`;

console.log('Run this query in Supabase SQL Editor:');
console.log(query);

console.log('\nOr use this simpler approach:');
console.log(`
SELECT 'Total towns' as field, COUNT(*) as count FROM towns
UNION ALL
SELECT 'Has cost_of_living_usd', COUNT(*) FROM towns WHERE cost_of_living_usd IS NOT NULL
UNION ALL  
SELECT 'Has typical_monthly_living_cost', COUNT(*) FROM towns WHERE typical_monthly_living_cost IS NOT NULL
UNION ALL
SELECT 'Has rent_1bed', COUNT(*) FROM towns WHERE rent_1bed IS NOT NULL
UNION ALL
SELECT 'Has cost_data', COUNT(*) FROM towns WHERE cost_data IS NOT NULL;
`);