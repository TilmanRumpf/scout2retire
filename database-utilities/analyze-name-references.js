import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to search for
const patterns = {
  selectName: /select\(['"](.*?name.*?)['"]|select\(`(.*?name.*?)`/gi,
  dotName: /town\.name|t\.name|result\.name|item\.name/gi,
  objectName: /\{\s*name\s*[,}]/gi,
  sqlName: /'name'|"name"/gi
};

const results = {
  files: {},
  summary: {
    totalFiles: 0,
    totalMatches: 0,
    byPattern: {}
  }
};

function searchFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.relative(path.join(__dirname, '../src'), filePath);
  const matches = [];

  // Search for each pattern
  Object.entries(patterns).forEach(([patternName, regex]) => {
    let match;
    const localRegex = new RegExp(regex.source, regex.flags);

    while ((match = localRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1];

      matches.push({
        pattern: patternName,
        match: match[0],
        line: lineNumber,
        context: line.trim()
      });
    }
  });

  if (matches.length > 0) {
    results.files[fileName] = matches;
    results.summary.totalFiles++;
    results.summary.totalMatches += matches.length;

    matches.forEach(m => {
      results.summary.byPattern[m.pattern] = (results.summary.byPattern[m.pattern] || 0) + 1;
    });
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      searchFile(filePath);
    }
  });
}

console.log('🔍 Analyzing codebase for "name" references...\n');

// Search src directory
const srcDir = path.join(__dirname, '../src');
walkDir(srcDir);

console.log('📊 SUMMARY');
console.log('═'.repeat(80));
console.log(`Total Files with matches: ${results.summary.totalFiles}`);
console.log(`Total Matches: ${results.summary.totalMatches}`);
console.log('\nMatches by Pattern:');
Object.entries(results.summary.byPattern).forEach(([pattern, count]) => {
  console.log(`  ${pattern}: ${count}`);
});

console.log('\n📁 FILES WITH MATCHES');
console.log('═'.repeat(80));

// Group by likelihood of being town-related
const highPriority = [];
const mediumPriority = [];
const lowPriority = [];

Object.entries(results.files).forEach(([file, matches]) => {
  const isTownFile = file.includes('town') || file.includes('Town') ||
                     file.includes('scoring') || file.includes('Discover') ||
                     file.includes('Daily') || file.includes('Favorite');

  const hasSQLSelect = matches.some(m => m.pattern === 'selectName');

  if (hasSQLSelect && isTownFile) {
    highPriority.push({ file, matches });
  } else if (hasSQLSelect || isTownFile) {
    mediumPriority.push({ file, matches });
  } else {
    lowPriority.push({ file, matches });
  }
});

console.log('\n🔴 HIGH PRIORITY (SQL queries in town files):');
highPriority.forEach(({ file, matches }) => {
  console.log(`\n  📄 ${file} (${matches.length} matches)`);
  matches.forEach(m => {
    console.log(`    Line ${m.line}: ${m.context.substring(0, 100)}`);
  });
});

console.log('\n\n🟡 MEDIUM PRIORITY (SQL queries or town files):');
mediumPriority.forEach(({ file, matches }) => {
  console.log(`\n  📄 ${file} (${matches.length} matches)`);
  matches.slice(0, 3).forEach(m => {
    console.log(`    Line ${m.line}: ${m.context.substring(0, 80)}`);
  });
  if (matches.length > 3) {
    console.log(`    ... and ${matches.length - 3} more`);
  }
});

console.log('\n\n🟢 LOW PRIORITY (likely not town-related):');
console.log(`  ${lowPriority.length} files (user names, chat names, etc.)`);
lowPriority.slice(0, 5).forEach(({ file }) => {
  console.log(`    ${file}`);
});
if (lowPriority.length > 5) {
  console.log(`    ... and ${lowPriority.length - 5} more`);
}

// Save detailed results to file
const outputPath = path.join(__dirname, 'name-references-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\n\n✅ Detailed results saved to: ${outputPath}`);
