/**
 * Fix and standardize visa requirements data
 * Make consistent per country for US citizens
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Standardized visa requirements for US citizens by country
const VISA_REQUIREMENTS = {
  // Americas - No visa needed for US citizens
  'United States': 'No visa needed (domestic)',
  'Canada': '180-day visa-free for US citizens',
  'Mexico': '180-day visa-free, temporary resident visa available',
  'Puerto Rico': 'No visa needed (US territory)',
  'U.S. Virgin Islands': 'No visa needed (US territory)',
  'Belize': '30-day visa-free, Qualified Retired Persons program available',
  'Costa Rica': '90-day visa-free, pensionado visa with $1000/month income',
  'Panama': '180-day visa-free, Pensionado visa with $1000/month income',
  'Guatemala': '90-day visa-free',
  'Honduras': '90-day visa-free',
  'El Salvador': '90-day visa-free',
  'Nicaragua': '90-day visa-free, retiree residency available',
  'Colombia': '90-day visa-free, retirement visa with $750/month income',
  'Ecuador': '90-day visa-free, pensioner visa with $800/month income',
  'Peru': '183-day visa-free',
  'Chile': '90-day visa-free',
  'Argentina': '90-day visa-free',
  'Uruguay': '90-day visa-free, retirement residency with $1500/month income',
  'Brazil': '90-day visa-free',
  'Paraguay': '90-day visa-free',
  'Bolivia': '90-day visa-free',
  'Venezuela': '90-day visa-free',
  'Dominican Republic': '30-day visa-free, retirement visa available',
  'Barbados': '180-day visa-free',
  'Jamaica': '180-day visa-free',
  'Trinidad and Tobago': '90-day visa-free',
  'Bahamas': '240-day visa-free',
  'Saint Lucia': '6-week visa-free',
  'Saint Kitts and Nevis': '90-day visa-free',
  'Saint Vincent and Grenadines': '30-day visa-free',
  'Antigua and Barbuda': '180-day visa-free',
  'Grenada': '90-day visa-free',
  'Aruba': '30-day visa-free',
  'Curacao': '6-month visa-free',
  'Saint Martin': '90-day visa-free',
  'Sint Maarten': '90-day visa-free',
  'Martinique': '90-day visa-free (French territory)',
  'Turks and Caicos': '90-day visa-free',
  'British Virgin Islands': '30-day visa-free',

  // Europe - Schengen Zone 90/180 day rule
  'Portugal': '90-day visa-free (Schengen), D7 visa with €760/month income',
  'Spain': '90-day visa-free (Schengen), Non-Lucrative visa with €2400/month',
  'France': '90-day visa-free (Schengen), Long-stay visa available',
  'Italy': '90-day visa-free (Schengen), Elective Residency visa available',
  'Germany': '90-day visa-free (Schengen)',
  'Netherlands': '90-day visa-free (Schengen)',
  'Belgium': '90-day visa-free (Schengen)',
  'Austria': '90-day visa-free (Schengen)',
  'Switzerland': '90-day visa-free (Schengen)',
  'Greece': '90-day visa-free (Schengen), Golden Visa program available',
  'Malta': '90-day visa-free (Schengen), Global Residence Programme',
  'Cyprus': '90-day visa-free',
  'Northern Cyprus': '90-day visa-free',
  'Croatia': '90-day visa-free',
  'Slovenia': '90-day visa-free (Schengen)',
  'Czech Republic': '90-day visa-free (Schengen)',
  'Hungary': '90-day visa-free (Schengen)',
  'Poland': '90-day visa-free (Schengen)',
  'Slovakia': '90-day visa-free (Schengen)',
  'Romania': '90-day visa-free',
  'Bulgaria': '90-day visa-free',
  'Serbia': '90-day visa-free',
  'Montenegro': '90-day visa-free',
  'Albania': '365-day visa-free for US citizens',
  'North Macedonia': '90-day visa-free',
  'Bosnia and Herzegovina': '90-day visa-free',
  'Estonia': '90-day visa-free (Schengen)',
  'Latvia': '90-day visa-free (Schengen)',
  'Lithuania': '90-day visa-free (Schengen)',
  'United Kingdom': '180-day visa-free',
  'Ireland': '90-day visa-free',
  'Iceland': '90-day visa-free (Schengen)',
  'Denmark': '90-day visa-free (Schengen)',
  'Norway': '90-day visa-free (Schengen)',
  'Sweden': '90-day visa-free (Schengen)',
  'Finland': '90-day visa-free (Schengen)',

  // Asia
  'Thailand': '30-day visa-free, retirement visa with 800k baht in bank',
  'Vietnam': 'Visa required, 3-month e-visa available',
  'Cambodia': 'Visa on arrival, retirement visa available',
  'Laos': 'Visa on arrival',
  'Philippines': '30-day visa-free, SRRV retirement visa available',
  'Malaysia': '90-day visa-free, MM2H visa program',
  'Singapore': '90-day visa-free',
  'Indonesia': '30-day visa-free, retirement KITAS available',
  'Japan': '90-day visa-free',
  'South Korea': '90-day visa-free',
  'Taiwan': '90-day visa-free',
  'Hong Kong': '90-day visa-free',
  'China': 'Visa required',
  'India': 'e-Visa required',
  'Sri Lanka': 'ETA visa required',
  'Nepal': 'Visa on arrival',
  'Bangladesh': 'Visa required',
  'Pakistan': 'Visa required',
  'Myanmar': 'e-Visa required',
  'Maldives': '30-day visa-free',

  // Middle East
  'United Arab Emirates': '30-day visa-free, retirement visa available',
  'Israel': '90-day visa-free',
  'Jordan': 'Visa on arrival',
  'Lebanon': 'Visa on arrival',
  'Turkey': 'e-Visa required',
  'Qatar': '30-day visa-free',
  'Bahrain': 'Visa on arrival',
  'Kuwait': 'Visa required',
  'Oman': 'e-Visa required',
  'Saudi Arabia': 'e-Visa required',
  'Egypt': 'Visa on arrival',

  // Africa
  'Morocco': '90-day visa-free',
  'Tunisia': '90-day visa-free',
  'South Africa': '90-day visa-free',
  'Kenya': 'eTA required',
  'Tanzania': 'Visa on arrival',
  'Uganda': 'Visa on arrival',
  'Rwanda': 'Visa on arrival',
  'Ghana': 'Visa required',
  'Senegal': '90-day visa-free',
  'Cape Verde': 'Visa on arrival',
  'Mauritius': '90-day visa-free',
  'Seychelles': '90-day visa-free',
  'Namibia': '90-day visa-free',
  'Botswana': '90-day visa-free',
  'Madagascar': 'Visa on arrival',
  'Guinea-Bissau': 'Visa on arrival',

  // Oceania
  'Australia': '90-day visa-free with ETA',
  'New Zealand': '90-day visa-free',
  'Fiji': '120-day visa-free',
  'Vanuatu': '30-day visa-free',
  'Samoa': '60-day visa-free',
  'Tonga': '31-day visa-free',
  'Solomon Islands': 'Visa on arrival',
  'Palau': '30-day visa-free',
  'Marshall Islands': '90-day visa-free',
  'Micronesia': '30-day visa-free',
  'American Samoa': 'No visa needed (US territory)',
  'Cook Islands': '31-day visa-free',
  'French Polynesia': '90-day visa-free',
  'New Caledonia': '90-day visa-free'
};

async function fixVisaRequirements() {
  console.log('🛂 Fixing and standardizing visa requirements...\n');

  try {
    // Get all towns
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, town_name, country, visa_requirements');

    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }

    console.log(`Processing ${towns.length} towns...\n`);

    let updatedCount = 0;
    let failedCount = 0;
    const countriesFixed = new Set();

    for (const town of towns) {
      const standardRequirement = VISA_REQUIREMENTS[town.country];

      if (!standardRequirement) {
        console.log(`⚠️ No visa data for ${town.country} - skipping ${town.town_name}`);
        continue;
      }

      // Only update if different or missing
      if (town.visa_requirements !== standardRequirement) {
        const { error: updateError } = await supabase
          .from('towns')
          .update({ visa_requirements: standardRequirement })
          .eq('id', town.id);

        if (updateError) {
          console.error(`❌ Failed to update ${town.town_name}:`, updateError.message);
          failedCount++;
        } else {
          updatedCount++;
          countriesFixed.add(town.country);
        }
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`✅ Updated: ${updatedCount} towns`);
    console.log(`❌ Failed: ${failedCount} towns`);
    console.log(`🌍 Countries standardized: ${countriesFixed.size}`);

    if (countriesFixed.size > 0) {
      console.log('\nCountries fixed:');
      [...countriesFixed].sort().slice(0, 20).forEach(c => console.log(`  - ${c}`));
      if (countriesFixed.size > 20) {
        console.log(`  ... and ${countriesFixed.size - 20} more`);
      }
    }

    // Verify final state
    const { data: finalCheck } = await supabase
      .from('towns')
      .select('visa_requirements')
      .is('visa_requirements', null);

    console.log(`\n📊 Final state:`);
    console.log(`Towns with NULL visa requirements: ${finalCheck ? finalCheck.length : 0}`);

    if (!finalCheck || finalCheck.length === 0) {
      console.log('🎉 ALL TOWNS NOW HAVE VISA REQUIREMENTS!');
    }

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

fixVisaRequirements();