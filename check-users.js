#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
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