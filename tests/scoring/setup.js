/**
 * Test setup - loads environment variables for Node.js testing
 *
 * This file is needed because the scoring code uses import.meta.env (Vite)
 * but tests run in plain Node.js which uses process.env
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

// Polyfill import.meta.env for Vite compatibility
// This allows code using import.meta.env to work in Node.js
globalThis.import = globalThis.import || {};
globalThis.import.meta = globalThis.import.meta || {};
globalThis.import.meta.env = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  // Add other env vars as needed
  MODE: 'test'
};

console.log('✅ Test environment configured');
