import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { chromium } from 'playwright';

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function finalTest() {
  console.log('🔍 FINAL TEST: Verifying town names are displayed correctly\n');

  // Step 1: Check database directly
  console.log('Step 1: Checking database...');
  const { data: dbTowns, error } = await supabase
    .from('towns')
    .select('id, town_name, country')
    .not('image_url_1', 'is', null)
    .limit(5);

  if (error) {
    console.error('Database error:', error);
    return;
  }

  console.log('Towns in database:');
  dbTowns.forEach(t => console.log(`  - ${t.town_name}, ${t.country}`));

  // Step 2: Check browser display
  console.log('\nStep 2: Checking browser display...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Clear any cached data
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Navigate to towns page
    await page.goto('http://localhost:5173/towns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get displayed town names
    const displayedTowns = await page.evaluate(() => {
      const townCards = document.querySelectorAll('h3');
      return Array.from(townCards).map(el => el.textContent?.trim()).filter(Boolean);
    });

    console.log('Towns displayed on page:');
    if (displayedTowns.length > 0) {
      displayedTowns.forEach(name => console.log(`  - ${name}`));
      console.log(`\n✅ SUCCESS: Found ${displayedTowns.length} town names displayed!`);
    } else {
      console.log('  ❌ NO TOWNS DISPLAYED!');

      // Check for errors
      const errors = await page.evaluate(() => {
        const errorEls = document.querySelectorAll('[class*="error"]');
        return Array.from(errorEls).map(el => el.textContent);
      });

      if (errors.length > 0) {
        console.log('\nErrors found:', errors);
      }
    }

    // Take screenshot for verification
    await page.screenshot({ path: 'final-test-towns.png' });
    console.log('\nScreenshot saved as final-test-towns.png');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }

  process.exit(0);
}

finalTest();