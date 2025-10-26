#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SAFE anon key (this is public and OK to expose)
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDc5NTMsImV4cCI6MjA3MjY4Mzk1M30.-VRSBZu7cElt4LXPVT_tm3ilsuj_UojDOvOP_UVCVHs';

// DANGEROUS service role key to remove
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNzk1MywiZXhwIjoyMDcyNjgzOTUzfQ.Oy-MblIo6xNvNI6KJwsjrU9uO17rWko_p08fZHY1uyE';

// Files that have the service role key
const filesToFix = [
  'archive/database-test-scripts-2025-10-01/test-tiered-scoring-fixed.js',
  'archive/database-test-scripts-2025-10-01/test-tiered-scoring.js',
  'archive/debug-oct-2025/add_nova_scotia_towns.js',
  'archive/debug-oct-2025/check-cost-coverage.js',
  'archive/debug-scripts-2025-10-01/temp-coffee-update.js',
  'archive/migrations-completed/fix-all-hardcoded-keys.js',
  'archive/migrations-completed/get-towns-schema.js',
  'archive/test-scripts-2025-10-01/analyze-baiona-match.mjs',
  'archive/test-scripts-2025-10-01/check-geographic-data.mjs',
  'archive/test-scripts-2025-10-01/test-live-scoring.mjs',
  // Add any other files found
];

console.log('🔒 SECURITY FIX: Removing exposed service role keys from committed files\n');

let filesFixed = 0;
let filesNotFound = 0;

for (const file of filesToFix) {
  const filePath = path.join(__dirname, file);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if file contains the service role key
    if (content.includes(SERVICE_ROLE_KEY)) {
      // Replace service role key with anon key
      content = content.replace(new RegExp(SERVICE_ROLE_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ANON_KEY);

      // Also add a comment warning
      if (content.includes("const supabase") || content.includes("createClient")) {
        content = `// SECURITY WARNING: Service role key was exposed and has been replaced with anon key\n// NEVER commit service role keys to git!\n${content}`;
      }

      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      filesFixed++;
    } else {
      console.log(`⚠️  No service key found in: ${file}`);
    }
  } else {
    console.log(`❌ File not found: ${file}`);
    filesNotFound++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files fixed: ${filesFixed}`);
console.log(`   Files not found: ${filesNotFound}`);

console.log('\n🚨 CRITICAL NEXT STEPS:');
console.log('1. Go to Supabase Dashboard immediately');
console.log('2. Navigate to Settings → API');
console.log('3. Click "Roll service_role key" to generate a new one');
console.log('4. Update .env file with the new service role key');
console.log('5. Update any production deployments with the new key');
console.log('6. Run: git add -A && git commit -m "SECURITY: Remove exposed service role keys"');
console.log('7. Run: git push origin main');
console.log('\n⚠️  The exposed key can still be accessed in git history!');
console.log('   Consider using git filter-branch or BFG Repo-Cleaner to remove from history');