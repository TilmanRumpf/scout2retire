import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('📊 FIELD #1: COUNTRY - ANALYSIS\n');
console.log('='.repeat(60));

// 1. Current template
const { data: template } = await supabase.from('field_search_templates').select('*').eq('field_name', 'country').single();
console.log('\n1️⃣ CURRENT TEMPLATE:');
console.log('   Query:', template?.search_template || 'NONE');
console.log('   Description:', template?.human_description || 'NONE');
console.log('   Status:', template?.status || 'NONE');

// 2. Data spectrum
const { data: towns } = await supabase.from('towns').select('country').not('country', 'is', null);
const countries = [...new Set(towns.map(t => t.country))].sort();
console.log('\n2️⃣ DATA SPECTRUM:');
console.log('   Total towns:', towns.length);
console.log('   Unique countries:', countries.length);
console.log('   Values:', countries.join(', '));

// 3. Sample data
const { data: samples } = await supabase.from('towns').select('town_name, country').limit(5);
console.log('\n3️⃣ SAMPLE DATA:');
samples.forEach(s => console.log(`   ${s.town_name} → ${s.country}`));

console.log('\n' + '='.repeat(60));
