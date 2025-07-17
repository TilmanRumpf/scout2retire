#!/usr/bin/env node
// Scout2Retire Style Verification Script
// Checks for style violations across the codebase

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Style violation patterns
const VIOLATIONS = [
  {
    pattern: /className=["']([^"']*\b(p|m|px|py|mx|my)-\d+\b[^"']*)/g,
    message: 'Hardcoded padding/margin found',
    suggestion: 'Use uiConfig.layout.spacing values'
  },
  {
    pattern: /className=["']([^"']*\bmax-w-(sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)\b[^"']*)/g,
    message: 'Inconsistent width class found',
    suggestion: 'Use uiConfig.layout.width values'
  },
  {
    pattern: /className=["']([^"']*\b(text|bg|border)-(gray|green|blue|red|yellow|scout-accent)-\d+\b[^"']*)/g,
    message: 'Hardcoded color found',
    suggestion: 'Use uiConfig.colors values'
  },
  {
    pattern: /style={{[^}]+}}/g,
    message: 'Inline style object found',
    suggestion: 'Move styles to uiConfig.ts or use Tailwind classes'
  },
  {
    pattern: /className=["']([^"']*\brounded-(sm|md|lg|xl|2xl|3xl|full)\b[^"']*)/g,
    message: 'Hardcoded border radius found',
    suggestion: 'Use uiConfig.layout.radius values'
  }
];

// Files to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'uiConfig.ts',
  'uiConfig.js',
  'tailwind.config.js',
  'vite.config.js'
];

// Scan directory recursively
function scanDirectory(dir) {
  const violations = [];
  
  function scan(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      // Skip ignored patterns
      if (IGNORE_PATTERNS.some(pattern => filePath.includes(pattern))) {
        return;
      }
      
      if (stat.isDirectory()) {
        scan(filePath);
      } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        checkFile(filePath, content, violations);
      }
    });
  }
  
  scan(dir);
  return violations;
}

// Check individual file for violations
function checkFile(filePath, content, violations) {
  VIOLATIONS.forEach(({ pattern, message, suggestion }) => {
    let match;
    const regex = new RegExp(pattern);
    
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      violations.push({
        file: path.relative(process.cwd(), filePath),
        line: lineNumber,
        column: match.index - content.lastIndexOf('\n', match.index - 1),
        match: match[0],
        message,
        suggestion
      });
    }
  });
}

// Format violation for display
function formatViolation(violation) {
  return `
  ${violation.file}:${violation.line}:${violation.column}
  ${violation.message}: ${violation.match}
  Suggestion: ${violation.suggestion}
  `;
}

// Main execution
function main() {
  console.log('Scout2Retire Style Verification\n');
  console.log('Scanning for style violations...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const violations = scanDirectory(srcDir);
  
  if (violations.length === 0) {
    console.log('✅ No style violations found!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${violations.length} style violations:\n`);
    
    // Group by file
    const byFile = violations.reduce((acc, v) => {
      if (!acc[v.file]) acc[v.file] = [];
      acc[v.file].push(v);
      return acc;
    }, {});
    
    // Display violations
    Object.entries(byFile).forEach(([file, fileViolations]) => {
      console.log(`\n📄 ${file} (${fileViolations.length} violations)`);
      fileViolations.forEach(v => console.log(formatViolation(v)));
    });
    
    console.log('\n❗ Please fix these violations before committing.');
    console.log('💡 Run "npm run fix:styles" to see detailed suggestions.\n');
    
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  main();
}

export { scanDirectory, checkFile };