import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data: towns } = await supabase.from('towns').select('country');

const countries = [...new Set(towns.map(t => t.country))].sort();
console.log('Countries needing residency research:', countries.length);
console.log(JSON.stringify(countries, null, 2));
