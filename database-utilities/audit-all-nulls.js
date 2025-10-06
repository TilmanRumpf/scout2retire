import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data: towns, error } = await supabase
  .from('towns')
  .select('*');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('Auditing', towns.length, 'towns\n');

const allColumns = Object.keys(towns[0]);
const nullReport = {};

allColumns.forEach(col => {
  const nullTowns = towns.filter(town => {
    const value = town[col];
    return value === null || 
           value === undefined || 
           value === '' ||
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && value !== null && Object.keys(value).length === 0);
  });
  
  if (nullTowns.length > 0) {
    nullReport[col] = {
      count: nullTowns.length,
      percentage: Math.round((nullTowns.length / towns.length) * 100)
    };
  }
});

console.log('COLUMNS WITH NULLs (sorted by count):\n');
Object.entries(nullReport)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 30)
  .forEach(([col, stats]) => {
    console.log(col, ':', stats.count + '/' + towns.length, '(' + stats.percentage + '%)');
  });

console.log('\nSUMMARY:');
console.log('Total columns:', allColumns.length);
console.log('Columns with NULLs:', Object.keys(nullReport).length);
console.log('Columns clean:', allColumns.length - Object.keys(nullReport).length);
