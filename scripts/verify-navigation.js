#!/usr/bin/env node
// Scout2Retire Navigation Verification Script
// Ensures all pages have proper navigation components

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pages that require navigation
const PAGES_REQUIRING_NAV = [
  'Daily',
  'Discover',
  'Compare',
  'Profile',
  'TownDetails',
  'Settings'
];

// Valid navigation components
const NAVIGATION_COMPONENTS = [
  'QuickNav',
  'HamburgerMenu',
  'AuthenticatedLayout',
  'AppLayout'
];

// Check if file is a page component
function isPageComponent(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  return PAGES_REQUIRING_NAV.some(page => 
    fileName.includes(page) || 
    filePath.includes(`pages/${page}`)
  );
}

// Check if file has navigation
function hasNavigation(content) {
  return NAVIGATION_COMPONENTS.some(nav => 
    content.includes(`<${nav}`) || 
    content.includes(`import ${nav}`) ||
    content.includes(`from.*${nav}`)
  );
}

// Check for duplicate navigation
function hasDuplicateNavigation(content) {
  const navMatches = NAVIGATION_COMPONENTS.map(nav => {
    const importMatch = new RegExp(`import.*${nav}`, 'g');
    const usageMatch = new RegExp(`<${nav}`, 'g');
    
    const imports = (content.match(importMatch) || []).length;
    const usages = (content.match(usageMatch) || []).length;
    
    return { component: nav, imports, usages };
  }).filter(m => m.imports > 0 || m.usages > 0);
  
  // Check if multiple navigation components are used
  const activeNavs = navMatches.filter(m => m.usages > 0);
  if (activeNavs.length > 1) {
    return {
      duplicate: true,
      components: activeNavs.map(m => m.component)
    };
  }
  
  // Check if same navigation is used multiple times
  const duplicateUsage = navMatches.find(m => m.usages > 1);
  if (duplicateUsage) {
    return {
      duplicate: true,
      components: [duplicateUsage.component],
      count: duplicateUsage.usages
    };
  }
  
  return { duplicate: false };
}

// Scan all page files
function scanPages() {
  const issues = [];
  const srcDir = path.join(__dirname, '..', 'src');
  
  function scan(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scan(filePath);
      } else if ((file.endsWith('.jsx') || file.endsWith('.tsx')) && isPageComponent(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for missing navigation
        if (!hasNavigation(content)) {
          issues.push({
            type: 'missing',
            file: path.relative(process.cwd(), filePath),
            message: 'Page is missing navigation component'
          });
        }
        
        // Check for duplicate navigation
        const dupCheck = hasDuplicateNavigation(content);
        if (dupCheck.duplicate) {
          issues.push({
            type: 'duplicate',
            file: path.relative(process.cwd(), filePath),
            message: `Duplicate navigation detected: ${dupCheck.components.join(', ')}`,
            details: dupCheck.count ? `Used ${dupCheck.count} times` : 'Multiple navigation components'
          });
        }
      }
    });
  }
  
  scan(srcDir);
  return issues;
}

// Check for navigation consistency
function checkNavigationConsistency() {
  const consistency = [];
  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  
  // Check if navigation components exist
  NAVIGATION_COMPONENTS.forEach(navComponent => {
    const componentPath = path.join(componentsDir, `${navComponent}.jsx`);
    const componentPathTsx = path.join(componentsDir, `${navComponent}.tsx`);
    
    if (!fs.existsSync(componentPath) && !fs.existsSync(componentPathTsx)) {
      consistency.push({
        type: 'missing-component',
        component: navComponent,
        message: `Navigation component ${navComponent} not found`
      });
    }
  });
  
  return consistency;
}

// Main execution
function main() {
  console.log('Scout2Retire Navigation Verification\n');
  console.log('Checking navigation components...\n');
  
  // Check for navigation issues
  const pageIssues = scanPages();
  const consistencyIssues = checkNavigationConsistency();
  
  const totalIssues = pageIssues.length + consistencyIssues.length;
  
  if (totalIssues === 0) {
    console.log('✅ All pages have proper navigation!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${totalIssues} navigation issues:\n`);
    
    // Display page issues
    if (pageIssues.length > 0) {
      console.log('Page Navigation Issues:');
      pageIssues.forEach(issue => {
        console.log(`\n  📄 ${issue.file}`);
        console.log(`     ❗ ${issue.message}`);
        if (issue.details) {
          console.log(`     📝 ${issue.details}`);
        }
      });
    }
    
    // Display consistency issues
    if (consistencyIssues.length > 0) {
      console.log('\nNavigation Component Issues:');
      consistencyIssues.forEach(issue => {
        console.log(`\n  🔧 ${issue.component}`);
        console.log(`     ❗ ${issue.message}`);
      });
    }
    
    console.log('\n💡 Tips:');
    console.log('   - Main app pages should use QuickNav or HamburgerMenu');
    console.log('   - Avoid wrapping pages in multiple layout components');
    console.log('   - Check AuthenticatedLayout usage to prevent duplicate navigation\n');
    
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  main();
}

export { scanPages, checkNavigationConsistency };