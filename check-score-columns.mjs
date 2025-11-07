import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('Checking score-related columns in towns table...\n');

// First, get all columns to see what exists
const { data, error } = await supabase
  .from('towns')
  .select('*')
  .limit(1);

// Then filter to show only score-related columns
if (data && data[0]) {
  const allColumns = Object.keys(data[0]);
  const scoreColumns = allColumns.filter(col =>
    col.includes('score') || col.includes('match') || col.toLowerCase().includes('quality')
  );
  console.log('Score-related columns found:', scoreColumns);
  console.log('\nSample data:');
  const sampleData = {};
  scoreColumns.forEach(col => {
    sampleData[col] = data[0][col];
  });
  console.log(JSON.stringify(sampleData, null, 2));
}

if (error) {
  console.error('Error:', error);
} else {
  console.log('Sample towns with score fields:');
  console.log(JSON.stringify(data, null, 2));
}

// Check how many towns have scores
const { count: withScores, error: err1 } = await supabase
  .from('towns')
  .select('id', { count: 'exact', head: true })
  .not('overall_score', 'is', null);

const { count: withoutScores, error: err2 } = await supabase
  .from('towns')
  .select('id', { count: 'exact', head: true })
  .is('overall_score', 'is', null);

console.log(`\nTowns WITH overall_score: ${withScores || 0}`);
console.log(`Towns WITHOUT overall_score: ${withoutScores || 0}`);
