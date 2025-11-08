/**
 * Deep Dive UI/UX Audit Script
 * Extended wait times and console error capture
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const CREDENTIALS = {
  email: 'tilman.rumpf@gmail.com',
  password: 'Schoko2005'
};

const DETAILED_RESULTS = {
  pages: [],
  consoleErrors: [],
  networkErrors: [],
  screenshots: []
};

async function testPageWithDetailedCapture(page, url, name) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`   URL: ${url}`);

  const consoleMessages = [];
  const networkErrors = [];

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    if (type === 'error') {
      console.log(`   ❌ Console Error: ${text}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    consoleMessages.push({ type: 'pageerror', text: error.message });
    console.log(`   ❌ Page Error: ${error.message}`);
  });

  // Capture network failures
  page.on('requestfailed', request => {
    const failure = `${request.url()} - ${request.failure().errorText}`;
    networkErrors.push(failure);
    console.log(`   ⚠️  Network Failure: ${failure}`);
  });

  const startTime = Date.now();

  try {
    // Navigate to page
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    const loadTime = Date.now() - startTime;
    console.log(`   ⏱️  Initial load: ${loadTime}ms`);

    // Wait additional time for React to render
    await page.waitForTimeout(5000);

    // Check if page has actual content
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasContent = bodyText.trim().length > 100;
    const hasHeader = await page.locator('header').count() > 0;
    const hasNav = await page.locator('nav').count() > 0;

    // Check for loading states
    const isLoading = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('loading') || text.includes('analyzing') || text.includes('finding');
    });

    // Check for error messages
    const hasErrorMessage = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('access denied') ||
             text.includes('error') ||
             text.includes('not found') ||
             text.includes('unauthorized');
    });

    // Take screenshot
    const screenshotPath = path.join(__dirname, 'audit-deep-dive', `${name.toLowerCase().replace(/\s/g, '-')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    DETAILED_RESULTS.screenshots.push({ name, path: screenshotPath });

    const finalLoadTime = Date.now() - startTime;
    console.log(`   ⏱️  Total time: ${finalLoadTime}ms`);

    const result = {
      name,
      url,
      loadTime: finalLoadTime,
      hasContent,
      contentLength: bodyText.trim().length,
      hasHeader,
      hasNav,
      isLoading,
      hasErrorMessage,
      httpStatus: response?.status(),
      consoleErrors: consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror'),
      networkErrors,
      screenshot: screenshotPath
    };

    // Analyze results
    if (!hasContent) {
      console.log(`   ❌ CRITICAL: Page appears empty (${bodyText.trim().length} chars)`);
    } else if (hasErrorMessage) {
      console.log(`   ❌ CRITICAL: Error message detected`);
      console.log(`   📄 Content preview: ${bodyText.substring(0, 200)}`);
    } else if (isLoading) {
      console.log(`   ⚠️  WARNING: Page stuck in loading state`);
    } else {
      console.log(`   ✅ Page loaded successfully`);
    }

    DETAILED_RESULTS.pages.push(result);

    return result;

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);

    const result = {
      name,
      url,
      error: error.message,
      consoleErrors: consoleMessages,
      networkErrors
    };

    DETAILED_RESULTS.pages.push(result);
    return result;
  }
}

async function login(page) {
  console.log('\n🔐 Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/daily|discover|onboarding/, { timeout: 15000 });
  console.log('✅ Login successful');
}

async function main() {
  console.log('🚀 Starting Deep Dive UI/UX Audit');
  console.log('='.repeat(60));

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'audit-deep-dive');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test admin pages specifically with detailed capture
    await login(page);

    const adminPages = [
      { url: '/admin/towns-manager', name: 'Towns Manager' },
      { url: '/admin/algorithm', name: 'Algorithm Manager' },
      { url: '/admin/region-manager', name: 'Region Manager' },
      { url: '/admin/data-verification', name: 'Data Verification' },
      { url: '/admin/paywall', name: 'Paywall Manager' }
    ];

    console.log('\n📋 TESTING ADMIN PAGES');
    console.log('='.repeat(60));

    for (const pageInfo of adminPages) {
      await testPageWithDetailedCapture(page, `${BASE_URL}${pageInfo.url}`, pageInfo.name);
    }

    // Test a couple working pages for comparison
    console.log('\n📋 TESTING WORKING PAGES (for comparison)');
    console.log('='.repeat(60));

    await testPageWithDetailedCapture(page, `${BASE_URL}/daily`, 'Daily');
    await testPageWithDetailedCapture(page, `${BASE_URL}/profile`, 'Profile');

    // Generate detailed report
    console.log('\n📊 GENERATING DETAILED REPORT');
    console.log('='.repeat(60));

    const report = `# DEEP DIVE UI/UX AUDIT REPORT

**Date:** ${new Date().toLocaleString()}
**Environment:** ${BASE_URL}
**Test Account:** ${CREDENTIALS.email}

---

## 🔍 DETAILED PAGE ANALYSIS

${DETAILED_RESULTS.pages.map(page => `
### ${page.name}

- **URL:** ${page.url}
- **Load Time:** ${page.loadTime}ms
- **HTTP Status:** ${page.httpStatus || 'N/A'}
- **Has Content:** ${page.hasContent ? '✅ Yes' : '❌ No'} (${page.contentLength} characters)
- **Has Header:** ${page.hasHeader ? '✅ Yes' : '❌ No'}
- **Has Navigation:** ${page.hasNav ? '✅ Yes' : '❌ No'}
- **Loading State:** ${page.isLoading ? '⚠️ Yes (stuck)' : '✅ No'}
- **Error Message:** ${page.hasErrorMessage ? '❌ Yes' : '✅ No'}

${page.consoleErrors && page.consoleErrors.length > 0 ? `
**Console Errors:**
${page.consoleErrors.map(e => `- ${e.text}`).join('\n')}
` : ''}

${page.networkErrors && page.networkErrors.length > 0 ? `
**Network Errors:**
${page.networkErrors.map(e => `- ${e}`).join('\n')}
` : ''}

${page.error ? `**Fatal Error:** ${page.error}` : ''}

**Screenshot:** \`${path.basename(page.screenshot || '')}\`

---
`).join('\n')}

## 🎯 CRITICAL FINDINGS

### ❌ Pages With No Content
${DETAILED_RESULTS.pages.filter(p => !p.hasContent).map(p => `- **${p.name}**: ${p.contentLength} characters`).join('\n') || 'None'}

### ⚠️ Pages Stuck in Loading State
${DETAILED_RESULTS.pages.filter(p => p.isLoading).map(p => `- **${p.name}**`).join('\n') || 'None'}

### 🚨 Pages With Error Messages
${DETAILED_RESULTS.pages.filter(p => p.hasErrorMessage).map(p => `- **${p.name}**`).join('\n') || 'None'}

### 📊 Performance Summary
${DETAILED_RESULTS.pages.map(p => `- **${p.name}**: ${p.loadTime}ms`).join('\n')}

---

## 📸 SCREENSHOTS
All screenshots saved to: \`./audit-deep-dive/\`

${DETAILED_RESULTS.screenshots.map(s => `- ${s.name}.png`).join('\n')}
`;

    fs.writeFileSync(
      path.join(__dirname, 'AUDIT_DEEP_DIVE_REPORT.md'),
      report
    );

    console.log('\n✅ Report generated: AUDIT_DEEP_DIVE_REPORT.md');
    console.log('\n' + report);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ Deep Dive Audit Complete');
  console.log('='.repeat(60));
}

main();
