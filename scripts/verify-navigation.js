#!/usr/bin/env node
/**
 * Scout2Retire Navigation Verification Script
 *
 * PURPOSE:
 * Ensures all main app pages have proper navigation components to prevent
 * users from getting stuck without a way to navigate the application.
 *
 * WHAT IT CHECKS:
 * 1. All pages in src/pages/ have one of the valid navigation components
 * 2. Pages don't use multiple conflicting navigation components
 * 3. All expected navigation components exist in src/components/
 *
 * EXCLUDED FROM CHECKS:
 * - Auth pages (Login, Signup, Welcome, ResetPassword)
 * - Onboarding pages (have their own OnboardingLayout)
 * - Test/mockup pages (HeaderMockup.jsx)
 * - Helper components in src/components/ (not actual pages)
 *
 * VALID NAVIGATION PATTERNS:
 * - UnifiedHeader (preferred - used by 9 pages, includes QuickNav)
 * - QuickNav (direct usage - 2 pages)
 * - AuthenticatedLayout (layout wrapper with navigation)
 *
 * USAGE:
 * - Run directly: node scripts/verify-navigation.js
 * - In CI: Called by .github/workflows/quality-checks.yml (non-blocking)
 * - Exit code 0 = success, 1 = issues found
 *
 * LAST UPDATED: 2025-10-17
 * AUTHOR: Claude Code with Tilman Rumpf
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Valid navigation components that provide app navigation
 * These must exist in src/components/ and provide hamburger menu or equivalent
 */
const NAVIGATION_COMPONENTS = [
  'QuickNav',           // Hamburger menu with full app navigation
  'UnifiedHeader',      // Primary header component - includes QuickNav
  'AuthenticatedLayout' // Layout wrapper that provides navigation
];

/**
 * Pages that should be excluded from navigation checks
 * Add pages here that intentionally don't have app navigation
 */
const EXCLUDED_PAGES = [
  'Login.jsx',          // Auth flow - redirects after login
  'Signup',             // Auth flow - includes SignupEnhanced.jsx
  'Welcome.jsx',        // Landing page - has its own navigation
  'ResetPassword.jsx',  // Password reset flow
  'HeaderMockup.jsx',   // Test/development mockup page
  'onboarding/',        // Onboarding has OnboardingLayout (special flow)
];

/**
 * Maximum allowed uses of same navigation component
 * 2 = allows loading state + main state (conditional rendering)
 * 3+ = likely an error (too many instances)
 */
const MAX_NAV_USES = 2;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a file is a page component that requires navigation
 * @param {string} filePath - Full path to the file
 * @returns {boolean} - True if page needs navigation
 */
function isPageComponent(filePath) {
  // Only check files in src/pages/ folder (not components)
  const isInPagesFolder = filePath.includes('src/pages/') || filePath.includes('src\\pages\\');
  if (!isInPagesFolder) {
    return false;
  }

  // Exclude specific pages that don't need app navigation
  const isExcluded = EXCLUDED_PAGES.some(excluded => filePath.includes(excluded));
  if (isExcluded) {
    return false;
  }

  return true;
}

/**
 * Check if a page has at least one valid navigation component
 * @param {string} content - File content
 * @returns {boolean} - True if navigation found
 */
function hasNavigation(content) {
  return NAVIGATION_COMPONENTS.some(nav => {
    const hasImport = content.includes(`import ${nav}`) ||
                      content.includes(`import { ${nav}`) ||
                      content.match(new RegExp(`from ['"].*${nav}['"]`));
    const hasUsage = content.includes(`<${nav}`);

    return hasImport || hasUsage;
  });
}

/**
 * Check for problematic duplicate navigation
 * Allows conditional rendering (2 uses) but flags excessive duplication
 * @param {string} content - File content
 * @returns {Object} - { duplicate: boolean, components: string[], count?: number }
 */
function hasDuplicateNavigation(content) {
  const navMatches = NAVIGATION_COMPONENTS.map(nav => {
    const importMatch = new RegExp(`import.*${nav}`, 'g');
    const usageMatch = new RegExp(`<${nav}`, 'g');

    const imports = (content.match(importMatch) || []).length;
    const usages = (content.match(usageMatch) || []).length;

    return { component: nav, imports, usages };
  }).filter(m => m.imports > 0 || m.usages > 0);

  // PROBLEM 1: Multiple DIFFERENT navigation components (conflicting nav)
  const activeNavs = navMatches.filter(m => m.usages > 0);
  if (activeNavs.length > 1) {
    return {
      duplicate: true,
      type: 'multiple-components',
      components: activeNavs.map(m => m.component),
      suggestion: 'Choose one navigation pattern per page. UnifiedHeader is preferred.'
    };
  }

  // PROBLEM 2: Same component used too many times (likely an error)
  // 2 uses = OK (loading state + main render)
  // 3+ uses = Problem (too many instances)
  const excessiveUsage = navMatches.find(m => m.usages > MAX_NAV_USES);
  if (excessiveUsage) {
    return {
      duplicate: true,
      type: 'excessive-usage',
      components: [excessiveUsage.component],
      count: excessiveUsage.usages,
      suggestion: `${excessiveUsage.component} appears ${excessiveUsage.usages} times. Check for accidental duplication.`
    };
  }

  return { duplicate: false };
}

// ============================================================================
// SCANNING FUNCTIONS
// ============================================================================

/**
 * Scan all page files for navigation issues
 * @returns {Array} - Array of issue objects
 */
function scanPages() {
  const issues = [];
  const stats = {
    totalPages: 0,
    pagesWithNav: 0,
    excludedPages: 0
  };

  const srcDir = path.join(__dirname, '..', 'src');

  function scan(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Recursively scan directories (skip node_modules)
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scan(filePath);
        return;
      }

      // Only check .jsx and .tsx files
      if (!(file.endsWith('.jsx') || file.endsWith('.tsx'))) {
        return;
      }

      // Check if this is a page that needs navigation
      if (!isPageComponent(filePath)) {
        if (filePath.includes('src/pages/')) {
          stats.excludedPages++;
        }
        return;
      }

      stats.totalPages++;
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);

      // CHECK 1: Missing navigation
      if (!hasNavigation(content)) {
        issues.push({
          type: 'missing',
          file: relativePath,
          severity: 'error',
          message: 'Page is missing navigation component',
          fix: 'Add <UnifiedHeader /> at the top of the page',
          example: 'import UnifiedHeader from \'../components/UnifiedHeader\';\n<UnifiedHeader title="Page Title" />'
        });
      } else {
        stats.pagesWithNav++;

        // CHECK 2: Duplicate/conflicting navigation
        const dupCheck = hasDuplicateNavigation(content);
        if (dupCheck.duplicate) {
          issues.push({
            type: 'duplicate',
            file: relativePath,
            severity: dupCheck.type === 'multiple-components' ? 'error' : 'warning',
            message: `${dupCheck.type === 'multiple-components' ? 'Multiple navigation components' : 'Excessive navigation usage'}: ${dupCheck.components.join(', ')}`,
            details: dupCheck.count ? `Used ${dupCheck.count} times` : `Components: ${dupCheck.components.join(', ')}`,
            fix: dupCheck.suggestion
          });
        }
      }
    });
  }

  scan(srcDir);

  return { issues, stats };
}

/**
 * Check that all expected navigation components exist
 * @returns {Array} - Array of missing component issues
 */
function checkNavigationConsistency() {
  const consistency = [];
  const componentsDir = path.join(__dirname, '..', 'src', 'components');

  NAVIGATION_COMPONENTS.forEach(navComponent => {
    const componentPath = path.join(componentsDir, `${navComponent}.jsx`);
    const componentPathTsx = path.join(componentsDir, `${navComponent}.tsx`);

    if (!fs.existsSync(componentPath) && !fs.existsSync(componentPathTsx)) {
      consistency.push({
        type: 'missing-component',
        component: navComponent,
        severity: 'error',
        message: `Navigation component ${navComponent} not found in src/components/`,
        fix: `Create ${navComponent}.jsx or remove from NAVIGATION_COMPONENTS list in this script`
      });
    }
  });

  return consistency;
}

// ============================================================================
// OUTPUT FORMATTING
// ============================================================================

/**
 * Display a formatted issue with helpful information
 */
function displayIssue(issue, index) {
  const icon = issue.severity === 'error' ? '❌' : '⚠️';
  const prefix = issue.file ? `📄 ${issue.file}` : `🔧 ${issue.component}`;

  console.log(`\n${index}. ${icon} ${prefix}`);
  console.log(`   ${issue.message}`);

  if (issue.details) {
    console.log(`   📝 ${issue.details}`);
  }

  if (issue.fix) {
    console.log(`   💡 Fix: ${issue.fix}`);
  }

  if (issue.example) {
    console.log(`   📋 Example:\n      ${issue.example.split('\n').join('\n      ')}`);
  }
}

/**
 * Display summary statistics
 */
function displayStats(stats) {
  console.log('\n📊 Statistics:');
  console.log(`   Total pages checked: ${stats.totalPages}`);
  console.log(`   Pages with navigation: ${stats.pagesWithNav}`);
  console.log(`   Excluded pages: ${stats.excludedPages}`);

  if (stats.totalPages > 0) {
    const coverage = Math.round((stats.pagesWithNav / stats.totalPages) * 100);
    console.log(`   Coverage: ${coverage}%`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Scout2Retire Navigation Verification');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Run checks
  const { issues: pageIssues, stats } = scanPages();
  const consistencyIssues = checkNavigationConsistency();

  const allIssues = [...pageIssues, ...consistencyIssues];
  const errorCount = allIssues.filter(i => i.severity === 'error').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;

  // Display results
  if (allIssues.length === 0) {
    console.log('✅ All pages have proper navigation!\n');
    displayStats(stats);
    console.log('\n🎉 Navigation check passed!\n');
    process.exit(0);
  }

  // Display issues
  console.log(`Found ${errorCount} error(s) and ${warningCount} warning(s):\n`);

  allIssues.forEach((issue, index) => displayIssue(issue, index + 1));

  // Display statistics
  displayStats(stats);

  // Display helpful tips
  console.log('\n💡 Navigation Best Practices:');
  console.log('   • Use UnifiedHeader for most pages (includes QuickNav)');
  console.log('   • UnifiedHeader provides logo, title, and hamburger menu');
  console.log('   • Auth/onboarding pages can skip app navigation');
  console.log('   • Avoid mixing multiple navigation components');
  console.log('   • 2 uses of same nav is OK (loading + main render)');

  console.log('\n📚 Valid Navigation Components:');
  NAVIGATION_COMPONENTS.forEach(comp => {
    console.log(`   • ${comp}`);
  });

  console.log('\n🚫 Excluded from checks:');
  EXCLUDED_PAGES.forEach(page => {
    console.log(`   • ${page}`);
  });

  console.log('\n');

  // Exit with error if any errors found (warnings OK)
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run if called directly
if (process.argv[1] === __filename) {
  main();
}

// Export for testing
export {
  scanPages,
  checkNavigationConsistency,
  isPageComponent,
  hasNavigation,
  hasDuplicateNavigation
};
