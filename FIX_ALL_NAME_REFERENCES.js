#!/usr/bin/env node

/**
 * MASS FIX SCRIPT FOR COLUMN NAME DISASTER
 *
 * This script will fix ALL 267 files that still use 'name' instead of 'town_name'
 *
 * WARNING: This will modify hundreds of files!
 * Make sure to commit current changes before running.
 *
 * Usage: node FIX_ALL_NAME_REFERENCES.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDryRun = process.argv.includes('--dry-run');

console.log(`\n🔧 ${isDryRun ? 'DRY RUN - ' : ''}MASS FIX FOR COLUMN NAME REFERENCES\n`);

// Patterns to fix
const REPLACEMENTS = [
  // Direct property access
  { pattern: /\btown\.name\b/g, replacement: 'town.town_name' },
  { pattern: /\bt\.name\b(?!_)/g, replacement: 't.town_name' }, // Negative lookahead to not match t.name_something
  { pattern: /\btowns\[([^\]]+)\]\.name\b/g, replacement: 'towns[$1].town_name' },

  // Select statements - be careful not to replace hobbies.name
  { pattern: /\.select\((['"])([^'"]*,\s*)?name(\s*,[^'"]*)?(['"])\)/g,
    replacement: (match, q1, before, after, q2) => {
      // Only replace if it looks like a towns table query
      if (match.includes('hobbies') || match.includes('users')) {
        return match; // Don't replace
      }
      return `.select(${q1}${before || ''}town_name${after || ''}${q2})`;
    }
  },

  // Order statements
  { pattern: /\.order\(['"]name['"]\)/g, replacement: '.order(\'town_name\')' },

  // ilike statements
  { pattern: /\.ilike\(['"]name['"],/g, replacement: '.ilike(\'town_name\',' },

  // Destructuring - only for townData or town objects
  { pattern: /const\s+\{\s*([^}]*)\bname\b([^}]*)\}\s*=\s*(town|townData)/g,
    replacement: 'const { $1town_name$2 } = $3' },

  // Map/filter operations
  { pattern: /\.map\(([a-z]+)\s*=>\s*\1\.name\)/g, replacement: '.map($1 => $1.town_name)' },
  { pattern: /\.filter\(([a-z]+)\s*=>\s*\1\.name/g, replacement: '.filter($1 => $1.town_name' },
];

// Directories to process
const DIRECTORIES_TO_FIX = [
  'database-utilities',
  'scripts',
  'towns-updater',
  'tests',
  // Optionally include archive if you want to fix everything
  // 'archive',
];

// Files to skip (known to use 'name' correctly for other tables)
const SKIP_FILES = [
  'compoundButtonMappings.js',
  'LegacyFieldsSection.jsx',
  'HobbiesDisplay.jsx',
];

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

function shouldSkipFile(filePath) {
  return SKIP_FILES.some(skipFile => filePath.includes(skipFile));
}

function processFile(filePath) {
  if (shouldSkipFile(filePath)) {
    console.log(`⏭️  Skipping known exception: ${path.basename(filePath)}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let fileReplacements = 0;

  for (const { pattern, replacement } of REPLACEMENTS) {
    const before = modified;
    if (typeof replacement === 'function') {
      modified = modified.replace(pattern, replacement);
    } else {
      modified = modified.replace(pattern, replacement);
    }

    if (before !== modified) {
      const matches = before.match(pattern);
      fileReplacements += matches ? matches.length : 0;
    }
  }

  if (fileReplacements > 0) {
    console.log(`📝 ${path.relative(__dirname, filePath)}: ${fileReplacements} replacements`);

    if (!isDryRun) {
      fs.writeFileSync(filePath, modified, 'utf8');
    }

    modifiedFiles++;
    totalReplacements += fileReplacements;
  }

  totalFiles++;
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (item === 'node_modules' || item === '.git') continue;
      processDirectory(itemPath);
    } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
      processFile(itemPath);
    }
  }
}

// Main execution
console.log('Processing directories:', DIRECTORIES_TO_FIX.join(', '));
console.log('');

for (const dir of DIRECTORIES_TO_FIX) {
  const fullPath = path.join(__dirname, dir);
  console.log(`\n📁 Processing ${dir}/...`);
  processDirectory(fullPath);
}

console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY:');
console.log(`   Files scanned: ${totalFiles}`);
console.log(`   Files modified: ${modifiedFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);

if (isDryRun) {
  console.log('\n⚠️  DRY RUN - No files were actually modified');
  console.log('   Run without --dry-run to apply changes');
} else {
  console.log('\n✅ All files have been updated!');
  console.log('   Remember to test the changes and commit them');
}

console.log('='.repeat(60) + '\n');