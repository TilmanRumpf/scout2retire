#!/usr/bin/env node

// Comprehensive UI-Database Compatibility Audit for Hobbies
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// UI Hobby Categories - EXACT copy from OnboardingHobbies.jsx (lines 397-482)
const UI_HOBBY_CATEGORIES = {
  // Physical activities grouped by type matching the main buttons
  'Walking & Cycling Related': [
    'Geocaching', 'Hiking', 'Jogging', 'Mountain biking', 'Orienteering', 'Walking groups'
  ].sort(),
  
  'Golf & Tennis Related': [
    'Badminton', 'Bocce ball', 'Petanque', 'Pickleball', 'Ping pong', 'Shuffleboard', 'Tennis'
  ].sort(),
  
  'Water Sports Related': [
    'Snorkeling', 'Swimming laps', 'Water aerobics', 'Water polo'
  ].sort(),
  
  'Water Crafts Related': [
    'Boating', 'Canoeing', 'Deep sea fishing', 'Fishing', 'Kayaking', 'Sailing', 'Scuba diving', 
    'Stand-up paddleboarding', 'Surfing', 'Windsurfing', 'Yacht racing'
  ].sort(),
  
  'Winter Sports Related': [
    'Cross-country skiing', 'Curling', 'Downhill skiing', 'Ice fishing', 
    'Ice hockey', 'Ice skating', 'Sledding', 'Snowboarding', 'Snowmobiling', 'Snowshoeing'
  ].sort(),
  
  'Other Sports & Fitness': [
    'Archery', 'Basketball', 'Bowling', 'Fencing', 'Fitness classes', 
    'Martial arts', 'Pilates', 'Spa & wellness', 'Tai chi', 'Yoga', 'Zumba'
  ].sort(),
  
  'Adventure & Outdoor': [
    'Camping', 'Flying', 'Horseback riding', 'Hot air ballooning', 
    'Motorcycling', 'Paragliding', 'Racing', 'Rock climbing'
  ].sort(),
  
  // Hobbies & Interests categories matching main buttons
  'Gardening & Pets Related': [
    'Aquarium keeping', 'Beekeeping', 'Birdwatching', 'Dog training', 'Dog walking', 
    'Flower arranging', 'Greenhouse gardening', 'Herb gardening', 'Nature walks', 
    'Orchid growing', 'Vegetable gardening'
  ].sort(),
  
  'Arts & Crafts Related': [
    'Calligraphy', 'Crochet', 'Drawing', 'Embroidery', 'Glass blowing', 
    'Jewelry making', 'Knitting', 'Leather crafting', 'Needlepoint', 
    'Painting', 'Pottery', 'Quilting', 'Scrapbooking', 'Sculpting', 
    'Sewing', 'Sketching', 'Stained glass', 'Watercolor painting', 
    'Wildlife photography', 'Woodworking'
  ].sort(),
  
  'Music & Theater Related': [
    'Ballet', 'Ballroom dancing', 'Choir singing', 'Community theater', 
    'Film appreciation', 'Instruments', 'Jazz appreciation', 
    'Line dancing', 'Opera', 'Salsa dancing', 'Singing', 'Square dancing', 'Tango'
  ].sort(),
  
  'Cooking & Wine Related': [
    'Baking', 'Cheese making', 'Coffee culture', 'Cooking classes', 'Farmers markets', 
    'Food tours', 'Home brewing', 'Organic groceries', 'Vineyards', 'Wine tasting'
  ].sort(),
  
  'Museums & History Related': [
    'Antique collecting', 'Astronomy', 'Genealogy', 'Historical sites', 'Museums'
  ].sort(),
  
  'Social & Community': [
    'Art fairs', 'Bible study', 'Book clubs', 'Cultural festivals', 'Flea markets', 
    'Grandchildren activities', 'Outdoor concerts', 'Street festivals', 'Volunteering'
  ].sort(),
  
  'Games & Mental Activities': [
    'Board games', 'Bridge', 'Card games', 'Chess', 'Crossword puzzles', 
    'Darts', 'Jigsaw puzzles', 'Mahjong', 'Poker', 'Sudoku', 
    'Trivia nights', 'Video gaming'
  ].sort(),
  
  'Collecting & Hobbies': [
    'Collecting coins', 'Collecting stamps', 'Metal detecting', 
    'Model building', 'Radio amateur', 'Stargazing'
  ].sort(),
  
  'Learning & Culture': [
    'Blogging', 'Creative writing', 'Digital photography', 'Journaling', 
    'Language learning', 'Meditation', 'Poetry', 'RV traveling', 
    'Travel planning', 'Writing memoirs'
  ].sort()
};

// Compound selections from the quick selection cards
const COMPOUND_MAPPINGS = {
  // Physical Activities cards
  'walking_cycling': ['walking', 'cycling'],
  'golf_tennis': ['golf', 'tennis'],
  'water_sports': ['swimming', 'pools', 'beaches'],
  'water_crafts': ['kayaking', 'sailing', 'boating'],
  'winter_sports': ['ski', 'snowboard', 'skate'],
  
  // Hobbies & Interests cards
  'gardening': ['vegetables', 'flowers', 'pets'],
  'arts': ['painting', 'pottery', 'crafts'],
  'music_theater': ['concerts', 'plays', 'opera'],
  'cooking_wine': ['cuisines', 'tasting', 'baking'],
  'history': ['exhibits', 'tours', 'lectures']
};

async function runAudit() {
  console.log('🔍 UI-DATABASE HOBBY COMPATIBILITY AUDIT');
  console.log('=' .repeat(80));
  console.log(`Audit Date: ${new Date().toISOString()}`);
  console.log('');
  
  try {
    // 1. Get all hobbies from database
    const { data: dbHobbies, error } = await supabase
      .from('hobbies')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Failed to fetch hobbies from database:', error);
      return;
    }
    
    console.log(`📊 DATABASE STATS:`);
    console.log(`  Total hobbies in DB: ${dbHobbies.length}`);
    console.log(`  Universal: ${dbHobbies.filter(h => h.is_universal).length}`);
    console.log(`  Location-dependent: ${dbHobbies.filter(h => !h.is_universal).length}`);
    console.log('');
    
    // 2. Extract all unique hobbies from UI
    const uiHobbies = new Set();
    Object.values(UI_HOBBY_CATEGORIES).forEach(hobbies => {
      hobbies.forEach(hobby => uiHobbies.add(hobby));
    });
    
    console.log(`📱 UI STATS:`);
    console.log(`  Total categories: ${Object.keys(UI_HOBBY_CATEGORIES).length}`);
    console.log(`  Total unique hobbies in UI: ${uiHobbies.size}`);
    console.log('');
    
    // 3. Create lookup maps
    const dbHobbyNames = new Set(dbHobbies.map(h => h.name));
    const dbHobbyNamesLower = new Set(dbHobbies.map(h => h.name.toLowerCase()));
    
    // 4. Find mismatches
    const uiNotInDb = [];
    const dbNotInUi = [];
    const caseMismatches = [];
    const exactMatches = [];
    
    // Check UI → DB
    uiHobbies.forEach(uiHobby => {
      if (dbHobbyNames.has(uiHobby)) {
        exactMatches.push(uiHobby);
      } else if (dbHobbyNamesLower.has(uiHobby.toLowerCase())) {
        // Case mismatch
        const dbMatch = dbHobbies.find(h => h.name.toLowerCase() === uiHobby.toLowerCase());
        caseMismatches.push({
          ui: uiHobby,
          db: dbMatch.name
        });
      } else {
        uiNotInDb.push(uiHobby);
      }
    });
    
    // Check DB → UI
    dbHobbies.forEach(dbHobby => {
      const uiHobbiesArray = Array.from(uiHobbies);
      const found = uiHobbiesArray.some(ui => 
        ui.toLowerCase() === dbHobby.name.toLowerCase()
      );
      if (!found) {
        dbNotInUi.push(dbHobby.name);
      }
    });
    
    // 5. Print detailed report
    console.log('✅ EXACT MATCHES:');
    console.log(`  ${exactMatches.length} hobbies match exactly between UI and DB`);
    console.log('');
    
    if (caseMismatches.length > 0) {
      console.log('⚠️  CASE MISMATCHES (need fixing):');
      caseMismatches.forEach(m => {
        console.log(`  UI: "${m.ui}" ≠ DB: "${m.db}"`);
      });
      console.log('');
    }
    
    if (uiNotInDb.length > 0) {
      console.log('❌ UI HOBBIES NOT IN DATABASE:');
      uiNotInDb.forEach(hobby => {
        // Find which category it belongs to
        let category = 'Unknown';
        for (const [cat, hobbies] of Object.entries(UI_HOBBY_CATEGORIES)) {
          if (hobbies.includes(hobby)) {
            category = cat;
            break;
          }
        }
        console.log(`  "${hobby}" (${category})`);
      });
      console.log('');
    }
    
    if (dbNotInUi.length > 0) {
      console.log('❓ DATABASE HOBBIES NOT IN UI:');
      dbNotInUi.forEach(hobby => {
        const dbRecord = dbHobbies.find(h => h.name === hobby);
        console.log(`  "${hobby}" (${dbRecord.category}, ${dbRecord.verification_method})`);
      });
      console.log('');
    }
    
    // 6. Check compound mappings
    console.log('🔗 COMPOUND MAPPING VERIFICATION:');
    for (const [compound, targets] of Object.entries(COMPOUND_MAPPINGS)) {
      console.log(`  ${compound} → [${targets.join(', ')}]`);
      // Note: These map to general terms, not specific hobby names
      // This is part of the legacy system that needs updating
    }
    console.log('');
    
    // 7. Generate summary
    console.log('=' .repeat(80));
    console.log('📋 AUDIT SUMMARY:');
    console.log(`  ✅ Exact matches: ${exactMatches.length}`);
    console.log(`  ⚠️  Case mismatches: ${caseMismatches.length}`);
    console.log(`  ❌ UI not in DB: ${uiNotInDb.length}`);
    console.log(`  ❓ DB not in UI: ${dbNotInUi.length}`);
    console.log(`  📊 Total UI items: ${uiHobbies.size}`);
    console.log(`  📊 Total DB items: ${dbHobbies.length}`);
    console.log('');
    
    // 8. Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (caseMismatches.length > 0) {
      console.log('  1. Fix case mismatches in either UI or database for consistency');
    }
    if (uiNotInDb.length > 0) {
      console.log('  2. Add missing hobbies to database or remove from UI');
    }
    if (dbNotInUi.length > 0) {
      console.log('  3. Consider adding database hobbies to UI or mark as deprecated');
    }
    console.log('  4. Update compound mappings to use exact hobby names');
    console.log('  5. Implement UUID-based mapping instead of string matching');
    console.log('');
    
    // 9. Save audit report
    const report = {
      timestamp: new Date().toISOString(),
      stats: {
        ui_total: uiHobbies.size,
        db_total: dbHobbies.length,
        exact_matches: exactMatches.length,
        case_mismatches: caseMismatches.length,
        ui_not_in_db: uiNotInDb.length,
        db_not_in_ui: dbNotInUi.length
      },
      mismatches: {
        case: caseMismatches,
        ui_missing: uiNotInDb,
        db_missing: dbNotInUi
      },
      recommendations: [
        'Fix case mismatches',
        'Add missing hobbies to database',
        'Update compound mappings',
        'Implement UUID mapping'
      ]
    };
    
    fs.writeFileSync(
      'database-utilities/audit-report-hobbies.json',
      JSON.stringify(report, null, 2)
    );
    console.log('📄 Detailed report saved to: database-utilities/audit-report-hobbies.json');
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
  }
}

// Run the audit
runAudit();