import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// ADMIN CLIENT - Uses service role key for full access
const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

console.log('📸 Starting photo import from town-images bucket...\n')

// Country code to country name mapping
const countryCodeMap = {
  'at': 'Austria',
  'es': 'Spain',
  'fr': 'France',
  'it': 'Italy',
  'pt': 'Portugal',
  'de': 'Germany',
  'nl': 'Netherlands',
  'be': 'Belgium',
  'ch': 'Switzerland',
  'gb': 'United Kingdom',
  'ie': 'Ireland',
  'no': 'Norway',
  'se': 'Sweden',
  'dk': 'Denmark',
  'fi': 'Finland',
  'pl': 'Poland',
  'cz': 'Czech Republic',
  'hr': 'Croatia',
  'gr': 'Greece',
  'tr': 'Turkey',
  'mx': 'Mexico',
  'us': 'United States',
  'ca': 'Canada',
  'ar': 'Argentina',
  'cl': 'Chile',
  'br': 'Brazil',
  'co': 'Colombia',
  'pe': 'Peru',
  'ec': 'Ecuador',
  'uy': 'Uruguay',
  'cr': 'Costa Rica',
  'pa': 'Panama',
  'gt': 'Guatemala',
  'bz': 'Belize',
  'ni': 'Nicaragua',
  'vn': 'Vietnam',
  'th': 'Thailand',
  'my': 'Malaysia',
  'id': 'Indonesia',
  'ph': 'Philippines',
  'sg': 'Singapore',
  'jp': 'Japan',
  'kr': 'South Korea',
  'tw': 'Taiwan',
  'in': 'India',
  'lk': 'Sri Lanka',
  'np': 'Nepal',
  'mm': 'Myanmar',
  'kh': 'Cambodia',
  'la': 'Laos',
  'au': 'Australia',
  'nz': 'New Zealand',
  'za': 'South Africa',
  'ke': 'Kenya',
  'tz': 'Tanzania',
  'ug': 'Uganda',
  'et': 'Ethiopia',
  'ma': 'Morocco',
  'tn': 'Tunisia',
  'eg': 'Egypt',
  'na': 'Namibia',
  'bw': 'Botswana',
  'zw': 'Zimbabwe',
  'zm': 'Zambia',
  'mz': 'Mozambique',
  'mg': 'Madagascar',
  'mu': 'Mauritius',
  'sc': 'Seychelles',
  'cv': 'Cape Verde',
  'sn': 'Senegal',
  'gh': 'Ghana',
  'ng': 'Nigeria',
  'cm': 'Cameroon',
  'ci': 'Ivory Coast',
  'rw': 'Rwanda',
  'cw': 'Curacao',
  'aw': 'Aruba',
  'bb': 'Barbados',
  'jm': 'Jamaica',
  'tt': 'Trinidad and Tobago',
  'do': 'Dominican Republic',
  'pr': 'Puerto Rico',
  'bs': 'Bahamas',
  'ky': 'Cayman Islands',
  'bm': 'Bermuda',
  'vg': 'British Virgin Islands',
  'tc': 'Turks and Caicos',
  'ag': 'Antigua and Barbuda',
  'lc': 'Saint Lucia',
  'vc': 'Saint Vincent',
  'gd': 'Grenada',
  'kn': 'Saint Kitts and Nevis',
  'dm': 'Dominica',
  'ee': 'Estonia',
  'lv': 'Latvia',
  'lt': 'Lithuania',
  'hu': 'Hungary',
  'mt': 'Malta',
  'si': 'Slovenia',
  'sk': 'Slovakia',
  'ro': 'Romania',
  'bg': 'Bulgaria',
  'al': 'Albania',
  'mk': 'North Macedonia',
  'me': 'Montenegro',
  'rs': 'Serbia',
  'ba': 'Bosnia and Herzegovina',
  'is': 'Iceland',
  'cy': 'Cyprus',
  'lu': 'Luxembourg',
  'ad': 'Andorra',
  'mc': 'Monaco',
  'sm': 'San Marino',
  'va': 'Vatican City',
  'li': 'Liechtenstein'
}

// Parse photo filename to extract country and city
function parsePhotoName(filename) {
  // Expected format: xx-city-name-...
  // Example: vn-vung-tau-harbor.jpg -> { countryCode: 'vn', cityName: 'vung-tau' }
  
  const parts = filename.split('-')
  if (parts.length < 2) return null
  
  const countryCode = parts[0].toLowerCase()
  
  // Find where the city name ends
  // Common patterns to stop at:
  // - s2r (Scout2Retire marker)
  // - depositphotos
  // - pexels
  // - image
  // - licensed
  // - numbers
  const stopPatterns = ['s2r', 'S2R', 'depositphotos', 'pexels', 'image', 'licensed', 
                       'harbor', 'beach', 'view', 'street', 'square', 'market', 
                       'sunset', 'sunrise', 'aerial', 'skyline', 'downtown', 
                       'oldtown', 'architecture', 'landscape', 'waterfront', 'cityscape']
  
  let cityParts = []
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].toLowerCase()
    
    // Stop if we hit any stop pattern
    if (stopPatterns.some(pattern => part.includes(pattern)) || 
        part.match(/^\d+$/) || 
        part.match(/^\d{4}x\d{3,4}/) || // image dimensions like 1920x1080
        part.match(/^image\d+x\d+/) ||
        part.includes('px')) {
      break
    }
    cityParts.push(parts[i])
  }
  
  if (cityParts.length === 0) return null
  
  const cityName = cityParts.join('-')
  const countryName = countryCodeMap[countryCode]
  
  if (!countryName) {
    console.log(`⚠️  Unknown country code: ${countryCode} for ${filename}`)
    return null
  }
  
  return {
    countryCode,
    countryName,
    cityName,
    originalFilename: filename
  }
}

// Convert hyphenated city name to proper case for matching
function formatCityName(hyphenatedName) {
  // vung-tau -> Vung Tau
  // san-miguel-de-allende -> San Miguel de Allende
  
  const smallWords = ['de', 'del', 'la', 'las', 'el', 'los', 'do', 'da', 'das', 'dos']
  
  return hyphenatedName
    .split('-')
    .map((word, index) => {
      // Keep small words lowercase unless they're the first word
      if (index > 0 && smallWords.includes(word.toLowerCase())) {
        return word.toLowerCase()
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

async function importPhotosFromBucket() {
  try {
    // 1. List all files in the town-images bucket
    console.log('📂 Fetching files from town-images bucket...')
    const { data: files, error: listError } = await adminSupabase
      .storage
      .from('town-images')
      .list('', {
        limit: 1000,
        offset: 0
      })
    
    if (listError) {
      console.error('❌ Error listing bucket files:', listError)
      return
    }
    
    console.log(`✅ Found ${files.length} files in bucket\n`)
    
    // 2. Get all towns that don't have photos
    console.log('🔍 Fetching towns without photos...')
    const { data: townsWithoutPhotos, error: townError } = await adminSupabase
      .from('towns')
      .select('id, town_name, country')
      .is('image_url_1', null)
    
    if (townError) {
      console.error('❌ Error fetching towns:', townError)
      return
    }
    
    console.log(`✅ Found ${townsWithoutPhotos.length} towns without photos\n`)
    
    // Create a map for quick lookup
    const townMap = new Map()
    townsWithoutPhotos.forEach(town => {
      const key = `${town.country.toLowerCase()}_${town.town_name.toLowerCase()}`
      townMap.set(key, town)
    })
    
    // 3. Process each photo file
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    console.log('🔄 Processing photo files...\n')
    
    for (const file of files) {
      // Skip non-image files
      if (!file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
        continue
      }
      
      // Parse the filename
      const parsed = parsePhotoName(file.name)
      if (!parsed) {
        console.log(`⏭️  Skipping ${file.name} - couldn't parse name`)
        skipCount++
        continue
      }
      
      // Format city name for matching
      const formattedCityName = formatCityName(parsed.cityName)
      
      // Try to find matching town
      const lookupKey = `${parsed.countryName.toLowerCase()}_${formattedCityName.toLowerCase()}`
      let town = townMap.get(lookupKey)
      
      if (!town) {
        // Try alternative matching strategies
        for (const [key, t] of townMap.entries()) {
          const [country, city] = key.split('_')
          
          // Strategy 1: Exact city match with same country
          if (city === formattedCityName.toLowerCase() && 
              country === parsed.countryName.toLowerCase()) {
            town = t
            console.log(`✅ Matched by exact city: ${file.name} -> ${t.town_name}, ${t.country}`)
            break
          }
          
          // Strategy 2: City contains our parsed name
          if (city.includes(parsed.cityName.toLowerCase()) && 
              country === parsed.countryName.toLowerCase()) {
            town = t
            console.log(`✅ Matched by contains: ${file.name} -> ${t.town_name}, ${t.country}`)
            break
          }
          
          // Strategy 3: Our parsed name contains the city
          if (parsed.cityName.toLowerCase().includes(city) && 
              country === parsed.countryName.toLowerCase()) {
            town = t
            console.log(`✅ Matched by reverse contains: ${file.name} -> ${t.town_name}, ${t.country}`)
            break
          }
        }
        
        if (!town) {
          console.log(`⏭️  No match for ${file.name} (looking for: ${formattedCityName}, ${parsed.countryName})`)
          skipCount++
          continue
        }
      }
      
      // Get the public URL for the image
      const { data: urlData } = adminSupabase
        .storage
        .from('town-images')
        .getPublicUrl(file.name)
      
      if (!urlData.publicUrl) {
        console.log(`❌ Couldn't get URL for ${file.name}`)
        errorCount++
        continue
      }
      
      // Update the town with the photo URL
      const { error: updateError } = await adminSupabase
        .from('towns')
        .update({
          image_url_1: urlData.publicUrl,
          image_source: 'scout2retire-bucket',
          image_validation_note: `Imported from bucket: ${file.name}`,
          image_validated_at: new Date().toISOString(),
          last_ai_update: new Date().toISOString()
        })
        .eq('id', town.id)
      
      if (updateError) {
        console.error(`❌ Error updating ${town.town_name}:`, updateError.message)
        errorCount++
      } else {
        console.log(`✅ Updated ${town.town_name}, ${town.country} with photo`)
        successCount++
      }
    }
    
    // 4. Summary report
    console.log('\n📊 Import Summary:')
    console.log(`✅ Successfully imported: ${successCount} photos`)
    console.log(`⏭️  Skipped (no match/already has photo): ${skipCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    
    // 5. Final verification
    const { count: totalWithPhotos } = await adminSupabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('image_url_1', 'is', null)
    
    console.log(`\n📸 Total towns with photos: ${totalWithPhotos}`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the import
console.log('🚀 Starting photo import process...')
console.log('ℹ️  This script will:')
console.log('   - Read photos from town-images bucket')
console.log('   - Match photos to towns by country code and city name')
console.log('   - Update only towns WITHOUT existing photos')
console.log('   - Can be run multiple times safely\n')

importPhotosFromBucket()