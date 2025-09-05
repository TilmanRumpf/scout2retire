#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
)

async function checkUsers() {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('user_id, created_at, countries, regions, geographic_features, vegetation_types')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Recent users:')
    data.forEach((user, i) => {
      console.log(`${i+1}. User ID: ${user.user_id}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Countries: ${JSON.stringify(user.countries)}`)
      console.log(`   Regions: ${JSON.stringify(user.regions)}`)
      console.log(`   Geographic: ${JSON.stringify(user.geographic_features)}`)
      console.log(`   Vegetation: ${JSON.stringify(user.vegetation_types)}`)
      console.log('')
    })
  }
}

checkUsers()