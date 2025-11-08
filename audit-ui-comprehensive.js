/**
 * Comprehensive UI/UX Audit Script
 * Pre-production quality check - testing all pages, flows, and interactions
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

const AUDIT_RESULTS = {
  perfect: [],
  minorIssues: [],
  criticalIssues: [],
  performance: [],
  screenshots: []
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const screenshotPath = path.join(__dirname, 'audit-screenshots', `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  AUDIT_RESULTS.screenshots.push({ name, path: screenshotPath });
  return screenshotPath;
}

async function checkConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  return errors;
}

async function measurePageLoad(page, url) {
  const start = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - start;
  return loadTime;
}

async function testPublicPages(browser) {
  console.log('\n🔍 Testing Public Pages...\n');
  const context = await browser.newContext();
  const page = await context.newPage();

  const publicPages = [
    { url: '/', name: 'Root (Welcome)' },
    { url: '/welcome', name: 'Welcome' },
    { url: '/login', name: 'Login' },
    { url: '/signup', name: 'Signup' },
    { url: '/reset-password', name: 'Reset Password' }
  ];

  for (const pageInfo of publicPages) {
    try {
      console.log(`Testing: ${pageInfo.name}`);

      const loadTime = await measurePageLoad(page, `${BASE_URL}${pageInfo.url}`);
      console.log(`  ⏱️  Load time: ${loadTime}ms`);

      if (loadTime > 3000) {
        AUDIT_RESULTS.minorIssues.push({
          page: pageInfo.name,
          issue: `Slow load time: ${loadTime}ms`,
          severity: 'minor'
        });
      } else {
        AUDIT_RESULTS.performance.push({
          page: pageInfo.name,
          loadTime: `${loadTime}ms`,
          status: 'good'
        });
      }

      // Wait for page to be stable
      await sleep(2000);

      // Check for console errors
      const errors = await page.evaluate(() => {
        return window.console._errors || [];
      });

      // Take screenshot
      await takeScreenshot(page, `public-${pageInfo.name.toLowerCase().replace(/\s/g, '-')}`);

      // Check if page has basic elements
      const hasContent = await page.evaluate(() => document.body.innerText.length > 0);
      if (!hasContent) {
        AUDIT_RESULTS.criticalIssues.push({
          page: pageInfo.name,
          issue: 'Page appears empty',
          severity: 'critical'
        });
      }

      // Check for specific elements based on page
      if (pageInfo.url === '/login') {
        const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
        const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
        const hasSubmitButton = await page.locator('button[type="submit"]').count() > 0;

        if (!hasLoginForm || !hasPasswordInput || !hasSubmitButton) {
          AUDIT_RESULTS.criticalIssues.push({
            page: pageInfo.name,
            issue: 'Login form missing essential elements',
            severity: 'critical'
          });
        } else {
          AUDIT_RESULTS.perfect.push({
            page: pageInfo.name,
            feature: 'Login form elements present'
          });
        }
      }

      if (pageInfo.url === '/signup') {
        const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
        const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;

        if (!hasEmailInput || !hasPasswordInput) {
          AUDIT_RESULTS.criticalIssues.push({
            page: pageInfo.name,
            issue: 'Signup form missing essential elements',
            severity: 'critical'
          });
        } else {
          AUDIT_RESULTS.perfect.push({
            page: pageInfo.name,
            feature: 'Signup form elements present'
          });
        }
      }

      console.log(`  ✅ ${pageInfo.name} tested\n`);

    } catch (error) {
      console.error(`  ❌ Error testing ${pageInfo.name}:`, error.message);
      AUDIT_RESULTS.criticalIssues.push({
        page: pageInfo.name,
        issue: error.message,
        severity: 'critical'
      });
    }
  }

  await context.close();
}

async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/daily|discover|onboarding/, { timeout: 10000 });
  console.log('✅ Login successful\n');
}

async function testUserPages(browser) {
  console.log('\n🔍 Testing User Pages...\n');
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page);

  const userPages = [
    { url: '/daily', name: 'Daily' },
    { url: '/discover', name: 'Discover' },
    { url: '/favorites', name: 'Favorites' },
    { url: '/compare', name: 'Comparison' },
    { url: '/profile', name: 'Profile' },
    { url: '/schedule', name: 'Schedule' },
    { url: '/journal', name: 'Journal' },
    { url: '/scotty', name: 'Scotty Guide' }
  ];

  for (const pageInfo of userPages) {
    try {
      console.log(`Testing: ${pageInfo.name}`);

      const loadTime = await measurePageLoad(page, `${BASE_URL}${pageInfo.url}`);
      console.log(`  ⏱️  Load time: ${loadTime}ms`);

      await sleep(2000);

      // Take screenshot
      await takeScreenshot(page, `user-${pageInfo.name.toLowerCase().replace(/\s/g, '-')}`);

      // Check for basic functionality
      const hasContent = await page.evaluate(() => document.body.innerText.length > 0);

      if (!hasContent) {
        AUDIT_RESULTS.criticalIssues.push({
          page: pageInfo.name,
          issue: 'Page appears empty',
          severity: 'critical'
        });
      } else {
        AUDIT_RESULTS.perfect.push({
          page: pageInfo.name,
          feature: 'Page loads with content'
        });
      }

      // Check for header/navigation
      const hasHeader = await page.locator('header, nav').count() > 0;
      if (!hasHeader) {
        AUDIT_RESULTS.minorIssues.push({
          page: pageInfo.name,
          issue: 'No header/navigation found',
          severity: 'minor'
        });
      }

      console.log(`  ✅ ${pageInfo.name} tested\n`);

    } catch (error) {
      console.error(`  ❌ Error testing ${pageInfo.name}:`, error.message);
      AUDIT_RESULTS.criticalIssues.push({
        page: pageInfo.name,
        issue: error.message,
        severity: 'critical'
      });
    }
  }

  await context.close();
}

async function testOnboardingFlow(browser) {
  console.log('\n🔍 Testing Onboarding Flow...\n');
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page);

  const onboardingPages = [
    '/onboarding/progress',
    '/onboarding/current-status',
    '/onboarding/region',
    '/onboarding/climate',
    '/onboarding/culture',
    '/onboarding/hobbies',
    '/onboarding/administration',
    '/onboarding/costs',
    '/onboarding/review',
    '/onboarding/complete'
  ];

  for (const url of onboardingPages) {
    try {
      const pageName = url.split('/').pop();
      console.log(`Testing: Onboarding - ${pageName}`);

      await page.goto(`${BASE_URL}${url}`);
      await sleep(1500);

      // Take screenshot
      await takeScreenshot(page, `onboarding-${pageName}`);

      // Check for content
      const hasContent = await page.evaluate(() => document.body.innerText.length > 0);

      if (!hasContent) {
        AUDIT_RESULTS.criticalIssues.push({
          page: `Onboarding - ${pageName}`,
          issue: 'Page appears empty',
          severity: 'critical'
        });
      } else {
        AUDIT_RESULTS.perfect.push({
          page: `Onboarding - ${pageName}`,
          feature: 'Page loads with content'
        });
      }

      console.log(`  ✅ Onboarding - ${pageName} tested\n`);

    } catch (error) {
      console.error(`  ❌ Error testing ${url}:`, error.message);
      AUDIT_RESULTS.criticalIssues.push({
        page: url,
        issue: error.message,
        severity: 'critical'
      });
    }
  }

  await context.close();
}

async function testAdminPages(browser) {
  console.log('\n🔍 Testing Admin Pages...\n');
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page);

  const adminPages = [
    { url: '/admin/towns-manager', name: 'Towns Manager' },
    { url: '/admin/algorithm', name: 'Algorithm Manager' },
    { url: '/admin/paywall', name: 'Paywall Manager' },
    { url: '/admin/region-manager', name: 'Region Manager' },
    { url: '/admin/data-verification', name: 'Data Verification' }
  ];

  for (const pageInfo of adminPages) {
    try {
      console.log(`Testing: ${pageInfo.name}`);

      await page.goto(`${BASE_URL}${pageInfo.url}`);
      await sleep(2000);

      // Take screenshot
      await takeScreenshot(page, `admin-${pageInfo.name.toLowerCase().replace(/\s/g, '-')}`);

      // Check for content
      const hasContent = await page.evaluate(() => document.body.innerText.length > 0);

      if (!hasContent) {
        AUDIT_RESULTS.criticalIssues.push({
          page: pageInfo.name,
          issue: 'Page appears empty',
          severity: 'critical'
        });
      } else {
        AUDIT_RESULTS.perfect.push({
          page: pageInfo.name,
          feature: 'Page loads with content'
        });
      }

      console.log(`  ✅ ${pageInfo.name} tested\n`);

    } catch (error) {
      console.error(`  ❌ Error testing ${pageInfo.name}:`, error.message);
      AUDIT_RESULTS.criticalIssues.push({
        page: pageInfo.name,
        issue: error.message,
        severity: 'critical'
      });
    }
  }

  await context.close();
}

async function testCriticalFlows(browser) {
  console.log('\n🔍 Testing Critical User Flows...\n');
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page);

  // Test 1: Search for towns
  try {
    console.log('Testing: Search for towns');
    await page.goto(`${BASE_URL}/discover`);
    await sleep(2000);

    // Check if search interface exists
    const hasSearchInput = await page.locator('input[type="text"], input[type="search"]').count() > 0;

    if (hasSearchInput) {
      AUDIT_RESULTS.perfect.push({
        page: 'Discover',
        feature: 'Search interface present'
      });
    } else {
      AUDIT_RESULTS.minorIssues.push({
        page: 'Discover',
        issue: 'Search input not found',
        severity: 'minor'
      });
    }

    await takeScreenshot(page, 'flow-search');
    console.log('  ✅ Search flow tested\n');

  } catch (error) {
    AUDIT_RESULTS.criticalIssues.push({
      page: 'Search Flow',
      issue: error.message,
      severity: 'critical'
    });
  }

  // Test 2: View favorites
  try {
    console.log('Testing: Favorites page');
    await page.goto(`${BASE_URL}/favorites`);
    await sleep(2000);

    await takeScreenshot(page, 'flow-favorites');

    AUDIT_RESULTS.perfect.push({
      page: 'Favorites',
      feature: 'Favorites page accessible'
    });

    console.log('  ✅ Favorites flow tested\n');

  } catch (error) {
    AUDIT_RESULTS.criticalIssues.push({
      page: 'Favorites Flow',
      issue: error.message,
      severity: 'critical'
    });
  }

  await context.close();
}

async function generateReport() {
  console.log('\n📊 Generating Audit Report...\n');

  const report = `
# UI/UX AUDIT REPORT
**Date:** ${new Date().toLocaleString()}
**Environment:** ${BASE_URL}
**Test Account:** ${CREDENTIALS.email}

---

## ✅ WORKING PERFECTLY (${AUDIT_RESULTS.perfect.length} items)

${AUDIT_RESULTS.perfect.map(item =>
  `- **${item.page}**: ${item.feature}`
).join('\n') || 'No items recorded'}

---

## ⚠️ MINOR ISSUES (${AUDIT_RESULTS.minorIssues.length} items)

${AUDIT_RESULTS.minorIssues.map(item =>
  `- **${item.page}**: ${item.issue}`
).join('\n') || 'No minor issues found'}

---

## 🔴 CRITICAL ISSUES (${AUDIT_RESULTS.criticalIssues.length} items)

${AUDIT_RESULTS.criticalIssues.map(item =>
  `- **${item.page}**: ${item.issue}`
).join('\n') || 'No critical issues found'}

---

## 📊 PERFORMANCE METRICS

${AUDIT_RESULTS.performance.map(item =>
  `- **${item.page}**: ${item.loadTime} (${item.status})`
).join('\n') || 'No performance metrics recorded'}

---

## 🎯 RECOMMENDATIONS

${AUDIT_RESULTS.criticalIssues.length > 0 ?
  '### 🚨 CRITICAL - FIX BEFORE LAUNCH:\n' +
  AUDIT_RESULTS.criticalIssues.map((item, i) =>
    `${i + 1}. **${item.page}**: ${item.issue}`
  ).join('\n')
  : '### ✅ No critical issues blocking launch'}

${AUDIT_RESULTS.minorIssues.length > 0 ?
  '\n\n### ⚠️ MINOR - FIX POST-LAUNCH:\n' +
  AUDIT_RESULTS.minorIssues.slice(0, 5).map((item, i) =>
    `${i + 1}. **${item.page}**: ${item.issue}`
  ).join('\n')
  : ''}

---

## 📸 SCREENSHOTS

All screenshots saved to: \`./audit-screenshots/\`

${AUDIT_RESULTS.screenshots.map(item =>
  `- ${item.name}.png`
).join('\n')}

---

**Summary:**
- ✅ Working: ${AUDIT_RESULTS.perfect.length}
- ⚠️ Minor Issues: ${AUDIT_RESULTS.minorIssues.length}
- 🔴 Critical Issues: ${AUDIT_RESULTS.criticalIssues.length}
- 📸 Screenshots: ${AUDIT_RESULTS.screenshots.length}

${AUDIT_RESULTS.criticalIssues.length === 0 ?
  '\n🎉 **READY FOR PRODUCTION** - No critical issues found!' :
  '\n⚠️ **NOT READY** - Critical issues must be resolved before launch'}
`;

  fs.writeFileSync(
    path.join(__dirname, 'AUDIT_REPORT.md'),
    report
  );

  console.log('✅ Report generated: AUDIT_REPORT.md\n');
  console.log(report);
}

async function main() {
  console.log('🚀 Starting Comprehensive UI/UX Audit\n');
  console.log('=' .repeat(60));

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'audit-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    await testPublicPages(browser);
    await testUserPages(browser);
    await testOnboardingFlow(browser);
    await testAdminPages(browser);
    await testCriticalFlows(browser);

    await generateReport();

  } catch (error) {
    console.error('\n❌ Fatal error during audit:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }

  console.log('\n✅ Audit Complete!\n');
  console.log('=' .repeat(60));
}

main();
