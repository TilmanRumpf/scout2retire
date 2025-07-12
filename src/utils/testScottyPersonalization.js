import { getUserContext, formatContextForPrompt } from './scottyContext';

/**
 * Test scenarios for Scotty personalization
 * Run these to verify personalization is working correctly
 */

// Mock user contexts for testing
const testUsers = {
  // US Retiree planning stage
  johnSmith: {
    personal: { name: 'John Smith', age_group: '60-65' },
    citizenship: { primary: 'us', has_dual: false, is_eu_citizen: false, is_us_citizen: true },
    family: { situation: 'single', has_pets: true },
    timeline: { status: 'planning', years_until: 3 },
    geography: { countries: ['Portugal', 'Spain', 'Italy'] },
    climate: { summer_temp: 'warm', winter_temp: 'mild' },
    budget: { total_monthly: 3000 },
    administration: { healthcare_concerns: ['prescription costs', 'specialist access'] },
    favorites: [
      { town_id: 1, town_name: 'Porto', country: 'Portugal' },
      { town_id: 2, town_name: 'Valencia', country: 'Spain' }
    ]
  },

  // EU Couple already retired
  mariaSchmidt: {
    personal: { name: 'Maria Schmidt', age_group: '65+' },
    citizenship: { primary: 'de', has_dual: false, is_eu_citizen: true, is_us_citizen: false },
    family: { 
      situation: 'couple', 
      has_pets: false,
      partner_citizenship: { primary: 'de' }
    },
    timeline: { status: 'already_retired', years_until: 0 },
    geography: { countries: ['Spain', 'Portugal', 'France'] },
    climate: { summer_temp: 'hot', winter_temp: 'warm' },
    budget: { total_monthly: 4500 },
    administration: { healthcare_concerns: [] },
    favorites: [
      { town_id: 3, town_name: 'Barcelona', country: 'Spain' },
      { town_id: 4, town_name: 'Nice', country: 'France' },
      { town_id: 5, town_name: 'Lisbon', country: 'Portugal' }
    ]
  },

  // Dual citizen with complex needs
  sophiaChen: {
    personal: { name: 'Sophia Chen', age_group: '55-60' },
    citizenship: { 
      primary: 'us', 
      secondary: 'it',
      has_dual: true, 
      is_eu_citizen: true, 
      is_us_citizen: true 
    },
    family: { 
      situation: 'couple', 
      has_pets: true,
      partner_citizenship: { primary: 'ca' }
    },
    timeline: { status: 'retiring_soon', years_until: 1 },
    geography: { countries: ['Italy', 'Portugal', 'Greece'] },
    climate: { summer_temp: 'hot', winter_temp: 'mild' },
    budget: { total_monthly: 6000 },
    administration: { 
      healthcare_concerns: ['chronic condition management'],
      visa_preference: 'permanent_residency'
    }
  },

  // Budget-conscious retiree
  robertJones: {
    personal: { name: 'Robert Jones', age_group: '65+' },
    citizenship: { primary: 'uk', has_dual: false, is_eu_citizen: false, is_us_citizen: false },
    family: { situation: 'single', has_pets: false },
    timeline: { status: 'already_retired', years_until: 0 },
    geography: { countries: ['Portugal', 'Spain', 'Bulgaria'] },
    climate: { summer_temp: 'warm', winter_temp: 'cool' },
    budget: { total_monthly: 1500 },
    administration: { healthcare_concerns: ['affordability'] }
  }
};

// Test questions to verify personalization
const testQuestions = [
  "What visa do I need for Portugal?",
  "How much money do I need to retire comfortably?",
  "What about healthcare coverage?",
  "Can I bring my pet?",
  "Which locations match my climate preferences?",
  "What are the tax implications?",
  "Is it easy to integrate without speaking the language?",
  "What's the process for my partner?"
];

/**
 * Run personalization tests
 */
export async function runPersonalizationTests() {
  console.log('🧪 Testing Scotty Personalization...\n');

  for (const [userName, userContext] of Object.entries(testUsers)) {
    console.log(`\n📋 Testing with user: ${userContext.personal.name}`);
    console.log('Context summary:', formatContextForPrompt(userContext));
    console.log('-'.repeat(50));

    // Test each question with this user's context
    testQuestions.forEach((question, index) => {
      console.log(`\nQ${index + 1}: ${question}`);
      console.log('Expected personalization points:');
      
      // Analyze what should be personalized
      if (question.includes('visa')) {
        console.log(`- Should reference ${userContext.citizenship.primary} citizenship`);
        if (userContext.citizenship.has_dual) {
          console.log(`- Should mention dual citizenship advantage`);
        }
      }
      
      if (question.includes('money') || question.includes('comfortably')) {
        console.log(`- Should reference $${userContext.budget.total_monthly} budget`);
        console.log(`- Should suggest appropriate locations for budget`);
      }
      
      if (question.includes('healthcare')) {
        if (userContext.administration.healthcare_concerns.length > 0) {
          console.log(`- Should address: ${userContext.administration.healthcare_concerns.join(', ')}`);
        }
        console.log(`- Should reference ${userContext.citizenship.primary} healthcare rights`);
      }
      
      if (question.includes('pet') && userContext.family.has_pets) {
        console.log(`- Should provide pet import requirements from ${userContext.citizenship.primary}`);
      }
      
      if (question.includes('partner') && userContext.family.situation === 'couple') {
        console.log(`- Should address partner's ${userContext.family.partner_citizenship.primary} citizenship`);
      }
    });
  }
}

/**
 * Verify context is being loaded correctly
 */
export async function verifyContextLoading(userId) {
  console.log('🔍 Verifying context loading for user:', userId);
  
  try {
    const context = await getUserContext(userId);
    
    if (!context) {
      console.error('❌ No context returned');
      return false;
    }
    
    console.log('✅ Context loaded successfully');
    console.log('📊 Context summary:');
    console.log(formatContextForPrompt(context));
    
    // Check for critical fields
    const criticalFields = [
      'personal.name',
      'citizenship.primary',
      'timeline.status',
      'budget.total_monthly'
    ];
    
    const missingFields = [];
    criticalFields.forEach(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], context);
      if (!value) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.warn('⚠️  Missing critical fields:', missingFields);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error loading context:', error);
    return false;
  }
}

// Export test data for use in development
export { testUsers, testQuestions };