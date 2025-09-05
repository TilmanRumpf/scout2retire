#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYnNlIiwicmVmIjoiYXhscnV2dnNqZXBzdWxjYnFsaG8iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ4NzA2MzQ1LCJleHAiOjIwNjQyODIzNDV9.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixRatingScale() {
  console.log('🔍 Checking for towns with ratings on wrong scale (under 10)...')
  
  // First check how many need fixing
  const { data: lowValueTowns, error: checkError } = await supabase
    .from('towns')
    .select('id, name, country, government_efficiency_rating, political_stability_rating')
    .or('government_efficiency_rating.lt.10,political_stability_rating.lt.10')
  
  if (checkError) {
    console.error('Error checking towns:', checkError)
    return
  }
  
  console.log(`Found ${lowValueTowns.length} towns with ratings under 10 (wrong scale)`)
  
  if (lowValueTowns.length === 0) {
    console.log('✅ All towns already use correct 0-100 scale!')
    return
  }
  
  // Show sample before fixing
  console.log('\nSample of towns needing scale fix:')
  lowValueTowns.slice(0, 5).forEach(town => {
    console.log(`  ${town.name}, ${town.country}: gov=${town.government_efficiency_rating}, stability=${town.political_stability_rating}`)
  })
  
  // Fix government efficiency ratings
  const govTowns = lowValueTowns.filter(t => t.government_efficiency_rating && t.government_efficiency_rating < 10)
  console.log(`\n🔧 Fixing ${govTowns.length} government efficiency ratings...`)
  
  for (const town of govTowns) {
    const newValue = town.government_efficiency_rating * 10
    const { error } = await supabase
      .from('towns')
      .update({ government_efficiency_rating: newValue })
      .eq('id', town.id)
    
    if (error) {
      console.error(`Failed to update ${town.name}:`, error)
    }
  }
  
  // Fix political stability ratings
  const polTowns = lowValueTowns.filter(t => t.political_stability_rating && t.political_stability_rating < 10)
  console.log(`🔧 Fixing ${polTowns.length} political stability ratings...`)
  
  for (const town of polTowns) {
    const newValue = town.political_stability_rating * 10
    const { error } = await supabase
      .from('towns')
      .update({ political_stability_rating: newValue })
      .eq('id', town.id)
    
    if (error) {
      console.error(`Failed to update ${town.name}:`, error)
    }
  }
  
  // Verify the fix
  const { data: stillLow, error: verifyError } = await supabase
    .from('towns')
    .select('id')
    .or('government_efficiency_rating.lt.10,political_stability_rating.lt.10')
  
  if (!verifyError && stillLow.length === 0) {
    console.log('\n✅ All ratings successfully converted to 0-100 scale!')
  } else {
    console.log(`\n⚠️ ${stillLow?.length || 0} towns still have values under 10`)
  }
  
  // Show sample of fixed data
  const { data: sample } = await supabase
    .from('towns')
    .select('name, country, government_efficiency_rating, political_stability_rating')
    .in('country', ['Spain', 'United States', 'Singapore'])
    .limit(10)
  
  console.log('\n📊 Sample of corrected data (0-100 scale):')
  console.table(sample.map(t => ({
    Town: t.name,
    Country: t.country,
    'Gov Rating': t.government_efficiency_rating,
    'Stability': t.political_stability_rating
  })))
  
  console.log('\n✅ Admin scores should now calculate correctly!')
  console.log('💡 Clear browser cache/sessionStorage to see updated scores')
}

fixRatingScale().catch(console.error)