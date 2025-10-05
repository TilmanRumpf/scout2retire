// Load environment variables
import { config } from 'dotenv';
config();

// Import and run the test
import('./tests/scoring-snapshot.test.js');
