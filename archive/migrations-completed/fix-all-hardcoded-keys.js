#!/usr/bin/env node

/**
 * Fix all hardcoded Supabase keys in the codebase
 * Replaces dead hardcoded keys with environment variable references
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The dead/exposed keys that need to be replaced
const OLD_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4';
const OLD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';

// Template for the new environment-based setup
const ENV_SETUP_CODE = `import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.error('Please ensure your .env file contains SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);`;

async function getAllFiles(dir, fileList = []) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      // Skip directories we don't want to modify
      if (file.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next', 'database-snapshots'].includes(file.name)) {
          await getAllFiles(filePath, fileList);
        }
      } else if (file.name.endsWith('.js') || file.name.endsWith('.mjs') || file.name.endsWith('.cjs')) {
        fileList.push(filePath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return fileList;
}

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Check if file contains the old keys
    if (content.includes(OLD_SERVICE_KEY) || content.includes(OLD_ANON_KEY)) {
      
      // Check if this is a database utility file that needs the service key
      if (filePath.includes('database-utilities') || filePath.includes('scripts') || filePath.includes('archive')) {
        
        // Check if dotenv is already imported
        if (!content.includes('dotenv')) {
          // Find the right place to insert the setup code
          const createClientIndex = content.indexOf('createClient(');
          if (createClientIndex !== -1) {
            // Find the createClient call and replace the entire setup
            const beforeCreate = content.substring(0, createClientIndex);
            const afterCreate = content.substring(createClientIndex);
            
            // Find where the supabase variable is defined
            const supabaseVarMatch = beforeCreate.match(/(?:const|let|var)\s+supabase\s*=\s*createClient\([^)]+\);?/);
            if (supabaseVarMatch) {
              // Replace the old setup with new env-based setup
              const importStatements = content.match(/^import .* from .*;$/gm) || [];
              const lastImportIndex = importStatements.length > 0 
                ? content.lastIndexOf(importStatements[importStatements.length - 1]) + importStatements[importStatements.length - 1].length
                : 0;
              
              // Build new content
              let newContent = content.substring(0, lastImportIndex);
              
              // Add dotenv import if not present
              if (!content.includes("import dotenv")) {
                newContent += '\nimport dotenv from \'dotenv\';';
              }
              
              // Skip the old createClient setup
              const oldSetupMatch = content.match(/(?:const|let|var)\s+supabase\s*=\s*createClient\([^)]+\);?/);
              if (oldSetupMatch) {
                const setupStart = content.indexOf(oldSetupMatch[0]);
                const setupEnd = setupStart + oldSetupMatch[0].length;
                
                // Add the new setup
                newContent += '\ndotenv.config();\n\n';
                newContent += 'const supabase = createClient(\n';
                newContent += '  process.env.VITE_SUPABASE_URL || \'https://axlruvvsjepsulcbqlho.supabase.co\',\n';
                newContent += '  process.env.SUPABASE_SERVICE_ROLE_KEY\n';
                newContent += ');\n';
                
                // Add error check
                newContent += '\nif (!process.env.SUPABASE_SERVICE_ROLE_KEY) {\n';
                newContent += '  console.error(\'❌ SUPABASE_SERVICE_ROLE_KEY not found in .env file\');\n';
                newContent += '  process.exit(1);\n';
                newContent += '}\n';
                
                // Add the rest of the file after the old setup
                newContent += content.substring(setupEnd);
                
                content = newContent;
                modified = true;
              }
            }
          }
        }
        
        // Replace any remaining hardcoded keys
        content = content.replace(new RegExp(OLD_SERVICE_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
                                  'process.env.SUPABASE_SERVICE_ROLE_KEY');
        content = content.replace(new RegExp(OLD_ANON_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
                                  'process.env.VITE_SUPABASE_ANON_KEY');
        modified = true;
      }
      
      // For CLAUDE.md and other markdown files, replace with placeholder
      if (filePath.endsWith('.md')) {
        content = content.replace(new RegExp(OLD_SERVICE_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
                                  '[SERVICE_ROLE_KEY_FROM_ENV]');
        content = content.replace(new RegExp(OLD_ANON_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
                                  '[ANON_KEY_FROM_ENV]');
        modified = true;
      }
      
      if (modified) {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath.replace(path.join(__dirname, '..'), '.')}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing hardcoded Supabase keys in all files...\n');
  console.log('This will:');
  console.log('1. Add dotenv imports where needed');
  console.log('2. Replace hardcoded keys with environment variables');
  console.log('3. Add error checking for missing env vars\n');
  
  const projectRoot = path.join(__dirname, '..');
  const files = await getAllFiles(projectRoot);
  
  console.log(`Found ${files.length} JavaScript files to check...\n`);
  
  let fixedCount = 0;
  for (const file of files) {
    // Skip this script itself
    if (file.includes('fix-all-hardcoded-keys.js')) continue;
    
    if (await fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Fixed ${fixedCount} files`);
  
  if (fixedCount > 0) {
    console.log('\n📝 IMPORTANT NEXT STEPS:');
    console.log('1. Install dotenv if not already installed:');
    console.log('   npm install dotenv');
    console.log('\n2. Make sure your .env file contains:');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_new_service_key');
    console.log('   VITE_SUPABASE_ANON_KEY=your_new_anon_key');
    console.log('\n3. Test a few database utility scripts to ensure they work');
  }
}

main().catch(console.error);