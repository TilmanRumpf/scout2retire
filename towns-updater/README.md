# Towns Updater - Database Update Scripts

This folder contains scripts to update town data in the Scout2Retire database.

## 📸 PHOTO IMPORT SYSTEM (PRIMARY METHOD FOR PHOTOS)

**CRITICAL: Photos should ONLY be updated through the bucket import system!**

### Quick Photo Import
```bash
# Import all photos from Supabase bucket
node import-photos-from-bucket.js
```

### How Photo Import Works
1. **Reads photos** from `town-images` bucket in Supabase
2. **Parses filename** to extract country code and city name
3. **Matches** with towns in database
4. **Updates ONLY** towns without existing photos
5. **Safe to run multiple times** (idempotent)

### Photo Naming Convention
Photos in bucket must follow: `[ISO-2-country]-[city-name]-[descriptor].[ext]`
```
Examples:
vn-vung-tau-harbor.jpg      → Vung Tau, Vietnam
es-barcelona-sunset.jpg     → Barcelona, Spain  
mx-san-miguel-de-allende.jpg → San Miguel de Allende, Mexico
at-vienna-downtown.jpg      → Vienna, Austria
```

### Photo Statistics
- **Total Towns**: 343
- **Towns with Photos**: 71 (20.7% coverage)
- **Last Import**: Added 48 new photos

### Photo Update Rules
- ✅ **DO**: Upload to bucket → Run import script
- ❌ **DON'T**: Manually edit image_url fields
- ❌ **DON'T**: Update photos via SQL
- ✅ **DO**: Preserve existing photos

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   cd towns-updater
   npm install
   cp ../.env .env  # Copy environment variables
   ```

2. **Test Connection**
   ```bash
   npm test
   # or
   node test-connection.js
   ```

3. **Run Updates**
   ```bash
   node update-towns.js           # Basic updates
   node update-porto-paris.js     # Update Porto & Paris specifically
   node run-smart-updates.js      # Smart batch updates with AI consultants
   ```

## 📁 Key Files

### Core Scripts
- **test-connection.js** - Verify Supabase connection
- **update-towns.js** - Basic town update example
- **run-smart-updates.js** - Batch updates with AI consultant system
- **claude-api-helper.js** - Claude API integration for enriching data

### Specific Town Updates
- **update-porto-paris.js** - Comprehensive Porto & Paris data
- **update-porto-paris-safe.js** - Safe version with data validation
- **update-porto-paris-final.js** - Final production-ready version
- **update-visible-towns-europe.js** - Update all visible European towns

### System Components
- **smart-matching-system.js** - Calculate match scores for users
- **ai-consultants-complete.js** - AI consultant prompts for different aspects
- **column-guide.js** - Database column documentation

## ⛔ CRITICAL: Photo Update Policy

**PHOTOS ARE UPDATED ONLY VIA BUCKET IMPORT** - See [PHOTO_POLICY.md](./PHOTO_POLICY.md)

- Photo fields (`image_url_1`, `image_url_2`, `image_url_3`) updated via `import-photos-from-bucket.js`
- All other scripts exclude photo fields from updates
- To add photos: Upload to `town-images` bucket → Run import script
- Manual dashboard updates discouraged - use bucket system instead

## 🏗️ Architecture

### Database Connection
Scripts connect directly to the online Supabase instance using:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous key for authentication

### Update Strategy
1. **Preserve Critical Data**: Never overwrite photos or user-generated content
2. **Batch Updates**: Use batch operations to minimize API calls
3. **AI Enhancement**: Use Claude API for generating descriptions and data
4. **Citizenship-Specific**: Provide different info based on user citizenship

### AI Consultants System
The system uses specialized AI consultants for different aspects:
- **Healthcare Consultant** - Medical system info per citizenship
- **Immigration Consultant** - Visa requirements per citizenship  
- **Tax Consultant** - Tax implications per citizenship
- **Lifestyle Consultant** - Cultural and lifestyle insights
- **Pet Consultant** - Pet import requirements per citizenship

## 🔧 Common Operations

### Update Specific Town
```javascript
const { error } = await supabase
  .from('towns')
  .update({ 
    cost_index: 1500,
    healthcare_score: 8,
    // Note: Never include image_url fields
  })
  .eq('name', 'Porto')
  .eq('country', 'Portugal')
```

### Batch Update with Filters
```javascript
const { data: towns } = await supabase
  .from('towns')
  .select('*')
  .eq('country', 'Portugal')
  .is('description', null)  // Find towns missing descriptions

// Update each town with AI-generated content
for (const town of towns) {
  // Generate data, update town
}
```

### Smart Matching
```javascript
import { calculateMatchScore } from './smart-matching-system.js'

const matchResult = await calculateMatchScore(userPreferences, townData)
console.log('Match score:', matchResult.match_score)
console.log('Factors:', matchResult.match_factors)
```

## 📊 Current Status

- **Total Towns**: 343
- **Towns with Photos**: 71 (20.7%) - Updated via bucket import
- **Visible Towns**: Only those with photos
- **Priority**: Upload more photos to bucket and run import script

## 🚨 Important Notes

1. **Production Safety**: Always test updates on a few towns first
2. **Rate Limits**: Respect API rate limits when using Claude API
3. **Data Quality**: Verify AI-generated content before bulk updates
4. **Backups**: Consider backing up data before major updates

## 🔒 Security

- Never commit `.env` files
- API keys should be kept secure
- Use read-only queries when possible
- Validate all data before updates

## 💡 Future Improvements

1. **Photo Collection**: Upload remaining 272 town photos to bucket
2. **Activity Data**: Add activities_available for all towns
3. **Data Completeness**: Fill missing fields for better matching
4. **Localization**: Add descriptions in multiple languages
5. **Real-time Updates**: Sync with external data sources
6. **Automated Testing**: Add test suite for update scripts