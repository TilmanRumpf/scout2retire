#!/usr/bin/env node

// Test case-insensitive hobby matching
import { calculateHobbiesScore } from '../src/utils/scoring/helpers/hobbiesMatching.js';

async function testCaseInsensitiveMatching() {
  console.log('🧪 TESTING CASE-INSENSITIVE HOBBY MATCHING');
  console.log('=' .repeat(80));
  console.log('');
  
  // Test cases with different capitalizations from UI
  const testCases = [
    {
      name: 'UI lowercase vs DB Title Case',
      userHobbies: {
        activities: [],
        interests: [],
        custom_activities: [
          'Mountain biking',  // UI format
          'Water aerobics',   // UI format
          'Cross-country skiing' // UI format
        ]
      },
      expectedToMatch: true
    },
    {
      name: 'Mixed case from quick selections',
      userHobbies: {
        activities: ['golf', 'tennis', 'swimming'], // lowercase from quick cards
        interests: ['cooking', 'wine'],  // lowercase from quick cards
        custom_activities: []
      },
      expectedToMatch: true
    },
    {
      name: 'ALL CAPS test',
      userHobbies: {
        activities: [],
        interests: [],
        custom_activities: ['YOGA', 'PILATES', 'ZUMBA']
      },
      expectedToMatch: true
    }
  ];
  
  // Mock town (Naples, FL - we know it has hobbies assigned)
  const mockTown = {
    id: 'e06a5b56-e6f6-4fb8-8f4c-db747b935198',
    name: 'Naples',
    state_code: 'FL'
  };
  
  console.log(`Testing with town: ${mockTown.name}, ${mockTown.state_code}`);
  console.log('');
  
  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`   Input hobbies:`);
    
    if (testCase.userHobbies.activities.length > 0) {
      console.log(`   - Activities: ${testCase.userHobbies.activities.join(', ')}`);
    }
    if (testCase.userHobbies.interests.length > 0) {
      console.log(`   - Interests: ${testCase.userHobbies.interests.join(', ')}`);
    }
    if (testCase.userHobbies.custom_activities.length > 0) {
      console.log(`   - Custom: ${testCase.userHobbies.custom_activities.join(', ')}`);
    }
    
    try {
      const result = await calculateHobbiesScore(testCase.userHobbies, mockTown);
      
      console.log(`   Result:`);
      console.log(`   - Score: ${result.score}`);
      console.log(`   - Matched: ${result.details.matched.length}/${result.details.totalUserHobbies}`);
      
      if (result.details.matched.length > 0) {
        console.log(`   - Matched hobbies: ${result.details.matched.join(', ')}`);
      }
      if (result.details.missing.length > 0) {
        console.log(`   - Missing hobbies: ${result.details.missing.join(', ')}`);
      }
      
      const matchFound = result.details.matched.length > 0;
      const testPassed = matchFound === testCase.expectedToMatch;
      
      if (testPassed) {
        console.log(`   ✅ Test PASSED`);
      } else {
        console.log(`   ❌ Test FAILED - Expected matches: ${testCase.expectedToMatch}, Got: ${matchFound}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('=' .repeat(80));
  console.log('🎯 SUMMARY:');
  console.log('Case-insensitive matching should now work regardless of capitalization.');
  console.log('UI can use any case, database can use any case - matching will work!');
}

// Run the test
testCaseInsensitiveMatching().catch(console.error);